import { internal } from "../_generated/api"
import type { Doc } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"

/**
 * How long a customer may stay quiet before the follow-up goes out. The longest
 * stays under a day because Instagram and WhatsApp only accept a free message
 * within 24 hours of the customer's last one.
 */
export const FOLLOW_UP_DELAY_OPTIONS_MINUTES = [
  30, 60, 120, 180, 360, 720, 1380,
] as const

export const DEFAULT_FOLLOW_UP_SETTINGS = {
  enabled: false,
  delayMinutes: 120,
  mode: "ai" as "ai" | "fixed",
  message: "",
  channels: {
    widget: true,
    telegram: true,
    instagram: true,
    whatsapp: true,
  },
}

/**
 * Called on every customer message: if the organization follows up, check back
 * once the delay has passed. The check itself decides whether the customer
 * really went quiet — a later message simply makes this run a no-op, because
 * each run carries the time of the message that scheduled it.
 */
export const scheduleFollowUpCheck = async (
  ctx: MutationCtx,
  conversation: Doc<"conversations">,
  customerMessageAt: number
) => {
  // A workflow conversation is driven by its flow; the generic assistant never
  // writes into it, and neither does a follow-up.
  if (conversation.source === "workflow" || conversation.status !== "unresolved") {
    return
  }

  const settings = await ctx.db
    .query("followUpSettings")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", conversation.organizationId)
    )
    .unique()

  if (!settings?.enabled) {
    return
  }

  await ctx.scheduler.runAfter(
    settings.delayMinutes * 60 * 1000,
    (internal as any).system.followUps.checkConversation,
    { conversationId: conversation._id, customerMessageAt }
  )
}
