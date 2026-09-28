"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import {
  FlaskConicalIcon,
  Loader2Icon,
  RotateCcwIcon,
  SendIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { getConvexErrorMessage } from "@/lib/convex-error"
import { useLanguage } from "@/lib/i18n/language-provider"
import {
  Meter,
  Pill,
  type ConsoleTone,
} from "@/modules/dashboard/ui/components/console"

type Run = NonNullable<FunctionReturnType<typeof api.private.replay.getLatest>>
type Item = Run["items"][number]
type Verdict = NonNullable<Item["verdict"]>

const VERDICTS: Record<Verdict, { label: string; tone: ConsoleTone }> = {
  worse: { label: "Worse", tone: "critical" },
  different: { label: "Changed", tone: "warning" },
  better: { label: "Better", tone: "positive" },
  same: { label: "Same", tone: "neutral" },
}

/** Worst first: what the owner most needs to see before publishing. */
const VERDICT_ORDER: Verdict[] = ["worse", "different", "better", "same"]

const ACTION_LABELS: Record<string, string> = {
  handoff: "Hands over to a person",
  resolve: "Closes the conversation",
  google_sheets: "Uses Google Sheets",
  google_calendar: "Uses Google Calendar",
  api_request: "Calls your API",
  custom_webhook: "Uses a custom tool",
}

const ReplayItem = ({ item }: { item: Item }) => {
  const verdict = item.verdict ? VERDICTS[item.verdict] : null

  return (
    <li className="border-b border-[var(--console-hairline-soft)] py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground">“{item.question}”</p>
        {verdict ? (
          <Pill className="shrink-0" tone={verdict.tone}>
            {verdict.label}
          </Pill>
        ) : item.after === undefined ? (
          <Loader2Icon className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      {item.note ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{item.note}</p>
      ) : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="console-inset rounded-[10px] px-3 py-2.5">
          <p className="console-label">Customers were told</p>
          <p className="mt-1.5 line-clamp-6 text-xs leading-relaxed whitespace-pre-line text-foreground/80">
            {item.before}
          </p>
        </div>
        <div
          className={cn(
            "console-inset rounded-[10px] px-3 py-2.5",
            item.verdict === "worse" && "border-destructive/40"
          )}
        >
          <p className="console-label">With your changes</p>
          <p className="mt-1.5 line-clamp-6 text-xs leading-relaxed whitespace-pre-line text-foreground/80">
            {item.after === undefined
              ? "…"
              : item.after || "(no reply)"}
          </p>
          {item.actions?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.actions.map((action) => (
                <Pill key={action} tone="info">
                  {ACTION_LABELS[action] ?? action}
                </Pill>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  )
}

/**
 * Checks the draft against real customer questions before it goes live: each
 * question is answered again with the draft, next to what the customer was
 * actually told, and marked the same, better, worse or changed.
 */
export const ReplaySheet = ({
  open,
  onOpenChange,
  agentId,
  draftUpdatedAt,
  isPublishing,
  onPublish,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  draftUpdatedAt?: number
  isPublishing: boolean
  onPublish: () => void
}) => {
  const { language } = useLanguage()
  const latest = useQuery(
    api.private.replay.getLatest,
    open ? { agentId } : "skip"
  )
  const start = useMutation(api.private.replay.start)
  const [isStarting, setIsStarting] = useState(false)

  const isRunning =
    latest?.status === "running" || latest?.status === "judging"

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await start({ agentId, language })
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Couldn't start the check"))
    } finally {
      setIsStarting(false)
    }
  }

  const counts = useMemo(() => {
    const result: Record<Verdict, number> = {
      worse: 0,
      different: 0,
      better: 0,
      same: 0,
    }

    for (const item of latest?.items ?? []) {
      if (item.verdict) {
        result[item.verdict] += 1
      }
    }

    return result
  }, [latest])

  const sortedItems = useMemo(
    () =>
      (latest?.items ?? [])
        .slice()
        .sort(
          (a, b) =>
            VERDICT_ORDER.indexOf(a.verdict ?? "same") -
            VERDICT_ORDER.indexOf(b.verdict ?? "same")
        ),
    [latest]
  )

  const isStale =
    latest?.status === "done" &&
    draftUpdatedAt !== undefined &&
    latest.draftUpdatedAt !== draftUpdatedAt

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
        side="right"
      >
        <SheetHeader className="border-b border-[var(--console-hairline-soft)] px-5 py-4">
          <SheetTitle className="console-section-title flex items-center gap-2">
            <FlaskConicalIcon className="size-4 text-primary" />
            Test before publishing
          </SheetTitle>
          <SheetDescription className="text-xs">
            Real questions your customers asked, answered again with your
            draft. Nothing is sent to anyone, and bookings or other actions
            don&apos;t really run.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {latest === undefined ? (
            <Loader2Icon className="mx-auto mt-10 size-5 animate-spin text-muted-foreground" />
          ) : latest === null ? (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm text-muted-foreground">
                See how your draft answers the questions customers really ask,
                before they see it.
              </p>
              <Button
                disabled={isStarting}
                onClick={() => void handleStart()}
                size="sm"
              >
                <FlaskConicalIcon data-icon="inline-start" />
                Run the check
              </Button>
            </div>
          ) : (
            <>
              {isRunning ? (
                <div className="mb-5 flex flex-col gap-2">
                  <p className="flex items-center gap-2 text-sm text-foreground">
                    <Loader2Icon className="size-3.5 animate-spin" />
                    <span>
                      {latest.status === "judging"
                        ? "Comparing the answers…"
                        : latest.total
                          ? "Answering the questions…"
                          : "Collecting real questions…"}
                    </span>
                    {latest.status === "running" && latest.total ? (
                      <span className="console-numeral text-xs text-muted-foreground">
                        {latest.completed}/{latest.total}
                      </span>
                    ) : null}
                  </p>
                  {latest.total ? (
                    <Meter
                      value={
                        (latest.completed / latest.total) *
                        (latest.status === "judging" ? 100 : 90)
                      }
                    />
                  ) : null}
                </div>
              ) : null}

              {latest.status === "failed" ? (
                <p className="mb-5 text-sm text-destructive">
                  The check didn&apos;t finish. Try running it again.
                </p>
              ) : null}

              {latest.status === "done" && latest.total === 0 ? (
                <p className="text-sm text-muted-foreground">
                  There are no customer questions to test with yet. Once
                  customers chat with your assistant, this check uses their
                  real questions.
                </p>
              ) : null}

              {latest.status === "done" && latest.total > 0 ? (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {VERDICT_ORDER.filter((key) => counts[key] > 0).map((key) => (
                    <Pill key={key} tone={VERDICTS[key].tone}>
                      {counts[key]} · {VERDICTS[key].label}
                    </Pill>
                  ))}
                </div>
              ) : null}

              {isStale ? (
                <p className="mb-5 text-xs text-muted-foreground">
                  Your draft has changed since this check. Run it again to see
                  the latest version.
                </p>
              ) : null}

              <ul>
                {sortedItems.map((item, index) => (
                  <ReplayItem item={item} key={`${index}-${item.question}`} />
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--console-hairline-soft)] px-5 py-3.5">
          <Button
            disabled={isStarting || isRunning || latest === undefined}
            onClick={() => void handleStart()}
            size="sm"
            variant="ghost"
          >
            <RotateCcwIcon data-icon="inline-start" />
            Check again
          </Button>
          <Button
            disabled={isPublishing || isRunning}
            onClick={onPublish}
            size="sm"
            variant={counts.worse > 0 ? "outline" : "default"}
          >
            {isPublishing ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            {counts.worse > 0 ? "Publish anyway" : "Publish"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
