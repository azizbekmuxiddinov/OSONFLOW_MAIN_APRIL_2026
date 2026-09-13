"use client"

import { useMemo, useState } from "react"
import { useConvex, useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeftIcon,
  DownloadIcon,
  LanguagesIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import type { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  formatCsvTimestamp,
  stringifyCsvRows,
} from "../lib/conversation-export"
import {
  ConsolePage,
  ConsoleSearch,
} from "../components/console"
import { MemorySkeleton } from "../components/report-skeleton"
import { ReportFilter } from "../components/report"
import "../styles/report.css"
import "../styles/memory.css"

const CUSTOMER_MEMORY_EXPORT_LIMIT = 5000

type CustomerMemory = Doc<"customerMemories">
type MemoryFilter = "all" | "attention" | "recent" | "resolved"

const formatIntent = (intent: string) =>
  intent
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp)

const isRecentlySeen = (timestamp: number) =>
  Date.now() - timestamp <= 30 * 24 * 60 * 60 * 1000

const initialsOf = (name: string | undefined, email: string) => {
  const source = name?.trim() || email?.trim() || "?"
  const parts = source.split(/[\s@._-]+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

const joinList = (items: string[]) => items.filter(Boolean).join("; ")

const formatIssueHistoryForCsv = (memory: CustomerMemory) =>
  memory.issueHistory
    .map((item) =>
      [
        formatCsvTimestamp(item.at),
        item.channel,
        formatIntent(item.intent),
        item.status,
        item.summary,
      ]
        .filter(Boolean)
        .join(" | ")
    )
    .join("\n")

const buildCustomerMemoryCsv = (memories: CustomerMemory[]) => {
  const rows = [
    [
      "Customer ID",
      "Email",
      "Name",
      "Summary",
      "Preferred Language",
      "Recent Intents",
      "Notable Facts",
      "Issue History",
      "Total Conversations",
      "Total Resolved",
      "Total Escalations",
      "Last Seen At",
      "Updated At",
    ],
    ...memories.map((memory) => [
      memory._id,
      memory.email,
      memory.name,
      memory.summary,
      memory.preferredLanguage,
      joinList(memory.recentIntents.map(formatIntent)),
      joinList(memory.notableFacts),
      formatIssueHistoryForCsv(memory),
      memory.totalConversations,
      memory.totalResolved,
      memory.totalEscalations,
      formatCsvTimestamp(memory.lastSeenAt),
      formatCsvTimestamp(memory.updatedAt),
    ]),
  ]

  return stringifyCsvRows(rows)
}

type IssueStatus = CustomerMemory["issueHistory"][number]["status"]

/** Same status encoding as the Analytics report, so a green square means the
 *  same thing on both pages. */
const STATUS: Record<
  IssueStatus,
  { outcome: "resolved" | "handed" | "open"; label: string; filled: boolean }
> = {
  resolved: { outcome: "resolved", label: "Resolved", filled: true },
  escalated: { outcome: "handed", label: "Handed to team", filled: true },
  unresolved: { outcome: "open", label: "Still open", filled: false },
}

const FILTERS: { id: MemoryFilter; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "attention", label: "Needed your team" },
  { id: "recent", label: "Back this month" },
  { id: "resolved", label: "Mostly resolved" },
]

const matchesFilter = (memory: CustomerMemory, filter: MemoryFilter) => {
  if (filter === "attention") return memory.totalEscalations > 0
  if (filter === "recent") return isRecentlySeen(memory.lastSeenAt)
  if (filter === "resolved") {
    return (
      memory.totalResolved > 0 &&
      memory.totalResolved >= memory.totalEscalations
    )
  }
  return true
}

const displayName = (memory: CustomerMemory) =>
  memory.name?.trim() || memory.email.split("@")[0] || "Unknown customer"

const seenLabel = (timestamp: number) =>
  formatDistanceToNow(timestamp, { addSuffix: true })

/* ── directory ──────────────────────────────────────────────────────────── */

const OutcomeTrail = ({ memory }: { memory: CustomerMemory }) => {
  const recent = [...memory.issueHistory]
    .sort((a, b) => a.at - b.at)
    .slice(-8)

  if (!recent.length) {
    return null
  }

  return (
    <span
      aria-label={`Last ${recent.length} conversations: ${recent
        .map((item) => STATUS[item.status].label)
        .join(", ")}`}
      className="memory-trail"
      role="img"
    >
      {recent.map((item) => (
        <span
          data-outcome={STATUS[item.status].outcome}
          key={`${item.at}-${item.summary}`}
        />
      ))}
    </span>
  )
}

const PersonRow = ({
  memory,
  selected,
  peek,
  onSelect,
}: {
  memory: CustomerMemory
  selected: boolean
  /** Selected only as the wide-screen default, not opened by the owner. */
  peek: boolean
  onSelect: () => void
}) => (
  <button
    aria-current={selected}
    data-peek={peek ? "" : undefined}
    className="memory-row-button grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3.5 px-3 py-3.5 text-left focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    onClick={onSelect}
    type="button"
  >
    <span className="memory-avatar size-10 text-xs">
      {initialsOf(memory.name, memory.email)}
    </span>
    <span className="min-w-0">
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-[0.95rem] font-medium text-foreground">
          {displayName(memory)}
        </span>
        {memory.totalEscalations > 0 ? (
          <span className="hidden shrink-0 text-[0.7rem] text-muted-foreground sm:inline">
            · needed team {memory.totalEscalations}×
          </span>
        ) : null}
      </span>
      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
        {memory.summary}
      </span>
    </span>
    <span className="flex flex-col items-end gap-2">
      <span className="text-[0.7rem] whitespace-nowrap text-muted-foreground">
        {seenLabel(memory.lastSeenAt)}
      </span>
      <OutcomeTrail memory={memory} />
    </span>
  </button>
)

/* ── dossier ────────────────────────────────────────────────────────────── */

const Dossier = ({
  memory,
  onClose,
}: {
  memory: CustomerMemory
  onClose?: () => void
}) => {
  const resolvedRate =
    memory.totalConversations > 0
      ? Math.round((memory.totalResolved / memory.totalConversations) * 100)
      : 0
  const history = [...memory.issueHistory].sort((a, b) => b.at - a.at)

  return (
    <article className="memory-dossier" key={memory._id}>
      {onClose ? (
        <Button
          className="mb-4 -ml-2 lg:hidden"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Close
        </Button>
      ) : null}

      <header className="flex items-start gap-4">
        <span className="memory-avatar size-14 text-base">
          {initialsOf(memory.name, memory.email)}
        </span>
        <div className="min-w-0">
          <h2 className="memory-name">{displayName(memory)}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1.5">
              <MailIcon aria-hidden className="size-3 shrink-0" />
              <span className="truncate">{memory.email}</span>
            </span>
            {memory.preferredLanguage ? (
              <span className="flex items-center gap-1.5">
                <LanguagesIcon aria-hidden className="size-3" />
                {memory.preferredLanguage}
              </span>
            ) : null}
            <span>Last seen {formatDate(memory.lastSeenAt)}</span>
          </p>
        </div>
      </header>

      <p className="memory-summary mt-7">{memory.summary}</p>

      <div className="report-figures mt-8 grid grid-cols-3">
        {(
          [
            ["Conversations", memory.totalConversations],
            ["Resolved", `${resolvedRate}%`],
            ["Needed your team", memory.totalEscalations],
          ] as const
        ).map(([label, value]) => (
          <div
            className="report-figure flex flex-col gap-2 px-3 py-4 first:pl-0 sm:px-5"
            key={label}
          >
            <p className="console-label">{label}</p>
            <p className="report-figure-value">{value}</p>
          </div>
        ))}
      </div>

      <section className="memory-block py-7">
        <h3 className="console-label">What your assistant remembers</h3>
        {memory.notableFacts.length ? (
          <ol className="mt-3">
            {memory.notableFacts.map((fact, index) => (
              <li
                className="memory-fact grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 py-2.5"
                key={fact}
              >
                <span className="report-section-index pt-0.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed break-words text-foreground">
                  {fact}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing specific captured yet — facts appear as this customer
            shares them.
          </p>
        )}

        {memory.recentIntents.length ? (
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Usually asks about{" "}
            <span className="text-foreground">
              {memory.recentIntents.map(formatIntent).join(", ")}
            </span>
            .
          </p>
        ) : null}
      </section>

      <section className="memory-block pt-7">
        <h3 className="console-label">History</h3>
        {history.length ? (
          <ol className="report-timeline mt-5 flex flex-col gap-6">
            {history.map((item) => {
              const status = STATUS[item.status]
              const ChannelIcon =
                item.channel === "voice" ? MicIcon : MessageSquareIcon

              return (
                <li
                  className="grid grid-cols-[0.625rem_minmax(0,1fr)] gap-4"
                  key={`${item.at}-${item.summary}`}
                >
                  <span
                    className="report-node mt-1.5"
                    data-filled={status.filled ? "" : undefined}
                    style={{ color: `var(--outcome-${status.outcome})` }}
                  />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {status.label}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{formatIntent(item.intent)}</span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1">
                        <ChannelIcon aria-hidden className="size-3" />
                        <span className="capitalize">{item.channel}</span>
                      </span>
                      <span aria-hidden>·</span>
                      <time dateTime={new Date(item.at).toISOString()}>
                        {formatDate(item.at)}
                      </time>
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed break-words text-foreground">
                      {item.summary}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No conversations recorded yet.
          </p>
        )}
      </section>
    </article>
  )
}

/* ── page ───────────────────────────────────────────────────────────────── */

export const CustomerMemoryView = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<MemoryFilter>("all")
  const [selectedId, setSelectedId] = useState<CustomerMemory["_id"] | null>(
    null
  )
  // On narrow screens the dossier opens inline, so it only appears once the
  // owner actually picks someone rather than defaulting to the first row.
  const [openedInline, setOpenedInline] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const convex = useConvex()
  const memories = useQuery(api.private.customerMemories.getMany, {
    limit: 75,
  })

  const searched = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!memories || !query) {
      return memories ?? []
    }

    return memories.filter((memory) =>
      [
        memory.name,
        memory.email,
        memory.summary,
        memory.preferredLanguage,
        ...memory.recentIntents,
        ...memory.notableFacts,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [memories, searchQuery])

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map(({ id }) => [
          id,
          searched.filter((memory) => matchesFilter(memory, id)).length,
        ])
      ) as Record<MemoryFilter, number>,
    [searched]
  )

  const visible = useMemo(
    () => searched.filter((memory) => matchesFilter(memory, filter)),
    [filter, searched]
  )

  const handleDownloadCsv = async () => {
    setIsExporting(true)

    try {
      const exportMemories = await convex.query(
        api.private.customerMemories.getForExport,
        {
          limit: CUSTOMER_MEMORY_EXPORT_LIMIT,
        }
      )

      if (!exportMemories.length) {
        toast.info("No customer memory to export")
        return
      }

      const csv = buildCustomerMemoryCsv(exportMemories)
      const blob = new Blob(["﻿", csv], {
        type: "text/csv;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `customer-memory-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      toast.success(`Exported ${exportMemories.length} customer memories`)
    } catch {
      toast.error("Failed to export customer memory")
    } finally {
      setIsExporting(false)
    }
  }

  if (memories === undefined) {
    return <MemorySkeleton />
  }

  const selected =
    visible.find((memory) => memory._id === selectedId) ?? visible[0] ?? null
  const everyone = memories.length
  const totalConversations = memories.reduce(
    (total, memory) => total + memory.totalConversations,
    0
  )

  return (
    <ConsolePage width="wide">
      <div className="report">
        <section className="pt-2 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="console-eyebrow">Customer memory</p>
            <Button
              disabled={isExporting}
              onClick={handleDownloadCsv}
              size="sm"
              variant="ghost"
            >
              <DownloadIcon data-icon="inline-start" />
              {isExporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>

          {everyone ? (
            <>
              <h1 className="report-headline mt-6 max-w-[24ch]">
                Your assistant remembers{" "}
                <span className="report-headline-figure">
                  {everyone} {everyone === 1 ? "customer" : "customers"}
                </span>
                .
              </h1>
              <p className="report-lede mt-5 max-w-[62ch]">
                Built from <strong>{totalConversations}</strong>{" "}
                {totalConversations === 1 ? "conversation" : "conversations"}.{" "}
                <strong>{counts.recent}</strong> came back this month, and{" "}
                <strong>{counts.attention}</strong>{" "}
                {counts.attention === 1 ? "has" : "have"} needed your team at
                least once — read their history before you reply.
              </p>
            </>
          ) : (
            <>
              <h1 className="report-headline mt-6 max-w-[22ch]">
                No one to remember yet.
              </h1>
              <p className="report-lede mt-5 max-w-[62ch]">
                When a customer shares their email in chat or voice, your
                assistant starts keeping notes — who they are, what they asked,
                and how it ended — so nobody has to repeat themselves.
              </p>
            </>
          )}
        </section>

        {everyone ? (
          <>
            <div className="flex flex-col gap-4 border-b border-[var(--report-rule)] sm:flex-row sm:items-end sm:justify-between">
              <div
                aria-label="Filter customers"
                className="report-filters"
                role="group"
              >
                {FILTERS.map(({ id, label }) => (
                  <ReportFilter
                    active={filter === id}
                    count={counts[id]}
                    key={id}
                    onClick={() => {
                      setFilter(id)
                      setOpenedInline(false)
                    }}
                  >
                    {label}
                  </ReportFilter>
                ))}
              </div>
              <ConsoleSearch
                aria-label="Search customers"
                className="mb-3 w-full sm:w-72"
                onChange={setSearchQuery}
                placeholder="Search names, emails, or notes"
                value={searchQuery}
              />
            </div>

            <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14">
              {visible.length ? (
                <ul className="flex flex-col">
                  {visible.map((memory) => {
                    const isSelected = selected?._id === memory._id

                    return (
                      <li className="memory-row py-1" key={memory._id}>
                        <PersonRow
                          memory={memory}
                          onSelect={() => {
                            setSelectedId(memory._id)
                            setOpenedInline(!(isSelected && openedInline))
                          }}
                          peek={isSelected && !openedInline}
                          selected={isSelected}
                        />
                        {isSelected && openedInline ? (
                          <div className="px-3 pt-4 pb-8 lg:hidden">
                            <Dossier
                              memory={memory}
                              onClose={() => setOpenedInline(false)}
                            />
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="py-10 text-sm text-muted-foreground">
                  No one matches this filter
                  {searchQuery.trim() ? " and search" : ""}. Try{" "}
                  <button
                    className="text-foreground underline underline-offset-4"
                    onClick={() => {
                      setFilter("all")
                      setSearchQuery("")
                    }}
                    type="button"
                  >
                    showing everyone
                  </button>
                  .
                </p>
              )}

              {selected ? (
                <div className="hidden min-w-0 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100svh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
                  <Dossier memory={selected} />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </ConsolePage>
  )
}
