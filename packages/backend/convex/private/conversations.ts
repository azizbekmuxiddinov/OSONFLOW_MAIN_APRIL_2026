import { supportAgent } from "../system/ai/agents/supportAgent"
import { query, mutation, type MutationCtx } from "../_generated/server"
import { v, ConvexError } from "convex/values"
import { MessageDoc } from "@convex-dev/agent"
import {
  paginationOptsValidator,
  PaginationResult,
} from "convex/server"
import type { Doc, Id } from "../_generated/dataModel"
import { components, internal } from "../_generated/api"
import {
  belongsToOrganization,
  getOrganizationIdFromIdentity,
  requireOrganizationIdentity,
} from "../lib/organizationIdentity"
import { isAnonymousContactSession } from "../lib/contactSessionIdentity"
import {
  extractAgentMessageText,
  getLatestTextAgentMessage,
} from "../lib/agentMessageText"
import { paginateArray } from "../lib/paginateArray"
import { conversationPriorityValidator } from "../lib/conversationPriority"

const assignmentFilterValidator = v.union(
  v.literal("all"),
  v.literal("assigned_to_me"),
  v.literal("unassigned")
)

const normalizeSearchQuery = (query: string | undefined) =>
  query?.trim().toLowerCase() ?? ""

const includesSearchQuery = (
  value: string | null | undefined,
  normalizedQuery: string
) => value?.toLowerCase().includes(normalizedQuery) ?? false

const getRoleFromMessage = (message: any): "user" | "assistant" | "system" => {
  const role = message?.message?.role ?? message?.role

  if (role === "user" || role === "assistant") {
    return role
  }

  return "system"
}

const getSearchSnippet = (
  value: string | undefined,
  normalizedQuery: string
) => {
  if (!value) {
    return undefined
  }

  const matchIndex = value.toLowerCase().indexOf(normalizedQuery)

  if (matchIndex === -1) {
    return value
  }

  const contextLength = 72
  const start = Math.max(0, matchIndex - contextLength)
  const end = Math.min(
    value.length,
    matchIndex + normalizedQuery.length + contextLength
  )
  const prefix = start > 0 ? "... " : ""
  const suffix = end < value.length ? " ..." : ""

  return `${prefix}${value.slice(start, end)}${suffix}`
}

type ConversationStatus = Doc<"conversations">["status"]

/**
 * Moves a conversation to a new status on behalf of a person, from the inbox
 * or the developer API. Keeps a linked voice call in step and tells webhooks
 * and analytics about the change.
 */
export const updateConversationStatusForOrganization = async (
  ctx: MutationCtx,
  organizationId: string,
  conversationId: Id<"conversations">,
  status: ConversationStatus,
  source: "operator" | "api" = "operator"
) => {
  const conversation = await ctx.db.get(conversationId)
  if (!conversation) {
    return null
  }

  if (conversation.organizationId !== organizationId) {
    throw new ConvexError({
      code: "UNAUTHORZIED",
      message: "Invalid Organization ID",
    })
  }

  const previousStatus = conversation.status
  const now = Date.now()

  await ctx.db.patch(conversationId, {
    status,
    escalatedAt:
      status === "escalated"
        ? (conversation.escalatedAt ?? now)
        : conversation.escalatedAt,
    resolvedAt:
      status === "resolved"
        ? (conversation.resolvedAt ?? now)
        : conversation.resolvedAt,
    resolutionSource:
      status === "resolved" ? "human" : conversation.resolutionSource,
  })

  const linkedAiVoiceConversation = await ctx.db
    .query("aiVoiceConversations")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId)
    )
    .filter((q) => q.eq(q.field("linkedConversationId"), conversationId))
    .first()

  if (linkedAiVoiceConversation) {
    await ctx.db.patch(linkedAiVoiceConversation._id, {
      status,
      lastActivityAt: now,
      endedAt:
        status === "resolved"
          ? (linkedAiVoiceConversation.endedAt ?? now)
          : linkedAiVoiceConversation.endedAt,
      escalatedAt:
        status === "escalated"
          ? (linkedAiVoiceConversation.escalatedAt ?? now)
          : linkedAiVoiceConversation.escalatedAt,
      resolvedAt:
        status === "resolved"
          ? (linkedAiVoiceConversation.resolvedAt ?? now)
          : linkedAiVoiceConversation.resolvedAt,
      resolutionSource:
        status === "resolved"
          ? "human"
          : linkedAiVoiceConversation.resolutionSource,
    })
  }

  if (previousStatus !== status) {
    await ctx.runMutation(
      (internal as any).system.integrationWebhooks.dispatchEvent,
      {
        organizationId,
        eventType: "conversation.status_changed",
        payload: {
          conversationId,
          threadId: conversation.threadId,
          previousStatus,
          status,
          source,
        },
      }
    )
  }

  await ctx.scheduler.runAfter(
    0,
    (internal as any).system.intelligence.analyzeChatConversation,
    {
      conversationId,
    }
  )

  if (
    linkedAiVoiceConversation &&
    (linkedAiVoiceConversation.status ?? "unresolved") !== status
  ) {
    await ctx.scheduler.runAfter(
      0,
      (internal as any).system.intelligence.analyzeVoiceConversation,
      {
        conversationId: linkedAiVoiceConversation._id,
      }
    )
  }

  return conversation
}

export const updateStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    await updateConversationStatusForOrganization(
      ctx,
      orgId,
      args.conversationId,
      args.status
    )
  },
})

export const getOne = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation) {
      return null
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization Id",
      })
    }
    const contactSession = belongsToOrganization(
      await ctx.db.get(conversation.contactSessionId),
      orgId
    )
    if (!contactSession || isAnonymousContactSession(contactSession)) {
      return null
    }

    return {
      ...conversation,
      contactSession,
    }
  },
})

export const exportOne = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      })
    }

    const contactSession = belongsToOrganization(
      await ctx.db.get(conversation.contactSessionId),
      orgId
    )
    const messages = await supportAgent.listMessages(ctx, {
      threadId: conversation.threadId,
      paginationOpts: { numItems: 1000, cursor: null },
    })

    return {
      exportedAt: new Date().toISOString(),
      type: "conversation",
      conversation: {
        id: conversation._id,
        createdAt: new Date(conversation._creationTime).toISOString(),
        threadId: conversation.threadId,
        status: conversation.status,
        assignedToId: conversation.assignedToId ?? null,
        assignedToName: conversation.assignedToName ?? null,
        assignedAt: conversation.assignedAt
          ? new Date(conversation.assignedAt).toISOString()
          : null,
        firstCustomerMessageAt: conversation.firstCustomerMessageAt
          ? new Date(conversation.firstCustomerMessageAt).toISOString()
          : null,
        firstHumanResponseAt: conversation.firstHumanResponseAt
          ? new Date(conversation.firstHumanResponseAt).toISOString()
          : null,
        escalatedAt: conversation.escalatedAt
          ? new Date(conversation.escalatedAt).toISOString()
          : null,
        resolvedAt: conversation.resolvedAt
          ? new Date(conversation.resolvedAt).toISOString()
          : null,
        resolutionSource: conversation.resolutionSource ?? null,
      },
      contactSession: contactSession
        ? {
            id: contactSession._id,
            name: contactSession.name,
            email: contactSession.email,
            isAnonymous: contactSession.isAnonymous ?? false,
            metadata: contactSession.metadata ?? null,
          }
        : null,
      messages: messages.page
        .slice()
        .reverse()
        .map((message) => ({
          id: message._id,
          createdAt:
            typeof (message as any)._creationTime === "number"
              ? new Date((message as any)._creationTime).toISOString()
              : null,
          role: getRoleFromMessage(message),
          text: extractAgentMessageText(message),
        }))
        .filter((message) => message.text.length > 0),
    }
  },
})

/**
 * Deletes a conversation with everything hanging off it: the thread, workflow
 * runs and insights, and the links channel contacts and voice calls keep to it.
 */
export const removeConversationForOrganization = async (
  ctx: MutationCtx,
  organizationId: string,
  conversationId: Id<"conversations">
) => {
  const conversation = await ctx.db.get(conversationId)

  if (!conversation) {
    return false
  }

  if (conversation.organizationId !== organizationId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Invalid Organization ID",
    })
  }

  const workflowSessions = await ctx.db
    .query("workflowSessions")
    .withIndex("by_conversation_id", (q) =>
      q.eq("conversationId", conversationId)
    )
    .collect()

  const insights = await ctx.db
    .query("conversationInsights")
    .withIndex("by_conversation_id", (q) =>
      q.eq("conversationId", conversationId)
    )
    .collect()

  const linkedVoiceConversations = await ctx.db
    .query("aiVoiceConversations")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId)
    )
    .filter((q) => q.eq(q.field("linkedConversationId"), conversationId))
    .collect()

  const telegramContacts = await ctx.db
    .query("telegramContacts")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId)
    )
    .filter((q) => q.eq(q.field("activeConversationId"), conversationId))
    .collect()

  const instagramContacts = await ctx.db
    .query("instagramContacts")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId)
    )
    .filter((q) => q.eq(q.field("activeConversationId"), conversationId))
    .collect()

  await Promise.all([
    ctx.runMutation(components.agent.threads.deleteAllForThreadIdAsync, {
      threadId: conversation.threadId,
      limit: 100,
    }),
    ...workflowSessions.map((session) => ctx.db.delete(session._id)),
    ...insights.map((insight) => ctx.db.delete(insight._id)),
    ...linkedVoiceConversations.map((voiceConversation) =>
      ctx.db.patch(voiceConversation._id, {
        linkedConversationId: undefined,
      })
    ),
    ...telegramContacts.map((contact) =>
      ctx.db.patch(contact._id, {
        activeConversationId: undefined,
      })
    ),
    ...instagramContacts.map((contact) =>
      ctx.db.patch(contact._id, {
        activeConversationId: undefined,
      })
    ),
  ])

  await ctx.db.delete(conversationId)
  return true
}

export const remove = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    await removeConversationForOrganization(ctx, orgId, args.conversationId)
  },
})

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      return
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID",
      })
    }

    await ctx.runMutation(internal.system.conversations.markOperatorRead, {
      conversationId: args.conversationId,
    })
  },
})

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect()

    const timestamp = Date.now()
    await Promise.all(
      conversations
        .filter(
          (conversation) => (conversation.unreadForOperatorCount ?? 0) > 0
        )
        .map((conversation) =>
          ctx.db.patch(conversation._id, {
            operatorLastReadAt: timestamp,
            unreadForOperatorCount: 0,
          })
        )
    )
  },
})

export const getUnreadSummary = query({
  args: {
    excludeConversationId: v.optional(v.string()),
  },
  returns: v.object({
    unreadConversationCount: v.number(),
    unreadMessageCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const orgId = identity
      ? getOrganizationIdFromIdentity(identity)
      : undefined

    if (!orgId) {
      return {
        unreadConversationCount: 0,
        unreadMessageCount: 0,
      }
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .take(2000)

    const unreadConversations = conversations.filter(
      (conversation) =>
        (conversation.unreadForOperatorCount ?? 0) > 0 &&
        conversation._id !== args.excludeConversationId
    )

    const unreadMessageCount = unreadConversations.reduce(
      (total, conversation) =>
        total + (conversation.unreadForOperatorCount ?? 0),
      0
    )

    return {
      unreadConversationCount: unreadConversations.length,
      unreadMessageCount: Number.isFinite(unreadMessageCount)
        ? unreadMessageCount
        : 0,
    }
  },
})

export const updateAssignment = mutation({
  args: {
    conversationId: v.id("conversations"),
    action: v.union(
      v.literal("assign_to_me"),
      v.literal("take_over"),
      v.literal("unassign")
    ),
  },
  handler: async (ctx, args) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORZIED",
        message: "Invalid Organization ID",
      })
    }

    if (args.action === "unassign") {
      await ctx.db.patch(args.conversationId, {
        assignedToId: null,
        assignedToName: null,
        assignedAt: null,
      })
      return
    }

    const operatorName =
      identity.name?.trim() || `Operator ${identity.subject.slice(0, 8)}`

    await ctx.db.patch(args.conversationId, {
      assignedToId: identity.subject,
      assignedToName: operatorName,
      assignedAt: Date.now(),
    })
  },
})

export const updatePriority = mutation({
  args: {
    conversationId: v.id("conversations"),
    /** null clears the priority. */
    priority: v.union(conversationPriorityValidator, v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation || conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    await ctx.db.patch(args.conversationId, { priority: args.priority })

    return null
  },
})

export const getMany = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchQuery: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("unresolved"),
        v.literal("escalated"),
        v.literal("resolved")
      )
    ),
    assignmentFilter: v.optional(assignmentFilterValidator),
    /** Which surface started the conversation; "all" mixes both. */
    sourceFilter: v.optional(
      v.union(v.literal("all"), v.literal("workflow"), v.literal("widget"))
    ),
    /** "prioritized" keeps only conversations an operator gave a priority. */
    priorityFilter: v.optional(
      v.union(v.literal("all"), v.literal("prioritized"))
    ),
  },
  handler: async (ctx, args) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)

    const assignmentFilter = args.assignmentFilter ?? "all"
    const sourceFilter = args.sourceFilter ?? "all"
    const normalizedSearchQuery = normalizeSearchQuery(args.searchQuery)

    let conversations: PaginationResult<Doc<"conversations">> | null = null
    let sourceConversations: Doc<"conversations">[]

    if (normalizedSearchQuery) {
      sourceConversations = await ctx.db
        .query("conversations")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
        .order("desc")
        .collect()
    } else {
      const baseQuery =
        assignmentFilter === "assigned_to_me"
          ? args.status
            ? ctx.db
                .query("conversations")
                .withIndex(
                  "by_status_and_organization_id_and_assigned_to",
                  (q) =>
                    q
                      .eq("status", args.status as Doc<"conversations">["status"])
                      .eq("organizationId", orgId)
                      .eq("assignedToId", identity.subject)
                )
            : ctx.db
                .query("conversations")
                .withIndex("by_organization_id_and_assigned_to", (q) =>
                  q
                    .eq("organizationId", orgId)
                    .eq("assignedToId", identity.subject)
                )
          : args.status
            ? ctx.db
                .query("conversations")
                .withIndex("by_status_and_organization_id", (q) =>
                  q
                    .eq("status", args.status as Doc<"conversations">["status"])
                    .eq("organizationId", orgId)
                )
            : ctx.db
                .query("conversations")
                .withIndex("by_organization_id", (q) =>
                  q.eq("organizationId", orgId)
                )

      // Narrow filters run inside the scan so every page comes back full.
      // Filtering after .paginate() returned mostly-empty pages, which made
      // the infinite-scroll trigger chain loads until the table ran out.
      conversations = await baseQuery
        .order("desc")
        .filter((q) => {
          const conditions = []
          if (args.priorityFilter === "prioritized") {
            conditions.push(
              q.and(
                q.neq(q.field("priority"), undefined),
                q.neq(q.field("priority"), null)
              )
            )
          }
          if (assignmentFilter === "unassigned") {
            conditions.push(
              q.or(
                q.eq(q.field("assignedToId"), undefined),
                q.eq(q.field("assignedToId"), null)
              )
            )
          }
          if (sourceFilter === "workflow") {
            conditions.push(q.eq(q.field("source"), "workflow"))
          } else if (sourceFilter === "widget") {
            conditions.push(q.neq(q.field("source"), "workflow"))
          }
          return conditions.length > 0 ? q.and(...conditions) : true
        })
        .paginate(args.paginationOpts)

      sourceConversations = conversations.page
    }

    const conversationsWithAdditionalData = await Promise.all(
      sourceConversations.map(async (conversation) => {
        let lastMessage: MessageDoc | null = null
        let searchMatchPreview: string | undefined

        const contactSession = belongsToOrganization(
          await ctx.db.get(conversation.contactSessionId),
          orgId
        )

        const conversationSource = conversation.source ?? "widget"

        if (sourceFilter !== "all" && conversationSource !== sourceFilter) {
          return null
        }

        if (!contactSession) {
          return null
        }

        // A workflow conversation is anonymous on purpose — the widget opens
        // straight into the flow without asking for details — so it must not
        // be hidden by the anonymous filter the assistant inbox uses.
        if (
          conversationSource !== "workflow" &&
          isAnonymousContactSession(contactSession)
        ) {
          return null
        }

        const messages = await supportAgent.listMessages(ctx, {
          threadId: conversation.threadId,
          excludeToolMessages: true,
          paginationOpts: { numItems: 20, cursor: null },
        })

        lastMessage = getLatestTextAgentMessage(messages.page)

        if (normalizedSearchQuery) {
          const searchableFields = [
            contactSession.name,
            contactSession.email,
            lastMessage?.text,
            conversation.assignedToName,
            conversation.assignedToId === identity.subject
              ? "assigned to me"
              : undefined,
            conversation.status,
            conversation.priority,
          ]

          const fieldMatch = searchableFields.some((value) =>
            includesSearchQuery(value, normalizedSearchQuery)
          )

          if (fieldMatch) {
            searchMatchPreview = getSearchSnippet(
              lastMessage?.text,
              normalizedSearchQuery
            )
          } else {
            const matchedMessages = await ctx.runQuery(
              components.agent.messages.textSearch,
              {
                threadId: conversation.threadId,
                text: args.searchQuery!.trim(),
                limit: 1,
              }
            )

            const matchedMessageText = matchedMessages[0]?.text

            if (!matchedMessageText) {
              return null
            }

            searchMatchPreview = getSearchSnippet(
              matchedMessageText,
              normalizedSearchQuery
            )
          }
        }

        return {
          ...conversation,
          contactSession,
          lastMessage,
          searchMatchPreview,
        }
      })
    )

    const validConversations = conversationsWithAdditionalData.filter(
      (conv): conv is NonNullable<typeof conv> => conv !== null
    )

    const filteredConversations = validConversations.filter((conversation) => {
      if (assignmentFilter === "unassigned" && conversation.assignedToId) {
        return false
      }

      if (args.priorityFilter === "prioritized" && !conversation.priority) {
        return false
      }

      if (
        normalizedSearchQuery &&
        args.status &&
        conversation.status !== args.status
      ) {
        return false
      }

      if (
        normalizedSearchQuery &&
        assignmentFilter === "assigned_to_me" &&
        conversation.assignedToId !== identity.subject
      ) {
        return false
      }

      return true
    })

    if (normalizedSearchQuery) {
      return paginateArray(filteredConversations, args.paginationOpts)
    }

    return {
      ...conversations!,
      page: filteredConversations,
    }
  },
})
