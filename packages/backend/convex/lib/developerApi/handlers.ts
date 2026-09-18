import type { EntryId } from "@convex-dev/rag"

import type { Id } from "../../_generated/dataModel"
import type { ActionCtx } from "../../_generated/server"
import { internal } from "../../_generated/api"
import {
  addKnowledgeFileForOrganization,
  addKnowledgeTextForOrganization,
  addKnowledgeWebsiteForOrganization,
  getKnowledgeContentForOrganization,
  searchKnowledgeForOrganization,
} from "../../private/files"
import {
  DEVELOPER_API_VERSION,
  DEVELOPER_API_WEBHOOK_EVENTS,
  type DeveloperApiLimitValues,
} from "./catalog"
import { allItems, page } from "./serialize"
import {
  APPEARANCE_SHAPE,
  ApiError,
  COPY_SHAPE,
  THEME_SHAPE,
  TOOL_CONFIG_SHAPE,
  assertKnownFields,
  invalid,
  queryBoolean,
  queryEnum,
  queryInteger,
  queryString,
  readBoolean,
  readEnum,
  readInteger,
  readNullableString,
  readObject,
  readShape,
  readString,
  readStringArray,
  readToolParameters,
  type JsonObject,
} from "./validate"

export type ApiContext = {
  ctx: ActionCtx
  request: Request
  params: Record<string, string>
  query: URLSearchParams
  /** The JSON body, parsed once. An empty body reads as `{}`. */
  body: () => Promise<JsonObject>
  organizationId: string
  keyId: Id<"developerApiKeys">
  keyName: string
  keyPrefix: string
  scopes: string[]
  keyExpiresAt: number | null
  keyCreatedAt: number
  limits: DeveloperApiLimitValues
  organizationLimits: DeveloperApiLimitValues
  keyLimits: Partial<DeveloperApiLimitValues>
}

export type ApiResult = { status?: number; body: unknown }

type ApiHandler = (api: ApiContext) => Promise<ApiResult>

const data = (value: unknown, status = 200): ApiResult => ({
  status,
  body: { data: value },
})

/** Records the key as the author of anything it creates or publishes. */
const actorOf = (api: ApiContext) => `api:${api.keyId}`

const pageParams = (api: ApiContext) => ({
  limit: queryInteger(api.query, "limit", {
    min: 1,
    max: api.limits.maxPageSize,
    fallback: Math.min(20, api.limits.maxPageSize),
  }),
  cursor: queryString(api.query, "cursor") ?? null,
})

const readMessageText = (body: JsonObject, name: string, maxChars: number) => {
  const text = readString(body, name, { required: true })

  if (text.length > maxChars) {
    throw new ApiError(
      413,
      "payload_too_large",
      `${name} is ${text.length.toLocaleString("en-US")} characters; your limit is ${maxChars.toLocaleString("en-US")}.`
    )
  }

  return text
}

const readChannels = (body: JsonObject) => {
  const channels = readObject(body, "channels")

  if (!channels) {
    return undefined
  }

  assertKnownFields(channels, ["chat", "voice"], "channels")

  return {
    chat: readBoolean(channels, "chat"),
    voice: readBoolean(channels, "voice"),
  }
}

const readWorkflowDefinition = (body: JsonObject, required: boolean) => {
  const definition = readObject(body, "definition")

  if (!definition) {
    if (required) {
      throw invalid("definition is required.")
    }

    return undefined
  }

  if (typeof definition.schemaVersion !== "number") {
    throw invalid("definition.schemaVersion must be a number.")
  }

  if (!Array.isArray(definition.nodes) || !Array.isArray(definition.edges)) {
    throw invalid("definition.nodes and definition.edges must be arrays.")
  }

  // Only the fields the builder stores; anything else would be rejected by
  // the schema with a less helpful error.
  return {
    schemaVersion: definition.schemaVersion,
    nodes: definition.nodes,
    edges: definition.edges,
    ...(typeof definition.name === "string" ? { name: definition.name } : {}),
    ...(typeof definition.description === "string"
      ? { description: definition.description }
      : {}),
  }
}

const WEBHOOK_EVENTS = DEVELOPER_API_WEBHOOK_EVENTS.map((event) => event.type)

const readWebhookEvents = (body: JsonObject, required: boolean) => {
  const events = readStringArray(body, "events", {
    maxItems: WEBHOOK_EVENTS.length,
    required,
  })

  if (events === undefined) {
    return undefined
  }

  if (events.length === 0) {
    throw invalid("events must list at least one event.")
  }

  for (const event of events) {
    if (!(WEBHOOK_EVENTS as string[]).includes(event)) {
      throw invalid(
        `events: "${event}" is not an event. Use one of: ${WEBHOOK_EVENTS.join(", ")}.`
      )
    }
  }

  return [...new Set(events)] as (typeof WEBHOOK_EVENTS)[number][]
}

/** MIME types the knowledge base can read text out of. */
const isReadableUpload = (mimeType: string) =>
  mimeType === "application/pdf" ||
  mimeType.startsWith("text/") ||
  ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)

const guessUploadType = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase() ?? ""

  return (
    {
      pdf: "application/pdf",
      txt: "text/plain",
      md: "text/markdown",
      csv: "text/csv",
      html: "text/html",
      htm: "text/html",
      json: "text/plain",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    } as Record<string, string>
  )[extension]
}

const MODEL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/

export const HANDLERS: Record<string, ApiHandler> = {
  /* ── account ─────────────────────────────────────────────────────────── */

  "account.me": async (api) =>
    data({
      object: "api_key",
      organizationId: api.organizationId,
      key: {
        id: api.keyId,
        name: api.keyName,
        prefix: api.keyPrefix,
        scopes: api.scopes,
        expiresAt: api.keyExpiresAt
          ? new Date(api.keyExpiresAt).toISOString()
          : null,
        createdAt: new Date(api.keyCreatedAt).toISOString(),
      },
      limits: api.limits,
      apiVersion: DEVELOPER_API_VERSION,
    }),

  "account.usage": async (api) => {
    const usage = await api.ctx.runQuery(
      internal.system.developerApi.insights.usageToday,
      { organizationId: api.organizationId, keyId: api.keyId }
    )
    const remaining = (
      limit: "requestsPerDay" | "aiRequestsPerDay",
      used: "requests" | "aiRequests"
    ) => {
      const organizationLeft =
        api.organizationLimits[limit] - usage.organization[used]
      const keyLimit = api.keyLimits[limit]
      const keyLeft =
        keyLimit === undefined
          ? Number.POSITIVE_INFINITY
          : keyLimit - usage.key[used]

      return Math.max(0, Math.min(organizationLeft, keyLeft))
    }

    return data({
      object: "usage",
      day: usage.day,
      organization: {
        requests: usage.organization.requests,
        aiRequests: usage.organization.aiRequests,
        errors: usage.organization.errors,
      },
      key: {
        requests: usage.key.requests,
        aiRequests: usage.key.aiRequests,
        errors: usage.key.errors,
      },
      remaining: {
        requestsToday: remaining("requestsPerDay", "requests"),
        aiRequestsToday: remaining("aiRequestsPerDay", "aiRequests"),
      },
      limits: api.limits,
    })
  },

  /* ── contacts ────────────────────────────────────────────────────────── */

  "contacts.list": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.contacts.list,
      {
        organizationId: api.organizationId,
        search: queryString(api.query, "search"),
        segment: queryEnum(api.query, "segment", [
          "all",
          "waiting",
          "newcomers",
          "no_chats",
        ] as const),
        ...pageParams(api),
      }
    )

    return { body: page(result.items, result) }
  },

  "contacts.create": async (api) => {
    const body = await api.body()
    assertKnownFields(body, [
      "name",
      "email",
      "externalId",
      "language",
      "timezone",
      "pageUrl",
      "referrer",
    ])

    return data(
      await api.ctx.runMutation(internal.system.developerApi.contacts.create, {
        organizationId: api.organizationId,
        name: readString(body, "name", { required: true }),
        email: readString(body, "email", { required: true }),
        externalId: readString(body, "externalId", { max: 200 }),
        language: readString(body, "language", { max: 35 }),
        timezone: readString(body, "timezone", { max: 64 }),
        pageUrl: readString(body, "pageUrl", { max: 500 }),
        referrer: readString(body, "referrer", { max: 500 }),
      }),
      201
    )
  },

  "contacts.get": async (api) =>
    data(
      await api.ctx.runQuery(internal.system.developerApi.contacts.get, {
        organizationId: api.organizationId,
        contactId: api.params.contactId!,
      })
    ),

  "contacts.update": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["name", "email"])

    return data(
      await api.ctx.runMutation(internal.system.developerApi.contacts.update, {
        organizationId: api.organizationId,
        contactId: api.params.contactId!,
        name: readString(body, "name"),
        email: readString(body, "email"),
      })
    )
  },

  "contacts.memory": async (api) =>
    data(
      await api.ctx.runQuery(internal.system.developerApi.contacts.memory, {
        organizationId: api.organizationId,
        contactId: api.params.contactId!,
      })
    ),

  "contacts.memories": async (api) => ({
    body: allItems(
      await api.ctx.runQuery(internal.system.developerApi.contacts.memories, {
        organizationId: api.organizationId,
        limit: pageParams(api).limit,
      })
    ),
  }),

  /* ── conversations ───────────────────────────────────────────────────── */

  "conversations.list": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.conversations.list,
      {
        organizationId: api.organizationId,
        status: queryEnum(api.query, "status", [
          "unresolved",
          "escalated",
          "resolved",
        ] as const),
        source: queryEnum(api.query, "source", ["widget", "workflow"] as const),
        contactId: queryString(api.query, "contactId"),
        assigned: queryEnum(api.query, "assigned", [
          "assigned",
          "unassigned",
        ] as const),
        includeLastMessage:
          queryBoolean(api.query, "includeLastMessage") ?? false,
        ...pageParams(api),
      }
    )

    return { body: page(result.items, result) }
  },

  "conversations.create": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["contactId", "message", "assistantId", "greeting"])
    const contactId = readString(body, "contactId", { required: true, max: 64 })
    const message = readMessageText(body, "message", api.limits.maxMessageChars)
    const assistantId = readString(body, "assistantId", { max: 64 })
    const greeting = readBoolean(body, "greeting") ?? true

    const created = await api.ctx.runMutation(
      internal.system.developerApi.conversations.create,
      {
        organizationId: api.organizationId,
        contactId,
        assistantId,
        greeting,
      }
    )

    try {
      await api.ctx.runAction(internal.public.messages.createFromDeveloperApi, {
        prompt: message,
        threadId: created.threadId,
        contactSessionId: created.contactSessionId,
      })
    } catch (error) {
      // A conversation only exists because of its first message; if that
      // message could not be sent, neither should the conversation.
      await api.ctx
        .runMutation(internal.system.developerApi.conversations.discard, {
          organizationId: api.organizationId,
          conversationId: created.conversationId,
        })
        .catch((cleanupError) =>
          console.error(
            "Could not discard an unsent API conversation",
            cleanupError
          )
        )
      throw error
    }

    return data(
      await api.ctx.runQuery(
        internal.system.developerApi.conversations.afterTurn,
        {
          organizationId: api.organizationId,
          conversationId: created.conversationId,
          since: 0,
        }
      ),
      201
    )
  },

  "conversations.get": async (api) =>
    data(
      await api.ctx.runQuery(internal.system.developerApi.conversations.get, {
        organizationId: api.organizationId,
        conversationId: api.params.conversationId!,
      })
    ),

  "conversations.update": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["status", "priority", "assignee"])
    const priority =
      body.priority === null
        ? null
        : readEnum(body, "priority", [
            "urgent",
            "high",
            "medium",
            "low",
          ] as const)
    let assignee: { id: string; name: string } | null | undefined

    if (body.assignee === null) {
      assignee = null
    } else if (body.assignee !== undefined) {
      const value = readObject(body, "assignee")!
      assertKnownFields(value, ["id", "name"], "assignee")
      const id = readString(value, "id", { required: true, max: 200 })
      assignee = { id, name: readString(value, "name", { max: 120 }) ?? id }
    }

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.conversations.update,
        {
          organizationId: api.organizationId,
          conversationId: api.params.conversationId!,
          status: readEnum(body, "status", [
            "unresolved",
            "escalated",
            "resolved",
          ] as const),
          priority,
          assignee,
        }
      )
    )
  },

  "conversations.delete": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.conversations.remove,
        {
          organizationId: api.organizationId,
          conversationId: api.params.conversationId!,
        }
      )
    ),

  "conversations.messages": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.conversations.messages,
      {
        organizationId: api.organizationId,
        conversationId: api.params.conversationId!,
        ...pageParams(api),
      }
    )

    return { body: page(result.items, result) }
  },

  "conversations.send": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["text", "buttonId"])
    const text = readMessageText(body, "text", api.limits.maxMessageChars)
    const buttonId = readString(body, "buttonId", { max: 200 })

    const prepared = await api.ctx.runMutation(
      internal.system.developerApi.conversations.prepareCustomerMessage,
      {
        organizationId: api.organizationId,
        conversationId: api.params.conversationId!,
      }
    )
    const startedAt = Date.now()

    await api.ctx.runAction(internal.public.messages.createFromDeveloperApi, {
      prompt: text,
      threadId: prepared.threadId,
      contactSessionId: prepared.contactSessionId,
      workflowButtonId: buttonId,
    })

    return data(
      await api.ctx.runQuery(
        internal.system.developerApi.conversations.afterTurn,
        {
          organizationId: api.organizationId,
          conversationId: prepared.conversationId,
          since: startedAt,
        }
      )
    )
  },

  "conversations.reply": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["text", "authorName", "authorId"])
    const text = readMessageText(body, "text", api.limits.maxMessageChars)
    const authorName =
      readString(body, "authorName", { max: 120 }) ?? api.keyName
    const authorId = readString(body, "authorId", { max: 200 }) ?? actorOf(api)
    const startedAt = Date.now()

    const { conversationId } = await api.ctx.runMutation(
      internal.system.developerApi.conversations.reply,
      {
        organizationId: api.organizationId,
        conversationId: api.params.conversationId!,
        text,
        authorId,
        authorName,
      }
    )
    const after = await api.ctx.runQuery(
      internal.system.developerApi.conversations.afterTurn,
      { organizationId: api.organizationId, conversationId, since: startedAt }
    )

    return data(
      {
        conversation: after.conversation,
        message:
          after.messages
            .filter((message) => message.role === "assistant")
            .slice(-1)[0] ?? null,
      },
      201
    )
  },

  "conversations.read": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.conversations.markRead,
        {
          organizationId: api.organizationId,
          conversationId: api.params.conversationId!,
        }
      )
    ),

  /* ── knowledge ───────────────────────────────────────────────────────── */

  "knowledge.list": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.knowledge.list,
      {
        organizationId: api.organizationId,
        category: queryString(api.query, "category"),
        ...pageParams(api),
      }
    )

    return { body: page(result.items, result) }
  },

  "knowledge.get": async (api) => {
    const entryId = api.params.entryId!

    await api.ctx.runQuery(internal.system.developerApi.knowledge.assertOwned, {
      organizationId: api.organizationId,
      entryId,
    })

    const content = await getKnowledgeContentForOrganization(
      api.ctx,
      api.organizationId,
      entryId as EntryId
    )

    return data({
      id: entryId,
      object: "knowledge_content",
      title: content.filename,
      sourceUrl: content.sourceUrl ?? null,
      content: content.kind === "text" ? content.content : null,
      url: content.kind === "document" ? content.url : null,
    })
  },

  "knowledge.createDocument": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["title", "text", "category"])
    const result = await addKnowledgeTextForOrganization(
      api.ctx,
      {
        organizationId: api.organizationId,
        actorId: actorOf(api),
        enforceDashboardRateLimits: false,
      },
      {
        title: readString(body, "title", { required: true, max: 120 }),
        text: readString(body, "text", { required: true }),
        category: readString(body, "category", { max: 80 }),
      }
    )

    return data(
      {
        ...(await api.ctx.runQuery(internal.system.developerApi.knowledge.get, {
          organizationId: api.organizationId,
          entryId: result.entryId,
        })),
        created: result.created,
      },
      result.created ? 201 : 200
    )
  },

  "knowledge.createWebsite": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["url", "title", "category"])
    const result = await addKnowledgeWebsiteForOrganization(
      api.ctx,
      {
        organizationId: api.organizationId,
        actorId: actorOf(api),
        enforceDashboardRateLimits: false,
      },
      {
        url: readString(body, "url", { required: true, max: 2000 }),
        title: readString(body, "title", { max: 120 }),
        category: readString(body, "category", { max: 80 }),
      }
    )

    return data(
      {
        ...(await api.ctx.runQuery(internal.system.developerApi.knowledge.get, {
          organizationId: api.organizationId,
          entryId: result.entryId,
        })),
        created: result.created,
      },
      result.created ? 201 : 200
    )
  },

  "knowledge.createFile": async (api) => {
    const contentType = api.request.headers.get("content-type") ?? ""

    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      throw invalid(
        'Send the file as multipart/form-data, in a field named "file".'
      )
    }

    let form: FormData

    try {
      form = await api.request.formData()
    } catch {
      throw invalid("The multipart body could not be read.")
    }

    const file = form.get("file")

    if (!file || typeof file === "string") {
      throw invalid("file is required, as a file field in the form.")
    }

    const upload = file as Blob & { name?: string }
    const filename = (upload.name || "upload").slice(0, 200)
    const mimeType =
      (upload.type && upload.type !== "application/octet-stream"
        ? upload.type
        : guessUploadType(filename)) ?? ""

    if (!isReadableUpload(mimeType)) {
      throw invalid(
        "This file type cannot be read. Upload a PDF, a text, Markdown, CSV or HTML file, or a JPEG, PNG, WebP or GIF image."
      )
    }

    const category = form.get("category")

    if (
      category !== null &&
      (typeof category !== "string" || category.length > 80)
    ) {
      throw invalid("category must be text of 80 characters or fewer.")
    }

    const result = await addKnowledgeFileForOrganization(
      api.ctx,
      {
        organizationId: api.organizationId,
        actorId: actorOf(api),
        enforceDashboardRateLimits: false,
      },
      {
        filename,
        mimeType,
        bytes: await upload.arrayBuffer(),
        category: category?.trim() || undefined,
      }
    )

    return data(
      {
        ...(await api.ctx.runQuery(internal.system.developerApi.knowledge.get, {
          organizationId: api.organizationId,
          entryId: result.entryId,
        })),
        created: result.created,
      },
      result.created ? 201 : 200
    )
  },

  "knowledge.delete": async (api) =>
    data(
      await api.ctx.runMutation(internal.system.developerApi.knowledge.remove, {
        organizationId: api.organizationId,
        entryId: api.params.entryId!,
      })
    ),

  "knowledge.search": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["query", "limit"])
    const matches = await searchKnowledgeForOrganization(
      api.ctx,
      api.organizationId,
      {
        query: readString(body, "query", { required: true, max: 1000 }),
        limit: readInteger(body, "limit", { min: 1, max: 10 }) ?? 5,
      }
    )

    return data(
      matches.map(
        (match: {
          entryId: string
          title: string
          score: number
          text: string
        }) => ({
          object: "knowledge_match",
          ...match,
        })
      )
    )
  },

  /* ── assistants ──────────────────────────────────────────────────────── */

  "assistants.list": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.assistants.list,
      { organizationId: api.organizationId }
    )

    return {
      body: { ...allItems(result.items), maxAssistants: result.maxAssistants },
    }
  },

  "assistants.create": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["name"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.assistants.create,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          name: readString(body, "name", { max: 60 }),
        }
      ),
      201
    )
  },

  "assistants.get": async (api) =>
    data(
      await api.ctx.runQuery(internal.system.developerApi.assistants.get, {
        organizationId: api.organizationId,
        assistantId: api.params.assistantId!,
      })
    ),

  "assistants.update": async (api) => {
    const body = await api.body()
    assertKnownFields(body, [
      "name",
      "greeting",
      "instructions",
      "model",
      "suggestions",
      "toolIds",
      "copy",
      "theme",
      "appearance",
      "publish",
    ])
    const model = readNullableString(body, "model", { max: 80 })

    if (model && !MODEL_PATTERN.test(model)) {
      throw invalid("model must be a model name such as gpt-4o-mini.")
    }

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.assistants.update,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          assistantId: api.params.assistantId!,
          name: readString(body, "name", { max: 60 }),
          greeting: readString(body, "greeting", { max: 2000 }),
          instructions: readNullableString(body, "instructions", {
            max: 20_000,
          }),
          model,
          suggestions: readStringArray(body, "suggestions", {
            maxItems: 3,
            maxLength: 120,
          }),
          toolIds: readStringArray(body, "toolIds", {
            maxItems: 50,
            maxLength: 64,
          }),
          copy: readShape(body, "copy", COPY_SHAPE),
          theme: readShape(body, "theme", THEME_SHAPE),
          appearance: readShape(body, "appearance", APPEARANCE_SHAPE),
          publish: readBoolean(body, "publish") ?? false,
        }
      )
    )
  },

  "assistants.publish": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.assistants.publish,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          assistantId: api.params.assistantId!,
        }
      )
    ),

  "assistants.rollback": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["version"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.assistants.rollback,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          assistantId: api.params.assistantId!,
          version: readInteger(body, "version", {
            min: 1,
            max: 1_000_000,
            required: true,
          })!,
        }
      )
    )
  },

  /* ── tools ───────────────────────────────────────────────────────────── */

  "tools.list": async (api) => ({
    body: allItems(
      await api.ctx.runQuery(internal.system.developerApi.tools.listTools, {
        organizationId: api.organizationId,
      })
    ),
  }),

  "tools.create": async (api) => {
    const body = await api.body()
    assertKnownFields(body, [
      "name",
      "description",
      "type",
      "parameters",
      "config",
      "enabled",
      "channels",
    ])
    const channels = readChannels(body)

    return data(
      await api.ctx.runMutation(internal.system.developerApi.tools.createTool, {
        organizationId: api.organizationId,
        name: readString(body, "name", { required: true, max: 64 }),
        description: readString(body, "description", {
          required: true,
          max: 1000,
        }),
        type: readEnum(
          body,
          "type",
          [
            "api_request",
            "custom_webhook",
            "google_sheets",
            "google_calendar",
          ] as const,
          { required: true }
        )!,
        parameters: readToolParameters(body) ?? [],
        config: readShape(body, "config", TOOL_CONFIG_SHAPE),
        enabled: readBoolean(body, "enabled") ?? true,
        chat: channels?.chat ?? true,
        voice: channels?.voice ?? false,
      }),
      201
    )
  },

  "tools.get": async (api) =>
    data(
      await api.ctx.runQuery(internal.system.developerApi.tools.getTool, {
        organizationId: api.organizationId,
        toolId: api.params.toolId!,
      })
    ),

  "tools.update": async (api) => {
    const body = await api.body()
    assertKnownFields(body, [
      "name",
      "description",
      "parameters",
      "config",
      "enabled",
      "channels",
    ])
    const channels = readChannels(body)

    return data(
      await api.ctx.runMutation(internal.system.developerApi.tools.updateTool, {
        organizationId: api.organizationId,
        toolId: api.params.toolId!,
        name: readString(body, "name", { max: 64 }),
        description: readString(body, "description", { max: 1000 }),
        parameters: readToolParameters(body),
        config: readShape(body, "config", TOOL_CONFIG_SHAPE),
        enabled: readBoolean(body, "enabled"),
        chat: channels?.chat,
        voice: channels?.voice,
      })
    )
  },

  "tools.delete": async (api) =>
    data(
      await api.ctx.runMutation(internal.system.developerApi.tools.removeTool, {
        organizationId: api.organizationId,
        toolId: api.params.toolId!,
      })
    ),

  /* ── saved replies ───────────────────────────────────────────────────── */

  "savedReplies.list": async (api) => ({
    body: allItems(
      await api.ctx.runQuery(
        internal.system.developerApi.tools.listSavedReplies,
        {
          organizationId: api.organizationId,
          search: queryString(api.query, "search"),
          limit: queryInteger(api.query, "limit", {
            min: 1,
            max: 200,
            fallback: 100,
          }),
        }
      )
    ),
  }),

  "savedReplies.create": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["title", "body", "category"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.tools.createSavedReply,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          title: readString(body, "title", { required: true, max: 200 }),
          body: readString(body, "body", { required: true, max: 5000 }),
          category: readString(body, "category", { max: 80 }),
        }
      ),
      201
    )
  },

  "savedReplies.update": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["title", "body", "category"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.tools.updateSavedReply,
        {
          organizationId: api.organizationId,
          savedReplyId: api.params.savedReplyId!,
          title: readString(body, "title", { max: 200 }),
          body: readString(body, "body", { max: 5000 }),
          category: readNullableString(body, "category", { max: 80 }),
        }
      )
    )
  },

  "savedReplies.delete": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.tools.removeSavedReply,
        {
          organizationId: api.organizationId,
          savedReplyId: api.params.savedReplyId!,
        }
      )
    ),

  /* ── workflows ───────────────────────────────────────────────────────── */

  "workflows.list": async (api) => ({
    body: allItems(
      await api.ctx.runQuery(
        internal.system.developerApi.workflows.listWorkflows,
        { organizationId: api.organizationId }
      )
    ),
  }),

  "workflows.create": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["name", "description", "definition"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.workflows.saveWorkflow,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          name: readString(body, "name", { required: true, max: 120 }),
          description: readNullableString(body, "description", { max: 1000 }),
          definition: readWorkflowDefinition(body, true),
        }
      ),
      201
    )
  },

  "workflows.get": async (api) =>
    data(
      await api.ctx.runQuery(
        internal.system.developerApi.workflows.getWorkflow,
        {
          organizationId: api.organizationId,
          workflowId: api.params.workflowId!,
        }
      )
    ),

  "workflows.update": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["name", "description", "definition"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.workflows.saveWorkflow,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          workflowId: api.params.workflowId!,
          name: readString(body, "name", { max: 120 }),
          description: readNullableString(body, "description", { max: 1000 }),
          definition: readWorkflowDefinition(body, false),
        }
      )
    )
  },

  "workflows.publish": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["activate"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.workflows.publishWorkflow,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          workflowId: api.params.workflowId!,
          activate: readBoolean(body, "activate") ?? true,
        }
      )
    )
  },

  "workflows.deactivate": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.workflows.deactivateWorkflow,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          workflowId: api.params.workflowId!,
        }
      )
    ),

  "workflows.delete": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.workflows.removeWorkflow,
        {
          organizationId: api.organizationId,
          workflowId: api.params.workflowId!,
        }
      )
    ),

  "workflows.runs": async (api) => ({
    body: allItems(
      await api.ctx.runQuery(
        internal.system.developerApi.workflows.workflowRuns,
        {
          organizationId: api.organizationId,
          workflowId: api.params.workflowId!,
          windowDays: queryInteger(api.query, "windowDays", {
            min: 1,
            max: 365,
            fallback: 30,
          }),
          outcome: queryEnum(api.query, "outcome", [
            "completed",
            "abandoned",
            "live",
          ] as const),
          limit: queryInteger(api.query, "limit", {
            min: 1,
            max: Math.min(200, api.limits.maxPageSize),
            fallback: Math.min(50, api.limits.maxPageSize),
          }),
        }
      )
    ),
  }),

  "workflows.stats": async (api) =>
    data(
      await api.ctx.runQuery(
        internal.system.developerApi.workflows.workflowStats,
        {
          organizationId: api.organizationId,
          workflowId: api.params.workflowId!,
          windowDays: queryInteger(api.query, "windowDays", {
            min: 1,
            max: 365,
            fallback: 30,
          }),
        }
      )
    ),

  /* ── webhooks ────────────────────────────────────────────────────────── */

  "webhooks.list": async (api) => ({
    body: allItems(
      await api.ctx.runQuery(
        internal.system.developerApi.webhooks.listWebhooks,
        {
          organizationId: api.organizationId,
        }
      )
    ),
  }),

  "webhooks.create": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["url", "events", "description"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.webhooks.createWebhook,
        {
          organizationId: api.organizationId,
          actorId: actorOf(api),
          url: readString(body, "url", { required: true, max: 2000 }),
          events: readWebhookEvents(body, true)!,
          description: readString(body, "description", { max: 500 }),
        }
      ),
      201
    )
  },

  "webhooks.update": async (api) => {
    const body = await api.body()
    assertKnownFields(body, ["url", "events", "description", "enabled"])

    return data(
      await api.ctx.runMutation(
        internal.system.developerApi.webhooks.updateWebhook,
        {
          organizationId: api.organizationId,
          webhookId: api.params.webhookId!,
          url: readString(body, "url", { max: 2000 }),
          events: readWebhookEvents(body, false),
          description: readString(body, "description", {
            max: 500,
            allowEmpty: true,
          }),
          enabled: readBoolean(body, "enabled"),
        }
      )
    )
  },

  "webhooks.delete": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.webhooks.removeWebhook,
        {
          organizationId: api.organizationId,
          webhookId: api.params.webhookId!,
        }
      )
    ),

  "webhooks.rotateSecret": async (api) =>
    data(
      await api.ctx.runMutation(
        internal.system.developerApi.webhooks.rotateWebhookSecret,
        {
          organizationId: api.organizationId,
          webhookId: api.params.webhookId!,
        }
      )
    ),

  "webhooks.deliveries": async (api) => ({
    body: allItems(
      await api.ctx.runQuery(
        internal.system.developerApi.webhooks.webhookDeliveries,
        {
          organizationId: api.organizationId,
          webhookId: api.params.webhookId!,
          limit: pageParams(api).limit,
        }
      )
    ),
  }),

  /* ── analytics ───────────────────────────────────────────────────────── */

  "analytics.overview": async (api) =>
    data(
      await api.ctx.runQuery(internal.system.developerApi.insights.overview, {
        organizationId: api.organizationId,
        windowDays: queryInteger(api.query, "windowDays", {
          min: 1,
          max: 365,
          fallback: 30,
        }),
      })
    ),

  "analytics.insights": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.insights.insightsPage,
      { organizationId: api.organizationId, ...pageParams(api) }
    )

    return { body: page(result.items, result) }
  },

  "analytics.leads": async (api) =>
    data(
      await api.ctx.runQuery(
        internal.system.developerApi.insights.leadSummary,
        {
          organizationId: api.organizationId,
        }
      )
    ),

  /* ── voice ───────────────────────────────────────────────────────────── */

  "voice.list": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.insights.voicePage,
      { organizationId: api.organizationId, ...pageParams(api) }
    )

    return { body: page(result.items, result) }
  },

  "voice.get": async (api) =>
    data(
      await api.ctx.runQuery(internal.system.developerApi.insights.voiceGet, {
        organizationId: api.organizationId,
        voiceConversationId: api.params.voiceConversationId!,
      })
    ),

  "voice.messages": async (api) => {
    const result = await api.ctx.runQuery(
      internal.system.developerApi.insights.voiceMessages,
      {
        organizationId: api.organizationId,
        voiceConversationId: api.params.voiceConversationId!,
        ...pageParams(api),
      }
    )

    return { body: page(result.items, result) }
  },
}
