"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useConvex, usePaginatedQuery, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowUpRightIcon,
  AtSignIcon,
  DownloadIcon,
  MailIcon,
  MessageCircleIcon,
  SendIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import { cn } from "@workspace/ui/lib/utils"
import {
  formatCsvTimestamp,
  stringifyCsvRows,
} from "../lib/conversation-export"
import {
  ConsolePage,
  ConsoleSearch,
} from "../components/console"
import { LeadsSkeleton, SkeletonRows } from "../components/report-skeleton"
import {
  ReportFilter,
  ReportQuiet,
  ReportSection,
} from "../components/report"
import "../styles/report.css"
import "../styles/leads.css"

const LEADS_EXPORT_LIMIT = 5000
const DAY_MS = 24 * 60 * 60 * 1000

type Summary = FunctionReturnType<typeof api.private.leads.getSummary>
type LeadRecord = FunctionReturnType<
  typeof api.private.leads.getForExport
>[number]
type LeadSegment = "all" | "waiting" | "newcomers" | "no_chats"

const SEGMENTS: { id: LeadSegment; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "waiting", label: "Waiting for your reply" },
  { id: "newcomers", label: "New this week" },
  { id: "no_chats", label: "Never chatted" },
]

/** Channel identity, in a fixed order so a channel never changes colour. */
const CHANNELS = [
  { key: "web", channel: "Web", label: "Website chat", series: 1 },
  { key: "voice", channel: "Voice", label: "Voice", series: 2 },
  { key: "telegram", channel: "Telegram", label: "Telegram", series: 3 },
  { key: "whatsapp", channel: "WhatsApp", label: "WhatsApp", series: 4 },
  { key: "instagram", channel: "Instagram", label: "Instagram", series: 5 },
  { key: "widget", channel: "Widget", label: "Workflow chat", series: 6 },
] as const

const channelLabel = (channel: string) =>
  CHANNELS.find((item) => item.channel === channel)?.label ?? channel

/** Messaging channels store a placeholder address; it is not a real inbox. */
const isRealEmail = (email: string) =>
  Boolean(email) && !/\.local$/i.test(email.trim())

const displayName = (lead: LeadRecord) =>
  lead.name?.trim() ||
  lead.socialHandle ||
  (isRealEmail(lead.email) ? lead.email.split("@")[0] : "") ||
  "Unnamed visitor"

const initialsOf = (name: string) => {
  const parts = name.replace(/^@/, "").split(/[\s@._-]+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }

  return name.replace(/^@/, "").slice(0, 2).toUpperCase() || "?"
}

const hostOf = (url?: string) => {
  if (!url) return undefined
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

const pathOf = (url?: string) => {
  if (!url) return undefined
  try {
    const path = decodeURIComponent(new URL(url).pathname).replace(/\/+$/, "")
    return path || "/"
  } catch {
    return undefined
  }
}

/** Search engines and social sites by name; anything else by its address. */
const sourceName = (host: string) => {
  const known: [RegExp, string][] = [
    [/(^|\.)google\./, "Google"],
    [/(^|\.)yandex\./, "Yandex"],
    [/(^|\.)bing\.com$/, "Bing"],
    [/(^|\.)(instagram\.com|l\.instagram\.com)$/, "Instagram"],
    [/(^|\.)(facebook\.com|fb\.com|l\.facebook\.com)$/, "Facebook"],
    [/(^|\.)(t\.me|telegram\.org)$/, "Telegram"],
    [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
    [/(^|\.)(tiktok\.com)$/, "TikTok"],
    [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
    [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "X"],
  ]
  return known.find(([pattern]) => pattern.test(host))?.[1] ?? host
}

const pageName = (path: string) => (path === "/" ? "Home page" : path)

const formatDay = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    timestamp
  )

const plural = (count: number, one: string, many: string) =>
  count === 1 ? one : many

const buildLeadsCsv = (leads: LeadRecord[]) => {
  const rows = [
    [
      "Name",
      "Email",
      "Channel",
      "Phone",
      "Social Handle",
      "Referrer",
      "Page URL",
      "Timezone",
      "Language",
      "First Seen At",
      "Last Active At",
      "Conversation Count",
      "Latest Conversation Status",
      "Waiting For Reply",
      "Latest Conversation ID",
      "Is Newcomer",
    ],
    ...leads.map((lead) => [
      lead.name,
      isRealEmail(lead.email) ? lead.email : "",
      channelLabel(lead.channel),
      lead.phone ?? "",
      lead.socialHandle ?? "",
      lead.referrer ?? "",
      lead.currentUrl ?? "",
      lead.timezone ?? "",
      lead.language ?? "",
      formatCsvTimestamp(lead.firstSeenAt),
      formatCsvTimestamp(lead.lastActiveAt),
      lead.conversationCount,
      lead.latestConversationStatus ?? "",
      lead.isAwaitingReply ? "yes" : "no",
      lead.latestConversationId ?? "",
      lead.isNewcomer ? "yes" : "no",
    ]),
  ]

  return stringifyCsvRows(rows)
}

/* ── arrivals ───────────────────────────────────────────────────────────── */

/**
 * Thirty daily columns, bucketed in the viewer's own timezone. Hover or use
 * the arrow keys to read a day; otherwise the readout summarises the month.
 */
const ArrivalsChart = ({ arrivals }: { arrivals: number[] }) => {
  const [active, setActive] = useState<number | null>(null)

  const days = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = today.getTime() - 29 * DAY_MS

    const buckets = Array.from({ length: 30 }, (_, index) => ({
      // DST-safe: step by calendar day, not by a fixed 24h.
      date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 29 + index
      ).getTime(),
      count: 0,
    }))

    for (const at of arrivals) {
      if (at < start) continue
      const day = new Date(at)
      day.setHours(0, 0, 0, 0)
      const index = buckets.findIndex((bucket) => bucket.date === day.getTime())
      if (index >= 0) buckets[index]!.count += 1
    }

    return buckets
  }, [arrivals])

  const total = days.reduce((sum, day) => sum + day.count, 0)
  const max = Math.max(1, ...days.map((day) => day.count))
  const peak = days.reduce((best, day) => (day.count > best.count ? day : best))
  const activeDay = active === null ? null : days[active]

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      const step = event.key === "ArrowLeft" ? -1 : 1
      setActive((current) =>
        Math.min(29, Math.max(0, (current ?? 29) + (current === null ? 0 : step)))
      )
    }
    if (event.key === "Escape") setActive(null)
  }

  return (
    <figure className="w-full">
      <figcaption aria-live="polite" className="mb-4 min-h-[2.75rem]">
        {activeDay ? (
          <>
            <p className="report-figure-value">
              {activeDay.count}{" "}
              <span className="text-base font-normal tracking-normal text-muted-foreground">
                {plural(activeDay.count, "person", "people")}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDay(activeDay.date)}
            </p>
          </>
        ) : (
          <>
            <p className="report-figure-value">
              {total}{" "}
              <span className="text-base font-normal tracking-normal text-muted-foreground">
                in the last 30 days
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {peak.count
                ? `Busiest day ${formatDay(peak.date)} with ${peak.count}`
                : "No one new yet this month"}
            </p>
          </>
        )}
      </figcaption>

      <div
        aria-label={`New leads per day over the last 30 days, ${total} in total. Use the arrow keys to read each day.`}
        className="leads-chart"
        data-active={active === null ? undefined : ""}
        onBlur={() => setActive(null)}
        onFocus={() => setActive(29)}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setActive(null)}
        role="group"
        tabIndex={0}
      >
        <div className="leads-bars">
          {days.map((day, index) => (
            <div
              className="leads-bar-slot"
              data-active={active === index ? "" : undefined}
              key={day.date}
              onMouseEnter={() => setActive(index)}
            >
              <div
                className="leads-bar"
                data-empty={day.count ? undefined : ""}
                data-today={index === 29 ? "" : undefined}
                style={
                  {
                    height: day.count ? `${(day.count / max) * 100}%` : undefined,
                    "--i": index,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[0.7rem] text-muted-foreground">
        <span>{formatDay(days[0]!.date)}</span>
        <span>Today</span>
      </div>
    </figure>
  )
}

/* ── list ───────────────────────────────────────────────────────────────── */

const leadStatus = (lead: LeadRecord) => {
  if (lead.isAwaitingReply) {
    return { key: "waiting", label: "Waiting for your reply" } as const
  }
  switch (lead.latestConversationStatus) {
    case "escalated":
      return { key: "team", label: "With your team" } as const
    case "resolved":
      return { key: "resolved", label: "Resolved" } as const
    case "unresolved":
      return { key: "assistant", label: "Talking to your assistant" } as const
    default:
      return null
  }
}

const ContactLinks = ({ lead }: { lead: LeadRecord }) => {
  const name = displayName(lead)
  const handle = lead.socialHandle?.replace(/^@/, "")
  const links = [
    isRealEmail(lead.email)
      ? { href: `mailto:${lead.email}`, label: `Email ${name}`, icon: MailIcon }
      : null,
    lead.phone
      ? {
          href: `https://wa.me/${lead.phone.replace(/\D/g, "")}`,
          label: `Message ${name} on WhatsApp`,
          icon: MessageCircleIcon,
        }
      : null,
    handle && lead.channel === "Telegram"
      ? {
          href: `https://t.me/${handle}`,
          label: `Message ${name} on Telegram`,
          icon: SendIcon,
        }
      : null,
    handle && lead.channel === "Instagram"
      ? {
          href: `https://instagram.com/${handle}`,
          label: `Open ${name} on Instagram`,
          icon: AtSignIcon,
        }
      : null,
  ].filter((link) => link !== null)

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          aria-label={label}
          className="leads-contact"
          href={href}
          key={href}
          rel="noreferrer"
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          title={label}
        >
          <Icon aria-hidden className="size-4" />
        </a>
      ))}
    </>
  )
}

const LeadRow = ({ lead }: { lead: LeadRecord }) => {
  const name = displayName(lead)
  const status = leadStatus(lead)
  const page = pathOf(lead.currentUrl)
  const referrer = hostOf(lead.referrer)
  const source =
    referrer && referrer !== hostOf(lead.currentUrl)
      ? sourceName(referrer)
      : undefined
  const reachCandidate = isRealEmail(lead.email)
    ? lead.email
    : (lead.phone ?? lead.socialHandle)
  // A handle already used as the name would only repeat itself underneath.
  const reachLine = reachCandidate === name ? undefined : reachCandidate

  return (
    <li className="leads-row grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-2 py-4 lg:grid-cols-[2.5rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)_11rem]">
      <span className="leads-avatar size-10 text-xs">{initialsOf(name)}</span>

      {/* who */}
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[0.95rem] font-medium text-foreground">
            {name}
          </span>
          {lead.isNewcomer ? <span className="leads-new shrink-0">New</span> : null}
        </p>
        {reachLine ? (
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            {!isRealEmail(lead.email) && lead.socialHandle ? (
              <AtSignIcon aria-hidden className="size-3 shrink-0" />
            ) : null}
            <span className="truncate">{reachLine.replace(/^@/, "")}</span>
          </p>
        ) : null}
      </div>

      {/* how they found you — its own column on wide screens */}
      <p className="col-span-2 col-start-2 min-w-0 text-xs leading-relaxed text-muted-foreground lg:col-span-1 lg:col-start-auto">
        <span className="text-foreground">{channelLabel(lead.channel)}</span>
        {page ? (
          <>
            {" "}
            on <span className="break-all text-foreground">{pageName(page)}</span>
          </>
        ) : null}
        {source ? (
          <>
            {" "}
            · from <span className="text-foreground">{source}</span>
          </>
        ) : null}
      </p>

      {/* where it stands */}
      <div className="col-span-2 col-start-2 row-start-3 min-w-0 text-xs lg:col-span-1 lg:col-start-auto lg:row-start-auto">
        {status ? (
          <p className="flex items-center gap-2">
            <span className="leads-status-dot" data-status={status.key} />
            <span
              className={cn(
                status.key === "waiting"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {status.label}
            </span>
          </p>
        ) : (
          <p className="text-muted-foreground">No conversation yet</p>
        )}
        <p className="mt-1 text-muted-foreground">
          {lead.conversationCount > 0
            ? `Active ${formatDistanceToNow(lead.lastActiveAt, { addSuffix: true })}`
            : `Left details ${formatDistanceToNow(lead.firstSeenAt, { addSuffix: true })}`}
        </p>
      </div>

      {/* reach out */}
      <div className="col-start-3 row-start-1 flex items-center justify-end gap-0.5 lg:col-start-5">
        <ContactLinks lead={lead} />
        {lead.latestConversationId ? (
          <Button asChild className="ml-1" size="sm" variant="outline">
            <Link href={`/conversations/${lead.latestConversationId}`}>
              <span className="hidden sm:inline">Open chat</span>
              <span className="sr-only sm:hidden">Open conversation</span>
              <ArrowUpRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        ) : null}
      </div>
    </li>
  )
}

/* ── origins ────────────────────────────────────────────────────────────── */

const RankedOrigins = ({
  title,
  items,
  empty,
}: {
  title: string
  items: { label: string; count: number }[]
  empty: string
}) => {
  const max = Math.max(1, ...items.map((item) => item.count))

  return (
    <div className="min-w-0">
      <p className="console-label">{title}</p>
      {items.length ? (
        <ol className="report-rows mt-3 flex flex-col">
          {items.map((item, index) => (
            <li
              className="report-row grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5 py-2.5"
              key={item.label}
            >
              <span className="truncate text-sm text-foreground" title={item.label}>
                {item.label}
              </span>
              <span className="console-numeral text-sm">{item.count}</span>
              <div className="report-bar-track col-span-2">
                <div
                  className="report-bar"
                  style={
                    {
                      width: `${Math.max(3, (item.count / max) * 100)}%`,
                      "--i": index,
                    } as React.CSSProperties
                  }
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  )
}

const Origins = ({ summary }: { summary: Summary }) => {
  const channels = CHANNELS.map((item) => ({
    ...item,
    count: summary.channelCounts[item.key],
  })).filter((item) => item.count > 0)

  // Several addresses can be one source (google.com, google.co.uz).
  const referrers = useMemo(() => {
    const merged = new Map<string, number>()
    for (const { label, count } of summary.topReferrers) {
      const name = sourceName(label)
      merged.set(name, (merged.get(name) ?? 0) + count)
    }
    return Array.from(merged.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
  }, [summary.topReferrers])

  const pages = summary.topPages.map((item) => ({
    label: pageName(item.label),
    count: item.count,
  }))

  return (
    <div className="flex flex-col gap-10">
      {channels.length ? (
        <div>
          <p className="console-label">Channel</p>
          <div
            aria-label={channels
              .map((item) => `${item.label}: ${item.count}`)
              .join(", ")}
            className="report-stack mt-3"
            role="img"
          >
            {channels.map((item) => (
              <span
                className={`leads-series-${item.series}`}
                key={item.key}
                style={{
                  width: `${(item.count / summary.totalLeads) * 100}%`,
                  background: "var(--series)",
                }}
                title={`${item.label}: ${item.count}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {channels.map((item) => (
              <span
                className={`leads-series-${item.series} flex items-center gap-2 text-sm text-muted-foreground`}
                key={item.key}
              >
                <span className="leads-swatch" />
                {item.label}
                <span className="console-numeral text-foreground">
                  {item.count}
                </span>
                <span className="text-xs tabular-nums">
                  {Math.round((item.count / summary.totalLeads) * 100)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-10 md:grid-cols-2">
        <RankedOrigins
          empty="Everyone came to your site directly."
          items={referrers}
          title="Sent by"
        />
        <RankedOrigins
          empty="No page information captured yet."
          items={pages}
          title="Page they were on"
        />
      </div>
    </div>
  )
}

/* ── page ───────────────────────────────────────────────────────────────── */

export const LeadsView = () => {
  const convex = useConvex()
  const [searchQuery, setSearchQuery] = useState("")
  const [segment, setSegment] = useState<LeadSegment>("all")
  const [isExporting, setIsExporting] = useState(false)

  const normalizedSearchQuery = searchQuery.trim()

  const summary = useQuery(api.private.leads.getSummary, {})
  const leads = usePaginatedQuery(
    api.private.leads.getMany,
    {
      searchQuery: normalizedSearchQuery || undefined,
      segment,
    },
    { initialNumItems: 25 }
  )

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: leads.status,
    loadMore: leads.loadMore,
    loadSize: 25,
  })

  const handleDownloadCsv = async () => {
    setIsExporting(true)

    try {
      const exportLeads = await convex.query(api.private.leads.getForExport, {
        searchQuery: normalizedSearchQuery || undefined,
        segment,
        limit: LEADS_EXPORT_LIMIT,
      })

      if (!exportLeads.length) {
        toast.info("No leads to export")
        return
      }

      const csv = buildLeadsCsv(exportLeads)
      const blob = new Blob(["﻿", csv], {
        type: "text/csv;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      toast.success(`Exported ${exportLeads.length} leads`)
    } catch {
      toast.error("Failed to export leads")
    } finally {
      setIsExporting(false)
    }
  }

  if (summary === undefined) {
    return <LeadsSkeleton />
  }

  const segmentCounts: Record<LeadSegment, number> = {
    all: summary.totalLeads,
    waiting: summary.awaitingReplyCount,
    newcomers: summary.newcomerCount,
    no_chats: summary.noChatsCount,
  }
  const topChannel = CHANNELS.map((item) => ({
    ...item,
    count: summary.channelCounts[item.key],
  })).sort((a, b) => b.count - a.count)[0]

  return (
    <ConsolePage width="wide">
      <div className="report">
        {/* Hero: who arrived, and what needs doing. */}
        <section className="grid gap-10 pt-2 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="console-eyebrow">Leads</p>
              {summary.totalLeads ? (
                <Button
                  disabled={isExporting}
                  onClick={handleDownloadCsv}
                  size="sm"
                  variant="ghost"
                >
                  <DownloadIcon data-icon="inline-start" />
                  {isExporting ? "Exporting…" : "Export CSV"}
                </Button>
              ) : null}
            </div>

            {summary.totalLeads ? (
              <>
                <h1 className="report-headline mt-6 max-w-[20ch]">
                  <span className="report-headline-figure">
                    {summary.totalLeads}{" "}
                    {plural(summary.totalLeads, "person", "people")}
                  </span>{" "}
                  left their details with you.
                </h1>
                <p className="report-lede mt-5 max-w-[60ch]">
                  {summary.awaitingReplyCount ? (
                    <>
                      <strong>{summary.awaitingReplyCount}</strong>{" "}
                      {plural(
                        summary.awaitingReplyCount,
                        "is waiting for your reply",
                        "are waiting for your reply"
                      )}
                      ,{" "}
                    </>
                  ) : (
                    <>No one is waiting on a reply, </>
                  )}
                  <strong>{summary.newcomerCount}</strong> arrived this week
                  {summary.noChatsCount ? (
                    <>
                      , and <strong>{summary.noChatsCount}</strong> never
                      started a chat — worth a hello
                    </>
                  ) : null}
                  .
                  {topChannel && topChannel.count ? (
                    <>
                      {" "}
                      Most came through{" "}
                      <strong>{topChannel.label}</strong>.
                    </>
                  ) : null}
                </p>
              </>
            ) : (
              <>
                <h1 className="report-headline mt-6 max-w-[22ch]">
                  No one has left their details yet.
                </h1>
                <p className="report-lede mt-5 max-w-[60ch]">
                  When a visitor shares their name and email in your chat
                  widget, or messages you on Telegram, WhatsApp or Instagram,
                  they appear here — with where they came from and a one-click
                  way to reach them.
                </p>
                <Button asChild className="mt-7" variant="outline">
                  <Link href="/customization">
                    Set up your widget
                    <ArrowUpRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {summary.totalLeads ? (
            <ArrivalsChart arrivals={summary.recentArrivals} />
          ) : null}
        </section>

        {summary.totalLeads ? (
          <>
            <div className="flex flex-col gap-4 border-b border-[var(--report-rule)] sm:flex-row sm:items-end sm:justify-between">
              <div
                aria-label="Filter leads"
                className="report-filters"
                role="group"
              >
                {SEGMENTS.map(({ id, label }) => (
                  <ReportFilter
                    active={segment === id}
                    count={segmentCounts[id]}
                    key={id}
                    onClick={() => setSegment(id)}
                  >
                    {label}
                  </ReportFilter>
                ))}
              </div>
              <ConsoleSearch
                aria-label="Search leads"
                className="mb-3 w-full sm:w-72"
                onChange={setSearchQuery}
                placeholder="Search names, emails, pages"
                value={searchQuery}
              />
            </div>

            <div className="pb-4">
              {isLoadingFirstPage ? (
                <SkeletonRows className="border-t-0" count={6} trailing={2} />
              ) : leads.results.length ? (
                <ul>
                  {leads.results.map((lead) => (
                    <LeadRow key={lead.contactSessionId} lead={lead} />
                  ))}
                </ul>
              ) : (
                <ReportQuiet>
                  {normalizedSearchQuery
                    ? `No one matches “${normalizedSearchQuery}”.`
                    : segment === "waiting"
                      ? "You're all caught up — no one is waiting for a reply."
                      : segment === "newcomers"
                        ? "No new leads this week yet."
                        : segment === "no_chats"
                          ? "Everyone who left their details also started a chat."
                          : "No leads to show."}{" "}
                  {segment !== "all" || normalizedSearchQuery ? (
                    <button
                      className="text-foreground underline underline-offset-4"
                      onClick={() => {
                        setSegment("all")
                        setSearchQuery("")
                      }}
                      type="button"
                    >
                      Show everyone
                    </button>
                  ) : null}
                </ReportQuiet>
              )}

              <InfiniteScrollTrigger
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                ref={topElementRef}
              />
            </div>

            <ReportSection
              index={1}
              lede="Which channels bring people in, which sites send them, and what they were reading when they reached out."
              title="Where they come from"
            >
              <Origins summary={summary} />
            </ReportSection>
          </>
        ) : null}
      </div>
    </ConsolePage>
  )
}
