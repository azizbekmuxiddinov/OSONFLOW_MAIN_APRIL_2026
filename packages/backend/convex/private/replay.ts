import { ConvexError, v } from "convex/values"
import { internal } from "../_generated/api"
import { mutation, query } from "../_generated/server"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"
import { enforceRateLimit } from "../lib/rateLimits"
import { getWidgetSettingsByOrganizationId } from "./widgetSettings"

const normalizeAgentId = (agentId?: string) => agentId?.trim() || "default"

/**
 * Starts a check of the draft against real customer questions. The run works
 * in the background and the page follows it through `getLatest`.
 */
export const start = mutation({
  args: {
    agentId: v.optional(v.string()),
    language: v.union(v.literal("en"), v.literal("uz"), v.literal("ru")),
  },
  handler: async (ctx, args) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)
    const agentId = normalizeAgentId(args.agentId)
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique()

    if (subscription?.status !== "active") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Testing changes is part of the paid plan.",
      })
    }

    await enforceRateLimit(ctx, "replayRunByOrg", {
      key: orgId,
      message: "You have run several checks this hour. Please try again a little later.",
    })

    const widgetSettings = await getWidgetSettingsByOrganizationId(
      ctx,
      orgId,
      agentId
    )
    const runId = await ctx.db.insert("replayRuns", {
      organizationId: orgId,
      agentId,
      createdBy: identity.subject,
      language: args.language,
      status: "running",
      total: 0,
      completed: 0,
      items: [],
      // Same fallback the customization page shows, so the two compare equal.
      draftUpdatedAt:
        widgetSettings?.draftUpdatedAt ?? widgetSettings?._creationTime,
      createdAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, (internal as any).system.replay.run, {
      runId,
    })

    return { runId }
  },
})

export const getLatest = query({
  args: { agentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrganizationIdentity(ctx)

    return await ctx.db
      .query("replayRuns")
      .withIndex("by_organization_id_and_agent_id", (q) =>
        q.eq("organizationId", orgId).eq("agentId", normalizeAgentId(args.agentId))
      )
      .order("desc")
      .first()
  },
})
