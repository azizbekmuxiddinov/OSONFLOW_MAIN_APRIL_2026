import { v } from "convex/values"

import type { Id } from "../../_generated/dataModel"
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "../../_generated/server"
import {
  createAgentForOrganization,
  getCustomizationStateForOrganization,
  getDraftSnapshot,
  getWidgetSettingsByOrganizationId,
  listAgentsForOrganization,
  normalizeAgentId,
  publishDraftForOrganization,
  renameAgentForOrganization,
  rollbackToVersionForOrganization,
  saveDraftForOrganization,
  type WidgetSettingsSnapshot,
} from "../../private/widgetSettings"
import {
  iso,
  serializeAssistantSettings,
  serializeAssistantSummary,
} from "../../lib/developerApi/serialize"
import { badRequest, notFound } from "./shared"

const DEFAULT_AGENT_ID = "default"

/** The default assistant exists before its first save; any other must. */
const requireAssistant = async (
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  assistantId: string
) => {
  const agentId = normalizeAgentId(assistantId)
  const settings = await getWidgetSettingsByOrganizationId(
    ctx,
    organizationId,
    agentId
  )

  if (!settings && agentId !== DEFAULT_AGENT_ID) {
    throw notFound("Assistant")
  }

  return { agentId, settings }
}

const loadAssistant = async (
  ctx: QueryCtx | MutationCtx,
  organizationId: string,
  agentId: string
) => {
  const [state, agents] = await Promise.all([
    getCustomizationStateForOrganization(ctx, organizationId, { agentId }),
    listAgentsForOrganization(ctx, organizationId),
  ])
  const summary = agents.agents.find(
    (agent: { agentId: string }) => agent.agentId === agentId
  )

  return {
    ...serializeAssistantSummary(
      summary ?? {
        agentId,
        name: state.agentName,
        isDefault: agentId === DEFAULT_AGENT_ID,
        publishedVersion: state.publishedVersion,
        updatedAt: state.draftUpdatedAt,
      }
    ),
    publishedAt: iso(state.publishedAt),
    hasUnpublishedChanges: state.isDraftDifferentFromPublished,
    published: serializeAssistantSettings(state.published),
    draft: serializeAssistantSettings(state.draft),
    versions: state.versions.map((version: any) => ({
      version: version.version,
      action: version.action,
      publishedAt: iso(version.publishedAt),
      rolledBackFrom: version.sourceVersion ?? null,
    })),
  }
}

export const list = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const result = await listAgentsForOrganization(ctx, args.organizationId)

    return {
      items: result.agents.map(serializeAssistantSummary),
      maxAssistants: result.limit as number,
    }
  },
})

export const get = internalQuery({
  args: { organizationId: v.string(), assistantId: v.string() },
  handler: async (ctx, args) => {
    const { agentId } = await requireAssistant(
      ctx,
      args.organizationId,
      args.assistantId
    )

    return await loadAssistant(ctx, args.organizationId, agentId)
  },
})

export const create = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { agentId } = await createAgentForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      { name: args.name }
    )

    return await loadAssistant(ctx, args.organizationId, agentId)
  },
})

/**
 * Merges a partial change into the draft. Objects such as `theme` merge key
 * by key, so a caller can change one colour without restating the rest; the
 * draft is then normalised exactly as a save from the designer would be.
 */
export const update = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    assistantId: v.string(),
    name: v.optional(v.string()),
    greeting: v.optional(v.string()),
    instructions: v.optional(v.union(v.string(), v.null())),
    model: v.optional(v.union(v.string(), v.null())),
    suggestions: v.optional(v.array(v.string())),
    toolIds: v.optional(v.array(v.string())),
    // Shapes are checked against the schema's fields before this is called.
    copy: v.optional(v.any()),
    theme: v.optional(v.any()),
    appearance: v.optional(v.any()),
    publish: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { agentId, settings } = await requireAssistant(
      ctx,
      args.organizationId,
      args.assistantId
    )
    const current: WidgetSettingsSnapshot = getDraftSnapshot(settings)
    const next: WidgetSettingsSnapshot = { ...current }
    let changed = false

    if (args.greeting !== undefined) {
      next.greetMessage = args.greeting
      changed = true
    }

    if (args.instructions !== undefined) {
      next.systemPrompt = args.instructions ?? undefined
      changed = true
    }

    if (args.model !== undefined) {
      next.chatSettings = {
        ...current.chatSettings,
        model: args.model ?? undefined,
      }
      changed = true
    }

    if (args.suggestions !== undefined) {
      const [suggestion1, suggestion2, suggestion3] = args.suggestions
      next.defaultSuggestions = { suggestion1, suggestion2, suggestion3 }
      changed = true
    }

    if (args.toolIds !== undefined) {
      const toolIds: Id<"assistantTools">[] = []

      for (const id of args.toolIds) {
        const toolId = ctx.db.normalizeId("assistantTools", id)
        const tool = toolId ? await ctx.db.get(toolId) : null

        if (!tool || tool.organizationId !== args.organizationId) {
          throw badRequest(`toolIds: tool "${id}" does not exist.`)
        }

        toolIds.push(tool._id)
      }

      next.enabledToolIds = toolIds
      changed = true
    }

    if (args.copy !== undefined) {
      next.widgetCopy = { ...current.widgetCopy, ...args.copy }
      changed = true
    }

    if (args.theme !== undefined) {
      next.theme = { ...current.theme, ...args.theme }
      changed = true
    }

    if (args.appearance !== undefined) {
      next.appearance = { ...current.appearance, ...args.appearance }
      changed = true
    }

    if (changed) {
      await saveDraftForOrganization(
        ctx,
        args.organizationId,
        agentId,
        args.actorId,
        next
      )
    }

    if (args.name !== undefined) {
      if (!settings && !changed) {
        // Renaming needs a row; saving the unchanged draft creates it.
        await saveDraftForOrganization(
          ctx,
          args.organizationId,
          agentId,
          args.actorId,
          current
        )
      }

      await renameAgentForOrganization(ctx, args.organizationId, {
        agentId,
        name: args.name,
      })
    }

    if (args.publish) {
      if (!changed && args.name === undefined && !settings) {
        await saveDraftForOrganization(
          ctx,
          args.organizationId,
          agentId,
          args.actorId,
          current
        )
      }

      await publishDraftForOrganization(
        ctx,
        args.organizationId,
        args.actorId,
        {
          agentId,
        }
      )
    }

    return await loadAssistant(ctx, args.organizationId, agentId)
  },
})

export const publish = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    assistantId: v.string(),
  },
  handler: async (ctx, args) => {
    const { agentId, settings } = await requireAssistant(
      ctx,
      args.organizationId,
      args.assistantId
    )

    if (!settings) {
      await saveDraftForOrganization(
        ctx,
        args.organizationId,
        agentId,
        args.actorId,
        getDraftSnapshot(null)
      )
    }

    const { publishedVersion } = await publishDraftForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      { agentId }
    )

    return { id: agentId, object: "assistant", publishedVersion }
  },
})

export const rollback = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    assistantId: v.string(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    const { agentId } = await requireAssistant(
      ctx,
      args.organizationId,
      args.assistantId
    )
    const result = await rollbackToVersionForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      { agentId, version: args.version }
    )

    return {
      id: agentId,
      object: "assistant",
      publishedVersion: result.publishedVersion,
      rolledBackFrom: result.rolledBackFromVersion,
    }
  },
})
