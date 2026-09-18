import { v } from "convex/values"

import type { Doc, Id } from "../../_generated/dataModel"
import {
  internalMutation,
  type MutationCtx,
  type QueryCtx,
} from "../../_generated/server"
import { internal } from "../../_generated/api"
import { rateLimiter } from "../../lib/rateLimits"
import {
  DEVELOPER_API_ENDPOINTS,
  getDeveloperApiLimitDefinition,
  type DeveloperApiLimitValues,
} from "../../lib/developerApi/catalog"
import {
  buildRateBuckets,
  clampLogRetentionDays,
  developerApiRequiresSubscription,
  isDeveloperApiPlatformEnabled,
  limitsForEndpoint,
  resolveEffectiveLimits,
  resolveKeyLimits,
  resolveOrganizationLimits,
} from "../../lib/developerApi/limits"
import { ipMatchesRule } from "../../lib/developerApi/keys"

const DAY_MS = 24 * 60 * 60 * 1000
/** Rows each key's daily counters are spread over. */
const USAGE_SHARDS = 4
/** How long daily counters are kept for the usage chart. */
const USAGE_RETENTION_DAYS = 90
const PURGE_BATCH_SIZE = 500
/** `lastUsedAt` is only rewritten this often, to keep the key row quiet. */
const LAST_USED_WRITE_INTERVAL_MS = 60_000

export const utcDay = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(0, 10)

export const getDeveloperApiSettings = async (
  ctx: QueryCtx | MutationCtx,
  organizationId: string
): Promise<Doc<"developerApiSettings"> | null> =>
  await ctx.db
    .query("developerApiSettings")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId)
    )
    .unique()

const hasActiveSubscription = async (
  ctx: MutationCtx,
  organizationId: string
) => {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId)
    )
    .unique()

  return subscription?.status === "active"
}

type Denied = {
  ok: false
  status: number
  code: string
  message: string
  retryAfterMs?: number
  /** Set once the key is known, so the refusal can be logged against it. */
  organizationId?: string
  keyId?: Id<"developerApiKeys">
  logRetentionDays?: number
}

export type GateResult =
  | Denied
  | {
      ok: true
      organizationId: string
      keyId: Id<"developerApiKeys">
      keyName: string
      keyPrefix: string
      scopes: string[]
      keyExpiresAt: number | null
      keyCreatedAt: number
      /** What this call is held to: the key's own value where it has one. */
      limits: DeveloperApiLimitValues
      organizationLimits: DeveloperApiLimitValues
      /** Only the limits the key tightens for itself. */
      keyLimits: Partial<DeveloperApiLimitValues>
      logRetentionDays: number
      rateLimit: { limit: number; remaining: number }
    }

const deny = (
  status: number,
  code: string,
  message: string,
  extra: Partial<Denied> = {}
): Denied => ({ ok: false, status, code, message, ...extra })

const describeBucket = (
  limit: keyof DeveloperApiLimitValues,
  value: number,
  scope: "organization" | "key"
) => {
  const definition = getDeveloperApiLimitDefinition(limit)
  const owner = scope === "key" ? "this key's" : "your organization's"

  return `You reached ${owner} limit of ${value.toLocaleString("en-US")} ${definition.label.toLowerCase()}.`
}

/**
 * Admits or refuses one API call.
 *
 * Everything is decided in one transaction: every limit is checked before any
 * is spent, so a call refused by the daily limit does not also eat into the
 * per-minute one, and two concurrent calls cannot both squeeze under a limit
 * that has room for only one.
 */
export const admit = internalMutation({
  args: {
    keyHash: v.string(),
    endpointId: v.string(),
    ip: v.optional(v.string()),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GateResult> => {
    const endpoint = DEVELOPER_API_ENDPOINTS.find(
      (candidate) => candidate.id === args.endpointId
    )

    if (!endpoint) {
      return deny(404, "not_found", "This endpoint does not exist.")
    }

    const key = await ctx.db
      .query("developerApiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", args.keyHash))
      .unique()
    const now = Date.now()

    if (!key || key.revokedAt || (key.expiresAt && key.expiresAt <= now)) {
      // One answer for all three, so a caller cannot probe which keys existed.
      return deny(
        401,
        "invalid_api_key",
        "This API key is not valid. It may have been revoked or have expired."
      )
    }

    const known = {
      organizationId: key.organizationId,
      keyId: key._id,
    }
    const settings = await getDeveloperApiSettings(ctx, key.organizationId)
    const logRetentionDays = clampLogRetentionDays(settings?.logRetentionDays)
    const refuse = (
      status: number,
      code: string,
      message: string,
      extra: Partial<Denied> = {}
    ) => deny(status, code, message, { ...known, logRetentionDays, ...extra })

    if (!isDeveloperApiPlatformEnabled()) {
      return refuse(
        403,
        "api_disabled",
        "The developer API is currently unavailable."
      )
    }

    if (settings && !settings.enabled) {
      return refuse(
        403,
        "api_disabled",
        "API access is switched off for this organization. Turn it on from the Developer API page."
      )
    }

    if (
      developerApiRequiresSubscription() &&
      !(await hasActiveSubscription(ctx, key.organizationId))
    ) {
      return refuse(
        403,
        "plan_limit_reached",
        "The developer API is part of paid plans. Upgrade to use it."
      )
    }

    if (endpoint.scope && !key.scopes.includes(endpoint.scope)) {
      return refuse(
        403,
        "insufficient_scope",
        `This key does not have the "${endpoint.scope}" permission. Add it on the Developer API page.`
      )
    }

    if (key.allowedIps?.length) {
      const ip = args.ip

      if (!ip || !key.allowedIps.some((rule) => ipMatchesRule(ip, rule))) {
        return refuse(
          403,
          "ip_not_allowed",
          ip
            ? `This key does not accept calls from ${ip}.`
            : "This key only accepts calls from listed IP addresses, and the caller's address could not be determined."
        )
      }
    }

    // A browser always sends Origin; a server usually does not. A key that
    // lists no websites is therefore server-only, which stops a key pasted
    // into a public web page from working for whoever copies it.
    if (args.origin && !key.allowedOrigins?.includes(args.origin)) {
      return refuse(
        403,
        "origin_not_allowed",
        key.allowedOrigins?.length
          ? `This key does not accept calls from ${args.origin}.`
          : "This key only works from a server. To call it from a browser, list the website on the key."
      )
    }

    const organizationLimits = resolveOrganizationLimits(settings?.limits)
    const keyLimits = resolveKeyLimits(key.limits, organizationLimits)
    const limits = resolveEffectiveLimits(organizationLimits, keyLimits)
    const buckets = buildRateBuckets({
      organizationId: key.organizationId,
      keyId: key._id,
      limits: limitsForEndpoint(endpoint),
      organization: organizationLimits,
      key: keyLimits,
    })

    for (const bucket of buckets) {
      const status = await rateLimiter.check(ctx, bucket.name, {
        key: bucket.key,
        config: bucket.config,
      })

      if (!status.ok) {
        return refuse(
          429,
          "rate_limited",
          describeBucket(bucket.limit, bucket.config.rate, bucket.scope),
          { retryAfterMs: status.retryAfter }
        )
      }
    }

    for (const bucket of buckets) {
      await rateLimiter.limit(ctx, bucket.name, {
        key: bucket.key,
        config: bucket.config,
      })
    }

    let remaining = Number.POSITIVE_INFINITY

    for (const bucket of buckets) {
      if (bucket.limit !== "requestsPerMinute") {
        continue
      }

      const value = await rateLimiter.getValue(ctx, bucket.name, {
        key: bucket.key,
        config: bucket.config,
      })
      remaining = Math.min(remaining, Math.max(0, Math.floor(value.value)))
    }

    if (!key.lastUsedAt || now - key.lastUsedAt > LAST_USED_WRITE_INTERVAL_MS) {
      await ctx.db.patch(key._id, { lastUsedAt: now })
    }

    return {
      ok: true,
      organizationId: key.organizationId,
      keyId: key._id,
      keyName: key.name,
      keyPrefix: key.prefix,
      scopes: key.scopes,
      keyExpiresAt: key.expiresAt ?? null,
      keyCreatedAt: key.createdAt,
      limits,
      organizationLimits,
      keyLimits,
      logRetentionDays,
      rateLimit: {
        limit: limits.requestsPerMinute,
        remaining: Number.isFinite(remaining)
          ? remaining
          : limits.requestsPerMinute,
      },
    }
  },
})

/** Logs one call and adds it to the key's daily counters. */
export const record = internalMutation({
  args: {
    organizationId: v.string(),
    keyId: v.id("developerApiKeys"),
    requestId: v.string(),
    method: v.string(),
    route: v.string(),
    path: v.string(),
    status: v.number(),
    errorCode: v.optional(v.string()),
    durationMs: v.number(),
    ip: v.optional(v.string()),
    ai: v.boolean(),
    logRetentionDays: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const { ai, logRetentionDays, ...request } = args

    await ctx.db.insert("developerApiRequests", {
      ...request,
      createdAt: now,
      expiresAt: now + clampLogRetentionDays(logRetentionDays) * DAY_MS,
    })

    const day = utcDay(now)
    const shard = Math.floor(Math.random() * USAGE_SHARDS)
    const isError = args.status >= 400
    const counted = {
      requests: 1,
      errors: isError ? 1 : 0,
      // A refused call never reached the model, so it did not cost anything.
      aiRequests: ai && !isError ? 1 : 0,
      rateLimited: args.status === 429 ? 1 : 0,
    }
    const existing = await ctx.db
      .query("developerApiUsage")
      .withIndex("by_key_id_and_day_and_shard", (q) =>
        q.eq("keyId", args.keyId).eq("day", day).eq("shard", shard)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        requests: existing.requests + counted.requests,
        errors: existing.errors + counted.errors,
        aiRequests: existing.aiRequests + counted.aiRequests,
        rateLimited: existing.rateLimited + counted.rateLimited,
      })
      return
    }

    await ctx.db.insert("developerApiUsage", {
      organizationId: args.organizationId,
      keyId: args.keyId,
      day,
      shard,
      ...counted,
    })
  },
})

/** Deletes request logs past their retention and counters past 90 days. */
export const purgeExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const expiredRequests = await ctx.db
      .query("developerApiRequests")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .take(PURGE_BATCH_SIZE)

    const oldestKeptDay = utcDay(now - USAGE_RETENTION_DAYS * DAY_MS)
    const expiredUsage = await ctx.db
      .query("developerApiUsage")
      .withIndex("by_day", (q) => q.lt("day", oldestKeptDay))
      .take(PURGE_BATCH_SIZE)

    await Promise.all([
      ...expiredRequests.map((row) => ctx.db.delete(row._id)),
      ...expiredUsage.map((row) => ctx.db.delete(row._id)),
    ])

    if (
      expiredRequests.length === PURGE_BATCH_SIZE ||
      expiredUsage.length === PURGE_BATCH_SIZE
    ) {
      await ctx.scheduler.runAfter(
        0,
        internal.system.developerApi.gate.purgeExpired,
        {}
      )
    }
  },
})

/** Adds up a set of usage rows, for a key or an organization. */
export const sumUsage = (rows: Doc<"developerApiUsage">[]) =>
  rows.reduce(
    (total, row) => ({
      requests: total.requests + row.requests,
      errors: total.errors + row.errors,
      aiRequests: total.aiRequests + row.aiRequests,
      rateLimited: total.rateLimited + row.rateLimited,
    }),
    { requests: 0, errors: 0, aiRequests: 0, rateLimited: 0 }
  )
