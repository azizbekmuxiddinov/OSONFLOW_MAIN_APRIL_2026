import { NextResponse, type NextRequest } from "next/server"

import {
  firecrawlMap,
  firecrawlScrape,
  getFirecrawlApiKey,
} from "@workspace/backend/lib/firecrawl"
import {
  OutboundUrlError,
  assertSafeOutboundUrl,
} from "@workspace/backend/lib/outboundUrl"
import { crawlSite } from "@workspace/backend/lib/siteCrawl"

import { createRateLimiter, toPassages } from "@/lib/demo-passages"
import { getClientIp } from "@/lib/polar"

/**
 * Reads a visitor's website for the landing page live demo and returns it as
 * signed passages. It is public and unauthenticated, which is why it is rate
 * limited per visitor and capped in pages and size: every read spends Firecrawl
 * credits.
 */

export const runtime = "nodejs"
export const maxDuration = 45

const MAX_PAGES = 5
const MAX_PAGE_TEXT = 8_000
const isRateLimited = createRateLimiter(10 * 60 * 1000, 5)

/** Same idea as the setup crawler: spend the page budget on pages customers ask about. */
const HIGH_VALUE_PATH =
  /(price|pricing|tarif|narx|cena|service|xizmat|uslugi|product|catalog|menu|about|haqida|contact|kontakt|aloqa|manzil|delivery|dostavka|yetkaz|shipping|return|vozvrat|qaytar|faq|help|savol|vopros|payment|oplata|tolov|hours|grafik|book|zapis|qabul)/i
const LOW_VALUE_PATH =
  /(privacy|terms|cookie|login|signin|signup|register|cart|checkout|account|search|blog\/|news\/|tag\/|author|\.(png|jpe?g|gif|svg|webp|pdf|xml|js|css)$)/i
const ITEM_PATH = /\/(product|products|detail|item|items|p|goods|tovar|mahsulot)\/[^/]+/i

type DemoPage = { title: string; url: string; text: string }

type DemoError = "invalid_url" | "unreachable" | "no_text" | "rate_limited"

const fail = (error: DemoError, status: number) =>
  NextResponse.json({ error }, { status })

/** Visitors type "kings.uz", not "https://kings.uz/". */
const toSafeUrl = (raw: unknown): URL | null => {
  if (typeof raw !== "string") return null

  const trimmed = raw.trim().slice(0, 500)
  if (!trimmed || /\s/.test(trimmed)) return null

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = assertSafeOutboundUrl(withProtocol)
    return url.hostname.includes(".") ? url : null
  } catch (error) {
    if (error instanceof OutboundUrlError) return null
    return null
  }
}

/** Markdown is great for reading and noisy for matching: keep the words, drop the syntax. */
const markdownToText = (markdown: string) =>
  markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_`>|]+/g, " ")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

const pickPages = (links: string[], start: URL) => {
  // "/uz/..." pasted means the owner wants the Uzbek pages, not the Russian ones.
  const langPrefix = start.pathname.match(/^\/(uz|ru|en)(\/|$)/i)?.[0] ?? ""

  const score = (href: string) => {
    const path = new URL(href).pathname.toLowerCase()
    let value = -2 * path.split("/").filter(Boolean).length
    if (HIGH_VALUE_PATH.test(path)) value += 10
    // A single product page answers one question; the store's policy pages answer many.
    if (ITEM_PATH.test(path)) value -= 14
    if (langPrefix && path.startsWith(langPrefix.toLowerCase())) value += 6
    return value
  }

  const seen = new Set([start.toString().replace(/\/$/, "")])

  return links
    .filter((href) => {
      try {
        const url = new URL(href)
        const key = url.toString().replace(/\/$/, "")
        if (url.origin !== start.origin || seen.has(key)) return false
        if (LOW_VALUE_PATH.test(url.pathname)) return false
        seen.add(key)
        return true
      } catch {
        return false
      }
    })
    .sort((a, b) => score(b) - score(a))
    .slice(0, MAX_PAGES - 1)
}

const readWithFirecrawl = async (start: URL, apiKey: string) => {
  const links = await firecrawlMap(start.toString(), apiKey)
  const urls = [start.toString(), ...pickPages(links, start)]

  const results = await Promise.allSettled(
    urls.map((url) => firecrawlScrape(url, apiKey, { timeoutMs: 25_000 }))
  )

  return results.flatMap((result): DemoPage[] => {
    if (result.status !== "fulfilled" || !result.value) return []
    const page = result.value
    return [
      {
        title: page.title || new URL(page.url).pathname,
        url: page.url,
        text: markdownToText(page.markdown).slice(0, MAX_PAGE_TEXT),
      },
    ]
  })
}

const readWithBuiltInCrawler = async (start: URL): Promise<DemoPage[]> => {
  const crawl = await crawlSite(start.toString(), { maxPages: MAX_PAGES })
  return crawl.pages.map((page) => ({
    title: page.title,
    url: page.url,
    text: page.text.slice(0, MAX_PAGE_TEXT),
  }))
}

export const POST = async (request: NextRequest) => {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null
  const start = toSafeUrl(body?.url)

  if (!start) {
    return fail("invalid_url", 400)
  }

  if (isRateLimited(getClientIp(request.headers) ?? "unknown")) {
    return fail("rate_limited", 429)
  }

  let pages: DemoPage[] = []
  const apiKey = getFirecrawlApiKey()

  try {
    pages = apiKey ? await readWithFirecrawl(start, apiKey) : []
  } catch {
    pages = []
  }

  if (pages.length === 0) {
    try {
      pages = await readWithBuiltInCrawler(start)
    } catch {
      return fail("unreachable", 502)
    }
  }

  const usable = pages.filter((page) => page.text.length >= 80)
  const passages = toPassages(usable)

  if (passages.length === 0) {
    return fail("no_text", 422)
  }

  return NextResponse.json({
    host: start.hostname.replace(/^www\./, ""),
    pageCount: usable.length,
    passages,
  })
}
