"use client"

import Link from "next/link"
import { useOrganization } from "@clerk/nextjs"
import { api } from "@workspace/backend/_generated/api"
import { useQuery, usePaginatedQuery } from "convex/react"
import { format, formatDistanceToNowStrict } from "date-fns"
import {
  ArrowRightIcon,
  CheckIcon,
  CircleHelpIcon,
  InboxIcon,
  MessagesSquareIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { richMessagePreview } from "@workspace/ui/components/ai/rich-message"
import { cn } from "@workspace/ui/lib/utils"

import { ONBOARDING_STEPS } from "@/modules/onboarding/lib/steps"
import { ConsolePage, Meter, Panel, PanelHeader } from "../components/console"
import { ConversationPriorityBadge } from "../components/conversation-priority"

/**
 * Where an owner starts the day.
 *
 * Until setup is finished the first thing on the page is what is left to do;
 * after that it is a daily summary: the week in four figures, the
 * conversations that are waiting on a person, and what the assistant could not
 * answer. Every block links to the page where the work actually happens.
 */

const WINDOW_DAYS = 7
const WAITING_LIMIT = 6

const greetingFor = (date: Date) => {
  const hour = date.getHours()

  if (hour < 12) {
    return "Good morning"
  }

  if (hour < 18) {
    return "Good afternoon"
  }

  return "Good evening"
}

const humanizeIntent = (intent: string) => {
  const text = intent.replaceAll("_", " ").trim()
  return text ? text[0]!.toUpperCase() + text.slice(1) : intent
}

export const HomeView = () => {
  const { organization } = useOrganization()
  const status = useQuery(api.private.onboarding.getStatus)
  const overview = useQuery(api.private.analytics.getOverview, {
    windowDays: WINDOW_DAYS,
  })
  const leads = useQuery(api.private.leads.getSummary)
  const learning = useQuery(api.private.learning.counts)
  const waiting = usePaginatedQuery(
    api.private.conversations.getMany,
    { status: "escalated" },
    { initialNumItems: WAITING_LIMIT }
  )

  const now = new Date()
  const orgName = organization?.name?.trim()
  const waitingConversations = waiting.results.slice(0, WAITING_LIMIT)
  const hasMoreWaiting =
    waiting.results.length > WAITING_LIMIT || waiting.status === "CanLoadMore"
  const isWaitingLoading = waiting.status === "LoadingFirstPage"
  const answersToReview =
    (learning?.suggested ?? 0) + (learning?.needsAnswer ?? 0)
  const chatTotal =
    overview?.channelMetrics.find((metric) => metric.channel === "chat")
      ?.total ?? 0
  const voiceTotal =
    overview?.channelMetrics.find((metric) => metric.channel === "voice")
      ?.total ?? 0
  const topIntents = overview?.topIntents.slice(0, 5) ?? []
  const topIntentMax = Math.max(1, ...topIntents.map((intent) => intent.count))

  return (
    <ConsolePage>
      {/* ── greeting ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="console-eyebrow">{format(now, "EEEE, d MMMM")}</p>
          <h1 className="console-title mt-2 truncate">
            {greetingFor(now)}
            {orgName ? <span className="text-muted-foreground">, {orgName}</span> : null}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/customization">Edit widget</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/conversations">
              <InboxIcon className="size-3.5" />
              Open inbox
            </Link>
          </Button>
        </div>
      </header>

      {/* ── setup, until it is done ──────────────────────────────────────── */}
      {status && !status.isSetupComplete ? (
        <section className="console-card overflow-hidden">
          <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-stretch xl:gap-6">
            <div className="flex shrink-0 flex-col justify-between gap-3 xl:w-56">
              <div>
                <p className="console-section-title">Finish setting up</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  A few short steps before your assistant can answer customers.
                </p>
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="console-label">Steps done</span>
                  <span className="console-numeral text-sm">
                    {status.completedCount}/{status.totalCount}
                  </span>
                </div>
                <Meter
                  className="mt-2"
                  tone="accent"
                  value={(status.completedCount / status.totalCount) * 100}
                />
              </div>
            </div>

            <ol className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {ONBOARDING_STEPS.map((step) => {
                const stepStatus = status.steps.find(
                  (entry) => entry.id === step.id
                )
                const isDone = stepStatus?.done ?? false
                const isNext =
                  !isDone &&
                  status.steps.find((entry) => !entry.done)?.id === step.id

                return (
                  <li className="min-w-0" key={step.id}>
                    <Link
                      className={cn(
                        "console-interactive flex h-full flex-col gap-2 rounded-[var(--console-radius-sm)] border px-3 py-2.5",
                        isNext
                          ? "border-[color-mix(in_srgb,var(--foreground)_22%,transparent)] bg-card"
                          : "border-[var(--console-hairline-soft)] bg-[color-mix(in_srgb,var(--muted)_40%,transparent)]"
                      )}
                      href={`/start?step=${step.id}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full",
                            isDone
                              ? "bg-[var(--console-positive)] text-white"
                              : "border border-[var(--console-hairline)] text-muted-foreground"
                          )}
                        >
                          {isDone ? (
                            <CheckIcon className="size-3" />
                          ) : (
                            <step.icon className="size-3" />
                          )}
                        </span>
                        {isNext ? (
                          <span className="text-[11px] font-medium text-foreground">
                            Next
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            {isDone ? null : step.estimate}
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[13px] leading-snug font-medium",
                          isDone ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      <span className="mt-auto truncate text-[11px] text-muted-foreground">
                        {stepStatus?.detail}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ── the week in four figures ─────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-[var(--console-hairline)] bg-[var(--console-hairline-soft)] lg:grid-cols-4">
        <Figure
          hint={
            overview ? (
              <>
                {chatTotal} <span>chat</span> · {voiceTotal} <span>voice</span>
              </>
            ) : null
          }
          label="Conversations"
          period="Last 7 days"
          value={overview?.totalConversations}
        />
        <Figure
          hint={<span>Resolved without a teammate</span>}
          label="Answered by AI"
          meter={overview?.resolutionRate}
          period="Last 7 days"
          value={overview ? `${overview.resolutionRate}%` : undefined}
        />
        <Figure
          hint={<span>Handed over by the assistant</span>}
          label="Waiting for you"
          period="Right now"
          tone={waitingConversations.length > 0 ? "warning" : "neutral"}
          value={
            isWaitingLoading
              ? undefined
              : `${waitingConversations.length}${hasMoreWaiting ? "+" : ""}`
          }
        />
        <Figure
          hint={
            leads ? (
              <>
                {leads.totalLeads} <span>in total</span>
              </>
            ) : null
          }
          label="New leads"
          period="Last 7 days"
          value={leads?.newcomerCount}
        />
      </section>

      {/* ── work ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <Panel>
          <PanelHeader
            actions={
              <Button asChild size="sm" variant="ghost">
                <Link href="/conversations">
                  All conversations
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </Button>
            }
            description="Conversations your assistant handed to a person."
            icon={MessagesSquareIcon}
            title="Waiting for you"
          />
          {isWaitingLoading ? (
            <div className="divide-y divide-[var(--console-hairline-soft)]">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="flex items-center gap-3 px-4 py-3 sm:px-5" key={index}>
                  <Skeleton className="size-7 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : waitingConversations.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-6 sm:px-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--console-positive)_14%,transparent)] text-[var(--console-positive)]">
                <CheckIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">Nothing is waiting for you</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  When your assistant hands a conversation over, it shows up
                  here.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--console-hairline-soft)]">
              {waitingConversations.map((conversation) => {
                const activityAt =
                  conversation.lastCustomerMessageAt ??
                  conversation.lastOperatorMessageAt ??
                  conversation._creationTime
                const preview = richMessagePreview(
                  conversation.lastMessage?.text ?? ""
                )

                return (
                  <li key={conversation._id}>
                    <Link
                      className="console-row flex items-center gap-3 px-4 py-2.5 sm:px-5"
                      href={`/conversations/${conversation._id}`}
                    >
                      <DicebearAvatar
                        className="shrink-0"
                        imageUrl={
                          conversation.contactSession.metadata
                            ?.instagramProfilePic
                        }
                        seed={conversation.contactSession._id}
                        size={28}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium">
                            {conversation.contactSession.name}
                          </span>
                          <ConversationPriorityBadge
                            priority={conversation.priority}
                          />
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {preview || "—"}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        {formatDistanceToNowStrict(new Date(activityAt))}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <div className="grid gap-4">
          <Panel>
            <PanelHeader
              actions={
                <Button asChild size="sm" variant="ghost">
                  <Link href="/teach">
                    Teach answers
                    {answersToReview > 0 ? (
                      <span className="console-numeral rounded-full bg-muted px-1.5 text-[10px]">
                        {answersToReview}
                      </span>
                    ) : null}
                  </Link>
                </Button>
              }
              icon={CircleHelpIcon}
              title="Questions it couldn't answer"
            />
            {overview === undefined ? (
              <div className="space-y-2 px-4 py-4 sm:px-5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : overview.unansweredQuestions.length === 0 ? (
              <p className="px-4 py-5 text-xs text-muted-foreground sm:px-5">
                Your assistant had an answer for every question this week.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--console-hairline-soft)]">
                {overview.unansweredQuestions.slice(0, 5).map((item) => (
                  <li
                    className="flex items-start gap-3 px-4 py-2.5 sm:px-5"
                    key={item.question}
                  >
                    <p className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-snug">
                      {item.question}
                    </p>
                    <span className="console-numeral shrink-0 text-xs text-muted-foreground">
                      ×{item.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader icon={SparklesIcon} title="What customers ask about" />
            {overview === undefined ? (
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : topIntents.length === 0 ? (
              <p className="px-4 py-5 text-xs text-muted-foreground sm:px-5">
                Topics appear here once customers start writing in.
              </p>
            ) : (
              <ul className="space-y-2.5 px-4 py-4 sm:px-5">
                {topIntents.map((intent) => (
                  <li key={intent.label}>
                    <div className="flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="truncate">
                        {humanizeIntent(intent.label)}
                      </span>
                      <span className="console-numeral shrink-0 text-xs text-muted-foreground">
                        {intent.count}
                      </span>
                    </div>
                    <Meter
                      className="mt-1.5"
                      tone="neutral"
                      value={(intent.count / topIntentMax) * 100}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </ConsolePage>
  )
}

/** One cell of the figures strip. The strip's 1px gaps draw the dividers. */
const Figure = ({
  label,
  period,
  value,
  hint,
  meter,
  tone = "neutral",
}: {
  label: string
  period: string
  value: React.ReactNode | undefined
  hint?: React.ReactNode
  meter?: number
  tone?: "neutral" | "warning"
}) => (
  <div className="flex min-w-0 flex-col gap-1.5 bg-card px-4 py-4 sm:px-5">
    <div className="flex items-start justify-between gap-2">
      {value === undefined ? (
        <Skeleton className="h-8 w-16 rounded-md" />
      ) : (
        <span
          className={cn(
            "text-[1.875rem] leading-none font-[450] tracking-[-0.03em] tabular-nums",
            tone === "warning" && "text-[var(--console-warning)]"
          )}
        >
          {value}
        </span>
      )}
      <span className="shrink-0 text-[10.5px] text-muted-foreground/80">
        {period}
      </span>
    </div>
    <span className="mt-1 truncate text-[0.8125rem] text-muted-foreground">
      {label}
    </span>
    {typeof meter === "number" ? (
      <Meter tone="positive" value={meter} />
    ) : null}
    {hint ? (
      <span className="truncate text-xs text-muted-foreground">{hint}</span>
    ) : null}
  </div>
)
