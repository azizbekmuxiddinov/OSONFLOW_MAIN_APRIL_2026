"use client"

import Link from "next/link"
import { useState } from "react"
import { usePaginatedQuery } from "convex/react"
import { formatDistanceToNowStrict } from "date-fns"
import { api } from "@workspace/backend/_generated/api"
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  CompassIcon,
  GraduationCapIcon,
  InboxIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react"

import { richMessagePreview } from "@workspace/ui/components/ai/rich-message"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Hint } from "@workspace/ui/components/hint"
import { cn } from "@workspace/ui/lib/utils"

import { useConversationView } from "../../hooks/use-conversation-view"

/**
 * Everything that is waiting on a person, reachable from any page: the
 * conversations the assistant handed over, then what is unread, what the
 * assistant could not answer, and any setup left. Each row goes to the place
 * where it gets dealt with.
 */

const WAITING_LIMIT = 4

export type AttentionCounts = {
  unreadConversations: number
  unreadCalls: number
  answersWaiting: number
  setup: { done: number; total: number } | null
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

export const AttentionMenu = ({ counts }: { counts: AttentionCounts }) => {
  const [open, setOpen] = useState(false)
  const { setView } = useConversationView()

  // The hand-offs are only fetched while the menu is open.
  const waiting = usePaginatedQuery(
    api.private.conversations.getMany,
    open ? { status: "escalated" } : "skip",
    { initialNumItems: WAITING_LIMIT }
  )
  const waitingRows = waiting.results.slice(0, WAITING_LIMIT)
  const hasMoreWaiting =
    waiting.results.length > WAITING_LIMIT || waiting.status === "CanLoadMore"
  const isWaitingLoading = open && waiting.status === "LoadingFirstPage"

  const badge =
    counts.unreadConversations + counts.unreadCalls + counts.answersWaiting

  const summary: {
    id: string
    icon: LucideIcon
    title: string
    body: string
    href: string
    onSelect?: () => void
  }[] = [
    ...(counts.unreadConversations > 0
      ? [
          {
            id: "unread",
            icon: InboxIcon,
            title: plural(
              counts.unreadConversations,
              "conversation has",
              "conversations have"
            ).concat(" new messages"),
            body: "Open the inbox to read them",
            href: "/conversations",
            onSelect: () => setView("all"),
          },
        ]
      : []),
    ...(counts.unreadCalls > 0
      ? [
          {
            id: "calls",
            icon: PhoneIcon,
            title: plural(counts.unreadCalls, "new voice call", "new voice calls"),
            body: "Listen back or read the transcript",
            href: "/ai-conversations",
          },
        ]
      : []),
    ...(counts.answersWaiting > 0
      ? [
          {
            id: "answers",
            icon: GraduationCapIcon,
            title: plural(
              counts.answersWaiting,
              "question needs an answer",
              "questions need an answer"
            ),
            body: "Teach it the answer for next time",
            href: "/teach",
          },
        ]
      : []),
    ...(counts.setup
      ? [
          {
            id: "setup",
            icon: CompassIcon,
            title: "Finish setting up",
            body: `${counts.setup.done} of ${counts.setup.total} steps done`,
            href: "/start",
          },
        ]
      : []),
  ]

  const isAllClear =
    !isWaitingLoading && waitingRows.length === 0 && summary.length === 0

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <Hint align="center" side="right" text="Needs you">
        <DropdownMenuTrigger asChild>
          <button
            aria-label={
              badge > 0 ? `Needs you, ${badge} new` : "Needs you, nothing new"
            }
            className={cn(
              "dash-rail-item relative flex size-9 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-[var(--canvas-strong)] hover:text-foreground",
              open && "bg-[var(--canvas-strong)] text-foreground"
            )}
            type="button"
          >
            <BellIcon className="size-[18px]" strokeWidth={1.8} />
            {badge > 0 ? (
              <span className="dash-dot absolute top-1 right-0.5 inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--accent-blue)] px-1 text-[9.5px] leading-none font-semibold text-white tabular-nums ring-2 ring-[var(--canvas)]">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </button>
        </DropdownMenuTrigger>
      </Hint>

      <DropdownMenuContent
        align="end"
        className="w-[340px] p-0"
        side="right"
        sideOffset={10}
      >
        <div className="flex items-baseline justify-between gap-3 px-3.5 pt-3 pb-2">
          <p className="text-[13px] font-semibold tracking-[-0.01em]">
            Needs you
          </p>
          {isAllClear ? (
            <p className="text-[11px] text-muted-foreground">
              Nothing right now
            </p>
          ) : null}
        </div>

        {isAllClear ? (
          <div className="flex flex-col items-center gap-2 px-6 pt-4 pb-7 text-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--console-positive)_14%,transparent)] text-[var(--console-positive)]">
              <CheckIcon className="size-4" />
            </span>
            <p className="text-[13px] font-medium">You&apos;re all caught up</p>
            <p className="max-w-[26ch] text-xs leading-relaxed text-muted-foreground">
              Hand-offs, unread messages and unanswered questions show up here.
            </p>
          </div>
        ) : (
          <div className="p-1 pt-0">
            {isWaitingLoading ? (
              <div className="flex items-center gap-2.5 px-2.5 py-2">
                <span className="size-7 shrink-0 animate-pulse rounded-full bg-muted" />
                <span className="flex flex-1 flex-col gap-1.5">
                  <span className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                  <span className="h-2.5 w-40 animate-pulse rounded bg-muted" />
                </span>
              </div>
            ) : null}

            {waitingRows.length ? (
              <>
                <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground">
                  Handed to your team
                </p>
                {waitingRows.map((conversation) => {
                  const activityAt =
                    conversation.lastCustomerMessageAt ??
                    conversation.lastOperatorMessageAt ??
                    conversation._creationTime

                  return (
                    <DropdownMenuItem
                      asChild
                      className="gap-2.5 rounded-lg px-2.5 py-2"
                      key={conversation._id}
                    >
                      <Link href={`/conversations/${conversation._id}`}>
                        <DicebearAvatar
                          className="shrink-0"
                          imageUrl={
                            conversation.contactSession.metadata
                              ?.instagramProfilePic
                          }
                          seed={conversation.contactSession._id}
                          size={28}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[13px] font-medium">
                              {conversation.contactSession.name}
                            </span>
                            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                              {formatDistanceToNowStrict(new Date(activityAt))}
                            </span>
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {richMessagePreview(
                              conversation.lastMessage?.text ?? ""
                            ) || "—"}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
                {hasMoreWaiting ? (
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground"
                  >
                    <Link
                      href="/conversations"
                      onClick={() => setView("escalated")}
                    >
                      See everyone who is waiting
                      <ChevronRightIcon className="ml-auto size-3.5" />
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </>
            ) : null}

            {summary.length ? (
              <div
                className={cn(
                  waitingRows.length || isWaitingLoading
                    ? "mt-1 border-t border-foreground/[0.07] pt-1"
                    : undefined
                )}
              >
                {summary.map((row) => (
                  <DropdownMenuItem
                    asChild
                    className="gap-2.5 rounded-lg px-2.5 py-2"
                    key={row.id}
                  >
                    <Link href={row.href} onClick={row.onSelect}>
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/80">
                        <row.icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                          {row.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {row.body}
                        </span>
                      </span>
                      <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
