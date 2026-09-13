"use client"

import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { Kbd } from "@workspace/ui/components/kbd"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  GaugeIcon,
  GlobeLockIcon,
  Loader2Icon,
  PlusIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { ConsolePage } from "@/modules/dashboard/ui/components/console"
import {
  ReportFilter,
  ReportSection,
} from "@/modules/dashboard/ui/components/report"
import {
  SetupPanelSkeleton,
  SkeletonFigures,
  SkeletonFilters,
  SkeletonHero,
  SkeletonRows,
} from "@/modules/dashboard/ui/components/report-skeleton"
import {
  AVAILABLE_BLUEPRINTS,
  BLUEPRINTS_BY_ID,
  FEATURED_BLUEPRINTS,
  resolveToolPresentation,
  type CatalogCategoryId,
  type ToolBlueprint,
  type ToolPresentation,
} from "../../catalog"
import {
  CHAT_MODEL_OPTIONS,
  createEmptyParameter,
  GOOGLE_SHEETS_MATCH_MODE_OPTIONS,
  GOOGLE_SHEETS_OPERATION_LABELS,
  GOOGLE_SHEETS_QUERY_STRATEGY_OPTIONS,
  type AssistantTool,
  type IntegrationToolType,
} from "../../constants"
import { buildGoogleSheetsParameters } from "../../lib/google-sheets-parameters"
import {
  AUTH_KIND_LABELS,
  CREDENTIAL_STATE_COPY,
  credentialState,
} from "../../lib/tool-auth"
import {
  toolDisplayName,
  toolStatus,
  type ToolConnections,
  type ToolStatus,
} from "../../lib/tool-status"
import { BrandMark } from "../components/brand-mark"
import { ConnectionsInventory } from "../components/connections-inventory"
import { GoogleCalendarConnectionCard } from "../components/google-calendar-connection-card"
import { GoogleConnectionCard } from "../components/google-connection-card"
import { RequestHeadersEditor } from "../components/request-headers-editor"
import { RequestPreview } from "../components/request-preview"
import { SheetColumnPicker } from "../components/sheet-column-picker"
import { ToolCatalog } from "../components/tool-catalog"
import { ToolIndex, type ToolIndexFilter } from "../components/tool-index"
import { ToolParametersEditor } from "../components/tool-parameters-editor"
import { ToolReadiness, type ReadinessStep } from "../components/tool-readiness"
import { ToolTestConsole } from "../components/tool-test-console"
import {
  Callout,
  Disclosure,
  FieldRow,
  Step,
  Steps,
  StatusLine,
} from "../components/tools-primitives"
import "@/modules/dashboard/ui/styles/report.css"
// The index and step classes are shared with Setup & integrations.
import "@/modules/integrations/ui/styles/setup.css"
import "../styles/tools.css"

type ToolEditorState = {
  name: string
  description: string
  enabledForChat: boolean
  enabledForVoice: boolean
  isEnabled: boolean
  parameters: AssistantTool["parameters"]
  config: NonNullable<AssistantTool["config"]>
}

type WorkspaceSection = "tools" | "catalog" | "connections"
type EditorTab = "overview" | "setup" | "test"

const VOICE_UNSUPPORTED_TOOL_TYPES = new Set<AssistantTool["type"]>([
  "handoff",
  "resolve",
])

const defaultEditorState = (): ToolEditorState => ({
  name: "",
  description: "",
  enabledForChat: true,
  enabledForVoice: false,
  isEnabled: true,
  parameters: [createEmptyParameter()],
  config: {},
})

const toolToEditorState = (tool: AssistantTool): ToolEditorState => ({
  name: tool.name,
  description: tool.description,
  enabledForChat: tool.enabledForChat,
  enabledForVoice: tool.enabledForVoice,
  isEnabled: tool.isEnabled,
  parameters: tool.parameters,
  config: tool.config ?? {},
})

/** Mirrors the server's normalisation so the editor can preview the saved name. */
const previewToolName = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")

/** What the library can actually add — built-in tools are already there. */
const ADDABLE_BLUEPRINTS = AVAILABLE_BLUEPRINTS.filter(
  (blueprint) => blueprint.status === "available"
)
const ADDABLE_VENDOR_COUNT = new Set(
  ADDABLE_BLUEPRINTS.map((blueprint) => blueprint.vendor)
).size

const SECTIONS: Array<{ id: WorkspaceSection; label: string }> = [
  { id: "tools", label: "Your tools" },
  { id: "catalog", label: "Tool library" },
  { id: "connections", label: "Accounts & security" },
]

/** How a tool call is fenced — facts about the runtime, stated plainly. */
const SAFEGUARDS = [
  {
    icon: ShieldCheckIcon,
    title: "Only your workspace can use them",
    body: "A tool is visible only to assistants in the business that added it, and only on the channels it's switched on for.",
  },
  {
    icon: GlobeLockIcon,
    title: "Calls only go to the public internet",
    body: "Requests must use http or https. Private, local and internal network addresses are refused, and every redirect is checked again.",
  },
  {
    icon: GaugeIcon,
    title: "Answers are kept short",
    body: "At most 4,000 characters of a reply reach your assistant, so a huge response can't flood the conversation.",
  },
  {
    icon: EyeOffIcon,
    title: "Keys stay out of the conversation",
    body: "Keys are sent to the app you connected and nowhere else. Your assistant only ever sees the answer, never the key.",
  },
]

const Figure = ({
  label,
  value,
  note,
}: {
  label: string
  value: React.ReactNode
  note: string
}) => (
  <div className="report-figure flex flex-col gap-3 px-1 py-5 sm:px-5 md:first:pl-0">
    <p className="console-label">{label}</p>
    <p className="report-figure-value">{value}</p>
    <p className="text-xs leading-snug text-muted-foreground">{note}</p>
  </div>
)

/** Drawn in the loaded page's grid so nothing jumps when tools arrive. */
const ToolsSkeleton = () => (
  <ConsolePage width="wide">
    <div aria-busy="true" className="report" role="status">
      <span className="sr-only">Loading assistant tools</span>
      <SkeletonHero />
      <SkeletonFigures />
      <div className="mt-10">
        <SkeletonFilters count={3} />
      </div>
      <div className="grid gap-10 pt-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-14">
        <div className="space-y-3">
          <Skeleton className="h-9 w-full rounded-full" />
          <SkeletonRows avatar className="border-t-0" count={6} trailing={0} />
        </div>
        <div className="hidden lg:block">
          <SetupPanelSkeleton />
        </div>
      </div>
    </div>
  </ConsolePage>
)

export const AssistantToolsView = () => {
  const tools = useQuery(api.private.assistantTools.list)
  const googleSheetsStatus = useQuery(
    api.private.googleSheets.getConnectionStatus
  )
  const getGoogleOAuthUrl = useAction(
    api.private.googleSheets.getOAuthAuthorizationUrl
  )
  const listSpreadsheets = useAction(
    api.private.googleSheetsActions.listSpreadsheets
  )
  const listSpreadsheetTabs = useAction(
    api.private.googleSheetsActions.listSpreadsheetTabsForPicker
  )
  const listSpreadsheetColumnHeaders = useAction(
    api.private.googleSheetsActions.listSpreadsheetColumnHeadersForPicker
  )
  const disconnectGoogleSheets = useMutation(
    api.private.googleSheets.disconnect
  )
  const upsertGoogleSheetsApiKey = useMutation(
    api.private.googleSheets.upsertApiKey
  )
  const googleCalendarStatus = useQuery(
    api.private.googleCalendar.getConnectionStatus
  )
  const getGoogleCalendarOAuthUrl = useAction(
    api.private.googleCalendar.getOAuthAuthorizationUrl
  )
  const disconnectGoogleCalendar = useMutation(
    api.private.googleCalendar.disconnect
  )
  const bootstrapBuiltinTools = useMutation(
    api.private.assistantTools.bootstrapBuiltinTools
  )
  const createTool = useMutation(api.private.assistantTools.create)
  const updateTool = useMutation(api.private.assistantTools.update)
  const removeTool = useMutation(api.private.assistantTools.remove)
  const testExecute = useAction(api.private.assistantTools.testExecute)

  const [section, setSection] = useState<WorkspaceSection>("tools")
  const [selectedToolId, setSelectedToolId] = useState<
    Id<"assistantTools"> | "new" | null
  >(null)
  const [newToolType, setNewToolType] = useState<IntegrationToolType | null>(
    null
  )
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(
    null
  )
  const [editor, setEditor] = useState<ToolEditorState>(defaultEditorState())
  const [libraryQuery, setLibraryQuery] = useState("")
  const [libraryFilter, setLibraryFilter] = useState<ToolIndexFilter>("all")
  const [catalogQuery, setCatalogQuery] = useState("")
  const [catalogCategory, setCatalogCategory] = useState<
    CatalogCategoryId | "all"
  >("all")
  const [spreadsheetFilter, setSpreadsheetFilter] = useState("")
  const [editorTab, setEditorTab] = useState<EditorTab>("overview")
  const [isDirty, setIsDirty] = useState(false)
  const [googleApiKey, setGoogleApiKey] = useState("")
  const [showApiKeyFallback, setShowApiKeyFallback] = useState(false)
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false)
  const [isConnectingGoogleCalendar, setIsConnectingGoogleCalendar] =
    useState(false)
  const [isDisconnectingGoogleCalendar, setIsDisconnectingGoogleCalendar] =
    useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isSavingGoogleKey, setIsSavingGoogleKey] = useState(false)
  const [spreadsheetOptions, setSpreadsheetOptions] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [sheetTabOptions, setSheetTabOptions] = useState<string[]>([])
  const [sheetColumnOptions, setSheetColumnOptions] = useState<string[]>([])
  const [isLoadingSpreadsheets, setIsLoadingSpreadsheets] = useState(false)
  const [isLoadingSheetTabs, setIsLoadingSheetTabs] = useState(false)
  const [isLoadingSheetColumns, setIsLoadingSheetColumns] = useState(false)
  const [useManualSpreadsheetId, setUseManualSpreadsheetId] = useState(false)
  const [spreadsheetLoadError, setSpreadsheetLoadError] = useState<
    string | null
  >(null)
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const hasBootstrappedRef = useRef(false)
  const sectionsRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true
    void bootstrapBuiltinTools().catch(() => {
      hasBootstrappedRef.current = false
    })
  }, [bootstrapBuiltinTools])

  useEffect(() => {
    if (googleSheetsStatus && !googleSheetsStatus.oauthAvailable) {
      setShowApiKeyFallback(true)
    }
  }, [googleSheetsStatus])

  const selectedTool = useMemo(() => {
    if (!tools || selectedToolId === "new" || selectedToolId === null) {
      return null
    }

    return tools.find((tool) => tool._id === selectedToolId) ?? null
  }, [selectedToolId, tools])

  const builtinTools = useMemo(
    () => (tools ?? []).filter((tool) => tool.isBuiltin),
    [tools]
  )
  const integrationTools = useMemo(
    () => (tools ?? []).filter((tool) => !tool.isBuiltin),
    [tools]
  )

  const installedCounts = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const tool of tools ?? []) {
      const key = tool.isBuiltin
        ? `builtin_${tool.type}`
        : resolveToolPresentation(tool).blueprint?.id

      if (!key) continue
      counts[key] = (counts[key] ?? 0) + 1
    }

    return counts
  }, [tools])

  const filteredSpreadsheetOptions = useMemo(() => {
    const query = spreadsheetFilter.trim().toLowerCase()
    if (!query) return spreadsheetOptions
    return spreadsheetOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.id.toLowerCase().includes(query)
    )
  }, [spreadsheetFilter, spreadsheetOptions])

  const isGoogleSheetsEditor =
    selectedTool?.type === "google_sheets" || newToolType === "google_sheets"
  const isGoogleCalendarEditor =
    selectedTool?.type === "google_calendar" ||
    newToolType === "google_calendar"
  const selectedToolType = selectedTool?.type ?? newToolType
  const isVoiceUnsupportedTool = selectedToolType
    ? VOICE_UNSUPPORTED_TOOL_TYPES.has(selectedToolType)
    : false
  const isGoogleConnected = Boolean(googleSheetsStatus?.isConfigured)
  const isGoogleCalendarConnected = Boolean(googleCalendarStatus?.isConfigured)

  const activeBlueprint: ToolBlueprint | undefined = useMemo(() => {
    if (selectedTool) {
      return (
        resolveToolPresentation(selectedTool).blueprint ??
        (activeBlueprintId ? BLUEPRINTS_BY_ID[activeBlueprintId] : undefined)
      )
    }

    return activeBlueprintId ? BLUEPRINTS_BY_ID[activeBlueprintId] : undefined
  }, [activeBlueprintId, selectedTool])

  const presentation: ToolPresentation = selectedTool
    ? resolveToolPresentation(selectedTool)
    : activeBlueprint
      ? {
          icon: activeBlueprint.icon,
          tone: activeBlueprint.tone,
          brand: activeBlueprint.brand,
          vendor: activeBlueprint.vendor,
          typeLabel: activeBlueprint.title,
        }
      : {
          icon: PlusIcon,
          tone: "neutral" as const,
          brand: "#64748b",
          vendor: "Custom",
          typeLabel: "New tool",
        }

  /* ── google sheets option loading ──────────────────────────────────── */

  const loadSpreadsheetOptions = async () => {
    if (!isGoogleSheetsEditor || googleSheetsStatus?.authMethod !== "oauth") {
      setSpreadsheetOptions([])
      setSpreadsheetLoadError(null)
      return
    }

    setIsLoadingSpreadsheets(true)
    setSpreadsheetLoadError(null)

    try {
      const options = await listSpreadsheets({})
      setSpreadsheetOptions(options)

      if (options.length === 0) {
        setSpreadsheetLoadError(
          "No spreadsheets were returned. Enable the Google Drive API in Google Cloud Console, then disconnect and reconnect this account."
        )
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load spreadsheets"
      setSpreadsheetOptions([])
      setSpreadsheetLoadError(message)
      toast.error(message)
    } finally {
      setIsLoadingSpreadsheets(false)
    }
  }

  useEffect(() => {
    void loadSpreadsheetOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleSheetsStatus?.authMethod, isGoogleSheetsEditor])

  useEffect(() => {
    const spreadsheetId = editor.config.spreadsheetId?.trim()

    if (
      !isGoogleSheetsEditor ||
      !googleSheetsStatus?.isConfigured ||
      !spreadsheetId
    ) {
      setSheetTabOptions([])
      return
    }

    let cancelled = false
    setIsLoadingSheetTabs(true)

    void listSpreadsheetTabs({ spreadsheetId })
      .then((tabs) => {
        if (!cancelled) {
          setSheetTabOptions(tabs)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSheetTabOptions([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSheetTabs(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    editor.config.spreadsheetId,
    googleSheetsStatus?.isConfigured,
    isGoogleSheetsEditor,
    listSpreadsheetTabs,
  ])

  useEffect(() => {
    const spreadsheetId = editor.config.spreadsheetId?.trim()
    const sheetName = editor.config.range?.trim()

    if (
      !isGoogleSheetsEditor ||
      !googleSheetsStatus?.isConfigured ||
      !spreadsheetId ||
      !sheetName
    ) {
      setSheetColumnOptions([])
      return
    }

    let cancelled = false
    setIsLoadingSheetColumns(true)

    void listSpreadsheetColumnHeaders({ spreadsheetId, sheetName })
      .then((headers) => {
        if (!cancelled) {
          setSheetColumnOptions(headers)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSheetColumnOptions([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSheetColumns(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    editor.config.range,
    editor.config.spreadsheetId,
    googleSheetsStatus?.isConfigured,
    isGoogleSheetsEditor,
    listSpreadsheetColumnHeaders,
  ])

  useEffect(() => {
    if (sheetTabOptions.length === 0) {
      return
    }

    setEditor((current) => {
      if (current.config.range?.trim()) {
        return current
      }

      return {
        ...current,
        config: { ...current.config, range: sheetTabOptions[0] },
      }
    })
  }, [sheetTabOptions])

  useEffect(() => {
    if (!isGoogleSheetsEditor || sheetColumnOptions.length === 0) {
      return
    }

    const matchColumns = (requested: string[] = [], fallbackCount = 1) => {
      const matched = requested.filter((column) =>
        sheetColumnOptions.includes(column)
      )
      return matched.length > 0
        ? matched
        : sheetColumnOptions.slice(
            0,
            Math.min(fallbackCount, sheetColumnOptions.length)
          )
    }

    setEditor((current) => {
      const operation = current.config.operation ?? "lookup"
      const searchColumns = matchColumns(current.config.searchColumns, 2)
      const valueColumns = matchColumns(
        current.config.valueColumns ?? [],
        sheetColumnOptions.length
      )
      const updateColumns = matchColumns(
        current.config.updateColumns ?? [],
        Math.max(sheetColumnOptions.length - 1, 1)
      )

      const columnsUnchanged =
        JSON.stringify(searchColumns) ===
          JSON.stringify(current.config.searchColumns) &&
        JSON.stringify(valueColumns) ===
          JSON.stringify(current.config.valueColumns) &&
        JSON.stringify(updateColumns) ===
          JSON.stringify(current.config.updateColumns)

      if (columnsUnchanged) {
        return current
      }

      const nextConfig = {
        ...current.config,
        searchColumns,
        valueColumns,
        updateColumns,
      }

      return {
        ...current,
        config: nextConfig,
        parameters: buildGoogleSheetsParameters({
          operation,
          searchColumns: nextConfig.searchColumns,
          valueColumns: nextConfig.valueColumns,
          updateColumns: nextConfig.updateColumns,
        }),
      }
    })
  }, [isGoogleSheetsEditor, sheetColumnOptions])

  /* ── editor plumbing ───────────────────────────────────────────────── */

  const patchEditor = (patch: Partial<ToolEditorState>) => {
    setIsDirty(true)
    setEditor((current) => ({ ...current, ...patch }))
  }

  const patchConfig = (patch: Partial<ToolEditorState["config"]>) => {
    setIsDirty(true)
    setEditor((current) => ({
      ...current,
      config: { ...current.config, ...patch },
    }))
  }

  /** Runs `action` immediately, or after the user resolves unsaved changes. */
  const guardUnsaved = (action: () => void) => {
    if (isDirty) {
      setPendingNavigation(() => action)
      return
    }

    action()
  }

  const uniqueToolName = (base: string) => {
    const existing = new Set((tools ?? []).map((tool) => tool.name))

    if (!existing.has(base)) {
      return base
    }

    let index = 2
    while (existing.has(`${base}_${index}`)) {
      index += 1
    }

    return `${base}_${index}`
  }

  const openTool = (tool: AssistantTool) =>
    guardUnsaved(() => {
      setSection("tools")
      setSelectedToolId(tool._id)
      setNewToolType(null)
      setActiveBlueprintId(resolveToolPresentation(tool).blueprint?.id ?? null)
      setEditor(toolToEditorState(tool))
      setIsDirty(false)
      setEditorTab("overview")
    })

  const installBlueprint = (blueprint: ToolBlueprint) => {
    const draft = blueprint.draft?.()

    if (!draft) {
      return
    }

    guardUnsaved(() => {
      setSection("tools")
      setSelectedToolId("new")
      setNewToolType(draft.type)
      setActiveBlueprintId(blueprint.id)
      setEditor({
        name: uniqueToolName(draft.name),
        description: draft.description,
        enabledForChat: true,
        enabledForVoice: draft.enabledForVoice,
        isEnabled: true,
        parameters: draft.parameters,
        config: draft.config,
      })
      setIsDirty(true)
      setUseManualSpreadsheetId(false)
      // A freshly installed blueprint arrives with its identity already
      // written — what is missing is the endpoint and the credential.
      setEditorTab("setup")
      window.requestAnimationFrame(() =>
        sectionsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      )
    })
  }

  /** Opens a tool from elsewhere on the page and scrolls its panel into view. */
  const openToolAndReveal = (tool: AssistantTool) =>
    guardUnsaved(() => {
      setSection("tools")
      setSelectedToolId(tool._id)
      setNewToolType(null)
      setActiveBlueprintId(resolveToolPresentation(tool).blueprint?.id ?? null)
      setEditor(toolToEditorState(tool))
      setIsDirty(false)
      setEditorTab("overview")
      window.requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      )
    })

  const cancelNewTool = () => {
    setSelectedToolId(null)
    setNewToolType(null)
    setActiveBlueprintId(null)
    setEditor(defaultEditorState())
    setIsDirty(false)
  }

  const configureBuiltin = (blueprint: ToolBlueprint) => {
    const tool = builtinTools.find(
      (entry) => entry.type === blueprint.builtinType
    )

    if (!tool) {
      toast.error("That built-in tool is still being prepared.")
      return
    }

    openTool(tool)
  }

  const handleSave = async () => {
    if (!editor.name.trim() || !editor.description.trim()) {
      toast.error("Tool name and description are required")
      return
    }

    if (isGoogleSheetsEditor) {
      if (!editor.config.spreadsheetId?.trim()) {
        toast.error("Choose a spreadsheet before saving")
        return
      }

      if (!editor.config.range?.trim()) {
        toast.error("Choose a sheet tab before saving")
        return
      }

      const operation = editor.config.operation ?? "lookup"

      if (
        (operation === "lookup" ||
          operation === "update" ||
          operation === "delete") &&
        (editor.config.searchColumns ?? []).length === 0
      ) {
        toast.error("Select at least one search column")
        return
      }

      if (
        operation === "append" &&
        (editor.config.valueColumns ?? []).length === 0
      ) {
        toast.error("Select at least one value column")
        return
      }

      if (
        operation === "update" &&
        (editor.config.updateColumns ?? []).length === 0
      ) {
        toast.error("Select at least one update column")
        return
      }
    }

    if (isGoogleCalendarEditor && !editor.config.calendarId?.trim()) {
      toast.error("Choose a calendar before saving")
      return
    }

    if (selectedToolType === "api_request" && !editor.config.url?.trim()) {
      toast.error("Add the endpoint this tool should call")
      return
    }

    if (
      selectedToolType === "custom_webhook" &&
      !editor.config.webhookUrl?.trim()
    ) {
      toast.error("Add the webhook URL this tool should post to")
      return
    }

    setIsSaving(true)

    try {
      const operation = editor.config.operation ?? "lookup"
      const parameters = isGoogleSheetsEditor
        ? buildGoogleSheetsParameters({
            operation,
            searchColumns: editor.config.searchColumns ?? [],
            valueColumns: editor.config.valueColumns ?? [],
            updateColumns: editor.config.updateColumns ?? [],
          })
        : editor.parameters.filter((parameter) => parameter.name.trim())

      const payload = {
        name: editor.name,
        description: editor.description,
        enabledForChat: editor.enabledForChat,
        enabledForVoice: isVoiceUnsupportedTool
          ? false
          : editor.enabledForVoice,
        isEnabled: editor.isEnabled,
        parameters,
        config: editor.config,
      }

      if (selectedToolId === "new" && newToolType) {
        const toolId = await createTool({ type: newToolType, ...payload })
        setSelectedToolId(toolId)
        setNewToolType(null)
        toast.success("Tool created")
        setIsDirty(false)
      } else if (selectedTool) {
        await updateTool({ toolId: selectedTool._id, ...payload })
        toast.success("Tool updated")
        setIsDirty(false)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save assistant tool"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicate = async () => {
    if (!selectedTool || selectedTool.isBuiltin) {
      return
    }

    setIsDuplicating(true)

    try {
      const toolId = await createTool({
        type: selectedTool.type as IntegrationToolType,
        name: uniqueToolName(`${selectedTool.name}_copy`),
        description: selectedTool.description,
        enabledForChat: selectedTool.enabledForChat,
        enabledForVoice: selectedTool.enabledForVoice,
        // A copy starts switched off so a half-edited clone never goes live.
        isEnabled: false,
        parameters: selectedTool.parameters,
        config: selectedTool.config ?? {},
      })

      setSelectedToolId(toolId)
      setNewToolType(null)
      setEditor({
        ...toolToEditorState(selectedTool),
        name: uniqueToolName(`${selectedTool.name}_copy`),
        isEnabled: false,
      })
      setIsDirty(false)
      toast.success("Tool duplicated — it stays off until you enable it")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to duplicate this tool"
      )
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTool || selectedTool.isBuiltin) return

    try {
      await removeTool({ toolId: selectedTool._id })
      setSelectedToolId(null)
      setActiveBlueprintId(null)
      setEditor(defaultEditorState())
      setIsDirty(false)
      toast.success("Tool deleted")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete assistant tool"
      )
    }
  }

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true)

    try {
      const { authorizationUrl } = await getGoogleOAuthUrl()
      window.location.assign(authorizationUrl)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start Google sign-in"
      )
      setIsConnectingGoogle(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    setIsDisconnectingGoogle(true)

    try {
      await disconnectGoogleSheets()
      setSpreadsheetOptions([])
      setSheetTabOptions([])
      setSpreadsheetLoadError(null)
      toast.success("Google account disconnected")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to disconnect Google account"
      )
    } finally {
      setIsDisconnectingGoogle(false)
    }
  }

  const handleConnectGoogleCalendar = async () => {
    setIsConnectingGoogleCalendar(true)

    try {
      const { authorizationUrl } = await getGoogleCalendarOAuthUrl()
      window.location.assign(authorizationUrl)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start Google sign-in"
      )
      setIsConnectingGoogleCalendar(false)
    }
  }

  const handleDisconnectGoogleCalendar = async () => {
    setIsDisconnectingGoogleCalendar(true)

    try {
      await disconnectGoogleCalendar()
      toast.success("Google Calendar disconnected")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to disconnect Google Calendar"
      )
    } finally {
      setIsDisconnectingGoogleCalendar(false)
    }
  }

  const handleSaveGoogleKey = async () => {
    if (!googleApiKey.trim()) {
      toast.error("Google Sheets API key is required")
      return
    }

    setIsSavingGoogleKey(true)

    try {
      await upsertGoogleSheetsApiKey({ apiKey: googleApiKey.trim() })
      setGoogleApiKey("")
      toast.success("Google Sheets API key saved")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save Google Sheets key"
      )
    } finally {
      setIsSavingGoogleKey(false)
    }
  }

  const handleSheetColumnsChange = (
    field: "searchColumns" | "valueColumns" | "updateColumns",
    columns: string[]
  ) => {
    setIsDirty(true)
    setEditor((current) => {
      const nextConfig = { ...current.config, [field]: columns }
      const operation = nextConfig.operation ?? "lookup"

      return {
        ...current,
        config: nextConfig,
        parameters: buildGoogleSheetsParameters({
          operation,
          searchColumns: nextConfig.searchColumns ?? [],
          valueColumns: nextConfig.valueColumns ?? [],
          updateColumns: nextConfig.updateColumns ?? [],
        }),
      }
    })
  }

  const showEditor = selectedTool !== null || selectedToolId === "new"

  const saveShortcutRef = useRef<() => void>(() => {})

  useEffect(() => {
    saveShortcutRef.current = () => {
      if (!showEditor || isSaving) return
      void handleSave()
    }
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        saveShortcutRef.current()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const testBlockedReason = useMemo(() => {
    if (!selectedTool || selectedToolId === "new") {
      return "Save this tool before running a test."
    }

    if (isDirty) {
      return "Save your changes before running a test."
    }

    if (!editor.isEnabled) {
      return "Turn the tool on to run it."
    }

    if (!editor.enabledForChat) {
      return "Tests run over the chat channel — enable Chat first."
    }

    return null
  }, [
    editor.enabledForChat,
    editor.isEnabled,
    isDirty,
    selectedTool,
    selectedToolId,
  ])

  /* ── setup readiness ───────────────────────────────────────────────── */

  const blueprintAuth = activeBlueprint?.auth
  const credential = credentialState(editor.config, blueprintAuth)
  const endpointValue =
    (selectedToolType === "custom_webhook"
      ? editor.config.webhookUrl
      : editor.config.url
    )?.trim() ?? ""

  const readinessSteps: ReadinessStep[] = (() => {
    const toSetup = {
      label: "Go to setup",
      onClick: () => setEditorTab("setup"),
    }
    const namedParameters = editor.parameters.every((parameter) =>
      parameter.name.trim()
    )
    const steps: ReadinessStep[] = [
      {
        id: "identity",
        label: "Describe when to use it",
        description:
          "Your assistant only uses a tool when a conversation matches its description. Write it below.",
        done: Boolean(editor.name.trim() && editor.description.trim()),
      },
    ]

    if (isGoogleSheetsEditor) {
      steps.push(
        {
          id: "google",
          label: "Connect your Google account",
          description:
            "Connect once — every spreadsheet tool uses the same account.",
          done: isGoogleConnected,
          action: toSetup,
        },
        {
          id: "sheet",
          label: "Choose the spreadsheet and tab",
          description: "Column names are read from the first row of that tab.",
          done: Boolean(
            editor.config.spreadsheetId?.trim() && editor.config.range?.trim()
          ),
          action: toSetup,
        },
        {
          id: "columns",
          label: "Choose the columns",
          description:
            "The columns you pick decide what your assistant asks the customer for.",
          done:
            (editor.config.searchColumns?.length ?? 0) > 0 ||
            (editor.config.valueColumns?.length ?? 0) > 0,
          action: toSetup,
        }
      )
    } else if (isGoogleCalendarEditor) {
      steps.push(
        {
          id: "google-calendar",
          label: "Connect Google Calendar",
          description:
            "Connect once — every calendar tool uses the same account.",
          done: isGoogleCalendarConnected,
          action: toSetup,
        },
        {
          id: "calendar",
          label: "Choose the calendar",
          description: "The calendar this tool checks and books on.",
          done: Boolean(editor.config.calendarId?.trim()),
          action: toSetup,
        },
        {
          id: "arguments",
          label: "Name every value your assistant fills in",
          description: "A value without a name can't be sent.",
          done: namedParameters,
          action: toSetup,
        }
      )
    } else if (!selectedTool?.isBuiltin) {
      steps.push({
        id: "endpoint",
        label: "Add the web address",
        description:
          "Where the request goes when your assistant uses this tool.",
        done: Boolean(endpointValue),
        action: toSetup,
      })

      if (credential !== "not_required") {
        steps.push({
          id: "credential",
          label: blueprintAuth?.label ?? "Add your key",
          description:
            credential === "placeholder"
              ? "The example key from the template is still there — replace it with your real one."
              : `${presentation.vendor} refuses the request without it.`,
          done: credential === "set",
          action: toSetup,
        })
      }

      steps.push({
        id: "arguments",
        label: "Name every value your assistant fills in",
        description: "A value without a name can't be sent.",
        done: namedParameters,
        action: toSetup,
      })
    }

    const isSaved = !isDirty && selectedToolId !== "new"

    steps.push({
      id: "live",
      label: "Save it and switch it on",
      description: !isSaved
        ? "Changes only reach customers once they're saved."
        : !editor.isEnabled
          ? "It's switched off, so your assistant won't use it."
          : "Turn it on for chat, voice calls, or both.",
      done:
        isSaved &&
        editor.isEnabled &&
        (editor.enabledForChat || editor.enabledForVoice),
      action: !isSaved
        ? {
            label: selectedToolId === "new" ? "Add tool" : "Save now",
            onClick: () => void handleSave(),
          }
        : !editor.isEnabled
          ? {
              label: "Switch on",
              onClick: () => patchEditor({ isEnabled: true }),
            }
          : undefined,
    })

    return steps
  })()

  const readyCount = readinessSteps.filter((step) => step.done).length
  const isToolReady = readyCount === readinessSteps.length

  if (tools === undefined) {
    return <ToolsSkeleton />
  }

  /* ── page facts ────────────────────────────────────────────────────── */

  const connections: ToolConnections = {
    isGoogleSheetsConnected: isGoogleConnected,
    isGoogleCalendarConnected,
  }
  const statuses = new Map<string, ToolStatus>(
    tools.map((tool) => [tool._id, toolStatus(tool, connections)])
  )
  const liveTools = tools.filter(
    (tool) => statuses.get(tool._id)?.tone === "live"
  )
  const attentionTools = tools.filter(
    (tool) => statuses.get(tool._id)?.tone === "attention"
  )
  const chatCount = tools.filter(
    (tool) => tool.isEnabled && tool.enabledForChat
  ).length
  const voiceCount = tools.filter(
    (tool) => tool.isEnabled && tool.enabledForVoice
  ).length
  const liveVendors = [
    ...new Set(
      liveTools
        .filter((tool) => !tool.isBuiltin)
        .map((tool) => resolveToolPresentation(tool).vendor)
    ),
  ]

  const goToLibrary = () => guardUnsaved(() => setSection("catalog"))
  const lowerFirst = (text: string) =>
    text.charAt(0).toLowerCase() + text.slice(1)

  const EDITOR_TABS: Array<{ id: EditorTab; label: string }> = [
    { id: "overview", label: "Overview" },
    ...(selectedTool?.isBuiltin
      ? []
      : [{ id: "setup" as const, label: "Setup" }]),
    { id: "test", label: "Try it" },
  ]
  const activeEditorTab: EditorTab =
    selectedTool?.isBuiltin && editorTab === "setup" ? "overview" : editorTab
  const operation = editor.config.operation ?? "lookup"
  const isNewTool = selectedToolId === "new"
  const panelTitle = selectedTool
    ? toolDisplayName(selectedTool)
    : (activeBlueprint?.title ?? "New tool")
  const panelStatus: ToolStatus = isNewTool
    ? { tone: "attention", label: "Not added yet — save to finish" }
    : isDirty
      ? { tone: "attention", label: "Unsaved changes" }
      : selectedTool
        ? (statuses.get(selectedTool._id) ?? { tone: "off", label: "" })
        : { tone: "off", label: "" }
  const credentialDone = credential === "set" || credential === "not_required"
  const parametersNamed = editor.parameters.every((parameter) =>
    parameter.name.trim()
  )

  /* ── hero ──────────────────────────────────────────────────────────── */

  const hero = (
    <section className="pt-2 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="console-eyebrow">Assistant tools</p>
        {section === "catalog" ? null : (
          <Button onClick={goToLibrary} size="sm" type="button">
            <PlusIcon data-icon="inline-start" />
            Add a tool
          </Button>
        )}
      </div>

      {attentionTools.length ? (
        <>
          <h1 className="report-headline mt-6 max-w-[22ch]">
            <span className="report-headline-figure">
              {attentionTools.length}{" "}
              {attentionTools.length === 1 ? "tool" : "tools"}
            </span>{" "}
            {attentionTools.length === 1 ? "needs" : "need"} a minute of your
            time.
          </h1>
          <p className="report-lede mt-5 max-w-[64ch]">
            {attentionTools.slice(0, 3).map((tool, index) => (
              <span key={tool._id}>
                {index > 0 ? " " : null}
                <button
                  className="font-semibold text-foreground underline decoration-[var(--outcome-open)] decoration-2 underline-offset-4"
                  onClick={() => openToolAndReveal(tool)}
                  type="button"
                >
                  {toolDisplayName(tool)}
                </button>
                : {lowerFirst(statuses.get(tool._id)?.label ?? "")}.
              </span>
            ))}
            {attentionTools.length > 3
              ? ` And ${attentionTools.length - 3} more.`
              : null}{" "}
            Until then your assistant can&apos;t use{" "}
            {attentionTools.length === 1 ? "it" : "them"}
            {liveTools.length ? (
              <>
                {" "}
                — the other <strong>{liveTools.length}</strong>{" "}
                {liveTools.length === 1 ? "is" : "are"} working normally.
              </>
            ) : (
              "."
            )}
          </p>
        </>
      ) : integrationTools.length && liveTools.length ? (
        <>
          <h1 className="report-headline mt-6 max-w-[22ch]">
            Your assistant can{" "}
            <span className="report-headline-figure">
              do {liveTools.length}{" "}
              {liveTools.length === 1 ? "thing" : "things"}
            </span>{" "}
            for your customers.
          </h1>
          <p className="report-lede mt-5 max-w-[64ch]">
            {liveVendors.length ? (
              <>
                It looks things up and takes action in{" "}
                {liveVendors.slice(0, 3).map((vendor, index, list) => (
                  <span key={vendor}>
                    {index > 0
                      ? index === list.length - 1
                        ? " and "
                        : ", "
                      : null}
                    <strong>{vendor}</strong>
                  </span>
                ))}
                {liveVendors.length > 3
                  ? ` and ${liveVendors.length - 3} more`
                  : null}
                , while the customer is still talking to it.{" "}
              </>
            ) : null}
            <strong>{chatCount}</strong>{" "}
            {chatCount === 1 ? "tool works" : "tools work"} in chat and{" "}
            <strong>{voiceCount}</strong> on voice calls.
          </p>
        </>
      ) : integrationTools.length ? (
        <>
          <h1 className="report-headline mt-6 max-w-[22ch]">
            Your connected apps are all switched off.
          </h1>
          <p className="report-lede mt-5 max-w-[64ch]">
            Your assistant still searches your knowledge base and passes chats
            to your team, but it won&apos;t use any of the{" "}
            <strong>{integrationTools.length}</strong> apps you connected until
            you turn one back on.
          </p>
        </>
      ) : (
        <>
          <h1 className="report-headline mt-6 max-w-[20ch]">
            Let your assistant{" "}
            <span className="report-headline-figure">get things done</span>, not
            just answer.
          </h1>
          <p className="report-lede mt-5 max-w-[64ch]">
            Right now it can search your knowledge base, pass a chat to your
            team and close finished conversations. Connect the apps you already
            use and it can check an order, book a meeting or add a lead to your
            CRM — while the customer is still chatting.
          </p>
          {section === "catalog" ? null : (
            <Button
              className="mt-7"
              onClick={goToLibrary}
              type="button"
              variant="outline"
            >
              Browse {ADDABLE_BLUEPRINTS.length} ready-made tools
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}
        </>
      )}
    </section>
  )

  const figures = (
    <div className="report-figures grid grid-cols-2 md:grid-cols-4">
      <Figure
        label="Working now"
        note={`Out of ${tools.length} ${tools.length === 1 ? "tool" : "tools"}`}
        value={liveTools.length}
      />
      <Figure
        label="In chat"
        note="Website widget and messaging apps"
        value={chatCount}
      />
      <Figure
        label="On voice calls"
        note="Your voice assistant"
        value={voiceCount}
      />
      <Figure
        label="Ready to add"
        note={`From ${ADDABLE_VENDOR_COUNT} apps`}
        value={ADDABLE_BLUEPRINTS.length}
      />
    </div>
  )

  /* ── editor: overview ──────────────────────────────────────────────── */

  const overviewTab = (
    <div className="space-y-12">
      <section>
        <h3 className="report-section-title">
          {isToolReady ? "Ready to use" : "Finish setting up"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isToolReady
            ? "Nothing is missing."
            : `${readyCount} of ${readinessSteps.length} steps done. A tool that isn't finished fails quietly in the middle of a conversation.`}
        </p>
        <div className="mt-6">
          <ToolReadiness steps={readinessSteps} />
        </div>
      </section>

      <section>
        <label
          className="report-section-title block"
          htmlFor="tool-description"
        >
          When should your assistant use it?
        </label>
        <p className="mt-1 max-w-[64ch] text-sm leading-relaxed text-muted-foreground">
          Your assistant reads this to decide when the tool fits. Describe the
          situation a customer is in — not the technology.
        </p>
        <Textarea
          className="mt-4 text-[0.95rem] leading-relaxed"
          id="tool-description"
          maxLength={1000}
          onChange={(event) => patchEditor({ description: event.target.value })}
          placeholder="Use when a customer asks where their order is and gives an order number or the email they ordered with."
          rows={4}
          value={editor.description}
        />
        <div className="mt-2 flex items-start justify-between gap-4 text-xs text-muted-foreground">
          <p>
            Good descriptions say <em>when</em> and{" "}
            <em>what the customer gives you</em>.
          </p>
          <p className="shrink-0 tabular-nums">
            {editor.description.length} / 1000
          </p>
        </div>
      </section>

      <section>
        <h3 className="report-section-title">Where it works</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose where customers can reach this tool through your assistant.
        </p>
        <div className="mt-4">
          <FieldRow
            control={
              <Switch
                checked={editor.enabledForChat}
                id="tool-channel-chat"
                onCheckedChange={(checked) =>
                  patchEditor({ enabledForChat: checked })
                }
              />
            }
            hint="Your website widget, Telegram, WhatsApp and Instagram"
            htmlFor="tool-channel-chat"
            label="Chat"
          />
          <FieldRow
            control={
              <Switch
                checked={
                  isVoiceUnsupportedTool ? false : editor.enabledForVoice
                }
                disabled={isVoiceUnsupportedTool}
                id="tool-channel-voice"
                onCheckedChange={(checked) =>
                  patchEditor({ enabledForVoice: checked })
                }
              />
            }
            hint={
              isVoiceUnsupportedTool
                ? "Voice calls can't hand over or close a conversation"
                : "Your voice assistant, on OpenAI Realtime and Gemini Live"
            }
            htmlFor="tool-channel-voice"
            label="Voice calls"
          />
        </div>
        {!editor.isEnabled ? (
          <Callout className="mt-5">
            This tool is switched off, so neither channel uses it.{" "}
            <button
              className="font-medium underline underline-offset-4"
              onClick={() => patchEditor({ isEnabled: true })}
              type="button"
            >
              Turn it on
            </button>
          </Callout>
        ) : null}
      </section>

      {selectedTool?.type === "query" ? (
        <section>
          <h3 className="report-section-title">How it reads your documents</h3>
          <p className="mt-1 max-w-[64ch] text-sm text-muted-foreground">
            The AI model that reads what the search finds before your assistant
            answers. Faster models cost less; stronger ones handle long,
            detailed documents better.
          </p>
          <div className="mt-4 max-w-sm">
            <Select
              onValueChange={(value) =>
                patchConfig({ knowledgeBaseModel: value })
              }
              value={editor.config.knowledgeBaseModel ?? "gpt-4o-mini"}
            >
              <SelectTrigger
                aria-label="Knowledge base model"
                className="w-full"
              >
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {CHAT_MODEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      ) : null}

      {selectedTool?.isBuiltin ? (
        <Callout tone="info">
          Built-in tools run inside Osonflow — there&apos;s nothing to connect
          and no key to store.
        </Callout>
      ) : (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="report-section-title">Connection</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                How this tool reaches {presentation.vendor}.
              </p>
            </div>
            <Button
              onClick={() => setEditorTab("setup")}
              size="sm"
              type="button"
              variant="outline"
            >
              <SlidersHorizontalIcon data-icon="inline-start" />
              Change setup
            </Button>
          </div>
          <dl className="mt-4">
            <div className="tools-field flex items-center justify-between gap-6 py-3.5">
              <dt className="text-sm text-muted-foreground">App</dt>
              <dd className="truncate text-sm font-medium text-foreground">
                {presentation.vendor}
              </dd>
            </div>
            {isGoogleSheetsEditor || isGoogleCalendarEditor ? (
              <div className="tools-field flex items-center justify-between gap-6 py-3.5">
                <dt className="text-sm text-muted-foreground">
                  Google account
                </dt>
                <dd className="min-w-0">
                  <StatusLine
                    label={
                      (
                        isGoogleSheetsEditor
                          ? isGoogleConnected
                          : isGoogleCalendarConnected
                      )
                        ? ((isGoogleSheetsEditor
                            ? googleSheetsStatus?.email
                            : googleCalendarStatus?.email) ?? "Connected")
                        : "Not connected"
                    }
                    tone={
                      (
                        isGoogleSheetsEditor
                          ? isGoogleConnected
                          : isGoogleCalendarConnected
                      )
                        ? "live"
                        : "attention"
                    }
                  />
                </dd>
              </div>
            ) : (
              <>
                <div className="tools-field flex items-center justify-between gap-6 py-3.5">
                  <dt className="shrink-0 text-sm text-muted-foreground">
                    Sends to
                  </dt>
                  <dd className="min-w-0 truncate font-mono text-xs text-foreground">
                    {endpointValue || (
                      <span className="font-sans text-sm text-muted-foreground">
                        Not set yet
                      </span>
                    )}
                  </dd>
                </div>
                <div className="tools-field flex items-center justify-between gap-6 py-3.5">
                  <dt className="shrink-0 text-sm text-muted-foreground">
                    Key
                  </dt>
                  <dd className="min-w-0">
                    <StatusLine
                      label={
                        credential === "not_required"
                          ? blueprintAuth
                            ? AUTH_KIND_LABELS[blueprintAuth.kind]
                            : "No key needed"
                          : CREDENTIAL_STATE_COPY[credential]
                      }
                      tone={credentialDone ? "live" : "attention"}
                    />
                  </dd>
                </div>
              </>
            )}
          </dl>
        </section>
      )}

      <div className="border-t border-[var(--report-rule)]">
        <Disclosure summary="Advanced: the name your assistant calls it by">
          <div className="max-w-md space-y-2">
            <Input
              aria-describedby="tool-name-hint"
              aria-label="Tool name"
              className="font-mono text-xs"
              disabled={selectedTool?.isBuiltin}
              id="tool-name"
              onChange={(event) => patchEditor({ name: event.target.value })}
              placeholder="lookup_order"
              value={editor.name}
            />
            <p
              className="text-xs leading-relaxed text-muted-foreground"
              id="tool-name-hint"
            >
              {selectedTool?.isBuiltin ? (
                "Built-in tools keep a fixed name."
              ) : editor.name &&
                previewToolName(editor.name) !== editor.name ? (
                <>
                  Will be saved as{" "}
                  <code className="font-mono text-foreground">
                    {previewToolName(editor.name) || "—"}
                  </code>
                </>
              ) : (
                "Only the AI sees this. Lowercase letters, numbers and underscores."
              )}
            </p>
          </div>
        </Disclosure>
      </div>
    </div>
  )

  /* ── editor: setup ─────────────────────────────────────────────────── */

  const setupHint = activeBlueprint?.setupHint ? (
    <Callout className="mb-10" tone="info">
      {activeBlueprint.setupHint}
      {activeBlueprint.docsUrl ? (
        <>
          {" "}
          <a
            className="inline-flex items-center gap-1 font-medium underline underline-offset-4"
            href={activeBlueprint.docsUrl}
            rel="noreferrer"
            target="_blank"
          >
            {presentation.vendor} docs
            <ExternalLinkIcon aria-hidden className="size-3" />
          </a>
        </>
      ) : null}
    </Callout>
  ) : null

  const methodSelect = (field: "method" | "webhookMethod") => (
    <Select
      onValueChange={(value: "GET" | "POST") => patchConfig({ [field]: value })}
      value={editor.config[field] ?? "POST"}
    >
      <SelectTrigger aria-label="Request method" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="POST">POST — send data</SelectItem>
        <SelectItem value="GET">GET — fetch data</SelectItem>
      </SelectContent>
    </Select>
  )

  const sheetsSetup = (
    <Steps>
      <Step
        description="Connect once — every spreadsheet tool uses the same account."
        done={isGoogleConnected}
        index={1}
        title="Connect your Google account"
      >
        <GoogleConnectionCard
          apiKey={googleApiKey}
          isConnecting={isConnectingGoogle}
          isDisconnecting={isDisconnectingGoogle}
          isRefreshing={isLoadingSpreadsheets}
          isSavingApiKey={isSavingGoogleKey}
          loadError={spreadsheetLoadError}
          onApiKeyChange={setGoogleApiKey}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnectGoogle}
          onManage={() => guardUnsaved(() => setSection("connections"))}
          onRefresh={() => void loadSpreadsheetOptions()}
          onSaveApiKey={handleSaveGoogleKey}
          onToggleApiKeyFallback={() =>
            setShowApiKeyFallback((current) => !current)
          }
          showApiKeyFallback={showApiKeyFallback}
          spreadsheetCount={spreadsheetOptions.length}
          status={googleSheetsStatus}
          variant="compact"
        />
      </Step>

      <Step
        description="Pick the file and the tab. The first row of the tab should hold your column names."
        done={Boolean(
          editor.config.spreadsheetId?.trim() && editor.config.range?.trim()
        )}
        index={2}
        title="Choose the spreadsheet"
      >
        {operation !== "lookup" &&
        googleSheetsStatus?.authMethod === "api_key" ? (
          <Callout className="mb-4">
            An API key can only look rows up. Connect a Google account to add,
            change or delete rows.
          </Callout>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground" id="sheet-file-label">
              Spreadsheet
            </p>
            {googleSheetsStatus?.authMethod === "oauth" &&
            !useManualSpreadsheetId ? (
              <>
                {spreadsheetOptions.length > 8 ? (
                  <Input
                    aria-label="Filter spreadsheets"
                    onChange={(event) =>
                      setSpreadsheetFilter(event.target.value)
                    }
                    placeholder="Filter spreadsheets…"
                    value={spreadsheetFilter}
                  />
                ) : null}
                <Select
                  disabled={isLoadingSpreadsheets}
                  onValueChange={(value) =>
                    patchConfig({ spreadsheetId: value })
                  }
                  value={editor.config.spreadsheetId || undefined}
                >
                  <SelectTrigger
                    aria-labelledby="sheet-file-label"
                    className="w-full"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingSpreadsheets
                          ? "Loading your spreadsheets…"
                          : "Choose a spreadsheet"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSpreadsheetOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {spreadsheetOptions.length === 0 &&
                !isLoadingSpreadsheets &&
                !spreadsheetLoadError ? (
                  <p className="text-xs text-muted-foreground">
                    No spreadsheets found in this Google account.
                  </p>
                ) : null}
                <button
                  className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  onClick={() => setUseManualSpreadsheetId(true)}
                  type="button"
                >
                  Paste a spreadsheet ID instead
                </button>
              </>
            ) : (
              <>
                <Input
                  aria-labelledby="sheet-file-label"
                  className="font-mono text-xs"
                  onChange={(event) =>
                    patchConfig({ spreadsheetId: event.target.value })
                  }
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={editor.config.spreadsheetId ?? ""}
                />
                {googleSheetsStatus?.authMethod === "oauth" ? (
                  <button
                    className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    onClick={() => setUseManualSpreadsheetId(false)}
                    type="button"
                  >
                    Choose from my Google Drive
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    It&apos;s the long code in the spreadsheet&apos;s web
                    address, between /d/ and /edit.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground" id="sheet-tab-label">
              Tab
            </p>
            {googleSheetsStatus?.isConfigured && sheetTabOptions.length > 0 ? (
              <Select
                disabled={isLoadingSheetTabs}
                onValueChange={(value) => patchConfig({ range: value })}
                value={editor.config.range || undefined}
              >
                <SelectTrigger
                  aria-labelledby="sheet-tab-label"
                  className="w-full"
                >
                  <SelectValue
                    placeholder={
                      isLoadingSheetTabs ? "Loading tabs…" : "Choose a tab"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sheetTabOptions.map((tab) => (
                    <SelectItem key={tab} value={tab}>
                      {tab}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                aria-labelledby="sheet-tab-label"
                disabled={!editor.config.spreadsheetId?.trim()}
                onChange={(event) => patchConfig({ range: event.target.value })}
                placeholder="Sheet1"
                value={editor.config.range ?? ""}
              />
            )}
          </div>
        </div>
      </Step>

      <Step
        description={`This tool will ${GOOGLE_SHEETS_OPERATION_LABELS[operation].toLowerCase()}. Pick which columns it may use.`}
        done={
          (editor.config.searchColumns?.length ?? 0) > 0 ||
          (editor.config.valueColumns?.length ?? 0) > 0
        }
        index={3}
        title="Choose the columns"
      >
        <div className="space-y-8">
          {operation === "lookup" ||
          operation === "update" ||
          operation === "delete" ? (
            <SheetColumnPicker
              columns={sheetColumnOptions}
              description="Used to find the right row. The assistant asks the customer for these and matches them against what's already in the sheet."
              isLoading={isLoadingSheetColumns}
              label="Find the row by"
              onChange={(columns) =>
                handleSheetColumnsChange("searchColumns", columns)
              }
              selected={editor.config.searchColumns ?? []}
            />
          ) : null}

          {operation === "append" ? (
            <SheetColumnPicker
              columns={sheetColumnOptions}
              description="The columns your assistant fills in when it adds a new row."
              isLoading={isLoadingSheetColumns}
              label="Fill in"
              onChange={(columns) =>
                handleSheetColumnsChange("valueColumns", columns)
              }
              selected={editor.config.valueColumns ?? []}
            />
          ) : null}

          {operation === "update" ? (
            <SheetColumnPicker
              columns={sheetColumnOptions}
              description="The columns your assistant may change once it finds the row."
              isLoading={isLoadingSheetColumns}
              label="Allowed to change"
              onChange={(columns) =>
                handleSheetColumnsChange("updateColumns", columns)
              }
              selected={editor.config.updateColumns ?? []}
            />
          ) : null}

          {operation === "lookup" ? (
            <SheetColumnPicker
              columns={sheetColumnOptions}
              description="Only these columns are read back to your assistant. Leave all unselected to share every column."
              isLoading={isLoadingSheetColumns}
              label="Share back (optional)"
              onChange={(columns) => patchConfig({ returnColumns: columns })}
              selected={editor.config.returnColumns ?? []}
            />
          ) : null}
        </div>
      </Step>

      <Step
        description="Generated from your columns — your assistant collects exactly these from the customer."
        done={editor.parameters.length > 0}
        index={4}
        title="Check what your assistant will ask for"
      >
        {editor.parameters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Choose columns above and they appear here.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {editor.parameters.map((parameter) => (
                <span className="tools-tag font-mono" key={parameter.name}>
                  {parameter.name}
                  {parameter.required ? null : (
                    <span className="ml-1 font-sans text-muted-foreground">
                      optional
                    </span>
                  )}
                </span>
              ))}
            </div>
            {operation === "update" ? (
              <p className="max-w-[64ch] text-xs leading-relaxed text-muted-foreground">
                A column used both to find the row and to change it appears
                twice: the plain name is the value already in the sheet, and the{" "}
                <span className="font-mono">new_</span> one is the corrected
                value to write.
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-6 border-t border-[var(--report-rule)]">
          <Disclosure summary="Advanced: matching and limits">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sheet-match-mode">How values are matched</Label>
                <Select
                  onValueChange={(value: "contains" | "exact" | "equals") =>
                    patchConfig({ matchMode: value })
                  }
                  value={editor.config.matchMode ?? "exact"}
                >
                  <SelectTrigger className="w-full" id="sheet-match-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_SHEETS_MATCH_MODE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {
                    GOOGLE_SHEETS_MATCH_MODE_OPTIONS.find(
                      (option) =>
                        option.value === (editor.config.matchMode ?? "exact")
                    )?.description
                  }
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sheet-query-strategy">Search method</Label>
                <Select
                  onValueChange={(value: "gviz" | "scan") =>
                    patchConfig({ queryStrategy: value })
                  }
                  value={editor.config.queryStrategy ?? "gviz"}
                >
                  <SelectTrigger className="w-full" id="sheet-query-strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOOGLE_SHEETS_QUERY_STRATEGY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {
                    GOOGLE_SHEETS_QUERY_STRATEGY_OPTIONS.find(
                      (option) =>
                        option.value === (editor.config.queryStrategy ?? "gviz")
                    )?.description
                  }
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sheet-max-rows">Most rows returned</Label>
                <Input
                  id="sheet-max-rows"
                  max={200}
                  min={1}
                  onChange={(event) =>
                    patchConfig({ maxLookupRows: Number(event.target.value) })
                  }
                  type="number"
                  value={editor.config.maxLookupRows ?? 25}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sheet-max-scan">Most rows scanned</Label>
                <Input
                  id="sheet-max-scan"
                  max={50000}
                  min={100}
                  onChange={(event) =>
                    patchConfig({ maxScanRows: Number(event.target.value) })
                  }
                  type="number"
                  value={editor.config.maxScanRows ?? 5000}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sheet-header-row">Row with column names</Label>
                <Input
                  id="sheet-header-row"
                  max={100}
                  min={1}
                  onChange={(event) =>
                    patchConfig({ headerRow: Number(event.target.value) })
                  }
                  type="number"
                  value={editor.config.headerRow ?? 1}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sheet-data-range">Cell range (optional)</Label>
                <Input
                  id="sheet-data-range"
                  onChange={(event) =>
                    patchConfig({ dataRange: event.target.value })
                  }
                  placeholder="A1:Z5000"
                  value={editor.config.dataRange ?? ""}
                />
                <p className="text-xs text-muted-foreground">
                  Limits large scans. Leave empty for the automatic limit.
                </p>
              </div>

              {operation === "update" || operation === "delete" ? (
                <div className="md:col-span-2">
                  <FieldRow
                    control={
                      <Switch
                        checked={editor.config.requireUniqueMatch ?? true}
                        id="sheet-unique-match"
                        onCheckedChange={(checked) =>
                          patchConfig({ requireUniqueMatch: checked })
                        }
                      />
                    }
                    hint="Stops the change when more than one row matches, so the wrong row is never touched."
                    htmlFor="sheet-unique-match"
                    label="Only change a single, exact match"
                  />
                </div>
              ) : null}
            </div>
          </Disclosure>
        </div>
      </Step>
    </Steps>
  )

  const calendarSetup = (
    <Steps>
      <Step
        description="Connect once — every calendar tool uses the same account."
        done={isGoogleCalendarConnected}
        index={1}
        title="Connect Google Calendar"
      >
        <GoogleCalendarConnectionCard
          isConnecting={isConnectingGoogleCalendar}
          isDisconnecting={isDisconnectingGoogleCalendar}
          onConnect={handleConnectGoogleCalendar}
          onDisconnect={handleDisconnectGoogleCalendar}
          onManage={() => guardUnsaved(() => setSection("connections"))}
          status={googleCalendarStatus}
          variant="compact"
        />
      </Step>

      <Step
        description={
          <>
            Type <code className="font-mono text-foreground">primary</code> for
            the connected account&apos;s own calendar, or paste another
            calendar&apos;s ID from its settings in Google Calendar.
          </>
        }
        done={Boolean(editor.config.calendarId?.trim())}
        index={2}
        title="Choose the calendar"
      >
        <Input
          aria-label="Calendar ID"
          className="max-w-md font-mono text-xs"
          onChange={(event) => patchConfig({ calendarId: event.target.value })}
          placeholder="primary"
          value={editor.config.calendarId ?? ""}
        />
      </Step>

      <Step
        description="Each value is something your assistant works out from the conversation."
        done={parametersNamed}
        index={3}
        title="What your assistant fills in"
      >
        <ToolParametersEditor
          onChange={(parameters) => patchEditor({ parameters })}
          parameters={editor.parameters}
        />
      </Step>
    </Steps>
  )

  const developerDetails = (
    <div className="mt-12 border-t border-[var(--report-rule)]">
      {selectedToolType === "api_request" ? (
        <Disclosure summary="For developers: request body">
          {(editor.config.method ?? "POST") === "POST" ? (
            <div className="space-y-2">
              <Textarea
                aria-describedby="body-template-hint"
                aria-label="Body template"
                className="font-mono text-xs"
                onChange={(event) =>
                  patchConfig({ bodyTemplate: event.target.value })
                }
                rows={8}
                value={editor.config.bodyTemplate ?? ""}
              />
              <p
                className="text-xs text-muted-foreground"
                id="body-template-hint"
              >
                Use{" "}
                <code className="font-mono text-foreground">
                  {"{{value_name}}"}
                </code>{" "}
                where a value from your assistant should go. Leave it empty to
                send the values as plain JSON.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              A GET request has no body — every value is added to the web
              address instead.
            </p>
          )}
        </Disclosure>
      ) : null}
      <Disclosure summary="For developers: preview the exact request">
        <RequestPreview
          config={editor.config}
          parameters={editor.parameters}
          type={selectedToolType ?? "api_request"}
        />
      </Disclosure>
    </div>
  )

  const apiSetup = (
    <>
      <Steps>
        <Step
          description="The web address from the app's documentation."
          done={Boolean(endpointValue)}
          index={1}
          title="Where it sends the request"
        >
          <div className="grid gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
            {methodSelect("method")}
            <Input
              aria-label="Web address"
              className="font-mono text-xs"
              onChange={(event) => patchConfig({ url: event.target.value })}
              placeholder={
                activeBlueprint?.endpointPlaceholder ??
                "https://api.example.com/v1/lookup"
              }
              type="url"
              value={editor.config.url ?? ""}
            />
          </div>
        </Step>

        <Step
          description="Stored with this tool and only ever sent to the address above."
          done={credentialDone}
          index={2}
          title={
            blueprintAuth && blueprintAuth.kind !== "none"
              ? `Add your ${blueprintAuth.label.charAt(0).toLowerCase()}${blueprintAuth.label.slice(1)}`
              : "Add your key, if it needs one"
          }
        >
          <RequestHeadersEditor
            authSpec={blueprintAuth}
            key={`headers-${String(selectedToolId ?? "new")}`}
            onChange={(value) => patchConfig({ headersJson: value })}
            value={editor.config.headersJson ?? "{}"}
          />
        </Step>

        <Step
          description="Each value is something your assistant works out from the conversation."
          done={parametersNamed}
          index={3}
          title="What your assistant fills in"
        >
          <ToolParametersEditor
            onChange={(parameters) => patchEditor({ parameters })}
            parameters={editor.parameters}
          />
        </Step>
      </Steps>
      {developerDetails}
    </>
  )

  const webhookSetup = (
    <>
      <Steps>
        <Step
          description="Your assistant's values arrive there as a simple JSON object — ideal for Zapier, Make, n8n or your own server."
          done={Boolean(endpointValue)}
          index={1}
          title="Where it sends the data"
        >
          <div className="grid gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
            {methodSelect("webhookMethod")}
            <Input
              aria-label="Webhook address"
              className="font-mono text-xs"
              onChange={(event) =>
                patchConfig({ webhookUrl: event.target.value })
              }
              placeholder={
                activeBlueprint?.endpointPlaceholder ??
                "https://hooks.example.com/assistant-tool"
              }
              type="url"
              value={editor.config.webhookUrl ?? ""}
            />
          </div>
        </Step>

        <Step
          description="Each value is something your assistant works out from the conversation."
          done={parametersNamed}
          index={2}
          title="What your assistant fills in"
        >
          <ToolParametersEditor
            onChange={(parameters) => patchEditor({ parameters })}
            parameters={editor.parameters}
          />
        </Step>
      </Steps>
      {developerDetails}
    </>
  )

  const setupTab = (
    <div>
      {setupHint}
      {isGoogleSheetsEditor
        ? sheetsSetup
        : isGoogleCalendarEditor
          ? calendarSetup
          : selectedToolType === "custom_webhook"
            ? webhookSetup
            : apiSetup}
    </div>
  )

  /* ── editor: try it ────────────────────────────────────────────────── */

  const testTab = (
    <section>
      <h3 className="report-section-title">Try it before your customers do</h3>
      <p className="mt-1 max-w-[64ch] text-sm leading-relaxed text-muted-foreground">
        Type what a customer might tell your assistant, run the tool, and read
        exactly what comes back.
      </p>
      <div className="mt-8">
        <ToolTestConsole
          blockedReason={testBlockedReason}
          key={`test-${String(selectedToolId ?? "new")}`}
          onRun={async (args) => {
            if (!selectedTool) {
              throw new Error("Save this tool first.")
            }

            return await testExecute({ toolId: selectedTool._id, args })
          }}
          parameters={editor.parameters}
        />
      </div>
    </section>
  )

  /* ── editor panel ──────────────────────────────────────────────────── */

  const editorPanel = (
    <div className="setup-panel min-w-0" key={String(selectedToolId)}>
      <header className="pb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <BrandMark
              brand={presentation.brand}
              icon={presentation.icon}
              muted={!editor.isEnabled}
              size="xl"
            />
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">
                {presentation.vendor}
                {selectedTool?.isBuiltin ? " · Built in" : null}
              </p>
              <h2 className="setup-panel-title mt-1 break-words">
                {panelTitle}
              </h2>
              <StatusLine
                className="mt-2"
                label={panelStatus.label}
                tone={panelStatus.tone}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground">
              <Switch
                aria-label={
                  editor.isEnabled
                    ? "Switch this tool off"
                    : "Switch this tool on"
                }
                checked={editor.isEnabled}
                onCheckedChange={(checked) =>
                  patchEditor({ isEnabled: checked })
                }
              />
              {editor.isEnabled ? "On" : "Off"}
            </label>

            {selectedTool && !selectedTool.isBuiltin ? (
              // Non-modal, so opening the delete dialog from it never leaves
              // the page's pointer lock behind.
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="More actions"
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    {isDuplicating ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <EllipsisIcon />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem
                    disabled={isDuplicating}
                    onSelect={() => void handleDuplicate()}
                  >
                    <CopyIcon />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setIsDeleteDialogOpen(true)}
                    variant="destructive"
                  >
                    <Trash2Icon />
                    Delete tool
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {activeBlueprint?.summary ? (
          <p className="report-lede mt-5 max-w-[64ch]">
            {activeBlueprint.summary}
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-3 border-b border-[var(--report-rule)] sm:flex-row sm:items-end sm:justify-between">
        <div aria-label="Tool sections" className="report-filters" role="group">
          {EDITOR_TABS.map((tab) => (
            <ReportFilter
              active={activeEditorTab === tab.id}
              key={tab.id}
              onClick={() => setEditorTab(tab.id)}
            >
              {tab.label}
            </ReportFilter>
          ))}
        </div>
        <button
          className="mb-2.5 self-start sm:self-auto"
          onClick={() => setEditorTab("overview")}
          type="button"
        >
          <StatusLine
            label={
              isToolReady
                ? "Ready"
                : `${readinessSteps.length - readyCount} ${
                    readinessSteps.length - readyCount === 1 ? "step" : "steps"
                  } left`
            }
            tone={isToolReady ? "live" : "attention"}
          />
        </button>
      </div>

      <div className="pt-9" key={activeEditorTab}>
        {activeEditorTab === "overview"
          ? overviewTab
          : activeEditorTab === "setup"
            ? setupTab
            : testTab}
      </div>

      <div
        className="tools-savebar mt-12 flex flex-wrap items-center gap-2 py-2 pr-2 pl-5"
        data-dirty={isDirty || undefined}
      >
        <p
          aria-live="polite"
          className="mr-auto flex min-w-0 items-center gap-2.5 text-sm"
        >
          {isDirty ? (
            <>
              <span aria-hidden className="setup-dot" data-tone="attention" />
              <span className="truncate font-medium text-foreground">
                {isNewTool ? "Not added yet" : "Unsaved changes"}
              </span>
            </>
          ) : (
            <span className="truncate text-muted-foreground">
              Saved — changes apply everywhere this tool is on
            </span>
          )}
          <Kbd className="hidden sm:inline-flex">⌘S</Kbd>
        </p>

        {isNewTool ? (
          <Button onClick={cancelNewTool} type="button" variant="ghost">
            Cancel
          </Button>
        ) : isDirty && selectedTool ? (
          <Button
            onClick={() => {
              setEditor(toolToEditorState(selectedTool))
              setIsDirty(false)
            }}
            type="button"
            variant="ghost"
          >
            Discard
          </Button>
        ) : null}

        <Button
          className="rounded-full"
          disabled={isSaving || !isDirty}
          onClick={handleSave}
          type="button"
        >
          {isSaving ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : (
            <CheckIcon data-icon="inline-start" />
          )}
          {isNewTool ? "Add tool" : "Save"}
        </Button>
      </div>
    </div>
  )

  /* ── nothing selected ──────────────────────────────────────────────── */

  const startPanel = (
    <div className="setup-panel min-w-0 pb-10" key="start">
      <h2 className="setup-panel-title max-w-[22ch]">
        Pick a tool on the left to change what it does.
      </h2>
      <p className="report-lede mt-5 max-w-[60ch]">
        Or give your assistant something new to do. These are where most
        businesses start:
      </p>

      <ul className="mt-8">
        {FEATURED_BLUEPRINTS.slice(0, 5).map((blueprint) => {
          const needsGoogle = blueprint.requiresGoogle && !isGoogleConnected
          const installed = installedCounts[blueprint.id] ?? 0

          return (
            <li
              className="setup-row grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 px-2 py-3.5"
              key={blueprint.id}
            >
              <BrandMark brand={blueprint.brand} icon={blueprint.icon} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {blueprint.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {blueprint.summary}
                </p>
              </div>
              <Button
                onClick={() =>
                  needsGoogle
                    ? guardUnsaved(() => setSection("connections"))
                    : installBlueprint(blueprint)
                }
                size="sm"
                type="button"
                variant="outline"
              >
                {needsGoogle ? (
                  "Connect Google"
                ) : (
                  <>
                    <PlusIcon data-icon="inline-start" />
                    {installed ? "Add another" : "Add"}
                  </>
                )}
              </Button>
            </li>
          )
        })}
      </ul>

      <Button
        className="mt-7"
        onClick={goToLibrary}
        type="button"
        variant="outline"
      >
        See all {ADDABLE_BLUEPRINTS.length} tools
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )

  /* ── page ──────────────────────────────────────────────────────────── */

  return (
    <ConsolePage width="wide">
      <div className="report setup tools">
        {hero}
        {figures}

        <div
          className="mt-10 border-b border-[var(--report-rule)]"
          ref={sectionsRef}
        >
          <div
            aria-label="Assistant tools sections"
            className="report-filters"
            role="group"
          >
            {SECTIONS.map((entry) => (
              <ReportFilter
                active={section === entry.id}
                count={
                  entry.id === "tools"
                    ? tools.length
                    : entry.id === "catalog"
                      ? ADDABLE_BLUEPRINTS.length
                      : undefined
                }
                key={entry.id}
                onClick={() => guardUnsaved(() => setSection(entry.id))}
              >
                {entry.label}
              </ReportFilter>
            ))}
          </div>
        </div>

        {section === "tools" ? (
          <div className="grid gap-10 pt-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-14">
            <ToolIndex
              draft={
                isNewTool
                  ? {
                      title: activeBlueprint?.title ?? "New tool",
                      presentation,
                    }
                  : null
              }
              filter={libraryFilter}
              onAdd={goToLibrary}
              onFilterChange={setLibraryFilter}
              onOpen={openTool}
              onQueryChange={setLibraryQuery}
              query={libraryQuery}
              selectedToolId={isNewTool ? null : (selectedToolId ?? null)}
              statuses={statuses}
              tools={tools}
            />

            <div className="min-w-0 scroll-mt-6" ref={panelRef}>
              {showEditor ? editorPanel : startPanel}
            </div>
          </div>
        ) : null}

        {section === "catalog" ? (
          <div className="pt-8">
            <ToolCatalog
              category={catalogCategory}
              installedCounts={installedCounts}
              isGoogleConnected={isGoogleConnected}
              onCategoryChange={setCatalogCategory}
              onConfigureBuiltin={configureBuiltin}
              onConnectGoogle={() => setSection("connections")}
              onInstall={installBlueprint}
              onQueryChange={setCatalogQuery}
              query={catalogQuery}
            />
          </div>
        ) : null}

        {section === "connections" ? (
          <div className="pb-6">
            <ReportSection
              index={1}
              lede="Sign in once here. Every tool that uses the account shares the same connection."
              title="Connected accounts"
            >
              <div>
                <GoogleConnectionCard
                  apiKey={googleApiKey}
                  isConnecting={isConnectingGoogle}
                  isDisconnecting={isDisconnectingGoogle}
                  isRefreshing={isLoadingSpreadsheets}
                  isSavingApiKey={isSavingGoogleKey}
                  loadError={spreadsheetLoadError}
                  onApiKeyChange={setGoogleApiKey}
                  onConnect={handleConnectGoogle}
                  onDisconnect={handleDisconnectGoogle}
                  onRefresh={() => void loadSpreadsheetOptions()}
                  onSaveApiKey={handleSaveGoogleKey}
                  onToggleApiKeyFallback={() =>
                    setShowApiKeyFallback((current) => !current)
                  }
                  showApiKeyFallback={showApiKeyFallback}
                  status={googleSheetsStatus}
                />
                <GoogleCalendarConnectionCard
                  isConnecting={isConnectingGoogleCalendar}
                  isDisconnecting={isDisconnectingGoogleCalendar}
                  onConnect={handleConnectGoogleCalendar}
                  onDisconnect={handleDisconnectGoogleCalendar}
                  status={googleCalendarStatus}
                />
              </div>
            </ReportSection>

            <ReportSection
              index={2}
              lede="Every outside address your tools reach, the key each one uses, and whether that key has actually been filled in."
              title="Apps your assistant calls"
            >
              <ConnectionsInventory
                onOpenTool={openToolAndReveal}
                tools={tools}
              />
            </ReportSection>

            <ReportSection
              index={3}
              lede="What happens between your assistant deciding to use a tool and the answer coming back."
              title="How tool calls stay safe"
            >
              <ul className="grid gap-x-10 md:grid-cols-2">
                {SAFEGUARDS.map((entry) => {
                  const SafeguardIcon = entry.icon

                  return (
                    <li
                      className="tools-field flex items-start gap-4 py-5"
                      key={entry.title}
                    >
                      <span className="setup-glyph size-9">
                        <SafeguardIcon aria-hidden className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {entry.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {entry.body}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </ReportSection>
          </div>
        ) : null}
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setPendingNavigation(null)
        }}
        open={pendingNavigation !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              This tool has changes that haven&apos;t been saved. If you leave
              now they&apos;ll be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const action = pendingNavigation
                setPendingNavigation(null)
                setIsDirty(false)
                action?.()
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {selectedTool ? toolDisplayName(selectedTool) : "this tool"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your assistant stops using it straight away. This can&apos;t be
              undone — to pause it instead, switch it off.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                void handleDelete()
              }}
            >
              Delete tool
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConsolePage>
  )
}
