import { v } from "convex/values"
import { internal } from "../_generated/api"
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
  isRealEmailAddress,
  type ConversationChannel,
} from "../lib/conversationChannel"
import { checkRateLimit } from "../lib/rateLimits"
import {
  DEFAULT_TEAM_ALERTS,
  callTeamBot,
  escapeTelegramHtml,
  getDashboardUrl,
  getTeamBotToken,
  sendTeamMessage,
  teamCopy,
  toTeamLanguage,
  truncateText,
  type InlineButton,
  type TeamAlertType,
  type TeamLanguage,
} from "../lib/teamTelegram"
import { updateConversationStatusForOrganization } from "../private/conversations"
import { sendOperatorMessageForOrganization } from "../private/messages"
import { supportAgent } from "./ai/agents/supportAgent"

/**
 * Team alerts in Telegram: the handoffs, waiting customers, unhappy customers
 * and new leads a business should not have to sit in the dashboard to notice —
 * and, because a reply to an alert goes straight back to the customer, a way to
 * run the inbox from the phone the owner already has in their hand.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const alertPreferenceValidator = v.union(
  v.literal("handoff"),
  v.literal("waiting"),
  v.literal("upset"),
  v.literal("lead"),
  v.literal("digest")
)

const alertTypeValidator = v.union(
  v.literal("handoff"),
  v.literal("waiting"),
  v.literal("upset"),
  v.literal("lead"),
  v.literal("digest"),
  v.literal("question"),
  v.literal("test")
)

type TelegramUser = {
  id?: number
  username?: string
  first_name?: string
  last_name?: string
  language_code?: string
}

type TeamBotMessage = {
  message_id: number
  text?: string
  chat: { id: number | string; type?: string }
  from?: TelegramUser
  reply_to_message?: { message_id: number }
}

type TeamBotUpdate = {
  update_id?: number
  message?: TeamBotMessage
  callback_query?: {
    id: string
    data?: string
    from?: TelegramUser
    message?: { message_id: number; chat: { id: number | string } }
  }
}

/* ── lookups ────────────────────────────────────────────────────────────── */

export const listLinksForAlert = internalQuery({
  args: {
    organizationId: v.string(),
    /** Unset: everyone linked, whatever they switched off (a test alert). */
    preference: v.optional(alertPreferenceValidator),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("teamTelegramLinks")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .take(50)

    return links.filter((link) => {
      if (args.userId && link.userId !== args.userId) {
        return false
      }

      if (!args.preference) {
        return true
      }

      return !link.isPaused && link.alerts[args.preference]
    })
  },
})

export const getLinksForChat = internalQuery({
  args: { chatId: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("teamTelegramLinks")
      .withIndex("by_chat_id", (q) => q.eq("chatId", args.chatId))
      .take(20),
})

export const getMessageMapping = internalQuery({
  args: { chatId: v.string(), messageId: v.number() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("teamTelegramMessages")
      .withIndex("by_chat_id_and_message_id", (q) =>
        q.eq("chatId", args.chatId).eq("messageId", args.messageId)
      )
      .first(),
})

export const recordMessages = internalMutation({
  args: {
    rows: v.array(
      v.object({
        organizationId: v.string(),
        chatId: v.string(),
        messageId: v.number(),
        alertType: alertTypeValidator,
        conversationId: v.optional(v.id("conversations")),
        learnedAnswerId: v.optional(v.id("learnedAnswers")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    for (const row of args.rows) {
      await ctx.db.insert("teamTelegramMessages", { ...row, createdAt: now })
    }
  },
})

/**
 * Everything an alert about one conversation says: who, where from, and what
 * they wrote — plus what the team has already been told, so a burst of messages
 * is relayed once rather than once per message.
 */
export const getConversationAlertContext = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      return null
    }

    const session = await ctx.db.get(conversation.contactSessionId)
    const previousAlerts = await ctx.db
      .query("teamTelegramMessages")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(50)
    const messages = await supportAgent.listMessages(ctx, {
      threadId: conversation.threadId,
      excludeToolMessages: true,
      paginationOpts: { numItems: 12, cursor: null },
    })
    const insight = await ctx.db
      .query("conversationInsights")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .unique()

    return {
      conversation,
      customerName: session?.name?.trim() || "—",
      channel: getContactChannel(session),
      customerMessages: messages.page
        .filter((message: any) => message?.message?.role === "user")
        .map((message: any) => ({
          text: extractAgentMessageText(message),
          at: message._creationTime as number,
        }))
        .filter((message) => message.text.trim().length > 0)
        .reverse(),
      lastRelayAt:
        previousAlerts.find(
          (alert) =>
            alert.alertType === "handoff" || alert.alertType === "waiting"
        )?.createdAt ?? 0,
      hasUpsetAlert: previousAlerts.some(
        (alert) => alert.alertType === "upset"
      ),
      summary: insight?.summary,
    }
  },
})

export const getContactSessionForAlert = internalQuery({
  args: { contactSessionId: v.id("contactSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId)

    if (!session || isAnonymousContactSession(session)) {
      return null
    }

    return {
      organizationId: session.organizationId,
      name: session.name,
      email: isRealEmailAddress(session.email) ? session.email : undefined,
      channel: getContactChannel(session),
    }
  },
})

/* ── delivery ───────────────────────────────────────────────────────────── */

type AlertMessage = { html: string; buttons?: InlineButton[][] }

const quote = (texts: string[], language: TeamLanguage) => {
  const [open, close] = language === "ru" ? ["«", "»"] : ["“", "”"]

  return texts
    .map((text) => `${open}${escapeTelegramHtml(truncateText(text, 600))}${close}`)
    .join("\n")
}

const conversationButtons = (
  copy: ReturnType<typeof teamCopy>,
  conversationId: Id<"conversations">
): InlineButton[][] => [
  [
    {
      text: copy.openButton,
      url: `${getDashboardUrl()}/conversations/${conversationId}`,
    },
    { text: copy.resolveButton, callback_data: "resolve" },
  ],
]

/**
 * Sends one alert to every linked team member who wants it, each in their own
 * dashboard language, and remembers which message stood for what so a reply
 * finds its way back.
 */
const deliver = async (
  ctx: any,
  {
    organizationId,
    alertType,
    preference,
    userId,
    conversationId,
    learnedAnswerId,
    build,
  }: {
    organizationId: string
    alertType: TeamAlertType
    preference?: "handoff" | "waiting" | "upset" | "lead" | "digest"
    userId?: string
    conversationId?: Id<"conversations">
    learnedAnswerId?: Id<"learnedAnswers">
    build: (
      copy: ReturnType<typeof teamCopy>,
      language: TeamLanguage
    ) => AlertMessage
  }
) => {
  const token = getTeamBotToken()

  if (!token) {
    return 0
  }

  const links: Doc<"teamTelegramLinks">[] = await ctx.runQuery(
    (internal as any).system.teamAlerts.listLinksForAlert,
    { organizationId, preference, userId }
  )
  const rows: Array<{
    organizationId: string
    chatId: string
    messageId: number
    alertType: TeamAlertType
    conversationId?: Id<"conversations">
    learnedAnswerId?: Id<"learnedAnswers">
  }> = []

  for (const link of links) {
    const message = build(teamCopy(link.language), link.language)
    const messageId = await sendTeamMessage(token, {
      chatId: link.chatId,
      html: message.html,
      buttons: message.buttons,
    })

    if (messageId !== null && (conversationId || learnedAnswerId)) {
      rows.push({
        organizationId,
        chatId: link.chatId,
        messageId,
        alertType,
        ...(conversationId ? { conversationId } : {}),
        ...(learnedAnswerId ? { learnedAnswerId } : {}),
      })
    }
  }

  if (rows.length > 0) {
    await ctx.runMutation((internal as any).system.teamAlerts.recordMessages, {
      rows,
    })
  }

  return links.length
}

type AlertContext = {
  conversation: Doc<"conversations">
  customerName: string
  channel: ConversationChannel
  customerMessages: Array<{ text: string; at: number }>
  lastRelayAt: number
  hasUpsetAlert: boolean
  summary?: string
}

const loadAlertContext = async (
  ctx: any,
  conversationId: Id<"conversations">
): Promise<AlertContext | null> =>
  await ctx.runQuery(
    (internal as any).system.teamAlerts.getConversationAlertContext,
    { conversationId }
  )

/** The assistant just handed a conversation to people. */
export const alertHandoff = internalAction({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const context = await loadAlertContext(ctx, args.conversationId)

    if (!context || context.conversation.status !== "escalated") {
      return
    }

    const latest = context.customerMessages.slice(-2).map((m) => m.text)

    await deliver(ctx, {
      organizationId: context.conversation.organizationId,
      alertType: "handoff",
      preference: "handoff",
      conversationId: args.conversationId,
      build: (copy, language) => ({
        html: [
          copy.handoff(
            escapeTelegramHtml(context.customerName),
            context.channel
          ),
          latest.length ? quote(latest, language) : null,
          copy.replyHint,
        ]
          .filter(Boolean)
          .join("\n\n"),
        buttons: conversationButtons(copy, args.conversationId),
      }),
    })
  },
})

/**
 * A customer wrote in a conversation that is with the team. Scheduled a few
 * seconds after each message; only the run for the latest message sends, and
 * it carries every message since the team last heard or spoke.
 */
export const alertCustomerWaiting = internalAction({
  args: {
    conversationId: v.id("conversations"),
    customerMessageAt: v.number(),
  },
  handler: async (ctx, args) => {
    const context = await loadAlertContext(ctx, args.conversationId)

    if (
      !context ||
      context.conversation.status !== "escalated" ||
      (context.conversation.lastCustomerMessageAt ?? 0) !==
        args.customerMessageAt
    ) {
      return
    }

    const since = Math.max(
      context.lastRelayAt,
      context.conversation.lastOperatorMessageAt ?? 0
    )
    const fresh = context.customerMessages
      .filter((message) => message.at > since)
      .slice(-3)
      .map((message) => message.text)

    if (fresh.length === 0) {
      return
    }

    await deliver(ctx, {
      organizationId: context.conversation.organizationId,
      alertType: "waiting",
      preference: "waiting",
      conversationId: args.conversationId,
      build: (copy, language) => ({
        html: [
          copy.waiting(
            escapeTelegramHtml(context.customerName),
            context.channel
          ),
          quote(fresh, language),
          copy.replyHint,
        ].join("\n\n"),
        buttons: conversationButtons(copy, args.conversationId),
      }),
    })
  },
})

/** Conversation analysis read the customer as unhappy. Once per conversation. */
export const alertUpset = internalAction({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const context = await loadAlertContext(ctx, args.conversationId)

    if (
      !context ||
      context.hasUpsetAlert ||
      context.conversation.status === "resolved"
    ) {
      return
    }

    const latest = context.customerMessages.slice(-1).map((m) => m.text)

    await deliver(ctx, {
      organizationId: context.conversation.organizationId,
      alertType: "upset",
      preference: "upset",
      conversationId: args.conversationId,
      build: (copy, language) => ({
        html: [
          copy.upset(escapeTelegramHtml(context.customerName), context.channel),
          latest.length ? quote(latest, language) : null,
          copy.replyHint,
        ]
          .filter(Boolean)
          .join("\n\n"),
        buttons: conversationButtons(copy, args.conversationId),
      }),
    })
  },
})

/** A website visitor left their contact details. */
export const alertLead = internalAction({
  args: { contactSessionId: v.id("contactSessions") },
  handler: async (ctx, args) => {
    const lead = await ctx.runQuery(
      (internal as any).system.teamAlerts.getContactSessionForAlert,
      { contactSessionId: args.contactSessionId }
    )

    if (!lead) {
      return
    }

    await deliver(ctx, {
      organizationId: lead.organizationId,
      alertType: "lead",
      preference: "lead",
      build: (copy) => ({
        html: [
          copy.lead(escapeTelegramHtml(lead.name), lead.channel),
          lead.email ? escapeTelegramHtml(lead.email) : null,
        ]
          .filter(Boolean)
          .join("\n"),
        buttons: [
          [{ text: copy.leadsButton, url: `${getDashboardUrl()}/leads` }],
        ],
      }),
    })
  },
})

export const sendTestAlert = internalAction({
  args: { organizationId: v.string(), userId: v.string() },
  handler: async (ctx, args) =>
    await deliver(ctx, {
      organizationId: args.organizationId,
      alertType: "test",
      userId: args.userId,
      build: (copy) => ({ html: copy.test }),
    }),
})

/* ── weekly digest ──────────────────────────────────────────────────────── */

export const getDigestData = internalQuery({
  args: { organizationId: v.string(), since: v.number() },
  handler: async (ctx, args) => {
    const insights = await ctx.db
      .query("conversationInsights")
      .withIndex("by_organization_id_and_updated_at", (q) =>
        q.eq("organizationId", args.organizationId).gte("updatedAt", args.since)
      )
      .take(2000)
    const sessions = await ctx.db
      .query("contactSessions")
      .withIndex("by_organization_id", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .gte("_creationTime", args.since)
      )
      .take(2000)
    const followUps = await ctx.db
      .query("followUps")
      .withIndex("by_organization_id_and_sent_at", (q) =>
        q.eq("organizationId", args.organizationId).gte("sentAt", args.since)
      )
      .take(2000)
    const gaps = await ctx.db
      .query("learnedAnswers")
      .withIndex("by_organization_id_and_status", (q) =>
        q.eq("organizationId", args.organizationId).eq("status", "needs_answer")
      )
      .take(200)

    return {
      conversations: insights.length,
      solvedByAssistant: insights.filter(
        (insight) =>
          insight.wasResolved &&
          insight.resolutionSource !== "human" &&
          !insight.wasEscalated
      ).length,
      handedToTeam: insights.filter((insight) => insight.wasEscalated).length,
      minutesSaved: insights.reduce(
        (total, insight) => total + (insight.humanSavedMinutes ?? 0),
        0
      ),
      newLeads: sessions.filter(
        (session) =>
          !isAnonymousContactSession(session) &&
          isRealEmailAddress(session.email)
      ).length,
      followUpsSent: followUps.filter((item) => item.status === "sent").length,
      questions: gaps
        .sort((a, b) => b.askedCount - a.askedCount || b.updatedAt - a.updatedAt)
        .slice(0, 3)
        .map((gap) => ({
          id: gap._id,
          question: gap.question,
          askedCount: gap.askedCount,
        })),
    }
  },
})

export const listOrganizationsForDigest = internalQuery({
  args: {},
  handler: async (ctx) => {
    const links = await ctx.db.query("teamTelegramLinks").take(5000)

    return Array.from(
      new Set(
        links
          .filter((link) => !link.isPaused && link.alerts.digest)
          .map((link) => link.organizationId)
      )
    )
  },
})

/** Monday morning in Tashkent: last week in one message, then its open questions. */
export const sendWeeklyDigests = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!getTeamBotToken()) {
      return
    }

    const organizationIds: string[] = await ctx.runQuery(
      (internal as any).system.teamAlerts.listOrganizationsForDigest,
      {}
    )

    // Spread out so a few hundred organizations do not all hit Telegram's
    // per-bot limit in the same second.
    for (const [index, organizationId] of organizationIds.entries()) {
      await ctx.scheduler.runAfter(
        index * 1500,
        (internal as any).system.teamAlerts.sendDigestForOrganization,
        { organizationId }
      )
    }
  },
})

export const sendDigestForOrganization = internalAction({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(
      (internal as any).system.teamAlerts.getDigestData,
      { organizationId: args.organizationId, since: Date.now() - 7 * DAY_MS }
    )

    await deliver(ctx, {
      organizationId: args.organizationId,
      alertType: "digest",
      preference: "digest",
      build: (copy) => ({
        html:
          data.conversations === 0
            ? `${copy.digestTitle}\n\n${copy.digestQuiet}`
            : [
                copy.digestTitle,
                "",
                copy.digestConversations(data.conversations),
                copy.digestAi(data.solvedByAssistant),
                copy.digestTeam(data.handedToTeam),
                data.newLeads ? copy.digestLeads(data.newLeads) : null,
                data.followUpsSent
                  ? copy.digestFollowUps(data.followUpsSent)
                  : null,
                data.minutesSaved >= 5
                  ? copy.digestSaved(data.minutesSaved)
                  : null,
                data.questions.length ? `\n${copy.digestQuestions}` : null,
              ]
                .filter((line) => line !== null)
                .join("\n"),
      }),
    })

    for (const question of data.questions) {
      await deliver(ctx, {
        organizationId: args.organizationId,
        alertType: "question",
        preference: "digest",
        learnedAnswerId: question.id,
        build: (copy) => ({
          html: copy.question(
            escapeTelegramHtml(question.question),
            question.askedCount
          ),
          buttons: [[{ text: copy.answerButton, callback_data: "answer" }]],
        }),
      })
    }
  },
})

/* ── linking ────────────────────────────────────────────────────────────── */

export const consumeLinkCode = internalMutation({
  args: {
    code: v.string(),
    chatId: v.string(),
    telegramUsername: v.optional(v.string()),
    telegramName: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ linked: boolean; language?: TeamLanguage }> => {
    const pending = await ctx.db
      .query("teamTelegramLinkCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique()

    if (!pending) {
      return { linked: false }
    }

    await ctx.db.delete(pending._id)

    if (pending.expiresAt < Date.now()) {
      return { linked: false, language: pending.language }
    }

    const now = Date.now()
    const existing = await ctx.db
      .query("teamTelegramLinks")
      .withIndex("by_organization_id_and_user_id", (q) =>
        q
          .eq("organizationId", pending.organizationId)
          .eq("userId", pending.userId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        chatId: args.chatId,
        userName: pending.userName,
        telegramUsername: args.telegramUsername,
        telegramName: args.telegramName,
        language: pending.language,
        isPaused: false,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert("teamTelegramLinks", {
        organizationId: pending.organizationId,
        userId: pending.userId,
        userName: pending.userName,
        chatId: args.chatId,
        telegramUsername: args.telegramUsername,
        telegramName: args.telegramName,
        language: pending.language,
        alerts: DEFAULT_TEAM_ALERTS,
        createdAt: now,
        updatedAt: now,
      })
    }

    return { linked: true, language: pending.language }
  },
})

export const setPausedForChat = internalMutation({
  args: { chatId: v.string(), paused: v.boolean() },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("teamTelegramLinks")
      .withIndex("by_chat_id", (q) => q.eq("chatId", args.chatId))
      .take(20)

    for (const link of links) {
      await ctx.db.patch(link._id, {
        isPaused: args.paused,
        updatedAt: Date.now(),
      })
    }

    return links.length
  },
})

/* ── replies from Telegram ──────────────────────────────────────────────── */

const findLink = async (
  ctx: { db: any },
  chatId: string,
  organizationId: string
): Promise<Doc<"teamTelegramLinks"> | null> => {
  const links: Doc<"teamTelegramLinks">[] = await ctx.db
    .query("teamTelegramLinks")
    .withIndex("by_chat_id", (q: any) => q.eq("chatId", chatId))
    .take(20)

  return links.find((link) => link.organizationId === organizationId) ?? null
}

/** A team member's reply, sent to the customer as that team member. */
export const replyToConversation = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.id("conversations"),
    chatId: v.string(),
    text: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ ok: boolean; reason?: string; customerName?: string }> => {
    const link = await findLink(ctx, args.chatId, args.organizationId)

    if (!link) {
      return { ok: false, reason: "not_linked" }
    }

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation || conversation.organizationId !== args.organizationId) {
      return { ok: false, reason: "not_found" }
    }

    if (conversation.status === "resolved") {
      return { ok: false, reason: "closed" }
    }

    const session = await ctx.db.get(conversation.contactSessionId)

    await sendOperatorMessageForOrganization(ctx, {
      organizationId: args.organizationId,
      conversationId: args.conversationId,
      prompt: args.text,
      operator: {
        id: link.userId,
        name: link.userName,
        agentName: link.userName,
      },
    })

    return { ok: true, customerName: session?.name ?? "" }
  },
})

export const resolveFromTelegram = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.id("conversations"),
    chatId: v.string(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; reason?: string }> => {
    const link = await findLink(ctx, args.chatId, args.organizationId)

    if (!link) {
      return { ok: false, reason: "not_linked" }
    }

    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation || conversation.organizationId !== args.organizationId) {
      return { ok: false, reason: "not_found" }
    }

    if (conversation.status === "resolved") {
      return { ok: false, reason: "closed" }
    }

    await updateConversationStatusForOrganization(
      ctx,
      args.organizationId,
      args.conversationId,
      "resolved"
    )

    return { ok: true }
  },
})

/* ── the bot's inbox ────────────────────────────────────────────────────── */

const displayNameOf = (user?: TelegramUser) =>
  [user?.first_name, user?.last_name].filter(Boolean).join(" ") || undefined

export const handleUpdate = internalAction({
  args: { update: v.any() },
  handler: async (ctx, args) => {
    const token = getTeamBotToken()

    if (!token) {
      return
    }

    const update = args.update as TeamBotUpdate

    if (update.callback_query) {
      await handleCallback(ctx, token, update.callback_query)
      return
    }

    const message = update.message

    // Groups are out of scope: an alert names a customer and quotes them, and a
    // reply from a group could not be tied to one team member.
    if (!message || message.chat.type !== "private") {
      return
    }

    const chatId = String(message.chat.id)
    const limit = await checkRateLimit(ctx, "teamTelegramMessageByChat", {
      key: chatId,
    })

    if (!limit.ok) {
      return
    }

    const links: Doc<"teamTelegramLinks">[] = await ctx.runQuery(
      (internal as any).system.teamAlerts.getLinksForChat,
      { chatId }
    )
    const fallbackLanguage =
      links[0]?.language ?? toTeamLanguage(message.from?.language_code)
    const say = async (html: string) => {
      await sendTeamMessage(token, {
        chatId,
        html,
        replyToMessageId: message.message_id,
      })
    }
    const copy = teamCopy(fallbackLanguage)
    const text = message.text?.trim() ?? ""

    if (text.startsWith("/start")) {
      const code = text.split(/\s+/)[1]

      if (!code) {
        await say(copy.startHelp)
        return
      }

      const result = await ctx.runMutation(
        (internal as any).system.teamAlerts.consumeLinkCode,
        {
          code,
          chatId,
          telegramUsername: message.from?.username,
          telegramName: displayNameOf(message.from),
        }
      )
      const language: TeamLanguage = result.language ?? fallbackLanguage

      await say(
        result.linked
          ? teamCopy(language).linked
          : teamCopy(language).linkExpired
      )
      return
    }

    if (links.length === 0) {
      await say(copy.startHelp)
      return
    }

    if (text === "/stop" || text === "/resume") {
      await ctx.runMutation(
        (internal as any).system.teamAlerts.setPausedForChat,
        { chatId, paused: text === "/stop" }
      )
      await say(text === "/stop" ? copy.paused : copy.resumed)
      return
    }

    const repliedTo = message.reply_to_message?.message_id
    const mapping: Doc<"teamTelegramMessages"> | null = repliedTo
      ? await ctx.runQuery(
          (internal as any).system.teamAlerts.getMessageMapping,
          { chatId, messageId: repliedTo }
        )
      : null

    if (!mapping) {
      await say(copy.notAReply)
      return
    }

    if (!text) {
      await say(copy.textOnly)
      return
    }

    const link = links.find(
      (item) => item.organizationId === mapping.organizationId
    )
    const replyCopy = teamCopy(link?.language ?? fallbackLanguage)

    if (mapping.learnedAnswerId) {
      const saved = await ctx
        .runAction((internal as any).system.learning.approveFromTelegram, {
          learnedAnswerId: mapping.learnedAnswerId,
          organizationId: mapping.organizationId,
          answer: text,
          userId: link?.userId,
          userName: link?.userName,
        })
        .catch((error: unknown) => {
          console.error("Saving an answer from Telegram failed", error)
          return false
        })

      await say(saved ? replyCopy.answerSaved : replyCopy.answerFailed)
      return
    }

    if (!mapping.conversationId) {
      await say(replyCopy.notAReply)
      return
    }

    const result = await ctx
      .runMutation((internal as any).system.teamAlerts.replyToConversation, {
        organizationId: mapping.organizationId,
        conversationId: mapping.conversationId,
        chatId,
        text,
      })
      .catch((error: unknown) => {
        console.error("Replying from Telegram failed", error)
        return { ok: false, reason: "send_failed" }
      })

    if (result.ok) {
      await say(
        replyCopy.sent(escapeTelegramHtml(result.customerName || "—"))
      )
    } else {
      await say(
        result.reason === "closed" ? replyCopy.closed : replyCopy.sendFailed
      )
    }
  },
})

const handleCallback = async (
  ctx: any,
  token: string,
  query: NonNullable<TeamBotUpdate["callback_query"]>
) => {
  const chatId = query.message ? String(query.message.chat.id) : null
  const mapping: Doc<"teamTelegramMessages"> | null =
    chatId && query.message
      ? await ctx.runQuery(
          (internal as any).system.teamAlerts.getMessageMapping,
          { chatId, messageId: query.message.message_id }
        )
      : null
  const links: Doc<"teamTelegramLinks">[] = chatId
    ? await ctx.runQuery((internal as any).system.teamAlerts.getLinksForChat, {
        chatId,
      })
    : []
  const link = links.find(
    (item) => item.organizationId === mapping?.organizationId
  )
  const copy = teamCopy(
    link?.language ?? links[0]?.language ?? toTeamLanguage(query.from?.language_code)
  )
  let toast: string | undefined

  if (chatId && mapping && link) {
    if (query.data === "resolve" && mapping.conversationId) {
      const result = await ctx.runMutation(
        (internal as any).system.teamAlerts.resolveFromTelegram,
        {
          organizationId: mapping.organizationId,
          conversationId: mapping.conversationId,
          chatId,
        }
      )

      toast = result.ok ? copy.resolved : copy.closed
    }

    if (query.data === "answer" && mapping.learnedAnswerId) {
      const question = await ctx.runQuery(
        (internal as any).system.learning.getForTelegram,
        {
          learnedAnswerId: mapping.learnedAnswerId,
          organizationId: mapping.organizationId,
        }
      )

      if (question) {
        const messageId = await sendTeamMessage(token, {
          chatId,
          html: copy.answerPrompt(escapeTelegramHtml(question.question)),
          forceReply: true,
        })

        if (messageId !== null) {
          await ctx.runMutation(
            (internal as any).system.teamAlerts.recordMessages,
            {
              rows: [
                {
                  organizationId: mapping.organizationId,
                  chatId,
                  messageId,
                  alertType: "question",
                  learnedAnswerId: mapping.learnedAnswerId,
                },
              ],
            }
          )
        }
      }
    }
  }

  await callTeamBot(token, "answerCallbackQuery", {
    callback_query_id: query.id,
    ...(toast ? { text: toast } : {}),
  })
}

/**
 * Replaces the person's earlier unused codes, so only the link they opened
 * last can connect them.
 */
export const storeLinkCode = internalMutation({
  args: {
    code: v.string(),
    organizationId: v.string(),
    userId: v.string(),
    userName: v.string(),
    language: v.union(v.literal("en"), v.literal("uz"), v.literal("ru")),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const earlier = await ctx.db
      .query("teamTelegramLinkCodes")
      .withIndex("by_organization_id_and_user_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .take(20)

    for (const row of earlier) {
      await ctx.db.delete(row._id)
    }

    await ctx.db.insert("teamTelegramLinkCodes", {
      ...args,
      createdAt: Date.now(),
    })
  },
})
