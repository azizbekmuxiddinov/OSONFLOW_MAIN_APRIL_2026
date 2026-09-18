import { getOrganizationIdFromIdentity } from "../lib/organizationIdentity"
import { ConvexError, v } from "convex/values"
import { mutation, query, action, type MutationCtx } from "../_generated/server"
import type { Id } from "../_generated/dataModel"
import { components, internal } from "../_generated/api"
import { supportAgent } from "../system/ai/agents/supportAgent"
import { paginationOptsValidator } from "convex/server"
import { saveMessage } from "@convex-dev/agent"
import { generateText } from "ai"
import { getOpenAIChatModelFromSecretValue } from "../lib/openai"
import { OPERATOR_IMAGE_UPLOAD_POLICY } from "../lib/chatAttachments"

export const enhanceResponse = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      })
    }

    const orgId = getOrganizationIdFromIdentity(identity) as string

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      })
    }

    const subscription = await ctx.runQuery(
      internal.system.subscriptions.getByOrganizationId,
      {
        organizationId: orgId,
      }
    )

    if (subscription?.status !== "active") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Missing subscription",
      })
    }

    const openAIPlugin: any = await ctx.runQuery(
      (internal as any).system.plugins.getByOrganizationIdAndService,
      {
        organizationId: orgId,
        service: "openai_realtime",
      }
    )

    const response: any = await generateText({
      model: getOpenAIChatModelFromSecretValue(openAIPlugin?.secretValue),
      system:
        "Enhance the operator's message to be more professional, clear, and helpful while maintaining their intent and key information.",
      messages: [
        {
          role: "user",
          content: args.prompt,
        },
      ],
    })

    return response.text
  },
})

/**
 * Sends a message from a person on the team: the inbox, or the developer API
 * replying on someone's behalf. Hands the conversation to people, delivers the
 * reply on whichever channel the customer wrote from, and tells webhooks.
 */
export const sendOperatorMessageForOrganization = async (
  ctx: MutationCtx,
  {
    organizationId,
    conversationId,
    prompt,
    attachmentIds = [],
    operator,
  }: {
    organizationId: string
    conversationId: Id<"conversations">
    prompt: string
    attachmentIds?: Id<"chatAttachments">[]
    operator: {
      id: string
      /** Shown as the assignee in the inbox. */
      name: string
      /** Stored on the message itself; the inbox has always used the family name. */
      agentName?: string
    }
  }
) => {
  const conversation = await ctx.db.get(conversationId)

  if (!conversation) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Conversation not found",
    })
  }

  if (conversation.organizationId !== organizationId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Invalid Organization ID",
    })
  }

  if (conversation.status === "resolved") {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Conversation resolved",
    })
  }

  if (!prompt.trim() && attachmentIds.length === 0) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Message is required",
    })
  }

  if (attachmentIds.length > OPERATOR_IMAGE_UPLOAD_POLICY.maxPerMessage) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: `You can attach up to ${OPERATOR_IMAGE_UPLOAD_POLICY.maxPerMessage} images per message.`,
    })
  }

  const now = Date.now()

  const savedMessage = await saveMessage(ctx, components.agent, {
    threadId: conversation.threadId,
    agentName: operator.agentName,
    message: {
      role: "assistant",
      content: prompt,
    },
  })

  if (attachmentIds.length > 0) {
    // Binding is what makes the uploads visible in the transcript, and it
    // re-checks that every id was uploaded by this operator for this
    // conversation and has not already been sent.
    await ctx.runMutation(internal.system.chatAttachments.bindToMessage, {
      conversationId,
      attachmentIds,
      messageId: savedMessage.messageId,
      source: "operator",
      operatorId: operator.id,
    })
  }

  await ctx.db.patch(conversationId, {
    status:
      conversation.status === "unresolved" ? "escalated" : conversation.status,
    assignedToId: conversation.assignedToId ?? operator.id,
    assignedToName: conversation.assignedToName ?? operator.name,
    assignedAt: conversation.assignedAt ?? now,
    escalatedAt:
      conversation.status === "unresolved"
        ? (conversation.escalatedAt ?? now)
        : conversation.escalatedAt,
    operatorLastReadAt: now,
    firstHumanResponseAt: conversation.firstHumanResponseAt ?? now,
    lastOperatorMessageAt: now,
    unreadForContactCount: (conversation.unreadForContactCount ?? 0) + 1,
    unreadForOperatorCount: 0,
  })

  await ctx.runMutation(
    (internal as any).system.integrationWebhooks.dispatchEvent,
    {
      organizationId,
      eventType: "message.sent",
      payload: {
        conversationId,
        threadId: conversation.threadId,
        prompt,
        operator: operator.agentName,
        attachmentCount: attachmentIds.length,
      },
    }
  )

  await ctx.scheduler.runAfter(
    0,
    (internal as any).system.telegram.sendConversationMessage,
    {
      conversationId,
      text: prompt,
      ...(attachmentIds.length > 0 ? { attachmentIds } : {}),
    }
  )

  await ctx.scheduler.runAfter(
    0,
    (internal as any).system.instagram.sendConversationMessage,
    {
      conversationId,
      text: prompt,
    }
  )

  await ctx.scheduler.runAfter(
    0,
    (internal as any).system.whatsapp.sendConversationMessage,
    {
      conversationId,
      text: prompt,
    }
  )

  await ctx.scheduler.runAfter(
    0,
    (internal as any).system.intelligence.analyzeChatConversation,
    {
      conversationId,
    }
  )

  return { messageId: savedMessage.messageId }
}

export const create = mutation({
  args: {
    prompt: v.string(),
    conversationId: v.id("conversations"),
    attachmentIds: v.optional(v.array(v.id("chatAttachments"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      })
    }

    const orgId = getOrganizationIdFromIdentity(identity) as string

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      })
    }

    await sendOperatorMessageForOrganization(ctx, {
      organizationId: orgId,
      conversationId: args.conversationId,
      prompt: args.prompt,
      attachmentIds: args.attachmentIds,
      operator: {
        id: identity.subject,
        name:
          identity.name?.trim() ?? `Operator ${identity.subject.slice(0, 8)}`,
        agentName: identity.familyName,
      },
    })
  },
})

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      })
    }

    const orgId = getOrganizationIdFromIdentity(identity) as string

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      })
    }

    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique()

    if (!conversation) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
        splitCursor: null,
      }
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      })
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    })

    return paginated
  },
})
