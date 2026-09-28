import { ConvexError, v } from "convex/values"
import { internal } from "../_generated/api"
import type { Doc, Id } from "../_generated/dataModel"
import { action, mutation, query, type QueryCtx } from "../_generated/server"
import { normalizeQuestionKey } from "../lib/learningHooks"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"
import { enforceRateLimit } from "../lib/rateLimits"
import { teachAnswer } from "../system/learning"

const statusValidator = v.union(
  v.literal("suggested"),
  v.literal("needs_answer"),
  v.literal("approved")
)

const LIST_LIMIT = 200

const readRows = async (
  ctx: QueryCtx,
  organizationId: string,
  status: Doc<"learnedAnswers">["status"]
) =>
  await ctx.db
    .query("learnedAnswers")
    .withIndex("by_organization_id_and_status", (q) =>
      q.eq("organizationId", organizationId).eq("status", status)
    )
    .take(LIST_LIMIT)

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const [suggested, needsAnswer, approved] = await Promise.all([
      readRows(ctx, orgId, "suggested"),
      readRows(ctx, orgId, "needs_answer"),
      readRows(ctx, orgId, "approved"),
    ])

    return {
      suggested: suggested.length,
      needsAnswer: needsAnswer.length,
      approved: approved.length,
    }
  },
})

export const list = query({
  args: { status: statusValidator },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const rows = await readRows(ctx, orgId, args.status)

    // What the owner should look at first: the gaps most customers hit, the
    // newest suggestions, the most recently taught answers.
    rows.sort((a, b) =>
      args.status === "needs_answer"
        ? b.askedCount - a.askedCount || b.updatedAt - a.updatedAt
        : args.status === "approved"
          ? (b.approvedAt ?? 0) - (a.approvedAt ?? 0)
          : b.updatedAt - a.updatedAt
    )

    return rows.map((row) => ({
      id: row._id,
      question: row.question,
      answer: row.answer,
      source: row.source,
      askedCount: row.askedCount,
      conversationId: row.conversationId,
      answeredByName: row.answeredByName,
      approvedAt: row.approvedAt,
      updatedAt: row.updatedAt,
    }))
  },
})

const requireOwnRow = async (
  ctx: { runQuery: any },
  organizationId: string,
  id: Id<"learnedAnswers">
): Promise<Doc<"learnedAnswers">> => {
  const row: Doc<"learnedAnswers"> | null = await ctx.runQuery(
    (internal as any).system.learning.getById,
    { learnedAnswerId: id }
  )

  if (!row || row.organizationId !== organizationId) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Not found" })
  }

  return row
}

/** Teaches the assistant this answer: it goes into the knowledge base. */
export const approve = action({
  args: {
    id: v.id("learnedAnswers"),
    question: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)

    await enforceRateLimit(ctx, "learnedAnswerApproveByUser", {
      key: `${orgId}:${identity.subject}`,
      message: "You have taught a lot of answers at once. Please wait a moment.",
    })

    const row = await requireOwnRow(ctx, orgId, args.id)

    await teachAnswer(ctx, {
      row,
      question: args.question,
      answer: args.answer,
      actorId: identity.subject,
      actorName: identity.name ?? undefined,
    })
  },
})

export const dismiss = mutation({
  args: { id: v.id("learnedAnswers") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const row = await ctx.db.get(args.id)

    if (!row || row.organizationId !== orgId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Not found" })
    }

    if (row.status === "approved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Remove a taught answer instead of dismissing it.",
      })
    }

    await ctx.db.patch(args.id, { status: "dismissed", updatedAt: Date.now() })
  },
})

/**
 * Takes a taught answer back out of the knowledge base. The question returns to
 * the unanswered list with its old answer kept as a draft, so a wrong answer can
 * be corrected rather than retyped.
 */
export const forget = action({
  args: { id: v.id("learnedAnswers") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const row = await requireOwnRow(ctx, orgId, args.id)

    if (row.knowledgeEntryId) {
      await ctx.runMutation(
        (internal as any).system.learning.removeKnowledgeEntry,
        { organizationId: orgId, entryId: row.knowledgeEntryId }
      )
    }

    await ctx.runMutation((internal as any).system.learning.markForgotten, {
      learnedAnswerId: args.id,
    })
  },
})

/**
 * Brings in the questions conversation analysis already flagged before this
 * page existed, so the list is not empty on day one. Safe to run repeatedly:
 * a question already listed is left as it is.
 */
export const importUnanswered = mutation({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const insights = await ctx.db
      .query("conversationInsights")
      .withIndex("by_organization_id_and_updated_at", (q) =>
        q.eq("organizationId", orgId)
      )
      .order("desc")
      .take(500)
    const grouped = new Map<
      string,
      { question: string; count: number; conversationId?: Id<"conversations"> }
    >()

    for (const insight of insights) {
      const question = insight.unansweredQuestion?.trim()

      if (!insight.isUnanswered || !question) {
        continue
      }

      const key = normalizeQuestionKey(question)

      if (key.length < 4) {
        continue
      }

      const existing = grouped.get(key)

      grouped.set(key, {
        question: existing?.question ?? question,
        count: (existing?.count ?? 0) + 1,
        conversationId: existing?.conversationId ?? insight.conversationId,
      })
    }

    let added = 0
    const now = Date.now()

    for (const [questionKey, item] of grouped) {
      const existing = await ctx.db
        .query("learnedAnswers")
        .withIndex("by_organization_id_and_question_key", (q) =>
          q.eq("organizationId", orgId).eq("questionKey", questionKey)
        )
        .first()

      if (existing) {
        continue
      }

      await ctx.db.insert("learnedAnswers", {
        organizationId: orgId,
        question: item.question,
        answer: "",
        questionKey,
        status: "needs_answer",
        source: "unanswered",
        conversationId: item.conversationId,
        askedCount: item.count,
        createdAt: now,
        updatedAt: now,
      })
      added += 1
    }

    return { added }
  },
})
