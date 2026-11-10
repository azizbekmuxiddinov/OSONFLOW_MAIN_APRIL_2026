"use client"

import { useMemo, useState } from "react"
import { ChartColumnBigIcon } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { ReportQuiet } from "./report"

/**
 * Conversations over time, as stacked columns: each column is a day (or a week
 * on long ranges) split into how those conversations ended. Hover, or focus
 * the chart and use the arrow keys, to read one column; the table view holds
 * the same numbers without the chart.
 */

export type ActivityDay = {
  /** Local midnight of the day. */
  day: number
  resolved: number
  handed: number
  open: number
}

type Outcome = "resolved" | "handed" | "open"

// Stack order, bottom to top. Colour follows the outcome everywhere on the
// page, so the waffle, the channel bars and this chart all agree.
const SERIES: { key: Outcome; label: string; short: string }[] = [
  { key: "resolved", label: "Resolved by the assistant", short: "Resolved" },
  { key: "handed", label: "Handed to your team", short: "Handed over" },
  { key: "open", label: "Still open", short: "Still open" },
]

/** Past this many days the columns become weeks, so each stays readable. */
const WEEKLY_FROM_DAYS = 45

const totalOf = (bucket: ActivityDay) =>
  bucket.resolved + bucket.handed + bucket.open

const shortDate = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(
    timestamp
  )

const longDate = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(timestamp)

/**
 * The smallest "clean" axis top at or above the tallest column. It is always
 * even, so the halfway gridline lands on a whole number too.
 */
const niceMax = (value: number) => {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 3, 4, 5, 6, 8, 10].find(
    (candidate) =>
      candidate * magnitude >= value && (candidate * magnitude) % 2 === 0
  )
  return (step ?? 10) * magnitude
}

type Bucket = ActivityDay & { label: string; isCurrent: boolean }

const toBuckets = (daily: ActivityDay[]): { buckets: Bucket[]; isWeekly: boolean } => {
  if (daily.length <= WEEKLY_FROM_DAYS) {
    return {
      isWeekly: false,
      buckets: daily.map((day, index) => ({
        ...day,
        label: longDate(day.day),
        isCurrent: index === daily.length - 1,
      })),
    }
  }

  // Weeks are counted back from today, so the last column always ends today
  // and only the oldest one can be short.
  const buckets: Bucket[] = []
  for (let end = daily.length; end > 0; end -= 7) {
    const slice = daily.slice(Math.max(0, end - 7), end)
    const first = slice[0]!
    const last = slice[slice.length - 1]!
    buckets.unshift({
      day: first.day,
      resolved: slice.reduce((sum, day) => sum + day.resolved, 0),
      handed: slice.reduce((sum, day) => sum + day.handed, 0),
      open: slice.reduce((sum, day) => sum + day.open, 0),
      label:
        slice.length > 1
          ? `${shortDate(first.day)} – ${shortDate(last.day)}`
          : shortDate(first.day),
      isCurrent: end === daily.length,
    })
  }

  return { buckets, isWeekly: true }
}

export const ActivityChart = ({
  daily,
  view = "chart",
  className,
}: {
  daily: ActivityDay[]
  view?: "chart" | "table"
  className?: string
}) => {
  const [active, setActive] = useState<number | null>(null)
  const { buckets, isWeekly } = useMemo(() => toBuckets(daily), [daily])

  const grandTotal = buckets.reduce((sum, bucket) => sum + totalOf(bucket), 0)

  if (!buckets.length || grandTotal === 0) {
    return (
      <ReportQuiet className={className} icon={ChartColumnBigIcon}>
        No conversations in this period yet. Each day gets a column here as
        soon as customers start writing in.
      </ReportQuiet>
    )
  }

  const tallest = Math.max(...buckets.map(totalOf))
  const top = niceMax(tallest)
  const ticks = [top, top / 2, 0]
  const peak = buckets.reduce((best, bucket) =>
    totalOf(bucket) > totalOf(best) ? bucket : best
  )
  const perColumn = grandTotal / buckets.length
  const averageLabel =
    perColumn >= 10 ? Math.round(perColumn) : Math.round(perColumn * 10) / 10
  // Whole phrases rather than a word dropped into a sentence, so each one
  // can be translated as written.
  const copy = isWeekly
    ? {
        average: "a week on average",
        busiest: `Busiest week ${peak.label} with ${totalOf(peak)}`,
        column: "Week",
        latest: "This week",
        summary: `Conversations per week, ${grandTotal} in total. Use the arrow keys to read each week.`,
      }
    : {
        average: "a day on average",
        busiest: `Busiest day ${peak.label} with ${totalOf(peak)}`,
        column: "Day",
        latest: "Today",
        summary: `Conversations per day, ${grandTotal} in total. Use the arrow keys to read each day.`,
      }

  if (view === "table") {
    return (
      <div className={cn("report-activity-table", className)}>
        <table>
          <thead>
            <tr>
              <th scope="col">{copy.column}</th>
              {SERIES.map((series) => (
                <th key={series.key} scope="col">
                  {series.short}
                </th>
              ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {[...buckets].reverse().map((bucket) => (
              <tr key={bucket.day}>
                <th scope="row">{bucket.label}</th>
                {SERIES.map((series) => (
                  <td key={series.key}>{bucket[series.key]}</td>
                ))}
                <td>{totalOf(bucket)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const last = buckets.length - 1
  const activeBucket = active === null ? null : buckets[active]
  // The readout sits beside the column it describes, on whichever side has
  // room, so it never covers the column being read.
  const readoutStyle: React.CSSProperties =
    active === null
      ? {}
      : active < buckets.length / 2
        ? { left: `calc(${((active + 0.5) / buckets.length) * 100}% + 20px)` }
        : {
            right: `calc(${((buckets.length - active - 0.5) / buckets.length) * 100}% + 20px)`,
          }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      const step = event.key === "ArrowLeft" ? -1 : 1
      setActive((current) =>
        current === null ? last : Math.min(last, Math.max(0, current + step))
      )
    }
    if (event.key === "Escape") setActive(null)
  }

  return (
    <figure className={cn("w-full", className)}>
      <figcaption className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="report-figure-value">
            {averageLabel}{" "}
            <span className="text-base font-normal tracking-normal text-muted-foreground">
              {copy.average}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.busiest}</p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {SERIES.map((series) => (
            <li
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              key={series.key}
            >
              <span className="report-swatch" data-outcome={series.key} />
              {series.label}
            </li>
          ))}
        </ul>
      </figcaption>

      <div className="report-activity">
        <div aria-hidden className="report-activity-axis">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div
          aria-label={copy.summary}
          className="report-activity-plot"
          data-active={active === null ? undefined : ""}
          onBlur={() => setActive(null)}
          onFocus={() => setActive((current) => current ?? last)}
          onKeyDown={handleKeyDown}
          onMouseLeave={() => setActive(null)}
          role="group"
          tabIndex={0}
        >
          <div aria-hidden className="report-activity-grid">
            {ticks.map((tick) => (
              <span key={tick} />
            ))}
          </div>

          <div className="report-activity-columns">
            {buckets.map((bucket, index) => {
              const total = totalOf(bucket)

              return (
                <div
                  className="report-activity-slot"
                  data-active={active === index ? "" : undefined}
                  key={bucket.day}
                  onMouseEnter={() => setActive(index)}
                >
                  {total > 0 ? (
                    <div
                      className="report-activity-stack"
                      style={
                        {
                          height: `${(total / top) * 100}%`,
                          "--i": index,
                        } as React.CSSProperties
                      }
                    >
                      {SERIES.filter((series) => bucket[series.key] > 0).map(
                        (series) => (
                          <span
                            data-outcome={series.key}
                            key={series.key}
                            style={{ flexGrow: bucket[series.key] }}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="report-activity-zero" />
                  )}
                </div>
              )
            })}
          </div>

          {activeBucket && active !== null ? (
            <div
              className="report-activity-readout"
              role="status"
              style={readoutStyle}
            >
              <p className="text-[11px] font-medium text-muted-foreground">
                {activeBucket.label}
              </p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {SERIES.map((series) => (
                  <li
                    className="flex items-center gap-2 text-xs"
                    key={series.key}
                  >
                    <span className="report-activity-key" data-outcome={series.key} />
                    <span className="w-6 font-semibold text-foreground tabular-nums">
                      {activeBucket[series.key]}
                    </span>
                    <span className="text-muted-foreground">{series.label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 border-t border-[var(--report-rule)] pt-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">
                  {totalOf(activeBucket)}
                </span>{" "}
                in total
              </p>
            </div>
          ) : null}
        </div>

        <div aria-hidden className="report-activity-dates">
          <span>{shortDate(buckets[0]!.day)}</span>
          {buckets.length > 8 ? (
            <span>{shortDate(buckets[Math.floor(last / 2)]!.day)}</span>
          ) : null}
          <span>{copy.latest}</span>
        </div>
      </div>
    </figure>
  )
}

/**
 * The same days as a strip of tiny columns, for a figure cell. It has no axis
 * or hover of its own: the number beside it is the reading.
 */
export const ActivitySpark = ({
  daily,
  className,
}: {
  daily: ActivityDay[]
  className?: string
}) => {
  const totals = daily.map(totalOf)
  const max = Math.max(1, ...totals)

  return (
    <span aria-hidden className={cn("report-spark", className)}>
      {totals.map((total, index) => (
        <span
          data-current={index === totals.length - 1 ? "" : undefined}
          data-empty={total ? undefined : ""}
          key={daily[index]!.day}
          style={{ height: total ? `${Math.max(12, (total / max) * 100)}%` : undefined }}
        />
      ))}
    </span>
  )
}
