import type { Doc } from "../../_generated/dataModel"
import type { LeadRecord } from "../../private/leads"
import type { PublicFile } from "../../private/files"
import type { WidgetSettingsSnapshot } from "../../private/widgetSettings"
import { extractAgentMessageText } from "../agentMessageText"
import { getWebhookBaseUrl } from "../webhookBaseUrl"

/**
 * The developer API's public shapes. Internal documents carry storage details,
 * denormalised counters and legacy fields; these functions decide what a
 * developer sees, under names that describe the product rather than the
 * database. Every timestamp is an ISO 8601 string.
 */

export const iso = (timestamp: number | null | undefined) =>
  typeof timestamp === "number" && Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : null

const orNull = <T>(value: T | undefined | null): T | null => value ?? null

export const serializeContact = (
  lead: LeadRecord,
  session: Pick<Doc<"contactSessions">, "isAnonymous" | "metadata"> | null
) => ({
  id: lead.contactSessionId,
  object: "contact" as const,
  name: lead.name,
  email: session?.isAnonymous ? null : lead.email,
  isAnonymous: session?.isAnonymous === true,
  channel: lead.channel,
  externalId:
    session?.metadata?.source === "api"
      ? orNull(session.metadata.visitorId)
      : null,
  phone: orNull(lead.phone),
  socialHandle: orNull(lead.socialHandle),
  language: orNull(lead.language),
  timezone: orNull(lead.timezone),
  pageUrl: orNull(lead.currentUrl),
  referrer: orNull(lead.referrer),
  conversationCount: lead.conversationCount,
  latestConversationId: orNull(lead.latestConversationId),
  latestConversationStatus: orNull(lead.latestConversationStatus),
  awaitingReply: lead.isAwaitingReply,
  firstSeenAt: iso(lead.firstSeenAt),
  lastActiveAt: iso(lead.lastActiveAt),
})

export const serializeContactSummary = (
  session: Doc<"contactSessions"> | null
) =>
  session
    ? {
        id: session._id,
        name: session.name,
        email: session.isAnonymous ? null : session.email,
        isAnonymous: session.isAnonymous === true,
      }
    : null

export const serializeWorkflowState = (
  session: Doc<"workflowSessions"> | null
) =>
  session
    ? {
        id: session.workflowId,
        status: session.status,
        waitingFor:
          session.status === "waiting" ? orNull(session.waitingMode) : null,
        prompt:
          session.status === "waiting" ? orNull(session.pendingPrompt) : null,
        buttons:
          session.status === "waiting" && session.waitingMode === "buttons"
            ? (session.pendingButtons ?? [])
            : [],
      }
    : null

export const serializeConversation = (
  conversation: Doc<"conversations">,
  {
    contact,
    workflowSession,
    lastMessage,
  }: {
    contact: Doc<"contactSessions"> | null
    workflowSession?: Doc<"workflowSessions"> | null
    lastMessage?: ReturnType<typeof serializeMessage> | null
  }
) => ({
  id: conversation._id,
  object: "conversation" as const,
  status: conversation.status,
  source: conversation.source ?? "widget",
  assistantId: conversation.agentId ?? "default",
  priority: orNull(conversation.priority),
  assignee: conversation.assignedToId
    ? {
        id: conversation.assignedToId,
        name: orNull(conversation.assignedToName),
      }
    : null,
  contact: serializeContactSummary(contact),
  unreadForTeam: conversation.unreadForOperatorCount ?? 0,
  lastCustomerMessageAt: iso(conversation.lastCustomerMessageAt),
  // Any answer the customer got, from the assistant or a person.
  lastReplyAt: iso(conversation.lastOperatorMessageAt),
  firstTeamResponseAt: iso(conversation.firstHumanResponseAt),
  escalatedAt: iso(conversation.escalatedAt),
  resolvedAt: iso(conversation.resolvedAt),
  resolvedBy: orNull(conversation.resolutionSource),
  workflow: serializeWorkflowState(workflowSession ?? null),
  ...(lastMessage !== undefined ? { lastMessage } : {}),
  createdAt: iso(conversation._creationTime),
})

const AI_AGENT_NAME = "supportAgent"

export const serializeAttachment = (attachment: Doc<"chatAttachments">) => {
  const baseUrl = getWebhookBaseUrl()

  return {
    id: attachment._id,
    mediaType: attachment.mediaType,
    filename: attachment.filename,
    size: attachment.size,
    durationSeconds: orNull(attachment.durationSeconds),
    url: baseUrl
      ? `${baseUrl}/chat-attachment/${attachment._id}/${attachment.accessKey}`
      : null,
  }
}

export const serializeMessage = (
  message: any,
  attachments: Doc<"chatAttachments">[] = []
) => {
  const role = message?.message?.role ?? message?.role
  const agentName =
    typeof message?.agentName === "string" ? message.agentName : null

  return {
    id: String(message._id),
    object: "message" as const,
    role: role === "user" ? ("contact" as const) : ("assistant" as const),
    // Team replies are stored with the person's name; the model's own
    // replies carry the agent's name, which is internal.
    authorName:
      role === "assistant" && agentName && agentName !== AI_AGENT_NAME
        ? agentName
        : null,
    text: extractAgentMessageText(message),
    attachments: attachments.map(serializeAttachment),
    createdAt: iso(message._creationTime),
  }
}

/** Keeps the messages a person would see: text, or at least an attachment. */
export const isVisibleMessage = (
  message: any,
  attachments: Doc<"chatAttachments">[] | undefined
) => {
  const role = message?.message?.role ?? message?.role

  if (role !== "user" && role !== "assistant") {
    return false
  }

  return (
    extractAgentMessageText(message).length > 0 ||
    (attachments?.length ?? 0) > 0
  )
}

export const serializeKnowledgeEntry = (
  file: PublicFile,
  sourceUrl?: string | null
) => ({
  id: file.id as string,
  object: "knowledge_entry" as const,
  title: file.title || file.name,
  type: file.type,
  size: file.size,
  status: file.status,
  category: orNull(file.category),
  sourceUrl: sourceUrl ?? (file.type === "url" ? file.url : null),
  url: file.url,
})

export const serializeAssistantSettings = (
  snapshot: WidgetSettingsSnapshot
) => ({
  greeting: snapshot.greetMessage,
  instructions: orNull(snapshot.systemPrompt),
  model: orNull(snapshot.chatSettings?.model),
  suggestions: [
    snapshot.defaultSuggestions?.suggestion1,
    snapshot.defaultSuggestions?.suggestion2,
    snapshot.defaultSuggestions?.suggestion3,
  ].filter((value): value is string => Boolean(value?.trim())),
  toolIds: snapshot.enabledToolIds ?? [],
  copy: snapshot.widgetCopy ?? {},
  theme: snapshot.theme ?? {},
  appearance: snapshot.appearance ?? {},
  helpTopics: Array.isArray(snapshot.helpTopics) ? snapshot.helpTopics : [],
})

export const serializeAssistantSummary = (agent: {
  agentId: string
  name: string
  isDefault: boolean
  publishedVersion: number
  updatedAt?: number
}) => ({
  id: agent.agentId,
  object: "assistant" as const,
  name: agent.name,
  isDefault: agent.isDefault,
  publishedVersion: agent.publishedVersion,
  updatedAt: iso(agent.updatedAt),
})

export const serializeTool = (tool: Doc<"assistantTools">) => ({
  id: tool._id,
  object: "tool" as const,
  name: tool.name,
  description: tool.description,
  type: tool.type,
  builtIn: tool.isBuiltin,
  enabled: tool.isEnabled,
  channels: { chat: tool.enabledForChat, voice: tool.enabledForVoice },
  parameters: tool.parameters,
  config: tool.config ?? {},
  createdAt: iso(tool._creationTime),
  updatedAt: iso(tool.updatedAt),
})

export const serializeSavedReply = (reply: Doc<"savedReplies">) => ({
  id: reply._id,
  object: "saved_reply" as const,
  title: reply.title,
  body: reply.body,
  category: orNull(reply.category),
  usageCount: reply.usageCount,
  createdAt: iso(reply._creationTime),
  updatedAt: iso(reply.updatedAt),
})

export const serializeWorkflow = (
  workflow: Doc<"workflows">,
  { includeDefinitions }: { includeDefinitions: boolean }
) => ({
  id: workflow._id,
  object: "workflow" as const,
  name: workflow.name,
  description: orNull(workflow.description),
  isActive: workflow.isActive ?? false,
  isPublished: Boolean(workflow.publishedDefinition),
  publishedAt: iso(workflow.publishedAt),
  createdAt: iso(workflow.createdAt),
  updatedAt: iso(workflow.updatedAt),
  ...(includeDefinitions
    ? {
        definition: workflow.definition,
        publishedDefinition: orNull(workflow.publishedDefinition),
      }
    : {}),
})

export const serializeWebhook = (
  webhook: Doc<"integrationWebhooks">,
  provider: string
) => ({
  id: webhook._id,
  object: "webhook" as const,
  url: webhook.url,
  description: orNull(webhook.description),
  provider,
  events: webhook.eventTypes,
  enabled: webhook.isEnabled,
  secretPreview: `${webhook.signingSecret.slice(0, 14)}…`,
  createdAt: iso(webhook._creationTime),
  updatedAt: iso(webhook.updatedAt),
})

export const serializeWebhookDelivery = (
  delivery: Doc<"webhookDeliveries">
) => ({
  id: delivery._id,
  object: "webhook_delivery" as const,
  webhookId: delivery.webhookId,
  eventId: delivery.eventId,
  eventType: delivery.eventType,
  status: delivery.status,
  attempt: delivery.attempt,
  responseStatus: orNull(delivery.responseStatus),
  error: orNull(delivery.error),
  durationMs: orNull(delivery.durationMs),
  createdAt: iso(delivery._creationTime),
})

export const serializeInsight = (insight: Doc<"conversationInsights">) => ({
  id: insight._id,
  object: "insight" as const,
  channel: insight.channel,
  conversationId: orNull(insight.conversationId),
  voiceConversationId: orNull(insight.aiVoiceConversationId),
  contactId: insight.contactSessionId,
  status: insight.status,
  intent: insight.intent,
  sentiment: insight.sentiment,
  urgency: insight.urgency,
  language: orNull(insight.language),
  summary: insight.summary,
  unanswered: insight.isUnanswered,
  unansweredQuestion: orNull(insight.unansweredQuestion),
  escalated: insight.wasEscalated,
  resolved: insight.wasResolved,
  resolvedBy: orNull(insight.resolutionSource),
  firstTeamResponseMs: orNull(insight.firstHumanResponseMs),
  minutesSaved: insight.humanSavedMinutes,
  updatedAt: iso(insight.updatedAt),
})

export const serializeCustomerMemory = (memory: Doc<"customerMemories">) => ({
  object: "customer_memory" as const,
  email: memory.email,
  name: orNull(memory.name),
  summary: memory.summary,
  preferredLanguage: orNull(memory.preferredLanguage),
  recentIntents: memory.recentIntents,
  notableFacts: memory.notableFacts,
  history: memory.issueHistory.map((entry) => ({
    channel: entry.channel,
    intent: entry.intent,
    status: entry.status,
    summary: entry.summary,
    at: iso(entry.at),
  })),
  totals: {
    conversations: memory.totalConversations,
    escalations: memory.totalEscalations,
    resolved: memory.totalResolved,
  },
  lastSeenAt: iso(memory.lastSeenAt),
  updatedAt: iso(memory.updatedAt),
})

export const serializeVoiceConversation = (
  conversation: Doc<"aiVoiceConversations">,
  contact: Doc<"contactSessions"> | null
) => ({
  id: conversation._id,
  object: "voice_conversation" as const,
  provider: conversation.provider,
  status: conversation.status ?? "unresolved",
  contact: serializeContactSummary(contact),
  lastMessagePreview: orNull(conversation.lastMessagePreview),
  linkedConversationId: orNull(conversation.linkedConversationId),
  lastActivityAt: iso(conversation.lastActivityAt),
  endedAt: iso(conversation.endedAt),
  createdAt: iso(conversation._creationTime),
})

export const serializeVoiceMessage = (
  message: Doc<"aiVoiceConversationMessages">
) => ({
  id: message._id,
  object: "voice_message" as const,
  role: message.role === "user" ? ("contact" as const) : ("assistant" as const),
  text: message.text,
  createdAt: iso(message._creationTime),
})

export const page = <T>(
  items: T[],
  result: { isDone: boolean; continueCursor: string | null }
) => ({
  data: items,
  hasMore: !result.isDone,
  nextCursor: result.isDone ? null : result.continueCursor || null,
})

export const allItems = <T>(items: T[]) => ({
  data: items,
  hasMore: false,
  nextCursor: null,
})
