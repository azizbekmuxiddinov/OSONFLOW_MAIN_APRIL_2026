import { ConvexError, v } from "convex/values"
import { query, mutation } from "../_generated/server"
import { getContactChannel } from "../lib/conversationChannel"
import {
  DEFAULT_FOLLOW_UP_SETTINGS,
  FOLLOW_UP_DELAY_OPTIONS_MINUTES,
} from "../lib/followUpHooks"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_FOLLOW_UP_MESSAGE_LENGTH = 1000

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const settings = await ctx.db
      .query("followUpSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique()

    return {
      enabled: settings?.enabled ?? DEFAULT_FOLLOW_UP_SETTINGS.enabled,
      delayMinutes:
        settings?.delayMinutes ?? DEFAULT_FOLLOW_UP_SETTINGS.delayMinutes,
      mode: settings?.mode ?? DEFAULT_FOLLOW_UP_SETTINGS.mode,
      message: settings?.message ?? DEFAULT_FOLLOW_UP_SETTINGS.message,
      channels: settings?.channels ?? DEFAULT_FOLLOW_UP_SETTINGS.channels,
      delayOptions: [...FOLLOW_UP_DELAY_OPTIONS_MINUTES],
    }
  },
})

export const saveSettings = mutation({
  args: {
    enabled: v.boolean(),
    delayMinutes: v.number(),
    mode: v.union(v.literal("ai"), v.literal("fixed")),
    message: v.string(),
    channels: v.object({
      widget: v.boolean(),
      telegram: v.boolean(),
      instagram: v.boolean(),
      whatsapp: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)

    if (
      !(FOLLOW_UP_DELAY_OPTIONS_MINUTES as readonly number[]).includes(
        args.delayMinutes
      )
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Choose one of the listed waiting times.",
      })
    }

    const message = args.message.trim()

    if (message.length > MAX_FOLLOW_UP_MESSAGE_LENGTH) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "The follow-up message is too long.",
      })
    }

    if (args.enabled && args.mode === "fixed" && !message) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Write the follow-up message, or let the assistant write it.",
      })
    }

    const existing = await ctx.db
      .query("followUpSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique()
    const patch = {
      enabled: args.enabled,
      delayMinutes: args.delayMinutes,
      mode: args.mode,
      message,
      channels: args.channels,
      updatedAt: Date.now(),
      updatedBy: identity.subject,
    }

    if (existing) {
      await ctx.db.patch(existing._id, patch)
    } else {
      await ctx.db.insert("followUpSettings", {
        organizationId: orgId,
        ...patch,
      })
    }
  },
})

/** The last month of follow-ups, and how many brought the customer back. */
export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const since = Date.now() - 30 * DAY_MS
    const followUps = await ctx.db
      .query("followUps")
      .withIndex("by_organization_id_and_sent_at", (q) =>
        q.eq("organizationId", orgId).gte("sentAt", since)
      )
      .order("desc")
      .take(500)

    const withOutcome = await Promise.all(
      followUps.map(async (followUp) => {
        const conversation = await ctx.db.get(followUp.conversationId)

        return {
          followUp,
          conversation,
          replied:
            (conversation?.lastCustomerMessageAt ?? 0) > followUp.sentAt,
        }
      })
    )

    const recent = await Promise.all(
      withOutcome.slice(0, 8).map(async ({ followUp, conversation, replied }) => {
        const session = conversation
          ? await ctx.db.get(conversation.contactSessionId)
          : null

        return {
          id: followUp._id,
          conversationId: followUp.conversationId,
          customerName: session?.name ?? "",
          channel: getContactChannel(session),
          text: followUp.text,
          sentAt: followUp.sentAt,
          status: followUp.status,
          replied,
        }
      })
    )

    return {
      sent: withOutcome.filter((item) => item.followUp.status === "sent")
        .length,
      replied: withOutcome.filter(
        (item) => item.followUp.status === "sent" && item.replied
      ).length,
      recent,
    }
  },
})
