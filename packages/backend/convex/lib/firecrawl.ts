/**
 * Firecrawl: reads pages the plain fetch cannot.
 *
 * Many of the sites owners paste are client-rendered (the HTML is an empty shell
 * filled in by JavaScript), so a direct fetch returns almost no text. Firecrawl
 * renders the page first and returns it as markdown. Every caller keeps its own
 * fetch as the fallback, so a missing key, an outage, or an exhausted quota only
 * costs quality, never the import itself.
 *
 * URLs are validated with `assertSafeOutboundUrl` by the caller before they get
 * here; Firecrawl fetches from its own network, not from ours.
 */

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2"
const DEFAULT_TIMEOUT_MS = 25_000

export type FirecrawlPage = {
  url: string
  title?: string
  description?: string
  markdown: string
}

export const getFirecrawlApiKey = () =>
  process.env.FIRECRAWL_API_KEY?.trim() || null

const post = async <T>(
  path: string,
  body: unknown,
  apiKey: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> => {
  const abortController = new AbortController()
  const timeout = setTimeout(() => abortController.abort(), timeoutMs)

  try {
    const response = await fetch(`${FIRECRAWL_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: abortController.signal,
    })

    if (!response.ok) {
      throw new Error(`Firecrawl ${path} responded ${response.status}`)
    }

    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

/** One page as markdown, main content only. Null when Firecrawl has nothing usable. */
export const firecrawlScrape = async (
  url: string,
  apiKey: string,
  options: { timeoutMs?: number } = {}
): Promise<FirecrawlPage | null> => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const result = await post<{
    success?: boolean
    data?: {
      markdown?: string
      metadata?: {
        title?: string
        description?: string
        url?: string
        sourceURL?: string
        statusCode?: number
      }
    }
  }>(
    "/scrape",
    {
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      // Firecrawl's own page budget, kept under ours so we get its error, not an abort.
      timeout: Math.max(5_000, timeoutMs - 3_000),
    },
    apiKey,
    timeoutMs
  )

  const markdown = result.data?.markdown?.trim()
  const metadata = result.data?.metadata
  const status = metadata?.statusCode

  if (!markdown || (status && status >= 400)) {
    return null
  }

  return {
    url: metadata?.url || metadata?.sourceURL || url,
    title: metadata?.title?.trim() || undefined,
    description: metadata?.description?.trim() || undefined,
    markdown,
  }
}

/** Links Firecrawl can find for a site (sitemap plus discovery). Empty on failure. */
export const firecrawlMap = async (
  url: string,
  apiKey: string,
  limit = 100
): Promise<string[]> => {
  try {
    const result = await post<{ links?: Array<{ url?: string } | string> }>(
      "/map",
      { url, limit },
      apiKey
    )

    return (result.links ?? [])
      .map((link) => (typeof link === "string" ? link : link.url))
      .filter((link): link is string => Boolean(link))
  } catch {
    return []
  }
}
