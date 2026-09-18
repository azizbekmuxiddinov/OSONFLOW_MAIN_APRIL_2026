import { ConvexError, v } from "convex/values"
import type { Doc, Id, TableNames } from "../../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../../_generated/server"

/**
 * Helpers shared by the developer API's internal functions. Ids arrive as
 * plain strings from a URL, so each one is checked against its table and its
 * organization before use. Anything that belongs to another organization is
 * reported as missing rather than forbidden, so an id from one tenant cannot
 * be used to learn that it exists in another.
 */

export const notFound = (what: string) =>
  new ConvexError({ code: "NOT_FOUND", message: `${what} not found.` })

export const badRequest = (message: string) =>
  new ConvexError({ code: "BAD_REQUEST", message })

export const conflict = (message: string) =>
  new ConvexError({ code: "CONFLICT", message })

export const requireDocId = <T extends TableNames>(
  ctx: QueryCtx | MutationCtx,
  table: T,
  id: string,
  what: string
): Id<T> => {
  const normalized = ctx.db.normalizeId(table, id)

  if (!normalized) {
    throw notFound(what)
  }

  return normalized
}

type OrganizationTable = {
  [T in TableNames]: Doc<T> extends { organizationId: string } ? T : never
}[TableNames]

export const requireOwnedDoc = async <T extends OrganizationTable>(
  ctx: QueryCtx | MutationCtx,
  table: T,
  id: string,
  organizationId: string,
  what: string
): Promise<Doc<T>> => {
  const doc = (await ctx.db.get(requireDocId(ctx, table, id, what))) as
    | (Doc<T> & { organizationId: string })
    | null

  if (!doc || doc.organizationId !== organizationId) {
    throw notFound(what)
  }

  return doc
}

export const paginationArgs = {
  limit: v.number(),
  cursor: v.optional(v.union(v.string(), v.null())),
}

export const toPaginationOpts = (args: {
  limit: number
  cursor?: string | null
}) => ({
  numItems: args.limit,
  cursor: args.cursor ?? null,
})
