import { v } from "convex/values"
import { action } from "../_generated/server"
import { internal } from "../_generated/api"
import { enforceRateLimit } from "../lib/rateLimits"
import { requireContactSessionFromAction } from "../lib/widgetAuth"

export const execute = action({
  args: {
    organizationId: v.string(),
    contactSessionId: v.id("contactSessions"),
    toolName: v.string(),
    args: v.any(),
    // Accepted for compatibility with older widget builds and ignored: see
    // the channel passed below.
    channel: v.optional(v.union(v.literal("chat"), v.literal("voice"))),
    agentId: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // Assistant tools run against the organization's own credentials (Google
    // Sheets, outbound API requests, knowledge base). Without a session bound to
    // this organization, anyone who learns an organization id could drive them.
    await requireContactSessionFromAction(ctx, {
      contactSessionId: args.contactSessionId,
      organizationId: args.organizationId,
    })

    await enforceRateLimit(ctx, "assistantToolExecuteBySession", {
      key: `${args.organizationId}:${args.contactSessionId}`,
      message: "Too many tool requests. Please wait a moment.",
    })
    await enforceRateLimit(ctx, "assistantToolExecuteByOrg", {
      key: args.organizationId,
      message: "This assistant is receiving too many requests right now.",
    })

    // The realtime model runs in the visitor's browser and calls back in here
    // by tool name, so this endpoint is reachable with hand-written arguments.
    // Passing the agent through means it can only reach the tools that agent
    // actually declares, rather than every voice-enabled tool in the org.
    //
    // Only voice tools are ever run from the browser — chat tools are called
    // server-side by the chat agent — so the channel is fixed rather than
    // taken from the caller, who could otherwise name "chat" and reach tools
    // the organization never enabled for voice.
    return ctx.runAction(internal.system.assistantTools.execute.executeTool, {
      organizationId: args.organizationId,
      toolName: args.toolName,
      args: args.args,
      channel: "voice",
      agentId: args.agentId,
    })
  },
})
