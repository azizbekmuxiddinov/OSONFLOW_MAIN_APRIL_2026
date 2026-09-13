"use client"

import { KeyRoundIcon } from "lucide-react"

import { resolveToolPresentation } from "../../catalog"
import type { AssistantTool } from "../../constants"
import {
  AUTH_KIND_LABELS,
  CREDENTIAL_STATE_COPY,
  credentialState,
} from "../../lib/tool-auth"
import { BrandMark } from "./brand-mark"
import { StatusLine } from "./tools-primitives"

/**
 * Every outside system this workspace's assistants can reach, in one list.
 *
 * Credentials live inside each tool's own config, which makes them easy to set
 * and hard to audit. This rolls them up by host so an admin can answer "what
 * are we calling, and is anything still on an example key?" without opening
 * every tool.
 */

type HostEntry = {
  host: string
  vendor: string
  brand: string
  icon: ReturnType<typeof resolveToolPresentation>["icon"]
  tools: AssistantTool[]
  authLabel: string
  needsAttention: boolean
  detail: string
}

const hostOf = (tool: AssistantTool) => {
  const raw = (tool.config?.url ?? tool.config?.webhookUrl ?? "").trim()

  if (!raw) return null

  try {
    return new URL(raw).host
  } catch {
    return null
  }
}

const buildEntries = (tools: AssistantTool[]): HostEntry[] => {
  const entries = new Map<string, HostEntry>()

  for (const tool of tools) {
    if (
      tool.isBuiltin ||
      tool.type === "google_sheets" ||
      tool.type === "google_calendar"
    )
      continue

    const host = hostOf(tool)

    if (!host) continue

    const presentation = resolveToolPresentation(tool)
    const auth = presentation.blueprint?.auth
    const state = credentialState(tool.config ?? {}, auth)
    const needsAttention = state === "missing" || state === "placeholder"
    const existing = entries.get(host)

    if (existing) {
      existing.tools.push(tool)
      if (needsAttention && !existing.needsAttention) {
        existing.needsAttention = true
        existing.detail = CREDENTIAL_STATE_COPY[state]
      }
      continue
    }

    entries.set(host, {
      host,
      vendor: presentation.vendor,
      brand: presentation.brand,
      icon: presentation.icon,
      tools: [tool],
      authLabel: auth ? AUTH_KIND_LABELS[auth.kind] : "Custom headers",
      needsAttention,
      detail:
        state === "not_required"
          ? "No key needed"
          : CREDENTIAL_STATE_COPY[state],
    })
  }

  return [...entries.values()].sort((a, b) => a.host.localeCompare(b.host))
}

export const ConnectionsInventory = ({
  tools,
  onOpenTool,
}: {
  tools: AssistantTool[]
  onOpenTool?: (tool: AssistantTool) => void
}) => {
  const entries = buildEntries(tools)

  if (entries.length === 0) {
    return (
      <p className="border-y border-[var(--report-rule)] py-6 text-sm text-muted-foreground">
        None yet. Once a tool points at a web address it shows up here, with the
        key it uses and whether that key has been filled in.
      </p>
    )
  }

  return (
    <ul>
      {entries.map((entry) => {
        const isLive = entry.tools.some((tool) => tool.isEnabled)

        return (
          <li
            className="setup-row grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-2 py-4 md:grid-cols-[2.25rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)]"
            key={entry.host}
          >
            <BrandMark
              brand={entry.brand}
              icon={entry.icon}
              muted={!isLive}
              size="sm"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {entry.vendor}
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                {entry.host}
              </p>
            </div>

            <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 md:col-start-auto">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <KeyRoundIcon aria-hidden className="size-3.5" />
                {entry.authLabel}
              </span>
              <StatusLine
                label={entry.detail}
                tone={entry.needsAttention ? "attention" : "live"}
              />
            </div>

            <div className="col-start-2 min-w-0 text-xs text-muted-foreground md:col-start-auto">
              {onOpenTool ? (
                <span className="flex flex-wrap gap-x-3 gap-y-1">
                  {entry.tools.map((tool) => (
                    <button
                      className="truncate font-mono text-foreground underline decoration-[var(--report-rule-strong)] underline-offset-4 transition-colors hover:decoration-current"
                      key={tool._id}
                      onClick={() => onOpenTool(tool)}
                      type="button"
                    >
                      {tool.name}
                    </button>
                  ))}
                </span>
              ) : (
                `${entry.tools.length} tool${entry.tools.length === 1 ? "" : "s"}`
              )}
              {!isLive ? (
                <span className="mt-1 block">All switched off</span>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
