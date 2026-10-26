"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useAction, useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowUpRightIcon,
  CheckIcon,
  CircleHelpIcon,
  GraduationCapIcon,
  InboxIcon,
  Loader2Icon,
  MessagesSquareIcon,
  PencilIcon,
  SendIcon,
  SparklesIcon,
  Undo2Icon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { getConvexErrorMessage } from "@/lib/convex-error"
import { ConsolePage } from "@/modules/dashboard/ui/components/console"
import {
  FigureStrip,
  PageBar,
  ReportFilter,
  ReportQuiet,
  ReportSection,
  StripFigure,
} from "@/modules/dashboard/ui/components/report"
import { SkeletonRows } from "@/modules/dashboard/ui/components/report-skeleton"
import "@/modules/dashboard/ui/styles/report.css"

type Tab = "suggested" | "needs_answer" | "approved"
type LearnedAnswer = FunctionReturnType<
  typeof api.private.learning.list
>[number]

const TABS: { id: Tab; label: string }[] = [
  { id: "suggested", label: "Answered by your team" },
  { id: "needs_answer", label: "Couldn't answer" },
  { id: "approved", label: "Learned" },
]

const EMPTY_ICON: Record<Tab, typeof InboxIcon> = {
  suggested: UsersIcon,
  needs_answer: CircleHelpIcon,
  approved: GraduationCapIcon,
}

/** Shown until the first answer arrives, so the page explains itself. */
const HOW_TEACHING_WORKS = [
  {
    icon: MessagesSquareIcon,
    title: "Your team answers a customer",
    body: "In the inbox or straight from Telegram, the way you already do.",
  },
  {
    icon: SparklesIcon,
    title: "The answer lands here",
    body: "Prices, policies and how-tos worth keeping are picked out for you — so are questions the assistant couldn't answer.",
  },
  {
    icon: GraduationCapIcon,
    title: "Approve it once",
    body: "It goes into your knowledge base, and your assistant answers it on its own from then on.",
  },
] as const

const EMPTY_STATE: Record<Tab, string> = {
  suggested:
    "Nothing to review. When someone on your team answers a customer, answers worth keeping appear here.",
  needs_answer:
    "Your assistant has answered every question so far. Questions it can't answer will appear here.",
  approved:
    "Nothing learned yet. Approved answers are listed here, and you can edit or remove them at any time.",
}

const AnswerCard = ({ item, tab }: { item: LearnedAnswer; tab: Tab }) => {
  const approve = useAction(api.private.learning.approve)
  const dismiss = useMutation(api.private.learning.dismiss)
  const forget = useAction(api.private.learning.forget)
  const [question, setQuestion] = useState(item.question)
  const [answer, setAnswer] = useState(item.answer)
  const [isEditing, setIsEditing] = useState(tab !== "approved")
  const [busy, setBusy] = useState<"approve" | "dismiss" | "forget" | null>(
    null
  )

  const canApprove = question.trim().length > 0 && answer.trim().length > 0

  const handleApprove = async () => {
    setBusy("approve")
    try {
      await approve({ id: item.id, question, answer })
      toast.success("Your assistant knows this now")
      if (tab === "approved") {
        setIsEditing(false)
      }
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Couldn't save the answer"))
    } finally {
      setBusy(null)
    }
  }

  const handleDismiss = async () => {
    setBusy("dismiss")
    try {
      await dismiss({ id: item.id })
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Couldn't dismiss it"))
      setBusy(null)
    }
  }

  const handleForget = async () => {
    setBusy("forget")
    try {
      await forget({ id: item.id })
      toast.success("Removed from your knowledge base")
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Couldn't remove it"))
      setBusy(null)
    }
  }

  return (
    <li className="console-inset flex flex-col p-3.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {tab === "needs_answer" && item.askedCount > 1 ? (
          <span className="console-numeral text-foreground">
            {item.askedCount}×
          </span>
        ) : null}
        {tab === "suggested" ? <span>From a chat your team answered</span> : null}
        {tab === "needs_answer" ? (
          <span>Customers asked this and the assistant didn&apos;t know</span>
        ) : null}
        {tab === "approved" ? (
          <span>
            {item.answeredByName ? `${item.answeredByName} · ` : ""}
            {item.approvedAt
              ? formatDistanceToNow(item.approvedAt, { addSuffix: true })
              : null}
          </span>
        ) : null}
        {item.conversationId ? (
          <Link
            className="inline-flex items-center gap-1 text-foreground/80 underline-offset-4 hover:underline"
            href={`/conversations/${item.conversationId}`}
          >
            Open the conversation
            <ArrowUpRightIcon className="size-3" />
          </Link>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-2.5 flex flex-col gap-2">
          <Input
            aria-label="Question"
            className="text-[0.95rem] font-medium"
            disabled={busy !== null}
            onChange={(event) => setQuestion(event.target.value)}
            value={question}
          />
          <Textarea
            aria-label="Answer"
            className="min-h-16"
            disabled={busy !== null}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write the answer your assistant should give"
            value={answer}
          />
        </div>
      ) : (
        <div className="mt-2.5">
          <p className="report-gap-quote">“{item.question}”</p>
          <p className="mt-1.5 line-clamp-4 text-sm leading-snug whitespace-pre-line text-muted-foreground">
            {item.answer}
          </p>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        {isEditing ? (
          <>
            <Button
              disabled={!canApprove || busy !== null}
              onClick={() => void handleApprove()}
              size="sm"
            >
              {busy === "approve" ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : (
                <CheckIcon data-icon="inline-start" />
              )}
              {tab === "approved" ? "Save" : "Teach the assistant"}
            </Button>
            {tab === "approved" ? (
              <Button
                disabled={busy !== null}
                onClick={() => {
                  setQuestion(item.question)
                  setAnswer(item.answer)
                  setIsEditing(false)
                }}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            ) : (
              <Button
                disabled={busy !== null}
                onClick={() => void handleDismiss()}
                size="sm"
                variant="ghost"
              >
                <XIcon data-icon="inline-start" />
                Dismiss
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              disabled={busy !== null}
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
            >
              <PencilIcon data-icon="inline-start" />
              Edit
            </Button>
            <Button
              disabled={busy !== null}
              onClick={() => void handleForget()}
              size="sm"
              variant="ghost"
            >
              {busy === "forget" ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : (
                <Undo2Icon data-icon="inline-start" />
              )}
              Remove
            </Button>
          </>
        )}
      </div>
    </li>
  )
}

export const TeachView = () => {
  const counts = useQuery(api.private.learning.counts)
  const importUnanswered = useMutation(api.private.learning.importUnanswered)
  const [chosenTab, setTab] = useState<Tab | null>(null)
  // Until the owner picks one, open on whichever list has work in it.
  const tab: Tab | null =
    chosenTab ??
    (counts
      ? counts.needsAnswer > 0 && counts.suggested === 0
        ? "needs_answer"
        : counts.approved > 0 && counts.suggested + counts.needsAnswer === 0
          ? "approved"
          : "suggested"
      : null)
  const items = useQuery(
    api.private.learning.list,
    tab ? { status: tab } : "skip"
  )
  const importedRef = useRef(false)

  // Questions flagged before this page existed are brought in once per visit;
  // the mutation leaves anything already listed alone.
  useEffect(() => {
    if (importedRef.current) {
      return
    }

    importedRef.current = true
    void importUnanswered({}).catch(() => undefined)
  }, [importUnanswered])

  const waiting = (counts?.suggested ?? 0) + (counts?.needsAnswer ?? 0)
  const countFor = (id: Tab) =>
    id === "suggested"
      ? counts?.suggested
      : id === "needs_answer"
        ? counts?.needsAnswer
        : counts?.approved

  return (
    <ConsolePage width="wide">
      <div className="report flex flex-col gap-4">
        <PageBar
          actions={
            <Button asChild size="sm" variant="outline">
              <Link href="/team-alerts">
                <SendIcon data-icon="inline-start" />
                Answer from Telegram
              </Link>
            </Button>
          }
          hint="Answers your team gave in chats, and questions your assistant couldn't answer. Approve one and your assistant answers it on its own from then on."
          title="Answers"
        />

        <FigureStrip className="md:grid-cols-4">
          <StripFigure
            icon={InboxIcon}
            label="Waiting for you"
            note="Answers to check and questions to answer"
            tone="warning"
            value={counts ? waiting : "—"}
          />
          <StripFigure
            icon={UsersIcon}
            label="Answered by your team"
            note="Found in chats your team handled"
            tone="info"
            value={counts ? counts.suggested : "—"}
          />
          <StripFigure
            icon={CircleHelpIcon}
            label="Couldn't answer"
            note="Customers asked, the assistant didn't know"
            tone="critical"
            value={counts ? counts.needsAnswer : "—"}
          />
          <StripFigure
            icon={GraduationCapIcon}
            label="Learned"
            note="Answers your assistant now gives on its own"
            tone="positive"
            value={counts ? counts.approved : "—"}
          />
        </FigureStrip>

        <ReportSection flush title="Answers">
          <div
            aria-label="Filter answers"
            className="report-filters border-b border-[var(--report-rule)] px-4"
            role="group"
          >
            {TABS.map((item) => (
              <ReportFilter
                active={tab === item.id}
                count={countFor(item.id)}
                key={item.id}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </ReportFilter>
            ))}
          </div>

          <div className="p-4">
            {!tab || items === undefined ? (
              <SkeletonRows avatar={false} className="border-t-0" count={4} />
            ) : items.length === 0 ? (
              counts &&
              counts.suggested + counts.needsAnswer + counts.approved === 0 ? (
                <ol className="grid gap-3 md:grid-cols-3">
                  {HOW_TEACHING_WORKS.map((step, index) => (
                    <li
                      className="console-inset flex items-start gap-3 p-4"
                      key={step.title}
                    >
                      <span className="report-stat-icon" data-tone="accent">
                        <step.icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground tabular-nums">
                          {index + 1}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {step.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <ReportQuiet icon={EMPTY_ICON[tab]}>{EMPTY_STATE[tab]}</ReportQuiet>
              )
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                {items.map((item) => (
                  <AnswerCard item={item} key={item.id} tab={tab} />
                ))}
              </ul>
            )}
          </div>
        </ReportSection>
      </div>
    </ConsolePage>
  )
}
