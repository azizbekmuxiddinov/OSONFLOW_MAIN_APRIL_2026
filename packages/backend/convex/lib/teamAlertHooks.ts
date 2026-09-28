import { internal } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"
import { getTeamBotToken } from "./teamTelegram"

/** How long a burst of customer messages is gathered into one alert. */
const WAITING_ALERT_DELAY_MS = 8_000

type TeamAlert =
  | { kind: "handoff"; conversationId: Id<"conversations"> }
  | {
      kind: "waiting"
      conversationId: Id<"conversations">
      customerMessageAt: number
    }
  | { kind: "upset"; conversationId: Id<"conversations"> }
  | { kind: "lead"; contactSessionId: Id<"contactSessions"> }

/**
 * Schedules a Telegram team alert, but only for an organization that has
 * someone to send it to — most do not, and they should not pay for a scheduled
 * function on every message to find that out.
 */
export const scheduleTeamAlert = async (
  ctx: MutationCtx,
  organizationId: string,
  alert: TeamAlert
) => {
  if (!getTeamBotToken()) {
    return
  }

  const anyone = await ctx.db
    .query("teamTelegramLinks")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId)
    )
    .first()

  if (!anyone) {
    return
  }

  const alerts = (internal as any).system.teamAlerts

  switch (alert.kind) {
    case "handoff":
      await ctx.scheduler.runAfter(0, alerts.alertHandoff, {
        conversationId: alert.conversationId,
      })
      return
    case "waiting":
      await ctx.scheduler.runAfter(
        WAITING_ALERT_DELAY_MS,
        alerts.alertCustomerWaiting,
        {
          conversationId: alert.conversationId,
          customerMessageAt: alert.customerMessageAt,
        }
      )
      return
    case "upset":
      await ctx.scheduler.runAfter(0, alerts.alertUpset, {
        conversationId: alert.conversationId,
      })
      return
    case "lead":
      await ctx.scheduler.runAfter(0, alerts.alertLead, {
        contactSessionId: alert.contactSessionId,
      })
      return
  }
}
