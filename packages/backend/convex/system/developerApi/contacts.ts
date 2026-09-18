import { v } from "convex/values"

import type { Doc, Id } from "../../_generated/dataModel"
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "../../_generated/server"
import { internal } from "../../_generated/api"
import { SESSION_DURATION_MS } from "../../constants"
import {
  LEADS_LIST_SCAN_LIMIT,
  NEWCOMER_WINDOW_MS,
  loadLeads,
  toLeadRecord,
  type LeadSegment,
} from "../../private/leads"
import { hasActiveSubscription } from "../../private/customerMemories"
import {
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  NAME_MAX_LENGTH,
  normalizeContactDetails,
} from "../../public/contactSessions"
import { paginateArray } from "../../lib/paginateArray"
import {
  serializeContact,
  serializeCustomerMemory,
} from "../../lib/developerApi/serialize"
import {
  badRequest,
  paginationArgs,
  requireOwnedDoc,
  toPaginationOpts,
} from "./shared"

const METADATA_FIELD_MAX_LENGTH = 500

const loadContact = async (
  ctx: QueryCtx | MutationCtx,
  session: Doc<"contactSessions">
) => {
  const conversations = await ctx.db
    .query("conversations")
    .withIndex("by_contact_session_id", (q) =>
      q.eq("contactSessionId", session._id)
    )
    .collect()

  return serializeContact(
    toLeadRecord(session, conversations, Date.now() - NEWCOMER_WINDOW_MS),
    session
  )
}

export const list = internalQuery({
  args: {
    organizationId: v.string(),
    search: v.optional(v.string()),
    segment: v.optional(
      v.union(
        v.literal("all"),
        v.literal("waiting"),
        v.literal("newcomers"),
        v.literal("no_chats")
      )
    ),
    ...paginationArgs,
  },
  handler: async (ctx, args) => {
    const leads = await loadLeads(ctx, args.organizationId, {
      scanLimit: LEADS_LIST_SCAN_LIMIT,
      segment: args.segment as LeadSegment | undefined,
      searchQuery: args.search,
    })
    const result = paginateArray(leads, toPaginationOpts(args))
    const sessions = await Promise.all(
      result.page.map((lead) => ctx.db.get(lead.contactSessionId))
    )

    return {
      items: result.page.map((lead, index) =>
        serializeContact(lead, sessions[index] ?? null)
      ),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    }
  },
})

export const get = internalQuery({
  args: { organizationId: v.string(), contactId: v.string() },
  handler: async (ctx, args) => {
    const session = await requireOwnedDoc(
      ctx,
      "contactSessions",
      args.contactId,
      args.organizationId,
      "Contact"
    )

    return await loadContact(ctx, session)
  },
})

const optionalMetadataField = (value: string | undefined, name: string) => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return undefined
  }

  if (trimmed.length > METADATA_FIELD_MAX_LENGTH) {
    throw badRequest(
      `${name} must be ${METADATA_FIELD_MAX_LENGTH} characters or fewer.`
    )
  }

  return trimmed
}

const validateName = (name: string) => {
  if (!name || name.length > NAME_MAX_LENGTH) {
    throw badRequest(
      `name is required and must be ${NAME_MAX_LENGTH} characters or fewer.`
    )
  }
}

const validateEmail = (email: string) => {
  if (!EMAIL_PATTERN.test(email) || email.length > EMAIL_MAX_LENGTH) {
    throw badRequest(
      `email must be a valid address of ${EMAIL_MAX_LENGTH} characters or fewer.`
    )
  }
}

export const create = internalMutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    email: v.string(),
    externalId: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    pageUrl: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { name, email } = normalizeContactDetails(args)
    validateName(name)
    validateEmail(email)

    const contactSessionId: Id<"contactSessions"> = await ctx.runMutation(
      internal.public.contactSessions.createRecord,
      {
        organizationId: args.organizationId,
        name,
        email,
        metadata: {
          // Marks the contact as created through the API, which is also what
          // lets its `visitorId` be read back as the caller's own id.
          source: "api",
          visitorId: optionalMetadataField(args.externalId, "externalId"),
          language: optionalMetadataField(args.language, "language"),
          timezone: optionalMetadataField(args.timezone, "timezone"),
          currentUrl: optionalMetadataField(args.pageUrl, "pageUrl"),
          referrer: optionalMetadataField(args.referrer, "referrer"),
        },
      }
    )

    const session = await ctx.db.get(contactSessionId)
    return await loadContact(ctx, session!)
  },
})

export const update = internalMutation({
  args: {
    organizationId: v.string(),
    contactId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await requireOwnedDoc(
      ctx,
      "contactSessions",
      args.contactId,
      args.organizationId,
      "Contact"
    )
    const patch: Partial<Doc<"contactSessions">> = {}

    if (args.name !== undefined) {
      const name = args.name.trim()
      validateName(name)
      patch.name = name
    }

    if (args.email !== undefined) {
      const email = args.email.trim().toLowerCase()
      validateEmail(email)
      patch.email = email
      // An address makes an anonymous visitor a real contact, as it does
      // when they identify themselves in the widget.
      patch.isAnonymous = false
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(session._id, patch)
    }

    return await loadContact(ctx, (await ctx.db.get(session._id))!)
  },
})

/**
 * Contact sessions lapse after a day without activity, which suits a browser
 * tab but not a contact a developer created to keep talking to. Every API call
 * that acts for a contact extends it, the way a visitor's own activity does.
 */
export const reviveContactSession = async (
  ctx: MutationCtx,
  session: Doc<"contactSessions">
) => {
  const now = Date.now()

  if (session.expiresAt - now < SESSION_DURATION_MS / 2) {
    await ctx.db.patch(session._id, { expiresAt: now + SESSION_DURATION_MS })
  }
}

export const memory = internalQuery({
  args: { organizationId: v.string(), contactId: v.string() },
  handler: async (ctx, args) => {
    const session = await requireOwnedDoc(
      ctx,
      "contactSessions",
      args.contactId,
      args.organizationId,
      "Contact"
    )

    if (
      session.isAnonymous ||
      !(await hasActiveSubscription(ctx, args.organizationId))
    ) {
      return null
    }

    const memoryDoc = await ctx.db
      .query("customerMemories")
      .withIndex("by_organization_id_and_email", (q) =>
        q.eq("organizationId", args.organizationId).eq("email", session.email)
      )
      .unique()

    return memoryDoc ? serializeCustomerMemory(memoryDoc) : null
  },
})

export const memories = internalQuery({
  args: { organizationId: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    if (!(await hasActiveSubscription(ctx, args.organizationId))) {
      return []
    }

    const rows = await ctx.db
      .query("customerMemories")
      .withIndex("by_organization_id_and_last_seen_at", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(args.limit)

    return rows.map(serializeCustomerMemory)
  },
})
