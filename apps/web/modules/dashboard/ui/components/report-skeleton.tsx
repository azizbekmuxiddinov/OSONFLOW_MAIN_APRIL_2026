import type * as React from "react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

import { ConsolePage } from "./console"
import "../styles/report.css"

/**
 * Loading states for the report-layout pages (Analytics, Customer memory,
 * Leads, Knowledge base, Setup & integrations, Data transfer).
 * Setup & integrations loads progressively, so it uses the panel skeleton and
 * skeleton status lines rather than a whole-page one.
 *
 * Each page skeleton is drawn in the same grid as the loaded page — headline,
 * ruled figures, pinned section headers, ruled rows — so nothing jumps when
 * data arrives. Widths are fixed per slot, never random, so a skeleton looks
 * the same on every visit.
 */

/* ── primitives ─────────────────────────────────────────────────────────── */

const Line = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-3.5 rounded-full", className)} />
)

const Frame = ({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) => (
  <ConsolePage width="wide">
    <div aria-busy="true" className={cn("report", className)} role="status">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  </ConsolePage>
)

/** Eyebrow, a two-line headline and a lede — the top of every report page. */
export const SkeletonHero = ({
  aside,
  lede = true,
  className,
}: {
  aside?: React.ReactNode
  lede?: boolean
  className?: string
}) => (
  <section
    className={cn(
      "grid gap-10 pt-2 pb-10",
      aside && "lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-16",
      className
    )}
  >
    <div className="min-w-0">
      <Line className="h-3 w-28" />
      <div className="mt-7 space-y-3">
        <Skeleton className="h-11 w-full max-w-[30rem] rounded-2xl" />
        <Skeleton className="h-11 w-3/5 max-w-[20rem] rounded-2xl" />
      </div>
      {lede ? (
        <div className="mt-6 space-y-2.5">
          <Line className="h-4 w-full max-w-[36rem]" />
          <Line className="h-4 w-4/5 max-w-[26rem]" />
        </div>
      ) : null}
    </div>
    {aside ? <div className="min-w-0">{aside}</div> : null}
  </section>
)

/** The ruled row of large figures. */
export const SkeletonFigures = ({ count = 4 }: { count?: number }) => (
  <div
    className={cn(
      "report-figures grid",
      count === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"
    )}
  >
    {Array.from({ length: count }).map((_, index) => (
      <div
        className="report-figure flex flex-col gap-3 px-1 py-5 sm:px-5 md:first:pl-0"
        key={index}
      >
        <Line className="h-2.5 w-20" />
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Line className="h-3 w-3/4 max-w-[10rem]" />
      </div>
    ))}
  </div>
)

/** A numbered section with its pinned header on the left. */
export const SkeletonSection = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <section className="report-section grid gap-6 py-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
    <div className="space-y-3">
      <Line className="h-2.5 w-6" />
      <Skeleton className="h-5 w-40 rounded-lg" />
      <div className="space-y-2 pt-1">
        <Line className="h-3 w-full max-w-[15rem]" />
        <Line className="h-3 w-3/4 max-w-[11rem]" />
      </div>
    </div>
    <div className="min-w-0">{children}</div>
  </section>
)

/** Ranked bars — label, value and a track. */
export const SkeletonBars = ({ count = 4 }: { count?: number }) => {
  const widths = ["92%", "58%", "41%", "27%", "18%", "12%"]

  return (
    <ul className="flex flex-col">
      {Array.from({ length: count }).map((_, index) => (
        <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2.5 py-3" key={index}>
          <Line className="h-3.5 w-36" />
          <Line className="h-3.5 w-8" />
          <Skeleton
            className="col-span-2 h-2 rounded-full"
            style={{ width: widths[index % widths.length] }}
          />
        </li>
      ))}
    </ul>
  )
}

/** Ruled rows with an optional round avatar and trailing slots. */
export const SkeletonRows = ({
  count = 5,
  avatar = true,
  trailing = 1,
  className,
}: {
  count?: number
  avatar?: boolean
  trailing?: number
  className?: string
}) => {
  const nameWidths = ["w-40", "w-32", "w-44", "w-28", "w-36", "w-24"]
  const metaWidths = ["w-56", "w-44", "w-52", "w-40", "w-48", "w-36"]

  return (
    <ul className={cn("border-t border-[var(--report-rule)]", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <li
          className="flex items-center gap-4 border-b border-[var(--report-rule)] px-2 py-4"
          key={index}
        >
          {avatar ? <Skeleton className="size-10 shrink-0 rounded-full" /> : null}
          <div className="min-w-0 flex-1 space-y-2">
            <Line className={cn("h-3.5 max-w-full", nameWidths[index % 6])} />
            <Line className={cn("h-3 max-w-full", metaWidths[index % 6])} />
          </div>
          {Array.from({ length: trailing }).map((__, slot) => (
            <Line
              className={cn(
                "hidden shrink-0 sm:block",
                slot === trailing - 1 ? "h-8 w-24" : "h-3 w-28"
              )}
              key={slot}
            />
          ))}
        </li>
      ))}
    </ul>
  )
}

/** The underlined filter row with a search field on the right. */
export const SkeletonFilters = ({ count = 4 }: { count?: number }) => {
  const widths = ["w-16", "w-36", "w-24", "w-28"]

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--report-rule)] pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex gap-6 pb-1">
        {Array.from({ length: count }).map((_, index) => (
          <Line className={cn("h-4", widths[index % widths.length])} key={index} />
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-full sm:w-72" />
    </div>
  )
}

/** Numbered step rows, as on Setup and Data transfer. */
export const SkeletonSteps = ({ count = 3 }: { count?: number }) => (
  <ol className="flex flex-col gap-9">
    {Array.from({ length: count }).map((_, index) => (
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4" key={index}>
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-3 pt-1.5">
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Line className="h-3 w-full max-w-[28rem]" />
          {index === 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          ) : null}
        </div>
      </li>
    ))}
  </ol>
)

/* ── page skeletons ─────────────────────────────────────────────────────── */

export const AnalyticsSkeleton = () => (
  <Frame label="Loading analytics">
    <SkeletonHero
      aside={
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
          <div aria-hidden className="report-waffle report-skeleton-pulse shrink-0">
            {Array.from({ length: 100 }).map((_, index) => (
              <span className="report-cell" key={index} />
            ))}
          </div>
          <div className="flex-1 space-y-3 px-2">
            {["w-40", "w-32", "w-24"].map((width) => (
              <div className="flex items-center gap-2.5" key={width}>
                <Skeleton className="size-3 rounded-[3px]" />
                <Line className={cn("h-3", width)} />
              </div>
            ))}
          </div>
        </div>
      }
    />
    <SkeletonFigures />
    <SkeletonSection>
      <SkeletonBars />
    </SkeletonSection>
    <SkeletonSection>
      <SkeletonRows avatar={false} count={3} trailing={0} className="border-t-0" />
    </SkeletonSection>
  </Frame>
)

export const MemorySkeleton = () => (
  <Frame label="Loading customer memory">
    <SkeletonHero />
    <SkeletonFilters />
    <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14">
      <SkeletonRows className="border-t-0" count={6} trailing={1} />
      <div className="hidden min-w-0 lg:block">
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3 pt-1">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Line className="h-3 w-72" />
          </div>
        </div>
        <div className="mt-8 space-y-2.5">
          <Line className="h-4 w-full" />
          <Line className="h-4 w-11/12" />
          <Line className="h-4 w-2/3" />
        </div>
        <div className="mt-8">
          <SkeletonFigures count={3} />
        </div>
        <div className="mt-8">
          <SkeletonRows avatar={false} count={4} trailing={0} />
        </div>
      </div>
    </div>
  </Frame>
)

/** Thirty columns at fixed heights, echoing the arrivals chart. */
const ARRIVAL_HEIGHTS = [
  18, 34, 22, 48, 30, 14, 56, 38, 20, 26, 44, 64, 32, 18, 36, 50, 24, 72, 46,
  30, 16, 34, 58, 42, 22, 38, 52, 80, 60, 44,
]

export const LeadsSkeleton = () => (
  <Frame label="Loading leads">
    <SkeletonHero
      aside={
        <div>
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Line className="mt-2.5 h-3 w-36" />
          <div
            aria-hidden
            className="report-skeleton-pulse mt-4 grid h-[7.5rem] grid-cols-[repeat(30,minmax(0,1fr))] items-end gap-[3px] border-b border-[var(--report-rule)]"
          >
            {ARRIVAL_HEIGHTS.map((height, index) => (
              <div className="flex h-full items-end" key={index}>
                <div
                  className="w-full rounded-t-[4px] bg-[var(--report-track)]"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            <Line className="h-2.5 w-10" />
            <Line className="h-2.5 w-10" />
          </div>
        </div>
      }
    />
    <SkeletonFilters />
    <SkeletonRows className="border-t-0" count={6} trailing={2} />
  </Frame>
)

export const KnowledgeSkeleton = () => (
  <Frame label="Loading knowledge base">
    <section className="pt-2 pb-12">
      <SkeletonHero className="pb-0" />
      <Skeleton className="mt-10 h-[3.75rem] w-full max-w-5xl rounded-full" />
      <Line className="mt-3 ml-6 h-3 w-80 max-w-[70%]" />
    </section>
    <SkeletonSection>
      <SkeletonFilters count={3} />
      <SkeletonRows className="mt-2 border-t-0" count={5} trailing={1} />
    </SkeletonSection>
  </Frame>
)

/** One opened setup panel: its header, description and steps. */
export const SetupPanelSkeleton = () => (
  <div aria-busy="true" className="min-w-0" role="status">
    <span className="sr-only">Loading</span>
    <div className="flex items-center gap-4">
      <Skeleton className="size-14 shrink-0 rounded-full" />
      <div className="space-y-2.5">
        <Skeleton className="h-8 w-52 rounded-xl" />
        <Line className="h-3 w-36" />
      </div>
    </div>
    <div className="mt-6 mb-10 space-y-2.5">
      <Line className="h-4 w-full max-w-[36rem]" />
      <Line className="h-4 w-3/4 max-w-[26rem]" />
    </div>
    <SkeletonSteps />
  </div>
)

export const TransferSkeleton = () => (
  <Frame label="Loading data transfer">
    <SkeletonHero />
    <SkeletonSection>
      <SkeletonSteps count={2} />
    </SkeletonSection>
    <SkeletonSection>
      <SkeletonSteps count={3} />
    </SkeletonSection>
  </Frame>
)
