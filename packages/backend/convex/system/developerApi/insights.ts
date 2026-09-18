import { v } from "convex/values"

import { internalQuery } from "../../_generated/server"
import { getAnalyticsOverviewForOrganization } from "../../private/analytics"
import { getLeadSummaryForOrganization } from "../../private/leads"
import { withLinkedHandoffStatus } from "../../private/aiConversations"
import {
  serializeInsight,
  serializeVoiceConversation,
  serializeVoiceMessage,
} from "../../lib/developerApi/serialize"
import { sumUsage, utcDay } from "./gate"
import { paginationArgs, requireOwnedDoc, toPaginationOpts } from "./shared"

/* ── analytics ───────────────────────────────────────────────────────────── */

export const overview = internalQuery({
  args: { organizationId: v.string(), windowDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const overview = await getAnalyticsOverviewForOrganization(
      ctx,
      args.organizationId,
      { windowDays: args.windowDays }
    )

    return {
      object: "analytics_overview" as const,
      windowDays: overview.windowDays,
      totalConversations: overview.totalConversations,
      resolved: overview.resolved,
      escalated: overview.escalated,
      unanswered: overview.unanswered,
      resolutionRate: overview.resolutionRate,
      escalationRate: overview.escalationRate,
      unansweredRate: overview.unansweredRate,
      averageTeamResponseMs: overview.averageHumanResponseMs,
      minutesSaved: overview.humanSavedMinutes,
      topIntents: overview.topIntents,
      sentimentMix: overview.sentimentMix,
      urgencyMix: overview.urgencyMix,
      unansweredQuestions: overview.unansweredQuestions,
      channels: overview.channelMetrics,
    }
  },
})

export const insightsPage = internalQuery({
  args: { organizationId: v.string(), ...paginationArgs },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("conversationInsights")
      .withIndex("by_organization_id_and_updated_at", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .paginate(toPaginationOpts(args))

    return {
      items: result.page.map(serializeInsight),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    }
  },
})

export const leadSummary = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const summary = await getLeadSummaryForOrganization(
      ctx,
      args.organizationId
    )

    return {
      object: "lead_summary" as const,
      totalLeads: summary.totalLeads,
      newcomers: summary.newcomerCount,
      withConversations: summary.withConversationsCount,
      awaitingReply: summary.awaitingReplyCount,
      withoutChats: summary.noChatsCount,
      channels: summary.channelCounts,
      topReferrers: summary.topReferrers,
      topPages: summary.topPages,
    }
  },
})

/* ── voice ───────────────────────────────────────────────────────────────── */

export const voicePage = internalQuery({
  args: { organizationId: v.string(), ...paginationArgs },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("aiVoiceConversations")
      .withIndex("by_organization_id_and_last_activity_at", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .paginate(toPaginationOpts(args))

    const items = await Promise.all(
      result.page.map(async (conversation) => {
        const synced = await withLinkedHandoffStatus(
          ctx,
          conversation,
          args.organizationId
        )
        const contact = await ctx.db.get(conversation.contactSessionId)

        return serializeVoiceConversation(
          synced,
          contact?.organizationId === args.organizationId ? contact : null
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

export const voiceGet = internalQuery({
  args: { organizationId: v.string(), voiceConversationId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "aiVoiceConversations",
      args.voiceConversationId,
      args.organizationId,
      "Voice conversation"
    )
    const synced = await withLinkedHandoffStatus(
      ctx,
      conversation,
      args.organizationId
    )
    const contact = await ctx.db.get(conversation.contactSessionId)

    return serializeVoiceConversation(
      synced,
      contact?.organizationId === args.organizationId ? contact : null
    )
  },
})

export const voiceMessages = internalQuery({
  args: {
    organizationId: v.string(),
    voiceConversationId: v.string(),
    ...paginationArgs,
  },
  handler: async (ctx, args) => {
    const conversation = await requireOwnedDoc(
      ctx,
      "aiVoiceConversations",
      args.voiceConversationId,
      args.organizationId,
      "Voice conversation"
    )
    const result = await ctx.db
      .query("aiVoiceConversationMessages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", conversation._id)
      )
      .order("desc")
      .paginate(toPaginationOpts(args))

    return {
      items: result.page.map(serializeVoiceMessage),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    }
  },
})

/* ── usage ───────────────────────────────────────────────────────────────── */

export const usageToday = internalQuery({
  args: {
    organizationId: v.string(),
    keyId: v.id("developerApiKeys"),
  },
  handler: async (ctx, args) => {
    const day = utcDay(Date.now())
    const rows = await ctx.db
      .query("developerApiUsage")
      .withIndex("by_organization_id_and_day", (q) =>
        q.eq("organizationId", args.organizationId).eq("day", day)
      )
      .collect()

    return {
      day,
      organization: sumUsage(rows),
      key: sumUsage(rows.filter((row) => row.keyId === args.keyId)),
    }
  },
})
