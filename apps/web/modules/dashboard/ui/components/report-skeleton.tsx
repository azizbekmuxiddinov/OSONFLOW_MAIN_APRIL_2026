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
 * Each page skeleton is drawn in the same grid as the loaded page — page bar,
 * figure strip, panels side by side — so nothing jumps when data arrives.
 * Widths are fixed per slot, never random, so a skeleton looks the same on
 * every visit.
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
    <div
      aria-busy="true"
      className={cn("report flex flex-col gap-4", className)}
      role="status"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  </ConsolePage>
)

/** The page title and its description, actions on the right. */
export const SkeletonHero = ({ className }: { className?: string }) => (
  <div className={cn("flex items-end justify-between gap-3", className)}>
    <div className="space-y-2.5">
      <Skeleton className="h-7 w-48 rounded-lg" />
      <Line className="h-3 w-80 max-w-[60vw]" />
    </div>
    <Skeleton className="hidden h-8 w-28 rounded-lg sm:block" />
  </div>
)

/** The row of figure cards. */
export const SkeletonFigures = ({ count = 4 }: { count?: number }) => (
  <div
    className={cn(
      "grid grid-cols-2 gap-3",
      count === 3 && "md:grid-cols-3",
      count === 4 && "md:grid-cols-4",
      count === 5 && "md:grid-cols-3 xl:grid-cols-5",
      count === 6 && "md:grid-cols-3 xl:grid-cols-6"
    )}
  >
    {Array.from({ length: count }).map((_, index) => (
      <div className="console-card flex flex-col gap-2.5 px-4 py-3.5" key={index}>
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-[7px]" />
          <Line className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-14 rounded-md" />
        <Line className="h-2.5 w-3/4 max-w-[10rem]" />
      </div>
    ))}
  </div>
)

/** A titled panel. */
export const SkeletonSection = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <section className={cn("console-card overflow-hidden", className)}>
    <div className="space-y-2 px-5 pt-4">
      <Skeleton className="h-4 w-36 rounded-md" />
      <Line className="h-2.5 w-56 max-w-full" />
    </div>
    <div className="min-w-0 px-5 pt-4 pb-5">{children}</div>
  </section>
)

/** Ranked bars — label, value and a track. */
export const SkeletonBars = ({ count = 4 }: { count?: number }) => {
  const widths = ["92%", "58%", "41%", "27%", "18%", "12%"]

  return (
    <ul className="flex flex-col">
      {Array.from({ length: count }).map((_, index) => (
        <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 py-2" key={index}>
          <Line className="h-3 w-36" />
          <Line className="h-3 w-8" />
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
          className="flex items-center gap-3 border-b border-[var(--report-rule)] px-2 py-2.5"
          key={index}
        >
          {avatar ? <Skeleton className="size-8 shrink-0 rounded-full" /> : null}
          <div className="min-w-0 flex-1 space-y-1.5">
            <Line className={cn("h-3 max-w-full", nameWidths[index % 6])} />
            <Line className={cn("h-2.5 max-w-full", metaWidths[index % 6])} />
          </div>
          {Array.from({ length: trailing }).map((__, slot) => (
            <Line
              className={cn(
                "hidden shrink-0 sm:block",
                slot === trailing - 1 ? "h-7 w-20" : "h-3 w-24"
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
    <div className="flex flex-col gap-3 border-b border-[var(--report-rule)] pb-2.5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex gap-6 pb-1">
        {Array.from({ length: count }).map((_, index) => (
          <Line className={cn("h-3.5", widths[index % widths.length])} key={index} />
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-full sm:w-64" />
    </div>
  )
}

/** Numbered step rows, as on Setup and Data transfer. */
export const SkeletonSteps = ({ count = 3 }: { count?: number }) => (
  <ol className="flex flex-col gap-5">
    {Array.from({ length: count }).map((_, index) => (
      <li className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3" key={index}>
        <Skeleton className="size-6 rounded-full" />
        <div className="space-y-2 pt-0.5">
          <Skeleton className="h-3.5 w-48 rounded-md" />
          <Line className="h-2.5 w-full max-w-[28rem]" />
          {index === 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
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
    <SkeletonHero />
    <SkeletonFigures count={6} />
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      <SkeletonSection>
        <div className="flex items-center gap-4">
          <div aria-hidden className="report-waffle report-skeleton-pulse shrink-0">
            {Array.from({ length: 100 }).map((_, index) => (
              <span className="report-cell" key={index} />
            ))}
          </div>
          <div className="flex-1 space-y-3">
            {["w-40", "w-32", "w-24"].map((width) => (
              <div className="flex items-center gap-2.5" key={width}>
                <Skeleton className="size-3 rounded-[3px]" />
                <Line className={cn("h-3", width)} />
              </div>
            ))}
          </div>
        </div>
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonBars />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonBars count={2} />
      </SkeletonSection>
    </div>
  </Frame>
)

export const MemorySkeleton = () => (
  <Frame label="Loading customer memory">
    <SkeletonHero />
    <SkeletonFigures />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <SkeletonSection>
        <SkeletonRows className="border-t-0" count={7} trailing={1} />
      </SkeletonSection>
      <SkeletonSection className="hidden lg:block">
        <div className="flex items-start gap-3">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-5 w-56 rounded-lg" />
            <Line className="h-2.5 w-72" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Line className="h-3 w-full" />
          <Line className="h-3 w-2/3" />
        </div>
        <div className="mt-4">
          <SkeletonFigures count={3} />
        </div>
        <div className="mt-4 grid gap-6 xl:grid-cols-2">
          <SkeletonRows avatar={false} count={4} trailing={0} />
          <SkeletonRows avatar={false} count={4} trailing={0} />
        </div>
      </SkeletonSection>
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
    <SkeletonHero />
    <SkeletonFigures count={5} />
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <SkeletonSection>
        <SkeletonFilters />
        <SkeletonRows className="border-t-0" count={7} trailing={2} />
      </SkeletonSection>
      <SkeletonSection>
        <Skeleton className="h-6 w-40 rounded-lg" />
        <div
          aria-hidden
          className="report-skeleton-pulse mt-3 grid h-[6.5rem] grid-cols-[repeat(30,minmax(0,1fr))] items-end gap-[3px] border-b border-[var(--report-rule)]"
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
      </SkeletonSection>
    </div>
  </Frame>
)

export const KnowledgeSkeleton = () => (
  <Frame label="Loading knowledge base">
    <SkeletonHero />
    <SkeletonFigures count={5} />
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <SkeletonSection>
        <SkeletonFilters count={3} />
        <SkeletonRows avatar={false} className="border-t-0" count={7} trailing={1} />
      </SkeletonSection>
      <SkeletonSection>
        <Skeleton className="h-10 w-full rounded-full" />
      </SkeletonSection>
    </div>
  </Frame>
)

/** One opened setup panel: its header, description and steps. */
export const SetupPanelSkeleton = () => (
  <div aria-busy="true" className="min-w-0" role="status">
    <span className="sr-only">Loading</span>
    <div className="flex items-center gap-3 border-b border-[var(--report-rule)] pb-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <Line className="h-2.5 w-32" />
      </div>
    </div>
    <div className="mt-4 mb-5 space-y-2">
      <Line className="h-3 w-full max-w-[40rem]" />
    </div>
    <SkeletonSteps />
  </div>
)

export const TransferSkeleton = () => (
  <Frame label="Loading data transfer">
    <SkeletonHero />
    <div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      <SkeletonSection>
        <SkeletonSteps count={2} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonSteps count={3} />
      </SkeletonSection>
      <SkeletonSection>
        <SkeletonRows avatar={false} count={3} trailing={0} />
      </SkeletonSection>
    </div>
  </Frame>
)
