import {
  DAY,
  HOUR,
  MINUTE,
  type RateLimitConfig,
} from "@convex-dev/rate-limiter"

import {
  DEVELOPER_API_LIMITS,
  DEVELOPER_API_LOG_RETENTION_DAYS,
  type DeveloperApiEndpoint,
  type DeveloperApiLimitDefinition,
  type DeveloperApiLimitKey,
  type DeveloperApiLimitValues,
} from "./catalog"

/**
 * Where a limit's value comes from, most general first:
 *
 * 1. The platform. `DEVELOPER_API_DEFAULT_<LIMIT>` sets what an organization
 *    gets before it changes anything, `DEVELOPER_API_MAX_<LIMIT>` the most it
 *    may ask for. Both fall back to the catalog.
 * 2. The organization, from the Developer API page. Shared by every key: this
 *    is the bucket that protects the organization's AI bill as a whole.
 * 3. The key, optionally. A key's own value can only be tighter than its
 *    organization's, and is counted in a bucket of its own, so one noisy
 *    integration cannot starve the others.
 */

type PartialLimits = Partial<Record<DeveloperApiLimitKey, number>>

const toEnvName = (key: DeveloperApiLimitKey) =>
  key.replace(/([A-Z])/g, "_$1").toUpperCase()

const readEnvNumber = (name: string) => {
  const raw = process.env[name]?.trim()

  if (!raw) {
    return undefined
  }

  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Math.floor(value), min), max)

export type PlatformLimit = {
  default: number
  max: number
}

export const getPlatformLimit = (
  definition: DeveloperApiLimitDefinition
): PlatformLimit => {
  const envName = toEnvName(definition.key)
  const max = Math.max(
    definition.min,
    readEnvNumber(`DEVELOPER_API_MAX_${envName}`) ?? definition.max
  )
  const fallback = readEnvNumber(`DEVELOPER_API_DEFAULT_${envName}`)

  return {
    max,
    default: clamp(fallback ?? definition.default, definition.min, max),
  }
}

export const getPlatformLimits = () =>
  Object.fromEntries(
    DEVELOPER_API_LIMITS.map((definition) => [
      definition.key,
      getPlatformLimit(definition),
    ])
  ) as Record<DeveloperApiLimitKey, PlatformLimit>

export const isDeveloperApiPlatformEnabled = () =>
  process.env.DEVELOPER_API_ENABLED?.trim().toLowerCase() !== "false"

export const developerApiRequiresSubscription = () =>
  process.env.DEVELOPER_API_REQUIRE_SUBSCRIPTION?.trim().toLowerCase() ===
  "true"

export const getMaxKeysPerOrganization = () =>
  readEnvNumber("DEVELOPER_API_MAX_KEYS_PER_ORGANIZATION") ?? 25

/** The organization's values: what it chose, else the platform default. */
export const resolveOrganizationLimits = (
  organizationLimits: PartialLimits | undefined
): DeveloperApiLimitValues => {
  const platform = getPlatformLimits()

  return Object.fromEntries(
    DEVELOPER_API_LIMITS.map((definition) => {
      const { default: fallback, max } = platform[definition.key]
      const chosen = organizationLimits?.[definition.key]

      return [definition.key, clamp(chosen ?? fallback, definition.min, max)]
    })
  ) as DeveloperApiLimitValues
}

/** A key's own values, each no looser than the organization's. */
export const resolveKeyLimits = (
  keyLimits: PartialLimits | undefined,
  organization: DeveloperApiLimitValues
): PartialLimits => {
  const resolved: PartialLimits = {}

  for (const definition of DEVELOPER_API_LIMITS) {
    const value = keyLimits?.[definition.key]

    if (typeof value === "number") {
      resolved[definition.key] = clamp(
        value,
        definition.min,
        organization[definition.key]
      )
    }
  }

  return resolved
}

/** What a request is actually held to: the key's value where it has one. */
export const resolveEffectiveLimits = (
  organization: DeveloperApiLimitValues,
  key: PartialLimits
): DeveloperApiLimitValues =>
  Object.fromEntries(
    DEVELOPER_API_LIMITS.map((definition) => [
      definition.key,
      key[definition.key] ?? organization[definition.key],
    ])
  ) as DeveloperApiLimitValues

/**
 * Checks an organization's or key's requested values against the platform, so
 * the dashboard can refuse an out-of-range number instead of silently storing
 * one that will be clamped later.
 */
export const validateLimitOverrides = (
  limits: Record<string, unknown>,
  ceiling?: DeveloperApiLimitValues
): PartialLimits => {
  const platform = getPlatformLimits()
  const validated: PartialLimits = {}

  for (const [key, value] of Object.entries(limits)) {
    const definition = DEVELOPER_API_LIMITS.find((limit) => limit.key === key)

    if (!definition) {
      throw new Error(`Unknown limit "${key}"`)
    }

    if (value === null || value === undefined) {
      continue
    }

    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new Error(`${definition.label} must be a whole number`)
    }

    const max = ceiling
      ? Math.min(ceiling[definition.key], platform[definition.key].max)
      : platform[definition.key].max

    if (value < definition.min || value > max) {
      throw new Error(
        `${definition.label} must be between ${definition.min} and ${max}`
      )
    }

    validated[definition.key] = value
  }

  return validated
}

export const clampLogRetentionDays = (value: number | undefined) =>
  clamp(
    value ?? DEVELOPER_API_LOG_RETENTION_DAYS.default,
    DEVELOPER_API_LOG_RETENTION_DAYS.min,
    DEVELOPER_API_LOG_RETENTION_DAYS.max
  )

/* ── rate buckets ────────────────────────────────────────────────────────── */

type RateLimitKey = Extract<
  DeveloperApiLimitKey,
  | "requestsPerMinute"
  | "requestsPerDay"
  | "writesPerMinute"
  | "aiRequestsPerMinute"
  | "aiRequestsPerDay"
  | "knowledgeImportsPerHour"
>

export type RateBucket = {
  limit: RateLimitKey
  /** The rate limiter's name. Inline configs mean these are never declared. */
  name: string
  key: string
  config: RateLimitConfig
  scope: "organization" | "key"
}

const PERIODS: Record<
  RateLimitKey,
  { period: number; window: "rolling" | "calendar" }
> = {
  requestsPerMinute: { period: MINUTE, window: "rolling" },
  requestsPerDay: { period: DAY, window: "calendar" },
  writesPerMinute: { period: MINUTE, window: "rolling" },
  aiRequestsPerMinute: { period: MINUTE, window: "rolling" },
  aiRequestsPerDay: { period: DAY, window: "calendar" },
  knowledgeImportsPerHour: { period: HOUR, window: "rolling" },
}

const bucketConfig = (limit: RateLimitKey, rate: number): RateLimitConfig => {
  const { period, window } = PERIODS[limit]

  // A day is a UTC calendar day, so "per day" matches the usage numbers on the
  // dashboard. Shorter limits refill continuously and allow a full period's
  // worth at once, which is what a client batching work at the top of a minute
  // expects.
  if (window === "calendar") {
    return { kind: "fixed window", rate, period, start: 0 }
  }

  return {
    kind: "token bucket",
    rate,
    period,
    capacity: rate,
    // Sharding spreads contention on hot organizations; below this rate it
    // would only make the limit less exact.
    ...(rate >= 1200 ? { shards: Math.min(8, Math.floor(rate / 600)) } : {}),
  }
}

export const limitsForEndpoint = (
  endpoint: Pick<DeveloperApiEndpoint, "write" | "ai" | "knowledgeImport">
): RateLimitKey[] => [
  "requestsPerMinute",
  "requestsPerDay",
  ...(endpoint.write ? (["writesPerMinute"] as const) : []),
  ...(endpoint.ai
    ? (["aiRequestsPerMinute", "aiRequestsPerDay"] as const)
    : []),
  ...(endpoint.knowledgeImport ? (["knowledgeImportsPerHour"] as const) : []),
]

export const buildRateBuckets = ({
  organizationId,
  keyId,
  limits,
  organization,
  key,
}: {
  organizationId: string
  keyId: string
  limits: RateLimitKey[]
  organization: DeveloperApiLimitValues
  key: PartialLimits
}): RateBucket[] => {
  const buckets: RateBucket[] = []

  for (const limit of limits) {
    buckets.push({
      limit,
      name: `developerApi:${limit}:organization`,
      key: organizationId,
      config: bucketConfig(limit, organization[limit]),
      scope: "organization",
    })

    const keyValue = key[limit]

    if (typeof keyValue === "number") {
      buckets.push({
        limit,
        name: `developerApi:${limit}:key`,
        key: keyId,
        config: bucketConfig(limit, keyValue),
        scope: "key",
      })
    }
  }

  return buckets
}
