import {
  BLUEPRINTS_BY_ID,
  TOOL_BLUEPRINTS,
  resolveToolPresentation,
  type ToolBlueprint,
} from "../catalog"
import type { AssistantTool } from "../constants"
import { credentialState } from "./tool-auth"

/**
 * One sentence of status per installed tool, for the index and the page hero.
 *
 * The editor keeps its own step-by-step readiness list for the tool that is
 * open; this is the at-a-glance version for every other tool, computed from the
 * saved record so the index never shows a draft's state.
 */

export type ToolStatusTone = "live" | "attention" | "off"

export type ToolStatus = {
  tone: ToolStatusTone
  label: string
}

export type ToolConnections = {
  isGoogleSheetsConnected: boolean
  isGoogleCalendarConnected: boolean
}

const channelLabel = (tool: AssistantTool) => {
  if (tool.enabledForChat && tool.enabledForVoice)
    return "Live on chat and voice"
  if (tool.enabledForVoice) return "Live on voice"
  return "Live on chat"
}

/** What is still missing before the tool can run, or null when nothing is. */
const missingSetup = (
  tool: AssistantTool,
  connections: ToolConnections
): string | null => {
  if (tool.isBuiltin) return null

  const config = tool.config ?? {}

  if (tool.type === "google_sheets") {
    if (!connections.isGoogleSheetsConnected) return "Connect Google to finish"
    if (!config.spreadsheetId?.trim() || !config.range?.trim()) {
      return "Choose a spreadsheet"
    }
    return null
  }

  if (tool.type === "google_calendar") {
    if (!connections.isGoogleCalendarConnected)
      return "Connect Google to finish"
    if (!config.calendarId?.trim()) return "Choose a calendar"
    return null
  }

  const endpoint =
    (tool.type === "custom_webhook" ? config.webhookUrl : config.url)?.trim() ??
    ""

  if (!endpoint) return "Add the web address"

  const credential = credentialState(
    config,
    resolveToolPresentation(tool).blueprint?.auth
  )

  if (credential === "missing") return "Add your API key"
  if (credential === "placeholder") return "Replace the example key"

  return null
}

export const toolStatus = (
  tool: AssistantTool,
  connections: ToolConnections
): ToolStatus => {
  if (!tool.isEnabled) return { tone: "off", label: "Switched off" }

  const missing = missingSetup(tool, connections)
  if (missing) return { tone: "attention", label: missing }

  if (!tool.enabledForChat && !tool.enabledForVoice) {
    return { tone: "attention", label: "Not on any channel" }
  }

  return { tone: "live", label: channelLabel(tool) }
}

/* ── names ─────────────────────────────────────────────────────────────── */

/** Blueprints by the tool name their template installs, built once. */
let blueprintsByDraftName: Map<string, ToolBlueprint> | null = null

const draftNameIndex = () => {
  if (blueprintsByDraftName) return blueprintsByDraftName

  blueprintsByDraftName = new Map()

  for (const blueprint of TOOL_BLUEPRINTS) {
    const name = blueprint.draft?.().name
    if (name && !blueprintsByDraftName.has(name)) {
      blueprintsByDraftName.set(name, blueprint)
    }
  }

  return blueprintsByDraftName
}

const humanize = (name: string) => {
  const words = name.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
  return words
    ? words.charAt(0).toUpperCase() + words.slice(1)
    : "Untitled tool"
}

/**
 * The name a business owner reads. The model-facing identifier
 * (`lookup_hubspot_contact`) stays in the editor's advanced section; the index
 * shows the catalog title when the tool still carries its template's name, and
 * a readable version of the identifier otherwise.
 */
export const toolDisplayName = (
  tool: Pick<AssistantTool, "name" | "type" | "isBuiltin">
) => {
  if (tool.isBuiltin) {
    return (
      BLUEPRINTS_BY_ID[`builtin_${tool.type}`]?.title ?? humanize(tool.name)
    )
  }

  // Installs and duplicates add `_2` / `_copy` suffixes to keep names unique.
  const match = /^(.*?)(_copy)?(?:_(\d+))?$/.exec(tool.name)
  const base = match?.[1] ?? tool.name
  const blueprint = draftNameIndex().get(base)

  if (blueprint) {
    return [blueprint.title, match?.[2] ? "(copy)" : null, match?.[3] ?? null]
      .filter(Boolean)
      .join(" ")
  }

  return humanize(tool.name)
}
