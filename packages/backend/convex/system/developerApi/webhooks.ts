import { v } from "convex/values"

import type { Id } from "../../_generated/dataModel"
import { internalMutation, internalQuery } from "../../_generated/server"
import {
  createWebhookForOrganization,
  getEffectiveProvider,
  removeWebhookForOrganization,
  rotateSigningSecretForOrganization,
  updateWebhookForOrganization,
} from "../../private/integrationWebhooks"
import {
  serializeWebhook,
  serializeWebhookDelivery,
} from "../../lib/developerApi/serialize"
import { requireOwnedDoc } from "./shared"

const eventValidator = v.union(
  v.literal("contact_session.created"),
  v.literal("conversation.created"),
  v.literal("conversation.status_changed"),
  v.literal("message.received"),
  v.literal("message.sent")
)

const loadWebhook = async (
  ctx: Parameters<typeof requireOwnedDoc>[0],
  organizationId: string,
  webhookId: string
) =>
  await requireOwnedDoc(
    ctx,
    "integrationWebhooks",
    webhookId,
    organizationId,
    "Webhook"
  )

export const listWebhooks = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const webhooks = await ctx.db
      .query("integrationWebhooks")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .collect()

    return webhooks.map((webhook) =>
      serializeWebhook(
        webhook,
        getEffectiveProvider(webhook.provider, webhook.url)
      )
    )
  },
})

export const createWebhook = internalMutation({
  args: {
    organizationId: v.string(),
    actorId: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    events: v.array(eventValidator),
  },
  handler: async (ctx, args) => {
    const { webhookId, signingSecret } = await createWebhookForOrganization(
      ctx,
      args.organizationId,
      args.actorId,
      {
        url: args.url,
        description: args.description,
        provider: "webhook",
        eventTypes: args.events,
      }
    )
    const webhook = (await ctx.db.get(webhookId as Id<"integrationWebhooks">))!

    return {
      ...serializeWebhook(webhook, "webhook"),
      secret: signingSecret,
    }
  },
})

export const updateWebhook = internalMutation({
  args: {
    organizationId: v.string(),
    webhookId: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    events: v.optional(v.array(eventValidator)),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const webhook = await loadWebhook(ctx, args.organizationId, args.webhookId)

    await updateWebhookForOrganization(ctx, args.organizationId, {
      webhookId: webhook._id,
      url: args.url,
      description: args.description,
      eventTypes: args.events,
      isEnabled: args.enabled,
    })

    const updated = (await ctx.db.get(webhook._id))!
    return serializeWebhook(
      updated,
      getEffectiveProvider(updated.provider, updated.url)
    )
  },
})

export const removeWebhook = internalMutation({
  args: { organizationId: v.string(), webhookId: v.string() },
  handler: async (ctx, args) => {
    const webhook = await loadWebhook(ctx, args.organizationId, args.webhookId)

    await removeWebhookForOrganization(ctx, args.organizationId, {
      webhookId: webhook._id,
    })

    return { id: webhook._id, object: "webhook", deleted: true }
  },
})

export const rotateWebhookSecret = internalMutation({
  args: { organizationId: v.string(), webhookId: v.string() },
  handler: async (ctx, args) => {
    const webhook = await loadWebhook(ctx, args.organizationId, args.webhookId)
    const { signingSecret } = await rotateSigningSecretForOrganization(
      ctx,
      args.organizationId,
      { webhookId: webhook._id }
    )

    return { id: webhook._id, object: "webhook", secret: signingSecret }
  },
})

export const webhookDeliveries = internalQuery({
  args: {
    organizationId: v.string(),
    webhookId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const webhook = await loadWebhook(ctx, args.organizationId, args.webhookId)
    const deliveries = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_webhook_id", (q) => q.eq("webhookId", webhook._id))
      .order("desc")
      .take(args.limit)

    return deliveries
      .filter((delivery) => delivery.organizationId === args.organizationId)
      .map(serializeWebhookDelivery)
  },
})
