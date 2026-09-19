/**
 * Some networks, Uzbek ISPs among them, reset every TLS connection that uses
 * Cloudflare's Encrypted Client Hello. Chrome and Firefox use ECH for
 * *.convex.cloud and *.convex.site, so there they cannot reach Convex at all,
 * while Safari (no ECH) can. A browser whose direct connection never opens
 * switches to relay mode: the sync socket goes through the app's own
 * /convex/api/<version>/sync route and file URLs through same-origin rewrites,
 * all served from Vercel, whose domains carry no ECH.
 */

const RELAY_UNTIL_KEY = "osonflow.convexRelayUntil"

// Remembered so later page views skip the failing direct attempt, but not for
// good, in case the visitor's network changes.
const RELAY_TTL_MS = 24 * 60 * 60 * 1000

// Resets fail a blocked connection at once, but a network that silently drops
// the handshake would leave the socket connecting for minutes.
const DIRECT_CONNECT_TIMEOUT_MS = 8000

const RELAY_PATHS = [
  { suffix: ".convex.cloud", path: "/convex" },
  { suffix: ".convex.site", path: "/convex-site" },
]

const readRelayMode = () => {
  try {
    return Number(window.localStorage.getItem(RELAY_UNTIL_KEY)) > Date.now()
  } catch {
    return false
  }
}

let relayMode = typeof window !== "undefined" && readRelayMode()

const enableRelayMode = () => {
  relayMode = true

  try {
    window.localStorage.setItem(
      RELAY_UNTIL_KEY,
      String(Date.now() + RELAY_TTL_MS)
    )
  } catch {
    // Storage can be blocked in a third-party iframe; the flag still holds
    // for this page.
  }
}

const toRelayUrl = (value: string): string | undefined => {
  if (typeof window === "undefined" || !value.includes(".convex.")) {
    return undefined
  }

  let url: URL

  try {
    url = new URL(value)
  } catch {
    return undefined
  }

  const relay = RELAY_PATHS.find(({ suffix }) => url.hostname.endsWith(suffix))

  if (!relay) {
    return undefined
  }

  const origin = url.protocol.startsWith("ws")
    ? window.location.origin.replace(/^http/, "ws")
    : window.location.origin

  return value.replace(/^[a-z]+:\/\/[^/?#]+/i, `${origin}${relay.path}`)
}

export const toReachableConvexUrl = (value: string): string =>
  (relayMode && toRelayUrl(value)) || value

/** Applies toReachableConvexUrl to every string inside a query result. */
export const withReachableConvexUrls = <T>(value: T): T => {
  if (!relayMode) {
    return value
  }

  if (typeof value === "string") {
    return toReachableConvexUrl(value) as T
  }

  if (Array.isArray(value)) {
    return value.map(withReachableConvexUrls) as T
  }

  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        withReachableConvexUrls(entry),
      ])
    ) as T
  }

  return value
}

/**
 * WebSocket for ConvexReactClient. It connects directly; once a direct socket
 * closes without ever opening, the reconnects Convex makes on its own go
 * through the relay instead.
 */
export const createConvexWebSocket = (): typeof WebSocket | undefined => {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    return undefined
  }

  return class ConvexWebSocket extends WebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      const relayUrl = relayMode ? toRelayUrl(String(url)) : undefined

      super(relayUrl ?? url, protocols)

      if (!relayUrl) {
        let opened = false
        const timeout = setTimeout(() => {
          if (this.readyState === WebSocket.CONNECTING) {
            this.close()
          }
        }, DIRECT_CONNECT_TIMEOUT_MS)

        this.addEventListener("open", () => {
          opened = true
          clearTimeout(timeout)
        })
        this.addEventListener("close", () => {
          clearTimeout(timeout)

          if (!opened) {
            enableRelayMode()
          }
        })
      }
    }
  }
}
