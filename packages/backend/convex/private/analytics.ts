import { getOrganizationIdFromIdentity } from "../lib/organizationIdentity"
import { paginationOptsValidator } from "convex/server"
import { ConvexError, v } from "convex/values"
import { query, QueryCtx } from "../_generated/server"

const ANALYTICS_EXPORT_LIMIT = 5000

const getOrganizationId = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity()

  if (identity === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Identity not found",
    })
  }

  const organizationId = getOrganizationIdFromIdentity(identity)

  if (!organizationId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Organization not found",
    })
  }

  return organizationId
}

const percentage = (value: number, total: number) => {
  if (total === 0) {
    return 0
  }

  return Math.round((value / total) * 100)
}

const average = (values: number[]) => {
  if (values.length === 0) {
    return null
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  )
}

const groupCounts = <T extends string>(values: T[]) => {
  const counts = new Map<T, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Insights are read newest first, capped so the query stays cheap. */
const INSIGHT_SCAN_LIMIT = 1000

/**
 * One exclusive outcome per conversation. The flags can overlap (escalated,
 * then resolved), so resolution wins, then the hand-off, and the rest is open.
 */
const outcomeOf = (insight: { wasResolved: boolean; wasEscalated: boolean }) =>
  insight.wasResolved ? "resolved" : insight.wasEscalated ? "handed" : "open"

export const getAnalyticsOverviewForOrganization = async (
  ctx: QueryCtx,
  organizationId: string,
  args: { windowDays?: number; utcOffsetMinutes?: number }
) => {
  const windowDays = Math.max(1, Math.min(args.windowDays ?? 30, 365))
  const now = Date.now()
  const cutoff = now - windowDays * DAY_MS
  const previousCutoff = cutoff - windowDays * DAY_MS
  // The viewer's clock, so "today" on the chart is their today.
  const offsetMs =
    Math.max(-14 * 60, Math.min(args.utcOffsetMinutes ?? 0, 14 * 60)) * 60_000

  const allInsights = await ctx.db
    .query("conversationInsights")
    .withIndex("by_organization_id_and_updated_at", (q) =>
      q.eq("organizationId", organizationId)
    )
    .order("desc")
    .take(INSIGHT_SCAN_LIMIT)

  const insights = allInsights.filter((insight) => insight.updatedAt >= cutoff)

  // The window before this one, for "compared with" figures. It is only
  // trustworthy when the scan reached all the way back through it.
  const previousInsights = allInsights.filter(
    (insight) =>
      insight.updatedAt < cutoff && insight.updatedAt >= previousCutoff
  )
  const oldestScanned = allInsights[allInsights.length - 1]
  const isPreviousComplete =
    allInsights.length < INSIGHT_SCAN_LIMIT ||
    (oldestScanned !== undefined && oldestScanned.updatedAt < previousCutoff)
  const previousResponseTimes = previousInsights
    .map((insight) => insight.firstHumanResponseMs)
    .filter((value): value is number => typeof value === "number")

  // One bucket per calendar day in the viewer's timezone, oldest first, so
  // the days always add up to the totals above them.
  const dayIndexOf = (timestamp: number) =>
    Math.floor((timestamp + offsetMs) / DAY_MS)
  const todayIndex = dayIndexOf(now)
  const firstDayIndex = dayIndexOf(cutoff)
  const daily = Array.from(
    { length: todayIndex - firstDayIndex + 1 },
    (_, index) => ({
      // Local midnight of the day, as a UTC timestamp.
      day: (firstDayIndex + index) * DAY_MS - offsetMs,
      resolved: 0,
      handed: 0,
      open: 0,
    })
  )
  const outcomeCounts = { resolved: 0, handed: 0, open: 0 }

  for (const insight of insights) {
    const outcome = outcomeOf(insight)
    outcomeCounts[outcome] += 1

    const bucket = daily[dayIndexOf(insight.updatedAt) - firstDayIndex]
    if (bucket) {
      bucket[outcome] += 1
    }
  }

  const total = insights.length
  const resolved = insights.filter((insight) => insight.wasResolved).length
  const escalated = insights.filter((insight) => insight.wasEscalated).length
  const unanswered = insights.filter((insight) => insight.isUnanswered)
  const responseTimes = insights
    .map((insight) => insight.firstHumanResponseMs)
    .filter((value): value is number => typeof value === "number")

  const byChannel = (channel: "chat" | "voice") => {
    const channelInsights = insights.filter(
      (insight) => insight.channel === channel
    )
    const channelTotal = channelInsights.length

    return {
      channel,
      total: channelTotal,
      resolved: channelInsights.filter((insight) => insight.wasResolved).length,
      escalated: channelInsights.filter((insight) => insight.wasEscalated)
        .length,
      resolutionRate: percentage(
        channelInsights.filter((insight) => insight.wasResolved).length,
        channelTotal
      ),
    }
  }

  const unansweredCounts = new Map<string, { count: number; intent: string }>()

  for (const insight of unanswered) {
    const label = insight.unansweredQuestion || insight.summary
    const existing = unansweredCounts.get(label)

    unansweredCounts.set(label, {
      count: (existing?.count ?? 0) + 1,
      intent: existing?.intent ?? insight.intent,
    })
  }

  return {
    windowDays,
    totalConversations: total,
    resolved,
    escalated,
    unanswered: unanswered.length,
    resolutionRate: percentage(resolved, total),
    escalationRate: percentage(escalated, total),
    unansweredRate: percentage(unanswered.length, total),
    averageHumanResponseMs: average(responseTimes),
    humanSavedMinutes: Math.round(
      insights.reduce(
        (totalMinutes, insight) => totalMinutes + insight.humanSavedMinutes,
        0
      )
    ),
    topIntents: groupCounts(insights.map((insight) => insight.intent)).slice(
      0,
      8
    ),
    sentimentMix: groupCounts(
      insights.map((insight) => insight.sentiment)
    ).slice(0, 3),
    urgencyMix: groupCounts(insights.map((insight) => insight.urgency)).slice(
      0,
      3
    ),
    unansweredQuestions: Array.from(unansweredCounts.entries())
      .map(([question, value]) => ({
        question,
        count: value.count,
        intent: value.intent,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    channelMetrics: [byChannel("chat"), byChannel("voice")],
    recentInsights: insights.slice(0, 8),
    outcomeCounts,
    daily,
    previous: {
      isComplete: isPreviousComplete,
      totalConversations: previousInsights.length,
      resolutionRate: percentage(
        previousInsights.filter((insight) => insight.wasResolved).length,
        previousInsights.length
      ),
      escalationRate: percentage(
        previousInsights.filter((insight) => insight.wasEscalated).length,
        previousInsights.length
      ),
      unansweredRate: percentage(
        previousInsights.filter((insight) => insight.isUnanswered).length,
        previousInsights.length
      ),
      averageHumanResponseMs: average(previousResponseTimes),
      humanSavedMinutes: Math.round(
        previousInsights.reduce(
          (totalMinutes, insight) => totalMinutes + insight.humanSavedMinutes,
          0
        )
      ),
    },
  }
}

export const getOverview = query({
  args: {
    windowDays: v.optional(v.number()),
    // Minutes ahead of UTC on the viewer's clock, for day boundaries.
    utcOffsetMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const organizationId = await getOrganizationId(ctx)
    return await getAnalyticsOverviewForOrganization(ctx, organizationId, args)
  },
})

export const getInsights = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const organizationId = await getOrganizationId(ctx)

    return await ctx.db
      .query("conversationInsights")
      .withIndex("by_organization_id_and_updated_at", (q) =>
        q.eq("organizationId", organizationId)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const getInsightsForExport = query({
  args: {
    windowDays: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const organizationId = await getOrganizationId(ctx)
    const windowDays = Math.max(1, Math.min(args.windowDays ?? 30, 365))
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000
    const limit = Math.max(
      1,
      Math.min(args.limit ?? ANALYTICS_EXPORT_LIMIT, ANALYTICS_EXPORT_LIMIT)
    )

    const insights = await ctx.db
      .query("conversationInsights")
      .withIndex("by_organization_id_and_updated_at", (q) =>
        q.eq("organizationId", organizationId)
      )
      .order("desc")
      .take(limit)

    return insights.filter((insight) => insight.updatedAt >= cutoff)
  },
})
