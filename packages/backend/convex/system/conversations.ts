import { v, ConvexError } from "convex/values"
import { internalQuery, internalMutation } from "../_generated/server"
import { internal } from "../_generated/api"
import { scheduleFollowUpCheck } from "../lib/followUpHooks"
import { scheduleTeamAlert } from "../lib/teamAlertHooks"
import { supportAgent } from "./ai/agents/supportAgent"

export const escalate = internalMutation({
  args: {
    threadId: v.string(),
    // Who asked for a person: the assistant deciding it cannot help, or the
    // visitor pressing the widget's "Talk to a person" button.
    source: v.optional(v.union(v.literal("ai"), v.literal("visitor"))),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique()

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    const previousStatus = conversation.status

    await ctx.db.patch(conversation._id, {
      status: "escalated",
      escalatedAt: conversation.escalatedAt ?? Date.now(),
    })

    if (previousStatus !== "escalated") {
      await ctx.runMutation(
        (internal as any).system.integrationWebhooks.dispatchEvent,
        {
          organizationId: conversation.organizationId,
          eventType: "conversation.status_changed",
          payload: {
            conversationId: conversation._id,
            threadId: args.threadId,
            previousStatus,
            status: "escalated",
            source: args.source ?? "ai",
          },
        }
      )

      await scheduleTeamAlert(ctx, conversation.organizationId, {
        kind: "handoff",
        conversationId: conversation._id,
      })
    }
  },
})

export const resolve = internalMutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique()

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    const previousStatus = conversation.status

    await ctx.db.patch(conversation._id, {
      status: "resolved",
      resolvedAt: conversation.resolvedAt ?? Date.now(),
      resolutionSource: "ai",
    })

    if (previousStatus !== "resolved") {
      await ctx.runMutation(
        (internal as any).system.integrationWebhooks.dispatchEvent,
        {
          organizationId: conversation.organizationId,
          eventType: "conversation.status_changed",
          payload: {
            conversationId: conversation._id,
            threadId: args.threadId,
            previousStatus,
            status: "resolved",
            source: "ai",
          },
        }
      )
    }
  },
})

export const markContactRead = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    await ctx.db.patch(args.conversationId, {
      contactLastReadAt: args.timestamp ?? Date.now(),
      unreadForContactCount: 0,
    })
  },
})

export const markOperatorRead = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    await ctx.db.patch(args.conversationId, {
      operatorLastReadAt: args.timestamp ?? Date.now(),
      unreadForOperatorCount: 0,
    })
  },
})

export const touchCustomerMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    timestamp: v.optional(v.number()),
    incrementOperatorUnread: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    const timestamp = args.timestamp ?? Date.now()
    const incrementOperatorUnread = args.incrementOperatorUnread ?? true

    await ctx.db.patch(args.conversationId, {
      lastCustomerMessageAt: timestamp,
      firstCustomerMessageAt: conversation.firstCustomerMessageAt ?? timestamp,
      contactLastReadAt: timestamp,
      unreadForContactCount: 0,
      operatorLastReadAt: incrementOperatorUnread
        ? conversation.operatorLastReadAt
        : timestamp,
      unreadForOperatorCount: incrementOperatorUnread
        ? (conversation.unreadForOperatorCount ?? 0) + 1
        : 0,
    })

    await scheduleFollowUpCheck(ctx, conversation, timestamp)

    // With the team: someone should see this without opening the dashboard.
    if (conversation.status === "escalated") {
      await scheduleTeamAlert(ctx, conversation.organizationId, {
        kind: "waiting",
        conversationId: conversation._id,
        customerMessageAt: timestamp,
      })
    }
  },
})

export const touchAssistantMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      })
    }

    const timestamp = args.timestamp ?? Date.now()

    await ctx.db.patch(args.conversationId, {
      lastOperatorMessageAt: timestamp,
      unreadForContactCount: (conversation.unreadForContactCount ?? 0) + 1,
    })
  },
})

export const getByThreadId = internalQuery({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
      .unique()

    return conversation
  },
})
