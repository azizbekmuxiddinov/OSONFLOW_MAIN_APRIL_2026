import { createHash, createHmac, timingSafeEqual } from "node:crypto"

/**
 * Passages for the landing page live demo.
 *
 * The site reader splits pages into short passages and signs each one; the
 * answer route only sends signed passages to the model. Without the signature
 * the answer endpoint would be a free, public, general-purpose LLM proxy: anyone
 * could post their own "passage" and a prompt.
 */

export type DemoPassage = {
  title: string
  url: string
  text: string
  sig: string
}

const MAX_PASSAGE_LENGTH = 260
const MAX_PASSAGES = 500

const signingSecret = () => {
  const explicit = process.env.DEMO_SIGNING_SECRET?.trim()
  if (explicit) return explicit

  // Derived rather than required: one less secret to configure, and it rotates
  // whenever the model key does.
  const base = process.env.GEMINI_API_KEY || process.env.FIRECRAWL_API_KEY || ""
  return createHash("sha256").update(`osonflow-demo:${base}`).digest("hex")
}

const signatureFor = (passage: Omit<DemoPassage, "sig">) =>
  createHmac("sha256", signingSecret())
    .update(`${passage.url}\n${passage.title}\n${passage.text}`)
    .digest("base64url")

export const verifyPassage = (passage: unknown): passage is DemoPassage => {
  if (!passage || typeof passage !== "object") return false

  const { title, url, text, sig } = passage as Record<string, unknown>

  if (
    typeof title !== "string" ||
    typeof url !== "string" ||
    typeof text !== "string" ||
    typeof sig !== "string" ||
    text.length > MAX_PASSAGE_LENGTH * 2
  ) {
    return false
  }

  const expected = Buffer.from(signatureFor({ title, url, text }))
  const given = Buffer.from(sig)

  return expected.length === given.length && timingSafeEqual(expected, given)
}

/**
 * Menus and footers ("About Warranty Delivery Contacts ...") mention every topic
 * and state nothing. Left in, they get cited as proof that the shop offers
 * whatever the link names.
 */
const looksLikeNavigation = (words: string[], text: string) => {
  const capitalized = words.filter((word) => /^\p{Lu}/u.test(word)).length
  const punctuation = text.match(/[.,:;!?]/g)?.length ?? 0
  return capitalized / words.length > 0.45 && punctuation < 2
}

/** A sentence or two a customer could actually be sent; navigation debris is dropped. */
export const toPassages = (
  pages: Array<{ title: string; url: string; text: string }>
): DemoPassage[] => {
  const passages: DemoPassage[] = []

  for (const page of pages) {
    const pieces = page.text
      .split(/\n+|(?<=[.!?])\s+/)
      .map((piece) => piece.trim())
      .filter(Boolean)

    let buffer = ""

    const flush = () => {
      const text = buffer.trim()
      buffer = ""

      const letters = text.match(/\p{L}/gu)?.length ?? 0
      const words = text.split(/\s+/)
      if (words.length < 5 || letters < text.length * 0.5) return
      if (looksLikeNavigation(words, text)) return

      const base = { title: page.title, url: page.url, text: text.slice(0, MAX_PASSAGE_LENGTH * 2) }
      passages.push({ ...base, sig: signatureFor(base) })
    }

    for (const piece of pieces) {
      if (`${buffer} ${piece}`.length > MAX_PASSAGE_LENGTH) flush()
      buffer += ` ${piece}`
    }

    flush()

    if (passages.length >= MAX_PASSAGES) break
  }

  return passages.slice(0, MAX_PASSAGES)
}

/** Per-instance sliding window. A cost brake for a public demo, not a billing guarantee. */
export const createRateLimiter = (windowMs: number, max: number) => {
  const hits = new Map<string, number[]>()

  return (visitor: string) => {
    const now = Date.now()
    const recent = (hits.get(visitor) ?? []).filter((at) => now - at < windowMs)
    const limited = recent.length >= max

    if (!limited) recent.push(now)
    hits.set(visitor, recent)

    if (hits.size > 5_000) {
      for (const [key, times] of hits) {
        if (!times.some((at) => now - at < windowMs)) hits.delete(key)
      }
    }

    return limited
  }
}
