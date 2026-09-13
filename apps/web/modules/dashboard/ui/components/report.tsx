import type * as React from "react"

/**
 * Report primitives — the editorial layout shared by Analytics, Customer
 * memory and the Knowledge base. Styles live in `styles/report.css`, which the
 * page importing these must also import.
 */

/** A numbered section whose heading stays pinned beside its content. */
export const ReportSection = ({
  index,
  title,
  lede,
  children,
}: {
  index: number
  title: string
  lede: string
  children: React.ReactNode
}) => (
  <section className="report-section grid gap-6 py-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
    <header className="lg:sticky lg:top-6 lg:self-start">
      <p className="report-section-index">{String(index).padStart(2, "0")}</p>
      <h2 className="report-section-title mt-2">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {lede}
      </p>
    </header>
    <div className="min-w-0">{children}</div>
  </section>
)

/** The in-section empty line: a sentence, never a box. */
export const ReportQuiet = ({ children }: { children: React.ReactNode }) => (
  <p className="py-6 text-sm text-muted-foreground">{children}</p>
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
