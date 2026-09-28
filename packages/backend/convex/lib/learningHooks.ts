import { internal } from "../_generated/api"
import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"

/** The knowledge-base category approved answers are filed under. */
export const LEARNED_ANSWERS_CATEGORY = "Learned answers"

/**
 * Wait this long after a team member's last message before reading the
 * conversation for answers, so an exchange is read once it has settled rather
 * than after every line of it.
 */
const TEAM_REPLY_SETTLE_MS = 30 * 60 * 1000

/**
 * The question with case, punctuation and spacing ironed out, so the same gap
 * worded the same way is counted instead of listed twice. Letters in any script
 * survive — these questions are mostly Uzbek and Russian.
 */
export const normalizeQuestionKey = (question: string) =>
  question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200)

/**
 * Conversation analysis found a question the assistant could not answer. It
 * joins the owner's "teach your assistant" list — or, if it is already there,
 * counts as one more customer who asked.
 */
export const recordUnansweredQuestion = async (
  ctx: MutationCtx,
  {
    organizationId,
    question,
    conversationId,
  }: {
    organizationId: string
    question: string
    conversationId?: Id<"conversations">
  }
) => {
  const trimmed = question.trim()
  const questionKey = normalizeQuestionKey(trimmed)

  if (questionKey.length < 4) {
    return
  }

  const existing = await ctx.db
    .query("learnedAnswers")
    .withIndex("by_organization_id_and_question_key", (q) =>
      q.eq("organizationId", organizationId).eq("questionKey", questionKey)
    )
    .first()
  const now = Date.now()

  if (existing) {
    if (existing.status !== "dismissed") {
      await ctx.db.patch(existing._id, {
        askedCount: existing.askedCount + 1,
        updatedAt: now,
      })
    }
    return
  }

  await ctx.db.insert("learnedAnswers", {
    organizationId,
    question: trimmed,
    answer: "",
    questionKey,
    status: "needs_answer",
    source: "unanswered",
    conversationId,
    askedCount: 1,
    createdAt: now,
    updatedAt: now,
  })
}

/**
 * A team member replied in a conversation. Once the exchange settles, read it
 * for answers worth keeping; the run carries the time of this message, so a
 * later reply supersedes it.
 */
export const scheduleTeamReplyLearning = async (
  ctx: MutationCtx,
  conversation: Doc<"conversations">,
  operatorMessageAt: number
) => {
  if (conversation.source === "workflow") {
    return
  }

  await ctx.scheduler.runAfter(
    TEAM_REPLY_SETTLE_MS,
    (internal as any).system.learning.extractFromConversation,
    { conversationId: conversation._id, operatorMessageAt }
  )
}

/** A person closed a conversation the team took part in: read it now. */
export const scheduleLearningOnResolve = async (
  ctx: MutationCtx,
  conversation: Doc<"conversations">
) => {
  if (conversation.source === "workflow" || !conversation.firstHumanResponseAt) {
    return
  }

  await ctx.scheduler.runAfter(
    0,
    (internal as any).system.learning.extractFromConversation,
    { conversationId: conversation._id }
  )
}
