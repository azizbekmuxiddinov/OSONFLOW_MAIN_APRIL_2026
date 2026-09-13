"use client"

import { ChevronRightIcon, PlusIcon } from "lucide-react"

import { ConsoleSearch } from "@/modules/dashboard/ui/components/console"
import { resolveToolPresentation, type ToolPresentation } from "../../catalog"
import type { AssistantTool } from "../../constants"
import { toolDisplayName, type ToolStatus } from "../../lib/tool-status"
import { BrandMark } from "./brand-mark"
import { GroupLabel, StatusLine } from "./tools-primitives"

/**
 * The pinned list of every tool the assistant has, with one line of status
 * each — the Setup & integrations index, applied to tools.
 */

export type ToolIndexFilter = "all" | "chat" | "voice" | "off"

type ToolIndexProps = {
  tools: AssistantTool[]
  statuses: Map<string, ToolStatus>
  selectedToolId: string | null
  /** The unsaved tool being added, shown at the top until it is saved. */
  draft: { title: string; presentation: ToolPresentation } | null
  query: string
  onQueryChange: (value: string) => void
  filter: ToolIndexFilter
  onFilterChange: (value: ToolIndexFilter) => void
  onOpen: (tool: AssistantTool) => void
  onAdd: () => void
}

const FILTERS: Array<{ id: ToolIndexFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "chat", label: "Chat" },
  { id: "voice", label: "Voice" },
  { id: "off", label: "Off" },
]

const matchesFilter = (tool: AssistantTool, filter: ToolIndexFilter) => {
  if (filter === "chat") return tool.isEnabled && tool.enabledForChat
  if (filter === "voice") return tool.isEnabled && tool.enabledForVoice
  if (filter === "off") return !tool.isEnabled
  return true
}

const rowClass =
  "setup-nav-row grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 text-left focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"

export const ToolIndex = ({
  tools,
  statuses,
  selectedToolId,
  draft,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  onOpen,
  onAdd,
}: ToolIndexProps) => {
  const normalizedQuery = query.trim().toLowerCase()

  const visible = tools.filter((tool) => {
    if (!matchesFilter(tool, filter)) return false
    if (!normalizedQuery) return true

    const presentation = resolveToolPresentation(tool)
    return [
      toolDisplayName(tool),
      tool.name,
      tool.description,
      presentation.vendor,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  })

  const builtin = visible.filter((tool) => tool.isBuiltin)
  const connected = visible
    .filter((tool) => !tool.isBuiltin)
    .sort((left, right) => {
      const byVendor = resolveToolPresentation(left).vendor.localeCompare(
        resolveToolPresentation(right).vendor
      )
      return (
        byVendor || toolDisplayName(left).localeCompare(toolDisplayName(right))
      )
    })
  const hasIntegrations = tools.some((tool) => !tool.isBuiltin)

  const renderRow = (tool: AssistantTool) => {
    const presentation = resolveToolPresentation(tool)
    const status = statuses.get(tool._id) ?? { tone: "off", label: "" }

    return (
      <li key={tool._id}>
        <button
          aria-current={selectedToolId === tool._id}
          className={rowClass}
          onClick={() => onOpen(tool)}
          type="button"
        >
          <BrandMark
            brand={presentation.brand}
            icon={presentation.icon}
            muted={!tool.isEnabled}
            size="sm"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">
              {toolDisplayName(tool)}
            </span>
            <StatusLine
              className="mt-0.5"
              label={status.label}
              tone={status.tone}
            />
          </span>
          <ChevronRightIcon
            aria-hidden
            className="setup-nav-chevron size-4 text-muted-foreground"
          />
        </button>
      </li>
    )
  }

  return (
    <nav
      aria-label="Your tools"
      className="tools-index min-w-0 lg:sticky lg:top-6 lg:self-start"
    >
      <ConsoleSearch
        aria-label="Search your tools"
        className="px-0.5"
        onChange={onQueryChange}
        placeholder="Search your tools"
        value={query}
      />

      <div
        aria-label="Show tools"
        className="mt-3 flex flex-wrap gap-1.5 px-0.5"
        role="group"
      >
        {FILTERS.map((entry) => (
          <button
            aria-pressed={filter === entry.id}
            className="tools-chip"
            key={entry.id}
            onClick={() => onFilterChange(entry.id)}
            type="button"
          >
            {entry.label}
            <span className="text-[0.7rem] text-muted-foreground tabular-nums">
              {tools.filter((tool) => matchesFilter(tool, entry.id)).length}
            </span>
          </button>
        ))}
      </div>

      {draft ? (
        <div className="mt-6">
          <GroupLabel>Adding now</GroupLabel>
          <div aria-current="true" className={rowClass}>
            <BrandMark
              brand={draft.presentation.brand}
              icon={draft.presentation.icon}
              size="sm"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {draft.title}
              </span>
              <StatusLine
                className="mt-0.5"
                label="Not saved yet"
                tone="attention"
              />
            </span>
            <span />
          </div>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="mt-6 px-3">
          <p className="text-sm text-muted-foreground">
            {normalizedQuery
              ? `No tool matches “${query.trim()}”.`
              : filter === "off"
                ? "Every tool is switched on."
                : "Nothing here yet."}
          </p>
          <button
            className="mt-2 text-sm font-medium text-foreground underline underline-offset-4"
            onClick={() => {
              onQueryChange("")
              onFilterChange("all")
            }}
            type="button"
          >
            Show all tools
          </button>
        </div>
      ) : null}

      {builtin.length > 0 ? (
        <div className="mt-6">
          <GroupLabel count={builtin.length}>Built in</GroupLabel>
          <ul className="flex flex-col gap-0.5">{builtin.map(renderRow)}</ul>
        </div>
      ) : null}

      {connected.length > 0 ? (
        <div className="mt-6">
          <GroupLabel count={connected.length}>Connected apps</GroupLabel>
          <ul className="flex flex-col gap-0.5">{connected.map(renderRow)}</ul>
        </div>
      ) : !hasIntegrations && visible.length > 0 ? (
        <div className="mt-6">
          <GroupLabel>Connected apps</GroupLabel>
          <p className="px-3 text-sm leading-relaxed text-muted-foreground">
            None yet. Connect an app you already use so your assistant can look
            things up and take action there.
          </p>
        </div>
      ) : null}

      <button
        className="tools-add-row mt-6 flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
        onClick={onAdd}
        type="button"
      >
        <span className="setup-glyph size-9">
          <PlusIcon aria-hidden className="size-4" />
        </span>
        Add a tool
      </button>
    </nav>
  )
}
