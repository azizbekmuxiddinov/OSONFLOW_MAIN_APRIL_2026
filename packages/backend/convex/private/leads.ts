import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"

import type { Doc, Id } from "../_generated/dataModel"
import { query, type QueryCtx } from "../_generated/server"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"
import { isAnonymousContactSession } from "../lib/contactSessionIdentity"
import { paginateArray } from "../lib/paginateArray"

export const LEADS_EXPORT_LIMIT = 5000
export const LEADS_LIST_SCAN_LIMIT = 2000
export const NEWCOMER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const ARRIVALS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
const TOP_ORIGINS_LIMIT = 5

const conversationStatusValidator = v.union(
  v.literal("unresolved"),
  v.literal("escalated"),
  v.literal("resolved")
)

/**
 * The slices of the lead list an owner works from. `waiting` is the follow-up
 * queue: the latest conversation was handed to a person and the customer
 * spoke last. `no_chats` left contact details without ever starting a chat.
 */
const leadSegmentValidator = v.union(
  v.literal("all"),
  v.literal("waiting"),
  v.literal("newcomers"),
  v.literal("no_chats")
)

export type LeadSegment = "all" | "waiting" | "newcomers" | "no_chats"

const leadRecordValidator = v.object({
  contactSessionId: v.id("contactSessions"),
  name: v.string(),
  email: v.string(),
  channel: v.string(),
  phone: v.optional(v.string()),
  socialHandle: v.optional(v.string()),
  referrer: v.optional(v.string()),
  currentUrl: v.optional(v.string()),
  timezone: v.optional(v.string()),
  language: v.optional(v.string()),
  firstSeenAt: v.number(),
  conversationCount: v.number(),
  latestConversationId: v.optional(v.id("conversations")),
  latestConversationStatus: v.optional(conversationStatusValidator),
  lastActiveAt: v.number(),
  isAwaitingReply: v.boolean(),
  isNewcomer: v.boolean(),
})

export type LeadRecord = {
  contactSessionId: Id<"contactSessions">
  name: string
  email: string
  channel: string
  phone?: string
  socialHandle?: string
  referrer?: string
  currentUrl?: string
  timezone?: string
  language?: string
  firstSeenAt: number
  conversationCount: number
  latestConversationId?: Id<"conversations">
  latestConversationStatus?: Doc<"conversations">["status"]
  /** Latest customer message, else latest conversation start, else capture. */
  lastActiveAt: number
  isAwaitingReply: boolean
  isNewcomer: boolean
}

const isRealLead = (session: Doc<"contactSessions">) => {
  return !isAnonymousContactSession(session)
}

const getLeadChannel = (metadata?: Doc<"contactSessions">["metadata"]) => {
  if (metadata?.whatsappPhoneNumber) {
    return "WhatsApp"
  }

  if (metadata?.telegramUserId) {
    return "Telegram"
  }

  if (metadata?.instagramUserId || metadata?.platform === "Instagram") {
    return "Instagram"
  }

  if (metadata?.source === "workflow_widget") {
    return "Widget"
  }

  if (metadata?.source === "voice_widget") {
    return "Voice"
  }

  if (metadata?.platform === "WhatsApp") {
    return "WhatsApp"
  }

  if (metadata?.platform === "Telegram") {
    return "Telegram"
  }

  return "Web"
}

const getSocialHandle = (metadata?: Doc<"contactSessions">["metadata"]) => {
  if (metadata?.instagramUsername) {
    return `@${metadata.instagramUsername}`
  }

  if (metadata?.telegramUsername) {
    return `@${metadata.telegramUsername}`
  }

  return undefined
}

const buildConversationIndex = (conversations: Doc<"conversations">[]) => {
  const byContactSession = new Map<
    Id<"contactSessions">,
    Doc<"conversations">[]
  >()

  for (const conversation of conversations) {
    const existing = byContactSession.get(conversation.contactSessionId) ?? []
    existing.push(conversation)
    byContactSession.set(conversation.contactSessionId, existing)
  }

  return byContactSession
}

export const toLeadRecord = (
  session: Doc<"contactSessions">,
  conversations: Doc<"conversations">[],
  newcomerCutoff: number
): LeadRecord => {
  const metadata = session.metadata
  const latestConversation = [...conversations].sort(
    (left, right) => right._creationTime - left._creationTime
  )[0]
  const lastCustomerMessageAt = latestConversation?.lastCustomerMessageAt ?? 0
  const lastOperatorMessageAt = latestConversation?.lastOperatorMessageAt ?? 0

  return {
    contactSessionId: session._id,
    name: session.name,
    email: session.email,
    channel: getLeadChannel(metadata),
    phone: metadata?.whatsappPhoneNumber,
    socialHandle: getSocialHandle(metadata),
    referrer: metadata?.referrer,
    currentUrl: metadata?.currentUrl,
    timezone: metadata?.timezone,
    language: metadata?.language,
    firstSeenAt: session._creationTime,
    conversationCount: conversations.length,
    latestConversationId: latestConversation?._id,
    latestConversationStatus: latestConversation?.status,
    lastActiveAt: Math.max(
      session._creationTime,
      latestConversation?._creationTime ?? 0,
      lastCustomerMessageAt
    ),
    isAwaitingReply:
      latestConversation?.status === "escalated" &&
      lastCustomerMessageAt > lastOperatorMessageAt,
    isNewcomer: session._creationTime >= newcomerCutoff,
  }
}

const matchesSearchQuery = (lead: LeadRecord, normalizedQuery: string) => {
  if (!normalizedQuery) {
    return true
  }

  const haystack = [
    lead.name,
    lead.email,
    lead.channel,
    lead.phone,
    lead.socialHandle,
    lead.referrer,
    lead.currentUrl,
    lead.timezone,
    lead.language,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

const matchesSegment = (lead: LeadRecord, segment: LeadSegment) => {
  switch (segment) {
    case "waiting":
      return lead.isAwaitingReply
    case "newcomers":
      return lead.isNewcomer
    case "no_chats":
      return lead.conversationCount === 0
    default:
      return true
  }
}

const hostOf = (url?: string) => {
  if (!url) return undefined
  try {
    return new URL(url).hostname.replace(/^www\./, "") || undefined
  } catch {
    return undefined
  }
}

const pathOf = (url?: string) => {
  if (!url) return undefined
  try {
    const path = decodeURIComponent(new URL(url).pathname).replace(/\/+$/, "")
    return path || "/"
  } catch {
    return undefined
  }
}

/** Counts labels and keeps the most common, largest first. */
const topCounts = (labels: (string | undefined)[]) => {
  const counts = new Map<string, number>()
  for (const label of labels) {
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_ORIGINS_LIMIT)
}

export const loadLeads = async (
  ctx: QueryCtx,
  organizationId: string,
  options: {
    scanLimit: number
    segment?: LeadSegment
    searchQuery?: string
  }
) => {
  const newcomerCutoff = Date.now() - NEWCOMER_WINDOW_MS
  const normalizedSearch = options.searchQuery?.trim().toLowerCase() ?? ""

  const [sessions, conversations] = await Promise.all([
    ctx.db
      .query("contactSessions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", organizationId)
      )
      .order("desc")
      .take(options.scanLimit),
    ctx.db
      .query("conversations")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect(),
  ])

  const conversationsByContactSession = buildConversationIndex(conversations)

  return sessions
    .filter(isRealLead)
    .map((session) =>
      toLeadRecord(
        session,
        conversationsByContactSession.get(session._id) ?? [],
        newcomerCutoff
      )
    )
    .filter((lead) => {
      if (!matchesSegment(lead, options.segment ?? "all")) {
        return false
      }

      return matchesSearchQuery(lead, normalizedSearch)
    })
}

export const getMany = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchQuery: v.optional(v.string()),
    segment: v.optional(leadSegmentValidator),
  },
  returns: v.object({
    page: v.array(leadRecordValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    const leads = await loadLeads(ctx, orgId, {
      scanLimit: LEADS_LIST_SCAN_LIMIT,
      segment: args.segment,
      searchQuery: args.searchQuery,
    })

    return paginateArray(leads, args.paginationOpts)
  },
})

export const getForExport = query({
  args: {
    searchQuery: v.optional(v.string()),
    segment: v.optional(leadSegmentValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(leadRecordValidator),
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const limit = Math.max(
      1,
      Math.min(args.limit ?? LEADS_EXPORT_LIMIT, LEADS_EXPORT_LIMIT)
    )

    const leads = await loadLeads(ctx, orgId, {
      scanLimit: LEADS_EXPORT_LIMIT,
      segment: args.segment,
      searchQuery: args.searchQuery,
    })

    return leads.slice(0, limit)
  },
})

export const getLeadSummaryForOrganization = async (
  ctx: QueryCtx,
  orgId: string
) => {
  const leads = await loadLeads(ctx, orgId, {
    scanLimit: LEADS_LIST_SCAN_LIMIT,
  })

  const arrivalsCutoff = Date.now() - ARRIVALS_WINDOW_MS
  const channelCounts = {
    widget: 0,
    voice: 0,
    telegram: 0,
    whatsapp: 0,
    instagram: 0,
    web: 0,
  }

  for (const lead of leads) {
    switch (lead.channel) {
      case "Widget":
        channelCounts.widget += 1
        break
      case "Voice":
        channelCounts.voice += 1
        break
      case "Telegram":
        channelCounts.telegram += 1
        break
      case "WhatsApp":
        channelCounts.whatsapp += 1
        break
      case "Instagram":
        channelCounts.instagram += 1
        break
      default:
        channelCounts.web += 1
        break
    }
  }

  return {
    totalLeads: leads.length,
    newcomerCount: leads.filter((lead) => lead.isNewcomer).length,
    withConversationsCount: leads.filter(
      (lead) => lead.conversationCount > 0
    ).length,
    awaitingReplyCount: leads.filter((lead) => lead.isAwaitingReply).length,
    noChatsCount: leads.filter((lead) => lead.conversationCount === 0)
      .length,
    recentArrivals: leads
      .map((lead) => lead.firstSeenAt)
      .filter((at) => at >= arrivalsCutoff),
    // A referrer on the site's own host is in-site navigation, not a source.
    topReferrers: topCounts(
      leads.map((lead) => {
        const referrer = hostOf(lead.referrer)
        return referrer && referrer !== hostOf(lead.currentUrl)
          ? referrer
          : undefined
      })
    ),
    topPages: topCounts(leads.map((lead) => pathOf(lead.currentUrl))),
    channelCounts,
  }
}

export const getSummary = query({
  args: {},
  returns: v.object({
    totalLeads: v.number(),
    newcomerCount: v.number(),
    withConversationsCount: v.number(),
    awaitingReplyCount: v.number(),
    noChatsCount: v.number(),
    /** Capture times in the last 30 days, bucketed by day in the browser's
     *  own timezone rather than UTC. */
    recentArrivals: v.array(v.number()),
    topReferrers: v.array(v.object({ label: v.string(), count: v.number() })),
    topPages: v.array(v.object({ label: v.string(), count: v.number() })),
    channelCounts: v.object({
      widget: v.number(),
      voice: v.number(),
      telegram: v.number(),
      whatsapp: v.number(),
      instagram: v.number(),
      web: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    return await getLeadSummaryForOrganization(ctx, orgId)
  },
})
