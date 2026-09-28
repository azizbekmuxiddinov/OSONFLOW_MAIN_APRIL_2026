import { ConvexError } from "convex/values"

/** The sentence a Convex function threw with, or `fallback` when there is none. */
export const getConvexErrorMessage = (error: unknown, fallback: string) => {
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

  return fallback
}
