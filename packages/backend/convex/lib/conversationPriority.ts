import { v, type Infer } from "convex/values"

/**
 * How urgently an operator wants a conversation handled. Set by hand in the
 * inbox; a conversation nobody has triaged has no priority at all rather than
 * a default one, so "Low" always means somebody decided it.
 */
export const conversationPriorityValidator = v.union(
  v.literal("urgent"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
)

export type ConversationPriority = Infer<typeof conversationPriorityValidator>
