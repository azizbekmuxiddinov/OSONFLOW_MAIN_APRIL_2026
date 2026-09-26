"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import {
  ArrowUpRightIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  PowerOffIcon,
  SparklesIcon,
  TrashIcon,
  WorkflowIcon,
} from "lucide-react"
import { toast } from "sonner"
import {
  ConsolePage,
  ConsoleSearch,
} from "@/modules/dashboard/ui/components/console"
import {
  ReportFilter,
  ReportQuiet,
} from "@/modules/dashboard/ui/components/report"
import { SkeletonRows } from "@/modules/dashboard/ui/components/report-skeleton"
import "@/modules/dashboard/ui/styles/report.css"
import { readableError } from "../lib/readable-error"
import "../styles/workflows-list.css"
import { CreateWithAiDialog } from "./create-with-ai-dialog"

type WorkflowRow = {
  id: Id<"workflows">
  name: string
  description: string | null
  updatedAt: number
  isActive: boolean
  publishedAt: number | null
}

type WorkflowStatus = "live" | "published" | "draft"

type StatusFilter = "all" | WorkflowStatus

const STATUS_LABEL: Record<WorkflowStatus, string> = {
  live: "Live",
  published: "Published",
  draft: "Draft",
}

/** What each status means for a visitor, in the owner's terms. */
const STATUS_HINT: Record<WorkflowStatus, string> = {
  live: "Answering new conversations",
  published: "Ready, not answering",
  draft: "Not published yet",
}

const FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
]

const statusOf = (workflow: WorkflowRow): WorkflowStatus =>
  workflow.isActive ? "live" : workflow.publishedAt ? "published" : "draft"

const plural = (count: number, one: string, many: string) =>
  count === 1 ? one : many

export const WorkflowsListView = () => {
  const router = useRouter()
  const workflows = useQuery(api.private.workflows.list) as
    | WorkflowRow[]
    | undefined
  const renameWorkflow = useMutation(api.private.workflows.rename)
  const duplicateWorkflow = useMutation(api.private.workflows.duplicate)
  const removeWorkflow = useMutation(api.private.workflows.remove)
  const deactivateWorkflow = useMutation(api.private.workflows.deactivate)

  const [filter, setFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [renaming, setRenaming] = useState<WorkflowRow | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleting, setDeleting] = useState<WorkflowRow | null>(null)
  const [busy, setBusy] = useState(false)

  const rows = useMemo(() => workflows ?? [], [workflows])
  const live = rows.find((workflow) => workflow.isActive) ?? null
  const counts = useMemo(() => {
    const next: Record<StatusFilter, number> = {
      all: rows.length,
      live: 0,
      published: 0,
      draft: 0,
    }

    for (const workflow of rows) {
      next[statusOf(workflow)] += 1
    }

    return next
  }, [rows])

  const query = search.trim().toLowerCase()
  const visible = rows.filter(
    (workflow) =>
      (filter === "all" || statusOf(workflow) === filter) &&
      (!query ||
        workflow.name.toLowerCase().includes(query) ||
        workflow.description?.toLowerCase().includes(query))
  )

  const handleRename = async () => {
    if (!renaming || busy || !renameValue.trim()) return

    setBusy(true)
    try {
      await renameWorkflow({ workflowId: renaming.id, name: renameValue })
      toast.success("Workflow renamed")
      setRenaming(null)
    } catch (error) {
      toast.error(readableError(error, "Could not rename that workflow."))
    } finally {
      setBusy(false)
    }
  }

  const handleDuplicate = async (workflow: WorkflowRow) => {
    if (busy) return

    setBusy(true)
    try {
      const copy = await duplicateWorkflow({ workflowId: workflow.id })
      toast.success(`${workflow.name} duplicated`)
      router.push(`/workflows/${copy.id as Id<"workflows">}`)
    } catch (error) {
      toast.error(readableError(error, "Could not duplicate that workflow."))
    } finally {
      setBusy(false)
    }
  }

  const handleTakeOffline = async (workflow: WorkflowRow) => {
    if (busy) return

    setBusy(true)
    try {
      await deactivateWorkflow({ workflowId: workflow.id })
      toast.success(`${workflow.name} is no longer answering conversations`)
    } catch (error) {
      toast.error(readableError(error, "Could not take that workflow offline."))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting || busy) return

    setBusy(true)
    try {
      await removeWorkflow({ workflowId: deleting.id })
      toast.success(`${deleting.name} deleted`)
      setDeleting(null)
    } catch (error) {
      toast.error(readableError(error, "Could not delete that workflow."))
    } finally {
      setBusy(false)
    }
  }

  const newWorkflowButton = (
    <Button asChild size="sm">
      <Link href="/workflows/new">
        <PlusIcon data-icon="inline-start" />
        New workflow
      </Link>
    </Button>
  )

  return (
    <ConsolePage width="wide">
      <div className="report">
        {/* Hero: which flow is answering, and how to make another. */}
        <section className="pt-2 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="console-eyebrow">Workflows</p>
            {rows.length ? (
              <div className="flex items-center gap-2">
                <CreateWithAiDialog
                  trigger={
                    <Button size="sm" variant="ghost">
                      <SparklesIcon data-icon="inline-start" />
                      Draft with AI
                    </Button>
                  }
                />
                {newWorkflowButton}
              </div>
            ) : null}
          </div>

          {workflows === undefined ? (
            <div className="mt-6 space-y-4" aria-hidden>
              <div className="h-12 w-2/3 max-w-xl animate-pulse rounded-xl bg-muted" />
              <div className="h-5 w-full max-w-lg animate-pulse rounded-full bg-muted" />
            </div>
          ) : rows.length === 0 ? (
            <>
              <h1 className="report-headline mt-6 max-w-[20ch]">
                Answer common questions with a flow you design.
              </h1>
              <p className="report-lede mt-5 max-w-[60ch]">
                A workflow is a conversation you plan step by step — greet the
                visitor, offer buttons, collect their phone number, hand over to
                your team. Publish it and it answers every new chat in your
                widget.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <CreateWithAiDialog
                  trigger={
                    <Button size="lg">
                      <SparklesIcon data-icon="inline-start" />
                      Describe it, AI drafts it
                    </Button>
                  }
                />
                <Button asChild size="lg" variant="outline">
                  <Link href="/workflows/new">
                    <PlusIcon data-icon="inline-start" />
                    Start from a blank canvas
                  </Link>
                </Button>
              </div>
            </>
          ) : live ? (
            <>
              <h1 className="report-headline mt-6 max-w-[24ch]">
                <span className="report-headline-figure">{live.name}</span> is
                answering your conversations.
              </h1>
              <p className="report-lede mt-5 max-w-[62ch]">
                Every new chat in your widget runs through it.{" "}
                {rows.length > 1 ? (
                  <>
                    <strong>{rows.length - 1}</strong> other{" "}
                    {plural(rows.length - 1, "workflow waits", "workflows wait")}{" "}
                    until you publish {plural(rows.length - 1, "it", "one")}{" "}
                    in its place.
                  </>
                ) : (
                  <>Duplicate it to try changes without touching what visitors see.</>
                )}
              </p>
            </>
          ) : (
            <>
              <h1 className="report-headline mt-6 max-w-[22ch]">
                None of your workflows is answering yet.
              </h1>
              <p className="report-lede mt-5 max-w-[62ch]">
                You have <strong>{rows.length}</strong>{" "}
                {plural(rows.length, "workflow", "workflows")}, but your
                assistant still handles every chat on its own. Open one and press{" "}
                <strong>Publish</strong> to put it in front of visitors.
              </p>
            </>
          )}
        </section>

        {workflows === undefined ? (
          <SkeletonRows count={4} />
        ) : rows.length ? (
          <>
            <div className="flex flex-col gap-4 border-b border-[var(--report-rule)] sm:flex-row sm:items-end sm:justify-between">
              <div
                aria-label="Filter workflows"
                className="report-filters"
                role="group"
              >
                {FILTERS.map(({ id, label }) => (
                  <ReportFilter
                    active={filter === id}
                    count={counts[id]}
                    key={id}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                  </ReportFilter>
                ))}
              </div>
              <ConsoleSearch
                aria-label="Search workflows"
                className="mb-3 w-full sm:w-72"
                onChange={setSearch}
                placeholder="Search by name or description"
                value={search}
              />
            </div>

            {visible.length ? (
              <ul className="pb-6">
                {visible.map((workflow) => {
                  const status = statusOf(workflow)

                  return (
                    <li
                      className="workflows-row grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-2 py-4 lg:grid-cols-[2.5rem_minmax(0,1.6fr)_minmax(0,1fr)_9rem_auto]"
                      key={workflow.id}
                    >
                      <span className="workflows-medallion size-10" aria-hidden>
                        <WorkflowIcon className="size-[18px]" />
                      </span>

                      <Link
                        className="workflows-row-link min-w-0"
                        href={`/workflows/${workflow.id}`}
                      >
                        <span className="block truncate text-[0.95rem] font-medium text-foreground">
                          {workflow.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {workflow.description || "No description"}
                        </span>
                      </Link>

                      <p className="col-span-2 col-start-2 flex min-w-0 items-center gap-2 text-xs lg:col-span-1 lg:col-start-auto">
                        <span className="workflows-status-dot" data-status={status} />
                        <span
                          className={
                            status === "live"
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {STATUS_LABEL[status]}
                        </span>
                        <span className="hidden truncate text-muted-foreground xl:inline">
                          · {STATUS_HINT[status]}
                        </span>
                      </p>

                      <p className="hidden text-xs text-muted-foreground lg:block">
                        Edited{" "}
                        {formatDistanceToNow(workflow.updatedAt, {
                          addSuffix: true,
                        })}
                      </p>

                      <div className="col-start-3 row-start-1 flex items-center justify-end gap-1 lg:col-start-auto lg:row-start-auto">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/workflows/${workflow.id}`}>
                            <span className="hidden sm:inline">Open</span>
                            <span className="sr-only sm:hidden">
                              Open {workflow.name}
                            </span>
                            <ArrowUpRightIcon data-icon="inline-end" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-label={`More actions for ${workflow.name}`}
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setRenaming(workflow)
                                setRenameValue(workflow.name)
                              }}
                            >
                              <PencilIcon className="size-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={busy}
                              onClick={() => void handleDuplicate(workflow)}
                            >
                              <CopyIcon className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {workflow.isActive ? (
                              <DropdownMenuItem
                                disabled={busy}
                                onClick={() => void handleTakeOffline(workflow)}
                              >
                                <PowerOffIcon className="size-4" />
                                Take offline
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={workflow.isActive}
                              onClick={() => setDeleting(workflow)}
                              variant="destructive"
                            >
                              <TrashIcon className="size-4" />
                              {workflow.isActive
                                ? "Take offline to delete"
                                : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <ReportQuiet>
                {query
                  ? `No workflow matches “${search.trim()}”.`
                  : filter === "live"
                    ? "No workflow is live right now."
                    : filter === "published"
                      ? "No published workflow is waiting on the side."
                      : "No drafts — everything here has been published."}{" "}
                <button
                  className="text-foreground underline underline-offset-4"
                  onClick={() => {
                    setFilter("all")
                    setSearch("")
                  }}
                  type="button"
                >
                  Show all
                </button>
              </ReportQuiet>
            )}
          </>
        ) : null}
      </div>

      <Dialog
        onOpenChange={(open) => !open && setRenaming(null)}
        open={renaming !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename workflow</DialogTitle>
            <DialogDescription>
              Only your team sees this name. Visitors never do.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleRename()
            }}
            placeholder="Workflow name"
            value={renameValue}
          />
          <DialogFooter>
            <Button onClick={() => setRenaming(null)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={busy || !renameValue.trim()}
              onClick={() => void handleRename()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => !open && setDeleting(null)}
        open={deleting !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleting?.name}?</DialogTitle>
            <DialogDescription>
              This removes the workflow with its replays and traffic numbers.
              Conversations it already had stay in your inbox. It cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleting(null)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={busy}
              onClick={() => void handleDelete()}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConsolePage>
  )
}
