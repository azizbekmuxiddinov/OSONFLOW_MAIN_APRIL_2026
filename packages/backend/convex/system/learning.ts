import { generateText } from "ai"
import { ConvexError, v } from "convex/values"
import type { EntryId } from "@convex-dev/rag"
import { internal } from "../_generated/api"
import type { Doc } from "../_generated/dataModel"
import {
  internalAction,
  internalMutation,
  internalQuery,
  type ActionCtx,
} from "../_generated/server"
import { extractAgentMessageText } from "../lib/agentMessageText"
import {
  LEARNED_ANSWERS_CATEGORY,
  normalizeQuestionKey,
} from "../lib/learningHooks"
import { getOpenAIChatModelFromSecretValue } from "../lib/openai"
import {
  addKnowledgeTextForOrganization,
  deleteKnowledgeEntryForOrganization,
} from "../private/files"
import { supportAgent } from "./ai/agents/supportAgent"

/**
 * The assistant learns from the team. When a person answers a customer in the
 * inbox (or from Telegram), the exchange is read for answers that hold for
 * every customer — a price, a policy, opening hours — and those are offered to
 * the owner as one-tap additions to the knowledge base. Nothing is added
 * without the owner approving it.
 */

const EXTRACTION_PROMPT = `You read a customer support conversation between a customer, an AI assistant and a person from the business's team. Find questions the customer asked that the TEAM MEMBER answered with general, reusable business information — prices, services, opening hours, delivery, policies, how something works.

Skip:
- anything about this one customer: their order, booking, account, payment, address or personal details
- names, phone numbers, email addresses and private links
- anything the AI assistant had already answered
- greetings, apologies and small talk

For each one, write the question the way any customer might ask it, and the team member's answer as a standalone fact that makes sense without this conversation. Keep the language the team member used. At most 3.

Return only JSON: {"items":[{"question":"...","answer":"..."}]} — or {"items":[]} if there are none.`

const MAX_QUESTION_LENGTH = 300
const MAX_ANSWER_LENGTH = 2000

const truncate = (value: string, maxLength: number) =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`

const safeJsonParse = (value: string): any => {
  try {
    return JSON.parse(value)
  } catch {
    const match = value.match(/\{[\s\S]*\}/)

    if (!match) {
      return null
    }

    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

export const getConversationForLearning = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId)

    if (!conversation) {
      return null
    }

    const [lastScan, subscription] = await Promise.all([
      ctx.db
        .query("learningScans")
        .withIndex("by_conversation_id", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .unique(),
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
      paginationOpts: { numItems: 30, cursor: null },
    })
    const humanSince = conversation.firstHumanResponseAt ?? null

    // Operator replies are stored as assistant messages too. Once a person has
    // joined, the assistant stops answering, so an assistant message from then
    // on — one not written by the support agent itself — is the team's.
    const lines = messages.page
      .slice()
      .reverse()
      .map((message: any) => {
        const role = message?.message?.role
        const text = extractAgentMessageText(message)
        const isTeam =
          role === "assistant" &&
          humanSince !== null &&
          message._creationTime >= humanSince - 1000 &&
          message.agentName !== "supportAgent"

        return {
          speaker:
            role === "user" ? "Customer" : isTeam ? "Team member" : "AI assistant",
          text,
        }
      })
      .filter((line) => line.text.trim().length > 0)

    return {
      conversation,
      lastScannedAt: lastScan?.scannedAt ?? null,
      hasActiveSubscription: subscription?.status === "active",
      lines,
    }
  },
})

export const recordScan = internalMutation({
  args: { conversationId: v.id("conversations"), organizationId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("learningScans")
      .withIndex("by_conversation_id", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { scannedAt: Date.now() })
    } else {
      await ctx.db.insert("learningScans", {
        conversationId: args.conversationId,
        organizationId: args.organizationId,
        scannedAt: Date.now(),
      })
    }
  },
})

/**
 * Files what the team taught as suggestions. A question already waiting for an
 * answer gets the team's answer attached — the gap closes itself, pending the
 * owner's approval.
 */
export const addSuggestions = internalMutation({
  args: {
    organizationId: v.string(),
    conversationId: v.id("conversations"),
    items: v.array(v.object({ question: v.string(), answer: v.string() })),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    for (const item of args.items) {
      const questionKey = normalizeQuestionKey(item.question)

      if (questionKey.length < 4) {
        continue
      }

      const existing = await ctx.db
        .query("learnedAnswers")
        .withIndex("by_organization_id_and_question_key", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("questionKey", questionKey)
        )
        .first()

      if (existing) {
        if (existing.status === "needs_answer") {
          await ctx.db.patch(existing._id, {
            answer: item.answer,
            status: "suggested",
            source: "team_reply",
            conversationId: args.conversationId,
            updatedAt: now,
          })
        }
        continue
      }

      await ctx.db.insert("learnedAnswers", {
        organizationId: args.organizationId,
        question: item.question,
        answer: item.answer,
        questionKey,
        status: "suggested",
        source: "team_reply",
        conversationId: args.conversationId,
        askedCount: 1,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})

export const extractFromConversation = internalAction({
  args: {
    conversationId: v.id("conversations"),
    /** The team message that scheduled this run; a later one supersedes it. */
    operatorMessageAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(
      (internal as any).system.learning.getConversationForLearning,
      { conversationId: args.conversationId }
    )

    if (!context?.hasActiveSubscription) {
      return
    }

    const conversation = context.conversation as Doc<"conversations">
    const lastTeamMessageAt = conversation.lastOperatorMessageAt ?? 0

    if (
      args.operatorMessageAt !== undefined &&
      lastTeamMessageAt !== args.operatorMessageAt
    ) {
      return
    }

    // Nothing new from the team since the last read.
    if (
      context.lastScannedAt !== null &&
      context.lastScannedAt >= lastTeamMessageAt
    ) {
      return
    }

    const lines = context.lines as Array<{ speaker: string; text: string }>
    const teamWords = lines
      .filter((line) => line.speaker === "Team member")
      .reduce((total, line) => total + line.text.trim().length, 0)

    await ctx.runMutation((internal as any).system.learning.recordScan, {
      conversationId: args.conversationId,
      organizationId: conversation.organizationId,
    })

    if (teamWords < 20) {
      return
    }

    const openAIPlugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      { organizationId: conversation.organizationId, service: "openai_realtime" }
    )
    const transcript = lines
      .map((line) => `${line.speaker}: ${truncate(line.text, 700)}`)
      .join("\n")

    let items: Array<{ question: string; answer: string }> = []

    try {
      const result = await generateText({
        model: getOpenAIChatModelFromSecretValue(openAIPlugin?.secretValue),
        maxOutputTokens: 500,
        system: EXTRACTION_PROMPT,
        prompt: truncate(transcript, 12000),
      })
      const parsed = safeJsonParse(result.text)

      items = Array.isArray(parsed?.items)
        ? parsed.items
            .filter(
              (item: any) =>
                typeof item?.question === "string" &&
                typeof item?.answer === "string" &&
                item.question.trim() &&
                item.answer.trim()
            )
            .slice(0, 3)
            .map((item: any) => ({
              question: truncate(item.question.trim(), MAX_QUESTION_LENGTH),
              answer: truncate(item.answer.trim(), MAX_ANSWER_LENGTH),
            }))
        : []
    } catch (error) {
      console.error("Reading team replies for answers failed", error)
      return
    }

    if (items.length > 0) {
      await ctx.runMutation((internal as any).system.learning.addSuggestions, {
        organizationId: conversation.organizationId,
        conversationId: args.conversationId,
        items,
      })
    }
  },
})

/* ── teaching ───────────────────────────────────────────────────────────── */

export const getById = internalQuery({
  args: { learnedAnswerId: v.id("learnedAnswers") },
  handler: async (ctx, args) => await ctx.db.get(args.learnedAnswerId),
})

export const getForTelegram = internalQuery({
  args: {
    learnedAnswerId: v.id("learnedAnswers"),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.learnedAnswerId)

    return row && row.organizationId === args.organizationId
      ? { question: row.question }
      : null
  },
})

export const markApproved = internalMutation({
  args: {
    learnedAnswerId: v.id("learnedAnswers"),
    question: v.string(),
    answer: v.string(),
    knowledgeEntryId: v.string(),
    answeredBy: v.optional(v.string()),
    answeredByName: v.optional(v.string()),
    fromTelegram: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.learnedAnswerId)

    if (!row) {
      return
    }

    const now = Date.now()

    await ctx.db.patch(args.learnedAnswerId, {
      question: args.question,
      questionKey: normalizeQuestionKey(args.question),
      answer: args.answer,
      status: "approved",
      knowledgeEntryId: args.knowledgeEntryId,
      answeredBy: args.answeredBy,
      answeredByName: args.answeredByName,
      ...(args.fromTelegram && row.source === "unanswered"
        ? { source: "telegram" as const }
        : {}),
      approvedAt: now,
      updatedAt: now,
    })
  },
})

export const markForgotten = internalMutation({
  args: { learnedAnswerId: v.id("learnedAnswers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.learnedAnswerId, {
      status: "needs_answer",
      knowledgeEntryId: undefined,
      approvedAt: undefined,
      updatedAt: Date.now(),
    })
  },
})

export const removeKnowledgeEntry = internalMutation({
  args: { organizationId: v.string(), entryId: v.string() },
  handler: async (ctx, args) => {
    try {
      await deleteKnowledgeEntryForOrganization(
        ctx,
        args.organizationId,
        args.entryId as EntryId
      )
    } catch (error) {
      // Already gone from the knowledge base, which is the outcome wanted.
      console.warn("Removing a learned answer's entry failed", error)
    }
  },
})

/**
 * Writes an approved answer into the knowledge base, where the assistant's
 * search finds it like any other source. Editing an approved answer replaces
 * its entry rather than leaving the old wording behind.
 */
export const teachAnswer = async (
  ctx: ActionCtx,
  {
    row,
    question,
    answer,
    actorId,
    actorName,
    fromTelegram,
  }: {
    row: Doc<"learnedAnswers">
    question: string
    answer: string
    actorId: string
    actorName?: string
    fromTelegram?: boolean
  }
) => {
  const cleanQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH)
  const cleanAnswer = answer.trim().slice(0, MAX_ANSWER_LENGTH)

  if (!cleanQuestion || !cleanAnswer) {
    throw new ConvexError({
      code: "BAD_REQUEST",
      message: "Both the question and the answer are needed.",
    })
  }

  if (row.knowledgeEntryId) {
    await ctx.runMutation(
      (internal as any).system.learning.removeKnowledgeEntry,
      { organizationId: row.organizationId, entryId: row.knowledgeEntryId }
    )
  }

  const { entryId } = await addKnowledgeTextForOrganization(
    ctx,
    {
      organizationId: row.organizationId,
      actorId,
      enforceDashboardRateLimits: false,
    },
    {
      title: cleanQuestion,
      text: `Question: ${cleanQuestion}\nAnswer: ${cleanAnswer}`,
      category: LEARNED_ANSWERS_CATEGORY,
    }
  )

  await ctx.runMutation((internal as any).system.learning.markApproved, {
    learnedAnswerId: row._id,
    question: cleanQuestion,
    answer: cleanAnswer,
    knowledgeEntryId: String(entryId),
    answeredBy: actorId,
    answeredByName: actorName,
    fromTelegram,
  })
}

/** A team member answered a question by replying to it in Telegram. */
export const approveFromTelegram = internalAction({
  args: {
    learnedAnswerId: v.id("learnedAnswers"),
    organizationId: v.string(),
    answer: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const row: Doc<"learnedAnswers"> | null = await ctx.runQuery(
      (internal as any).system.learning.getById,
      { learnedAnswerId: args.learnedAnswerId }
    )

    if (!row || row.organizationId !== args.organizationId) {
      return false
    }

    await teachAnswer(ctx, {
      row,
      question: row.question,
      answer: args.answer,
      actorId: args.userId ?? "telegram",
      actorName: args.userName,
      fromTelegram: true,
    })

    return true
  },
})
