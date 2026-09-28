import type * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Report primitives — the working layout shared by the data tabs (Analytics,
 * Leads, Customer memory, Knowledge base, Teach, Follow-ups and the setup
 * tabs). Styles live in `styles/report.css`, which the page importing these
 * must also import.
 *
 * Every tab reads the same way: a title with its actions, a row of figures,
 * then panels laid side by side so most of the page is visible at once.
 * Headings sit on their panel, never pinned beside a scrolling column.
 */

type IconType = React.ComponentType<{ className?: string }>

export type ReportTone =
  | "neutral"
  | "accent"
  | "positive"
  | "warning"
  | "critical"
  | "info"

/** The page title, a short description and the page's actions. */
export const PageBar = ({
  title,
  hint,
  meta,
  actions,
  className,
}: {
  title: React.ReactNode
  hint?: React.ReactNode
  /** Status chips shown next to the title. */
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) => (
  <header
    className={cn(
      "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
      className
    )}
  >
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h1 className="report-page-title">{title}</h1>
        {meta}
      </div>
      {hint ? (
        <p className="mt-1.5 max-w-[78ch] text-sm leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
        {actions}
      </div>
    ) : null}
  </header>
)

/** A row of figure cards; pass `StripFigure`s as children. */
export const FigureStrip = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <section className={cn("grid grid-cols-2 gap-3", className)}>
    {children}
  </section>
)

/** Zero, a dash or an empty duration reads as "nothing yet", not as a result. */
const isEmptyFigure = (value: React.ReactNode) =>
  value === 0 ||
  value === "—" ||
  (typeof value === "string" && /^0(%|m| ?min)?$/.test(value.trim()))

export const StripFigure = ({
  label,
  value,
  note,
  icon: Icon,
  tone = "neutral",
  className,
}: {
  label: string
  value: React.ReactNode
  note?: string
  icon?: IconType
  tone?: ReportTone
  className?: string
}) => (
  <div className={cn("report-stat console-card min-w-0 px-4 py-3.5", className)}>
    <div className="flex min-w-0 items-center gap-2">
      {Icon ? (
        <span className="report-stat-icon" data-tone={tone}>
          <Icon className="size-3.5" />
        </span>
      ) : null}
      <p className="truncate text-[0.8rem] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
    <p
      className="report-stat-value mt-2.5"
      data-empty={isEmptyFigure(value) ? "" : undefined}
    >
      {value}
    </p>
    {note ? (
      <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
        {note}
      </p>
    ) : null}
  </div>
)

/** A titled panel. Lay several side by side in a grid or in column stacks. */
export const ReportSection = ({
  title,
  lede,
  actions,
  children,
  className,
  bodyClassName,
  flush = false,
}: {
  title: string
  lede?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  /** No side padding, for lists and tables that run edge to edge. */
  flush?: boolean
}) => (
  <section
    className={cn(
      "report-panel console-card flex min-w-0 flex-col overflow-hidden",
      className
    )}
  >
    <header className="flex items-start justify-between gap-3 px-5 pt-4">
      <div className="min-w-0">
        <h2 className="report-section-title">{title}</h2>
        {lede ? (
          <p className="mt-1 text-[0.8rem] leading-snug text-muted-foreground">
            {lede}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="-mt-0.5 flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
    <div
      className={cn(
        "min-h-0 min-w-0 flex-1",
        flush ? "pt-3" : "px-5 pt-4 pb-5",
        bodyClassName
      )}
    >
      {children}
    </div>
  </section>
)

/** An empty state: a quiet tile with an optional icon, never a bare line. */
export const ReportQuiet = ({
  children,
  icon: Icon,
  className,
}: {
  children: React.ReactNode
  icon?: IconType
  className?: string
}) => (
  <div
    className={cn(
      "report-empty flex flex-col items-center justify-center gap-2.5 px-6 py-7 text-center",
      className
    )}
  >
    {Icon ? (
      <span className="report-empty-icon">
        <Icon className="size-4" />
      </span>
    ) : null}
    <p className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  </div>
)

/** Underlined text filter with a count, for a row of `role="group"` filters. */
export const ReportFilter = ({
  active,
  count,
  children,
  onClick,
}: {
  active: boolean
  count?: number
  children: React.ReactNode
  onClick: () => void
}) => (
  <button
    aria-pressed={active}
    className="report-filter flex shrink-0 items-baseline gap-1.5 text-sm font-medium"
    onClick={onClick}
    type="button"
  >
    {children}
    {count !== undefined ? (
      <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
    ) : null}
  </button>
)
