import { saveMessage } from "@convex-dev/agent"
import { components } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"

/** A broadcast older than this is not what the customer is answering. */
const BROADCAST_CONTEXT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

/**
 * Opens a new conversation with the broadcast the customer is replying to, so
 * the assistant — and the team reading the inbox — knows what "yes, how much?"
 * refers to. A broadcast never creates a conversation by itself; this is where
 * it joins one, once the customer has actually written.
 *
 * Each broadcast is carried into one conversation only: the stored words are
 * cleared once used.
 */
export const carryBroadcastIntoThread = async (
  ctx: MutationCtx,
  {
    contactSessionId,
    threadId,
  }: { contactSessionId: Id<"contactSessions">; threadId: string }
) => {
  const recent = await ctx.db
    .query("broadcastRecipients")
    .withIndex("by_contact_session_id", (q) =>
      q.eq("contactSessionId", contactSessionId)
    )
    .order("desc")
    .take(5)
  const latest = recent.find(
    (recipient) =>
      recipient.status === "sent" &&
      recipient.text &&
      (recipient.sentAt ?? 0) > Date.now() - BROADCAST_CONTEXT_WINDOW_MS
  )

  if (!latest?.text) {
    return
  }

  await saveMessage(ctx, components.agent, {
    threadId,
    message: { role: "assistant", content: latest.text },
  })
  await ctx.db.patch(latest._id, { text: undefined })
}
