import { ConvexError, v } from "convex/values"
import { internal } from "../_generated/api"
import { action, mutation, query } from "../_generated/server"
import { requireOrganizationIdentity } from "../lib/organizationIdentity"
import { enforceRateLimit } from "../lib/rateLimits"
import {
  callTeamBot,
  getTeamBotToken,
  getTeamBotWebhookSecret,
} from "../lib/teamTelegram"
import { getWebhookBaseUrl } from "../lib/webhookBaseUrl"

/** Long enough to switch to the phone and tap Start; short enough to be moot if it leaks. */
const LINK_CODE_TTL_MS = 15 * 60 * 1000

const languageValidator = v.union(
  v.literal("en"),
  v.literal("uz"),
  v.literal("ru")
)

const alertsValidator = v.object({
  handoff: v.boolean(),
  waiting: v.boolean(),
  upset: v.boolean(),
  lead: v.boolean(),
  digest: v.boolean(),
})

const displayNameOf = (identity: {
  name?: string
  givenName?: string
  familyName?: string
  email?: string
}) =>
  identity.name?.trim() ||
  [identity.givenName, identity.familyName].filter(Boolean).join(" ") ||
  identity.email ||
  "Team member"

const getMyLink = async (ctx: any) => {
  const { identity, orgId } = await requireOrganizationIdentity(ctx)
  const link = await ctx.db
    .query("teamTelegramLinks")
    .withIndex("by_organization_id_and_user_id", (q: any) =>
      q.eq("organizationId", orgId).eq("userId", identity.subject)
    )
    .unique()

  return { identity, orgId, link }
}

export const getState = query({
  args: {},
  handler: async (ctx) => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)
    const links = await ctx.db
      .query("teamTelegramLinks")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .take(50)
    const mine = links.find((link) => link.userId === identity.subject)

    return {
      isBotConfigured: Boolean(getTeamBotToken()),
      myLink: mine
        ? {
            telegramUsername: mine.telegramUsername,
            telegramName: mine.telegramName,
            alerts: mine.alerts,
            isPaused: mine.isPaused === true,
            language: mine.language,
            connectedAt: mine.createdAt,
          }
        : null,
      team: links.map((link) => ({
        id: link._id,
        userName: link.userName,
        telegramUsername: link.telegramUsername,
        isPaused: link.isPaused === true,
        isMe: link.userId === identity.subject,
      })),
    }
  },
})

/**
 * A one-time t.me link that connects the person's own Telegram. Also points the
 * bot's webhook at this deployment, which makes the first connection the whole
 * setup — there is no separate install step.
 */
export const createLinkCode = action({
  args: { language: languageValidator },
  handler: async (ctx, args): Promise<{ url: string; botUsername: string }> => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)

    await enforceRateLimit(ctx, "teamTelegramLinkByUser", {
      key: `${orgId}:${identity.subject}`,
      message: "Too many connection links. Please wait a little and try again.",
    })

    const token = getTeamBotToken()

    if (!token) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Telegram alerts are not set up on this server yet.",
      })
    }

    const bot = await callTeamBot<{ username?: string }>(token, "getMe", {})
    const botUsername = bot.result?.username

    if (!bot.ok || !botUsername) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Telegram did not accept the team bot's token.",
      })
    }

    const baseUrl = getWebhookBaseUrl("TEAM_TELEGRAM_WEBHOOK_BASE_URL")

    if (!baseUrl) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "The server's public address is not configured.",
      })
    }

    const webhook = await callTeamBot(token, "setWebhook", {
      url: `${baseUrl}/team-telegram/webhook`,
      secret_token: await getTeamBotWebhookSecret(token),
      allowed_updates: ["message", "callback_query"],
    })

    if (!webhook.ok) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: webhook.description || "Telegram webhook setup failed.",
      })
    }

    // Telegram start payloads allow 64 characters of [A-Za-z0-9_-].
    const code = `${crypto.randomUUID()}${crypto.randomUUID()}`
      .replaceAll("-", "")
      .slice(0, 48)

    await ctx.runMutation((internal as any).system.teamAlerts.storeLinkCode, {
      code,
      organizationId: orgId,
      userId: identity.subject,
      userName: displayNameOf(identity as any),
      language: args.language,
      expiresAt: Date.now() + LINK_CODE_TTL_MS,
    })

    return { url: `https://t.me/${botUsername}?start=${code}`, botUsername }
  },
})

export const updateMyLink = mutation({
  args: {
    alerts: v.optional(alertsValidator),
    isPaused: v.optional(v.boolean()),
    language: v.optional(languageValidator),
  },
  handler: async (ctx, args) => {
    const { link } = await getMyLink(ctx)

    if (!link) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Connect Telegram first.",
      })
    }

    await ctx.db.patch(link._id, {
      ...(args.alerts ? { alerts: args.alerts } : {}),
      ...(args.isPaused !== undefined ? { isPaused: args.isPaused } : {}),
      ...(args.language ? { language: args.language } : {}),
      updatedAt: Date.now(),
    })
  },
})

export const disconnect = mutation({
  args: {},
  handler: async (ctx) => {
    const { link } = await getMyLink(ctx)

    if (link) {
      await ctx.db.delete(link._id)
    }
  },
})

export const sendTest = action({
  args: {},
  handler: async (ctx): Promise<{ delivered: number }> => {
    const { identity, orgId } = await requireOrganizationIdentity(ctx)

    await enforceRateLimit(ctx, "teamTelegramLinkByUser", {
      key: `${orgId}:${identity.subject}`,
      message: "Too many test alerts. Please wait a little and try again.",
    })

    const delivered: number = await ctx.runAction(
      (internal as any).system.teamAlerts.sendTestAlert,
      { organizationId: orgId, userId: identity.subject }
    )

    return { delivered }
  },
})
