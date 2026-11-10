"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import "../styles/report.css"
import { SubnavToggle } from "./shell/subnav-toggle"

/**
 * Console primitives — the shared shell for every dashboard tab outside the
 * Workflows builder and the Conversations inbox.
 *
 * Everything here is presentational. Views keep their own data logic and hand
 * these components content, so the whole console stays visually uniform without
 * any page having to re-derive spacing, radii or type scale.
 */

export type ConsoleTone =
  | "neutral"
  | "accent"
  | "positive"
  | "warning"
  | "critical"
  | "info"

export const toneClass: Record<ConsoleTone, string> = {
  neutral: "console-tone-neutral",
  accent: "console-tone-accent",
  positive: "console-tone-positive",
  warning: "console-tone-warning",
  critical: "console-tone-critical",
  info: "console-tone-info",
}

type IconType = React.ComponentType<{ className?: string }>

/* ── page shell ─────────────────────────────────────────────────────────── */

export const ConsolePage = ({
  children,
  className,
  width = "default",
}: {
  children: React.ReactNode
  className?: string
  /** `wide` for editor-style pages that want the full viewport. */
  width?: "default" | "wide" | "narrow"
}) => (
  <div className="console-page h-full min-h-0 overflow-x-hidden overflow-y-auto">
    <div
      className={cn(
        "dash-page-body dash-stagger mx-auto flex w-full min-w-0 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-7",
        width === "default" && "max-w-[1400px]",
        width === "wide" && "max-w-[1600px]",
        width === "narrow" && "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  </div>
)

/* ── page header ────────────────────────────────────────────────────────── */

export const ConsoleHeader = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: {
  icon?: IconType
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Small facts rendered under the description — use `ConsoleMeta`. */
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) => (
  <>
    {/* `icon` stays in the signature so callers keep compiling; the bar does
        not draw a medallion beside the title. */}
    <header
      className={cn("dash-topbar", className)}
      data-icon={Icon ? "" : undefined}
    >
      <div className="flex min-w-0 items-center gap-2">
        <SubnavToggle className="-ml-1.5" />
        <h1 className="dash-topbar-title">{title}</h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
    {eyebrow || description || meta ? (
      <div className="min-w-0">
        {eyebrow ? <p className="console-eyebrow mb-1.5">{eyebrow}</p> : null}
        {description ? <p className="dash-page-lede">{description}</p> : null}
        {meta ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {meta}
          </div>
        ) : null}
      </div>
    ) : null}
  </>
)

/** A single label/value fact for `ConsoleHeader`'s `meta` slot. */
export const ConsoleMeta = ({
  label,
  value,
  tone = "neutral",
  dot = false,
}: {
  label: string
  value: React.ReactNode
  tone?: ConsoleTone
  dot?: boolean
}) => (
  <span className="flex items-center gap-2 text-xs">
    {dot ? (
      <span className={cn("console-dot", toneClass[tone])} aria-hidden />
    ) : null}
    <span className="text-muted-foreground">{label}</span>
    <span className="console-numeral text-xs">{value}</span>
  </span>
)

/* ── stats ──────────────────────────────────────────────────────────────── */

export const StatGrid = ({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}) => (
  <section
    className={cn(
      "report-strip grid",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-2 xl:grid-cols-4",
      className
    )}
  >
    {children}
  </section>
)

export const Stat = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  progress,
  flat = false,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: IconType
  tone?: ConsoleTone
  /** 0–100. Renders a hairline meter under the value. */
  progress?: number
  /** Use inside a Panel, where a second card shadow would read as clutter. */
  flat?: boolean
  className?: string
}) => (
  <div
    className={cn(
      flat ? "console-inset" : "bg-card",
      "px-4 py-3.5 sm:px-5",
      className
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <p className="console-label truncate">{label}</p>
      {Icon ? (
        <span
          className={cn(
            "shrink-0 opacity-80",
            tone === "neutral" || tone === "accent"
              ? "text-muted-foreground"
              : toneClass[tone]
          )}
        >
          <Icon className="size-3.5" />
        </span>
      ) : null}
    </div>

    <p className="console-numeral mt-2.5 text-[1.6rem] leading-none sm:text-[1.75rem]">
      {value}
    </p>

    {typeof progress === "number" ? (
      <div className={cn("console-meter mt-3", toneClass[tone])}>
        <div
          className="console-meter-fill"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    ) : null}

    {hint ? (
      <p className="mt-2.5 text-xs leading-snug text-muted-foreground">{hint}</p>
    ) : null}
  </div>
)

/* ── panels ─────────────────────────────────────────────────────────────── */

export const Panel = ({
  children,
  className,
  quiet = false,
}: {
  children: React.ReactNode
  className?: string
  quiet?: boolean
}) => (
  <section
    className={cn(
      quiet ? "console-card-quiet" : "console-card",
      "min-w-0 overflow-hidden",
      className
    )}
  >
    {children}
  </section>
)

export const PanelHeader = ({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: IconType
  actions?: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "flex flex-col gap-2 border-b border-[var(--console-hairline-soft)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",
      className
    )}
  >
    <div className="flex min-w-0 items-start gap-3">
      {Icon ? (
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      ) : null}
      <div className="min-w-0">
        <h2 className="console-section-title truncate">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    ) : null}
  </div>
)

export const PanelBody = ({
  children,
  className,
  flush = false,
}: {
  children: React.ReactNode
  className?: string
  flush?: boolean
}) => (
  <div className={cn(!flush && "px-4 py-4 sm:px-5 sm:py-5", className)}>
    {children}
  </div>
)

/* ── tabs ───────────────────────────────────────────────────────────────── */

/** Wrap a `TabsList` in this to get the segmented-control treatment. */
export const consoleTabsListClass =
  "console-segment flex w-full min-w-0 justify-start gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] group-data-horizontal/tabs:h-auto [&::-webkit-scrollbar]:hidden"

export const consoleTabsTriggerClass =
  "console-segment-item h-8 flex-none gap-1.5 border border-transparent px-3 text-[0.8rem] font-medium data-active:shadow-none"

/** Count chip for a tab trigger. */
export const TabCount = ({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: ConsoleTone
}) => (
  <span
    className={cn(
      "console-numeral console-tone-wash ml-0.5 rounded-full border px-1.5 py-px text-[0.68rem] leading-4",
      toneClass[tone]
    )}
  >
    {children}
  </span>
)

/* ── smaller pieces ─────────────────────────────────────────────────────── */

export const ConsoleSearch = ({
  value,
  onChange,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  "aria-label"?: string
}) => (
  <div className={cn("relative min-w-0", className)}>
    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
    <input
      aria-label={ariaLabel ?? placeholder}
      className="console-inset h-9 w-full rounded-[10px] pr-8 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
    {value ? (
      <button
        aria-label="Clear search"
        className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
        onClick={() => onChange("")}
        type="button"
      >
        <XIcon className="size-3.5" />
      </button>
    ) : null}
  </div>
)

/** Read-only key/value chip used across cards. */
export const Pill = ({
  children,
  tone = "neutral",
  icon: Icon,
  className,
}: {
  children: React.ReactNode
  tone?: ConsoleTone
  icon?: IconType
  className?: string
}) => (
  <span
    className={cn(
      "console-tone-wash inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.72rem] leading-4 font-medium",
      toneClass[tone],
      className
    )}
  >
    {Icon ? <Icon className="size-3 shrink-0" /> : null}
    <span className="truncate text-foreground/85">{children}</span>
  </span>
)

export const Meter = ({
  value,
  tone = "accent",
  className,
}: {
  value: number
  tone?: ConsoleTone
  className?: string
}) => (
  <div className={cn("console-meter", toneClass[tone], className)}>
    <div
      className="console-meter-fill"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
)

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: IconType
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center",
      className
    )}
  >
    {Icon ? (
      <span className="dash-empty-mark">
        <Icon className="size-5" />
      </span>
    ) : null}
    <p className="mt-4 text-sm font-semibold tracking-[-0.01em] text-foreground">
      {title}
    </p>
    {description ? (
      <p className="mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-pretty text-muted-foreground">
        {description}
      </p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
)

/* ── loading ────────────────────────────────────────────────────────────── */

export const ConsoleSkeleton = ({
  stats = 4,
  rows = 4,
}: {
  stats?: number
  rows?: number
}) => (
  <ConsolePage>
    <div className="dash-topbar">
      <Skeleton className="h-5 w-40 rounded-md" />
      <Skeleton className="hidden h-8 w-28 rounded-lg sm:block" />
    </div>
    <Skeleton className="h-3 w-full max-w-md rounded-full" />
    {stats > 0 ? (
      <div className="report-strip grid grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: stats }).map((_, index) => (
          <div className="flex flex-col gap-2.5 px-4 py-4 sm:px-5" key={index}>
            <Skeleton className="h-7 w-14 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-2.5 w-32 max-w-full rounded-full" />
          </div>
        ))}
      </div>
    ) : null}
    {/* Outlined panels with a few lines in them, the way the loaded page is
        built, rather than solid grey blocks. */}
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="report-panel space-y-3 px-5 py-4" key={index}>
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-2.5 w-56 max-w-full rounded-full" />
          <div className="space-y-2.5 pt-2">
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-4/5 rounded-full" />
            <Skeleton className="h-3 w-2/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </ConsolePage>
)
