import { saveMessage } from "@convex-dev/agent"
import { v } from "convex/values"
import { components, internal } from "../_generated/api"
import type { Doc, Id } from "../_generated/dataModel"
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "../_generated/server"
import { personalizeMessage } from "./followUps"

/**
 * Broadcasts: one message to many customers on the messaging apps they already
 * wrote to the business from.
 *
 * The audience follows each app's rules rather than asking the owner to know
 * them: Telegram bots may write to anyone who started them, while Instagram and
 * WhatsApp only accept a free message within 24 hours of the person's last one.
 * A broadcast never opens a conversation; if the customer answers, their reply
 * does, and it starts with the broadcast so the assistant knows the context.
 */

export const BROADCAST_CHANNELS = ["telegram", "instagram", "whatsapp"] as const
export type BroadcastChannel = (typeof BROADCAST_CHANNELS)[number]

const DAY_MS = 24 * 60 * 60 * 1000
const MESSAGING_WINDOW_MS = 23.5 * 60 * 60 * 1000
export const MAX_BROADCAST_RECIPIENTS = 5000
const PREPARE_PAGE_SIZE = 250
const SEND_BATCH_SIZE = 20
/** Parallel sends inside a batch; Telegram allows about 30 per second per bot. */
const SEND_CONCURRENCY = 5

type ChannelContact =
  | Doc<"telegramContacts">
  | Doc<"instagramContacts">
  | Doc<"whatsappContacts">

const CONTACT_TABLE = {
  telegram: "telegramContacts",
  instagram: "instagramContacts",
  whatsapp: "whatsappContacts",
} as const

const INTEGRATION_TABLE = {
  telegram: "telegramIntegrations",
  instagram: "instagramIntegrations",
  whatsapp: "whatsappIntegrations",
} as const

export const firstNameOfContact = (
  channel: BroadcastChannel,
  contact: ChannelContact
) => {
  const name =
    channel === "telegram"
      ? (contact as Doc<"telegramContacts">).firstName
      : channel === "instagram"
        ? (contact as Doc<"instagramContacts">).fullName ||
          (contact as Doc<"instagramContacts">).username
        : (contact as Doc<"whatsappContacts">).profileName

  return name?.trim().split(/\s+/)[0] || undefined
}

/** Whether a contact may be written to now, under the channel's own rules. */
export const isInBroadcastAudience = (
  channel: BroadcastChannel,
  contact: ChannelContact,
  telegramActiveWithinDays: number | undefined,
  now: number
) => {
  if (channel === "telegram") {
    return telegramActiveWithinDays
      ? contact.lastMessageAt >= now - telegramActiveWithinDays * DAY_MS
      : true
  }

  return contact.lastMessageAt >= now - MESSAGING_WINDOW_MS
}

export const getCurrentIntegrationId = async (
  ctx: { db: any },
  organizationId: string,
  channel: BroadcastChannel
): Promise<string | null> => {
  const integration = await ctx.db
    .query(INTEGRATION_TABLE[channel])
    .withIndex("by_organization_id", (q: any) =>
      q.eq("organizationId", organizationId)
    )
    .first()

  return integration?.isEnabled ? String(integration._id) : null
}

/**
 * Builds the recipient list a page at a time, channel after channel, so a large
 * contact list never has to fit in one transaction. Starts sending when done.
 */
export const prepareRecipients = internalMutation({
  args: {
    broadcastId: v.id("broadcasts"),
    channelIndex: v.number(),
    cursor: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId)

    if (!broadcast || broadcast.status !== "sending") {
      return
    }

    const channels = BROADCAST_CHANNELS.filter((channel) =>
      broadcast.channels.includes(channel)
    )
    const channel = channels[args.channelIndex]

    if (!channel || broadcast.totalRecipients >= MAX_BROADCAST_RECIPIENTS) {
      await ctx.scheduler.runAfter(
        0,
        (internal as any).system.broadcasts.sendBatch,
        { broadcastId: args.broadcastId }
      )
      return
    }

    const integrationId = await getCurrentIntegrationId(
      ctx,
      broadcast.organizationId,
      channel
    )

    if (!integrationId) {
      await ctx.scheduler.runAfter(
        0,
        (internal as any).system.broadcasts.prepareRecipients,
        {
          broadcastId: args.broadcastId,
          channelIndex: args.channelIndex + 1,
          cursor: null,
        }
      )
      return
    }

    const page = await (ctx.db.query(CONTACT_TABLE[channel]) as any)
      .withIndex("by_organization_id", (q: any) =>
        q.eq("organizationId", broadcast.organizationId)
      )
      .paginate({ numItems: PREPARE_PAGE_SIZE, cursor: args.cursor })
    const now = Date.now()
    let added = 0

    for (const contact of page.page as ChannelContact[]) {
      if (broadcast.totalRecipients + added >= MAX_BROADCAST_RECIPIENTS) {
        break
      }

      if (
        String(contact.integrationId) !== integrationId ||
        !isInBroadcastAudience(
          channel,
          contact,
          broadcast.telegramActiveWithinDays,
          now
        )
      ) {
        continue
      }

      await ctx.db.insert("broadcastRecipients", {
        broadcastId: args.broadcastId,
        organizationId: broadcast.organizationId,
        channel,
        channelContactId: String(contact._id),
        contactSessionId: contact.contactSessionId,
        firstName: firstNameOfContact(channel, contact),
        status: "pending",
      })
      added += 1
    }

    await ctx.db.patch(args.broadcastId, {
      totalRecipients: broadcast.totalRecipients + added,
    })

    await ctx.scheduler.runAfter(
      0,
      (internal as any).system.broadcasts.prepareRecipients,
      page.isDone
        ? {
            broadcastId: args.broadcastId,
            channelIndex: args.channelIndex + 1,
            cursor: null,
          }
        : {
            broadcastId: args.broadcastId,
            channelIndex: args.channelIndex,
            cursor: page.continueCursor,
          }
    )
  },
})

export const getPendingBatch = internalQuery({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId)
    const recipients = await ctx.db
      .query("broadcastRecipients")
      .withIndex("by_broadcast_id_and_status", (q) =>
        q.eq("broadcastId", args.broadcastId).eq("status", "pending")
      )
      .take(SEND_BATCH_SIZE)

    return { broadcast, recipients }
  },
})

const sendOne = async (
  ctx: any,
  recipient: Doc<"broadcastRecipients">,
  text: string
): Promise<{ sent: boolean; error?: string }> => {
  const channels = (internal as any).system
  const reference =
    recipient.channel === "telegram"
      ? {
          fn: channels.telegram.sendToContact,
          args: { telegramContactId: recipient.channelContactId, text },
        }
      : recipient.channel === "instagram"
        ? {
            fn: channels.instagram.sendToContact,
            args: { instagramContactId: recipient.channelContactId, text },
          }
        : {
            fn: channels.whatsapp.sendToContact,
            args: { whatsappContactId: recipient.channelContactId, text },
          }

  try {
    return await ctx.runAction(reference.fn, reference.args)
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Send failed",
    }
  }
}

export const sendBatch = internalAction({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const { broadcast, recipients } = (await ctx.runQuery(
      (internal as any).system.broadcasts.getPendingBatch,
      { broadcastId: args.broadcastId }
    )) as {
      broadcast: Doc<"broadcasts"> | null
      recipients: Doc<"broadcastRecipients">[]
    }

    if (!broadcast || broadcast.status !== "sending") {
      return
    }

    if (recipients.length === 0) {
      await ctx.runMutation((internal as any).system.broadcasts.finish, {
        broadcastId: args.broadcastId,
      })
      return
    }

    const results: Array<{
      recipientId: Id<"broadcastRecipients">
      sent: boolean
      error?: string
      text: string
    }> = []

    for (let start = 0; start < recipients.length; start += SEND_CONCURRENCY) {
      const chunk = recipients.slice(start, start + SEND_CONCURRENCY)
      const chunkResults = await Promise.all(
        chunk.map(async (recipient) => {
          const text = personalizeMessage(broadcast.message, recipient.firstName)
          const result = await sendOne(ctx, recipient, text)

          return {
            recipientId: recipient._id,
            sent: result.sent,
            error: result.error?.slice(0, 300),
            text,
          }
        })
      )

      results.push(...chunkResults)
    }

    await ctx.runMutation((internal as any).system.broadcasts.recordResults, {
      broadcastId: args.broadcastId,
      results,
    })

    await ctx.scheduler.runAfter(
      1000,
      (internal as any).system.broadcasts.sendBatch,
      { broadcastId: args.broadcastId }
    )
  },
})

/**
 * A customer already mid-conversation gets the broadcast in that thread too,
 * so the inbox and the assistant both see it. Anyone else keeps the words on
 * their recipient row until they reply (see `carryBroadcastIntoThread`).
 */
const placeInOpenConversation = async (
  ctx: MutationCtx,
  recipient: Doc<"broadcastRecipients">,
  text: string
) => {
  const tableName = CONTACT_TABLE[recipient.channel]
  const contactId = ctx.db.normalizeId(tableName, recipient.channelContactId)
  const contact = contactId
    ? ((await ctx.db.get(contactId)) as ChannelContact | null)
    : null
  const conversation = contact?.activeConversationId
    ? await ctx.db.get(contact.activeConversationId)
    : null

  if (!conversation || conversation.status === "resolved") {
    return false
  }

  await saveMessage(ctx, components.agent, {
    threadId: conversation.threadId,
    message: { role: "assistant", content: text },
  })
  await ctx.db.patch(conversation._id, {
    unreadForContactCount: (conversation.unreadForContactCount ?? 0) + 1,
  })

  return true
}

export const recordResults = internalMutation({
  args: {
    broadcastId: v.id("broadcasts"),
    results: v.array(
      v.object({
        recipientId: v.id("broadcastRecipients"),
        sent: v.boolean(),
        error: v.optional(v.string()),
        text: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId)

    if (!broadcast) {
      return
    }

    const now = Date.now()
    let sent = 0
    let failed = 0

    for (const result of args.results) {
      const recipient = await ctx.db.get(result.recipientId)

      if (!recipient || recipient.status !== "pending") {
        continue
      }

      if (!result.sent) {
        failed += 1
        await ctx.db.patch(recipient._id, {
          status: "failed",
          error: result.error,
        })
        continue
      }

      sent += 1
      const placed = await placeInOpenConversation(ctx, recipient, result.text)

      await ctx.db.patch(recipient._id, {
        status: "sent",
        sentAt: now,
        ...(placed ? {} : { text: result.text }),
      })
    }

    await ctx.db.patch(args.broadcastId, {
      sentCount: broadcast.sentCount + sent,
      failedCount: broadcast.failedCount + failed,
    })
  },
})

export const finish = internalMutation({
  args: { broadcastId: v.id("broadcasts") },
  handler: async (ctx, args) => {
    const broadcast = await ctx.db.get(args.broadcastId)

    if (broadcast?.status === "sending") {
      await ctx.db.patch(args.broadcastId, {
        status: "sent",
        finishedAt: Date.now(),
      })
    }
  },
})
