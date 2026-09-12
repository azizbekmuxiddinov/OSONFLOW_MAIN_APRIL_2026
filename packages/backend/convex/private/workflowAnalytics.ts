import { ConvexError, v } from "convex/values"
import { query, type QueryCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"

/**
 * How many runs one query reads. Sessions carry their execution trace and
 * variables inline, so a generous limit would blow the read budget long before
 * it made the numbers meaningfully better. The result reports how many runs it
 * actually covered so the dashboard can say so out loud instead of implying it
 * measured everything.
 */
const SESSION_SCAN_LIMIT = 250

/** A run that has not moved in this long is treated as abandoned, not live. */
const STALE_RUN_MS = 30 * 60 * 1000

const DEFAULT_WINDOW_DAYS = 30

type TraceEvent = {
  at: number
  level: string
  nodeId?: string
  nodeType?: string
  title: string
  detail?: string
}

type RunOutcome = "completed" | "abandoned" | "live"

const getWindowCutoff = (windowDays: number | undefined) => {
  const days = Math.max(1, Math.min(windowDays ?? DEFAULT_WINDOW_DAYS, 365))
  return { days, cutoff: Date.now() - days * 24 * 60 * 60 * 1000 }
}

const assertWorkflowAccess = async (
  ctx: QueryCtx,
  workflowId: Id<"workflows">,
  organizationId: string
) => {
  const workflow = await ctx.db.get(workflowId)

  if (!workflow || workflow.organizationId !== organizationId) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Workflow not found",
    })
  }

  return workflow
}

/**
 * Which bucket a run falls into. `reachedEnd` is the only positive signal:
 * everything else that stopped a run — an escalation, an error, a visitor who
 * simply stopped replying — is a drop-off, and a run that is merely between
 * turns is neither.
 */
const getRunOutcome = (session: Doc<"workflowSessions">, now: number): RunOutcome => {
  if (session.reachedEnd) {
    return "completed"
  }

  if (session.status === "ended") {
    return "abandoned"
  }

  return now - session.updatedAt > STALE_RUN_MS ? "abandoned" : "live"
}

const loadSessions = async (
  ctx: QueryCtx,
  workflowId: Id<"workflows">,
  cutoff: number
) =>
  await ctx.db
    .query("workflowSessions")
    .withIndex("by_workflow_id_and_started_at", (q) =>
      q.eq("workflowId", workflowId).gte("startedAt", cutoff)
    )
    .order("desc")
    .take(SESSION_SCAN_LIMIT)

/**
 * Per-node run counts for the canvas heatmap.
 *
 * Node ids that no longer exist in the saved definition are dropped, which is
 * what keeps a component's steps — they run inside the caller's session — from
 * showing up as phantom heat on the wrong canvas.
 */
export const getNodeStats = query({
  args: {
    workflowId: v.id("workflows"),
    windowDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const workflow = await assertWorkflowAccess(ctx, args.workflowId, orgId)
    const { days, cutoff } = getWindowCutoff(args.windowDays)
    const now = Date.now()

    const sessions = await loadSessions(ctx, args.workflowId, cutoff)

    // Matched against the draft, not the published snapshot: the heatmap is
    // drawn over the canvas the builder is showing, so a step that was added
    // since the last publish should read as cold rather than go unmentioned.
    const definition = workflow.definition as { nodes?: Array<{ id: string }> }
    const knownNodeIds = new Set(
      (definition.nodes ?? []).map((node) => node.id)
    )

    const entered = new Map<string, number>()
    const reachedBy = new Map<string, number>()
    const stoppedHere = new Map<string, number>()
    const errors = new Map<string, number>()

    let completed = 0
    let abandoned = 0
    let live = 0

    for (const session of sessions) {
      const outcome = getRunOutcome(session, now)

      if (outcome === "completed") {
        completed += 1
      } else if (outcome === "abandoned") {
        abandoned += 1
      } else {
        live += 1
      }

      const visits = (session.nodeVisits ?? {}) as Record<string, number>

      for (const [nodeId, count] of Object.entries(visits)) {
        if (!knownNodeIds.has(nodeId)) {
          continue
        }

        entered.set(nodeId, (entered.get(nodeId) ?? 0) + count)
        reachedBy.set(nodeId, (reachedBy.get(nodeId) ?? 0) + 1)
      }

      // Only a run that actually gave up marks its last step as a drop-off; a
      // run still in flight has not dropped anything yet.
      if (outcome === "abandoned" && session.lastNodeId) {
        if (knownNodeIds.has(session.lastNodeId)) {
          stoppedHere.set(
            session.lastNodeId,
            (stoppedHere.get(session.lastNodeId) ?? 0) + 1
          )
        }
      }

      // Best effort: the trace is a ring buffer, so errors older than the last
      // 80 events of a long run are no longer visible here.
      for (const event of (session.executionTrace ?? []) as TraceEvent[]) {
        if (event.level !== "error" || !event.nodeId) {
          continue
        }

        if (knownNodeIds.has(event.nodeId)) {
          errors.set(event.nodeId, (errors.get(event.nodeId) ?? 0) + 1)
        }
      }
    }

    const totalRuns = sessions.length
    const busiest = Math.max(0, ...entered.values())

    const nodes = Array.from(knownNodeIds).map((nodeId) => {
      const runsReached = reachedBy.get(nodeId) ?? 0

      return {
        nodeId,
        /** Total entries, counting a step a loop passes through more than once. */
        entered: entered.get(nodeId) ?? 0,
        /** Distinct runs that got here at least once. */
        runsReached,
        stoppedHere: stoppedHere.get(nodeId) ?? 0,
        errors: errors.get(nodeId) ?? 0,
        /** Share of runs that reached this step, 0–1. */
        reachRate: totalRuns === 0 ? 0 : runsReached / totalRuns,
        /** Share of the busiest step's traffic, 0–1. Drives the canvas tint. */
        heat: busiest === 0 ? 0 : (entered.get(nodeId) ?? 0) / busiest,
      }
    })

    return {
      windowDays: days,
      totalRuns,
      completed,
      abandoned,
      live,
      /** True when older runs exist beyond what one query can read. */
      truncated: sessions.length === SESSION_SCAN_LIMIT,
      nodes,
    }
  },
})

/**
 * Recent runs of a workflow, newest first, for the replay picker. Returns only
 * what the list renders — the trace itself is fetched per run by `getSession`.
 */
export const listSessions = query({
  args: {
    workflowId: v.id("workflows"),
    windowDays: v.optional(v.number()),
    outcome: v.optional(
      v.union(
        v.literal("completed"),
        v.literal("abandoned"),
        v.literal("live")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    await assertWorkflowAccess(ctx, args.workflowId, orgId)
    const { days, cutoff } = getWindowCutoff(args.windowDays)
    const now = Date.now()
    const limit = Math.max(1, Math.min(args.limit ?? 50, SESSION_SCAN_LIMIT))

    const sessions = await loadSessions(ctx, args.workflowId, cutoff)

    const matching = sessions.filter(
      (session) =>
        !args.outcome || getRunOutcome(session, now) === args.outcome
    )

    const rows = await Promise.all(
      matching.slice(0, limit).map(async (session) => {
        const contact = await ctx.db.get(session.contactSessionId)
        const trace = (session.executionTrace ?? []) as TraceEvent[]
        const visits = (session.nodeVisits ?? {}) as Record<string, number>

        return {
          id: session._id,
          conversationId: session.conversationId,
          outcome: getRunOutcome(session, now),
          status: session.status,
          startedAt: session.startedAt,
          updatedAt: session.updatedAt,
          endedAt: session.endedAt,
          durationMs: (session.endedAt ?? session.updatedAt) - session.startedAt,
          lastNodeId: session.lastNodeId ?? null,
          /** Total steps taken, which survives the trace being truncated. */
          stepCount: Object.values(visits).reduce(
            (total, count) => total + count,
            0
          ),
          errorCount: trace.filter((event) => event.level === "error").length,
          contactName:
            contact && contact.organizationId === orgId ? contact.name : "Visitor",
        }
      })
    )

    return {
      windowDays: days,
      runs: rows,
      truncated: sessions.length === SESSION_SCAN_LIMIT,
    }
  },
})

/** One run's full trace and collected variables, for step-through replay. */
export const getSession = query({
  args: {
    sessionId: v.id("workflowSessions"),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)
    const session = await ctx.db.get(args.sessionId)

    if (!session || session.organizationId !== orgId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Run not found",
      })
    }

    const contact = await ctx.db.get(session.contactSessionId)
    const trace = (session.executionTrace ?? []) as TraceEvent[]
    const visits = (session.nodeVisits ?? {}) as Record<string, number>
    const stepCount = Object.values(visits).reduce(
      (total, count) => total + count,
      0
    )

    // Every step entry writes one "step" event, so comparing the two is how we
    // know whether the ring buffer dropped the beginning of a long run.
    const tracedSteps = trace.filter((event) => event.level === "step").length

    return {
      id: session._id,
      workflowId: session.workflowId,
      conversationId: session.conversationId,
      outcome: getRunOutcome(session, Date.now()),
      status: session.status,
      startedAt: session.startedAt,
      updatedAt: session.updatedAt,
      endedAt: session.endedAt,
      lastNodeId: session.lastNodeId ?? null,
      contactName:
        contact && contact.organizationId === orgId ? contact.name : "Visitor",
      variables: (session.variables ?? {}) as Record<string, unknown>,
      nodeVisits: visits,
      stepCount,
      /** How many earlier steps the trace no longer holds. */
      droppedSteps: Math.max(0, stepCount - tracedSteps),
      trace,
    }
  },
})
