import { ConvexError } from "convex/values"

/** The readable part of a Convex error, or `fallback` when there is none. */
export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ConvexError) {
    if (typeof error.data === "string" && error.data.trim()) {
      return error.data
    }

    if (
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data &&
      typeof error.data.message === "string" &&
      error.data.message.trim()
    ) {
      return error.data.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
