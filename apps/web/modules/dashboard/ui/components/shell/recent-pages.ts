/**
 * The last few dashboard pages this browser opened, newest first, so the
 * command menu can offer "back to where you were". Kept per browser; it is a
 * convenience, so a blocked or empty store simply means no recents.
 */

const STORAGE_KEY = "osonflow-recent-pages"
const LIMIT = 6

export const readRecentPages = (): string[] => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(stored)
      ? stored.filter((value): value is string => typeof value === "string")
      : []
  } catch {
    return []
  }
}

/** Remembers a page by its first path segment: `/files`, `/leads`, … */
export const recordRecentPage = (pathname: string) => {
  const segment = pathname.split("/")[1]
  if (!segment) {
    return
  }

  const url = `/${segment}`
  try {
    const next = [url, ...readRecentPages().filter((page) => page !== url)]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, LIMIT)))
  } catch {
    // Storage can be blocked; recents are then simply not remembered.
  }
}
