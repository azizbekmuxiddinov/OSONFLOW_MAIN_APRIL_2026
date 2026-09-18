import { ConvexError, v } from "convex/values"

import type { Doc, Id } from "../_generated/dataModel"
import { action, internalMutation, mutation, query } from "../_generated/server"
import { internal } from "../_generated/api"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"
import { getDeploymentSiteUrl } from "../lib/webhookBaseUrl"
import {
  DEVELOPER_API_LOG_RETENTION_DAYS,
  DEVELOPER_API_VERSION,
  isDeveloperApiScope,
} from "../lib/developerApi/catalog"
import {
  clampLogRetentionDays,
  developerApiRequiresSubscription,
  getMaxKeysPerOrganization,
  getPlatformLimits,
  isDeveloperApiPlatformEnabled,
  resolveOrganizationLimits,
  validateLimitOverrides,
} from "../lib/developerApi/limits"
import {
  generateApiKey,
  hashApiKey,
  normalizeIpRule,
  normalizeOriginRule,
} from "../lib/developerApi/keys"
import {
  getDeveloperApiSettings,
  sumUsage,
  utcDay,
} from "../system/developerApi/gate"

const DAY_MS = 24 * 60 * 60 * 1000
const USAGE_CHART_DAYS = 30
const KEY_NAME_MAX_LENGTH = 60
const MAX_ALLOWLIST_ENTRIES = 50
const MAX_EXPIRY_DAYS = 3650

const limitsValidator = v.object({
  requestsPerMinute: v.optional(v.union(v.number(), v.null())),
  requestsPerDay: v.optional(v.union(v.number(), v.null())),
  writesPerMinute: v.optional(v.union(v.number(), v.null())),
  aiRequestsPerMinute: v.optional(v.union(v.number(), v.null())),
  aiRequestsPerDay: v.optional(v.union(v.number(), v.null())),
  knowledgeImportsPerHour: v.optional(v.union(v.number(), v.null())),
  maxPageSize: v.optional(v.union(v.number(), v.null())),
  maxMessageChars: v.optional(v.union(v.number(), v.null())),
  maxBodyKb: v.optional(v.union(v.number(), v.null())),
})

const invalidInput = (message: string) =>
  new ConvexError({ code: "INVALID_INPUT", message })

const guard = <T>(run: () => T): T => {
  try {
    return run()
  } catch (error) {
    if (error instanceof ConvexError) {
      throw error
    }

    throw invalidInput(error instanceof Error ? error.message : String(error))
  }
}

const normalizeKeyName = (name: string) => {
  const trimmed = name.trim()

  if (!trimmed) {
    throw invalidInput("Give the key a name so you can tell it apart later.")
  }

  if (trimmed.length > KEY_NAME_MAX_LENGTH) {
    throw invalidInput(
      `Key names can be up to ${KEY_NAME_MAX_LENGTH} characters.`
    )
  }

  return trimmed
}

const normalizeScopes = (scopes: string[]) => {
  const unique = [...new Set(scopes)]

  if (unique.length === 0) {
    throw invalidInput("Choose at least one thing this key may do.")
  }

  for (const scope of unique) {
    if (!isDeveloperApiScope(scope)) {
      throw invalidInput(`Unknown permission "${scope}".`)
    }
  }

  return unique
}

const normalizeAllowlist = (
  values: string[] | undefined,
  normalize: (value: string) => string | null,
  what: string
) => {
  if (values === undefined) {
    return undefined
  }

  const cleaned = values.map((value) => value.trim()).filter(Boolean)

  if (cleaned.length > MAX_ALLOWLIST_ENTRIES) {
    throw invalidInput(`A key can list up to ${MAX_ALLOWLIST_ENTRIES} ${what}.`)
  }

  return [
    ...new Set(
      cleaned.map((value) => {
        const normalized = normalize(value)

        if (!normalized) {
          throw invalidInput(
            `"${value}" is not a valid ${what.replace(/es$|s$/, "")}.`
          )
        }

        return normalized
      })
    ),
  ]
}

/** Drops cleared (`null`) limits; only numbers are stored. */
const storedLimits = (limits: Record<string, number | null | undefined>) =>
  Object.fromEntries(
    Object.entries(limits).filter(
      (entry): entry is [string, number] => typeof entry[1] === "number"
    )
  )

const toKeySummary = (key: Doc<"developerApiKeys">, now: number) => ({
  id: key._id,
  name: key.name,
  prefix: key.prefix,
  lastFour: key.lastFour,
  scopes: key.scopes,
  limits: key.limits ?? {},
  allowedIps: key.allowedIps ?? [],
  allowedOrigins: key.allowedOrigins ?? [],
  createdAt: key.createdAt,
  lastUsedAt: key.lastUsedAt ?? null,
  expiresAt: key.expiresAt ?? null,
  revokedAt: key.revokedAt ?? null,
  status: key.revokedAt
    ? ("revoked" as const)
    : key.expiresAt && key.expiresAt <= now
      ? ("expired" as const)
      : ("active" as const),
})

const requireOwnedKey = async (
  ctx: { db: any },
  keyId: Id<"developerApiKeys">,
  organizationId: string
): Promise<Doc<"developerApiKeys">> => {
  const key = await ctx.db.get(keyId)

  if (!key || key.organizationId !== organizationId) {
    throw new ConvexError({ code: "NOT_FOUND", message: "API key not found." })
  }

  return key
}

/* ── overview ────────────────────────────────────────────────────────────── */

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const now = Date.now()
    const [settings, keys] = await Promise.all([
      getDeveloperApiSettings(ctx, orgId),
      ctx.db
        .query("developerApiKeys")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .collect(),
    ])
    const siteUrl = getDeploymentSiteUrl()

    return {
      enabled: settings?.enabled ?? true,
      platformEnabled: isDeveloperApiPlatformEnabled(),
      requiresSubscription: developerApiRequiresSubscription(),
      baseUrl: siteUrl ? `${siteUrl}/${DEVELOPER_API_VERSION}` : null,
      /** What the organization chose; absent limits use the platform default. */
      limits: settings?.limits ?? {},
      effectiveLimits: resolveOrganizationLimits(settings?.limits),
      platformLimits: getPlatformLimits(),
      logRetentionDays: clampLogRetentionDays(settings?.logRetentionDays),
      maxKeys: getMaxKeysPerOrganization(),
      keys: keys
        .sort((left, right) => right.createdAt - left.createdAt)
        .map((key) => toKeySummary(key, now)),
    }
  },
})

export const updateSettings = mutation({
  args: {
    enabled: v.optional(v.boolean()),
    /** A number sets a limit; `null` returns it to the platform default. */
    limits: v.optional(limitsValidator),
    logRetentionDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)
    const existing = await getDeveloperApiSettings(ctx, orgId)
    const merged = {
      ...(existing?.limits ?? {}),
      ...(args.limits ?? {}),
    } as Record<string, number | null | undefined>
    const limits = storedLimits(
      guard(() => validateLimitOverrides(merged)) as Record<string, number>
    )

    if (
      args.logRetentionDays !== undefined &&
      (!Number.isInteger(args.logRetentionDays) ||
        args.logRetentionDays < DEVELOPER_API_LOG_RETENTION_DAYS.min ||
        args.logRetentionDays > DEVELOPER_API_LOG_RETENTION_DAYS.max)
    ) {
      throw invalidInput(
        `Keep logs for ${DEVELOPER_API_LOG_RETENTION_DAYS.min} to ${DEVELOPER_API_LOG_RETENTION_DAYS.max} days.`
      )
    }

    const patch = {
      enabled: args.enabled ?? existing?.enabled ?? true,
      limits,
      logRetentionDays: args.logRetentionDays ?? existing?.logRetentionDays,
      updatedAt: Date.now(),
      updatedBy: identity.subject,
    }

    if (existing) {
      await ctx.db.patch(existing._id, patch)
    } else {
      await ctx.db.insert("developerApiSettings", {
        organizationId: orgId,
        ...patch,
      })
    }
  },
})

/* ── keys ────────────────────────────────────────────────────────────────── */

const keyOptionsValidator = {
  scopes: v.array(v.string()),
  limits: v.optional(limitsValidator),
  allowedIps: v.optional(v.array(v.string())),
  allowedOrigins: v.optional(v.array(v.string())),
}

/**
 * Stores a new key. Only reachable from `createKey` and `rollKey`, which
 * generate the secret where real randomness is available.
 */
export const insertKey = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    name: v.string(),
    keyHash: v.string(),
    prefix: v.string(),
    lastFour: v.string(),
    expiresInDays: v.optional(v.number()),
    /** The key this one replaces, which is revoked in the same transaction. */
    replacesKeyId: v.optional(v.id("developerApiKeys")),
    ...keyOptionsValidator,
  },
  handler: async (ctx, args): Promise<Id<"developerApiKeys">> => {
    const existingKeys = await ctx.db
      .query("developerApiKeys")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect()
    const activeKeys = existingKeys.filter((key) => !key.revokedAt)
    const maxKeys = getMaxKeysPerOrganization()

    if (!args.replacesKeyId && activeKeys.length >= maxKeys) {
      throw new ConvexError({
        code: "LIMIT_REACHED",
        message: `You can have up to ${maxKeys} active keys. Revoke one you no longer use first.`,
      })
    }

    if (
      args.expiresInDays !== undefined &&
      (!Number.isInteger(args.expiresInDays) ||
        args.expiresInDays < 1 ||
        args.expiresInDays > MAX_EXPIRY_DAYS)
    ) {
      throw invalidInput(`Keys can expire after 1 to ${MAX_EXPIRY_DAYS} days.`)
    }

    const settings = await getDeveloperApiSettings(ctx, args.organizationId)
    const organizationLimits = resolveOrganizationLimits(settings?.limits)
    const limits = storedLimits(
      guard(() =>
        validateLimitOverrides(args.limits ?? {}, organizationLimits)
      ) as Record<string, number>
    )
    const now = Date.now()

    if (args.replacesKeyId) {
      const replaced = await requireOwnedKey(
        ctx,
        args.replacesKeyId,
        args.organizationId
      )
      await ctx.db.patch(replaced._id, { revokedAt: now, updatedAt: now })
    }

    return await ctx.db.insert("developerApiKeys", {
      organizationId: args.organizationId,
      name: normalizeKeyName(args.name),
      keyHash: args.keyHash,
      prefix: args.prefix,
      lastFour: args.lastFour,
      scopes: normalizeScopes(args.scopes),
      limits: Object.keys(limits).length ? limits : undefined,
      allowedIps: normalizeAllowlist(
        args.allowedIps,
        normalizeIpRule,
        "IP addresses"
      ),
      allowedOrigins: normalizeAllowlist(
        args.allowedOrigins,
        normalizeOriginRule,
        "websites"
      ),
      expiresAt: args.expiresInDays
        ? now + args.expiresInDays * DAY_MS
        : undefined,
      createdBy: args.actorId,
      createdAt: now,
      updatedAt: now,
    })
  },
})

/** Creates a key. The full key is returned once and never stored. */
export const createKey = action({
  args: {
    name: v.string(),
    expiresInDays: v.optional(v.number()),
    ...keyOptionsValidator,
  },
  handler: async (
    ctx,
    args
  ): Promise<{ id: Id<"developerApiKeys">; key: string }> => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)
    const generated = generateApiKey()
    const id: Id<"developerApiKeys"> = await ctx.runMutation(
      internal.private.developerApi.insertKey,
      {
        organizationId: orgId,
        actorId: identity.subject,
        name: args.name,
        keyHash: await hashApiKey(generated.key),
        prefix: generated.prefix,
        lastFour: generated.lastFour,
        expiresInDays: args.expiresInDays,
        scopes: args.scopes,
        limits: args.limits,
        allowedIps: args.allowedIps,
        allowedOrigins: args.allowedOrigins,
      }
    )

    return { id, key: generated.key }
  },
})

export const getKeyForRoll = internalMutation({
  args: { organizationId: v.string(), keyId: v.id("developerApiKeys") },
  handler: async (ctx, args) => {
    const key = await requireOwnedKey(ctx, args.keyId, args.organizationId)

    if (key.revokedAt) {
      throw invalidInput(
        "This key is already revoked. Create a new one instead."
      )
    }

    return key
  },
})

/**
 * Replaces a key's secret: a new key with the same name, permissions and
 * limits, while the old one stops working immediately.
 */
export const rollKey = action({
  args: { keyId: v.id("developerApiKeys") },
  handler: async (
    ctx,
    args
  ): Promise<{ id: Id<"developerApiKeys">; key: string }> => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)
    const existing: Doc<"developerApiKeys"> = await ctx.runMutation(
      internal.private.developerApi.getKeyForRoll,
      { organizationId: orgId, keyId: args.keyId }
    )
    const generated = generateApiKey()
    const remainingDays = existing.expiresAt
      ? Math.max(1, Math.ceil((existing.expiresAt - Date.now()) / DAY_MS))
      : undefined
    const id: Id<"developerApiKeys"> = await ctx.runMutation(
      internal.private.developerApi.insertKey,
      {
        organizationId: orgId,
        actorId: identity.subject,
        name: existing.name,
        keyHash: await hashApiKey(generated.key),
        prefix: generated.prefix,
        lastFour: generated.lastFour,
        expiresInDays: remainingDays,
        scopes: existing.scopes,
        limits: existing.limits,
        allowedIps: existing.allowedIps,
        allowedOrigins: existing.allowedOrigins,
        replacesKeyId: existing._id,
      }
    )

    return { id, key: generated.key }
  },
})

export const updateKey = mutation({
  args: {
    keyId: v.id("developerApiKeys"),
    name: v.optional(v.string()),
    scopes: v.optional(v.array(v.string())),
    limits: v.optional(limitsValidator),
    allowedIps: v.optional(v.array(v.string())),
    allowedOrigins: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const key = await requireOwnedKey(ctx, args.keyId, orgId)

    if (key.revokedAt) {
      throw invalidInput("Revoked keys cannot be changed.")
    }

    const patch: Partial<Doc<"developerApiKeys">> = { updatedAt: Date.now() }

    if (args.name !== undefined) {
      patch.name = normalizeKeyName(args.name)
    }

    if (args.scopes !== undefined) {
      patch.scopes = normalizeScopes(args.scopes)
    }

    if (args.limits !== undefined) {
      const settings = await getDeveloperApiSettings(ctx, orgId)
      const merged = { ...(key.limits ?? {}), ...args.limits }
      const limits = storedLimits(
        guard(() =>
          validateLimitOverrides(
            merged,
            resolveOrganizationLimits(settings?.limits)
          )
        ) as Record<string, number>
      )
      patch.limits = Object.keys(limits).length ? limits : undefined
    }

    if (args.allowedIps !== undefined) {
      patch.allowedIps = normalizeAllowlist(
        args.allowedIps,
        normalizeIpRule,
        "IP addresses"
      )
    }

    if (args.allowedOrigins !== undefined) {
      patch.allowedOrigins = normalizeAllowlist(
        args.allowedOrigins,
        normalizeOriginRule,
        "websites"
      )
    }

    await ctx.db.patch(key._id, patch)
  },
})

export const revokeKey = mutation({
  args: { keyId: v.id("developerApiKeys") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const key = await requireOwnedKey(ctx, args.keyId, orgId)

    if (!key.revokedAt) {
      const now = Date.now()
      await ctx.db.patch(key._id, { revokedAt: now, updatedAt: now })
    }
  },
})

/** Removes a revoked key from the list. Its request history stays. */
export const deleteKey = mutation({
  args: { keyId: v.id("developerApiKeys") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const key = await requireOwnedKey(ctx, args.keyId, orgId)

    if (!key.revokedAt) {
      throw invalidInput("Revoke the key before removing it.")
    }

    await ctx.db.delete(key._id)
  },
})

/* ── usage ───────────────────────────────────────────────────────────────── */

export const getUsage = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const now = Date.now()
    const days = Array.from({ length: USAGE_CHART_DAYS }, (_, index) =>
      utcDay(now - (USAGE_CHART_DAYS - 1 - index) * DAY_MS)
    )
    const rows = (
      await Promise.all(
        days.map((day) =>
          ctx.db
            .query("developerApiUsage")
            .withIndex("by_organization_id_and_day", (q) =>
              q.eq("organizationId", orgId).eq("day", day)
            )
            .collect()
        )
      )
    ).flat()
    const byKey = new Map<string, Doc<"developerApiUsage">[]>()

    for (const row of rows) {
      const existing = byKey.get(row.keyId) ?? []
      existing.push(row)
      byKey.set(row.keyId, existing)
    }

    const today = days[days.length - 1]!

    return {
      days: days.map((day) => ({
        day,
        ...sumUsage(rows.filter((row) => row.day === day)),
      })),
      today: sumUsage(rows.filter((row) => row.day === today)),
      window: sumUsage(rows),
      byKey: [...byKey.entries()].map(([keyId, keyRows]) => ({
        keyId,
        today: sumUsage(keyRows.filter((row) => row.day === today)),
        window: sumUsage(keyRows),
      })),
    }
  },
})

export const listRequests = query({
  args: {
    keyId: v.optional(v.id("developerApiKeys")),
    onlyErrors: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const keyId = args.keyId
    const rows = keyId
      ? await ctx.db
          .query("developerApiRequests")
          .withIndex("by_key_id_and_created_at", (q) => q.eq("keyId", keyId))
          .order("desc")
          .take(200)
      : await ctx.db
          .query("developerApiRequests")
          .withIndex("by_organization_id_and_created_at", (q) =>
            q.eq("organizationId", orgId)
          )
          .order("desc")
          .take(200)

    return rows
      .filter((row) => row.organizationId === orgId)
      .filter((row) => !args.onlyErrors || row.status >= 400)
      .slice(0, 100)
      .map((row) => ({
        id: row._id,
        requestId: row.requestId,
        keyId: row.keyId,
        method: row.method,
        route: row.route,
        path: row.path,
        status: row.status,
        errorCode: row.errorCode ?? null,
        durationMs: row.durationMs,
        createdAt: row.createdAt,
      }))
  },
})
