import { ConvexError, v } from "convex/values"
import { internal } from "../_generated/api"
import { mutation, query } from "../_generated/server"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"
import { enforceRateLimit } from "../lib/rateLimits"
import {
  BROADCAST_CHANNELS,
  getCurrentIntegrationId,
  isInBroadcastAudience,
} from "../system/broadcasts"

const MAX_BROADCAST_LENGTH = 3500
/**
 * Contacts read per channel to count the audience. A query has a read budget,
 * and three channels have to fit in it; past this the page shows "at least".
 */
const AUDIENCE_SCAN_LIMIT = 4000

const channelValidator = v.union(
  v.literal("telegram"),
  v.literal("instagram"),
  v.literal("whatsapp")
)

const CONTACT_TABLE = {
  telegram: "telegramContacts",
  instagram: "instagramContacts",
  whatsapp: "whatsappContacts",
} as const

/** Who each channel would reach right now, under that channel's own rules. */
export const getAudience = query({
  args: { telegramActiveWithinDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const now = Date.now()

    const entries = await Promise.all(
      BROADCAST_CHANNELS.map(async (channel) => {
        const integrationId = await getCurrentIntegrationId(ctx, orgId, channel)

        if (!integrationId) {
          return [
            channel,
            { connected: false, count: 0, isCapped: false },
          ] as const
        }

        const contacts = await (ctx.db.query(CONTACT_TABLE[channel]) as any)
          .withIndex("by_organization_id", (q: any) =>
            q.eq("organizationId", orgId)
          )
          .take(AUDIENCE_SCAN_LIMIT)
        const count = contacts.filter(
          (contact: any) =>
            String(contact.integrationId) === integrationId &&
            isInBroadcastAudience(
              channel,
              contact,
              args.telegramActiveWithinDays,
              now
            )
        ).length

        return [
          channel,
          {
            connected: true,
            count,
            isCapped: contacts.length === AUDIENCE_SCAN_LIMIT,
          },
        ] as const
      })
    )

    return Object.fromEntries(entries) as Record<
      (typeof BROADCAST_CHANNELS)[number],
      { connected: boolean; count: number; isCapped: boolean }
    >
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    return await ctx.db
      .query("broadcasts")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .order("desc")
      .take(20)
  },
})

export const create = mutation({
  args: {
    message: v.string(),
    channels: v.array(channelValidator),
    telegramActiveWithinDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)
    const message = args.message.trim()
    const channels = BROADCAST_CHANNELS.filter((channel) =>
      args.channels.includes(channel)
    )

    if (!message) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Write the message first.",
      })
    }

    if (message.length > MAX_BROADCAST_LENGTH) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "The message is too long for Telegram.",
      })
    }

    if (channels.length === 0) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Choose at least one channel.",
      })
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique()

    if (subscription?.status !== "active") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Broadcasts are part of the paid plan.",
      })
    }

    await enforceRateLimit(ctx, "broadcastByOrg", {
      key: orgId,
      message: "You have sent several broadcasts in the last hour. Please wait a little.",
    })

    const broadcastId = await ctx.db.insert("broadcasts", {
      organizationId: orgId,
      message,
      channels,
      telegramActiveWithinDays:
        args.telegramActiveWithinDays && args.telegramActiveWithinDays > 0
          ? Math.min(365, Math.round(args.telegramActiveWithinDays))
          : undefined,
      status: "sending",
      totalRecipients: 0,
      sentCount: 0,
      failedCount: 0,
      createdBy: identity.subject,
      createdByName: identity.name ?? undefined,
      createdAt: Date.now(),
    })

    await ctx.scheduler.runAfter(
      0,
      (internal as any).system.broadcasts.prepareRecipients,
      { broadcastId, channelIndex: 0, cursor: null }
    )

    return { broadcastId }
  },
})

export const cancel = mutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const broadcast = await ctx.db.get(args.broadcastId)

    if (!broadcast || broadcast.organizationId !== orgId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Not found" })
    }

    if (broadcast.status === "sending") {
      await ctx.db.patch(args.broadcastId, {
        status: "cancelled",
        finishedAt: Date.now(),
      })
    }
  },
})
