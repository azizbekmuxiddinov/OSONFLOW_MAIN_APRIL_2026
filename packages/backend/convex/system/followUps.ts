import { saveMessage } from "@convex-dev/agent"
import { generateText } from "ai"
import { v } from "convex/values"
import { components, internal } from "../_generated/api"
import type { Doc, Id } from "../_generated/dataModel"
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server"
import { extractAgentMessageText } from "../lib/agentMessageText"
import { isAnonymousContactSession } from "../lib/contactSessionIdentity"
import {
  getContactChannel,
  type ConversationChannel,
} from "../lib/conversationChannel"
import { getOpenAIChatModelFromSecretValue } from "../lib/openai"
import { supportAgent } from "./ai/agents/supportAgent"

/**
 * Follow-ups: one gentle message to a customer who went quiet after the
 * assistant answered them — the price question that never became an order, the
 * booking that was never confirmed.
 *
 * At most one per conversation, only while the conversation is still open, and
 * only when the assistant spoke last: a customer waiting on the business is not
 * the customer who went quiet.
 */

/** Instagram and WhatsApp refuse a free message 24h after the customer's last. */
const MESSAGING_WINDOW_MS = 23.5 * 60 * 60 * 1000

const FOLLOW_UP_PROMPT = `You write one short follow-up message in a customer support chat. The customer went quiet after the assistant's last reply.

- Write in exactly the same language and script as the assistant's last message.
- Check in warmly: ask whether they still need help or have another question. If they were asking about buying, ordering or booking something, offer to help them finish it.
- Never invent prices, discounts, offers, dates or any fact that is not already in the conversation.
- One or two short sentences. No greeting line, no signature.
- Output only the message itself.`

const truncate = (value: string, maxLength: number) =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`

/** Fills `{name}` and tidies the gap it leaves when there is no name to use. */
export const personalizeMessage = (message: string, firstName?: string) =>
  message
    .replace(/\{\s*name\s*\}/gi, firstName?.trim() ?? "")
    .replace(/[ \t]+([,!.?])/g, "$1")
    .replace(/,+([!.?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^[ \t]*[,!.?][ \t]*/gm, "")
    .trim()

const firstNameOfSession = (session: Doc<"contactSessions"> | null) => {
  if (!session || isAnonymousContactSession(session)) {
    return undefined
  }

  return session.name.trim().split(/\s+/)[0] || undefined
}

export const getFollowUpContext = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      return null
    }

    const [session, settings, existing, subscription] = await Promise.all([
      ctx.db.get(conversation.contactSessionId),
      ctx.db
        .query("followUpSettings")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", conversation.organizationId)
        )
        .unique(),
      ctx.db
        .query("followUps")
        .withIndex("by_conversation_id", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .first(),
      ctx.db
        .query("subscriptions")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", conversation.organizationId)
        )
        .unique(),
    ])
    const messages = await supportAgent.listMessages(ctx, {
      threadId: conversation.threadId,
      excludeToolMessages: true,
      paginationOpts: { numItems: 10, cursor: null },
    })

    return {
      conversation,
      channel: getContactChannel(session),
      firstName: firstNameOfSession(session),
      settings,
      alreadyFollowedUp: existing !== null,
      hasActiveSubscription: subscription?.status === "active",
      lines: messages.page
        .map((message: any) => ({
          role: message?.message?.role as string,
          text: extractAgentMessageText(message),
        }))
        .filter(
          (line) =>
            (line.role === "user" || line.role === "assistant") &&
            line.text.trim().length > 0
        )
        .reverse(),
    }
  },
})

/**
 * Writes the follow-up from the conversation itself, in its language. Returns
 * null rather than a canned sentence when the model cannot, because a canned
 * sentence would be English in the middle of an Uzbek or Russian chat.
 */
const writeFollowUp = async (
  ctx: any,
  organizationId: string,
  lines: Array<{ role: string; text: string }>
) => {
  const lastAssistantMessage = [...lines]
    .reverse()
    .find((line) => line.role === "assistant")

  if (!lastAssistantMessage) {
    return null
  }

  const openAIPlugin = await ctx.runQuery(
    internal.system.plugins.getByOrganizationIdAndService,
    { organizationId, service: "openai_realtime" }
  )
  const transcript = lines
    .slice(-8)
    .map(
      (line) =>
        `${line.role === "user" ? "Customer" : "Assistant"}: ${truncate(line.text, 400)}`
    )
    .join("\n")

  try {
    const result = await generateText({
      model: getOpenAIChatModelFromSecretValue(openAIPlugin?.secretValue),
      maxOutputTokens: 120,
      system: FOLLOW_UP_PROMPT,
      prompt: `Conversation so far:\n${transcript}\n\nThe assistant's last message (write in this language):\n${truncate(lastAssistantMessage.text, 600)}`,
    })
    const text = result.text?.trim().replace(/^["“«]|["”»]$/g, "").trim()

    return text || null
  } catch (error) {
    console.error("Writing a follow-up failed", error)
    return null
  }
}

export const checkConversation = internalAction({
  args: {
    conversationId: v.id("conversations"),
    customerMessageAt: v.number(),
  },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(
      (internal as any).system.followUps.getFollowUpContext,
      { conversationId: args.conversationId }
    )

    if (!context?.settings?.enabled || !context.hasActiveSubscription) {
      return
    }

    const { conversation, settings, channel } = context as {
      conversation: Doc<"conversations">
      settings: Doc<"followUpSettings">
      channel: ConversationChannel
    }

    if (
      conversation.status !== "unresolved" ||
      conversation.source === "workflow" ||
      context.alreadyFollowedUp ||
      (conversation.lastCustomerMessageAt ?? 0) !== args.customerMessageAt ||
      !settings.channels[channel]
    ) {
      return
    }

    // The assistant has to have spoken last; otherwise it is the business the
    // customer is waiting on.
    if (context.lines.at(-1)?.role !== "assistant") {
      return
    }

    if (
      (channel === "instagram" || channel === "whatsapp") &&
      Date.now() - args.customerMessageAt > MESSAGING_WINDOW_MS
    ) {
      return
    }

    const text =
      settings.mode === "fixed" && settings.message.trim()
        ? personalizeMessage(settings.message, context.firstName)
        : await writeFollowUp(ctx, conversation.organizationId, context.lines)

    if (!text) {
      return
    }

    const followUpId = await ctx.runMutation(
      (internal as any).system.followUps.recordFollowUp,
      {
        conversationId: args.conversationId,
        customerMessageAt: args.customerMessageAt,
        channel,
        text,
      }
    )

    if (!followUpId || channel === "widget") {
      return
    }

    const channels = (internal as any).system
    const result = await ctx
      .runAction(channels[channel].sendConversationMessage, {
        conversationId: args.conversationId,
        text,
      })
      .catch((error: unknown) => ({
        sent: false,
        reason: error instanceof Error ? error.message : "send_failed",
      }))

    if (!result?.sent) {
      await ctx.runMutation((internal as any).system.followUps.markFailed, {
        followUpId,
        error: String(result?.reason ?? "send_failed"),
      })
    }
  },
})

/**
 * Writes the follow-up into the conversation, after checking once more — inside
 * the transaction this time — that nothing has changed since the check began.
 */
export const recordFollowUp = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    customerMessageAt: v.number(),
    channel: v.union(
      v.literal("widget"),
      v.literal("telegram"),
      v.literal("instagram"),
      v.literal("whatsapp")
    ),
    text: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"followUps"> | null> => {
    const conversation = await ctx.db.get(args.conversationId)
    const existing = await ctx.db
      .query("followUps")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .first()

    if (
      !conversation ||
      existing ||
      conversation.status !== "unresolved" ||
      (conversation.lastCustomerMessageAt ?? 0) !== args.customerMessageAt
    ) {
      return null
    }

    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      message: { role: "assistant", content: args.text },
    })
    await ctx.db.patch(conversation._id, {
      unreadForContactCount: (conversation.unreadForContactCount ?? 0) + 1,
    })

    return await ctx.db.insert("followUps", {
      organizationId: conversation.organizationId,
      conversationId: conversation._id,
      channel: args.channel,
      status: "sent",
      text: args.text,
      sentAt: Date.now(),
    })
  },
})

export const markFailed = internalMutation({
  args: { followUpId: v.id("followUps"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.followUpId, {
      status: "failed",
      error: args.error.slice(0, 300),
    })
  },
})
