import { generateText, stepCountIs, tool } from "ai"
import { v } from "convex/values"
import z from "zod"
import { internal } from "../_generated/api"
import type { Doc, Id } from "../_generated/dataModel"
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server"
import { extractAgentMessageText } from "../lib/agentMessageText"
import { answerFromKnowledgeBase } from "../lib/knowledgeBaseAnswer"
import {
  OPENAI_CHAT_MODEL,
  getOpenAIChatModelFromSecretValue,
} from "../lib/openai"
import {
  getDraftSnapshot,
  getWidgetSettingsByOrganizationId,
} from "../private/widgetSettings"
import { supportAgent } from "./ai/agents/supportAgent"
import { CHAT_MAX_OUTPUT_TOKENS, SUPPORT_AGENT_PROMPT } from "./ai/constants"
import { isSelfContainedQuestion } from "./ai/replyCache"
import {
  buildToolAwareSystemPrompt,
  filterAssistantToolsByIds,
} from "./assistantTools/getChatTools"

/**
 * "Test before publishing": real questions customers asked are answered again
 * with the draft settings, and each new answer is set beside the one the
 * customer actually got. One judging call then marks each pair the same,
 * better, worse or different, so an owner can see what a prompt edit or a new
 * knowledge source changes before any customer does.
 *
 * Nothing leaves the sandbox. Knowledge search runs for real, since it only
 * reads; every tool that would book, write, call out or change the
 * conversation is replaced by a stand-in that records the attempt and returns
 * a placeholder.
 */

const MAX_QUESTIONS = 20
/** Popular cached questions come first — they are the ones most customers ask. */
const MAX_CACHED_QUESTIONS = 8
const CONVERSATIONS_TO_SCAN = 60
const PARALLEL_ANSWERS = 4

/** Replies that were never the assistant's own words. */
const CANNED_REPLY_PATTERN =
  /human operator will reply soon|Operator tez orada javob beradi/i

const LANGUAGE_NAMES = {
  en: "English",
  uz: "Uzbek (Latin script)",
  ru: "Russian",
} as const

const truncate = (value: string, maxLength: number) =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`

const matchesAgent = (conversationAgentId: string | undefined, agentId: string) =>
  (conversationAgentId?.trim() || "default") === agentId

/* ── questions ──────────────────────────────────────────────────────────── */

export const collectQuestions = internalQuery({
  args: { organizationId: v.string(), agentId: v.string() },
  handler: async (ctx, args) => {
    const pairs: Array<{ question: string; before: string }> = []
    const seen = new Set<string>()
    const add = (question: string, before: string) => {
      const key = question.trim().toLowerCase().replace(/\s+/g, " ")

      if (
        pairs.length >= MAX_QUESTIONS ||
        seen.has(key) ||
        !isSelfContainedQuestion(question) ||
        question.length > 400 ||
        !before.trim() ||
        CANNED_REPLY_PATTERN.test(before)
      ) {
        return
      }

      seen.add(key)
      pairs.push({ question: question.trim(), before: before.trim() })
    }

    const cached = await ctx.db
      .query("aiReplyCache")
      .withIndex("by_organization_id_and_last_used_at", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(100)

    // Top-level replies carry the thread they came from; knowledge-search
    // interpretations are cached in the same table without one.
    cached
      .filter((entry) => entry.sourceThreadId)
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, MAX_CACHED_QUESTIONS)
      .forEach((entry) => add(entry.sourcePrompt, entry.answer))

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(CONVERSATIONS_TO_SCAN)

    for (const conversation of conversations) {
      if (pairs.length >= MAX_QUESTIONS) {
        break
      }

      if (
        conversation.source === "workflow" ||
        !matchesAgent(conversation.agentId, args.agentId)
      ) {
        continue
      }

      const page = await supportAgent.listMessages(ctx, {
        threadId: conversation.threadId,
        excludeToolMessages: true,
        paginationOpts: { numItems: 12, cursor: null },
      })
      const messages = page.page.slice().reverse()
      const humanSince = conversation.firstHumanResponseAt ?? Infinity

      for (let index = 0; index < messages.length - 1; index += 1) {
        const asked: any = messages[index]
        const answered: any = messages[index + 1]
        const isAssistantAnswer =
          answered?.message?.role === "assistant" &&
          answered._creationTime < humanSince &&
          (!answered.agentName || answered.agentName === "supportAgent")

        if (asked?.message?.role === "user" && isAssistantAnswer) {
          const before = pairs.length
          add(extractAgentMessageText(asked), extractAgentMessageText(answered))

          // One question per conversation keeps the sample broad.
          if (pairs.length > before) {
            break
          }
        }
      }
    }

    return pairs
  },
})

export const getDraftSettings = internalQuery({
  args: { organizationId: v.string(), agentId: v.string() },
  handler: async (ctx, args) => {
    const widgetSettings = await getWidgetSettingsByOrganizationId(
      ctx,
      args.organizationId,
      args.agentId
    )
    const draft = getDraftSnapshot(widgetSettings)

    return {
      systemPrompt: draft.systemPrompt?.trim() || SUPPORT_AGENT_PROMPT,
      enabledToolIds: draft.enabledToolIds,
      chatModel: draft.chatSettings?.model?.trim() || OPENAI_CHAT_MODEL,
    }
  },
})

/* ── run state ──────────────────────────────────────────────────────────── */

export const getRun = internalQuery({
  args: { runId: v.id("replayRuns") },
  handler: async (ctx, args) => await ctx.db.get(args.runId),
})

export const setQuestions = internalMutation({
  args: {
    runId: v.id("replayRuns"),
    items: v.array(v.object({ question: v.string(), before: v.string() })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      total: args.items.length,
      completed: 0,
      items: args.items,
      ...(args.items.length === 0
        ? { status: "done" as const, finishedAt: Date.now() }
        : {}),
    })
  },
})

export const recordAnswers = internalMutation({
  args: {
    runId: v.id("replayRuns"),
    answers: v.array(
      v.object({
        index: v.number(),
        after: v.string(),
        actions: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId)

    if (!run) {
      return
    }

    const items = run.items.slice()

    for (const answer of args.answers) {
      const item = items[answer.index]

      if (item) {
        items[answer.index] = {
          ...item,
          after: answer.after,
          actions: answer.actions.length ? answer.actions : undefined,
        }
      }
    }

    await ctx.db.patch(args.runId, {
      items,
      completed: Math.min(run.total, run.completed + args.answers.length),
    })
  },
})

export const setStatus = internalMutation({
  args: {
    runId: v.id("replayRuns"),
    status: v.union(
      v.literal("judging"),
      v.literal("done"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: args.status,
      ...(args.error ? { error: args.error } : {}),
      ...(args.status !== "judging" ? { finishedAt: Date.now() } : {}),
    })
  },
})

export const recordVerdicts = internalMutation({
  args: {
    runId: v.id("replayRuns"),
    verdicts: v.array(
      v.object({
        index: v.number(),
        verdict: v.union(
          v.literal("same"),
          v.literal("better"),
          v.literal("worse"),
          v.literal("different")
        ),
        note: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId)

    if (!run) {
      return
    }

    const items = run.items.slice()

    for (const verdict of args.verdicts) {
      const item = items[verdict.index]

      if (item) {
        items[verdict.index] = {
          ...item,
          verdict: verdict.verdict,
          note: verdict.note?.trim() || undefined,
        }
      }
    }

    await ctx.db.patch(args.runId, {
      items,
      status: "done",
      finishedAt: Date.now(),
    })
  },
})

/* ── the sandbox ────────────────────────────────────────────────────────── */

const buildParameterSchema = (
  parameters: Doc<"assistantTools">["parameters"]
) => {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const parameter of parameters) {
    let field: z.ZodTypeAny =
      parameter.type === "number"
        ? z.number()
        : parameter.type === "boolean"
          ? z.boolean()
          : z.string()

    field = field.describe(parameter.description)
    shape[parameter.name] = parameter.required ? field : field.optional()
  }

  return z.object(shape)
}

const NOT_RUN_RESULT =
  "(Test run: this action was not really performed and returned no data. Answer as you would if it had worked.)"

/**
 * The assistant's tools, made safe to call: knowledge search is real, the rest
 * only note that they were reached for. `actions` collects the tool types, so
 * the owner can see a draft that now books or hands off where it used to answer.
 */
const buildSandboxTools = (
  ctx: any,
  {
    organizationId,
    tools,
    useLegacyTools,
    model,
    openAISecretValue,
    actions,
  }: {
    organizationId: string
    tools: Doc<"assistantTools">[]
    useLegacyTools: boolean
    model: string
    openAISecretValue?: string | null
    actions: string[]
  }
) => {
  const searchKnowledge = async (query: unknown) =>
    await answerFromKnowledgeBase(ctx, {
      organizationId,
      query:
        typeof query === "string" && query.trim()
          ? query.trim()
          : "Information related to the customer's question.",
      model,
      openAISecretValue,
    })
  const standIn = (type: string, result: string) => async () => {
    if (!actions.includes(type)) {
      actions.push(type)
    }

    return result
  }
  const sandbox: Record<string, any> = {}

  if (useLegacyTools) {
    sandbox.searchTool = tool({
      description:
        "Search the knowledge base for relevant information to help answer user questions",
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }) => await searchKnowledge(query),
    })
    sandbox.escalateConversationTool = tool({
      description: "Escalate the conversation to a human operator",
      inputSchema: z.object({}),
      execute: standIn(
        "handoff",
        "The conversation has been escalated to a human operator."
      ),
    })
    sandbox.resolveConversationTool = tool({
      description: "Mark the conversation as resolved",
      inputSchema: z.object({}),
      execute: standIn("resolve", "The conversation has been marked resolved."),
    })

    return sandbox
  }

  for (const configured of tools) {
    const inputSchema =
      configured.parameters.length > 0
        ? buildParameterSchema(configured.parameters)
        : z.object({})

    sandbox[configured.name] = tool({
      description: configured.description,
      inputSchema,
      execute:
        configured.type === "query"
          ? async (args: Record<string, unknown>) =>
              await searchKnowledge(args.query)
          : configured.type === "handoff"
            ? standIn(
                "handoff",
                "The conversation has been escalated to a human operator. Tell the user a teammate will pick this up shortly."
              )
            : configured.type === "resolve"
              ? standIn(
                  "resolve",
                  "The conversation has been marked resolved. Close off warmly."
                )
              : standIn(configured.type, NOT_RUN_RESULT),
    })
  }

  return sandbox
}

const JUDGE_PROMPT = (language: keyof typeof LANGUAGE_NAMES) => `You compare two answers a business's AI assistant gave to the same real customer question.
BEFORE is what the customer was actually told. AFTER is what the assistant would say now, with the owner's new settings. In AFTER, bookings, lookups and other actions did not really run in this test — do not count that against it.

For each item give a verdict:
- "same": the substance is the same, even if the wording differs
- "better": AFTER is more accurate, complete, specific or helpful
- "worse": AFTER loses information, is wrong or vaguer, refuses, replies in a different language than the customer wrote in, or hands the customer to a person without need
- "different": it changed in a way that is neither clearly better nor worse

and a note of at most 12 words saying what changed, written in ${LANGUAGE_NAMES[language]}. Leave the note empty for "same".

Return only JSON: {"results":[{"index":0,"verdict":"same","note":""}]}`

const parseVerdicts = (text: string, count: number) => {
  const match = text.match(/\{[\s\S]*\}/)

  if (!match) {
    return []
  }

  try {
    const parsed = JSON.parse(match[0])
    const results = Array.isArray(parsed?.results) ? parsed.results : []

    return results
      .filter(
        (result: any) =>
          Number.isInteger(result?.index) &&
          result.index >= 0 &&
          result.index < count &&
          ["same", "better", "worse", "different"].includes(result.verdict)
      )
      .map((result: any) => ({
        index: result.index as number,
        verdict: result.verdict as "same" | "better" | "worse" | "different",
        note:
          typeof result.note === "string"
            ? truncate(result.note.trim(), 140)
            : undefined,
      }))
  } catch {
    return []
  }
}

export const run = internalAction({
  args: { runId: v.id("replayRuns") },
  handler: async (ctx, args) => {
    const runDoc: Doc<"replayRuns"> | null = await ctx.runQuery(
      (internal as any).system.replay.getRun,
      { runId: args.runId }
    )

    if (!runDoc) {
      return
    }

    try {
      const pairs: Array<{ question: string; before: string }> =
        await ctx.runQuery((internal as any).system.replay.collectQuestions, {
          organizationId: runDoc.organizationId,
          agentId: runDoc.agentId,
        })

      await ctx.runMutation((internal as any).system.replay.setQuestions, {
        runId: args.runId,
        items: pairs,
      })

      if (pairs.length === 0) {
        return
      }

      const settings = await ctx.runQuery(
        (internal as any).system.replay.getDraftSettings,
        { organizationId: runDoc.organizationId, agentId: runDoc.agentId }
      )
      const openAIPlugin = await ctx.runQuery(
        internal.system.plugins.getByOrganizationIdAndService,
        { organizationId: runDoc.organizationId, service: "openai_realtime" }
      )
      const configuredTools: Doc<"assistantTools">[] = await ctx.runQuery(
        internal.system.assistantTools.listEnabledForOrganization,
        { organizationId: runDoc.organizationId, channel: "chat" }
      )
      const activeTools = filterAssistantToolsByIds(
        configuredTools,
        settings.enabledToolIds as Id<"assistantTools">[] | undefined
      )
      const useLegacyTools =
        activeTools.length === 0 && settings.enabledToolIds === undefined
      const system = buildToolAwareSystemPrompt(
        settings.systemPrompt,
        activeTools
      )
      const model = getOpenAIChatModelFromSecretValue(
        openAIPlugin?.secretValue,
        settings.chatModel
      )

      for (let start = 0; start < pairs.length; start += PARALLEL_ANSWERS) {
        const batch = pairs
          .slice(start, start + PARALLEL_ANSWERS)
          .map((pair, offset) => ({ ...pair, index: start + offset }))
        const answers = await Promise.all(
          batch.map(async (pair) => {
            const actions: string[] = []

            try {
              const result = await generateText({
                model,
                system,
                prompt: pair.question,
                tools: buildSandboxTools(ctx, {
                  organizationId: runDoc.organizationId,
                  tools: activeTools,
                  useLegacyTools,
                  model: settings.chatModel,
                  openAISecretValue: openAIPlugin?.secretValue,
                  actions,
                }),
                stopWhen: stepCountIs(6),
                maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
              })

              return { index: pair.index, after: result.text.trim(), actions }
            } catch (error) {
              console.error("Replaying a question failed", error)
              return { index: pair.index, after: "", actions }
            }
          })
        )

        await ctx.runMutation((internal as any).system.replay.recordAnswers, {
          runId: args.runId,
          answers,
        })
      }

      await ctx.runMutation((internal as any).system.replay.setStatus, {
        runId: args.runId,
        status: "judging",
      })

      const answered: Doc<"replayRuns"> | null = await ctx.runQuery(
        (internal as any).system.replay.getRun,
        { runId: args.runId }
      )
      const items = answered?.items ?? []
      const judged = await generateText({
        model: getOpenAIChatModelFromSecretValue(openAIPlugin?.secretValue),
        maxOutputTokens: 1500,
        system: JUDGE_PROMPT(runDoc.language),
        prompt: items
          .map(
            (item, index) =>
              `#${index}\nQuestion: ${truncate(item.question, 300)}\nBEFORE: ${truncate(item.before, 700)}\nAFTER: ${truncate(item.after || "(no reply)", 700)}`
          )
          .join("\n\n"),
      })

      await ctx.runMutation((internal as any).system.replay.recordVerdicts, {
        runId: args.runId,
        verdicts: parseVerdicts(judged.text, items.length),
      })
    } catch (error) {
      console.error("Replay failed", error)
      await ctx.runMutation((internal as any).system.replay.setStatus, {
        runId: args.runId,
        status: "failed",
        error: error instanceof Error ? error.message.slice(0, 300) : "failed",
      })
    }
  },
})
