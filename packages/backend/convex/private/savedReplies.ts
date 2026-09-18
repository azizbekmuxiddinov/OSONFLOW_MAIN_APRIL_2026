import { requireOrganizationIdentity } from "../lib/organizationIdentity"
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const normalizeOptionalString = (value?: string) => {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
};

const getAuthContext = async (
    ctx: Parameters<typeof requireOrganizationIdentity>[0],
) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx);

    return {
        identity,
        organizationId: orgId,
    };
};

export const getOwnedSavedReply = async (ctx: any, savedReplyId: any, organizationId: string) => {
    const savedReply = await ctx.db.get(savedReplyId);

    if (!savedReply) {
        throw new ConvexError({
            code: "NOT_FOUND",
            message: "Saved reply not found",
        });
    }

    if (savedReply.organizationId !== organizationId) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Invalid organization",
        });
    }

    return savedReply;
};

export const listSavedRepliesForOrganization = async (
    ctx: QueryCtx | MutationCtx,
    organizationId: string,
    args: { search?: string; limit?: number },
) => {
    const search = normalizeOptionalString(args.search)?.toLowerCase();
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);

    const savedReplies = await ctx.db
        .query("savedReplies")
        .withIndex("by_organization_id_and_usage_count", (q: any) =>
            q.eq("organizationId", organizationId)
        )
        .order("desc")
        .take(200);

    const filtered = !search
        ? savedReplies
        : savedReplies.filter((savedReply: any) => {
              const searchableText = [
                  savedReply.title,
                  savedReply.body,
                  savedReply.category,
              ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

              return searchableText.includes(search);
          });

    const ranked = filtered.sort((a: any, b: any) => {
        if (a.usageCount !== b.usageCount) {
            return b.usageCount - a.usageCount;
        }

        return b.updatedAt - a.updatedAt;
    });

    return ranked.slice(0, limit);
};

export const getMany = query({
    args: {
        search: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { organizationId } = await getAuthContext(ctx);

        return await listSavedRepliesForOrganization(ctx, organizationId, args);
    },
});

export const createSavedReplyForOrganization = async (
    ctx: MutationCtx,
    organizationId: string,
    actorId: string | undefined,
    args: { title: string; body: string; category?: string },
) => {
    const title = args.title.trim();
    const body = args.body.trim();

    if (!title || !body) {
        throw new ConvexError({
            code: "BAD_REQUEST",
            message: "Title and body are required",
        });
    }

    const now = Date.now();

    return await ctx.db.insert("savedReplies", {
        organizationId,
        title,
        body,
        category: normalizeOptionalString(args.category),
        usageCount: 0,
        updatedAt: now,
        createdBy: actorId,
    });
};

export const create = mutation({
    args: {
        title: v.string(),
        body: v.string(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { identity, organizationId } = await getAuthContext(ctx);

        return await createSavedReplyForOrganization(
            ctx,
            organizationId,
            identity.subject,
            args,
        );
    },
});

export const updateSavedReplyForOrganization = async (
    ctx: MutationCtx,
    organizationId: string,
    args: {
        savedReplyId: Id<"savedReplies">;
        title: string;
        body: string;
        category?: string;
    },
) => {
    await getOwnedSavedReply(ctx, args.savedReplyId, organizationId);

    const title = args.title.trim();
    const body = args.body.trim();

    if (!title || !body) {
        throw new ConvexError({
            code: "BAD_REQUEST",
            message: "Title and body are required",
        });
    }

    await ctx.db.patch(args.savedReplyId, {
        title,
        body,
        category: normalizeOptionalString(args.category),
        updatedAt: Date.now(),
    });
};

export const update = mutation({
    args: {
        savedReplyId: v.id("savedReplies"),
        title: v.string(),
        body: v.string(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId } = await getAuthContext(ctx);

        await updateSavedReplyForOrganization(ctx, organizationId, args);
    },
});

export const remove = mutation({
    args: {
        savedReplyId: v.id("savedReplies"),
    },
    handler: async (ctx, args) => {
        const { organizationId } = await getAuthContext(ctx);

        await getOwnedSavedReply(ctx, args.savedReplyId, organizationId);

        await ctx.db.delete(args.savedReplyId);
    },
});

export const incrementUsage = mutation({
    args: {
        savedReplyId: v.id("savedReplies"),
    },
    handler: async (ctx, args) => {
        const { organizationId } = await getAuthContext(ctx);

        const savedReply = await getOwnedSavedReply(ctx, args.savedReplyId, organizationId);

        await ctx.db.patch(args.savedReplyId, {
            usageCount: savedReply.usageCount + 1,
            updatedAt: Date.now(),
        });
    },
});
