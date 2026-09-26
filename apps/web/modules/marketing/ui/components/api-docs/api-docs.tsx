"use client"

import {
  Fragment,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"

import {
  DEVELOPER_API_ENDPOINTS,
  DEVELOPER_API_ERRORS,
  DEVELOPER_API_GROUPS,
  DEVELOPER_API_LIMITS,
  DEVELOPER_API_LOG_RETENTION_DAYS,
  DEVELOPER_API_SCOPE_PRESETS,
  DEVELOPER_API_SCOPES,
  DEVELOPER_API_VERSION,
  DEVELOPER_API_WEBHOOK_EVENTS,
  type DeveloperApiEndpoint,
  type DeveloperApiParam,
} from "@workspace/backend/lib/developerApi/catalog"

import { useLanguage } from "@/lib/i18n/language-provider"
import { appPath } from "@/lib/urls"
import { DocsHeroTabs } from "../docs/docs-tabs"
import {
  Code,
  CodePanel,
  CopyButton,
  Highlighted,
  Section,
  Table,
  useActiveAnchor,
} from "../docs/docs-primitives"
import { JapandiPageShell } from "../japandi-page-shell"
import { SAMPLE_LANGUAGES, buildSample, type SampleLanguage } from "./samples"
import "./api-docs.css"

const LANGUAGE_STORAGE_KEY = "osonflow-docs-language"

/* ── small pieces ────────────────────────────────────────────────────────── */

const LanguagePanel = ({
  title,
  samples,
  language,
  onLanguageChange,
}: {
  title?: string
  samples: Partial<Record<SampleLanguage, string>>
  language: SampleLanguage
  onLanguageChange: (language: SampleLanguage) => void
}) => {
  const available = SAMPLE_LANGUAGES.filter((option) => samples[option.id])
  const shown = samples[language] ? language : available[0]!.id
  const code = samples[shown]!

  return (
    <div className="api-code">
      <div className="api-code__bar">
        <div className="api-code__bar-start">
          {title ? <span className="api-code__title">{title}</span> : null}
          <div className="api-code__tabs" role="tablist">
            {available.map((option) => (
              <button
                aria-selected={option.id === shown}
                className="api-code__tab"
                key={option.id}
                onClick={() => onLanguageChange(option.id)}
                role="tab"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <CopyButton text={code} />
      </div>
      <Highlighted code={code} />
    </div>
  )
}

/** Puts values into a translated sentence's `{name}` placeholders. */
const fillTemplate = (
  template: string,
  values: Record<string, string | number>
) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match
  )

/** Renders `backticks` in catalog text as inline code. */
const RichText = ({ text }: { text: string }) => (
  <>
    {text
      .split(/(`[^`]+`)/g)
      .map((part, index) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <Code key={index}>{part.slice(1, -1)}</Code>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
  </>
)

/* ── endpoint reference ──────────────────────────────────────────────────── */

const ParamList = ({
  title,
  params,
}: {
  title: string
  params: DeveloperApiParam[]
}) => (
  <div className="api-params">
    <p className="api-params__title">{title}</p>
    {params.map((param) => (
      <div className="api-param" key={param.name}>
        <div className="api-param__head">
          <span className="api-param__name" translate="no">
            {param.name}
          </span>
          <span className="api-param__type" translate="no">
            {param.type}
          </span>
          {param.required ? (
            <span className="api-param__required">Required</span>
          ) : null}
        </div>
        <p className="api-param__description">
          <RichText text={param.description} />
        </p>
        {param.enum ? (
          <div className="api-param__enum">
            {param.enum.map((value) => (
              <Code key={value}>{value}</Code>
            ))}
          </div>
        ) : null}
      </div>
    ))}
  </div>
)

const chargedLimits = (endpoint: DeveloperApiEndpoint) =>
  [
    "requests",
    endpoint.write ? "changes" : null,
    endpoint.ai ? "AI calls" : null,
    endpoint.knowledgeImport ? "knowledge imports" : null,
  ].filter(Boolean) as string[]

const EndpointBlock = ({
  endpoint,
  baseUrl,
  language,
  onLanguageChange,
}: {
  endpoint: DeveloperApiEndpoint
  baseUrl: string
  language: SampleLanguage
  onLanguageChange: (language: SampleLanguage) => void
}) => {
  const samples = useMemo(
    () =>
      Object.fromEntries(
        SAMPLE_LANGUAGES.map((option) => [
          option.id,
          buildSample(option.id, endpoint, baseUrl),
        ])
      ) as Record<SampleLanguage, string>,
    [endpoint, baseUrl]
  )

  return (
    <article className="api-endpoint" data-docs-anchor id={endpoint.id}>
      <div className="api-endpoint__main">
        <h3 className="api-docs__h3">{endpoint.title}</h3>
        <div className="api-endpoint__signature" translate="no">
          <span className="api-method" data-method={endpoint.method}>
            {endpoint.method}
          </span>
          <span className="api-endpoint__path">{endpoint.path}</span>
        </div>
        <p className="api-endpoint__summary">
          <RichText text={endpoint.summary} />
        </p>
        <div className="api-endpoint__meta">
          <span className="api-chip">
            Permission{" "}
            <strong translate={endpoint.scope ? "no" : undefined}>
              {endpoint.scope ?? "any key"}
            </strong>
          </span>
          <span className="api-chip">
            Counts toward <strong>{chargedLimits(endpoint).join(", ")}</strong>
          </span>
        </div>

        {endpoint.pathParams?.length ? (
          <ParamList params={endpoint.pathParams} title="Path parameters" />
        ) : null}
        {endpoint.query?.length ? (
          <ParamList params={endpoint.query} title="Query parameters" />
        ) : null}
        {endpoint.body?.length ? (
          <ParamList
            params={endpoint.body}
            title={
              endpoint.bodyEncoding === "multipart"
                ? "Form fields (multipart/form-data)"
                : "Body (JSON)"
            }
          />
        ) : null}
        {endpoint.notes?.length ? (
          <div className="api-docs__prose api-endpoint__notes">
            {endpoint.notes.map((note) => (
              <p className="api-docs__callout" key={note}>
                <RichText text={note} />
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="api-endpoint__code">
        <LanguagePanel
          language={language}
          onLanguageChange={onLanguageChange}
          samples={samples}
          title="Request"
        />
        <CodePanel
          code={JSON.stringify(endpoint.exampleResponse, null, 2)}
          title="Response"
        />
      </div>
    </article>
  )
}

/* ── guide content ───────────────────────────────────────────────────────── */

const GUIDE = [
  { id: "introduction", label: "Introduction" },
  { id: "quickstart", label: "Quickstart" },
  { id: "authentication", label: "Authentication" },
  { id: "permissions", label: "Permissions" },
  { id: "limits", label: "Limits" },
  { id: "errors", label: "Errors" },
  { id: "pagination", label: "Pagination" },
  { id: "webhooks", label: "Webhooks" },
  { id: "conventions", label: "Conventions" },
] as const

const quickstartSamples = (
  baseUrl: string
): Record<SampleLanguage, string> => ({
  curl: `# 1. Who is writing
curl "${baseUrl}/contacts" \\
  -H "Authorization: Bearer $OSONFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Dilnoza Karimova", "email": "dilnoza@example.uz" }'

# 2. Their first message starts the conversation and returns the reply
curl "${baseUrl}/conversations" \\
  -H "Authorization: Bearer $OSONFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "contactId": "CONTACT_ID", "message": "Buyurtmam qachon yetib keladi?" }'

# 3. Every next message goes to the same conversation
curl "${baseUrl}/conversations/CONVERSATION_ID/messages" \\
  -H "Authorization: Bearer $OSONFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "text": "Buyurtma raqamim 1042" }'`,
  javascript: `const BASE = "${baseUrl}"
const headers = {
  Authorization: \`Bearer \${process.env.OSONFLOW_API_KEY}\`,
  "Content-Type": "application/json",
}
const post = (path, body) =>
  fetch(BASE + path, { method: "POST", headers, body: JSON.stringify(body) })
    .then((response) => response.json())

// 1. Who is writing
const contact = await post("/contacts", {
  name: "Dilnoza Karimova",
  email: "dilnoza@example.uz",
})

// 2. Their first message starts the conversation and returns the reply
const started = await post("/conversations", {
  contactId: contact.data.id,
  message: "Buyurtmam qachon yetib keladi?",
})
const { conversation, messages } = started.data
console.log(messages[messages.length - 1].text)

// 3. Every next message goes to the same conversation
const next = await post(\`/conversations/\${conversation.id}/messages\`, {
  text: "Buyurtma raqamim 1042",
})`,
  python: `import os
import requests

BASE = "${baseUrl}"
session = requests.Session()
session.headers["Authorization"] = f"Bearer {os.environ['OSONFLOW_API_KEY']}"

# 1. Who is writing
contact = session.post(f"{BASE}/contacts", json={
    "name": "Dilnoza Karimova",
    "email": "dilnoza@example.uz",
}).json()["data"]

# 2. Their first message starts the conversation and returns the reply
started = session.post(f"{BASE}/conversations", json={
    "contactId": contact["id"],
    "message": "Buyurtmam qachon yetib keladi?",
}).json()["data"]
print(started["messages"][-1]["text"])

# 3. Every next message goes to the same conversation
reply = session.post(
    f"{BASE}/conversations/{started['conversation']['id']}/messages",
    json={"text": "Buyurtma raqamim 1042"},
).json()["data"]`,
})

const PAGINATION_SAMPLES = (
  baseUrl: string
): Record<SampleLanguage, string> => ({
  curl: `curl "${baseUrl}/conversations?limit=100" \\
  -H "Authorization: Bearer $OSONFLOW_API_KEY"

# Then pass the nextCursor from that response
curl "${baseUrl}/conversations?limit=100&cursor=NEXT_CURSOR" \\
  -H "Authorization: Bearer $OSONFLOW_API_KEY"`,
  javascript: `let cursor = null

do {
  const url = new URL("${baseUrl}/conversations")
  url.searchParams.set("limit", "100")
  if (cursor) url.searchParams.set("cursor", cursor)

  const page = await fetch(url, { headers }).then((response) => response.json())

  for (const conversation of page.data) {
    // …
  }

  cursor = page.nextCursor
} while (cursor)`,
  python: `cursor = None

while True:
    params = {"limit": 100}
    if cursor:
        params["cursor"] = cursor

    page = session.get(f"{BASE}/conversations", params=params).json()

    for conversation in page["data"]:
        ...

    cursor = page["nextCursor"]
    if not cursor:
        break`,
})

const WEBHOOK_VERIFY_SAMPLES: Record<SampleLanguage, string> = {
  curl: `# Signatures are checked in your server's code — see the JavaScript
# or Python tab. The header looks like this:
x-osonflow-signature: sha256=5f1c0d…`,
  javascript: `import crypto from "node:crypto"

// Verify against the raw body exactly as it arrived, before parsing it.
export function isFromOsonflow(rawBody, signatureHeader, secret) {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  const a = Buffer.from(expected)
  const b = Buffer.from(signatureHeader ?? "")

  return a.length === b.length && crypto.timingSafeEqual(a, b)
}`,
  python: `import hashlib
import hmac

# Verify against the raw body exactly as it arrived, before parsing it.
def is_from_osonflow(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature_header or "")`,
}

const WEBHOOK_PAYLOAD = `{
  "id": "evt_3b1c9a52-6f0e-4d8b-9a7c-2e4f6b8d0a1c",
  "type": "message.received",
  "attempt": 1,
  "occurredAt": "2026-09-18T09:41:07.000Z",
  "organizationId": "org_2ZkQ8pX1vB4nM7cR",
  "payload": {
    "conversationId": "jx9a4k2m7p1q8r3s6t0v5w2y4z7b1c9d",
    "contactSessionId": "kd7f2m9qv1c8d4e6t3w5y0b2n7h1j9s4",
    "prompt": "Buyurtmam qachon yetib keladi?",
    "attachmentCount": 0
  }
}`

const ERROR_EXAMPLE = `{
  "error": {
    "code": "rate_limited",
    "message": "You reached your organization's limit of 20 AI calls per minute.",
    "requestId": "req_05c3808474464c72956d0b44",
    "retryAfterSeconds": 16
  }
}`

/* ── page ────────────────────────────────────────────────────────────────── */

const isSampleLanguage = (value: unknown): value is SampleLanguage =>
  SAMPLE_LANGUAGES.some((option) => option.id === value)

const readStoredLanguage = (): SampleLanguage => {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isSampleLanguage(stored) ? stored : "curl"
  } catch {
    // Storage can be blocked; curl is a fine default.
    return "curl"
  }
}

const subscribeToStorage = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

/**
 * The code language shown in every sample, remembered between visits. The
 * server always renders cURL, so the stored choice is only read after
 * hydration and never causes a mismatch.
 */
const useSampleLanguage = () => {
  const stored = useSyncExternalStore(
    subscribeToStorage,
    readStoredLanguage,
    () => "curl" as const
  )
  const [chosen, setChosen] = useState<SampleLanguage | null>(null)

  const choose = (next: SampleLanguage) => {
    setChosen(next)

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    } catch {
      // Not remembering the choice is harmless.
    }
  }

  return [chosen ?? stored, choose] as const
}

const NavContents = ({ active }: { active: string }) => (
  <>
    <div className="api-docs__nav-group">
      <p className="api-docs__nav-title">Guide</p>
      <ul className="api-docs__nav-list">
        {GUIDE.map((item) => (
          <li key={item.id}>
            <a aria-current={active === item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
    <div className="api-docs__nav-group">
      <p className="api-docs__nav-title">API reference</p>
      <ul className="api-docs__nav-list">
        {DEVELOPER_API_GROUPS.map((group) => {
          const endpoints = DEVELOPER_API_ENDPOINTS.filter(
            (endpoint) => endpoint.group === group.id
          )
          const groupActive =
            active === `group-${group.id}` ||
            endpoints.some((endpoint) => endpoint.id === active)

          return (
            <li key={group.id}>
              <a
                aria-current={active === `group-${group.id}`}
                href={`#group-${group.id}`}
              >
                {group.title}
              </a>
              {groupActive ? (
                <ul className="api-docs__nav-sub">
                  {endpoints.map((endpoint) => (
                    <li key={endpoint.id}>
                      <a
                        aria-current={active === endpoint.id}
                        href={`#${endpoint.id}`}
                      >
                        {endpoint.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  </>
)

export const ApiDocs = ({ baseUrl }: { baseUrl: string }) => {
  const active = useActiveAnchor("introduction")
  const [language, setLanguage] = useSampleLanguage()
  const { language: pageLanguage, t } = useLanguage()
  const formatNumber = (value: number) =>
    value.toLocaleString(pageLanguage === "en" ? "en-US" : "ru-RU")
  const keysUrl = appPath("/developers")
  const rateLimits = DEVELOPER_API_LIMITS.filter(
    (limit) => limit.kind === "rate"
  )
  const sizeLimits = DEVELOPER_API_LIMITS.filter(
    (limit) => limit.kind === "size"
  )

  return (
    <JapandiPageShell>
      {/* Prose here is split around inline code, leaving tiny fragments such
          as "is" or "to"; the translator looks those up as api|… keys so
          they never change the same words elsewhere on the site. */}
      <div className="api-docs" data-i18n-context="api">
        <section className="section api-docs-hero">
          <div className="container">
            <DocsHeroTabs />
            <span className="eyebrow">Developers</span>
            <h1 className="api-docs-hero__title">Osonflow API</h1>
            <p className="api-docs-hero__lead">
              Everything your team does in Osonflow, from your own code. Start
              chats and get AI replies inside your app, sync conversations and
              contacts to your CRM, keep the knowledge base current, and react
              to events the moment they happen.
            </p>
            <div className="api-docs-hero__actions">
              <a className="btn btn--primary" href={keysUrl}>
                Get an API key
              </a>
              <a className="btn btn--ghost" href="#quickstart">
                Quickstart
              </a>
            </div>
            <dl className="api-docs-hero__facts">
              <div className="api-docs-hero__fact">
                <dt>Base URL</dt>
                <dd translate="no">
                  <Code>{baseUrl}</Code>
                </dd>
              </div>
              <div className="api-docs-hero__fact">
                <dt>Version</dt>
                <dd>
                  <Code>{DEVELOPER_API_VERSION}</Code> ·{" "}
                  {DEVELOPER_API_ENDPOINTS.length} endpoints
                </dd>
              </div>
              <div className="api-docs-hero__fact">
                <dt>Format</dt>
                <dd>JSON over HTTPS, keys sent as Bearer tokens</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section api-docs-body">
          <div className="api-docs__grid container">
            <nav aria-label="Documentation" className="api-docs__nav">
              <NavContents active={active} />
            </nav>

            <div className="api-docs__content">
              <details className="api-docs__nav-mobile">
                <summary>On this page</summary>
                <div>
                  <NavContents active={active} />
                </div>
              </details>

              <Section eyebrow="Guide" id="introduction" title="Introduction">
                <p>
                  The Osonflow API is a REST API. You send JSON over HTTPS to{" "}
                  <Code>{baseUrl}</Code>, authenticate with an API key from your
                  dashboard, and get JSON back — a <Code>data</Code> field when
                  a call succeeds, an <Code>error</Code> field when it does not.
                </p>
                <p>
                  Anything you can do in the dashboard has an endpoint:
                  contacts, conversations and their messages, the knowledge
                  base, assistants, tools, saved replies, workflows, event
                  webhooks, analytics and voice calls. Customer messages sent
                  through the API are answered by the same assistant, knowledge
                  base and tools as your website widget, and every conversation
                  appears in your team&apos;s inbox.
                </p>
                <p>
                  Every key is tied to one organization and can only see that
                  organization&apos;s data. What each key may do, and how much,
                  is set on the{" "}
                  <a className="api-docs__link" href={keysUrl}>
                    Developer API page
                  </a>{" "}
                  of your dashboard.
                </p>
              </Section>

              <Section
                eyebrow="Guide"
                id="quickstart"
                title="Quickstart: a chat in three calls"
              >
                <ol>
                  <li>
                    In your dashboard, open <strong>Developer API</strong> and
                    create a key with the <strong>Chat only</strong> access
                    preset. Copy it — it is shown once.
                  </li>
                  <li>
                    Store it on your server as <Code>OSONFLOW_API_KEY</Code>.
                    Never put it in a mobile app or a web page: anyone could
                    copy it from there.
                  </li>
                  <li>
                    Create a contact, then start a conversation with their first
                    message. The response already holds the assistant&apos;s
                    reply.
                  </li>
                </ol>
                <LanguagePanel
                  language={language}
                  onLanguageChange={setLanguage}
                  samples={quickstartSamples(baseUrl)}
                />
                <p>
                  The reply is written in the customer&apos;s language, from
                  your knowledge base and with your tools, exactly as in the
                  widget. When the assistant hands the conversation to your
                  team, it stops answering; your team replies from the inbox, or
                  you reply through{" "}
                  <a className="api-docs__link" href="#conversations.reply">
                    Reply as your team
                  </a>
                  .
                </p>
              </Section>

              <Section
                eyebrow="Guide"
                id="authentication"
                title="Authentication"
              >
                <p>
                  Send your key in the <Code>Authorization</Code> header of
                  every call:
                </p>
                <CodePanel
                  code={`Authorization: Bearer osf_live_4Hq2…`}
                  title="Header"
                />
                <p>
                  Keys start with <Code>osf_live_</Code>. Osonflow stores only a
                  fingerprint of each key, so a lost key cannot be shown again —
                  <strong> roll</strong> it instead, which replaces it with a
                  new one that has the same permissions and limits.{" "}
                  <strong>Revoking</strong> a key stops it immediately, and so
                  does switching API access off for the whole organization. Keys
                  can also be set to stop working after 30, 90 or 365 days.
                </p>
                <p>
                  <strong>
                    Keys work from servers only, unless you say otherwise.
                  </strong>{" "}
                  A browser always tells the server which website a call came
                  from, and calls from websites a key does not list are refused
                  with <Code>origin_not_allowed</Code>. If you do need to call
                  from a browser, list the website on the key; Osonflow then
                  answers the browser&apos;s preflight and the call succeeds
                  from that site only. You can also limit a key to IP addresses
                  or ranges such as <Code>198.51.100.0/24</Code>.
                </p>
              </Section>

              <Section eyebrow="Guide" id="permissions" title="Permissions">
                <p>
                  Each endpoint needs one permission, shown next to it in the
                  reference. A key only gets the permissions you tick when
                  creating it, and you can change them later without replacing
                  the key. Three presets cover the common cases:
                </p>
                <Table
                  head={["Preset", "What it allows"]}
                  rows={DEVELOPER_API_SCOPE_PRESETS.map((preset) => [
                    preset.label,
                    preset.description,
                  ])}
                />
                <Table
                  head={["Permission", "Allows"]}
                  rows={DEVELOPER_API_SCOPES.map((scope) => [
                    <Code key={scope.id}>{scope.id}</Code>,
                    scope.description,
                  ])}
                />
                <p>
                  <Code>GET /v1/me</Code> and <Code>GET /v1/usage</Code> work
                  with any key.
                </p>
              </Section>

              <Section eyebrow="Guide" id="limits" title="Limits">
                <p>
                  Limits keep a runaway script from flooding your inbox or
                  spending your AI budget. Every one of them is adjustable, at
                  three levels:
                </p>
                <ul>
                  <li>
                    <strong>Your organization</strong> sets its limits on the
                    Developer API page. They are shared by all of its keys.
                  </li>
                  <li>
                    <strong>A key</strong>{" "}
                    can be given tighter limits of its
                    own, counted separately — so one busy integration cannot use
                    up what the others need. A key&apos;s limits can never be
                    looser than its organization&apos;s.
                  </li>
                  <li>
                    <strong>Osonflow</strong> sets the most any organization can
                    choose, shown as the maximum below.
                  </li>
                </ul>
                <p>
                  Each call counts toward <strong>requests</strong>. Calls that
                  change something also count toward <strong>changes</strong>,
                  calls that run an AI model toward <strong>AI calls</strong>,
                  and knowledge uploads toward{" "}
                  <strong>knowledge imports</strong> — the reference shows
                  which, for every endpoint. Per-minute and per-hour limits
                  refill continuously; per-day limits reset at midnight UTC.
                </p>
                <Table
                  head={["Limit", "Counts", "Default", "Maximum"]}
                  numeric={[2, 3]}
                  rows={rateLimits.map((limit) => [
                    limit.label,
                    limit.description,
                    formatNumber(limit.default),
                    formatNumber(limit.max),
                  ])}
                />
                <p>
                  Size limits cap a single call. Going over them returns{" "}
                  <Code>413 payload_too_large</Code>.
                </p>
                <Table
                  head={["Limit", "Caps", "Default", "Maximum"]}
                  numeric={[2, 3]}
                  rows={sizeLimits.map((limit) => [
                    limit.label,
                    limit.description,
                    <>
                      {formatNumber(limit.default)} {limit.unit}
                    </>,
                    <>
                      {formatNumber(limit.max)} {limit.unit}
                    </>,
                  ])}
                />
                <p>
                  Successful responses carry <Code>X-RateLimit-Limit</Code> and{" "}
                  <Code>X-RateLimit-Remaining</Code> for requests per minute.
                  When a limit is reached the call is refused with{" "}
                  <Code>429 rate_limited</Code>, a <Code>Retry-After</Code>{" "}
                  header in seconds, and a message naming the limit. Nothing is
                  counted against your other limits when a call is refused. Call{" "}
                  <a className="api-docs__link" href="#account.usage">
                    GET /v1/usage
                  </a>{" "}
                  to see what is left for today.{" "}
                  {fillTemplate(
                    t(
                      "Every call is logged on the Developer API page for {days} days by default (adjustable from {min} to {max})."
                    ),
                    {
                      days: DEVELOPER_API_LOG_RETENTION_DAYS.default,
                      min: DEVELOPER_API_LOG_RETENTION_DAYS.min,
                      max: DEVELOPER_API_LOG_RETENTION_DAYS.max,
                    }
                  )}
                </p>
              </Section>

              <Section eyebrow="Guide" id="errors" title="Errors">
                <p>
                  A failed call returns an HTTP status and a JSON body with a
                  stable <Code>code</Code> you can branch on, a{" "}
                  <Code>message</Code> written for people, and the{" "}
                  <Code>requestId</Code> — the same value as the{" "}
                  <Code>X-Request-Id</Code> header. Quote it if you contact
                  support.
                </p>
                <CodePanel code={ERROR_EXAMPLE} title="Error" />
                <Table
                  head={["Status", "Code", "Meaning"]}
                  rows={DEVELOPER_API_ERRORS.map((error) => [
                    String(error.status),
                    <Code key={error.code}>{error.code}</Code>,
                    <RichText
                      key={`${error.code}-text`}
                      text={error.description}
                    />,
                  ])}
                />
                <p>
                  Unknown fields in a request body are rejected rather than
                  ignored, so a typo shows up as an error instead of a change
                  that silently did nothing. Retry <Code>429</Code> and{" "}
                  <Code>5xx</Code> responses with backoff; do not retry other{" "}
                  <Code>4xx</Code> responses unchanged.
                </p>
              </Section>

              <Section eyebrow="Guide" id="pagination" title="Pagination">
                <p>
                  List endpoints return a page at a time. Ask for up to your
                  largest page with <Code>limit</Code> (20 by default). When{" "}
                  <Code>hasMore</Code> is true, pass the returned{" "}
                  <Code>nextCursor</Code> as <Code>cursor</Code> to get the next
                  page. Cursors are opaque; do not build or change them.
                </p>
                <LanguagePanel
                  language={language}
                  onLanguageChange={setLanguage}
                  samples={PAGINATION_SAMPLES(baseUrl)}
                />
              </Section>

              <Section eyebrow="Guide" id="webhooks" title="Webhooks">
                <p>
                  Instead of asking for changes, let Osonflow tell you. Create a
                  webhook in the dashboard or with{" "}
                  <a className="api-docs__link" href="#webhooks.create">
                    POST /v1/webhooks
                  </a>
                  , choose events, and Osonflow will <Code>POST</Code> each one
                  to your URL as it happens.
                </p>
                <Table
                  head={["Event", "Sent when"]}
                  rows={DEVELOPER_API_WEBHOOK_EVENTS.map((event) => [
                    <Code key={event.type}>{event.type}</Code>,
                    event.description,
                  ])}
                />
                <CodePanel code={WEBHOOK_PAYLOAD} title="Delivery body" />
                <p>
                  Each delivery carries <Code>x-osonflow-event-id</Code>,{" "}
                  <Code>x-osonflow-event-type</Code>,{" "}
                  <Code>x-osonflow-attempt</Code> and{" "}
                  <Code>x-osonflow-signature</Code>. The signature is an
                  HMAC-SHA256 of the raw body, keyed with the webhook&apos;s
                  signing secret. Check it before trusting a delivery:
                </p>
                <LanguagePanel
                  language={language === "curl" ? "javascript" : language}
                  onLanguageChange={setLanguage}
                  samples={WEBHOOK_VERIFY_SAMPLES}
                />
                <p>
                  Answer with any <Code>2xx</Code> status. If your server is
                  unreachable, times out, or answers <Code>408</Code>,{" "}
                  <Code>429</Code> or <Code>5xx</Code>, Osonflow tries again
                  after 15 seconds, 1 minute and 5 minutes — four attempts in
                  all. Other <Code>4xx</Code> answers are treated as final.
                  Because a delivery can arrive more than once, use the event{" "}
                  <Code>id</Code>{" "}
                  to ignore repeats. Recent deliveries and your
                  server&apos;s responses are listed by{" "}
                  <a className="api-docs__link" href="#webhooks.deliveries">
                    List deliveries
                  </a>
                  .
                </p>
              </Section>

              <Section eyebrow="Guide" id="conventions" title="Conventions">
                <ul>
                  <li>
                    <strong>Ids</strong> are strings. Treat them as opaque and
                    store them as they are.
                  </li>
                  <li>
                    <strong>Times</strong> are ISO 8601 strings in UTC, such as{" "}
                    <Code>2026-09-18T09:41:07.000Z</Code>.
                  </li>
                  <li>
                    <strong>Every record</strong> says what it is in an{" "}
                    <Code>object</Code> field — <Code>conversation</Code>,{" "}
                    <Code>message</Code>, <Code>contact</Code> and so on.
                  </li>
                  <li>
                    <strong>Missing values</strong> are <Code>null</Code>, not
                    left out, so every field of a record is always present.
                  </li>
                  <li>
                    <strong>Updates</strong> are partial: send only the fields
                    you want to change. Where a field can be cleared, send{" "}
                    <Code>null</Code>.
                  </li>
                  <li>
                    <strong>Versioning:</strong> within <Code>v1</Code>, new
                    endpoints and new fields may appear, but nothing is renamed
                    or removed. Write your code to ignore fields it does not
                    know.
                  </li>
                </ul>
              </Section>

              {DEVELOPER_API_GROUPS.map((group) => (
                <section
                  className="api-docs__group"
                  data-docs-anchor
                  id={`group-${group.id}`}
                  key={group.id}
                >
                  <p className="api-docs__eyebrow">API reference</p>
                  <h2 className="api-docs__h2">{group.title}</h2>
                  <p className="api-docs__group-lede">{group.description}</p>
                  {DEVELOPER_API_ENDPOINTS.filter(
                    (endpoint) => endpoint.group === group.id
                  ).map((endpoint) => (
                    <EndpointBlock
                      baseUrl={baseUrl}
                      endpoint={endpoint}
                      key={endpoint.id}
                      language={language}
                      onLanguageChange={setLanguage}
                    />
                  ))}
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>
    </JapandiPageShell>
  )
}
