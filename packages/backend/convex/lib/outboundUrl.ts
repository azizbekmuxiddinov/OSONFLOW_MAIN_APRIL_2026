const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
])

// Link-local range used by cloud instance metadata services (AWS/GCP/Azure).
const LINK_LOCAL_V4 = /^169\.254\./
const LOOPBACK_V4 = /^127\./
const PRIVATE_V4 = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/
// Carrier-grade NAT, commonly routable to internal infrastructure.
const CGNAT_V4 = /^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./
// IETF protocol assignments (192.0.0.0/24) and benchmarking (198.18.0.0/15).
const SPECIAL_V4 = /^(?:192\.0\.0\.|198\.1[89]\.)/
// Multicast (224.0.0.0/4) and reserved (240.0.0.0/4), broadcast included.
const NON_UNICAST_V4 = /^(?:22[4-9]|2[3-5]\d)\./

const IPV4_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/

const isBlockedIpv4 = (hostname: string) =>
  LOOPBACK_V4.test(hostname) ||
  PRIVATE_V4.test(hostname) ||
  LINK_LOCAL_V4.test(hostname) ||
  CGNAT_V4.test(hostname) ||
  SPECIAL_V4.test(hostname) ||
  NON_UNICAST_V4.test(hostname) ||
  hostname.startsWith("0.")

/**
 * Expands an IPv6 literal into its eight 16-bit groups. Prefix matching on the
 * text form is not safe: `new URL()` rewrites `::ffff:169.254.169.254` to
 * `::ffff:a9fe:a9fe`, so a private address can be spelled in a form that no
 * string prefix catches.
 */
const parseIpv6 = (input: string): number[] | null => {
  let text = input
  let embeddedV4: [number, number] | null = null

  const trailingV4 = text.match(/(\d{1,3}(?:\.\d{1,3}){3})$/)

  if (trailingV4) {
    const dotted = trailingV4[1] ?? ""
    const octets = dotted.split(".").map(Number)

    if (
      octets.length !== 4 ||
      octets.some((octet) => !Number.isInteger(octet) || octet > 255)
    ) {
      return null
    }

    const [a = 0, b = 0, c = 0, d = 0] = octets
    embeddedV4 = [(a << 8) | b, (c << 8) | d]
    // Swap the dotted tail for two placeholder groups so the rest parses as a
    // plain IPv6 literal.
    text = `${text.slice(0, text.length - dotted.length)}0:0`
  }

  const halves = text.split("::")

  if (halves.length > 2) {
    return null
  }

  const toGroups = (segment: string) =>
    segment === ""
      ? []
      : segment
          .split(":")
          .map((group) =>
            /^[0-9a-f]{1,4}$/.test(group)
              ? Number.parseInt(group, 16)
              : Number.NaN
          )

  const left = toGroups(halves[0] ?? "")
  const right = halves.length === 2 ? toGroups(halves[1] ?? "") : []

  if ([...left, ...right].some(Number.isNaN)) {
    return null
  }

  let groups: number[]

  if (halves.length === 2) {
    const padding = 8 - left.length - right.length

    if (padding < 0) {
      return null
    }

    groups = [...left, ...new Array<number>(padding).fill(0), ...right]
  } else {
    groups = left
  }

  if (groups.length !== 8) {
    return null
  }

  if (embeddedV4) {
    groups[6] = embeddedV4[0]
    groups[7] = embeddedV4[1]
  }

  return groups
}

const isBlockedIpv6 = (hostname: string) => {
  const groups = parseIpv6(hostname.replace(/^\[|\]$/g, "").toLowerCase())

  if (!groups) {
    // Not a literal we can reason about, so refuse rather than guess.
    return true
  }

  const [
    first = 0,
    second = 0,
    third = 0,
    fourth = 0,
    fifth = 0,
    sixth = 0,
    seventh = 0,
    eighth = 0,
  ] = groups

  if (groups.every((group) => group === 0)) {
    return true // ::
  }

  if (groups.slice(0, 7).every((group) => group === 0) && eighth === 1) {
    return true // ::1
  }

  if ((first & 0xfe00) === 0xfc00) {
    return true // fc00::/7 unique local
  }

  if ((first & 0xffc0) === 0xfe80) {
    return true // fe80::/10 link local
  }

  if ((first & 0xffc0) === 0xfec0) {
    return true // fec0::/10 site local
  }

  // ::ffff:0:0/96 (IPv4-mapped), ::/96 (IPv4-compatible) and 64:ff9b::/96
  // (NAT64) all tunnel an IPv4 address that must be checked on its own terms.
  const isMapped =
    first === 0 &&
    second === 0 &&
    third === 0 &&
    fourth === 0 &&
    fifth === 0 &&
    (sixth === 0xffff || sixth === 0)
  const isNat64 =
    first === 0x64 &&
    second === 0xff9b &&
    third === 0 &&
    fourth === 0 &&
    fifth === 0 &&
    sixth === 0

  if (isMapped || isNat64) {
    const tunnelled = [
      seventh >> 8,
      seventh & 0xff,
      eighth >> 8,
      eighth & 0xff,
    ].join(".")

    return isBlockedIpv4(tunnelled)
  }

  return false
}

/**
 * Whether an IP address literal is one the public internet cannot route to:
 * loopback, private, link-local, carrier-grade NAT, multicast and the like.
 * Anything that is not a well-formed address is reported as `null`.
 */
export const isPrivateIpAddress = (address: string): boolean | null => {
  const normalized = address.trim().toLowerCase().replace(/^\[|\]$/g, "")

  if (IPV4_PATTERN.test(normalized)) {
    return normalized
      .split(".")
      .some((octet) => Number(octet) > 255)
      ? null
      : isBlockedIpv4(normalized)
  }

  if (normalized.includes(":")) {
    return parseIpv6(normalized) ? isBlockedIpv6(normalized) : null
  }

  return null
}

export class OutboundUrlError extends Error {}

/**
 * Validates a URL configured by an organization before the backend fetches it.
 * Organization admins can point tools at arbitrary URLs, so without this an
 * assistant tool could be used to reach cloud metadata endpoints or other
 * services reachable from the backend but not from the public internet.
 */
export const assertSafeOutboundUrl = (rawUrl: string): URL => {
  let url: URL

  try {
    url = new URL(rawUrl)
  } catch {
    throw new OutboundUrlError("The configured URL is not valid.")
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new OutboundUrlError("Only http(s) URLs are supported.")
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "")

  if (
    !hostname ||
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost")
  ) {
    throw new OutboundUrlError("That URL points at a private host.")
  }

  if (hostname.includes(":") || hostname.startsWith("[")) {
    if (isBlockedIpv6(hostname)) {
      throw new OutboundUrlError("That URL points at a private host.")
    }

    return url
  }

  if (IPV4_PATTERN.test(hostname) && isBlockedIpv4(hostname)) {
    throw new OutboundUrlError("That URL points at a private host.")
  }

  return url
}

/**
 * DNS-over-HTTPS resolvers, tried in order. Both answer the same JSON shape.
 * Neither runtime this code runs in (Convex actions, Vercel functions) offers a
 * resolver of its own that works everywhere, so the lookup goes over HTTPS.
 */
const DNS_RESOLVERS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
]
const DNS_TYPE_A = 1
const DNS_TYPE_AAAA = 28
const DNS_TIMEOUT_MS = 5_000

type DnsJsonResponse = {
  Status?: number
  Answer?: Array<{ type?: number; data?: string }>
}

const queryResolver = async (
  resolver: string,
  hostname: string,
  type: number
): Promise<string[]> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DNS_TIMEOUT_MS)

  try {
    const params = new URLSearchParams({ name: hostname, type: String(type) })
    const response = await fetch(`${resolver}?${params.toString()}`, {
      headers: { accept: "application/dns-json" },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`DNS lookup failed with HTTP ${response.status}`)
    }

    const body = (await response.json()) as DnsJsonResponse

    return (body.Answer ?? [])
      .filter((answer) => answer.type === type && answer.data)
      .map((answer) => String(answer.data).trim())
  } finally {
    clearTimeout(timeout)
  }
}

const resolveHostAddresses = async (hostname: string): Promise<string[]> => {
  let lastError: unknown

  for (const resolver of DNS_RESOLVERS) {
    try {
      const [v4, v6] = await Promise.all([
        queryResolver(resolver, hostname, DNS_TYPE_A),
        queryResolver(resolver, hostname, DNS_TYPE_AAAA),
      ])

      return [...v4, ...v6]
    } catch (error) {
      lastError = error
    }
  }

  console.error("Outbound URL host lookup failed", lastError)
  throw new OutboundUrlError("The URL's host could not be looked up.")
}

/**
 * Refuses a hostname that resolves to a private address.
 *
 * `assertSafeOutboundUrl` only sees the name, and a public name can be given
 * an A record of 127.0.0.1 or 169.254.169.254 by whoever owns it. Several of
 * these requests show their response to the person who configured them (the
 * webhook delivery log, the tool and API step test panels), so letting such a
 * name through would let anyone read services that are only reachable from
 * inside our network.
 *
 * A name with no public answer is refused too: a name that only an internal
 * resolver knows is exactly the case this is here to stop. What this cannot
 * rule out is a record that changes between this lookup and the connection
 * (DNS rebinding); it removes the static case, which needs no skill at all.
 */
const assertPublicHost = async (url: URL) => {
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "")

  // Address literals were already judged by assertSafeOutboundUrl.
  if (isPrivateIpAddress(hostname) !== null) {
    return
  }

  const addresses = await resolveHostAddresses(hostname)

  if (addresses.length === 0) {
    throw new OutboundUrlError("The URL's host could not be resolved.")
  }

  // A CNAME answer is never an address, so anything unparseable is refused
  // along with the private ones rather than guessed at.
  if (addresses.some((address) => isPrivateIpAddress(address) !== false)) {
    throw new OutboundUrlError("That URL points at a private host.")
  }
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const MAX_REDIRECTS = 3

/**
 * Fetches an organization-configured URL, re-validating every redirect hop.
 * Validating only the initial URL is not enough: an attacker-controlled host
 * can answer with `302 Location: http://169.254.169.254/...` and the default
 * redirect handling would follow it straight past the check above.
 */
export const safeFetch = async (
  rawUrl: string,
  init: RequestInit = {}
): Promise<Response> => {
  let currentUrl = assertSafeOutboundUrl(rawUrl).toString()
  let method = (init.method ?? "GET").toUpperCase()
  let body = init.body

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertPublicHost(new URL(currentUrl))

    const response = await fetch(currentUrl, {
      ...init,
      method,
      body,
      redirect: "manual",
    })

    if (!REDIRECT_STATUSES.has(response.status)) {
      // If the runtime ignored `redirect: "manual"` and followed on its own,
      // the hops went unchecked, so refuse the response rather than trust it.
      if (response.url && response.url !== currentUrl) {
        assertSafeOutboundUrl(response.url)
      }

      return response
    }

    const location = response.headers.get("location")

    if (!location) {
      return response
    }

    let nextUrl: URL

    try {
      nextUrl = new URL(location, currentUrl)
    } catch {
      throw new OutboundUrlError("The URL redirected to an invalid location.")
    }

    assertSafeOutboundUrl(nextUrl.toString())

    // Mirror the standard redirect semantics for the methods we send.
    if (
      response.status === 303 ||
      ((response.status === 301 || response.status === 302) && method === "POST")
    ) {
      method = "GET"
      body = undefined
    }

    currentUrl = nextUrl.toString()
  }

  throw new OutboundUrlError("The configured URL redirected too many times.")
}
