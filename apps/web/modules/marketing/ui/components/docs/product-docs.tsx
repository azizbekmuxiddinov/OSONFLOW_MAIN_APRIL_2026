"use client"

import Link from "next/link"
import type { ReactNode } from "react"

import {
  DEFAULT_WIDGET_SCRIPT_URL,
  INTEGRATION_SNIPPET_BUILDERS,
} from "@/modules/integrations/constants"
import { appPath } from "@/lib/urls"
import "../api-docs/api-docs.css"
import { JapandiPageShell } from "../japandi-page-shell"
import { DocsHeroTabs } from "./docs-tabs"
import {
  Code,
  CodePanel,
  Section,
  Table,
  useActiveAnchor,
} from "./docs-primitives"

// The product guide: how a business sets Osonflow up and runs it day to day.
// Its wording follows the dashboard's own (modules/onboarding/lib/steps.ts and
// the page descriptions in each module), so a reader who switches between the
// guide and the product meets the same names for the same things.

type DocsNavGroup = {
  title: string
  items: { id: string; label: string }[]
}

const DOCS_NAV: DocsNavGroup[] = [
  {
    title: "Get started",
    items: [
      { id: "welcome", label: "Welcome" },
      { id: "quickstart", label: "Quickstart" },
      { id: "how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Teach your assistant",
    items: [
      { id: "ai-setup", label: "Set up with AI" },
      { id: "knowledge-base", label: "Knowledge base" },
      { id: "customer-memory", label: "Customer memory" },
    ],
  },
  {
    title: "Go live",
    items: [
      { id: "website-chat", label: "Website chat" },
      { id: "widget-customization", label: "Widget customization" },
      { id: "channels", label: "Telegram, Instagram, WhatsApp" },
    ],
  },
  {
    title: "Every day",
    items: [
      { id: "conversations", label: "Conversations" },
      { id: "leads", label: "Leads" },
      { id: "voice", label: "AI voicechats" },
      { id: "analytics", label: "AI performance" },
    ],
  },
  {
    title: "Automate",
    items: [
      { id: "workflows", label: "Workflows" },
      { id: "assistant-tools", label: "Assistant tools" },
      { id: "event-webhooks", label: "Event webhooks" },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "ai-keys", label: "Your AI keys" },
      { id: "billing", label: "Plans & Billing" },
      { id: "data-transfer", label: "Data transfer" },
    ],
  },
]

const EMBED_SNIPPET = INTEGRATION_SNIPPET_BUILDERS.html5({
  organizationId: "YOUR_ORGANIZATION_ID",
  scriptUrl: DEFAULT_WIDGET_SCRIPT_URL,
  position: "bottom-right",
})

const DashLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="api-docs__link" href={appPath(href)}>
    {children}
  </a>
)

const Steps = ({ steps }: { steps: { title: string; body: ReactNode }[] }) => (
  <ol className="docs-steps">
    {steps.map((step, index) => (
      <li className="docs-step" key={step.title}>
        <span aria-hidden="true" className="docs-step__num">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <p className="docs-step__title">{step.title}</p>
          <p className="docs-step__body">{step.body}</p>
        </div>
      </li>
    ))}
  </ol>
)

const NavContents = ({ active }: { active: string }) => (
  <>
    {DOCS_NAV.map((group) => (
      <div className="api-docs__nav-group" key={group.title}>
        <p className="api-docs__nav-title" data-i18n-context="docs">
          {group.title}
        </p>
        <ul className="api-docs__nav-list">
          {group.items.map((item) => (
            <li key={item.id}>
              <a aria-current={active === item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </>
)

export const ProductDocs = () => {
  const active = useActiveAnchor("welcome")

  return (
    <JapandiPageShell>
      <div className="api-docs">
        <section className="section api-docs-hero">
          <div className="container">
            <DocsHeroTabs />
            <span className="eyebrow">Documentation</span>
            <h1 className="api-docs-hero__title">Osonflow docs</h1>
            <p className="api-docs-hero__lead">
              Everything you need to run Osonflow: teach the assistant about
              your business, put it on your website and messengers, work the
              inbox with your team, and automate the questions that should be
              answered the same way every time.
            </p>
            <div className="api-docs-hero__actions">
              <a className="btn btn--primary" href={appPath("/sign-up")}>
                Start free
              </a>
              <a className="btn btn--ghost" href="#quickstart">
                Quickstart
              </a>
            </div>
            <dl className="api-docs-hero__facts">
              <div className="api-docs-hero__fact">
                <dt>Channels</dt>
                <dd>Website chat, Telegram, Instagram, WhatsApp</dd>
              </div>
              <div className="api-docs-hero__fact">
                <dt>Knowledge files</dt>
                <dd>PDF, CSV, TXT, DOCX and web pages</dd>
              </div>
              <div className="api-docs-hero__fact">
                <dt>Building on Osonflow?</dt>
                <dd>
                  <Link className="api-docs__link" href="/docs/api">
                    Read the API reference
                  </Link>
                </dd>
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

              {/* ── Get started ─────────────────────────────────────────── */}

              <Section eyebrow="Get started" id="welcome" title="Welcome">
                <p>
                  Osonflow puts an AI assistant on your website and in your
                  messengers. It answers customers from the documents and pages
                  you give it — and nothing else — and hands the conversation
                  to your team when a person is needed.
                </p>
                <p>
                  This guide follows the dashboard from top to bottom. If you
                  are just starting, read the{" "}
                  <a className="api-docs__link" href="#quickstart">
                    Quickstart
                  </a>
                  ; the rest you can come back to when you need it.
                </p>
                <div className="docs-cards">
                  <a className="docs-card" href="#quickstart">
                    <span className="docs-card__title">Set up in five steps</span>
                    <span className="docs-card__body">
                      Switch it on, teach it, make it yours, add it to your
                      site.
                    </span>
                  </a>
                  <a className="docs-card" href="#conversations">
                    <span className="docs-card__title">Work the inbox</span>
                    <span className="docs-card__body">
                      Read along, step in, and close conversations with your
                      team.
                    </span>
                  </a>
                  <Link className="docs-card" href="/docs/api">
                    <span className="docs-card__title">Build with the API</span>
                    <span className="docs-card__body">
                      Start chats from your own app and sync data to your CRM.
                    </span>
                  </Link>
                </div>
              </Section>

              <Section eyebrow="Get started" id="quickstart" title="Quickstart">
                <p>
                  After you sign up, the dashboard walks you through these
                  steps. Most businesses finish in about fifteen minutes.
                </p>
                <Steps
                  steps={[
                    {
                      title: "Switch the assistant on",
                      body: (
                        <>
                          Osonflow writes answers using OpenAI. Its own keys
                          work out of the box; add your company&apos;s key in{" "}
                          <DashLink href="/integrations">Integrations</DashLink>{" "}
                          if you want AI usage billed to your own account.
                        </>
                      ),
                    },
                    {
                      title: "Tell it about your business",
                      body: (
                        <>
                          Paste your website address and it reads the pages
                          itself. Add price lists, policies and FAQs to the{" "}
                          <DashLink href="/files">Knowledge base</DashLink>{" "}
                          later.
                        </>
                      ),
                    },
                    {
                      title: "Make it look like you",
                      body: (
                        <>
                          Choose the assistant&apos;s name, the first thing it
                          says, and the colour of the chat button in{" "}
                          <DashLink href="/customization">
                            Widget customization
                          </DashLink>
                          .
                        </>
                      ),
                    },
                    {
                      title: "Put it on your website",
                      body: (
                        <>
                          Copy one line of code and paste it into your site. A
                          chat button then appears in the corner of every page.
                          See{" "}
                          <a className="api-docs__link" href="#website-chat">
                            Website chat
                          </a>
                          .
                        </>
                      ),
                    },
                    {
                      title: "Your first conversation",
                      body: "Every chat arrives in your inbox. Read along while the assistant answers and step in as a human at any point.",
                    },
                  ]}
                />
              </Section>

              <Section
                eyebrow="Get started"
                id="how-it-works"
                title="How it works"
              >
                <ul>
                  <li>
                    <strong>You teach it.</strong> Give it your documents,
                    prices and policies. It reads them and nothing else.
                  </li>
                  <li>
                    <strong>It answers first.</strong> Every customer is
                    answered right away, day and night, and every reply shows
                    the source it came from so your team can check it.
                  </li>
                  <li>
                    <strong>You get the hard ones.</strong>{" "}
                    When a question
                    can&apos;t be answered from your content, or a customer asks
                    for a person, the conversation is escalated to your team.
                  </li>
                  <li>
                    <strong>It gets better.</strong> Questions it could not
                    answer show up in AI performance, so you know what to add
                    to the knowledge base next.
                  </li>
                </ul>
              </Section>

              {/* ── Teach your assistant ────────────────────────────────── */}

              <Section
                eyebrow="Teach your assistant"
                id="ai-setup"
                title="Set up with AI"
              >
                <p>
                  The fastest way to a working assistant. In{" "}
                  <DashLink href="/ai-setup">Set up with AI</DashLink>, give it
                  your website address and it reads the site, asks you to fill
                  in what the website doesn&apos;t say, and then writes your
                  knowledge base, instructions and chat window.
                </p>
                <p>
                  Nothing goes live on its own: what it writes is saved as a
                  draft for you to review and change before you publish.
                </p>
              </Section>

              <Section
                eyebrow="Teach your assistant"
                id="knowledge-base"
                title="Knowledge base"
              >
                <p>
                  The documents and web pages the assistant is allowed to answer
                  from — the single most important page in the dashboard. The
                  assistant answers only from what you put here, so it cannot
                  invent a price or a policy.
                </p>
                <Table
                  head={["Source", "What to use it for"]}
                  rows={[
                    [
                      "Web pages",
                      "Your site, help centre and product pages. Re-read them when they change.",
                    ],
                    [
                      <>
                        <Code>PDF</Code> · <Code>DOCX</Code>
                      </>,
                      "Policies, contracts, manuals and anything you already have as a document.",
                    ],
                    [
                      <Code key="csv">CSV</Code>,
                      "Price lists, product catalogues and opening hours — anything that is a table.",
                    ],
                    [
                      <Code key="txt">TXT</Code>,
                      "Short notes and answers you want the assistant to know word for word.",
                    ],
                  ]}
                />
                <p className="api-docs__callout">
                  When AI performance lists a question the assistant could not
                  answer, the fix is almost always a missing document here.
                </p>
              </Section>

              <Section
                eyebrow="Teach your assistant"
                id="customer-memory"
                title="Customer memory"
              >
                <p>
                  When someone comes back a second time, the assistant
                  remembers what it learned about them — their name, their
                  order, what they asked last time — so they don&apos;t have to
                  repeat themselves.{" "}
                  <DashLink href="/customer-memory">Customer memory</DashLink>{" "}
                  shows what it remembers about each person.
                </p>
              </Section>

              {/* ── Go live ─────────────────────────────────────────────── */}

              <Section eyebrow="Go live" id="website-chat" title="Website chat">
                <p>
                  A chat button on your website that answers visitors with your
                  knowledge base, day and night. Add the code once — changes
                  you make in Widget customization appear on your site
                  automatically.
                </p>
                <p>
                  Copy the snippet from{" "}
                  <DashLink href="/integrations">
                    Integrations → Website chat
                  </DashLink>
                  , where your organization ID is already filled in, and paste
                  it before the closing <Code>&lt;/body&gt;</Code> tag. There
                  are ready-made versions for plain HTML, React, Next.js and
                  vanilla JavaScript.
                </p>
                <CodePanel code={EMBED_SNIPPET} title="HTML" />
                <p>
                  Send the snippet to whoever manages your website if you would
                  rather not touch the code yourself.
                </p>
              </Section>

              <Section
                eyebrow="Go live"
                id="widget-customization"
                title="Widget customization"
              >
                <p>
                  Behaviour, copy, brand, launcher and voice for the widget
                  your customers see. Everything is edited as a draft and
                  published as a version you can roll back.
                </p>
                <ul>
                  <li>
                    <strong>Brand:</strong>{" "}
                    the assistant&apos;s name, logo,
                    colours, radius and typeface. Every visitor-facing colour
                    pair is checked live for contrast.
                  </li>
                  <li>
                    <strong>Copy:</strong> the greeting, the headline on the
                    home screen and the placeholder in the message box.
                  </li>
                  <li>
                    <strong>Launcher:</strong> the button that sits on your
                    page when the chat is closed, plus an optional invitation
                    that appears above it.
                  </li>
                  <li>
                    <strong>Help content:</strong> the topics and articles
                    shown on the widget home screen.
                  </li>
                  <li>
                    <strong>Voice:</strong> let visitors talk to the assistant
                    out loud instead of typing.
                  </li>
                </ul>
              </Section>

              <Section
                eyebrow="Go live"
                id="channels"
                title="Telegram, Instagram, WhatsApp"
              >
                <p>
                  The same assistant answers in your messengers, and every
                  conversation lands in the same inbox as your website chats.
                  Connect each one in{" "}
                  <DashLink href="/integrations">Integrations</DashLink>.
                </p>
                <Table
                  head={["Channel", "What you need"]}
                  rows={[
                    [
                      "Telegram",
                      "A bot token from @BotFather. Customers who message your bot are answered by your assistant.",
                    ],
                    [
                      "Instagram",
                      "An Instagram professional account. Sign in once and direct messages are answered and collected in your inbox.",
                    ],
                    [
                      "WhatsApp",
                      "A WhatsApp Business number — its phone number ID and access token from Meta.",
                    ],
                  ]}
                />
              </Section>

              {/* ── Every day ───────────────────────────────────────────── */}

              <Section
                eyebrow="Every day"
                id="conversations"
                title="Conversations"
              >
                <p>
                  Every chat with a customer, from every channel. Read them,
                  reply yourself, and mark them done. Each conversation is in
                  one of three states:
                </p>
                <Table
                  head={["Status", "Meaning"]}
                  rows={[
                    [
                      "Unresolved",
                      "Open. The assistant is answering, and your team can read along.",
                    ],
                    [
                      "Escalated",
                      "Your team has it — the customer asked for a person, the assistant could not answer from your content, or someone on your team replied. The assistant stops replying.",
                    ],
                    ["Resolved", "Done and closed. No more messages go into it."],
                  ]}
                />
                <p>
                  You can step in as a human at any point. Your first reply
                  escalates the conversation, so from then on the customer
                  hears only from your team.
                </p>
              </Section>

              <Section eyebrow="Every day" id="leads" title="Leads">
                <p>
                  People who left a name, email or phone number during a
                  conversation. <DashLink href="/leads">Leads</DashLink> is your
                  follow-up list.
                </p>
              </Section>

              <Section eyebrow="Every day" id="voice" title="AI voicechats">
                <p>
                  If you turn on voice in Widget customization (it needs{" "}
                  <a className="api-docs__link" href="#ai-keys">
                    your own AI key
                  </a>
                  ), visitors can speak to the assistant instead of typing.{" "}
                  <DashLink href="/ai-conversations">AI voicechats</DashLink>{" "}
                  keeps the transcript of every spoken conversation.
                </p>
              </Section>

              <Section
                eyebrow="Every day"
                id="analytics"
                title="AI performance"
              >
                <p>
                  How often the assistant finished the job on its own, how fast
                  it replied, and the questions it could not answer.{" "}
                  <DashLink href="/analytics">Check it weekly</DashLink> — the
                  unanswered questions tell you exactly what to add to the
                  knowledge base next.
                </p>
              </Section>

              {/* ── Automate ────────────────────────────────────────────── */}

              <Section eyebrow="Automate" id="workflows" title="Workflows">
                <p>
                  For questions you want answered the exact same way every time
                  — a refund request, a booking — draw the steps on a canvas
                  instead of trusting the assistant to improvise.
                </p>
                <Table
                  head={["Group", "Steps"]}
                  rows={[
                    [
                      "Scripted",
                      "Message, Cards, Carousel, Buttons, Listen — say something, show something, wait for a reply.",
                    ],
                    [
                      "Tools",
                      "API, Function, Integration, MCP — reach the systems you already run.",
                    ],
                    [
                      "Logic",
                      "Set, Condition, Operator, Code, Workflow, End — route the conversation and hand parts of it to AI.",
                    ],
                  ]}
                />
                <p>
                  Test every run in the builder before you publish. Once
                  published, workflow conversations appear in the inbox with
                  their own tag, so you can filter them apart from assistant
                  conversations.
                </p>
              </Section>

              <Section
                eyebrow="Automate"
                id="assistant-tools"
                title="Assistant tools"
              >
                <p>
                  Things the assistant can do beyond talking — look something
                  up, write a row into a spreadsheet, book a call. Set them up
                  in <DashLink href="/assistant-tools">Assistant tools</DashLink>
                  , then choose which ones each widget may use. For example:
                </p>
                <ul>
                  <li>
                    <strong>Google Sheets:</strong> find, add and update rows.
                    The assistant collects exactly the columns you pick.
                  </li>
                  <li>
                    <strong>Google Calendar:</strong> check free time and book
                    meetings. Connect once — every calendar tool uses the same
                    account.
                  </li>
                  <li>
                    <strong>Your own API:</strong> call any HTTP endpoint with
                    the parameters the assistant works out from the
                    conversation, and test it in the console before it goes
                    live.
                  </li>
                </ul>
              </Section>

              <Section
                eyebrow="Automate"
                id="event-webhooks"
                title="Event webhooks"
              >
                <p>
                  Send a notice to Discord, Telegram, WhatsApp or your own
                  system whenever something happens — a new chat, a message, a
                  conversation handed to your team. Add destinations in{" "}
                  <DashLink href="/integrations">
                    Integrations → Event webhooks
                  </DashLink>
                  .
                </p>
                <p>
                  Developers who want signed payloads and delivery retries
                  should use{" "}
                  <Link className="api-docs__link" href="/docs/api#webhooks">
                    API webhooks
                  </Link>{" "}
                  instead.
                </p>
              </Section>

              {/* ── Account ─────────────────────────────────────────────── */}

              <Section eyebrow="Account" id="ai-keys" title="Your AI keys">
                <p>
                  Osonflow&apos;s own AI keys work out of the box. Add your
                  company&apos;s keys in{" "}
                  <DashLink href="/integrations">
                    Integrations → Your AI keys
                  </DashLink>{" "}
                  only if you want AI usage billed to your own OpenAI or Google
                  account. Voice is the exception: it needs your own OpenAI or
                  Gemini key before you can choose a voice model.
                </p>
              </Section>

              <Section eyebrow="Account" id="billing" title="Plans & Billing">
                <p>
                  Every plan includes the whole product — chat widget, shared
                  inbox, routing and human handover. Start on Starter for free,
                  move to Growth when the assistant is carrying real work, and
                  talk to sales about Enterprise.{" "}
                  <DashLink href="/billing">Plans & Billing</DashLink> shows
                  your plan, usage and invoices; prices are on the{" "}
                  <Link className="api-docs__link" href="/#pricing">
                    pricing page
                  </Link>
                  .
                </p>
              </Section>

              <Section eyebrow="Account" id="data-transfer" title="Data transfer">
                <p>
                  Move a whole setup between organizations — for example from
                  a test organization to the real one.{" "}
                  <DashLink href="/org-transfer">Data transfer</DashLink>{" "}
                  exports your knowledge sources and widget as one Osonflow
                  setup file, which you download or copy and then import into
                  the other organization. Sources that already exist there are
                  skipped, unless you choose to replace them.
                </p>
              </Section>
            </div>
          </div>
        </section>
      </div>
    </JapandiPageShell>
  )
}
