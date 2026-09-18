import { v } from "convex/values"

import type { Doc, Id } from "../../_generated/dataModel"
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "../../_generated/server"
import { internal } from "../../_generated/api"
import { supportAgent } from "../ai/agents/supportAgent"
import { conversationPriorityValidator } from "../../lib/conversationPriority"
import { getLatestTextAgentMessage } from "../../lib/agentMessageText"
import {
  removeConversationForOrganization,
  updateConversationStatusForOrganization,
} from "../../private/conversations"
import { sendOperatorMessageForOrganization } from "../../private/messages"
import { createConversationForContact } from "../../public/conversations"
import {
  isVisibleMessage,
  serializeConversation,
  serializeMessage,
} from "../../lib/developerApi/serialize"
import { reviveContactSession } from "./contacts"
import {
  badRequest,
  notFound,
  paginationArgs,
  requireOwnedDoc,
  toPaginationOpts,
} from "./shared"

const statusValidator = v.union(
  v.literal("unresolved"),
  v.literal("escalated"),
  v.literal("resolved")
)

/** How far back a turn's replies are looked for after it finishes. */
const TURN_MESSAGE_SCAN = 50

const loadConversation = async (
  ctx: QueryCtx | MutationCtx,
  conversation: Doc<"conversations">,
  lastMessage?: ReturnType<typeof serializeMessage> | null
) => {
  const [contact, workflowSession] = await Promise.all([
    ctx.db.get(conversation.contactSessionId),
    conversation.source === "workflow"
      ? ctx.db
          .query("workflowSessions")
          .withIndex("by_conversation_id", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .first()
      : null,
  ])

  return serializeConversation(conversation, {
    contact:
      contact && contact.organizationId === conversation.organizationId
        ? contact
        : null,
    workflowSession,
    lastMessage,
  })
}

const attachmentsByMessage = async (
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">
) => {
  const attachments = await ctx.db
    .query("chatAttachments")
    .withIndex("by_conversation_id", (q) =>
      q.eq("conversationId", conversationId)
    )
    .collect()
  const byMessage = new Map<string, Doc<"chatAttachments">[]>()

  for (const attachment of attachments) {
    if (!attachment.messageId) {
      continue
    }

    const existing = byMessage.get(attachment.messageId) ?? []
    existing.push(attachment)
    byMessage.set(attachment.messageId, existing)
  }

  return byMessage
}

export const list = internalQuery({
  args: {
    organizationId: v.string(),
    status: v.optional(statusValidator),
    source: v.optional(v.union(v.literal("widget"), v.literal("workflow"))),
    contactId: v.optional(v.string()),
    assigned: v.optional(
      v.union(v.literal("assigned"), v.literal("unassigned"))
    ),
    includeLastMessage: v.boolean(),
    ...paginationArgs,
  },
  handler: async (ctx, args) => {
    const paginationOpts = toPaginationOpts(args)
    let result

    if (args.contactId) {
      const contact = await requireOwnedDoc(
        ctx,
        "contactSessions",
        args.contactId,
        args.organizationId,
        "Contact"
      )
      result = await ctx.db
        .query("conversations")
        .withIndex("by_contact_session_id", (q) =>
          q.eq("contactSessionId", contact._id)
        )
        .order("desc")
        .paginate(paginationOpts)
    } else if (args.status) {
      const status = args.status
      result = await ctx.db
        .query("conversations")
        .withIndex("by_status_and_organization_id", (q) =>
          q.eq("status", status).eq("organizationId", args.organizationId)
        )
        .order("desc")
        .paginate(paginationOpts)
    } else {
      result = await ctx.db
        .query("conversations")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId)
        )
        .order("desc")
        .paginate(paginationOpts)
    }

    const matching = result.page.filter((conversation) => {
      if (conversation.organizationId !== args.organizationId) {
        return false
      }

      if (args.status && conversation.status !== args.status) {
        return false
      }

      if (args.source && (conversation.source ?? "widget") !== args.source) {
        return false
      }

      if (args.assigned === "assigned" && !conversation.assignedToId) {
        return false
      }

      if (args.assigned === "unassigned" && conversation.assignedToId) {
        return false
      }

      return true
    })

    const items = await Promise.all(
      matching.map(async (conversation) => {
        if (!args.includeLastMessage) {
          return await loadConversation(ctx, conversation)
        }

        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          excludeToolMessages: true,
          paginationOpts: { numItems: 20, cursor: null },
        })
        const latest = getLatestTextAgentMessage(messages.page)

        return await loadConversation(
          ctx,
          conversation,
          latest ? serializeMessage(latest) : null
        )
      })
    )

    return {
      items,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    }
  },
})

export const get = internalQuery({
  args: { organizationId: v.string(), conversationId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "conversations",
      args.conversationId,
      args.organizationId,
      "Conversation"
    )

    return await loadConversation(ctx, conversation)
  },
})

/**
 * Opens a conversation for the API's first message. The message itself is
 * sent right after, by the same call, so a conversation never exists without
 * one; if sending fails, `discard` takes it away again.
 */
export const create = internalMutation({
  args: {
    organizationId: v.string(),
    contactId: v.string(),
    assistantId: v.optional(v.string()),
    greeting: v.boolean(),
  },
  handler: async (ctx, args) => {
    const contact = await requireOwnedDoc(
      ctx,
      "contactSessions",
      args.contactId,
      args.organizationId,
      "Contact"
    )

    if (args.assistantId && args.assistantId !== "default") {
      const assistant = await ctx.db
        .query("widgetSettings")
        .withIndex("by_organization_id_and_agent_id", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("agentId", args.assistantId)
        )
        .unique()

      if (!assistant) {
        throw notFound("Assistant")
      }
    }

    await reviveContactSession(ctx, contact)

    return await createConversationForContact(
      ctx,
      {
        organizationId: args.organizationId,
        agentId: args.assistantId,
        contactSessionId: contact._id,
      },
      { enforceWidgetRateLimit: false, includeGreeting: args.greeting }
    )
  },
})

export const discard = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await removeConversationForOrganization(
      ctx,
      args.organizationId,
      args.conversationId
    )
  },
})

/** Checks a conversation can take a customer message and returns its thread. */
export const prepareCustomerMessage = internalMutation({
  args: { organizationId: v.string(), conversationId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "conversations",
      args.conversationId,
      args.organizationId,
      "Conversation"
    )

    if (conversation.status === "resolved") {
      throw badRequest(
        "This conversation is resolved and cannot take new messages. Start a new conversation instead."
      )
    }

    const contact = await ctx.db.get(conversation.contactSessionId)

    if (!contact || contact.organizationId !== args.organizationId) {
      throw notFound("Contact")
    }

    await reviveContactSession(ctx, contact)

    return {
      conversationId: conversation._id,
      threadId: conversation.threadId,
      contactSessionId: contact._id,
    }
  },
})

/**
 * The conversation after a turn, with the messages written since `since`, in
 * the order they were written. `since` of 0 returns the whole of a new
 * conversation, greeting included.
 */
export const afterTurn = internalQuery({
  args: {
    organizationId: v.string(),
    conversationId: v.id("conversations"),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation || conversation.organizationId !== args.organizationId) {
      throw notFound("Conversation")
    }

    const [recent, attachments] = await Promise.all([
      supportAgent.listMessages(ctx, {
        threadId: conversation.threadId,
        excludeToolMessages: true,
        paginationOpts: { numItems: TURN_MESSAGE_SCAN, cursor: null },
      }),
      attachmentsByMessage(ctx, conversation._id),
    ])

    const messages = recent.page
      .filter((message: any) => message._creationTime >= args.since)
      .filter((message: any) =>
        isVisibleMessage(message, attachments.get(String(message._id)))
      )
      .reverse()
      .map((message: any) =>
        serializeMessage(message, attachments.get(String(message._id)))
      )

    return {
      conversation: await loadConversation(ctx, conversation),
      messages,
    }
  },
})

export const messages = internalQuery({
  args: {
    organizationId: v.string(),
    conversationId: v.string(),
    ...paginationArgs,
  },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "conversations",
      args.conversationId,
      args.organizationId,
      "Conversation"
    )
    const [result, attachments] = await Promise.all([
      supportAgent.listMessages(ctx, {
        threadId: conversation.threadId,
        excludeToolMessages: true,
        paginationOpts: toPaginationOpts(args),
      }),
      attachmentsByMessage(ctx, conversation._id),
    ])

    return {
      items: result.page
        .filter((message: any) =>
          isVisibleMessage(message, attachments.get(String(message._id)))
        )
        .map((message: any) =>
          serializeMessage(message, attachments.get(String(message._id)))
        ),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    }
  },
})

export const update = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.string(),
    status: v.optional(statusValidator),
    priority: v.optional(v.union(conversationPriorityValidator, v.null())),
    assignee: v.optional(
      v.union(v.object({ id: v.string(), name: v.string() }), v.null())
    ),
  },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "conversations",
      args.conversationId,
      args.organizationId,
      "Conversation"
    )

    if (args.status !== undefined && args.status !== conversation.status) {
      await updateConversationStatusForOrganization(
        ctx,
        args.organizationId,
        conversation._id,
        args.status,
        "api"
      )
    }

    if (args.priority !== undefined) {
      await ctx.db.patch(conversation._id, { priority: args.priority })
    }

    if (args.assignee !== undefined) {
      await ctx.db.patch(
        conversation._id,
        args.assignee
          ? {
              assignedToId: args.assignee.id,
              assignedToName: args.assignee.name,
              assignedAt: Date.now(),
            }
          : { assignedToId: null, assignedToName: null, assignedAt: null }
      )
    }

    return await loadConversation(ctx, (await ctx.db.get(conversation._id))!)
  },
})

export const remove = internalMutation({
  args: { organizationId: v.string(), conversationId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "conversations",
      args.conversationId,
      args.organizationId,
      "Conversation"
    )

    await removeConversationForOrganization(
      ctx,
      args.organizationId,
      conversation._id
    )

    return { id: conversation._id, object: "conversation", deleted: true }
  },
})

export const reply = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.string(),
    text: v.string(),
    authorId: v.string(),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "conversations",
      args.conversationId,
      args.organizationId,
      "Conversation"
    )

    if (conversation.status === "resolved") {
      throw badRequest(
        "This conversation is resolved. Reopen it by setting its status before replying."
      )
    }

    await sendOperatorMessageForOrganization(ctx, {
      organizationId: args.organizationId,
      conversationId: conversation._id,
      prompt: args.text,
      operator: {
        id: args.authorId,
        name: args.authorName,
        agentName: args.authorName,
      },
    })

    return { conversationId: conversation._id }
  },
})

export const markRead = internalMutation({
  args: { organizationId: v.string(), conversationId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "conversations",
      args.conversationId,
      args.organizationId,
      "Conversation"
    )

    await ctx.runMutation(internal.system.conversations.markOperatorRead, {
      conversationId: conversation._id,
    })

    return await loadConversation(ctx, (await ctx.db.get(conversation._id))!)
  },
})
