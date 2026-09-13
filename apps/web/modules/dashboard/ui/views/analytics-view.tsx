"use client"

import { useState } from "react"
import Link from "next/link"
import { useConvex, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowUpRightIcon,
  DownloadIcon,
  MessageSquareIcon,
  MicIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import { useLanguage } from "@/lib/i18n/language-provider"
import { GettingStartedCallout } from "@/modules/onboarding/ui/components/getting-started-callout"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  formatCsvTimestamp,
  stringifyCsvRows,
  type CsvValue,
} from "../lib/conversation-export"
import { ConsolePage } from "../components/console"
import { AnalyticsSkeleton } from "../components/report-skeleton"
import { ReportQuiet, ReportSection } from "../components/report"
import "../styles/report.css"

const ANALYTICS_EXPORT_LIMIT = 5000

type ConversationInsight = Doc<"conversationInsights">

const formatDuration = (ms: number | null) => {
  if (ms === null) {
    return "—"
  }

  const minutes = Math.max(1, Math.round(ms / 60_000))

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

const formatIntent = (intent: string) =>
  intent
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const insightToCsvRow = (insight: ConversationInsight) => [
  insight._id,
  insight.channel,
  insight.status,
  formatIntent(insight.intent),
  insight.sentiment,
  insight.urgency,
  insight.language,
  insight.summary,
  insight.isUnanswered,
  insight.unansweredQuestion,
  insight.wasResolved,
  insight.wasEscalated,
  insight.resolutionSource,
  insight.firstHumanResponseMs,
  insight.humanSavedMinutes,
  insight.conversationId,
  insight.aiVoiceConversationId,
  insight.contactSessionId,
  formatCsvTimestamp(insight.lastAnalyzedAt),
  formatCsvTimestamp(insight.updatedAt),
]

type Overview = FunctionReturnType<typeof api.private.analytics.getOverview>

type Outcome = "resolved" | "handed" | "open"

const OUTCOME_LABEL: Record<Outcome, string> = {
  resolved: "Resolved by the assistant",
  handed: "Handed to your team",
  open: "Still open",
}

const percentOf = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0

/**
 * Splits the window into three exclusive outcomes. The overview's flags can
 * overlap (a conversation can be escalated and later resolved), so resolution
 * wins, then hand-off, and whatever is left is still open.
 */
const getOutcomes = (overview: Overview) => {
  const total = overview.totalConversations
  const resolved = Math.min(overview.resolved, total)
  const handed = Math.min(overview.escalated, total - resolved)
  const open = Math.max(0, total - resolved - handed)

  return { total, counts: { resolved, handed, open } }
}

/* ── hero ───────────────────────────────────────────────────────────────── */

/**
 * A 10×10 waffle: each square is 1% of analysed conversations. Squares are
 * allocated by largest remainder so the three groups always sum to 100.
 */
const OutcomeWaffle = ({
  counts,
  total,
}: {
  counts: Record<Outcome, number>
  total: number
}) => {
  const [focus, setFocus] = useState<Outcome | null>(null)
  const order: Outcome[] = ["resolved", "handed", "open"]

  const raw = order.map((key) => (total ? (counts[key] / total) * 100 : 0))
  const cells = raw.map(Math.floor)
  let remaining = total ? 100 - cells.reduce((sum, value) => sum + value, 0) : 0
  raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest)
    .forEach(({ index }) => {
      if (remaining > 0) {
        cells[index] = (cells[index] ?? 0) + 1
        remaining -= 1
      }
    })

  const squares: (Outcome | null)[] = order.flatMap((key, index) =>
    Array.from({ length: cells[index] ?? 0 }, () => key)
  )
  while (squares.length < 100) squares.push(null)

  const summary = total
    ? order
        .map((key) => `${OUTCOME_LABEL[key]}: ${counts[key]}`)
        .join(", ")
    : "No conversations analysed yet"

  return (
    <figure className="flex w-full flex-col gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
      <div
        aria-label={summary}
        className="report-waffle shrink-0"
        data-focus={focus ?? undefined}
        role="img"
      >
        {squares.map((outcome, index) => (
          <span
            className="report-cell"
            data-outcome={outcome ?? undefined}
            key={index}
            style={{ "--i": index } as React.CSSProperties}
          />
        ))}
      </div>

      <figcaption className="min-w-0 flex-1">
        <ul
          className="report-legend flex flex-col gap-0.5"
          data-focus={focus ?? undefined}
        >
          {order.map((key) => (
            <li key={key}>
              <button
                className="report-legend-item flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline-none"
                data-active={focus === key ? "" : undefined}
                onBlur={() => setFocus(null)}
                onFocus={() => setFocus(key)}
                onMouseEnter={() => setFocus(key)}
                onMouseLeave={() => setFocus(null)}
                type="button"
              >
                <span className="report-swatch" data-outcome={key} />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {OUTCOME_LABEL[key]}
                </span>
                <span className="console-numeral text-sm">{counts[key]}</span>
                <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                  {percentOf(counts[key], total)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 px-2 text-[0.7rem] text-muted-foreground">
          Each square is 1% of {total} conversations
        </p>
      </figcaption>
    </figure>
  )
}

const Figure = ({
  label,
  value,
  note,
}: {
  label: string
  value: React.ReactNode
  note: string
}) => (
  <div className="report-figure flex flex-col gap-3 px-1 py-5 sm:px-5 md:first:pl-0">
    <p className="console-label">{label}</p>
    <p className="report-figure-value">{value}</p>
    <p className="text-xs leading-snug text-muted-foreground">{note}</p>
  </div>
)

/* ── sections ───────────────────────────────────────────────────────────── */

const IntentRanking = ({ overview }: { overview: Overview }) => {
  const max = Math.max(1, ...overview.topIntents.map((intent) => intent.count))

  if (!overview.topIntents.length) {
    return (
      <ReportQuiet>
        Intents are classified automatically once conversations start coming
        in.
      </ReportQuiet>
    )
  }

  return (
    <ol className="report-rows flex flex-col">
      {overview.topIntents.map((intent, index) => (
        <li
          className="report-row grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 py-3"
          key={intent.label}
        >
          <span className="truncate text-[0.95rem] text-foreground">
            {formatIntent(intent.label)}
          </span>
          <span className="flex items-baseline gap-2">
            <span className="console-numeral text-sm">{intent.count}</span>
            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
              {percentOf(intent.count, overview.totalConversations)}%
            </span>
          </span>
          <div className="report-bar-track col-span-2">
            <div
              className="report-bar"
              style={
                {
                  width: `${Math.max(2, (intent.count / max) * 100)}%`,
                  "--i": index,
                } as React.CSSProperties
              }
            />
          </div>
        </li>
      ))}
    </ol>
  )
}

const KnowledgeGaps = ({ overview }: { overview: Overview }) => {
  if (!overview.unansweredQuestions.length) {
    return (
      <ReportQuiet>
        Nothing went unanswered in this window — the knowledge base covered
        every question.
      </ReportQuiet>
    )
  }

  return (
    <div>
      <ol className="border-t border-[var(--report-rule)]">
        {overview.unansweredQuestions.map((question) => (
          <li
            className="report-gap grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5"
            key={question.question}
          >
            <div className="flex flex-col items-start gap-1.5">
              <span className="report-gap-count">{question.count}×</span>
              <span className="text-[0.7rem] text-muted-foreground">asked</span>
            </div>
            <div className="min-w-0">
              <p className="report-gap-quote">“{question.question}”</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatIntent(question.intent)}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Button asChild className="mt-6" variant="outline">
        <Link href="/files">
          Add these answers to your knowledge base
          <ArrowUpRightIcon data-icon="inline-end" />
        </Link>
      </Button>
    </div>
  )
}

const ChannelSplit = ({ overview }: { overview: Overview }) => (
  <div className="flex flex-col gap-8">
    {overview.channelMetrics.map((metric) => {
      const Icon = metric.channel === "voice" ? MicIcon : MessageSquareIcon
      const resolved = Math.min(metric.resolved, metric.total)
      const handed = Math.min(metric.escalated, metric.total - resolved)
      const open = Math.max(0, metric.total - resolved - handed)
      const segments = (
        [
          ["resolved", resolved],
          ["handed", handed],
          ["open", open],
        ] as const
      ).filter(([, count]) => count > 0)

      return (
        <div key={metric.channel}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="flex items-center gap-2 text-[0.95rem] font-medium text-foreground">
              <Icon aria-hidden className="size-4 text-muted-foreground" />
              {metric.channel === "voice" ? "Voice calls" : "Website chat"}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="console-numeral text-foreground">
                {metric.resolutionRate}%
              </span>{" "}
              resolved · {metric.total} total
            </p>
          </div>

          {metric.total ? (
            <>
              <div
                aria-label={segments
                  .map(([key, count]) => `${OUTCOME_LABEL[key]}: ${count}`)
                  .join(", ")}
                className="report-stack mt-3"
                role="img"
              >
                {segments.map(([key, count]) => (
                  <span
                    key={key}
                    style={{
                      width: `${(count / metric.total) * 100}%`,
                      background:
                        key === "open"
                          ? "color-mix(in srgb, var(--outcome-open) 22%, transparent)"
                          : `var(--outcome-${key})`,
                      boxShadow:
                        key === "open"
                          ? "inset 0 0 0 2px var(--outcome-open)"
                          : undefined,
                    }}
                    title={`${OUTCOME_LABEL[key]}: ${count}`}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
                {segments.map(([key, count]) => (
                  <span
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    key={key}
                  >
                    <span className="report-swatch" data-outcome={key} />
                    {OUTCOME_LABEL[key]}
                    <span className="console-numeral text-foreground">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No {metric.channel === "voice" ? "voice calls" : "chats"} in this
              window.
            </p>
          )}
        </div>
      )
    })}
  </div>
)

/** Sentiment is diverging (two poles, neutral midpoint), so it gets its own
 *  blue/orange pair rather than borrowing the outcome status colours. */
const MoodStrip = ({ overview }: { overview: Overview }) => {
  const order = ["positive", "neutral", "negative"] as const
  const counts = Object.fromEntries(
    overview.sentimentMix.map((item) => [item.label, item.count])
  ) as Partial<Record<(typeof order)[number], number>>
  const total = order.reduce((sum, key) => sum + (counts[key] ?? 0), 0)

  if (!total) {
    return null
  }

  const label = { positive: "Happy", neutral: "Neutral", negative: "Frustrated" }

  return (
    <div className="mt-10">
      <p className="console-label">How customers felt</p>
      <div
        aria-label={order
          .map((key) => `${label[key]}: ${counts[key] ?? 0}`)
          .join(", ")}
        className="report-stack mt-3"
        role="img"
      >
        {order
          .filter((key) => counts[key])
          .map((key) => (
            <span
              key={key}
              style={{
                width: `${((counts[key] ?? 0) / total) * 100}%`,
                background: `var(--mood-${key})`,
              }}
              title={`${label[key]}: ${counts[key]}`}
            />
          ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
        {order.map((key) => (
          <span
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
            key={key}
          >
            <span
              className="report-swatch"
              style={{ background: `var(--mood-${key})` }}
            />
            {label[key]}
            <span className="console-numeral text-foreground">
              {percentOf(counts[key] ?? 0, total)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

const STATUS_NODE: Record<
  ConversationInsight["status"],
  { label: string; color: string; filled: boolean }
> = {
  resolved: {
    label: "Resolved",
    color: "var(--outcome-resolved)",
    filled: true,
  },
  escalated: {
    label: "Handed to team",
    color: "var(--outcome-handed)",
    filled: true,
  },
  unresolved: {
    label: "Still open",
    color: "var(--outcome-open)",
    filled: false,
  },
}

const SignalTimeline = ({ overview }: { overview: Overview }) => {
  if (!overview.recentInsights.length) {
    return (
      <ReportQuiet>
        Summaries appear here after new chat or voice conversations are
        analysed.
      </ReportQuiet>
    )
  }

  return (
    <ol className="report-timeline flex flex-col gap-7">
      {overview.recentInsights.map((insight) => {
        const node = STATUS_NODE[insight.status]

        return (
          <li
            className="grid grid-cols-[0.625rem_minmax(0,1fr)] gap-4"
            key={insight._id}
          >
            <span
              className="report-node mt-1.5"
              data-filled={node.filled ? "" : undefined}
              style={{ color: node.color }}
            />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {node.label}
                </span>
                <span aria-hidden>·</span>
                <span>{formatIntent(insight.intent)}</span>
                <span aria-hidden>·</span>
                <span className="capitalize">{insight.channel}</span>
                <span aria-hidden>·</span>
                <time dateTime={new Date(insight.updatedAt).toISOString()}>
                  {formatDistanceToNow(insight.updatedAt, { addSuffix: true })}
                </time>
              </p>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground">
                {insight.summary}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ── page ───────────────────────────────────────────────────────────────── */

export const AnalyticsView = () => {
  const { t } = useLanguage()
  const [isExporting, setIsExporting] = useState(false)
  const convex = useConvex()
  const overview = useQuery(api.private.analytics.getOverview, {
    windowDays: 30,
  })

  if (overview === undefined) {
    return <AnalyticsSkeleton />
  }

  const { total, counts } = getOutcomes(overview)
  const humanSavedHours = Math.floor(overview.humanSavedMinutes / 60)
  const humanSavedRemainder = overview.humanSavedMinutes % 60
  const savedTimeLabel = humanSavedHours
    ? `${humanSavedHours}h ${humanSavedRemainder}m`
    : `${overview.humanSavedMinutes}m`
  const answerRate = total ? 100 - overview.unansweredRate : 0

  const handleDownloadCsv = async () => {
    setIsExporting(true)

    try {
      const exportInsights = await convex.query(
        api.private.analytics.getInsightsForExport,
        {
          windowDays: overview.windowDays,
          limit: ANALYTICS_EXPORT_LIMIT,
        }
      )

      const rows: CsvValue[][] = [
        ["AI performance analytics"],
        ["Window Days", overview.windowDays],
        ["Exported At", new Date().toISOString()],
        [],
        ["Summary"],
        ["Metric", "Value"],
        ["Total Analyzed Conversations", overview.totalConversations],
        ["Resolved", overview.resolved],
        ["Escalated", overview.escalated],
        ["Unanswered", overview.unanswered],
        ["AI Resolution Rate", `${overview.resolutionRate}%`],
        ["Escalation Rate", `${overview.escalationRate}%`],
        ["Unanswered Rate", `${overview.unansweredRate}%`],
        [
          "Average Human Response",
          formatDuration(overview.averageHumanResponseMs),
        ],
        ["Average Human Response Ms", overview.averageHumanResponseMs],
        ["Human Time Saved Minutes", overview.humanSavedMinutes],
        [],
        ["Top Intents"],
        ["Intent", "Count"],
        ...overview.topIntents.map((intent) => [
          formatIntent(intent.label),
          intent.count,
        ]),
        [],
        ["Most Common Unanswered Questions"],
        ["Question", "Intent", "Count"],
        ...overview.unansweredQuestions.map((question) => [
          question.question,
          formatIntent(question.intent),
          question.count,
        ]),
        [],
        ["Voice vs Chat Resolution"],
        ["Channel", "Total", "Resolved", "Escalated", "Resolution Rate"],
        ...overview.channelMetrics.map((metric) => [
          metric.channel,
          metric.total,
          metric.resolved,
          metric.escalated,
          `${metric.resolutionRate}%`,
        ]),
        [],
        ["Recent Intelligence Export"],
        [
          "Insight ID",
          "Channel",
          "Status",
          "Intent",
          "Sentiment",
          "Urgency",
          "Language",
          "Summary",
          "Is Unanswered",
          "Unanswered Question",
          "Was Resolved",
          "Was Escalated",
          "Resolution Source",
          "First Human Response Ms",
          "Human Saved Minutes",
          "Conversation ID",
          "AI Voice Conversation ID",
          "Contact Session ID",
          "Last Analyzed At",
          "Updated At",
        ],
        ...exportInsights.map(insightToCsvRow),
      ]

      const blob = new Blob(["﻿", stringifyCsvRows(rows)], {
        type: "text/csv;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      toast.success(`Exported analytics with ${exportInsights.length} insights`)
    } catch {
      toast.error("Failed to export analytics")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <ConsolePage width="wide">
      <GettingStartedCallout />

      <div className="report">
        {/* Hero: the one sentence an owner needs, and the picture of it. */}
        <section className="grid gap-10 pt-2 pb-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="console-eyebrow">
                {t("Last")} {overview.windowDays} {t("days")} · {total}{" "}
                conversations analysed
              </p>
              <Button
                disabled={isExporting}
                onClick={handleDownloadCsv}
                size="sm"
                variant="ghost"
              >
                <DownloadIcon data-icon="inline-start" />
                {isExporting ? t("Exporting...") : t("Download CSV")}
              </Button>
            </div>

            {total ? (
              <>
                <h1 className="report-headline mt-6 max-w-[22ch]">
                  Your assistant resolved{" "}
                  <span className="report-headline-figure">
                    {percentOf(counts.resolved, total)}%
                  </span>{" "}
                  of conversations on its own.
                </h1>
                <p className="report-lede mt-6 max-w-[60ch]">
                  <strong>{counts.handed}</strong> were handed to your team,{" "}
                  <strong>{overview.unanswered}</strong>{" "}
                  {overview.unanswered === 1
                    ? "question went"
                    : "questions went"}{" "}
                  unanswered, and it saved about{" "}
                  <strong>{savedTimeLabel}</strong> of support time.
                </p>
              </>
            ) : (
              <>
                <h1 className="report-headline mt-6 max-w-[20ch]">
                  Your report starts with the first conversation.
                </h1>
                <p className="report-lede mt-6 max-w-[60ch]">
                  Once customers talk to your assistant, this page shows how
                  much it handled on its own, where your team stepped in, and
                  what it still needs to learn.
                </p>
              </>
            )}
          </div>

          <OutcomeWaffle counts={counts} total={total} />
        </section>

        <div className="report-figures grid grid-cols-2 md:grid-cols-4">
          <Figure
            label="Answered fully"
            note="Customers who got a complete answer"
            value={`${answerRate}%`}
          />
          <Figure
            label="Handed to a person"
            note="Share of conversations your team took over"
            value={`${overview.escalationRate}%`}
          />
          <Figure
            label="First human reply"
            note="From the customer's first message to your team's reply"
            value={formatDuration(overview.averageHumanResponseMs)}
          />
          <Figure
            label="Time saved"
            note="Support minutes the assistant handled for you"
            value={savedTimeLabel}
          />
        </div>

        <ReportSection
          index={1}
          lede="The jobs customers came to get done, across chat and voice."
          title="What customers asked for"
        >
          <IntentRanking overview={overview} />
          <MoodStrip overview={overview} />
        </ReportSection>

        <ReportSection
          index={2}
          lede="Questions the assistant couldn't answer. Each one you add to the knowledge base stops the next customer from waiting."
          title="What it still needs to learn"
        >
          <KnowledgeGaps overview={overview} />
        </ReportSection>

        <ReportSection
          index={3}
          lede="How each channel ended — solved by the assistant, taken over by your team, or still open."
          title="Chat and voice"
        >
          <ChannelSplit overview={overview} />
        </ReportSection>

        <ReportSection
          index={4}
          lede="The latest conversations, summarised as they were analysed."
          title="Recent conversations"
        >
          <SignalTimeline overview={overview} />
        </ReportSection>
      </div>
    </ConsolePage>
  )
}
