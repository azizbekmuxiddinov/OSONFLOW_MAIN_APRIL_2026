/**
 * The developer API, described as data.
 *
 * One catalog feeds three things: the HTTP router (which scope and which limits
 * each route is charged against), the dashboard's key and limit controls, and
 * the public documentation page. Keeping them on one definition is what stops
 * the docs from promising an endpoint, a scope or a limit the server does not
 * actually enforce.
 *
 * This module is imported by the web app, so it must stay plain data: no
 * Convex server imports and no `process.env`. Platform overrides of the limit
 * defaults are applied server-side in `limits.ts`.
 */

export const DEVELOPER_API_VERSION = "v1"

/* ── scopes ──────────────────────────────────────────────────────────────── */

export const DEVELOPER_API_SCOPES = [
  {
    id: "chat",
    label: "Chat with the assistant",
    description:
      "Start conversations and send customer messages that the assistant answers.",
  },
  {
    id: "conversations:read",
    label: "Read conversations",
    description: "List conversations and read their messages.",
  },
  {
    id: "conversations:write",
    label: "Manage conversations",
    description:
      "Reply as your team, change status, priority and assignee, and delete conversations.",
  },
  {
    id: "contacts:read",
    label: "Read contacts",
    description:
      "List contacts and read what the assistant remembers about them.",
  },
  {
    id: "contacts:write",
    label: "Manage contacts",
    description: "Create contacts and update their name and email.",
  },
  {
    id: "knowledge:read",
    label: "Read the knowledge base",
    description: "List and search the documents the assistant answers from.",
  },
  {
    id: "knowledge:write",
    label: "Manage the knowledge base",
    description: "Add documents, websites and files, and remove them.",
  },
  {
    id: "assistants:read",
    label: "Read assistants",
    description: "Read each assistant's greeting, instructions and look.",
  },
  {
    id: "assistants:write",
    label: "Manage assistants",
    description: "Create assistants, change their settings and publish them.",
  },
  {
    id: "tools:read",
    label: "Read tools",
    description: "List the actions the assistant can take.",
  },
  {
    id: "tools:write",
    label: "Manage tools",
    description: "Create, change and remove the assistant's actions.",
  },
  {
    id: "saved_replies:read",
    label: "Read saved replies",
    description: "List your team's saved replies.",
  },
  {
    id: "saved_replies:write",
    label: "Manage saved replies",
    description: "Create, change and remove saved replies.",
  },
  {
    id: "workflows:read",
    label: "Read workflows",
    description: "List workflows, read their steps and see how they perform.",
  },
  {
    id: "workflows:write",
    label: "Manage workflows",
    description: "Create, change, publish, switch off and delete workflows.",
  },
  {
    id: "webhooks:read",
    label: "Read webhooks",
    description: "List event webhooks and their delivery history.",
  },
  {
    id: "webhooks:write",
    label: "Manage webhooks",
    description: "Create, change and remove event webhooks.",
  },
  {
    id: "analytics:read",
    label: "Read analytics",
    description: "Read resolution rates, topics, sentiment and lead numbers.",
  },
  {
    id: "voice:read",
    label: "Read voice calls",
    description: "List AI voice conversations and read their transcripts.",
  },
] as const

export type DeveloperApiScope = (typeof DEVELOPER_API_SCOPES)[number]["id"]

export const DEVELOPER_API_SCOPE_IDS: DeveloperApiScope[] =
  DEVELOPER_API_SCOPES.map((scope) => scope.id)

export const isDeveloperApiScope = (
  value: string
): value is DeveloperApiScope =>
  (DEVELOPER_API_SCOPE_IDS as string[]).includes(value)

export const DEVELOPER_API_SCOPE_PRESETS = [
  {
    id: "full",
    label: "Full access",
    description: "Everything the API can do.",
    scopes: DEVELOPER_API_SCOPE_IDS,
  },
  {
    id: "read_only",
    label: "Read only",
    description: "Can look at everything, can change nothing.",
    scopes: DEVELOPER_API_SCOPE_IDS.filter((scope) => scope.endsWith(":read")),
  },
  {
    id: "chat_only",
    label: "Chat only",
    description:
      "For your own chat window or app: create contacts, send messages, read replies.",
    scopes: [
      "chat",
      "contacts:write",
      "conversations:read",
    ] as DeveloperApiScope[],
  },
] as const

/* ── limits ──────────────────────────────────────────────────────────────── */

export type DeveloperApiLimitKey =
  | "requestsPerMinute"
  | "requestsPerDay"
  | "writesPerMinute"
  | "aiRequestsPerMinute"
  | "aiRequestsPerDay"
  | "knowledgeImportsPerHour"
  | "maxPageSize"
  | "maxMessageChars"
  | "maxBodyKb"

export type DeveloperApiLimitDefinition = {
  key: DeveloperApiLimitKey
  label: string
  description: string
  unit: string
  /** `rate` limits are counters that refill; `size` limits cap one request. */
  kind: "rate" | "size"
  default: number
  min: number
  max: number
}

export const DEVELOPER_API_LIMITS: DeveloperApiLimitDefinition[] = [
  {
    key: "requestsPerMinute",
    label: "Requests per minute",
    description: "Every call, whatever it does.",
    unit: "per minute",
    kind: "rate",
    default: 120,
    min: 1,
    max: 6000,
  },
  {
    key: "requestsPerDay",
    label: "Requests per day",
    description: "Every call, counted per UTC day.",
    unit: "per day",
    kind: "rate",
    default: 20_000,
    min: 1,
    max: 5_000_000,
  },
  {
    key: "writesPerMinute",
    label: "Changes per minute",
    description: "Calls that create, change or delete something.",
    unit: "per minute",
    kind: "rate",
    default: 60,
    min: 1,
    max: 3000,
  },
  {
    key: "aiRequestsPerMinute",
    label: "AI calls per minute",
    description:
      "Calls that run an AI model — chat messages and knowledge search. These spend your AI budget.",
    unit: "per minute",
    kind: "rate",
    default: 20,
    min: 1,
    max: 600,
  },
  {
    key: "aiRequestsPerDay",
    label: "AI calls per day",
    description: "The same AI calls, counted per UTC day.",
    unit: "per day",
    kind: "rate",
    default: 1000,
    min: 1,
    max: 200_000,
  },
  {
    key: "knowledgeImportsPerHour",
    label: "Knowledge imports per hour",
    description: "Documents, websites and files added to the knowledge base.",
    unit: "per hour",
    kind: "rate",
    default: 30,
    min: 1,
    max: 1000,
  },
  {
    key: "maxPageSize",
    label: "Largest page",
    description: "The most items one list call returns.",
    unit: "items",
    kind: "size",
    default: 100,
    min: 1,
    max: 500,
  },
  {
    key: "maxMessageChars",
    label: "Longest message",
    description: "The longest message text a call can send.",
    unit: "characters",
    kind: "size",
    default: 4000,
    min: 1,
    max: 32_000,
  },
  {
    key: "maxBodyKb",
    label: "Largest request",
    description: "The biggest request body, including uploaded files.",
    unit: "KB",
    kind: "size",
    default: 1024,
    min: 1,
    max: 10_240,
  },
]

export const DEVELOPER_API_LIMIT_KEYS = DEVELOPER_API_LIMITS.map(
  (limit) => limit.key
)

export const getDeveloperApiLimitDefinition = (key: DeveloperApiLimitKey) =>
  DEVELOPER_API_LIMITS.find((limit) => limit.key === key)!

export type DeveloperApiLimitValues = Record<DeveloperApiLimitKey, number>

export const DEVELOPER_API_LOG_RETENTION_DAYS = {
  default: 14,
  min: 1,
  max: 30,
} as const

/* ── errors ──────────────────────────────────────────────────────────────── */

export const DEVELOPER_API_ERRORS = [
  {
    status: 400,
    code: "invalid_request",
    description: "A field is missing, has the wrong type, or is out of range.",
  },
  {
    status: 401,
    code: "missing_api_key",
    description: "No `Authorization: Bearer` header was sent.",
  },
  {
    status: 401,
    code: "invalid_api_key",
    description: "The key does not exist, was revoked, or has expired.",
  },
  {
    status: 403,
    code: "api_disabled",
    description: "API access is switched off for this organization.",
  },
  {
    status: 403,
    code: "insufficient_scope",
    description: "The key is not allowed to call this endpoint.",
  },
  {
    status: 403,
    code: "ip_not_allowed",
    description: "The key only accepts calls from certain IP addresses.",
  },
  {
    status: 403,
    code: "origin_not_allowed",
    description:
      "The call came from a browser and the key does not allow that website.",
  },
  {
    status: 403,
    code: "forbidden",
    description: "The action is switched off for this organization.",
  },
  {
    status: 403,
    code: "plan_limit_reached",
    description: "Your plan does not include this, or you reached its maximum.",
  },
  {
    status: 404,
    code: "not_found",
    description:
      "The endpoint, or the thing you asked for, does not exist in this organization.",
  },
  {
    status: 405,
    code: "method_not_allowed",
    description: "The path exists but not with this HTTP method.",
  },
  {
    status: 409,
    code: "conflict",
    description:
      "The change clashes with the current state, such as deleting a live workflow.",
  },
  {
    status: 413,
    code: "payload_too_large",
    description: "The request body or message is bigger than your limit.",
  },
  {
    status: 429,
    code: "rate_limited",
    description:
      "A limit was reached. Wait for `Retry-After` seconds before trying again.",
  },
  {
    status: 500,
    code: "internal_error",
    description: "Something went wrong on our side. Retry with backoff.",
  },
] as const

export type DeveloperApiErrorCode =
  (typeof DEVELOPER_API_ERRORS)[number]["code"]

/* ── endpoints ───────────────────────────────────────────────────────────── */

export const DEVELOPER_API_GROUPS = [
  {
    id: "account",
    title: "Account",
    description:
      "Check which key you are using, what it may do and how much of your limits is left.",
  },
  {
    id: "contacts",
    title: "Contacts",
    description:
      "The people who talk to your assistant. A contact is needed before a conversation can start.",
  },
  {
    id: "conversations",
    title: "Conversations",
    description:
      "Chats between a contact and your assistant or team. Send customer messages to get AI replies, or reply as your team.",
  },
  {
    id: "knowledge",
    title: "Knowledge base",
    description:
      "The documents, websites and files the assistant answers from.",
  },
  {
    id: "assistants",
    title: "Assistants",
    description:
      "Each assistant's greeting, instructions, model, tools and look. Changes are saved as a draft until published.",
  },
  {
    id: "tools",
    title: "Tools",
    description:
      "Actions the assistant can take during a chat, such as looking up a spreadsheet or calling your API.",
  },
  {
    id: "saved_replies",
    title: "Saved replies",
    description: "Answers your team reuses in the inbox.",
  },
  {
    id: "workflows",
    title: "Workflows",
    description:
      "Step-by-step flows that run a conversation, and how each one performs.",
  },
  {
    id: "webhooks",
    title: "Webhooks",
    description:
      "Have Osonflow call your server when something happens, such as a new conversation or message.",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Resolution rates, top questions, sentiment and lead numbers.",
  },
  {
    id: "voice",
    title: "Voice calls",
    description: "AI voice conversations held through the voice widget.",
  },
] as const

export type DeveloperApiGroupId = (typeof DEVELOPER_API_GROUPS)[number]["id"]

export type DeveloperApiParam = {
  name: string
  type: "string" | "integer" | "boolean" | "object" | "array" | "file"
  required?: boolean
  description: string
  enum?: readonly string[]
}

export type DeveloperApiMethod = "GET" | "POST" | "PATCH" | "DELETE"

export type DeveloperApiEndpoint = {
  id: string
  group: DeveloperApiGroupId
  method: DeveloperApiMethod
  path: string
  /** `null` means any valid key may call it. */
  scope: DeveloperApiScope | null
  /** Changes something: also counted against changes per minute. */
  write?: boolean
  /** Runs an AI model: also counted against the AI limits. */
  ai?: boolean
  /** Adds to the knowledge base: also counted against imports per hour. */
  knowledgeImport?: boolean
  title: string
  summary: string
  pathParams?: DeveloperApiParam[]
  query?: DeveloperApiParam[]
  body?: DeveloperApiParam[]
  bodyEncoding?: "json" | "multipart"
  exampleRequest?: Record<string, unknown>
  exampleResponse: unknown
  notes?: string[]
}

/** Example ids, shaped like real ones, reused across the examples below. */
const ID = {
  contact: "kd7f2m9qv1c8d4e6t3w5y0b2n7h1j9s4",
  conversation: "jx9a4k2m7p1q8r3s6t0v5w2y4z7b1c9d",
  message: "m17q8e2r5t9y3u6i0o4p7a1s8d2f5g3h",
  knowledge: "e5c8b1n4m7q0w3e6r9t2y5u8i1o4p7a0",
  tool: "kh3n8b5v2c7x4z1l9k6j3h0g7f4d1s8a",
  savedReply: "kn4v8c2x6z0l3k7j1h5g9f2d6s0a4q8w",
  workflow: "jd2f6h0k4m8p2s6v0y4b8e2h6k0n4q8t",
  webhook: "kw5z9c3f7i1l5o9r3u7x1a5d9g3j7m1p",
  delivery: "k89s3v7y1b5e9h3k7n1q5t9w3z7c1f5i",
  voice: "jv6b0e4h8k2n6q0t4w8z2c6f0i4l8o2r",
  insight: "kz0c4f8i2l6o0r4u8x2a6d0g4j8m2p6s",
  key: "k2x6a0d4g8j2m6p0s4v8y2b6e0h4k8n2",
} as const

/** Values the documentation substitutes for path parameters in examples. */
export const DEVELOPER_API_EXAMPLE_PATH_PARAMS: Record<string, string> = {
  contactId: ID.contact,
  conversationId: ID.conversation,
  entryId: ID.knowledge,
  assistantId: "default",
  toolId: ID.tool,
  savedReplyId: ID.savedReply,
  workflowId: ID.workflow,
  webhookId: ID.webhook,
  voiceConversationId: ID.voice,
}

const T = {
  earlier: "2026-09-12T08:15:02.000Z",
  created: "2026-09-18T09:41:07.000Z",
  updated: "2026-09-18T09:41:12.000Z",
} as const

const listOf = (item: unknown, hasMore = false) => ({
  data: [item],
  hasMore,
  nextCursor: hasMore ? "20" : null,
})

const EXAMPLE_CONTACT = {
  id: ID.contact,
  object: "contact",
  name: "Dilnoza Karimova",
  email: "dilnoza@example.uz",
  isAnonymous: false,
  channel: "Web",
  externalId: "user_1842",
  phone: null,
  socialHandle: null,
  language: "uz",
  timezone: "Asia/Tashkent",
  pageUrl: "https://shop.example.uz/checkout",
  referrer: null,
  conversationCount: 1,
  latestConversationId: ID.conversation,
  latestConversationStatus: "unresolved",
  awaitingReply: false,
  firstSeenAt: T.earlier,
  lastActiveAt: T.created,
}

const EXAMPLE_CONVERSATION = {
  id: ID.conversation,
  object: "conversation",
  status: "unresolved",
  source: "widget",
  assistantId: "default",
  priority: null,
  assignee: null,
  contact: {
    id: ID.contact,
    name: "Dilnoza Karimova",
    email: "dilnoza@example.uz",
    isAnonymous: false,
  },
  unreadForTeam: 1,
  lastCustomerMessageAt: T.created,
  lastReplyAt: null,
  firstTeamResponseAt: null,
  escalatedAt: null,
  resolvedAt: null,
  resolvedBy: null,
  workflow: null,
  createdAt: T.created,
}

const EXAMPLE_CUSTOMER_MESSAGE = {
  id: ID.message,
  object: "message",
  role: "contact",
  authorName: null,
  text: "Buyurtmam qachon yetib keladi?",
  attachments: [],
  createdAt: T.created,
}

const EXAMPLE_REPLY = {
  id: "m2k7p1v5z9d3h7l1q5u9y3c7g1k5o9s3",
  object: "message",
  role: "assistant",
  authorName: null,
  text: "Buyurtmangiz 2–3 ish kunida yetkaziladi. Buyurtma raqamingizni yuborsangiz, holatini tekshirib beraman.",
  attachments: [],
  createdAt: T.updated,
}

const EXAMPLE_KNOWLEDGE_ENTRY = {
  id: ID.knowledge,
  object: "knowledge_entry",
  title: "Delivery and returns",
  type: "txt",
  size: "3.2 KB",
  status: "ready",
  category: "policies",
  sourceUrl: null,
  url: "https://example.convex.cloud/api/storage/…",
}

const EXAMPLE_ASSISTANT_SETTINGS = {
  greeting: "Assalomu alaykum! Qanday yordam bera olaman?",
  instructions: "You are the support assistant for Example Shop…",
  model: "gpt-4o-mini",
  suggestions: ["Yetkazib berish", "Qaytarish", "To'lov usullari"],
  toolIds: [ID.tool],
  copy: {
    homeGreeting: "Salom 👋",
    homeHeadline: "Qanday yordam kerak?",
    startChatLabel: "Suhbatni boshlash",
    inputPlaceholder: "Xabar yozing…",
    onlineLabel: "Onlayn",
  },
  theme: { primaryColor: "#4f46e5", assistantName: "Example Shop" },
  appearance: { launcherPosition: "bottom-right", showPoweredBy: true },
  helpTopics: [],
}

const EXAMPLE_ASSISTANT = {
  id: "default",
  object: "assistant",
  name: "Default agent",
  isDefault: true,
  publishedVersion: 7,
  updatedAt: T.updated,
}

const EXAMPLE_TOOL = {
  id: ID.tool,
  object: "tool",
  name: "check_order_status",
  description: "Look up an order by its number and return its delivery status.",
  type: "api_request",
  builtIn: false,
  enabled: true,
  channels: { chat: true, voice: false },
  parameters: [
    {
      name: "order_number",
      description: "The order number the customer gave.",
      type: "string",
      required: true,
    },
  ],
  config: {
    url: "https://api.example.uz/orders/{{order_number}}",
    method: "GET",
  },
  createdAt: T.earlier,
  updatedAt: T.updated,
}

const EXAMPLE_SAVED_REPLY = {
  id: ID.savedReply,
  object: "saved_reply",
  title: "Delivery times",
  body: "Orders in Tashkent arrive in 1–2 days, other regions in 2–4.",
  category: "delivery",
  usageCount: 12,
  createdAt: T.earlier,
  updatedAt: T.updated,
}

const EXAMPLE_WORKFLOW = {
  id: ID.workflow,
  object: "workflow",
  name: "Order status",
  description: "Collects an order number and looks it up.",
  isActive: true,
  isPublished: true,
  publishedAt: T.updated,
  createdAt: T.earlier,
  updatedAt: T.updated,
}

const EXAMPLE_WEBHOOK = {
  id: ID.webhook,
  object: "webhook",
  url: "https://api.example.uz/osonflow/events",
  description: "Sync conversations to our CRM",
  provider: "webhook",
  events: ["conversation.created", "message.received"],
  enabled: true,
  secretPreview: "whsec_4f9a1c2e…",
  createdAt: T.earlier,
  updatedAt: T.updated,
}

const EXAMPLE_INSIGHT = {
  id: ID.insight,
  object: "insight",
  channel: "chat",
  conversationId: ID.conversation,
  voiceConversationId: null,
  contactId: ID.contact,
  status: "resolved",
  intent: "delivery_time",
  sentiment: "neutral",
  urgency: "low",
  language: "uz",
  summary:
    "Customer asked when their order arrives; the assistant gave delivery times.",
  unanswered: false,
  unansweredQuestion: null,
  escalated: false,
  resolved: true,
  resolvedBy: "ai",
  firstTeamResponseMs: null,
  minutesSaved: 6,
  updatedAt: T.updated,
}

const EXAMPLE_MEMORY = {
  object: "customer_memory",
  email: "dilnoza@example.uz",
  name: "Dilnoza Karimova",
  summary: "Returning customer in Tashkent who usually asks about delivery.",
  preferredLanguage: "uz",
  recentIntents: ["delivery_time"],
  notableFacts: ["Prefers evening delivery"],
  history: [
    {
      channel: "chat",
      intent: "delivery_time",
      status: "resolved",
      summary: "Asked about delivery time for order 1042.",
      at: T.created,
    },
  ],
  totals: { conversations: 4, escalations: 1, resolved: 3 },
  lastSeenAt: T.created,
  updatedAt: T.updated,
}

const EXAMPLE_VOICE = {
  id: ID.voice,
  object: "voice_conversation",
  provider: "openai_realtime",
  status: "resolved",
  contact: {
    id: ID.contact,
    name: "Anonymous voice visitor",
    email: null,
    isAnonymous: true,
  },
  lastMessagePreview: "Rahmat, hammasi tushunarli.",
  linkedConversationId: null,
  lastActivityAt: T.updated,
  endedAt: T.updated,
  createdAt: T.created,
}

const EXAMPLE_LIMITS = {
  requestsPerMinute: 120,
  requestsPerDay: 20000,
  writesPerMinute: 60,
  aiRequestsPerMinute: 20,
  aiRequestsPerDay: 1000,
  knowledgeImportsPerHour: 30,
  maxPageSize: 100,
  maxMessageChars: 4000,
  maxBodyKb: 1024,
}

const PAGINATION_QUERY: DeveloperApiParam[] = [
  {
    name: "limit",
    type: "integer",
    description:
      "How many items to return, from 1 up to your largest page. Defaults to 20.",
  },
  {
    name: "cursor",
    type: "string",
    description: "The `nextCursor` from the previous page.",
  },
]

const idParam = (name: string, what: string): DeveloperApiParam => ({
  name,
  type: "string",
  required: true,
  description: `The ${what}'s id.`,
})

export const DEVELOPER_API_ENDPOINTS: DeveloperApiEndpoint[] = [
  /* ── account ─────────────────────────────────────────────────────────── */
  {
    id: "account.me",
    group: "account",
    method: "GET",
    path: "/v1/me",
    scope: null,
    title: "Get the current key",
    summary:
      "Returns the organization and key behind the request, its scopes, and the limits that apply to it.",
    exampleResponse: {
      data: {
        object: "api_key",
        organizationId: "org_2ZkQ8pX1vB4nM7cR",
        key: {
          id: ID.key,
          name: "CRM sync",
          prefix: "osf_live_4Hq2",
          scopes: ["conversations:read", "contacts:read"],
          expiresAt: null,
          createdAt: T.earlier,
        },
        limits: EXAMPLE_LIMITS,
        apiVersion: "v1",
      },
    },
  },
  {
    id: "account.usage",
    group: "account",
    method: "GET",
    path: "/v1/usage",
    scope: null,
    title: "Get today's usage",
    summary:
      "How many calls this key and your whole organization made today (UTC), and how many are left.",
    exampleResponse: {
      data: {
        object: "usage",
        day: "2026-09-18",
        organization: { requests: 1840, aiRequests: 212, errors: 9 },
        key: { requests: 610, aiRequests: 0, errors: 2 },
        remaining: { requestsToday: 18160, aiRequestsToday: 788 },
        limits: EXAMPLE_LIMITS,
      },
    },
  },

  /* ── contacts ────────────────────────────────────────────────────────── */
  {
    id: "contacts.list",
    group: "contacts",
    method: "GET",
    path: "/v1/contacts",
    scope: "contacts:read",
    title: "List contacts",
    summary:
      "Contacts who left their details, newest first. Anonymous visitors are not included.",
    query: [
      {
        name: "search",
        type: "string",
        description: "Matches name, email, phone, handle, page or language.",
      },
      {
        name: "segment",
        type: "string",
        enum: ["all", "waiting", "newcomers", "no_chats"],
        description:
          "`waiting` — handed to your team and the customer spoke last. `newcomers` — first seen in the last 7 days. `no_chats` — never started a chat.",
      },
      ...PAGINATION_QUERY,
    ],
    exampleResponse: listOf(EXAMPLE_CONTACT),
  },
  {
    id: "contacts.create",
    group: "contacts",
    method: "POST",
    path: "/v1/contacts",
    scope: "contacts:write",
    write: true,
    title: "Create a contact",
    summary:
      "Adds a person your assistant can talk to. Use the returned id to start a conversation.",
    body: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Up to 40 characters.",
      },
      {
        name: "email",
        type: "string",
        required: true,
        description: "Up to 50 characters.",
      },
      {
        name: "externalId",
        type: "string",
        description: "Your own id for this person, stored with the contact.",
      },
      {
        name: "language",
        type: "string",
        description: "Language tag, such as `uz` or `ru`.",
      },
      {
        name: "timezone",
        type: "string",
        description: "IANA time zone, such as `Asia/Tashkent`.",
      },
      {
        name: "pageUrl",
        type: "string",
        description: "The page they were on.",
      },
      {
        name: "referrer",
        type: "string",
        description: "Where they came from.",
      },
    ],
    exampleRequest: {
      name: "Dilnoza Karimova",
      email: "dilnoza@example.uz",
      externalId: "user_1842",
      language: "uz",
      timezone: "Asia/Tashkent",
    },
    exampleResponse: {
      data: {
        ...EXAMPLE_CONTACT,
        conversationCount: 0,
        latestConversationId: null,
        latestConversationStatus: null,
      },
    },
  },
  {
    id: "contacts.get",
    group: "contacts",
    method: "GET",
    path: "/v1/contacts/:contactId",
    scope: "contacts:read",
    title: "Get a contact",
    summary:
      "One contact, with how many conversations they had and whether they are waiting on you.",
    pathParams: [idParam("contactId", "contact")],
    exampleResponse: { data: EXAMPLE_CONTACT },
  },
  {
    id: "contacts.update",
    group: "contacts",
    method: "PATCH",
    path: "/v1/contacts/:contactId",
    scope: "contacts:write",
    write: true,
    title: "Update a contact",
    summary:
      "Change a contact's name or email. Send only the fields you want to change.",
    pathParams: [idParam("contactId", "contact")],
    body: [
      { name: "name", type: "string", description: "Up to 40 characters." },
      { name: "email", type: "string", description: "Up to 50 characters." },
    ],
    exampleRequest: { email: "dilnoza.karimova@example.uz" },
    exampleResponse: {
      data: { ...EXAMPLE_CONTACT, email: "dilnoza.karimova@example.uz" },
    },
  },
  {
    id: "contacts.memory",
    group: "contacts",
    method: "GET",
    path: "/v1/contacts/:contactId/memory",
    scope: "contacts:read",
    title: "Get what the assistant remembers",
    summary:
      "The assistant's running summary of this contact across conversations. `data` is `null` until there is something to remember.",
    pathParams: [idParam("contactId", "contact")],
    exampleResponse: { data: EXAMPLE_MEMORY },
    notes: [
      "Customer memory is part of paid plans; on other plans `data` is always `null`.",
    ],
  },
  {
    id: "contacts.memories",
    group: "contacts",
    method: "GET",
    path: "/v1/customer-memories",
    scope: "contacts:read",
    title: "List customer memories",
    summary:
      "Every customer the assistant remembers, most recently seen first.",
    query: [
      {
        name: "limit",
        type: "integer",
        description:
          "How many to return, up to your largest page. Defaults to 20.",
      },
    ],
    exampleResponse: {
      data: [EXAMPLE_MEMORY],
      hasMore: false,
      nextCursor: null,
    },
  },

  /* ── conversations ───────────────────────────────────────────────────── */
  {
    id: "conversations.list",
    group: "conversations",
    method: "GET",
    path: "/v1/conversations",
    scope: "conversations:read",
    title: "List conversations",
    summary:
      "Newest first. Filters are applied to each page, so a page can hold fewer items than `limit`.",
    query: [
      {
        name: "status",
        type: "string",
        enum: ["unresolved", "escalated", "resolved"],
        description:
          "`unresolved` — the assistant is handling it. `escalated` — handed to your team.",
      },
      {
        name: "source",
        type: "string",
        enum: ["widget", "workflow"],
        description:
          "Whether the assistant or a published workflow ran the conversation.",
      },
      {
        name: "contactId",
        type: "string",
        description: "Only this contact's conversations.",
      },
      {
        name: "assigned",
        type: "string",
        enum: ["assigned", "unassigned"],
        description: "Whether someone on your team owns it.",
      },
      {
        name: "includeLastMessage",
        type: "boolean",
        description: "Adds `lastMessage` to each conversation.",
      },
      ...PAGINATION_QUERY,
    ],
    exampleResponse: listOf(EXAMPLE_CONVERSATION, true),
  },
  {
    id: "conversations.create",
    group: "conversations",
    method: "POST",
    path: "/v1/conversations",
    scope: "chat",
    write: true,
    ai: true,
    title: "Start a conversation",
    summary:
      "Starts a conversation with the contact's first message and returns the assistant's reply. A conversation always begins with a real message, so `message` is required.",
    body: [
      {
        name: "contactId",
        type: "string",
        required: true,
        description: "Who is writing.",
      },
      {
        name: "message",
        type: "string",
        required: true,
        description: "Their first message.",
      },
      {
        name: "assistantId",
        type: "string",
        description:
          "Which assistant answers. Defaults to your default assistant.",
      },
      {
        name: "greeting",
        type: "boolean",
        description:
          "Put the assistant's greeting at the start of the transcript, as the widget does. Defaults to `true`.",
      },
    ],
    exampleRequest: {
      contactId: ID.contact,
      message: "Buyurtmam qachon yetib keladi?",
    },
    exampleResponse: {
      data: {
        conversation: EXAMPLE_CONVERSATION,
        messages: [EXAMPLE_CUSTOMER_MESSAGE, EXAMPLE_REPLY],
      },
    },
    notes: [
      "AI replies need an active paid plan. Without one, the customer receives a note that a person will reply.",
      "When a published workflow is live, it runs the conversation instead of the assistant. Workflow steps that call AI or your API can finish after the response is sent — read the messages again to pick them up.",
    ],
  },
  {
    id: "conversations.get",
    group: "conversations",
    method: "GET",
    path: "/v1/conversations/:conversationId",
    scope: "conversations:read",
    title: "Get a conversation",
    summary:
      "One conversation. When a workflow is waiting for the customer, `workflow` shows what it is waiting for, including any buttons.",
    pathParams: [idParam("conversationId", "conversation")],
    exampleResponse: {
      data: {
        ...EXAMPLE_CONVERSATION,
        source: "workflow",
        workflow: {
          id: ID.workflow,
          status: "waiting",
          waitingFor: "buttons",
          prompt: "Qaysi mavzu bo'yicha?",
          buttons: [
            { id: "btn_delivery", label: "Yetkazib berish" },
            { id: "btn_returns", label: "Qaytarish" },
          ],
        },
      },
    },
  },
  {
    id: "conversations.update",
    group: "conversations",
    method: "PATCH",
    path: "/v1/conversations/:conversationId",
    scope: "conversations:write",
    write: true,
    title: "Update a conversation",
    summary:
      "Change status, priority or assignee. Changing the status fires the `conversation.status_changed` webhook.",
    pathParams: [idParam("conversationId", "conversation")],
    body: [
      {
        name: "status",
        type: "string",
        enum: ["unresolved", "escalated", "resolved"],
        description: "`escalated` hands it to your team; `resolved` closes it.",
      },
      {
        name: "priority",
        type: "string",
        enum: ["urgent", "high", "medium", "low"],
        description: "Send `null` to clear it.",
      },
      {
        name: "assignee",
        type: "object",
        description:
          '`{ "id": "…", "name": "…" }` of the person who owns it, or `null` to unassign.',
      },
    ],
    exampleRequest: {
      status: "escalated",
      priority: "high",
      assignee: { id: "user_2Nf8", name: "Aziz" },
    },
    exampleResponse: {
      data: {
        ...EXAMPLE_CONVERSATION,
        status: "escalated",
        priority: "high",
        assignee: { id: "user_2Nf8", name: "Aziz" },
        escalatedAt: T.updated,
      },
    },
  },
  {
    id: "conversations.delete",
    group: "conversations",
    method: "DELETE",
    path: "/v1/conversations/:conversationId",
    scope: "conversations:write",
    write: true,
    title: "Delete a conversation",
    summary:
      "Deletes the conversation, its messages and its analytics. This cannot be undone.",
    pathParams: [idParam("conversationId", "conversation")],
    exampleResponse: {
      data: { id: ID.conversation, object: "conversation", deleted: true },
    },
  },
  {
    id: "conversations.messages",
    group: "conversations",
    method: "GET",
    path: "/v1/conversations/:conversationId/messages",
    scope: "conversations:read",
    title: "List messages",
    summary:
      "The transcript, newest message first. Internal tool calls are left out. Reverse the page to show it top to bottom.",
    pathParams: [idParam("conversationId", "conversation")],
    query: PAGINATION_QUERY,
    exampleResponse: {
      data: [EXAMPLE_REPLY, EXAMPLE_CUSTOMER_MESSAGE],
      hasMore: false,
      nextCursor: null,
    },
    notes: [
      "`role` is `contact` for the customer and `assistant` for everything sent back, whether by AI or by your team. Team replies carry the person's name in `authorName`.",
    ],
  },
  {
    id: "conversations.send",
    group: "conversations",
    method: "POST",
    path: "/v1/conversations/:conversationId/messages",
    scope: "chat",
    write: true,
    ai: true,
    title: "Send a customer message",
    summary:
      "Adds a message from the contact and waits for the assistant's reply. The response holds every new message, starting with the one you sent.",
    pathParams: [idParam("conversationId", "conversation")],
    body: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "What the customer wrote.",
      },
      {
        name: "buttonId",
        type: "string",
        description:
          "When a workflow is waiting on buttons, the id of the button the customer picked.",
      },
    ],
    exampleRequest: { text: "Buyurtma raqamim 1042" },
    exampleResponse: {
      data: {
        conversation: { ...EXAMPLE_CONVERSATION, unreadForTeam: 2 },
        messages: [
          { ...EXAMPLE_CUSTOMER_MESSAGE, text: "Buyurtma raqamim 1042" },
          {
            ...EXAMPLE_REPLY,
            text: "1042-buyurtmangiz yo'lda, ertaga yetkaziladi.",
          },
        ],
      },
    },
    notes: [
      "A resolved conversation cannot take new messages — start a new one instead.",
      "Once a conversation is handed to your team (`escalated`), the assistant stops answering and `messages` holds only the customer's message.",
    ],
  },
  {
    id: "conversations.reply",
    group: "conversations",
    method: "POST",
    path: "/v1/conversations/:conversationId/replies",
    scope: "conversations:write",
    write: true,
    title: "Reply as your team",
    summary:
      "Sends a message from a person on your team. The conversation moves to `escalated`, so the assistant stops answering, and the reply is delivered on Telegram, WhatsApp or Instagram when that is where the customer wrote from.",
    pathParams: [idParam("conversationId", "conversation")],
    body: [
      {
        name: "text",
        type: "string",
        required: true,
        description: "The reply.",
      },
      {
        name: "authorName",
        type: "string",
        description:
          "Name shown with the reply. Defaults to the API key's name.",
      },
      {
        name: "authorId",
        type: "string",
        description:
          "Your id for the person, used to assign the conversation to them.",
      },
    ],
    exampleRequest: {
      text: "Salom Dilnoza! Kuryer bugun soat 18:00 gacha keladi.",
      authorName: "Aziz",
      authorId: "user_2Nf8",
    },
    exampleResponse: {
      data: {
        conversation: {
          ...EXAMPLE_CONVERSATION,
          status: "escalated",
          assignee: { id: "user_2Nf8", name: "Aziz" },
          lastReplyAt: T.updated,
          firstTeamResponseAt: T.updated,
        },
        message: {
          ...EXAMPLE_REPLY,
          authorName: "Aziz",
          text: "Salom Dilnoza! Kuryer bugun soat 18:00 gacha keladi.",
        },
      },
    },
  },
  {
    id: "conversations.read",
    group: "conversations",
    method: "POST",
    path: "/v1/conversations/:conversationId/read",
    scope: "conversations:write",
    write: true,
    title: "Mark as read",
    summary: "Clears the unread count your team sees for this conversation.",
    pathParams: [idParam("conversationId", "conversation")],
    exampleResponse: { data: { ...EXAMPLE_CONVERSATION, unreadForTeam: 0 } },
  },

  /* ── knowledge ───────────────────────────────────────────────────────── */
  {
    id: "knowledge.list",
    group: "knowledge",
    method: "GET",
    path: "/v1/knowledge",
    scope: "knowledge:read",
    title: "List knowledge",
    summary: "Everything in the knowledge base.",
    query: [
      {
        name: "category",
        type: "string",
        description: "Only entries in this category.",
      },
      ...PAGINATION_QUERY,
    ],
    exampleResponse: listOf(EXAMPLE_KNOWLEDGE_ENTRY),
  },
  {
    id: "knowledge.get",
    group: "knowledge",
    method: "GET",
    path: "/v1/knowledge/:entryId",
    scope: "knowledge:read",
    title: "Get an entry's content",
    summary:
      "The text of an entry. For documents that are not plain text, such as PDFs, `content` is `null` and `url` links to the file.",
    pathParams: [idParam("entryId", "entry")],
    exampleResponse: {
      data: {
        id: ID.knowledge,
        object: "knowledge_content",
        title: "delivery-and-returns.txt",
        sourceUrl: null,
        content: "Orders in Tashkent arrive in 1–2 working days…",
        url: null,
      },
    },
  },
  {
    id: "knowledge.createDocument",
    group: "knowledge",
    method: "POST",
    path: "/v1/knowledge/documents",
    scope: "knowledge:write",
    write: true,
    knowledgeImport: true,
    title: "Add a text document",
    summary:
      "Adds text the assistant can answer from. Adding the same text again is ignored rather than duplicated.",
    body: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "Up to 120 characters.",
      },
      {
        name: "text",
        type: "string",
        required: true,
        description: "The content, up to your largest request.",
      },
      {
        name: "category",
        type: "string",
        description: "Any label you use to group entries.",
      },
    ],
    exampleRequest: {
      title: "Delivery and returns",
      text: "Orders in Tashkent arrive in 1–2 working days. Other regions take 2–4…",
      category: "policies",
    },
    exampleResponse: {
      data: { ...EXAMPLE_KNOWLEDGE_ENTRY, status: "processing", created: true },
    },
    notes: [
      "Entries are indexed in the background: `status` is `processing` until the assistant can use them.",
      "Knowledge imports need an active paid plan.",
    ],
  },
  {
    id: "knowledge.createWebsite",
    group: "knowledge",
    method: "POST",
    path: "/v1/knowledge/websites",
    scope: "knowledge:write",
    write: true,
    knowledgeImport: true,
    title: "Add a web page",
    summary: "Reads a public web page and adds its text to the knowledge base.",
    body: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "A public http(s) address.",
      },
      {
        name: "title",
        type: "string",
        description: "Defaults to the page's own title.",
      },
      {
        name: "category",
        type: "string",
        description: "Any label you use to group entries.",
      },
    ],
    exampleRequest: {
      url: "https://shop.example.uz/delivery",
      category: "policies",
    },
    exampleResponse: {
      data: {
        ...EXAMPLE_KNOWLEDGE_ENTRY,
        type: "url",
        title: "Delivery — Example Shop",
        sourceUrl: "https://shop.example.uz/delivery",
        status: "processing",
        created: true,
      },
    },
  },
  {
    id: "knowledge.createFile",
    group: "knowledge",
    method: "POST",
    path: "/v1/knowledge/files",
    scope: "knowledge:write",
    write: true,
    knowledgeImport: true,
    bodyEncoding: "multipart",
    title: "Upload a file",
    summary:
      "Uploads a PDF, plain-text, CSV, Markdown, HTML or image file. Send it as `multipart/form-data`.",
    body: [
      {
        name: "file",
        type: "file",
        required: true,
        description: "The file, within your largest request size.",
      },
      {
        name: "category",
        type: "string",
        description: "Any label you use to group entries.",
      },
    ],
    exampleResponse: {
      data: {
        ...EXAMPLE_KNOWLEDGE_ENTRY,
        title: "price-list.pdf",
        type: "pdf",
        status: "processing",
        created: true,
      },
    },
  },
  {
    id: "knowledge.delete",
    group: "knowledge",
    method: "DELETE",
    path: "/v1/knowledge/:entryId",
    scope: "knowledge:write",
    write: true,
    title: "Delete an entry",
    summary: "Removes an entry. The assistant stops using it straight away.",
    pathParams: [idParam("entryId", "entry")],
    exampleResponse: {
      data: { id: ID.knowledge, object: "knowledge_entry", deleted: true },
    },
  },
  {
    id: "knowledge.search",
    group: "knowledge",
    method: "POST",
    path: "/v1/knowledge/search",
    scope: "knowledge:read",
    ai: true,
    title: "Search knowledge",
    summary:
      "Finds the passages that best match a question — the same search the assistant runs before it answers.",
    body: [
      {
        name: "query",
        type: "string",
        required: true,
        description: "A question or phrase.",
      },
      {
        name: "limit",
        type: "integer",
        description: "How many passages, 1 to 10. Defaults to 5.",
      },
    ],
    exampleRequest: { query: "How long does delivery take?", limit: 3 },
    exampleResponse: {
      data: [
        {
          object: "knowledge_match",
          entryId: ID.knowledge,
          title: "Delivery and returns",
          score: 0.83,
          text: "Orders in Tashkent arrive in 1–2 working days…",
        },
      ],
    },
  },

  /* ── assistants ──────────────────────────────────────────────────────── */
  {
    id: "assistants.list",
    group: "assistants",
    method: "GET",
    path: "/v1/assistants",
    scope: "assistants:read",
    title: "List assistants",
    summary: "Every assistant in the organization, the default one first.",
    exampleResponse: {
      data: [EXAMPLE_ASSISTANT],
      hasMore: false,
      nextCursor: null,
      maxAssistants: 5,
    },
  },
  {
    id: "assistants.create",
    group: "assistants",
    method: "POST",
    path: "/v1/assistants",
    scope: "assistants:write",
    write: true,
    title: "Create an assistant",
    summary:
      "Adds a new assistant with default settings. Your plan sets how many you can have.",
    body: [
      {
        name: "name",
        type: "string",
        description: "Defaults to “Agent 2”, “Agent 3” and so on.",
      },
    ],
    exampleRequest: { name: "Russian storefront" },
    exampleResponse: {
      data: {
        ...EXAMPLE_ASSISTANT,
        id: "agent_m1x9k2_4hq8zt",
        name: "Russian storefront",
        isDefault: false,
        publishedVersion: 1,
      },
    },
  },
  {
    id: "assistants.get",
    group: "assistants",
    method: "GET",
    path: "/v1/assistants/:assistantId",
    scope: "assistants:read",
    title: "Get an assistant",
    summary:
      "The live settings (`published`), the unpublished ones (`draft`), and the last 20 published versions.",
    pathParams: [
      {
        name: "assistantId",
        type: "string",
        required: true,
        description: "The assistant's id. The default assistant is `default`.",
      },
    ],
    exampleResponse: {
      data: {
        ...EXAMPLE_ASSISTANT,
        publishedAt: T.earlier,
        hasUnpublishedChanges: false,
        published: EXAMPLE_ASSISTANT_SETTINGS,
        draft: EXAMPLE_ASSISTANT_SETTINGS,
        versions: [
          {
            version: 7,
            action: "publish",
            publishedAt: T.earlier,
            rolledBackFrom: null,
          },
        ],
      },
    },
  },
  {
    id: "assistants.update",
    group: "assistants",
    method: "PATCH",
    path: "/v1/assistants/:assistantId",
    scope: "assistants:write",
    write: true,
    title: "Update an assistant",
    summary:
      'Changes the draft. Send only what you want to change; objects such as `theme` are merged. Pass `"publish": true` to put the change live in the same call.',
    pathParams: [
      {
        name: "assistantId",
        type: "string",
        required: true,
        description: "The assistant's id.",
      },
    ],
    body: [
      {
        name: "name",
        type: "string",
        description: "The assistant's name in your dashboard.",
      },
      {
        name: "greeting",
        type: "string",
        description: "The first message a customer sees.",
      },
      {
        name: "instructions",
        type: "string",
        description: "How the assistant should behave.",
      },
      {
        name: "model",
        type: "string",
        description: "The chat model, such as `gpt-4o-mini`.",
      },
      {
        name: "suggestions",
        type: "array",
        description: "Up to 3 suggested questions.",
      },
      {
        name: "toolIds",
        type: "array",
        description: "The tools this assistant may use.",
      },
      {
        name: "copy",
        type: "object",
        description:
          "Widget text: `homeGreeting`, `homeHeadline`, `startChatLabel`, `inputPlaceholder`, `onlineLabel`.",
      },
      {
        name: "theme",
        type: "object",
        description: "Colours, logo, font and assistant name.",
      },
      {
        name: "appearance",
        type: "object",
        description: "Launcher position, size, label and behaviour.",
      },
      {
        name: "publish",
        type: "boolean",
        description: "Publish the draft after saving it.",
      },
    ],
    exampleRequest: {
      greeting: "Здравствуйте! Чем могу помочь?",
      suggestions: ["Доставка", "Возврат", "Оплата"],
      publish: true,
    },
    exampleResponse: {
      data: {
        ...EXAMPLE_ASSISTANT,
        publishedVersion: 8,
        publishedAt: T.updated,
        hasUnpublishedChanges: false,
        published: {
          ...EXAMPLE_ASSISTANT_SETTINGS,
          greeting: "Здравствуйте! Чем могу помочь?",
          suggestions: ["Доставка", "Возврат", "Оплата"],
        },
        draft: {
          ...EXAMPLE_ASSISTANT_SETTINGS,
          greeting: "Здравствуйте! Чем могу помочь?",
          suggestions: ["Доставка", "Возврат", "Оплата"],
        },
        versions: [],
      },
    },
  },
  {
    id: "assistants.publish",
    group: "assistants",
    method: "POST",
    path: "/v1/assistants/:assistantId/publish",
    scope: "assistants:write",
    write: true,
    title: "Publish an assistant",
    summary: "Puts the draft live on your website and every channel.",
    pathParams: [
      {
        name: "assistantId",
        type: "string",
        required: true,
        description: "The assistant's id.",
      },
    ],
    exampleResponse: {
      data: { id: "default", object: "assistant", publishedVersion: 8 },
    },
  },
  {
    id: "assistants.rollback",
    group: "assistants",
    method: "POST",
    path: "/v1/assistants/:assistantId/rollback",
    scope: "assistants:write",
    write: true,
    title: "Roll back an assistant",
    summary: "Puts an earlier published version live again, as a new version.",
    pathParams: [
      {
        name: "assistantId",
        type: "string",
        required: true,
        description: "The assistant's id.",
      },
    ],
    body: [
      {
        name: "version",
        type: "integer",
        required: true,
        description: "The version to restore.",
      },
    ],
    exampleRequest: { version: 6 },
    exampleResponse: {
      data: {
        id: "default",
        object: "assistant",
        publishedVersion: 9,
        rolledBackFrom: 6,
      },
    },
  },

  /* ── tools ───────────────────────────────────────────────────────────── */
  {
    id: "tools.list",
    group: "tools",
    method: "GET",
    path: "/v1/tools",
    scope: "tools:read",
    title: "List tools",
    summary:
      "Built-in tools (knowledge search, hand-off, resolve) and the ones you created.",
    exampleResponse: { data: [EXAMPLE_TOOL], hasMore: false, nextCursor: null },
  },
  {
    id: "tools.create",
    group: "tools",
    method: "POST",
    path: "/v1/tools",
    scope: "tools:write",
    write: true,
    title: "Create a tool",
    summary:
      "Gives the assistant a new action. The assistant decides when to use it from the name, description and parameters.",
    body: [
      {
        name: "name",
        type: "string",
        required: true,
        description:
          "Letters, numbers and underscores, starting with a letter.",
      },
      {
        name: "description",
        type: "string",
        required: true,
        description:
          "When the assistant should use it. Write it for the AI, in English.",
      },
      {
        name: "type",
        type: "string",
        required: true,
        enum: [
          "api_request",
          "custom_webhook",
          "google_sheets",
          "google_calendar",
        ],
        description: "What the tool does when called.",
      },
      {
        name: "parameters",
        type: "array",
        description:
          'What the assistant must collect first: `{ name, description, type: "string"|"number"|"boolean", required }`.',
      },
      {
        name: "config",
        type: "object",
        description:
          "Settings for the type — for `api_request`: `url`, `method`, `headersJson`, `bodyTemplate`; for `custom_webhook`: `webhookUrl`, `webhookMethod`.",
      },
      { name: "enabled", type: "boolean", description: "Defaults to `true`." },
      {
        name: "channels",
        type: "object",
        description:
          '`{ "chat": true, "voice": false }` — where the tool can be used.',
      },
    ],
    exampleRequest: {
      name: "check_order_status",
      description:
        "Look up an order by its number and return its delivery status.",
      type: "api_request",
      parameters: [
        {
          name: "order_number",
          description: "The order number the customer gave.",
          type: "string",
          required: true,
        },
      ],
      config: {
        url: "https://api.example.uz/orders/{{order_number}}",
        method: "GET",
      },
      channels: { chat: true, voice: false },
    },
    exampleResponse: { data: EXAMPLE_TOOL },
  },
  {
    id: "tools.get",
    group: "tools",
    method: "GET",
    path: "/v1/tools/:toolId",
    scope: "tools:read",
    title: "Get a tool",
    summary: "One tool with its full configuration.",
    pathParams: [idParam("toolId", "tool")],
    exampleResponse: { data: EXAMPLE_TOOL },
  },
  {
    id: "tools.update",
    group: "tools",
    method: "PATCH",
    path: "/v1/tools/:toolId",
    scope: "tools:write",
    write: true,
    title: "Update a tool",
    summary:
      "Send only what you want to change. Built-in tools can be switched on and off but not renamed.",
    pathParams: [idParam("toolId", "tool")],
    body: [
      {
        name: "name",
        type: "string",
        description: "Letters, numbers and underscores.",
      },
      {
        name: "description",
        type: "string",
        description: "When the assistant should use it.",
      },
      {
        name: "parameters",
        type: "array",
        description: "Replaces the whole list.",
      },
      {
        name: "config",
        type: "object",
        description: "Replaces the whole configuration.",
      },
      {
        name: "enabled",
        type: "boolean",
        description: "Switch the tool on or off.",
      },
      {
        name: "channels",
        type: "object",
        description: '`{ "chat": boolean, "voice": boolean }`.',
      },
    ],
    exampleRequest: { enabled: false },
    exampleResponse: { data: { ...EXAMPLE_TOOL, enabled: false } },
  },
  {
    id: "tools.delete",
    group: "tools",
    method: "DELETE",
    path: "/v1/tools/:toolId",
    scope: "tools:write",
    write: true,
    title: "Delete a tool",
    summary:
      "Removes a tool you created. Built-in tools cannot be deleted — switch them off instead.",
    pathParams: [idParam("toolId", "tool")],
    exampleResponse: { data: { id: ID.tool, object: "tool", deleted: true } },
  },

  /* ── saved replies ───────────────────────────────────────────────────── */
  {
    id: "savedReplies.list",
    group: "saved_replies",
    method: "GET",
    path: "/v1/saved-replies",
    scope: "saved_replies:read",
    title: "List saved replies",
    summary: "Most used first.",
    query: [
      {
        name: "search",
        type: "string",
        description: "Matches title, text or category.",
      },
      {
        name: "limit",
        type: "integer",
        description: "Up to 200. Defaults to 100.",
      },
    ],
    exampleResponse: {
      data: [EXAMPLE_SAVED_REPLY],
      hasMore: false,
      nextCursor: null,
    },
  },
  {
    id: "savedReplies.create",
    group: "saved_replies",
    method: "POST",
    path: "/v1/saved-replies",
    scope: "saved_replies:write",
    write: true,
    title: "Create a saved reply",
    summary: "Adds a reply your team can insert in the inbox.",
    body: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "A short name.",
      },
      {
        name: "body",
        type: "string",
        required: true,
        description: "The reply text.",
      },
      { name: "category", type: "string", description: "Any label." },
    ],
    exampleRequest: {
      title: "Delivery times",
      body: "Orders in Tashkent arrive in 1–2 days, other regions in 2–4.",
      category: "delivery",
    },
    exampleResponse: { data: { ...EXAMPLE_SAVED_REPLY, usageCount: 0 } },
  },
  {
    id: "savedReplies.update",
    group: "saved_replies",
    method: "PATCH",
    path: "/v1/saved-replies/:savedReplyId",
    scope: "saved_replies:write",
    write: true,
    title: "Update a saved reply",
    summary: "Send only what you want to change.",
    pathParams: [idParam("savedReplyId", "saved reply")],
    body: [
      { name: "title", type: "string", description: "A short name." },
      { name: "body", type: "string", description: "The reply text." },
      {
        name: "category",
        type: "string",
        description: "Send `null` to clear it.",
      },
    ],
    exampleRequest: {
      body: "Orders in Tashkent arrive next day, other regions in 2–4.",
    },
    exampleResponse: {
      data: {
        ...EXAMPLE_SAVED_REPLY,
        body: "Orders in Tashkent arrive next day, other regions in 2–4.",
      },
    },
  },
  {
    id: "savedReplies.delete",
    group: "saved_replies",
    method: "DELETE",
    path: "/v1/saved-replies/:savedReplyId",
    scope: "saved_replies:write",
    write: true,
    title: "Delete a saved reply",
    summary: "Removes a saved reply.",
    pathParams: [idParam("savedReplyId", "saved reply")],
    exampleResponse: {
      data: { id: ID.savedReply, object: "saved_reply", deleted: true },
    },
  },

  /* ── workflows ───────────────────────────────────────────────────────── */
  {
    id: "workflows.list",
    group: "workflows",
    method: "GET",
    path: "/v1/workflows",
    scope: "workflows:read",
    title: "List workflows",
    summary:
      "Most recently changed first. At most one workflow is active at a time.",
    exampleResponse: {
      data: [EXAMPLE_WORKFLOW],
      hasMore: false,
      nextCursor: null,
    },
  },
  {
    id: "workflows.create",
    group: "workflows",
    method: "POST",
    path: "/v1/workflows",
    scope: "workflows:write",
    write: true,
    title: "Create a workflow",
    summary:
      "Saves a new workflow as a draft. The easiest way to get a valid `definition` is to read one from an existing workflow and change it.",
    body: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Up to 120 characters.",
      },
      { name: "description", type: "string", description: "What it is for." },
      {
        name: "definition",
        type: "object",
        required: true,
        description:
          "`{ schemaVersion, nodes, edges }` exactly as the builder saves it.",
      },
    ],
    exampleRequest: {
      name: "Order status",
      definition: { schemaVersion: 1, nodes: [], edges: [] },
    },
    exampleResponse: {
      data: {
        ...EXAMPLE_WORKFLOW,
        isActive: false,
        isPublished: false,
        publishedAt: null,
      },
    },
  },
  {
    id: "workflows.get",
    group: "workflows",
    method: "GET",
    path: "/v1/workflows/:workflowId",
    scope: "workflows:read",
    title: "Get a workflow",
    summary:
      "The workflow with its draft `definition` and the `publishedDefinition` customers run.",
    pathParams: [idParam("workflowId", "workflow")],
    exampleResponse: {
      data: {
        ...EXAMPLE_WORKFLOW,
        definition: {
          schemaVersion: 1,
          name: "Order status",
          nodes: ["…"],
          edges: ["…"],
        },
        publishedDefinition: {
          schemaVersion: 1,
          name: "Order status",
          nodes: ["…"],
          edges: ["…"],
        },
      },
    },
  },
  {
    id: "workflows.update",
    group: "workflows",
    method: "PATCH",
    path: "/v1/workflows/:workflowId",
    scope: "workflows:write",
    write: true,
    title: "Update a workflow",
    summary:
      "Changes the draft. Customers keep running the published version until you publish again.",
    pathParams: [idParam("workflowId", "workflow")],
    body: [
      { name: "name", type: "string", description: "Up to 120 characters." },
      {
        name: "description",
        type: "string",
        description: "Send `null` to clear it.",
      },
      {
        name: "definition",
        type: "object",
        description: "Replaces the whole draft.",
      },
    ],
    exampleRequest: { name: "Order status (v2)" },
    exampleResponse: {
      data: { ...EXAMPLE_WORKFLOW, name: "Order status (v2)" },
    },
  },
  {
    id: "workflows.publish",
    group: "workflows",
    method: "POST",
    path: "/v1/workflows/:workflowId/publish",
    scope: "workflows:write",
    write: true,
    title: "Publish a workflow",
    summary:
      "Publishes the draft. By default it also becomes the live workflow and any other one is switched off.",
    pathParams: [idParam("workflowId", "workflow")],
    body: [
      {
        name: "activate",
        type: "boolean",
        description:
          "Set to `false` to publish without going live, for workflows used as components. Defaults to `true`.",
      },
    ],
    exampleResponse: { data: EXAMPLE_WORKFLOW },
  },
  {
    id: "workflows.deactivate",
    group: "workflows",
    method: "POST",
    path: "/v1/workflows/:workflowId/deactivate",
    scope: "workflows:write",
    write: true,
    title: "Switch a workflow off",
    summary:
      "New conversations go back to the assistant. Conversations already running finish as they are.",
    pathParams: [idParam("workflowId", "workflow")],
    exampleResponse: { data: { ...EXAMPLE_WORKFLOW, isActive: false } },
  },
  {
    id: "workflows.delete",
    group: "workflows",
    method: "DELETE",
    path: "/v1/workflows/:workflowId",
    scope: "workflows:write",
    write: true,
    title: "Delete a workflow",
    summary:
      "Deletes a workflow and its run history. Switch a live workflow off first.",
    pathParams: [idParam("workflowId", "workflow")],
    exampleResponse: {
      data: { id: ID.workflow, object: "workflow", deleted: true },
    },
  },
  {
    id: "workflows.runs",
    group: "workflows",
    method: "GET",
    path: "/v1/workflows/:workflowId/runs",
    scope: "workflows:read",
    title: "List runs",
    summary: "Recent conversations this workflow ran, newest first.",
    pathParams: [idParam("workflowId", "workflow")],
    query: [
      {
        name: "windowDays",
        type: "integer",
        description: "How far back to look, 1 to 365. Defaults to 30.",
      },
      {
        name: "outcome",
        type: "string",
        enum: ["completed", "abandoned", "live"],
        description: "Only runs that ended this way.",
      },
      {
        name: "limit",
        type: "integer",
        description: "Up to 200. Defaults to 50.",
      },
    ],
    exampleResponse: {
      data: [
        {
          id: "kr8f2v6n0q4u8y2c6g0k4o8s2w6a0e4i",
          object: "workflow_run",
          conversationId: ID.conversation,
          outcome: "completed",
          status: "ended",
          contactName: "Dilnoza Karimova",
          stepCount: 6,
          errorCount: 0,
          lastNodeId: "end-1",
          durationMs: 48210,
          startedAt: T.created,
          endedAt: T.updated,
        },
      ],
      hasMore: false,
      nextCursor: null,
    },
  },
  {
    id: "workflows.stats",
    group: "workflows",
    method: "GET",
    path: "/v1/workflows/:workflowId/stats",
    scope: "workflows:read",
    title: "Get step statistics",
    summary: "How many runs reached, stopped at, or failed on each step.",
    pathParams: [idParam("workflowId", "workflow")],
    query: [
      {
        name: "windowDays",
        type: "integer",
        description: "How far back to look, 1 to 365. Defaults to 30.",
      },
    ],
    exampleResponse: {
      data: {
        object: "workflow_stats",
        windowDays: 30,
        totalRuns: 412,
        completed: 351,
        abandoned: 55,
        live: 6,
        nodes: [
          { nodeId: "ask-order", entered: 398, stoppedHere: 31, errors: 0 },
        ],
      },
    },
  },

  /* ── webhooks ────────────────────────────────────────────────────────── */
  {
    id: "webhooks.list",
    group: "webhooks",
    method: "GET",
    path: "/v1/webhooks",
    scope: "webhooks:read",
    title: "List webhooks",
    summary:
      "Every event webhook. Signing secrets are only ever shown in part.",
    exampleResponse: {
      data: [EXAMPLE_WEBHOOK],
      hasMore: false,
      nextCursor: null,
    },
  },
  {
    id: "webhooks.create",
    group: "webhooks",
    method: "POST",
    path: "/v1/webhooks",
    scope: "webhooks:write",
    write: true,
    title: "Create a webhook",
    summary:
      "Osonflow will POST each chosen event to your URL. The response holds the full signing `secret` — the only time it is shown.",
    body: [
      {
        name: "url",
        type: "string",
        required: true,
        description: "A public https address.",
      },
      {
        name: "events",
        type: "array",
        required: true,
        description:
          "Any of `contact_session.created`, `conversation.created`, `conversation.status_changed`, `message.received`, `message.sent`.",
      },
      {
        name: "description",
        type: "string",
        description: "A note for your team.",
      },
    ],
    exampleRequest: {
      url: "https://api.example.uz/osonflow/events",
      events: ["conversation.created", "message.received"],
      description: "Sync conversations to our CRM",
    },
    exampleResponse: {
      data: {
        ...EXAMPLE_WEBHOOK,
        secret:
          "whsec_4f9a1c2e7b8d0f3a6c9e2b5d8f1a4c7e0b3d6f9a2c5e8b1d4f7a0c3e6b9d2f5a",
      },
    },
  },
  {
    id: "webhooks.update",
    group: "webhooks",
    method: "PATCH",
    path: "/v1/webhooks/:webhookId",
    scope: "webhooks:write",
    write: true,
    title: "Update a webhook",
    summary: "Send only what you want to change.",
    pathParams: [idParam("webhookId", "webhook")],
    body: [
      { name: "url", type: "string", description: "A public https address." },
      {
        name: "events",
        type: "array",
        description: "Replaces the whole list.",
      },
      {
        name: "description",
        type: "string",
        description: "A note for your team.",
      },
      {
        name: "enabled",
        type: "boolean",
        description: "Pause or resume deliveries.",
      },
    ],
    exampleRequest: { enabled: false },
    exampleResponse: { data: { ...EXAMPLE_WEBHOOK, enabled: false } },
  },
  {
    id: "webhooks.delete",
    group: "webhooks",
    method: "DELETE",
    path: "/v1/webhooks/:webhookId",
    scope: "webhooks:write",
    write: true,
    title: "Delete a webhook",
    summary: "Stops all deliveries to this URL.",
    pathParams: [idParam("webhookId", "webhook")],
    exampleResponse: {
      data: { id: ID.webhook, object: "webhook", deleted: true },
    },
  },
  {
    id: "webhooks.rotateSecret",
    group: "webhooks",
    method: "POST",
    path: "/v1/webhooks/:webhookId/rotate-secret",
    scope: "webhooks:write",
    write: true,
    title: "Rotate the signing secret",
    summary: "Issues a new secret. Deliveries are signed with it immediately.",
    pathParams: [idParam("webhookId", "webhook")],
    exampleResponse: {
      data: {
        id: ID.webhook,
        object: "webhook",
        secret:
          "whsec_9b2e5d8a1c4f7b0e3d6a9c2f5b8e1d4a7c0f3b6e9d2a5c8f1b4e7d0a3c6f9b2e",
      },
    },
  },
  {
    id: "webhooks.deliveries",
    group: "webhooks",
    method: "GET",
    path: "/v1/webhooks/:webhookId/deliveries",
    scope: "webhooks:read",
    title: "List deliveries",
    summary:
      "Recent attempts to call this webhook, newest first, with your server's response.",
    pathParams: [idParam("webhookId", "webhook")],
    query: [
      {
        name: "limit",
        type: "integer",
        description: "Up to your largest page. Defaults to 20.",
      },
    ],
    exampleResponse: {
      data: [
        {
          id: ID.delivery,
          object: "webhook_delivery",
          webhookId: ID.webhook,
          eventId: "evt_3b1c9a52-6f0e-4d8b-9a7c-2e4f6b8d0a1c",
          eventType: "message.received",
          status: "success",
          attempt: 1,
          responseStatus: 200,
          error: null,
          durationMs: 184,
          createdAt: T.updated,
        },
      ],
      hasMore: false,
      nextCursor: null,
    },
  },

  /* ── analytics ───────────────────────────────────────────────────────── */
  {
    id: "analytics.overview",
    group: "analytics",
    method: "GET",
    path: "/v1/analytics/overview",
    scope: "analytics:read",
    title: "Get the overview",
    summary:
      "How many conversations were resolved or handed over, the most common questions, sentiment, and the questions the assistant could not answer.",
    query: [
      {
        name: "windowDays",
        type: "integer",
        description: "How far back to look, 1 to 365. Defaults to 30.",
      },
    ],
    exampleResponse: {
      data: {
        object: "analytics_overview",
        windowDays: 30,
        totalConversations: 1204,
        resolved: 902,
        escalated: 211,
        unanswered: 64,
        resolutionRate: 75,
        escalationRate: 18,
        unansweredRate: 5,
        averageTeamResponseMs: 312000,
        minutesSaved: 5410,
        topIntents: [{ label: "delivery_time", count: 318 }],
        sentimentMix: [{ label: "neutral", count: 801 }],
        urgencyMix: [{ label: "low", count: 950 }],
        unansweredQuestions: [
          {
            question: "Do you ship to Kazakhstan?",
            count: 9,
            intent: "shipping_abroad",
          },
        ],
        channels: [
          {
            channel: "chat",
            total: 1130,
            resolved: 851,
            escalated: 199,
            resolutionRate: 75,
          },
          {
            channel: "voice",
            total: 74,
            resolved: 51,
            escalated: 12,
            resolutionRate: 69,
          },
        ],
      },
    },
  },
  {
    id: "analytics.insights",
    group: "analytics",
    method: "GET",
    path: "/v1/analytics/insights",
    scope: "analytics:read",
    title: "List conversation insights",
    summary:
      "The AI's reading of each conversation — intent, sentiment, urgency and a summary — most recently updated first.",
    query: PAGINATION_QUERY,
    exampleResponse: listOf(EXAMPLE_INSIGHT, true),
  },
  {
    id: "analytics.leads",
    group: "analytics",
    method: "GET",
    path: "/v1/analytics/leads",
    scope: "analytics:read",
    title: "Get lead numbers",
    summary:
      "How many contacts you have, where they came from, and how many are waiting on you.",
    exampleResponse: {
      data: {
        object: "lead_summary",
        totalLeads: 842,
        newcomers: 57,
        withConversations: 790,
        awaitingReply: 12,
        withoutChats: 52,
        channels: {
          widget: 12,
          voice: 30,
          telegram: 210,
          whatsapp: 95,
          instagram: 61,
          web: 434,
        },
        topReferrers: [{ label: "google.com", count: 211 }],
        topPages: [{ label: "/checkout", count: 96 }],
      },
    },
  },

  /* ── voice ───────────────────────────────────────────────────────────── */
  {
    id: "voice.list",
    group: "voice",
    method: "GET",
    path: "/v1/voice-conversations",
    scope: "voice:read",
    title: "List voice conversations",
    summary: "Most recent activity first.",
    query: PAGINATION_QUERY,
    exampleResponse: listOf(EXAMPLE_VOICE),
  },
  {
    id: "voice.get",
    group: "voice",
    method: "GET",
    path: "/v1/voice-conversations/:voiceConversationId",
    scope: "voice:read",
    title: "Get a voice conversation",
    summary:
      "One call. `linkedConversationId` is set when the call was handed to your team in the inbox.",
    pathParams: [idParam("voiceConversationId", "voice conversation")],
    exampleResponse: { data: EXAMPLE_VOICE },
  },
  {
    id: "voice.messages",
    group: "voice",
    method: "GET",
    path: "/v1/voice-conversations/:voiceConversationId/messages",
    scope: "voice:read",
    title: "Get a call transcript",
    summary: "What was said, newest first.",
    pathParams: [idParam("voiceConversationId", "voice conversation")],
    query: PAGINATION_QUERY,
    exampleResponse: {
      data: [
        {
          id: "k4t8x2b6f0j4n8r2v6z0d4h8l2p6t0x4",
          object: "voice_message",
          role: "assistant",
          text: "Rahmat, hammasi tushunarli.",
          createdAt: T.updated,
        },
      ],
      hasMore: false,
      nextCursor: null,
    },
  },
]

export const DEVELOPER_API_WEBHOOK_EVENTS = [
  {
    type: "contact_session.created",
    description:
      "A new contact left their details, or an anonymous visitor identified themselves.",
  },
  { type: "conversation.created", description: "A conversation started." },
  {
    type: "conversation.status_changed",
    description:
      "A conversation was handed over, resolved or reopened — by the AI, your team or the API.",
  },
  { type: "message.received", description: "A customer sent a message." },
  { type: "message.sent", description: "Someone on your team replied." },
] as const
