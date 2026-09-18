import { v } from "convex/values"

import type { Doc, Id } from "../../_generated/dataModel"
import { internalMutation, internalQuery } from "../../_generated/server"
import {
  createAssistantToolForOrganization,
  listOrganizationTools,
  removeAssistantToolForOrganization,
  updateAssistantToolForOrganization,
} from "../../private/assistantTools"
import {
  createSavedReplyForOrganization,
  listSavedRepliesForOrganization,
  updateSavedReplyForOrganization,
} from "../../private/savedReplies"
import {
  serializeSavedReply,
  serializeTool,
} from "../../lib/developerApi/serialize"
import { requireOwnedDoc } from "./shared"

const parameterValidator = v.object({
  name: v.string(),
  description: v.string(),
  type: v.union(v.literal("string"), v.literal("number"), v.literal("boolean")),
  required: v.boolean(),
})

/* ── tools ───────────────────────────────────────────────────────────────── */

export const listTools = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const tools = await listOrganizationTools(ctx, args.organizationId)

    return tools
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(serializeTool)
  },
})

export const getTool = internalQuery({
  args: { organizationId: v.string(), toolId: v.string() },
  handler: async (ctx, args) =>
    serializeTool(
      await requireOwnedDoc(
        ctx,
        "assistantTools",
        args.toolId,
        args.organizationId,
        "Tool"
      )
    ),
})

export const createTool = internalMutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("google_sheets"),
      v.literal("google_calendar"),
      v.literal("api_request"),
      v.literal("custom_webhook")
    ),
    parameters: v.array(parameterValidator),
    // Checked field by field by the tool's own validation.
    config: v.optional(v.any()),
    enabled: v.boolean(),
    chat: v.boolean(),
    voice: v.boolean(),
  },
  handler: async (ctx, args) => {
    const toolId = await createAssistantToolForOrganization(
      ctx,
      args.organizationId,
      {
        name: args.name,
        description: args.description,
        type: args.type,
        isEnabled: args.enabled,
        enabledForChat: args.chat,
        enabledForVoice: args.voice,
        parameters: args.parameters,
        config: args.config as Doc<"assistantTools">["config"],
      }
    )

    return serializeTool((await ctx.db.get(toolId))!)
  },
})

export const updateTool = internalMutation({
  args: {
    organizationId: v.string(),
    toolId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    parameters: v.optional(v.array(parameterValidator)),
    config: v.optional(v.any()),
    enabled: v.optional(v.boolean()),
    chat: v.optional(v.boolean()),
    voice: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tool = await requireOwnedDoc(
      ctx,
      "assistantTools",
      args.toolId,
      args.organizationId,
      "Tool"
    )

    await updateAssistantToolForOrganization(ctx, args.organizationId, {
      toolId: tool._id,
      name: args.name,
      description: args.description,
      parameters: args.parameters,
      config: args.config as Doc<"assistantTools">["config"],
      isEnabled: args.enabled,
      enabledForChat: args.chat,
      enabledForVoice: args.voice,
    })

    return serializeTool((await ctx.db.get(tool._id))!)
  },
})

export const removeTool = internalMutation({
  args: { organizationId: v.string(), toolId: v.string() },
  handler: async (ctx, args) => {
    const tool = await requireOwnedDoc(
      ctx,
      "assistantTools",
      args.toolId,
      args.organizationId,
      "Tool"
    )

    await removeAssistantToolForOrganization(ctx, args.organizationId, {
      toolId: tool._id,
    })

    return { id: tool._id, object: "tool", deleted: true }
  },
})

/* ── saved replies ───────────────────────────────────────────────────────── */

export const listSavedReplies = internalQuery({
  args: {
    organizationId: v.string(),
    search: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const replies = await listSavedRepliesForOrganization(
      ctx,
      args.organizationId,
      args
    )

    return (replies as Doc<"savedReplies">[]).map(serializeSavedReply)
  },
})

export const createSavedReply = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    title: v.string(),
    body: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const savedReplyId = await createSavedReplyForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      args
    )

    return serializeSavedReply(
      (await ctx.db.get(savedReplyId as Id<"savedReplies">))!
    )
  },
})

export const updateSavedReply = internalMutation({
  args: {
    organizationId: v.string(),
    savedReplyId: v.string(),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const reply = await requireOwnedDoc(
      ctx,
      "savedReplies",
      args.savedReplyId,
      args.organizationId,
      "Saved reply"
    )

    await updateSavedReplyForOrganization(ctx, args.organizationId, {
      savedReplyId: reply._id,
      title: args.title ?? reply.title,
      body: args.body ?? reply.body,
      category:
        args.category === undefined
          ? reply.category
          : (args.category ?? undefined),
    })

    return serializeSavedReply((await ctx.db.get(reply._id))!)
  },
})

export const removeSavedReply = internalMutation({
  args: { organizationId: v.string(), savedReplyId: v.string() },
  handler: async (ctx, args) => {
    const reply = await requireOwnedDoc(
      ctx,
      "savedReplies",
      args.savedReplyId,
      args.organizationId,
      "Saved reply"
    )

    await ctx.db.delete(reply._id)

    return { id: reply._id, object: "saved_reply", deleted: true }
  },
})
