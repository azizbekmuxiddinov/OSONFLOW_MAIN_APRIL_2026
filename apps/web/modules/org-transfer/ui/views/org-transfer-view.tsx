"use client"

import { useAction } from "convex/react"
import { ConvexError } from "convex/values"
import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
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
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardCopyIcon,
  ClipboardPasteIcon,
  DownloadIcon,
  FileJsonIcon,
  Loader2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { copyTextToClipboard } from "@/lib/clipboard"
import { ConsolePage } from "@/modules/dashboard/ui/components/console"
import { ReportSection } from "@/modules/dashboard/ui/components/report"
import "@/modules/dashboard/ui/styles/report.css"
import "@/modules/integrations/ui/styles/setup.css"
import "../styles/transfer.css"

type ExportSummary = {
  widgetSettings: boolean
  knowledgeBaseCount: number
  savedRepliesCount: number
  workflowsCount: number
  pluginsCount: number
  integrationWebhooksCount: number
}

type ImportSummary = {
  widgetSettings: boolean
  publishedWidgetSettings: boolean
  knowledgeBaseImported: number
  knowledgeBaseSkipped: number
  knowledgeBaseCleared: number
  savedReplies: number
  workflows: number
  plugins: number
  integrationWebhooks: number
  warnings?: string[]
}

type ManifestItem = { label: string; value: number | boolean }

const getTransferErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ConvexError) {
    if (typeof error.data === "string" && error.data.trim()) {
      return error.data
    }

    if (
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data &&
      typeof error.data.message === "string" &&
      error.data.message.trim()
    ) {
      return error.data.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

const exportManifest = (summary: ExportSummary): ManifestItem[] => [
  { label: "Widget look and settings", value: summary.widgetSettings },
  { label: "Knowledge sources", value: summary.knowledgeBaseCount },
  { label: "Saved replies", value: summary.savedRepliesCount },
  { label: "Workflows", value: summary.workflowsCount },
  { label: "Integration keys", value: summary.pluginsCount },
  { label: "Event webhooks", value: summary.integrationWebhooksCount },
]

const importManifest = (summary: ImportSummary): ManifestItem[] => [
  { label: "Widget look and settings", value: summary.widgetSettings },
  {
    label: "Widget published to your site",
    value: summary.publishedWidgetSettings,
  },
  { label: "Knowledge sources added", value: summary.knowledgeBaseImported },
  {
    label: "Knowledge sources skipped (already here)",
    value: summary.knowledgeBaseSkipped,
  },
  {
    label: "Existing knowledge sources removed",
    value: summary.knowledgeBaseCleared,
  },
  { label: "Saved replies", value: summary.savedReplies },
  { label: "Workflows", value: summary.workflows },
  { label: "Integration keys", value: summary.plugins },
  { label: "Event webhooks", value: summary.integrationWebhooks },
]

const countOf = (value: unknown) => (Array.isArray(value) ? value.length : 0)

/**
 * Reads a pasted or uploaded file in the browser so the owner sees what it
 * contains before anything is written. The server still validates on import;
 * this only previews.
 */
const previewBundle = (
  text: string
):
  | { kind: "empty" }
  | { kind: "invalid"; reason: string }
  | { kind: "bundle"; exportedAt?: string; items: ManifestItem[] } => {
  if (!text.trim()) return { kind: "empty" }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return {
      kind: "invalid",
      reason: "This isn't valid JSON — make sure you copied the whole file.",
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return { kind: "invalid", reason: "This isn't an Osonflow setup file." }
  }

  const bundle = parsed as Record<string, unknown>

  if (bundle.type === "osonflow-widget-settings") {
    return {
      kind: "bundle",
      exportedAt:
        typeof bundle.exportedAt === "string" ? bundle.exportedAt : undefined,
      items: [{ label: "Widget look and settings", value: true }],
    }
  }

  if (bundle.type !== "osonflow-org-bundle") {
    return { kind: "invalid", reason: "This isn't an Osonflow setup file." }
  }

  if (bundle.version !== 1) {
    return {
      kind: "invalid",
      reason: "This file comes from a newer version of Osonflow.",
    }
  }

  const widget = bundle.widgetSettings as
    | { published?: unknown }
    | undefined

  return {
    kind: "bundle",
    exportedAt:
      typeof bundle.exportedAt === "string" ? bundle.exportedAt : undefined,
    items: [
      { label: "Widget look and settings", value: Boolean(widget) },
      { label: "Knowledge sources", value: countOf(bundle.knowledgeBase) },
      { label: "Saved replies", value: countOf(bundle.savedReplies) },
      { label: "Workflows", value: countOf(bundle.workflows) },
      { label: "Integration keys", value: countOf(bundle.plugins) },
      {
        label: "Event webhooks",
        value: countOf(bundle.integrationWebhooks),
      },
    ],
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
}

/** A ruled list of what a file holds. Empty lines stay, muted, so nothing
 *  looks silently missing. */
const Manifest = ({ items }: { items: ManifestItem[] }) => (
  <ul className="transfer-manifest">
    {items.map((item) => {
      const present = item.value === true || (typeof item.value === "number" && item.value > 0)

      return (
        <li
          className="flex items-center justify-between gap-4 px-1 py-2.5"
          key={item.label}
        >
          <span
            className={
              present
                ? "flex items-center gap-2.5 text-sm text-foreground"
                : "flex items-center gap-2.5 text-sm text-muted-foreground"
            }
          >
            {present ? (
              <CheckIcon aria-hidden className="size-4 text-primary" />
            ) : (
              <span aria-hidden className="inline-block size-4" />
            )}
            {item.label}
          </span>
          <span
            className={present ? "transfer-count" : "text-sm text-muted-foreground"}
          >
            {typeof item.value === "boolean"
              ? item.value
                ? "Included"
                : "—"
              : item.value || "—"}
          </span>
        </li>
      )
    })}
  </ul>
)

export const OrgTransferView = () => {
  const exportBundle = useAction(api.private.orgTransfer.exportBundle)
  const importBundle = useAction(api.private.orgTransfer.importBundle)

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isPasting, setIsPasting] = useState(false)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [importPayload, setImportPayload] = useState("")
  const [importFileName, setImportFileName] = useState<string | null>(null)
  const [lastExportJson, setLastExportJson] = useState<string | null>(null)
  const [lastExportSummary, setLastExportSummary] =
    useState<ExportSummary | null>(null)
  const [lastImportSummary, setLastImportSummary] =
    useState<ImportSummary | null>(null)
  const [publishWidgetSettings, setPublishWidgetSettings] = useState(true)
  const [replaceKnowledgeBase, setReplaceKnowledgeBase] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const preview = useMemo(() => previewBundle(importPayload), [importPayload])

  const onExport = async () => {
    setIsExporting(true)

    try {
      const result = await exportBundle({})
      const json = JSON.stringify(result.bundle, null, 2)

      setLastExportJson(json)
      setLastExportSummary(result.summary)

      const copied = await copyTextToClipboard(json)

      if (copied) {
        toast.success("Setup copied to your clipboard")
      } else {
        toast.success("Setup copy is ready", {
          description: "Your clipboard isn't available — download the file instead.",
        })
      }
    } catch (error) {
      toast.error(
        getTransferErrorMessage(error, "Failed to export organization data")
      )
    } finally {
      setIsExporting(false)
    }
  }

  const onCopyAgain = async () => {
    if (!lastExportJson) return
    const copied = await copyTextToClipboard(lastExportJson)
    if (copied) {
      toast.success("Copied again")
    } else {
      toast.error("Clipboard unavailable — download the file instead")
    }
  }

  const onDownload = () => {
    if (!lastExportJson) {
      toast.error("Export organization data first")
      return
    }

    const blob = new Blob([lastExportJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `osonflow-org-bundle-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success("Bundle downloaded")
  }

  const loadFile = async (file: File) => {
    try {
      const text = await file.text()
      setImportPayload(text)
      setImportFileName(file.name)
      setLastImportSummary(null)
    } catch {
      toast.error("Could not read that JSON file")
    }
  }

  const onPickBundleFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (file) {
      await loadFile(file)
    }
  }

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      await loadFile(file)
    }
  }

  const onPasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (clipboardText.trim()) {
        setImportPayload(clipboardText)
        setImportFileName(null)
        setLastImportSummary(null)
        return
      }
      toast.info("Your clipboard is empty — paste the file contents below")
    } catch {
      toast.info("Paste the file contents into the box below")
    }
    setIsPasting(true)
  }

  const clearImport = () => {
    setImportPayload("")
    setImportFileName(null)
    setIsPasting(false)
  }

  const onImport = async () => {
    setIsImporting(true)

    try {
      const result = await importBundle({
        bundleJson: importPayload,
        options: {
          publishWidgetSettings,
          replaceKnowledgeBase,
        },
      })

      setImportPayload("")
      setImportFileName(null)
      setIsPasting(false)
      setLastImportSummary(result.summary)

      const warnings = result.summary.warnings ?? []
      if (warnings.length > 0) {
        toast.success("Setup imported — with a few notes below")
      } else {
        toast.success("Setup imported")
      }
    } catch (error) {
      toast.error(
        getTransferErrorMessage(error, "Failed to import organization data")
      )
    } finally {
      setIsImporting(false)
    }
  }

  const requestImport = () => {
    if (replaceKnowledgeBase) {
      setConfirmReplace(true)
      return
    }
    void onImport()
  }

  const exportedOn = preview.kind === "bundle" ? formatDate(preview.exportedAt) : null
  const hasPayload = preview.kind !== "empty"

  return (
    <ConsolePage width="wide">
      <div className="report setup">
        {/* Hero */}
        <section className="pt-2 pb-10">
          <p className="console-eyebrow">Data transfer</p>
          <h1 className="report-headline mt-6 max-w-[22ch]">
            Move your whole setup in{" "}
            <span className="report-headline-figure">one file</span>.
          </h1>
          <p className="report-lede mt-5 max-w-[62ch]">
            Take a copy of this organization — your widget, knowledge base,
            saved replies, workflows, keys and webhooks — and bring it into
            another organization or environment. Customer conversations stay
            where they are.
          </p>
        </section>

        {/* 01 · Export */}
        <ReportSection
          index={1}
          lede="Makes a file with everything needed to rebuild this setup somewhere else. Nothing here changes."
          title="Take a copy"
        >
          <ol className="setup-steps">
            <li>
              <span className="setup-step-index">1</span>
              <div className="min-w-0">
                <p className="setup-step-title">Create the copy</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button disabled={isExporting} onClick={onExport}>
                    {isExporting ? (
                      <Loader2Icon className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <ClipboardCopyIcon data-icon="inline-start" />
                    )}
                    {isExporting
                      ? "Gathering your setup…"
                      : lastExportSummary
                        ? "Create a fresh copy"
                        : "Create copy"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    It&apos;s also copied to your clipboard.
                  </p>
                </div>

                {lastExportSummary ? (
                  <div className="transfer-result mt-6 max-w-xl">
                    <p className="console-label mb-2">In this copy</p>
                    <Manifest items={exportManifest(lastExportSummary)} />
                  </div>
                ) : null}
              </div>
            </li>

            <li>
              <span className="setup-step-index">2</span>
              <div className="min-w-0">
                <p className="setup-step-title">Keep it somewhere safe</p>
                <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                  Download the file, or paste it straight into the other
                  organization. It can contain your API keys, so share it only
                  with people you trust.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    disabled={!lastExportJson}
                    onClick={onDownload}
                    variant="outline"
                  >
                    <DownloadIcon data-icon="inline-start" />
                    Download file
                  </Button>
                  <Button
                    disabled={!lastExportJson}
                    onClick={() => void onCopyAgain()}
                    variant="ghost"
                  >
                    <ClipboardCopyIcon data-icon="inline-start" />
                    Copy again
                  </Button>
                </div>
              </div>
            </li>
          </ol>
        </ReportSection>

        {/* 02 · Import */}
        <ReportSection
          index={2}
          lede="Adds a copy into the organization you're signed in to now. You'll see what's inside before anything is written."
          title="Bring a copy in"
        >
          <ol className="setup-steps">
            <li>
              <span className="setup-step-index">1</span>
              <div className="min-w-0">
                <p className="setup-step-title">Add the file</p>

                {!hasPayload && !isPasting ? (
                  <div
                    className="transfer-drop mt-3 max-w-2xl"
                    data-dragging={isDragging ? "" : undefined}
                    onDragLeave={() => setIsDragging(false)}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDragging(true)
                    }}
                    onDrop={(event) => void onDrop(event)}
                  >
                    <span className="transfer-drop-icon">
                      <FileJsonIcon className="size-5" />
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      Drop the setup file here
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <UploadIcon data-icon="inline-start" />
                        Choose file
                      </Button>
                      <Button
                        onClick={() => void onPasteFromClipboard()}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <ClipboardPasteIcon data-icon="inline-start" />
                        Paste from clipboard
                      </Button>
                    </div>
                  </div>
                ) : null}

                <input
                  accept="application/json,.json"
                  className="hidden"
                  onChange={onPickBundleFile}
                  ref={fileInputRef}
                  type="file"
                />

                {isPasting && !hasPayload ? (
                  <div className="mt-3 max-w-2xl">
                    <Label className="sr-only" htmlFor="transfer-paste">
                      Setup file contents
                    </Label>
                    <Textarea
                      autoFocus
                      className="h-48 field-sizing-fixed resize-none font-mono text-xs"
                      id="transfer-paste"
                      onChange={(event) => setImportPayload(event.target.value)}
                      placeholder='Paste the copied setup here — it starts with {"type":"osonflow-org-bundle"'
                      value={importPayload}
                    />
                    <button
                      className="mt-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      onClick={() => setIsPasting(false)}
                      type="button"
                    >
                      Choose a file instead
                    </button>
                  </div>
                ) : null}

                {hasPayload ? (
                  <div className="transfer-result mt-3 max-w-xl">
                    <div className="flex items-center justify-between gap-3 py-1">
                      <p className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                        <FileJsonIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                          {importFileName ?? "Pasted setup"}
                        </span>
                      </p>
                      <Button
                        onClick={clearImport}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <XIcon data-icon="inline-start" />
                        Remove
                      </Button>
                    </div>

                    {preview.kind === "invalid" ? (
                      <div className="mt-3">
                        <div className="setup-callout text-sm" data-tone="error" role="alert">
                          {preview.reason}
                        </div>
                      </div>
                    ) : preview.kind === "bundle" ? (
                      <div className="mt-3">
                        <p className="console-label mb-2">
                          Inside{exportedOn ? ` · copied ${exportedOn}` : ""}
                        </p>
                        <Manifest items={preview.items} />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>

            <li>
              <span className="setup-step-index">2</span>
              <div className="min-w-0">
                <p className="setup-step-title">Choose how it lands</p>
                <div className="mt-3 max-w-xl">
                  <div className="transfer-option flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <Label htmlFor="publish-widget-settings">
                        Put the widget live right away
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Otherwise it&apos;s saved as a draft you publish from
                        Widget customization.
                      </p>
                    </div>
                    <Switch
                      checked={publishWidgetSettings}
                      id="publish-widget-settings"
                      onCheckedChange={setPublishWidgetSettings}
                    />
                  </div>
                  <div className="transfer-option flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <Label htmlFor="replace-knowledge-base">
                        Replace the current knowledge base
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Removes the sources already here first. Leave off to
                        add alongside them — duplicates are skipped.
                      </p>
                    </div>
                    <Switch
                      checked={replaceKnowledgeBase}
                      id="replace-knowledge-base"
                      onCheckedChange={setReplaceKnowledgeBase}
                    />
                  </div>
                </div>
              </div>
            </li>

            <li>
              <span className="setup-step-index">3</span>
              <div className="min-w-0">
                <p className="setup-step-title">Import</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    disabled={isImporting || preview.kind !== "bundle"}
                    onClick={requestImport}
                    type="button"
                  >
                    {isImporting ? (
                      <Loader2Icon className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <UploadIcon data-icon="inline-start" />
                    )}
                    {isImporting ? "Importing…" : "Import into this organization"}
                  </Button>
                  {preview.kind !== "bundle" && !lastImportSummary ? (
                    <p className="text-sm text-muted-foreground">
                      Add a setup file first.
                    </p>
                  ) : null}
                </div>

                {lastImportSummary ? (
                  <div className="transfer-result mt-6 max-w-xl">
                    <p className="console-label mb-2">Imported</p>
                    <Manifest items={importManifest(lastImportSummary)} />
                    {lastImportSummary.warnings?.length ? (
                      <div className="mt-5 flex flex-col gap-2">
                        {lastImportSummary.warnings.map((warning) => (
                          <div className="setup-callout text-sm" key={warning}>
                            {warning}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          </ol>
        </ReportSection>

        {/* 03 · What stays behind */}
        <ReportSection
          index={3}
          lede="A copy carries your setup, not your history or connected accounts. After importing, finish these by hand."
          title="What doesn't move"
        >
          <ul className="max-w-2xl">
            {[
              {
                title: "Conversations and customer memory",
                body: "They stay with the original organization.",
              },
              {
                title: "Telegram, Instagram and WhatsApp",
                body: "Reconnect each one in the new organization.",
                href: "/integrations?section=telegram",
                cta: "Open Setup & integrations",
              },
              {
                title: "Widget images",
                body: "If a logo or background looks broken, upload it again.",
                href: "/customization",
                cta: "Open Widget customization",
              },
            ].map((item) => (
              <li className="setup-row flex flex-wrap items-center justify-between gap-3 px-1 py-4" key={item.title}>
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                </div>
                {item.href ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={item.href}>
                      {item.cta}
                      <ArrowUpRightIcon data-icon="inline-end" />
                    </Link>
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ChevronRightIcon aria-hidden className="size-4" />
            Only need the widget&apos;s look? Use the quick copy tools in{" "}
            <Link className="text-foreground underline underline-offset-4" href="/customization">
              Widget customization
            </Link>
            .
          </p>
        </ReportSection>
      </div>

      <AlertDialog onOpenChange={setConfirmReplace} open={confirmReplace}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace your knowledge base?</AlertDialogTitle>
            <AlertDialogDescription>
              Every knowledge source currently in this organization will be
              removed, then the ones in the file are added. Your assistant
              answers only from the imported sources afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmReplace(false)
                void onImport()
              }}
            >
              Replace and import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConsolePage>
  )
}
