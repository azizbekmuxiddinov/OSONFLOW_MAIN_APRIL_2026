"use client"

import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import type * as React from "react"

import type { ToolStatus } from "../../lib/tool-status"

/**
 * Layout primitives for the assistant tools page, drawn with the setup classes
 * (setup.css) so this page and Setup & integrations read as one system.
 */

type StatusTone = ToolStatus["tone"] | "neutral" | "error"

/** A status dot and its label — the dot is never the only signal. */
export const StatusLine = ({
  tone,
  label,
  className,
}: {
  tone: StatusTone
  label: React.ReactNode
  className?: string
}) => (
  <span
    className={cn(
      "flex min-w-0 items-center gap-2 text-xs text-muted-foreground",
      className
    )}
  >
    <span aria-hidden className="setup-dot" data-tone={tone} />
    <span
      className={cn(
        "truncate",
        (tone === "attention" || tone === "error") &&
          "font-medium text-foreground"
      )}
    >
      {label}
    </span>
  </span>
)

/** One numbered step. `done` swaps the number for a check. */
export const Step = ({
  index,
  title,
  description,
  done = false,
  aside,
  children,
}: {
  index: number
  title: React.ReactNode
  description?: React.ReactNode
  done?: boolean
  aside?: React.ReactNode
  children?: React.ReactNode
}) => (
  <li className={cn(done && "tools-step-done")}>
    <span className="setup-step-index" data-done={done || undefined}>
      {done ? (
        <>
          <CheckIcon aria-hidden className="size-4" />
          <span className="sr-only">Step {index}, done</span>
        </>
      ) : (
        index
      )}
    </span>
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="setup-step-title">{title}</p>
          {description ? (
            <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0 pt-0.5">{aside}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  </li>
)

export const Steps = ({ children }: { children: React.ReactNode }) => (
  <ol className="setup-steps">{children}</ol>
)

/** A warning or note as a tinted rule, not a box. */
export const Callout = ({
  tone = "attention",
  children,
  className,
}: {
  tone?: "attention" | "error" | "info"
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "setup-callout text-sm leading-relaxed text-foreground",
      className
    )}
    data-tone={tone}
    role={tone === "error" ? "alert" : undefined}
  >
    {children}
  </div>
)

/** Progressive disclosure for the technical parts. */
export const Disclosure = ({
  summary,
  children,
  defaultOpen = false,
  className,
}: {
  summary: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) => (
  <details className={cn("setup-disclosure", className)} open={defaultOpen}>
    <summary>
      <ChevronRightIcon aria-hidden className="size-4" />
      {summary}
    </summary>
    <div className="pb-4">{children}</div>
  </details>
)

/** A label and hint on the left, its control on the right, ruled underneath. */
export const FieldRow = ({
  label,
  hint,
  htmlFor,
  control,
  className,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  htmlFor?: string
  control: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      "tools-field flex items-center justify-between gap-6 py-3.5",
      className
    )}
  >
    <div className="min-w-0">
      {htmlFor ? (
        <label
          className="block text-sm font-medium text-foreground"
          htmlFor={htmlFor}
        >
          {label}
        </label>
      ) : (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}
      {hint ? (
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
    <div className="shrink-0">{control}</div>
  </div>
)

/** A small uppercase heading with a count, used above index groups. */
export const GroupLabel = ({
  children,
  count,
}: {
  children: React.ReactNode
  count?: number
}) => (
  <p className="console-label mb-2 flex items-center justify-between gap-2 px-3">
    <span className="truncate">{children}</span>
    {count !== undefined ? (
      <span className="tracking-normal tabular-nums">{count}</span>
    ) : null}
  </p>
)
