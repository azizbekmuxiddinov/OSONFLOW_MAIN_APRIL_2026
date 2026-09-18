import { v } from "convex/values"
import type { EntryId } from "@convex-dev/rag"

import { internalMutation, internalQuery } from "../../_generated/server"
import rag from "../ai/rag"
import {
  convertEntryToPublicFile,
  deleteKnowledgeEntryForOrganization,
  listKnowledgeForOrganization,
} from "../../private/files"
import { serializeKnowledgeEntry } from "../../lib/developerApi/serialize"
import { notFound, paginationArgs, toPaginationOpts } from "./shared"

/** Knowledge entries live in a component, so their ids cannot be normalised. */
const loadOwnedEntry = async (
  ctx: Parameters<typeof rag.getEntry>[0],
  organizationId: string,
  entryId: string
) => {
  try {
    const entry = await rag.getEntry(ctx, { entryId: entryId as EntryId })

    return entry && entry.metadata?.uploadedBy === organizationId ? entry : null
  } catch {
    // A malformed id is simply an entry that does not exist.
    return null
  }
}

export const list = internalQuery({
  args: {
    organizationId: v.string(),
    category: v.optional(v.string()),
    ...paginationArgs,
  },
  handler: async (ctx, args) => {
    const result = await listKnowledgeForOrganization(
      ctx,
      args.organizationId,
      {
        category: args.category,
        paginationOpts: toPaginationOpts(args),
      }
    )

    return {
      items: result.page.map((file) => serializeKnowledgeEntry(file)),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    }
  },
})

export const get = internalQuery({
  args: { organizationId: v.string(), entryId: v.string() },
  handler: async (ctx, args) => {
    const entry = await loadOwnedEntry(ctx, args.organizationId, args.entryId)

    if (!entry) {
      throw notFound("Knowledge entry")
    }

    const sourceUrl = entry.metadata?.sourceUrl

    return serializeKnowledgeEntry(
      await convertEntryToPublicFile(ctx, entry),
      typeof sourceUrl === "string" ? sourceUrl : null
    )
  },
})

/** Confirms an entry belongs to the organization before an action reads it. */
export const assertOwned = internalQuery({
  args: { organizationId: v.string(), entryId: v.string() },
  handler: async (ctx, args) => {
    if (!(await loadOwnedEntry(ctx, args.organizationId, args.entryId))) {
      throw notFound("Knowledge entry")
    }

    return null
  },
})

export const remove = internalMutation({
  args: { organizationId: v.string(), entryId: v.string() },
  handler: async (ctx, args) => {
    const entry = await loadOwnedEntry(ctx, args.organizationId, args.entryId)

    if (!entry) {
      throw notFound("Knowledge entry")
    }

    await deleteKnowledgeEntryForOrganization(
      ctx,
      args.organizationId,
      entry.entryId
    )

    return {
      id: entry.entryId as string,
      object: "knowledge_entry",
      deleted: true,
    }
  },
})
