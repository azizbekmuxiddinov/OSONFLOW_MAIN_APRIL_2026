import { v } from "convex/values"

import type { Id } from "../../_generated/dataModel"
import { internalMutation, internalQuery } from "../../_generated/server"
import {
  deactivateWorkflowForOrganization,
  publishWorkflowForOrganization,
  removeWorkflowForOrganization,
  saveWorkflowForOrganization,
} from "../../private/workflows"
import {
  getWorkflowNodeStatsForOrganization,
  listWorkflowRunsForOrganization,
} from "../../private/workflowAnalytics"
import { iso, serializeWorkflow } from "../../lib/developerApi/serialize"
import { badRequest, conflict, requireOwnedDoc } from "./shared"

const definitionValidator = v.object({
  schemaVersion: v.number(),
  id: v.optional(v.string()),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  nodes: v.array(v.any()),
  edges: v.array(v.any()),
})

/* ── workflows ───────────────────────────────────────────────────────────── */

export const listWorkflows = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query("workflows")
      .withIndex("by_organization_id_and_updated_at", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .collect()

    return workflows.map((workflow) =>
      serializeWorkflow(workflow, { includeDefinitions: false })
    )
  },
})

export const getWorkflow = internalQuery({
  args: { organizationId: v.string(), workflowId: v.string() },
  handler: async (ctx, args) =>
    serializeWorkflow(
      await requireOwnedDoc(
        ctx,
        "workflows",
        args.workflowId,
        args.organizationId,
        "Workflow"
      ),
      { includeDefinitions: true }
    ),
})

export const saveWorkflow = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    workflowId: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    definition: v.optional(definitionValidator),
  },
  handler: async (ctx, args) => {
    const existing = args.workflowId
      ? await requireOwnedDoc(
          ctx,
          "workflows",
          args.workflowId,
          args.organizationId,
          "Workflow"
        )
      : null
    const definition = args.definition ?? existing?.definition

    if (!definition) {
      throw badRequest("definition is required for a new workflow.")
    }

    const saved = await saveWorkflowForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      {
        workflowId: existing?._id,
        name: args.name ?? existing?.name ?? "Untitled workflow",
        description:
          args.description === undefined
            ? existing?.description
            : args.description,
        definition: {
          ...definition,
          name:
            args.name ??
            existing?.name ??
            definition.name ??
            "Untitled workflow",
        },
      }
    )

    return serializeWorkflow((await ctx.db.get(saved.id as Id<"workflows">))!, {
      includeDefinitions: true,
    })
  },
})

export const publishWorkflow = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    workflowId: v.string(),
    activate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const workflow = await requireOwnedDoc(
      ctx,
      "workflows",
      args.workflowId,
      args.organizationId,
      "Workflow"
    )

    await publishWorkflowForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      {
        workflowId: workflow._id,
        activate: args.activate,
      }
    )

    return serializeWorkflow((await ctx.db.get(workflow._id))!, {
      includeDefinitions: false,
    })
  },
})

export const deactivateWorkflow = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    workflowId: v.string(),
  },
  handler: async (ctx, args) => {
    const workflow = await requireOwnedDoc(
      ctx,
      "workflows",
      args.workflowId,
      args.organizationId,
      "Workflow"
    )

    await deactivateWorkflowForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      { workflowId: workflow._id }
    )

    return serializeWorkflow((await ctx.db.get(workflow._id))!, {
      includeDefinitions: false,
    })
  },
})

export const removeWorkflow = internalMutation({
  args: { organizationId: v.string(), workflowId: v.string() },
  handler: async (ctx, args) => {
    const workflow = await requireOwnedDoc(
      ctx,
      "workflows",
      args.workflowId,
      args.organizationId,
      "Workflow"
    )

    if (workflow.isActive) {
      throw conflict("This workflow is live. Switch it off before deleting it.")
    }

    await removeWorkflowForOrganization(ctx, args.organizationId, {
      workflowId: workflow._id,
    })

    return { id: workflow._id, object: "workflow", deleted: true }
  },
})

export const workflowRuns = internalQuery({
  args: {
    organizationId: v.string(),
    workflowId: v.string(),
    windowDays: v.optional(v.number()),
    outcome: v.optional(
      v.union(v.literal("completed"), v.literal("abandoned"), v.literal("live"))
    ),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const workflow = await requireOwnedDoc(
      ctx,
      "workflows",
      args.workflowId,
      args.organizationId,
      "Workflow"
    )
    const result = await listWorkflowRunsForOrganization(
      ctx,
      args.organizationId,
      {
        workflowId: workflow._id,
        windowDays: args.windowDays,
        outcome: args.outcome,
        limit: args.limit,
      }
    )

    return result.runs.map((run) => ({
      id: run.id,
      object: "workflow_run" as const,
      conversationId: run.conversationId,
      outcome: run.outcome,
      status: run.status,
      contactName: run.contactName,
      stepCount: run.stepCount,
      errorCount: run.errorCount,
      lastNodeId: run.lastNodeId,
      durationMs: run.durationMs,
      startedAt: iso(run.startedAt),
      endedAt: iso(run.endedAt),
    }))
  },
})

export const workflowStats = internalQuery({
  args: {
    organizationId: v.string(),
    workflowId: v.string(),
    windowDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workflow = await requireOwnedDoc(
      ctx,
      "workflows",
      args.workflowId,
      args.organizationId,
      "Workflow"
    )
    const stats = await getWorkflowNodeStatsForOrganization(
      ctx,
      args.organizationId,
      { workflowId: workflow._id, windowDays: args.windowDays }
    )

    return {
      object: "workflow_stats" as const,
      windowDays: stats.windowDays,
      totalRuns: stats.totalRuns,
      completed: stats.completed,
      abandoned: stats.abandoned,
      live: stats.live,
      truncated: stats.truncated,
      nodes: stats.nodes.map((node) => ({
        nodeId: node.nodeId,
        entered: node.entered,
        runsReached: node.runsReached,
        stoppedHere: node.stoppedHere,
        errors: node.errors,
        reachRate: node.reachRate,
      })),
    }
  },
})
