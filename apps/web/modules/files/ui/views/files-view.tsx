"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"
import {
  useAction,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import type { PublicFile } from "@workspace/backend/private/files"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ArrowUpIcon,
  BookmarkIcon,
  BookOpenIcon,
  CircleCheckIcon,
  EyeIcon,
  LibraryIcon,
  RepeatIcon,
  TriangleAlertIcon,
  FileIcon,
  FileTextIcon,
  GlobeIcon,
  Loader2Icon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import { UploadDialog } from "../components/upload-dialog"
import { useMemo, useState } from "react"
import { DeleteFileDialog } from "../components/delete-file-dialog"
import { toast } from "sonner"
import {
  ConsolePage,
  ConsoleSearch,
} from "@/modules/dashboard/ui/components/console"
import { KnowledgeSkeleton } from "@/modules/dashboard/ui/components/report-skeleton"
import {
  FigureStrip,
  PageBar,
  ReportFilter,
  ReportQuiet,
  ReportSection,
  StripFigure,
} from "@/modules/dashboard/ui/components/report"
import "@/modules/dashboard/ui/styles/report.css"
import "../styles/knowledge.css"

type ViewerPayload =
  | { kind: "text"; filename: string; sourceUrl?: string; content: string }
  | {
      kind: "document"
      filename: string
      sourceUrl?: string
      url: string | null
    }

type KnowledgeTestResult = {
  answer: string
  confidence: number
  supportLevel: "strong" | "partial" | "weak" | "none"
  reason: string
  sources: {
    title: string
    filename?: string
    category?: string
    sourceUrl?: string
    score: number
  }[]
}

type AIReplyCacheStats = {
  entryCount: number
  hitCount: number
  semanticIndexedCount: number
  lastUsedAt: number | null
}

const UNCATEGORISED = "Other sources"

// ─── helpers ──────────────────────────────────────────────────────────────────

function SourceFileIcon({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  if (type === "url") {
    return <GlobeIcon className={className} />
  }

  if (type === "pdf") {
    return <FileTextIcon className={className} />
  }

  return <FileIcon className={className} />
}

const STATUS_COPY: Record<
  PublicFile["status"],
  { label: string; hint: string }
> = {
  ready: {
    label: "Ready",
    hint: "Your assistant can answer from this source.",
  },
  processing: {
    label: "Reading…",
    hint: "Still being read — it will be usable in a moment.",
  },
  error: {
    label: "Failed",
    hint: "This source couldn't be read. Delete it and add it again.",
  },
}

const SUPPORT_COPY: Record<KnowledgeTestResult["supportLevel"], string> = {
  strong: "Well supported by your sources",
  partial: "Partly supported by your sources",
  weak: "Barely supported — consider adding a source",
  none: "Not in your sources yet",
}

const formatDateTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp))

// ─── ask ──────────────────────────────────────────────────────────────────────

function AskKnowledge({
  onAsk,
  result,
  isAsking,
  disabled,
}: {
  onAsk: (question: string) => Promise<void>
  result: KnowledgeTestResult | null
  isAsking: boolean
  disabled: boolean
}) {
  const [question, setQuestion] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onAsk(question)
  }

  return (
    <div>
      <form
        className="knowledge-ask glass flex items-center gap-2 py-1.5 pr-1.5 pl-4"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="knowledge-question">
          Ask your knowledge base a customer question
        </label>
        <input
          disabled={disabled || isAsking}
          id="knowledge-question"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={
            disabled
              ? "Add a source first, then ask it a question"
              : "Ask a question a customer would ask"
          }
          value={question}
        />
        <Button
          aria-label="Ask"
          className="size-9 shrink-0"
          disabled={disabled || isAsking || !question.trim()}
          size="icon"
          type="submit"
        >
          {isAsking ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <ArrowUpIcon className="size-4" />
          )}
        </Button>
      </form>

      {result ? (
        <div
          aria-live="polite"
          className="knowledge-answer mt-4 grid gap-4"
          key={result.answer}
        >
          <div className="min-w-0">
            <div
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
              style={{ color: `var(--support-${result.supportLevel})` }}
            >
              <p className="text-sm font-medium text-foreground">
                {SUPPORT_COPY[result.supportLevel]}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="console-numeral text-foreground">
                  {result.confidence}%
                </span>{" "}
                confident
              </p>
              <div
                aria-hidden
                className="knowledge-confidence mt-2 w-full basis-full"
              >
                <span style={{ width: `${result.confidence}%` }} />
              </div>
            </div>
            <p className="knowledge-answer-text mt-3">{result.answer}</p>
            {result.reason ? (
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Why: {result.reason}
              </p>
            ) : null}
          </div>

          <div className="min-w-0">
            <p className="console-label">Drawn from</p>
            {result.sources.length ? (
              <ol className="mt-2">
                {result.sources.slice(0, 5).map((source, index) => (
                  <li
                    className="knowledge-footnote grid grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-2 py-2"
                    key={`${source.title}-${index}`}
                  >
                    <span className="pt-0.5 text-[0.7rem] font-semibold tabular-nums text-primary">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm text-foreground">
                        {source.title}
                      </span>
                      {source.category || source.sourceUrl ? (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {source.category || source.sourceUrl}
                        </span>
                      ) : null}
                    </span>
                    <span className="console-numeral pt-0.5 text-xs text-muted-foreground">
                      {source.score}%
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No source matched this question.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ─── library ──────────────────────────────────────────────────────────────────

/**
 * Only shown when something needs attention. When every source is ready the
 * headline already says so, and a full-width bar of one colour says nothing.
 */
function SourceHealth({
  ready,
  processing,
  errors,
  total,
}: {
  ready: number
  processing: number
  errors: number
  total: number
}) {
  if (!total || ready === total) {
    return null
  }

  const segments = (
    [
      ["ready", ready],
      ["processing", processing],
      ["error", errors],
    ] as const
  ).filter(([, count]) => count > 0)

  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div
        aria-label={segments
          .map(([status, count]) => `${STATUS_COPY[status].label} ${count}`)
          .join(", ")}
        className="report-stack knowledge-strip w-32 shrink-0"
        role="img"
      >
        {segments.map(([status, count]) => (
          <span
            data-status={status}
            key={status}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>
      {segments.map(([status, count]) => (
        <span
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          key={status}
        >
          <span className="knowledge-status-dot" data-status={status} />
          {STATUS_COPY[status].label.replace("…", "")}
          <span className="console-numeral text-foreground">{count}</span>
        </span>
      ))}
    </div>
  )
}

function SourceRow({
  file,
  onView,
  onDelete,
}: {
  file: PublicFile
  onView: (file: PublicFile) => void
  onDelete: (file: PublicFile) => void
}) {
  const status = STATUS_COPY[file.status]
  const meta = [
    file.type === "url" ? "Website" : file.type.toUpperCase(),
    file.size !== "unknown" ? file.size : null,
  ].filter(Boolean)

  return (
    <li className="knowledge-row grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 px-2 py-2 sm:grid-cols-[2rem_minmax(0,1fr)_7rem_auto]">
      <span className="knowledge-glyph size-8">
        <SourceFileIcon className="size-4" type={file.type} />
      </span>

      <div className="min-w-0">
        <p
          className="truncate text-sm font-medium text-foreground"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {meta.join(" · ")}
          <span className="flex items-center gap-1.5 sm:hidden">
            <span aria-hidden>·</span>
            <span className="knowledge-status-dot" data-status={file.status} />
            {status.label}
          </span>
        </p>
      </div>

      <p
        className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"
        title={status.hint}
      >
        <span className="knowledge-status-dot" data-status={file.status} />
        <span className={file.status === "ready" ? undefined : "text-foreground"}>
          {status.label}
        </span>
      </p>

      <div className="knowledge-actions flex items-center gap-1">
        <Button
          aria-label={`View ${file.name}`}
          onClick={() => onView(file)}
          size="sm"
          variant="ghost"
        >
          <EyeIcon data-icon="inline-start" />
          <span className="hidden md:inline">View</span>
        </Button>
        <Button
          aria-label={`Delete ${file.name}`}
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(file)}
          size="icon-sm"
          variant="ghost"
        >
          <TrashIcon />
        </Button>
      </div>
    </li>
  )
}

// ─── main view ────────────────────────────────────────────────────────────────

export const FilesView = () => {
  const getViewerContent = useAction(
    (api as any).private.files.getViewerContent
  ) as (args: { entryId: string }) => Promise<ViewerPayload>
  const testKnowledgeBase = useAction(
    (api as any).private.files.testKnowledgeBase
  ) as (args: { question: string }) => Promise<KnowledgeTestResult>
  const clearAIReplyCache = useMutation(
    (api as any).private.files.clearAIReplyCache
  ) as () => Promise<number>
  const cacheStats = useQuery(
    (api as any).private.files.getAIReplyCacheStats
  ) as AIReplyCacheStats | undefined

  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    { initialNumItems: 20 }
  )

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
  } = useInfiniteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 20,
  })

  // ── local ui state ──────────────────────────────────────────────────────
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerFile, setViewerFile] = useState<PublicFile | null>(null)
  const [viewerPayload, setViewerPayload] = useState<ViewerPayload | null>(null)
  const [isViewerLoading, setIsViewerLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<KnowledgeTestResult | null>(null)
  const [isTestingKnowledge, setIsTestingKnowledge] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)

  // ── derived data ────────────────────────────────────────────────────────
  const allFiles = files.results

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const f of allFiles) {
      if (f.category) counts.set(f.category, (counts.get(f.category) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [allFiles])

  const filtered = useMemo(() => {
    let list = allFiles
    if (activeCategory) list = list.filter((f) => f.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q)
      )
    }
    return list
  }, [allFiles, activeCategory, searchQuery])

  // Grouped by category only when browsing everything; a chosen category is
  // already one group, so its heading would just repeat the filter.
  const groups = useMemo(() => {
    if (activeCategory || !categories.length) {
      return [{ name: null as string | null, files: filtered }]
    }

    const byCategory = new Map<string, PublicFile[]>()
    for (const file of filtered) {
      const key = file.category || UNCATEGORISED
      byCategory.set(key, [...(byCategory.get(key) ?? []), file])
    }

    return Array.from(byCategory.entries())
      .sort(([a], [b]) =>
        a === UNCATEGORISED ? 1 : b === UNCATEGORISED ? -1 : a.localeCompare(b)
      )
      .map(([name, list]) => ({ name: name as string | null, files: list }))
  }, [activeCategory, categories.length, filtered])

  const stats = useMemo(() => {
    const total = allFiles.length
    const ready = allFiles.filter((f) => f.status === "ready").length
    const processing = allFiles.filter((f) => f.status === "processing").length
    const errors = allFiles.filter((f) => f.status === "error").length

    return { total, ready, processing, errors }
  }, [allFiles])

  // ── handlers ────────────────────────────────────────────────────────────
  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file)
    setDeleteDialogOpen(true)
  }

  const handleViewClick = async (file: PublicFile) => {
    setViewerFile(file)
    setViewerOpen(true)
    setIsViewerLoading(true)
    setViewerPayload(null)
    try {
      const payload = await getViewerContent({ entryId: file.id })
      setViewerPayload(payload)
    } catch {
      toast.error("Unable to load document preview")
    } finally {
      setIsViewerLoading(false)
    }
  }

  const handleFileDeleted = () => setSelectedFile(null)

  const handleKnowledgeTest = async (question: string) => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      return
    }

    setIsTestingKnowledge(true)
    try {
      const result = await testKnowledgeBase({ question: trimmedQuestion })
      setTestResult(result)
    } catch {
      toast.error("Unable to test the knowledge base")
    } finally {
      setIsTestingKnowledge(false)
    }
  }

  const handleClearCache = async () => {
    setIsClearingCache(true)
    try {
      const deletedCount = await clearAIReplyCache()
      toast.success(
        deletedCount > 0
          ? `Cleared ${deletedCount} cached AI answers.`
          : "AI answer cache is already empty."
      )
    } catch {
      toast.error("Unable to clear AI answer cache")
    } finally {
      setIsClearingCache(false)
    }
  }

  const closeViewer = (open: boolean) => {
    setViewerOpen(open)
    if (!open) {
      setViewerFile(null)
      setViewerPayload(null)
      setIsViewerLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setActiveCategory(null)
  }

  const totalLabel = `${stats.total}${canLoadMore ? "+" : ""}`

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── dialogs ── */}
      <DeleteFileDialog
        file={selectedFile}
        onDeleted={handleFileDeleted}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
      <UploadDialog
        onOpenChange={setUploadDialogOpen}
        open={uploadDialogOpen}
      />

      {/* ── document viewer ── */}
      <Dialog onOpenChange={closeViewer} open={viewerOpen}>
        <DialogContent className="flex h-[90vh] max-w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
          <DialogHeader className="shrink-0 border-b px-6 py-4 pr-14">
            <DialogTitle className="flex items-center gap-2 text-base">
              {viewerFile && (
                <SourceFileIcon
                  className="size-4 shrink-0 text-muted-foreground"
                  type={viewerFile.type}
                />
              )}
              <span className="truncate">
                {viewerFile?.name ?? "Document Viewer"}
              </span>
            </DialogTitle>
            {viewerPayload?.sourceUrl && (
              <DialogDescription className="flex items-center gap-1 truncate text-xs">
                <GlobeIcon className="size-3 shrink-0" />
                <a
                  className="truncate hover:underline"
                  href={viewerPayload.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {viewerPayload.sourceUrl}
                </a>
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="min-h-0 flex-1 bg-muted/35">
            {isViewerLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2Icon className="size-6 animate-spin" />
                <span className="text-sm">Loading preview…</span>
              </div>
            ) : viewerPayload?.kind === "text" ? (
              <div className="h-full overflow-auto p-6">
                <pre className="font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground">
                  {viewerPayload.content}
                </pre>
              </div>
            ) : viewerPayload?.kind === "document" && viewerPayload.url ? (
              <iframe
                className="h-full min-h-0 w-full border-0"
                src={viewerPayload.url}
                title={viewerPayload.filename}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <FileTextIcon className="size-8 opacity-40" />
                <span className="text-sm">
                  No preview available for this document.
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── page ── */}
      {isLoadingFirstPage ? (
        <KnowledgeSkeleton />
      ) : (
      <ConsolePage width="wide">
        <div className="report knowledge flex flex-col gap-4">
          <PageBar
            actions={
              <Button onClick={() => setUploadDialogOpen(true)} size="sm">
                <PlusIcon data-icon="inline-start" />
                Add source
              </Button>
            }
            hint="Price lists, policies, FAQs and web pages your assistant answers from — in your own words, not guesses."
            title="Knowledge base"
          />

          <FigureStrip className="md:grid-cols-3 xl:grid-cols-5">
            <StripFigure
              icon={LibraryIcon}
              label="Sources"
              note="Documents and pages added"
              tone="info"
              value={stats.total ? totalLabel : 0}
            />
            <StripFigure
              icon={CircleCheckIcon}
              label="Ready"
              note="Your assistant answers from these"
              tone="positive"
              value={stats.ready}
            />
            <StripFigure
              icon={TriangleAlertIcon}
              label="Needs attention"
              note="Still being read, or failed"
              tone="warning"
              value={stats.processing + stats.errors}
            />
            <StripFigure
              icon={BookmarkIcon}
              label="Saved answers"
              note="Reused instead of written again"
              tone="accent"
              value={cacheStats?.entryCount ?? "—"}
            />
            <StripFigure
              icon={RepeatIcon}
              label="Times reused"
              note="Answers served from the saved set"
              tone="positive"
              value={cacheStats?.hitCount ?? "—"}
            />
          </FigureStrip>

          {stats.total ? (
            <>

              <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
                <ReportSection
                  flush
                  lede="Every document and web page your assistant searches before it replies. Open one to see exactly what it read."
                  title="Sources"
                >
                  <div className="flex flex-col gap-3 border-b border-[var(--report-rule)] px-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
                    {categories.length ? (
                      <div
                        aria-label="Filter by category"
                        className="report-filters"
                        role="group"
                      >
                        <ReportFilter
                          active={!activeCategory}
                          count={stats.total}
                          onClick={() => setActiveCategory(null)}
                        >
                          All
                        </ReportFilter>
                        {categories.map(([name, count]) => (
                          <ReportFilter
                            active={activeCategory === name}
                            count={count}
                            key={name}
                            onClick={() =>
                              setActiveCategory(
                                activeCategory === name ? null : name
                              )
                            }
                          >
                            {name}
                          </ReportFilter>
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    <ConsoleSearch
                      aria-label="Search sources"
                      className="mb-2.5 w-full sm:w-60"
                      onChange={setSearchQuery}
                      placeholder="Search sources"
                      value={searchQuery}
                    />
                  </div>

                  <div className="px-2 pb-2">
                    <div className="px-2 pt-3">
                      <SourceHealth {...stats} />
                    </div>
                    {filtered.length ? (
                      <>
                        {groups.map((group) => (
                          <div
                            className="knowledge-group"
                            key={group.name ?? "all"}
                          >
                            {group.name ? (
                              <p className="console-label mb-1 flex items-baseline gap-2 px-2">
                                {group.name}
                                <span className="tabular-nums">
                                  {group.files.length}
                                </span>
                              </p>
                            ) : null}
                            <ul className="border-t border-[var(--report-rule)]">
                              {group.files.map((file) => (
                                <SourceRow
                                  file={file}
                                  key={file.id}
                                  onDelete={handleDeleteClick}
                                  onView={(f) => void handleViewClick(f)}
                                />
                              ))}
                            </ul>
                          </div>
                        ))}
                        {canLoadMore ? (
                          <div className="mt-3">
                            <InfiniteScrollTrigger
                              canLoadMore={canLoadMore}
                              isLoadingMore={isLoadingMore}
                              onLoadMore={handleLoadMore}
                              ref={topElementRef}
                            />
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="px-2">
                        <ReportQuiet>
                          Nothing matches
                          {searchQuery.trim()
                            ? ` “${searchQuery.trim()}”`
                            : ""}
                          {activeCategory ? ` in ${activeCategory}` : ""}.{" "}
                          <button
                            className="text-foreground underline underline-offset-4"
                            onClick={resetFilters}
                            type="button"
                          >
                            Show all sources
                          </button>
                        </ReportQuiet>
                      </div>
                    )}
                  </div>
                </ReportSection>

                <div className="flex flex-col gap-4">
                  <ReportSection
                    lede="See the answer your assistant would give, and which sources it used. Nothing is sent to customers."
                    title="Ask your knowledge base"
                  >
                    <AskKnowledge
                      disabled={stats.ready === 0}
                      isAsking={isTestingKnowledge}
                      onAsk={handleKnowledgeTest}
                      result={testResult}
                    />
                  </ReportSection>

                  <ReportSection
                    actions={
                      cacheStats?.entryCount ? (
                        <Button
                          disabled={isClearingCache}
                          onClick={() => void handleClearCache()}
                          size="sm"
                          variant="ghost"
                        >
                          {isClearingCache ? (
                            <Loader2Icon
                              className="animate-spin"
                              data-icon="inline-start"
                            />
                          ) : (
                            <TrashIcon data-icon="inline-start" />
                          )}
                          Clear
                        </Button>
                      ) : null
                    }
                    lede="When customers ask something already answered, your assistant reuses that answer — faster, and cheaper. Saved answers clear themselves whenever your sources change."
                    title="Saved answers"
                  >
                    {cacheStats === undefined ? (
                      <Skeleton className="h-5 w-3/5" />
                    ) : cacheStats.entryCount ? (
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div>
                          <dt className="console-label">Saved</dt>
                          <dd className="console-numeral mt-1">
                            {cacheStats.entryCount}
                          </dd>
                        </div>
                        <div>
                          <dt className="console-label">Reused</dt>
                          <dd className="console-numeral mt-1">
                            {cacheStats.hitCount}
                          </dd>
                        </div>
                        <div>
                          <dt className="console-label">
                            Match different wording
                          </dt>
                          <dd className="console-numeral mt-1">
                            {cacheStats.semanticIndexedCount}
                          </dd>
                        </div>
                        <div>
                          <dt className="console-label">Last reused</dt>
                          <dd className="mt-1 text-xs text-foreground">
                            {cacheStats.lastUsedAt
                              ? formatDateTime(cacheStats.lastUsedAt)
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <ReportQuiet icon={BookmarkIcon}>
                        No saved answers yet. They build up as customers ask
                        similar questions.
                      </ReportQuiet>
                    )}
                  </ReportSection>
                </div>
              </div>
            </>
          ) : (
            <ReportSection title="Teach your assistant what your business knows">
              <ReportQuiet icon={BookOpenIcon}>
                Upload price lists, policies and FAQs, or add pages from your
                website. Your assistant reads them and answers customers from
                your own words — not guesses.
              </ReportQuiet>
              <div className="mt-4 flex justify-center">
                <Button onClick={() => setUploadDialogOpen(true)} size="sm">
                  <PlusIcon data-icon="inline-start" />
                  Add your first source
                </Button>
              </div>
            </ReportSection>
          )}
        </div>
      </ConsolePage>
      )}
    </>
  )
}
