"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useAction, useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNowStrict } from "date-fns"
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardCopyIcon,
  KeyRoundIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import type { Id } from "@workspace/backend/_generated/dataModel"
import {
  DEVELOPER_API_LIMITS,
  DEVELOPER_API_LOG_RETENTION_DAYS,
  DEVELOPER_API_SCOPE_PRESETS,
  DEVELOPER_API_SCOPES,
  type DeveloperApiLimitKey,
} from "@workspace/backend/lib/developerApi/catalog"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

import { copyTextToClipboard } from "@/lib/clipboard"
import {
  ConsolePage,
  ConsoleSkeleton,
} from "@/modules/dashboard/ui/components/console"
import {
  ReportFilter,
  ReportQuiet,
  ReportSection,
} from "@/modules/dashboard/ui/components/report"
import {
  KeyDialog,
  type DeveloperApiKey,
  type DeveloperApiOverview,
  type RevealedKey,
} from "../components/key-dialog"
import { getErrorMessage } from "../../lib/errors"
import "@/modules/dashboard/ui/styles/report.css"
import "@/modules/integrations/ui/styles/setup.css"
import "../styles/developers.css"

type Usage = FunctionReturnType<typeof api.private.developerApi.getUsage>
type Call = FunctionReturnType<
  typeof api.private.developerApi.listRequests
>[number]

const DOCS_PATH = "/docs/api"

const formatNumber = (value: number) => value.toLocaleString("en-US")

const ago = (timestamp: number | null) =>
  timestamp
    ? formatDistanceToNowStrict(timestamp, { addSuffix: true })
    : "Never"

const scopeSummary = (scopes: string[]) => {
  const preset = DEVELOPER_API_SCOPE_PRESETS.find(
    (candidate) =>
      candidate.scopes.length === scopes.length &&
      candidate.scopes.every((scope) => scopes.includes(scope))
  )

  if (preset) {
    return [preset.label]
  }

  return DEVELOPER_API_SCOPES.filter((scope) => scopes.includes(scope.id)).map(
    (scope) => scope.label
  )
}

const statusTone = (status: number) =>
  status < 400 ? "ok" : status < 500 ? "client" : "server"

/* ── copyable value ──────────────────────────────────────────────────────── */

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    if (await copyTextToClipboard(value)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } else {
      toast.error("Clipboard unavailable — select and copy it instead")
    }
  }

  return (
    <div className="setup-field flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="console-label">{label}</p>
        <p className="devapi-mono mt-1 truncate text-foreground">{value}</p>
      </div>
      <Button onClick={() => void onCopy()} size="sm" variant="ghost">
        {copied ? (
          <CheckIcon data-icon="inline-start" />
        ) : (
          <ClipboardCopyIcon data-icon="inline-start" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}

/* ── one-time reveal ─────────────────────────────────────────────────────── */

const RevealKeyDialog = ({
  revealed,
  onClose,
}: {
  revealed: RevealedKey | null
  onClose: () => void
}) => {
  // Keyed by the secret in the parent, so a new key starts uncopied.
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    if (revealed && (await copyTextToClipboard(revealed.key))) {
      setCopied(true)
    } else {
      toast.error("Clipboard unavailable — select and copy the key instead")
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => !open && onClose()}
      open={Boolean(revealed)}
    >
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Copy your new key</DialogTitle>
          <DialogDescription>
            This is the only time “{revealed?.name}” is shown in full. Store it
            somewhere safe, such as your server&apos;s environment settings. If
            you lose it, roll the key to get a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="devapi-secret">
          <code>{revealed?.key}</code>
        </div>
        <DialogFooter>
          <Button onClick={() => void onCopy()} variant="outline">
            {copied ? (
              <CheckIcon data-icon="inline-start" />
            ) : (
              <ClipboardCopyIcon data-icon="inline-start" />
            )}
            {copied ? "Copied" : "Copy key"}
          </Button>
          <Button onClick={onClose}>I&apos;ve stored it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── keys ────────────────────────────────────────────────────────────────── */

type KeyAction = { kind: "roll" | "revoke" | "delete"; key: DeveloperApiKey }

const KeyRow = ({
  apiKey,
  usageToday,
  onEdit,
  onAction,
}: {
  apiKey: DeveloperApiKey
  usageToday: number
  onEdit: () => void
  onAction: (action: KeyAction) => void
}) => {
  const isActive = apiKey.status === "active"
  const restrictions = [
    Object.keys(apiKey.limits).length ? "Own limits" : null,
    apiKey.allowedOrigins.length
      ? `${apiKey.allowedOrigins.length} website${apiKey.allowedOrigins.length === 1 ? "" : "s"}`
      : null,
    apiKey.allowedIps.length
      ? `${apiKey.allowedIps.length} IP rule${apiKey.allowedIps.length === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean)

  return (
    <li
      className="devapi-key grid gap-3 px-2 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
      data-status={apiKey.status}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-2 text-sm">
            <span
              className="setup-dot"
              data-tone={isActive ? "live" : "off"}
              aria-hidden
            />
            <span className="font-medium text-foreground">{apiKey.name}</span>
          </span>
          <span className="devapi-mono text-muted-foreground">
            {apiKey.prefix}…{apiKey.lastFour}
          </span>
          {!isActive ? (
            <span className="text-xs text-muted-foreground">
              {apiKey.status === "revoked" ? "Revoked" : "Expired"}
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {scopeSummary(apiKey.scopes).map((label) => (
            <span className="devapi-scope" key={label}>
              {label}
            </span>
          ))}
          {restrictions.map((label) => (
            <span className="devapi-scope" key={label}>
              {label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Created {ago(apiKey.createdAt)} · Last used{" "}
          {ago(apiKey.lastUsedAt).toLowerCase()}
          {isActive ? ` · ${formatNumber(usageToday)} calls today` : ""}
          {isActive && apiKey.expiresAt
            ? ` · Stops working ${formatDistanceToNowStrict(apiKey.expiresAt, { addSuffix: true })}`
            : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 md:justify-end">
        {isActive ? (
          <Button onClick={onEdit} size="sm" variant="ghost">
            Edit
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`More for ${apiKey.name}`}
              size="icon-sm"
              variant="ghost"
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isActive ? (
              <>
                <DropdownMenuItem
                  onSelect={() => onAction({ kind: "roll", key: apiKey })}
                >
                  Roll key
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onAction({ kind: "revoke", key: apiKey })}
                  variant="destructive"
                >
                  Revoke
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onSelect={() => onAction({ kind: "delete", key: apiKey })}
                variant="destructive"
              >
                Remove from list
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

const KEY_ACTION_COPY: Record<
  KeyAction["kind"],
  { title: string; body: (name: string) => string; confirm: string }
> = {
  roll: {
    title: "Roll this key?",
    body: (name) =>
      `“${name}” stops working now and a new key with the same permissions and limits replaces it. Update every system that uses it straight away.`,
    confirm: "Roll key",
  },
  revoke: {
    title: "Revoke this key?",
    body: (name) =>
      `Every call made with “${name}” will be refused from now on. This cannot be undone.`,
    confirm: "Revoke",
  },
  delete: {
    title: "Remove this key from the list?",
    body: (name) =>
      `“${name}” is already revoked. Its past calls stay in the log.`,
    confirm: "Remove",
  },
}

/* ── usage ───────────────────────────────────────────────────────────────── */

const formatUtcDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })

/**
 * Thirty daily columns of calls. Hover, or focus and use the arrow keys, to
 * read a day's breakdown; otherwise the readout sums the month.
 */
const UsageChart = ({ usage }: { usage: Usage }) => {
  const [active, setActive] = useState<number | null>(null)
  const days = usage.days
  const last = days.length - 1
  const max = Math.max(1, ...days.map((day) => day.requests))
  const activeDay = active === null ? null : days[active]
  const shown = activeDay ?? usage.window

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault()
      const step = event.key === "ArrowLeft" ? -1 : 1
      setActive((current) =>
        Math.min(
          last,
          Math.max(0, (current ?? last) + (current === null ? 0 : step))
        )
      )
    }

    if (event.key === "Escape") {
      setActive(null)
    }
  }

  return (
    <figure className="w-full">
      <figcaption aria-live="polite" className="mb-4 min-h-[3.25rem]">
        <p className="report-figure-value">
          {formatNumber(shown.requests)}{" "}
          <span className="text-base font-normal tracking-normal text-muted-foreground">
            {activeDay
              ? `calls on ${formatUtcDay(activeDay.day)}`
              : "calls in the last 30 days"}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatNumber(shown.aiRequests)} used AI ·{" "}
          {formatNumber(shown.errors)} failed ·{" "}
          {formatNumber(shown.rateLimited)} hit a limit
        </p>
      </figcaption>

      <div
        aria-label={`API calls per day over the last 30 days, ${formatNumber(usage.window.requests)} in total. Use the arrow keys to read each day.`}
        className="devapi-chart"
        data-active={active === null ? undefined : ""}
        onBlur={() => setActive(null)}
        onFocus={() => setActive(last)}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setActive(null)}
        role="group"
        tabIndex={0}
      >
        <div className="devapi-bars">
          {days.map((day, index) => (
            <div
              className="devapi-bar-slot"
              data-active={active === index ? "" : undefined}
              key={day.day}
              onMouseEnter={() => setActive(index)}
            >
              <div
                className="devapi-bar"
                data-empty={day.requests ? undefined : ""}
                data-today={index === last ? "" : undefined}
                style={
                  {
                    height: day.requests
                      ? `${(day.requests / max) * 100}%`
                      : undefined,
                    "--i": index,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[0.7rem] text-muted-foreground">
        <span>{formatUtcDay(days[0]!.day)}</span>
        <span>Today (UTC)</span>
      </div>
    </figure>
  )
}

/* ── limits ──────────────────────────────────────────────────────────────── */

const LimitsForm = ({ overview }: { overview: DeveloperApiOverview }) => {
  const updateSettings = useMutation(api.private.developerApi.updateSettings)
  const [draft, setDraft] = useState<
    Partial<Record<DeveloperApiLimitKey, string>>
  >({})
  const [retention, setRetention] = useState(String(overview.logRetentionDays))
  const [isSaving, setIsSaving] = useState(false)

  const savedValue = (key: DeveloperApiLimitKey) =>
    String(overview.effectiveLimits[key])

  const changedKeys = DEVELOPER_API_LIMITS.filter((definition) => {
    const value = draft[definition.key]
    return value !== undefined && value !== savedValue(definition.key)
  }).map((definition) => definition.key)
  const retentionChanged = retention !== String(overview.logRetentionDays)

  const onSave = async () => {
    const limits: Record<string, number> = {}

    for (const key of changedKeys) {
      const definition = DEVELOPER_API_LIMITS.find(
        (limit) => limit.key === key
      )!
      const value = Number(draft[key])
      const max = overview.platformLimits[key].max

      if (!Number.isInteger(value) || value < definition.min || value > max) {
        toast.error(
          `${definition.label} must be between ${formatNumber(definition.min)} and ${formatNumber(max)}.`
        )
        return
      }

      limits[key] = value
    }

    setIsSaving(true)

    try {
      await updateSettings({
        limits,
        ...(retentionChanged ? { logRetentionDays: Number(retention) } : {}),
      })
      setDraft({})
      toast.success("Limits saved")
    } catch (error) {
      toast.error(getErrorMessage(error, "The limits could not be saved"))
    } finally {
      setIsSaving(false)
    }
  }

  const onReset = async (key: DeveloperApiLimitKey) => {
    try {
      await updateSettings({ limits: { [key]: null } })
      setDraft((current) => {
        const next = { ...current }
        delete next[key]
        return next
      })
      toast.success("Back to the default")
    } catch (error) {
      toast.error(getErrorMessage(error, "The limit could not be reset"))
    }
  }

  return (
    <div>
      <ul>
        {DEVELOPER_API_LIMITS.map((definition) => {
          const platform = overview.platformLimits[definition.key]
          const isCustom = definition.key in overview.limits
          const value = draft[definition.key] ?? savedValue(definition.key)
          const inputId = `devapi-limit-${definition.key}`

          return (
            <li
              className="devapi-limit"
              data-changed={
                changedKeys.includes(definition.key) ? "" : undefined
              }
              key={definition.key}
            >
              <div className="min-w-0">
                <Label className="text-sm font-medium" htmlFor={inputId}>
                  {definition.label}
                </Label>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {definition.description} Default{" "}
                  {formatNumber(platform.default)}, up to{" "}
                  {formatNumber(platform.max)}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    className="devapi-limit-input pr-20 tabular-nums"
                    id={inputId}
                    inputMode="numeric"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [definition.key]: event.target.value.replace(
                          /[^\d]/g,
                          ""
                        ),
                      }))
                    }
                    value={value}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                    {definition.unit}
                  </span>
                </div>
                <Button
                  aria-label={`Reset ${definition.label.toLowerCase()} to the default`}
                  disabled={!isCustom}
                  onClick={() => void onReset(definition.key)}
                  size="icon-sm"
                  title="Back to the default"
                  variant="ghost"
                >
                  <RotateCcwIcon />
                </Button>
              </div>
            </li>
          )
        })}
        <li
          className="devapi-limit"
          data-changed={retentionChanged ? "" : undefined}
        >
          <div className="min-w-0">
            <Label className="text-sm font-medium" htmlFor="devapi-retention">
              Keep the call log for
            </Label>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Applies to calls made from now on. Daily totals are kept for 90
              days.
            </p>
          </div>
          <div className="relative mr-10">
            <Input
              className="devapi-limit-input pr-14 tabular-nums"
              id="devapi-retention"
              inputMode="numeric"
              max={DEVELOPER_API_LOG_RETENTION_DAYS.max}
              min={DEVELOPER_API_LOG_RETENTION_DAYS.min}
              onChange={(event) =>
                setRetention(event.target.value.replace(/[^\d]/g, ""))
              }
              value={retention}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
              days
            </span>
          </div>
        </li>
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          disabled={isSaving || (changedKeys.length === 0 && !retentionChanged)}
          onClick={() => void onSave()}
        >
          {isSaving ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : null}
          Save limits
        </Button>
        {changedKeys.length || retentionChanged ? (
          <Button
            onClick={() => {
              setDraft({})
              setRetention(String(overview.logRetentionDays))
            }}
            variant="ghost"
          >
            Discard
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Limits take effect on the next call.
          </p>
        )}
      </div>
    </div>
  )
}

/* ── call log ────────────────────────────────────────────────────────────── */

const CallLog = ({
  keys,
  retentionDays,
}: {
  keys: DeveloperApiKey[]
  retentionDays: number
}) => {
  const [onlyErrors, setOnlyErrors] = useState(false)
  const calls = useQuery(api.private.developerApi.listRequests, { onlyErrors })
  const keyNames = useMemo(
    () => new Map(keys.map((key) => [key.id as string, key.name])),
    [keys]
  )

  return (
    <div>
      <div
        aria-label="Filter calls"
        className="report-filters border-b border-[var(--report-rule)]"
        role="group"
      >
        <ReportFilter active={!onlyErrors} onClick={() => setOnlyErrors(false)}>
          All calls
        </ReportFilter>
        <ReportFilter active={onlyErrors} onClick={() => setOnlyErrors(true)}>
          Failed only
        </ReportFilter>
      </div>

      {calls === undefined ? (
        <ReportQuiet>Loading calls…</ReportQuiet>
      ) : calls.length === 0 ? (
        <ReportQuiet>
          {onlyErrors
            ? "No failed calls. Everything your keys asked for went through."
            : `No calls in the last ${retentionDays} days yet.`}
        </ReportQuiet>
      ) : (
        <ul>
          {calls.map((call: Call) => (
            <li className="devapi-call" key={call.id} title={call.requestId}>
              <span className="text-muted-foreground tabular-nums">
                {new Date(call.createdAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="devapi-method">{call.method}</span>
                <span className="devapi-mono truncate text-foreground">
                  {call.path}
                </span>
              </span>
              <span
                className="devapi-status"
                data-tone={statusTone(call.status)}
              >
                {call.status}
              </span>
              <span className="hidden text-right text-muted-foreground tabular-nums md:block">
                {formatNumber(call.durationMs)} ms
              </span>
              <span className="hidden truncate text-muted-foreground md:block">
                {keyNames.get(call.keyId) ?? "Removed key"}
                {call.errorCode ? ` · ${call.errorCode}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── page ────────────────────────────────────────────────────────────────── */

export const DevelopersView = () => {
  const overview = useQuery(api.private.developerApi.getOverview)
  const usage = useQuery(api.private.developerApi.getUsage)
  const updateSettings = useMutation(api.private.developerApi.updateSettings)
  const rollKey = useAction(api.private.developerApi.rollKey)
  const revokeKey = useMutation(api.private.developerApi.revokeKey)
  const deleteKey = useMutation(api.private.developerApi.deleteKey)

  const [dialogOpen, setDialogOpen] = useState(false)
  // Bumped on every open so the dialog's form is rebuilt from scratch.
  const [dialogOpenCount, setDialogOpenCount] = useState(0)
  const [editing, setEditing] = useState<DeveloperApiKey | null>(null)
  const [revealed, setRevealed] = useState<RevealedKey | null>(null)
  const [pendingAction, setPendingAction] = useState<KeyAction | null>(null)
  const [isActing, setIsActing] = useState(false)

  if (overview === undefined) {
    return <ConsoleSkeleton stats={4} rows={3} />
  }

  const activeKeys = overview.keys.filter((key) => key.status === "active")
  const usageTodayByKey = new Map(
    (usage?.byKey ?? []).map((entry) => [entry.keyId, entry.today.requests])
  )

  const openDialog = (key: DeveloperApiKey | null) => {
    setEditing(key)
    setDialogOpenCount((count) => count + 1)
    setDialogOpen(true)
  }

  const openCreate = () => openDialog(null)

  const onToggleApi = async (enabled: boolean) => {
    try {
      await updateSettings({ enabled })
      toast.success(
        enabled ? "API access is on" : "API access is off — every key is paused"
      )
    } catch (error) {
      toast.error(getErrorMessage(error, "The setting could not be saved"))
    }
  }

  const onConfirmAction = async () => {
    if (!pendingAction) {
      return
    }

    setIsActing(true)

    try {
      const keyId = pendingAction.key.id as Id<"developerApiKeys">

      if (pendingAction.kind === "roll") {
        const rolled = await rollKey({ keyId })
        setRevealed({ name: pendingAction.key.name, key: rolled.key })
      } else if (pendingAction.kind === "revoke") {
        await revokeKey({ keyId })
        toast.success("Key revoked")
      } else {
        await deleteKey({ keyId })
        toast.success("Key removed")
      }

      setPendingAction(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "That didn't work — try again"))
    } finally {
      setIsActing(false)
    }
  }

  const actionCopy = pendingAction ? KEY_ACTION_COPY[pendingAction.kind] : null

  return (
    <ConsolePage width="wide">
      <div className="report setup">
        {/* Hero */}
        <section className="pt-2 pb-10">
          <p className="console-eyebrow">Developer API</p>
          <h1 className="report-headline mt-6 max-w-[22ch]">
            Connect your own software to{" "}
            <span className="report-headline-figure">Osonflow</span>.
          </h1>
          <p className="report-lede mt-5 max-w-[64ch]">
            Keys let your developers start chats, read conversations, keep the
            knowledge base up to date and more — from your website, app or CRM.
            Each key has its own permissions and limits, and you can switch any
            of them off in one click.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button disabled={!overview.enabled} onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Create key
            </Button>
            <Button asChild variant="outline">
              <Link href={DOCS_PATH} rel="noopener" target="_blank">
                Read the documentation
                <ArrowUpRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {!overview.platformEnabled ? (
            <div
              className="setup-callout mt-6 max-w-2xl text-sm"
              data-tone="error"
            >
              The developer API is switched off on this Osonflow installation.
            </div>
          ) : null}
          {overview.requiresSubscription ? (
            <div
              className="setup-callout mt-6 max-w-2xl text-sm"
              data-tone="info"
            >
              The developer API is part of paid plans. Keys work once your
              organization has an active plan.
            </div>
          ) : null}

          <div className="mt-8 max-w-2xl">
            {overview.baseUrl ? (
              <CopyField label="Base URL" value={overview.baseUrl} />
            ) : null}
            <div className="setup-field flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <Label className="text-sm font-medium" htmlFor="devapi-enabled">
                  API access
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {overview.enabled
                    ? "On. Keys below can be used."
                    : "Off. Every key is refused until you turn it back on; their settings are kept."}
                </p>
              </div>
              <Switch
                checked={overview.enabled}
                id="devapi-enabled"
                onCheckedChange={(checked) => void onToggleApi(checked)}
              />
            </div>
          </div>
        </section>

        {/* Figures */}
        <section className="report-figures grid grid-cols-2 md:grid-cols-4">
          {[
            { label: "Calls today", value: usage?.today.requests },
            { label: "AI calls today", value: usage?.today.aiRequests },
            { label: "Failed today", value: usage?.today.errors },
            { label: "Active keys", value: activeKeys.length },
          ].map((figure) => (
            <div
              className="report-figure px-4 py-5 first:pl-0"
              key={figure.label}
            >
              <p className="console-label">{figure.label}</p>
              <p className="report-figure-value mt-3">
                {figure.value === undefined ? "—" : formatNumber(figure.value)}
              </p>
            </div>
          ))}
        </section>

        {/* 01 · Keys */}
        <ReportSection
          index={1}
          lede={`Only show a key to the person or system that needs it. You can have up to ${overview.maxKeys} active keys.`}
          title="Your keys"
        >
          {overview.keys.length === 0 ? (
            <div className="flex flex-col items-start gap-4 py-4">
              <span className="setup-glyph size-11" data-size="lg">
                <KeyRoundIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">No keys yet</p>
                <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">
                  Create one for each system that connects — a separate key per
                  app makes it easy to see who is calling and to switch one off
                  without affecting the others.
                </p>
              </div>
              <Button
                disabled={!overview.enabled}
                onClick={openCreate}
                variant="outline"
              >
                <PlusIcon data-icon="inline-start" />
                Create your first key
              </Button>
            </div>
          ) : (
            <ul>
              {overview.keys.map((apiKey) => (
                <KeyRow
                  apiKey={apiKey}
                  key={apiKey.id}
                  onAction={setPendingAction}
                  onEdit={() => openDialog(apiKey)}
                  usageToday={usageTodayByKey.get(apiKey.id) ?? 0}
                />
              ))}
            </ul>
          )}
        </ReportSection>

        {/* 02 · Usage */}
        <ReportSection
          index={2}
          lede="Every call from every key over the last 30 days. Days run midnight to midnight UTC, the same days the daily limits use."
          title="Usage"
        >
          {usage ? (
            <UsageChart usage={usage} />
          ) : (
            <ReportQuiet>Loading usage…</ReportQuiet>
          )}
        </ReportSection>

        {/* 03 · Limits */}
        <ReportSection
          index={3}
          lede="How much the API may do across all keys. Lower limits protect your AI budget; a single key can be given tighter limits of its own."
          title="Limits"
        >
          <LimitsForm
            key={JSON.stringify(overview.limits)}
            overview={overview}
          />
        </ReportSection>

        {/* 04 · Calls */}
        <ReportSection
          index={4}
          lede={`The latest 100 calls, newest first. Kept for ${overview.logRetentionDays} days. Hover a row for its request id, which matches the X-Request-Id header.`}
          title="Recent calls"
        >
          <CallLog
            keys={overview.keys}
            retentionDays={overview.logRetentionDays}
          />
        </ReportSection>
      </div>

      <KeyDialog
        editing={editing}
        key={`${editing?.id ?? "new"}-${dialogOpenCount}`}
        onCreated={setRevealed}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        overview={overview}
      />
      <RevealKeyDialog
        key={revealed?.key ?? "none"}
        onClose={() => setRevealed(null)}
        revealed={revealed}
      />
      <AlertDialog
        onOpenChange={(open) => !open && !isActing && setPendingAction(null)}
        open={Boolean(pendingAction)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionCopy?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction ? actionCopy?.body(pendingAction.key.name) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isActing}
              onClick={(event) => {
                event.preventDefault()
                void onConfirmAction()
              }}
              variant={
                pendingAction?.kind === "roll" ? "default" : "destructive"
              }
            >
              {isActing ? (
                <Loader2Icon
                  className="animate-spin"
                  data-icon="inline-start"
                />
              ) : null}
              {actionCopy?.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConsolePage>
  )
}
