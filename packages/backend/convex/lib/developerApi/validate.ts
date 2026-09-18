/**
 * Reading and checking what a developer sent. Every problem is reported as a
 * 400 naming the field, so a caller can fix a request from the error alone
 * instead of guessing at a generic failure.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryAfterMs?: number
  ) {
    super(message)
  }
}

export const invalid = (message: string) =>
  new ApiError(400, "invalid_request", message)

export type JsonObject = Record<string, unknown>

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export const describeType = (value: unknown) =>
  value === null ? "null" : Array.isArray(value) ? "array" : typeof value

/* ── body fields ─────────────────────────────────────────────────────────── */

type StringOptions = { max?: number; allowEmpty?: boolean }

export function readString(
  body: JsonObject,
  name: string,
  options: StringOptions & { required: true }
): string
export function readString(
  body: JsonObject,
  name: string,
  options?: StringOptions & { required?: false }
): string | undefined
export function readString(
  body: JsonObject,
  name: string,
  {
    required = false,
    max,
    allowEmpty = false,
  }: StringOptions & { required?: boolean } = {}
) {
  const value = body[name]

  if (value === undefined) {
    if (required) {
      throw invalid(`${name} is required.`)
    }

    return undefined
  }

  if (typeof value !== "string") {
    throw invalid(`${name} must be a string, not ${describeType(value)}.`)
  }

  if (!allowEmpty && !value.trim()) {
    throw invalid(`${name} cannot be empty.`)
  }

  if (max !== undefined && value.length > max) {
    throw invalid(
      `${name} must be ${max.toLocaleString("en-US")} characters or fewer.`
    )
  }

  return value
}

/** A string that may also be `null`, meaning "clear it". */
export const readNullableString = (
  body: JsonObject,
  name: string,
  options: StringOptions = {}
): string | null | undefined =>
  body[name] === null ? null : readString(body, name, options)

export const readBoolean = (body: JsonObject, name: string) => {
  const value = body[name]

  if (value === undefined) {
    return undefined
  }

  if (typeof value !== "boolean") {
    throw invalid(`${name} must be true or false, not ${describeType(value)}.`)
  }

  return value
}

export const readInteger = (
  body: JsonObject,
  name: string,
  {
    min,
    max,
    required = false,
  }: { min: number; max: number; required?: boolean }
) => {
  const value = body[name]

  if (value === undefined) {
    if (required) {
      throw invalid(`${name} is required.`)
    }

    return undefined
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw invalid(`${name} must be a whole number.`)
  }

  if (value < min || value > max) {
    throw invalid(`${name} must be between ${min} and ${max}.`)
  }

  return value
}

export const readEnum = <T extends string>(
  body: JsonObject,
  name: string,
  allowed: readonly T[],
  { required = false }: { required?: boolean } = {}
): T | undefined => {
  const value = body[name]

  if (value === undefined) {
    if (required) {
      throw invalid(`${name} is required.`)
    }

    return undefined
  }

  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw invalid(`${name} must be one of: ${allowed.join(", ")}.`)
  }

  return value as T
}

export const readStringArray = (
  body: JsonObject,
  name: string,
  {
    maxItems,
    maxLength = 500,
    required = false,
  }: {
    maxItems: number
    maxLength?: number
    required?: boolean
  }
) => {
  const value = body[name]

  if (value === undefined) {
    if (required) {
      throw invalid(`${name} is required.`)
    }

    return undefined
  }

  if (!Array.isArray(value)) {
    throw invalid(`${name} must be an array of strings.`)
  }

  if (value.length > maxItems) {
    throw invalid(`${name} can hold at most ${maxItems} items.`)
  }

  return value.map((item, index) => {
    if (typeof item !== "string") {
      throw invalid(`${name}[${index}] must be a string.`)
    }

    if (item.length > maxLength) {
      throw invalid(
        `${name}[${index}] must be ${maxLength} characters or fewer.`
      )
    }

    return item
  })
}

export const readObject = (body: JsonObject, name: string) => {
  const value = body[name]

  if (value === undefined) {
    return undefined
  }

  if (!isObject(value)) {
    throw invalid(`${name} must be an object, not ${describeType(value)}.`)
  }

  return value
}

/** Rejects fields the endpoint does not know, which are almost always typos. */
export const assertKnownFields = (
  body: JsonObject,
  known: readonly string[],
  where = "the request body"
) => {
  const unknown = Object.keys(body).filter((key) => !known.includes(key))

  if (unknown.length > 0) {
    throw invalid(
      `Unknown field${unknown.length === 1 ? "" : "s"} in ${where}: ${unknown.join(", ")}.`
    )
  }
}

/* ── query string ────────────────────────────────────────────────────────── */

export const queryString = (query: URLSearchParams, name: string) => {
  const value = query.get(name)?.trim()
  return value ? value : undefined
}

export const queryEnum = <T extends string>(
  query: URLSearchParams,
  name: string,
  allowed: readonly T[]
): T | undefined => {
  const value = queryString(query, name)

  if (value === undefined) {
    return undefined
  }

  if (!allowed.includes(value as T)) {
    throw invalid(`${name} must be one of: ${allowed.join(", ")}.`)
  }

  return value as T
}

export const queryBoolean = (query: URLSearchParams, name: string) => {
  const value = queryString(query, name)

  if (value === undefined) {
    return undefined
  }

  if (value === "true" || value === "1") return true
  if (value === "false" || value === "0") return false

  throw invalid(`${name} must be true or false.`)
}

export const queryInteger = (
  query: URLSearchParams,
  name: string,
  { min, max, fallback }: { min: number; max: number; fallback: number }
) => {
  const value = queryString(query, name)

  if (value === undefined) {
    return fallback
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw invalid(`${name} must be a whole number from ${min} to ${max}.`)
  }

  return parsed
}

/* ── nested shapes ───────────────────────────────────────────────────────── */

type FieldRule =
  | "string"
  | "number"
  | "boolean"
  | "string[]"
  | readonly string[]

export type Shape = Record<string, FieldRule>

/**
 * Checks an object against a list of allowed fields. The schema rejects
 * unknown fields on write, and a rejected write surfaces as an opaque server
 * error, so shapes are checked here where the message can name the field.
 */
export const readShape = (
  body: JsonObject,
  name: string,
  shape: Shape
): JsonObject | undefined => {
  const value = readObject(body, name)

  if (value === undefined) {
    return undefined
  }

  assertKnownFields(value, Object.keys(shape), name)
  const result: JsonObject = {}

  for (const [key, fieldValue] of Object.entries(value)) {
    const rule = shape[key]!
    const path = `${name}.${key}`

    if (fieldValue === undefined || fieldValue === null) {
      continue
    }

    if (Array.isArray(rule)) {
      if (typeof fieldValue !== "string" || !rule.includes(fieldValue)) {
        throw invalid(`${path} must be one of: ${rule.join(", ")}.`)
      }
    } else if (rule === "string[]") {
      if (
        !Array.isArray(fieldValue) ||
        fieldValue.some((item) => typeof item !== "string")
      ) {
        throw invalid(`${path} must be an array of strings.`)
      }
    } else if (rule === "number") {
      if (typeof fieldValue !== "number" || !Number.isFinite(fieldValue)) {
        throw invalid(`${path} must be a number.`)
      }
    } else if (typeof fieldValue !== rule) {
      throw invalid(
        `${path} must be a ${rule}, not ${describeType(fieldValue)}.`
      )
    } else if (rule === "string" && (fieldValue as string).length > 5000) {
      throw invalid(`${path} must be 5,000 characters or fewer.`)
    }

    result[key] = fieldValue
  }

  return result
}

export const THEME_SHAPE: Shape = {
  primaryColor: "string",
  headerGradientStart: "string",
  headerGradientEnd: "string",
  userBubbleColor: "string",
  botBubbleColor: "string",
  borderRadius: "number",
  logoUrl: "string",
  backgroundImageUrl: "string",
  assistantName: "string",
  fontFamily: ["sans", "serif", "mono", "rounded"],
  headerBrandMode: ["none", "image", "text"],
  headerBannerImageUrl: "string",
  headerBannerText: "string",
  headerBannerTextColor: "string",
  headerBannerAccentColor: "string",
  headerBannerFont: ["sans", "serif", "mono", "display"],
  headerBannerStyle: ["plain", "pill", "gradient"],
}

export const APPEARANCE_SHAPE: Shape = {
  launcherColor: "string",
  launcherLabel: "string",
  voiceLauncherLabel: "string",
  launcherIcon: ["chat", "sparkles", "question"],
  launcherIconUrl: "string",
  launcherPromptEnabled: "boolean",
  launcherPromptText: "string",
  launcherPromptDelaySeconds: "number",
  launcherAttention: ["none", "pulse", "bounce", "wiggle", "glow"],
  launcherBadgeEnabled: "boolean",
  animation: ["slide-up", "scale", "fade", "pop"],
  poweredByText: "string",
  showPoweredBy: "boolean",
  showHelpCenter: "boolean",
  showChatHistoryDownload: "boolean",
  launcherPosition: ["bottom-right", "bottom-left"],
  launcherOffsetX: "number",
  launcherOffsetY: "number",
  launcherSize: "number",
  autoOpenEnabled: "boolean",
  autoOpenDelaySeconds: "number",
  autoOpenFrequency: ["session", "visitor", "always"],
  notificationSoundEnabled: "boolean",
  imageUploadsEnabled: "boolean",
  imageUploadMaxSizeMb: "number",
  imageUploadMaxPerMessage: "number",
  imageUploadAiVisionEnabled: "boolean",
}

export const COPY_SHAPE: Shape = {
  homeGreeting: "string",
  homeHeadline: "string",
  startChatLabel: "string",
  inputPlaceholder: "string",
  onlineLabel: "string",
}

export const TOOL_CONFIG_SHAPE: Shape = {
  knowledgeBaseModel: "string",
  spreadsheetId: "string",
  range: "string",
  operation: ["lookup", "append", "update", "delete"],
  searchColumns: "string[]",
  valueColumns: "string[]",
  updateColumns: "string[]",
  returnColumns: "string[]",
  matchMode: ["contains", "exact", "equals"],
  queryStrategy: ["gviz", "scan"],
  headerRow: "number",
  dataRange: "string",
  maxLookupRows: "number",
  maxScanRows: "number",
  requireUniqueMatch: "boolean",
  calendarId: "string",
  url: "string",
  method: ["GET", "POST"],
  headersJson: "string",
  bodyTemplate: "string",
  webhookUrl: "string",
  webhookMethod: ["GET", "POST"],
}

export const readToolParameters = (body: JsonObject, name = "parameters") => {
  const value = body[name]

  if (value === undefined) {
    return undefined
  }

  if (!Array.isArray(value)) {
    throw invalid(`${name} must be an array.`)
  }

  if (value.length > 20) {
    throw invalid(`${name} can hold at most 20 parameters.`)
  }

  return value.map((item, index) => {
    const path = `${name}[${index}]`

    if (!isObject(item)) {
      throw invalid(`${path} must be an object.`)
    }

    assertKnownFields(item, ["name", "description", "type", "required"], path)

    return {
      name: readString(item, "name", { required: true, max: 64 }),
      description: readString(item, "description", {
        required: true,
        max: 500,
      }),
      type:
        readEnum(item, "type", ["string", "number", "boolean"] as const) ??
        ("string" as const),
      required: readBoolean(item, "required") ?? false,
    }
  })
}
