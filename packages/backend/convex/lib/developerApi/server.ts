import { ConvexError } from "convex/values"

import { httpAction } from "../../_generated/server"
import { internal } from "../../_generated/api"
import type { GateResult } from "../../system/developerApi/gate"
import { HANDLERS, type ApiContext } from "./handlers"
import { hashApiKey, looksLikeApiKey } from "./keys"
import { matchRoute } from "./router"
import { ApiError, invalid, type JsonObject } from "./validate"

/**
 * The developer API's single entry point, mounted under `/v1/` in http.ts.
 *
 * A call goes through the same steps whatever it asks for: find the endpoint,
 * check the key, admit it against every limit that applies, run it, and log
 * it. Errors always come back as JSON with a code, a readable message and the
 * request id, never as a bare status or a stack trace.
 */

const ALLOWED_METHODS = "GET, POST, PATCH, DELETE, OPTIONS"

const corsHeaders = (origin: string | undefined): Record<string, string> =>
  origin
    ? {
        // Echoing the origin is safe: a browser call only succeeds when the
        // key lists that website, and the refusal carries no data.
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Expose-Headers":
          "X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After",
        Vary: "Origin",
      }
    : {}

const readOrigin = (request: Request) => {
  const origin = request.headers.get("origin")?.trim()

  if (!origin || origin === "null") {
    return undefined
  }

  try {
    return new URL(origin).origin
  } catch {
    return undefined
  }
}

/** The caller's address, as forwarded by the edge in front of the deployment. */
const readClientIp = (request: Request) => {
  for (const header of [
    "cf-connecting-ip",
    "true-client-ip",
    "x-real-ip",
    "x-forwarded-for",
  ]) {
    const value = request.headers.get(header)?.split(",")[0]?.trim()

    if (value) {
      return value
    }
  }

  return undefined
}

const createRequestId = () =>
  `req_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`

/**
 * Turns anything a handler threw into an API error. Internal functions report
 * problems as ConvexErrors with a code; anything else is a bug, so its detail
 * is logged and kept out of the response.
 */
const toApiError = (error: unknown, requestId: string): ApiError => {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof ConvexError) {
    const payload = error.data as
      | string
      | { code?: string; message?: string; retryAfter?: number }
    const code = typeof payload === "string" ? undefined : payload?.code
    const message =
      (typeof payload === "string" ? payload : payload?.message) ||
      "The request could not be completed."

    switch (code) {
      case "NOT_FOUND":
        return new ApiError(404, "not_found", message)
      case "UNAUTHORIZED":
      case "UNAUTHORZIED":
        // Only reachable through an id from another organization.
        return new ApiError(404, "not_found", "Not found.")
      case "FORBIDDEN":
        return new ApiError(403, "forbidden", message)
      case "LIMIT_REACHED":
        return new ApiError(403, "plan_limit_reached", message)
      case "CONFLICT":
        return new ApiError(409, "conflict", message)
      case "RATE_LIMITED":
        return new ApiError(
          429,
          "rate_limited",
          message,
          typeof payload === "object" ? payload.retryAfter : undefined
        )
      default:
        if (message === "Missing subscription") {
          return new ApiError(
            403,
            "plan_limit_reached",
            "This needs an active paid plan."
          )
        }

        return new ApiError(400, "invalid_request", message)
    }
  }

  console.error(`Developer API ${requestId} failed`, error)

  return new ApiError(
    500,
    "internal_error",
    `Something went wrong on our side. If it keeps happening, contact support and quote ${requestId}.`
  )
}

const LEADING_KEYS = ["id", "object"]

/**
 * Values coming back from Convex functions have their keys sorted, which
 * buries `id` and `object` in the middle of every record. Moving them to the
 * front makes responses readable at a glance; nothing else is reordered.
 */
const withLeadingKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(withLeadingKeys)
  }

  if (typeof value !== "object" || value === null) {
    return value
  }

  const record = value as Record<string, unknown>

  return Object.fromEntries([
    ...LEADING_KEYS.filter((key) => key in record).map((key) => [
      key,
      withLeadingKeys(record[key]),
    ]),
    ...Object.entries(record)
      .filter(([key]) => !LEADING_KEYS.includes(key))
      .map(([key, item]) => [key, withLeadingKeys(item)]),
  ])
}

const jsonResponse = (
  status: number,
  body: unknown,
  headers: Record<string, string>
) =>
  new Response(status === 204 ? null : JSON.stringify(withLeadingKeys(body)), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  })

const errorBody = (error: ApiError, requestId: string) => ({
  error: {
    code: error.code,
    message: error.message,
    requestId,
    ...(error.retryAfterMs !== undefined
      ? { retryAfterSeconds: Math.max(1, Math.ceil(error.retryAfterMs / 1000)) }
      : {}),
  },
})

const createBodyReader = (request: Request, maxBytes: number) => {
  let parsed: Promise<JsonObject> | null = null

  return () => {
    parsed ??= (async () => {
      const text = await request.text()

      if (new TextEncoder().encode(text).byteLength > maxBytes) {
        throw new ApiError(
          413,
          "payload_too_large",
          `The request body is larger than your limit of ${Math.round(maxBytes / 1024).toLocaleString("en-US")} KB.`
        )
      }

      if (!text.trim()) {
        return {}
      }

      let body: unknown

      try {
        body = JSON.parse(text)
      } catch {
        throw invalid("The request body is not valid JSON.")
      }

      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        throw invalid("The request body must be a JSON object.")
      }

      return body as JsonObject
    })()

    return parsed
  }
}

export const developerApiHttpHandler = httpAction(async (ctx, request) => {
  const startedAt = Date.now()
  const requestId = createRequestId()
  const url = new URL(request.url)
  const origin = readOrigin(request)
  const headers: Record<string, string> = {
    "X-Request-Id": requestId,
    ...corsHeaders(origin),
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        "Access-Control-Allow-Methods": ALLOWED_METHODS,
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "600",
      },
    })
  }

  const fail = (error: ApiError, extra: Record<string, string> = {}) =>
    jsonResponse(error.status, errorBody(error, requestId), {
      ...headers,
      ...extra,
    })

  let route: ReturnType<typeof matchRoute>

  try {
    route = matchRoute(request.method, url.pathname)
  } catch {
    route = { kind: "not_found" }
  }

  if (route.kind === "not_found") {
    return fail(
      new ApiError(
        404,
        "not_found",
        `There is no endpoint at ${request.method} ${url.pathname}.`
      )
    )
  }

  if (route.kind === "method_not_allowed") {
    return fail(
      new ApiError(
        405,
        "method_not_allowed",
        `${url.pathname} accepts ${route.allowed.join(", ")}, not ${request.method}.`
      ),
      { Allow: route.allowed.join(", ") }
    )
  }

  const { endpoint, params } = route
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(\S+)\s*$/i)?.[1]

  if (!token) {
    return fail(
      new ApiError(
        401,
        "missing_api_key",
        "Send your API key in the Authorization header: `Authorization: Bearer osf_live_…`."
      )
    )
  }

  if (!looksLikeApiKey(token)) {
    return fail(
      new ApiError(
        401,
        "invalid_api_key",
        "This API key is not valid. It may have been revoked or have expired."
      )
    )
  }

  const ip = readClientIp(request)
  const gate: GateResult = await ctx.runMutation(
    internal.system.developerApi.gate.admit,
    {
      keyHash: await hashApiKey(token),
      endpointId: endpoint.id,
      ip,
      origin,
    }
  )

  let status: number
  let response: Response
  let errorCode: string | undefined

  if (!gate.ok) {
    const error = new ApiError(
      gate.status,
      gate.code,
      gate.message,
      gate.retryAfterMs
    )
    status = error.status
    errorCode = error.code
    response = fail(
      error,
      error.retryAfterMs !== undefined
        ? {
            "Retry-After": String(
              Math.max(1, Math.ceil(error.retryAfterMs / 1000))
            ),
          }
        : {}
    )
  } else {
    const rateHeaders = {
      "X-RateLimit-Limit": String(gate.rateLimit.limit),
      "X-RateLimit-Remaining": String(gate.rateLimit.remaining),
    }
    const maxBytes = gate.limits.maxBodyKb * 1024
    const declaredLength = Number(request.headers.get("content-length") ?? "0")

    try {
      if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        throw new ApiError(
          413,
          "payload_too_large",
          `The request body is larger than your limit of ${gate.limits.maxBodyKb.toLocaleString("en-US")} KB.`
        )
      }

      const handler = HANDLERS[endpoint.id]

      if (!handler) {
        throw new Error(`No handler for ${endpoint.id}`)
      }

      const api: ApiContext = {
        ctx,
        request,
        params,
        query: url.searchParams,
        body: createBodyReader(request, maxBytes),
        organizationId: gate.organizationId,
        keyId: gate.keyId,
        keyName: gate.keyName,
        keyPrefix: gate.keyPrefix,
        scopes: gate.scopes,
        keyExpiresAt: gate.keyExpiresAt,
        keyCreatedAt: gate.keyCreatedAt,
        limits: gate.limits,
        organizationLimits: gate.organizationLimits,
        keyLimits: gate.keyLimits,
      }
      const result = await handler(api)
      status = result.status ?? 200
      response = jsonResponse(status, result.body, {
        ...headers,
        ...rateHeaders,
      })
    } catch (caught) {
      const error = toApiError(caught, requestId)
      status = error.status
      errorCode = error.code
      response = fail(error, rateHeaders)
    }
  }

  const organizationId = gate.ok ? gate.organizationId : gate.organizationId
  const keyId = gate.ok ? gate.keyId : gate.keyId

  if (organizationId && keyId) {
    try {
      await ctx.runMutation(internal.system.developerApi.gate.record, {
        organizationId,
        keyId,
        requestId,
        method: request.method,
        route: endpoint.path,
        path: url.pathname.slice(0, 300),
        status,
        errorCode,
        durationMs: Date.now() - startedAt,
        ip,
        ai: endpoint.ai === true,
        logRetentionDays: gate.logRetentionDays ?? 14,
      })
    } catch (error) {
      // The call itself succeeded or failed on its own merits; losing its
      // log line must not change the answer the caller gets.
      console.error("Could not record developer API usage", error)
    }
  }

  return response
})
