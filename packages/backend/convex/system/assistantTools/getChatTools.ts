import { internal } from "../../_generated/api"
import { Doc, Id } from "../../_generated/dataModel"
import { ActionCtx } from "../../_generated/server"
import { buildAssistantToolsForChat } from "../ai/tools/buildAssistantTools"
import { buildGoogleSheetsToolGuidance } from "../../lib/assistantTools"

export const filterAssistantToolsByIds = (
  tools: Doc<"assistantTools">[],
  enabledToolIds?: Id<"assistantTools">[]
) => {
  if (enabledToolIds === undefined) {
    return tools
  }

  if (enabledToolIds.length === 0) {
    return []
  }

  const allowed = new Set(enabledToolIds.map((toolId) => String(toolId)))
  return tools.filter((tool) => allowed.has(String(tool._id)))
}

/**
 * Tool types that either reach outside the app or change something when they
 * run. Their answers are true only for the moment they were produced, so a
 * reply that involved one must never be replayed from a cache.
 */
const LIVE_TOOL_TYPES = new Set([
  "google_sheets",
  "google_calendar",
  "api_request",
  "custom_webhook",
])

const isActiveChatTool = (tool: Doc<"assistantTools">) =>
  tool.isEnabled && tool.enabledForChat

/**
 * Names of the live tools the model may call on this turn. A reply is cacheable
 * only if none of these were actually invoked while producing it — which is a
 * far narrower rule than refusing to cache anything at all for an organization
 * that merely has an integration switched on.
 */
export const getLiveChatToolNames = (tools: Doc<"assistantTools">[]) =>
  tools
    .filter((tool) => isActiveChatTool(tool) && LIVE_TOOL_TYPES.has(tool.type))
    .map((tool) => tool.name)

/**
 * Identifies the tool roster a cached answer was produced under. Editing,
 * enabling or removing a tool changes what the assistant would say next time,
 * so entries carrying a different fingerprint are ignored rather than served.
 */
export const buildChatToolsFingerprint = (tools: Doc<"assistantTools">[]) =>
  tools
    .filter(isActiveChatTool)
    .map((tool) => `${tool.name}@${tool.updatedAt}`)
    .sort()
    .join("|")

export const resolveChatToolsForWidget = (
  dynamicTools: Record<string, any>,
  enabledToolIds: Id<"assistantTools">[] | undefined,
  legacyTools: Record<string, any>
): Record<string, any> => {
  if (enabledToolIds !== undefined && enabledToolIds.length === 0) {
    return {}
  }

  if (Object.keys(dynamicTools).length > 0) {
    return dynamicTools
  }

  if (enabledToolIds === undefined) {
    return legacyTools
  }

  return {}
}

export const getEnabledChatTools = async (
  ctx: ActionCtx,
  organizationId: string,
  enabledToolIds?: Id<"assistantTools">[],
  agentId?: string
) => {
  const configuredTools: Doc<"assistantTools">[] = await ctx.runQuery(
    internal.system.assistantTools.listEnabledForOrganization,
    {
      organizationId,
      channel: "chat",
    }
  )

  const filteredTools = filterAssistantToolsByIds(configuredTools, enabledToolIds)

  if (filteredTools.length === 0) {
    return {}
  }

  return buildAssistantToolsForChat(organizationId, filteredTools, agentId)
}

/**
 * The two tools that change the conversation's state rather than answer a
 * question, and so are the two the model has to be told *when* to use.
 *
 * This cannot live in the base prompt. `systemPrompt` is whatever the merchant
 * wrote — a custom prompt replaces the built-in one wholesale, and a prompt
 * about a dental clinic's services has no reason to mention closing a
 * conversation — so any rule kept there is lost for exactly the organizations
 * that have configured their assistant. Worse, the built-in prompt names
 * `resolveConversationTool` / `escalateConversationTool`, which are the legacy
 * tool keys; once an organization has rows in `assistantTools` (every
 * organization does — these two are seeded as builtins) the callable names are
 * the row names instead, so the instruction pointed at a tool that was not in
 * the model's schema.
 *
 * Taking the names from the rows keeps the guidance and the callable set in
 * step by construction.
 */
const buildConversationActionGuidance = (tools: Doc<"assistantTools">[]) => {
  const resolveTool = tools.find((tool) => tool.type === "resolve")
  const handoffTool = tools.find((tool) => tool.type === "handoff")
  const lines: string[] = []

  if (resolveTool) {
    lines.push(
      `- Call **${resolveTool.name}** the moment the visitor signals they are finished — "that's all", "no more questions", "thanks, bye", or an explicit "resolve" or "close this". Read that signal in whatever language they are writing in, not only English. Call the tool on that same turn and then write your closing line: do not ask another follow-up question first, and do not wait for a clearer confirmation, because a visitor who says they are done has already given it.`
    )
  }

  if (handoffTool) {
    lines.push(
      `- Call **${handoffTool.name}** when the visitor asks for a person, is frustrated, or needs something you cannot settle from your own knowledge and tools.`
    )
  }

  if (lines.length === 0) {
    return ""
  }

  return `## Ending or handing over a conversation
${lines.join("\n")}

Both of these change the state of the conversation, so neither is optional: when the trigger above is met, call the tool on that turn instead of only saying something. Nothing else ever closes a conversation on its own — there is no inactivity timeout — so a conversation you do not resolve stays open indefinitely.`
}

export const buildToolAwareSystemPrompt = (
  basePrompt: string,
  tools: Doc<"assistantTools">[]
) => {
  if (tools.length === 0) {
    return basePrompt
  }

  const toolLines = tools
    .map((tool) => `- **${tool.name}** → ${tool.description}`)
    .join("\n")

  const sheetsGuidance = buildGoogleSheetsToolGuidance(tools)
  const actionGuidance = buildConversationActionGuidance(tools)

  return `${basePrompt}

## Available tools
${toolLines}${sheetsGuidance ? `\n\n${sheetsGuidance}` : ""}${actionGuidance ? `\n\n${actionGuidance}` : ""}

Use the appropriate tool when you need knowledge base data, external integrations, or conversation actions before answering.

After a tool returns data, reply in clear natural language. Never paste raw JSON or tool output directly to the user. Summarize the result conversationally.

Always finish your turn with a sentence addressed to the visitor, written in the language the visitor is using — even when the only thing you did this turn was call tools, and even when you called several. A turn that ends without a sentence leaves the visitor looking at nothing, so never stop on a tool call.

Tool results are internal. When a tool records or submits something, confirm it in one short sentence in the user's own language — that it is done and what happens next — without repeating the values that were submitted, the sheet or system it went to, or any identifiers. When a tool looks something up, answer the question with what it found and nothing more.`
}
