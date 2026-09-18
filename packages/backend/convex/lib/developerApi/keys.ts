/**
 * API keys are shown once and stored only as a SHA-256 hash, so a leaked
 * database row cannot be replayed as a credential. The visible prefix is what
 * lets an owner tell their keys apart in the dashboard and in request logs.
 */

export const API_KEY_PREFIX = "osf_live_"

const KEY_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const KEY_SECRET_LENGTH = 40
/** Characters of the secret kept visible after the prefix. */
const VISIBLE_SECRET_LENGTH = 4

/**
 * Must run where `crypto.getRandomValues` is a real CSPRNG — an action or an
 * HTTP action, never a query or mutation.
 */
export const generateApiKey = () => {
  // Rejection sampling keeps every character equally likely: 62 does not
  // divide 256, so a plain modulo would favour the first few characters.
  const limit = 256 - (256 % KEY_ALPHABET.length)
  let secret = ""

  while (secret.length < KEY_SECRET_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(64))

    for (const byte of bytes) {
      if (byte < limit && secret.length < KEY_SECRET_LENGTH) {
        secret += KEY_ALPHABET[byte % KEY_ALPHABET.length]
      }
    }
  }

  const key = `${API_KEY_PREFIX}${secret}`

  return {
    key,
    prefix: `${API_KEY_PREFIX}${secret.slice(0, VISIBLE_SECRET_LENGTH)}`,
    lastFour: secret.slice(-4),
  }
}

export const hashApiKey = async (key: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key)
  )

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export const looksLikeApiKey = (value: string) =>
  value.startsWith(API_KEY_PREFIX) &&
  value.length === API_KEY_PREFIX.length + KEY_SECRET_LENGTH &&
  /^[0-9A-Za-z]+$/.test(value.slice(API_KEY_PREFIX.length))

/* ── allowlists ──────────────────────────────────────────────────────────── */

const parseIpv4 = (value: string) => {
  const parts = value.split(".")

  if (parts.length !== 4) {
    return null
  }

  let result = 0

  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null
    }

    const octet = Number(part)

    if (octet > 255) {
      return null
    }

    result = result * 256 + octet
  }

  return result
}

/** Accepts an IPv4 address, an IPv4 CIDR range, or an exact IPv6 address. */
export const normalizeIpRule = (rule: string) => {
  const trimmed = rule.trim()

  if (!trimmed) {
    return null
  }

  const [address, prefix] = trimmed.split("/")

  if (address && parseIpv4(address) !== null) {
    if (prefix === undefined) {
      return address
    }

    const bits = Number(prefix)

    return Number.isInteger(bits) && bits >= 0 && bits <= 32
      ? `${address}/${bits}`
      : null
  }

  if (
    prefix === undefined &&
    /^[0-9a-fA-F:]+$/.test(trimmed) &&
    trimmed.includes(":")
  ) {
    return trimmed.toLowerCase()
  }

  return null
}

export const ipMatchesRule = (ip: string, rule: string) => {
  const [address, prefix] = rule.split("/")
  const target = parseIpv4(ip)

  if (address === undefined) {
    return false
  }

  if (prefix === undefined) {
    return ip.toLowerCase() === address.toLowerCase()
  }

  const base = parseIpv4(address)

  if (target === null || base === null) {
    return false
  }

  const bits = Number(prefix)

  if (bits === 0) {
    return true
  }

  const size = 2 ** (32 - bits)

  return Math.floor(target / size) === Math.floor(base / size)
}

/** Browsers send the origin without a trailing slash or path. */
export const normalizeOriginRule = (rule: string) => {
  const trimmed = rule.trim()

  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed)

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}
