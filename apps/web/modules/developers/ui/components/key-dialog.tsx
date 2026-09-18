"use client"

import { useMemo, useState } from "react"
import { useAction, useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { ChevronRightIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import {
  DEVELOPER_API_LIMITS,
  DEVELOPER_API_SCOPES,
  DEVELOPER_API_SCOPE_PRESETS,
  type DeveloperApiLimitKey,
} from "@workspace/backend/lib/developerApi/catalog"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"

import { getErrorMessage } from "../../lib/errors"

export type DeveloperApiOverview = FunctionReturnType<
  typeof api.private.developerApi.getOverview
>
export type DeveloperApiKey = DeveloperApiOverview["keys"][number]

const EXPIRY_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "30", label: "After 30 days" },
  { value: "90", label: "After 90 days" },
  { value: "365", label: "After a year" },
] as const

const linesOf = (value: string) =>
  value
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean)

const sameScopes = (left: string[], right: readonly string[]) =>
  left.length === right.length && right.every((scope) => left.includes(scope))

type LimitDraft = Partial<Record<DeveloperApiLimitKey, string>>

const toLimitDraft = (limits: Record<string, number | undefined> | undefined) =>
  Object.fromEntries(
    Object.entries(limits ?? {})
      .filter(
        (entry): entry is [string, number] => typeof entry[1] === "number"
      )
      .map(([key, value]) => [key, String(value)])
  ) as LimitDraft

/**
 * Creates a key, or edits one. A new key's secret is handed back through
 * `onCreated`; the dialog itself never shows it, so closing this dialog can
 * never be the moment someone loses it.
 */
export const KeyDialog = ({
  open,
  onOpenChange,
  overview,
  editing,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  overview: DeveloperApiOverview
  /** The key being edited; absent to create a new one. */
  editing?: DeveloperApiKey | null
  onCreated: (created: { name: string; key: string }) => void
}) => {
  const createKey = useAction(api.private.developerApi.createKey)
  const updateKey = useMutation(api.private.developerApi.updateKey)

  // The parent remounts this dialog each time it opens, so the form always
  // starts from the key being edited, or from a clean slate.
  const [name, setName] = useState(editing?.name ?? "")
  const [scopes, setScopes] = useState<string[]>(
    () =>
      editing?.scopes ?? [
        ...(DEVELOPER_API_SCOPE_PRESETS.find(
          (preset) => preset.id === "read_only"
        )?.scopes ?? []),
      ]
  )
  const [expiry, setExpiry] = useState<string>("never")
  const [limits, setLimits] = useState<LimitDraft>(() =>
    toLimitDraft(editing?.limits)
  )
  const [websites, setWebsites] = useState(
    (editing?.allowedOrigins ?? []).join("\n")
  )
  const [ips, setIps] = useState((editing?.allowedIps ?? []).join("\n"))
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(
      editing &&
      (Object.keys(editing.limits ?? {}).length ||
        editing.allowedOrigins.length ||
        editing.allowedIps.length)
    )
  )
  const [isSaving, setIsSaving] = useState(false)

  const activePreset = useMemo(
    () =>
      DEVELOPER_API_SCOPE_PRESETS.find((preset) =>
        sameScopes(scopes, preset.scopes)
      )?.id ?? "custom",
    [scopes]
  )

  const toggleScope = (scope: string, checked: boolean) =>
    setScopes((current) =>
      checked
        ? [...new Set([...current, scope])]
        : current.filter((item) => item !== scope)
    )

  const limitPayload = () => {
    const payload: Record<string, number | null> = {}

    for (const definition of DEVELOPER_API_LIMITS) {
      const raw = limits[definition.key]?.trim()

      if (raw) {
        const value = Number(raw)

        if (!Number.isInteger(value) || value < 1) {
          throw new Error(`${definition.label} must be a whole number.`)
        }

        payload[definition.key] = value
      } else if (editing?.limits && definition.key in editing.limits) {
        // Cleared: back to the organization's value.
        payload[definition.key] = null
      }
    }

    return payload
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error("Give the key a name so you can tell it apart later.")
      return
    }

    if (scopes.length === 0) {
      toast.error("Choose at least one thing this key may do.")
      return
    }

    setIsSaving(true)

    try {
      const shared = {
        scopes,
        limits: limitPayload(),
        allowedOrigins: linesOf(websites),
        allowedIps: linesOf(ips),
      }

      if (editing) {
        await updateKey({ keyId: editing.id, name, ...shared })
        toast.success("Key updated")
        onOpenChange(false)
        return
      }

      const created = await createKey({
        name,
        expiresInDays: expiry === "never" ? undefined : Number(expiry),
        ...shared,
      })
      onOpenChange(false)
      onCreated({ name: name.trim(), key: created.key })
    } catch (error) {
      toast.error(getErrorMessage(error, "The key could not be saved"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="!flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit key" : "Create an API key"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Changes apply to the next call made with this key."
              : "Give it to the developer or system that needs it. You can change what it may do at any time."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="-mx-4 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-1"
          id="developer-api-key-form"
          onSubmit={(event) => void onSubmit(event)}
        >
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="grid gap-2">
              <Label htmlFor="devapi-key-name">Name</Label>
              <Input
                autoFocus
                id="devapi-key-name"
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. CRM sync, Mobile app"
                value={name}
              />
            </div>
            {!editing ? (
              <div className="grid gap-2">
                <Label htmlFor="devapi-key-expiry">Stops working</Label>
                <Select onValueChange={setExpiry} value={expiry}>
                  <SelectTrigger className="w-full" id="devapi-key-expiry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-medium">
              What can it do?
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {DEVELOPER_API_SCOPE_PRESETS.map((preset) => (
                <button
                  aria-checked={activePreset === preset.id}
                  className="setup-choice"
                  key={preset.id}
                  onClick={() => setScopes([...preset.scopes])}
                  role="radio"
                  title={preset.description}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
              <span
                aria-checked={activePreset === "custom"}
                className="setup-choice pointer-events-none"
                role="radio"
              >
                Custom
              </span>
            </div>
            <div className="devapi-scope-grid">
              {DEVELOPER_API_SCOPES.map((scope) => {
                const id = `devapi-scope-${scope.id}`

                return (
                  <label
                    className="devapi-scope-option"
                    htmlFor={id}
                    key={scope.id}
                  >
                    <Checkbox
                      checked={scopes.includes(scope.id)}
                      className="mt-0.5"
                      id={id}
                      onCheckedChange={(checked) =>
                        toggleScope(scope.id, checked === true)
                      }
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {scope.label}
                      </span>
                      <span className="block text-xs leading-snug text-muted-foreground">
                        {scope.description}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div>
            <button
              aria-expanded={showAdvanced}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowAdvanced((current) => !current)}
              type="button"
            >
              <ChevronRightIcon
                className="size-4 transition-transform"
                style={{
                  transform: showAdvanced ? "rotate(90deg)" : undefined,
                }}
              />
              Limits and restrictions for this key
            </button>

            {showAdvanced ? (
              <div className="mt-4 grid gap-6">
                <div>
                  <p className="text-sm font-medium">Tighter limits</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Leave a box empty to use your organization&apos;s limit. A
                    key can never go above it.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {DEVELOPER_API_LIMITS.map((definition) => (
                      <div className="grid gap-1.5" key={definition.key}>
                        <Label
                          className="text-xs"
                          htmlFor={`devapi-key-limit-${definition.key}`}
                        >
                          {definition.label}
                        </Label>
                        <Input
                          id={`devapi-key-limit-${definition.key}`}
                          inputMode="numeric"
                          onChange={(event) =>
                            setLimits((current) => ({
                              ...current,
                              [definition.key]: event.target.value.replace(
                                /[^\d]/g,
                                ""
                              ),
                            }))
                          }
                          placeholder={overview.effectiveLimits[
                            definition.key
                          ].toLocaleString()}
                          value={limits[definition.key] ?? ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="devapi-key-websites">
                      Websites allowed to use it from a browser
                    </Label>
                    <Textarea
                      className="min-h-24 font-mono text-xs"
                      id="devapi-key-websites"
                      onChange={(event) => setWebsites(event.target.value)}
                      placeholder={"https://shop.example.uz"}
                      value={websites}
                    />
                    <p className="text-xs text-muted-foreground">
                      One per line. Leave empty to allow servers only — the
                      safest choice, because a key in a web page can be copied.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="devapi-key-ips">
                      Only from these IP addresses
                    </Label>
                    <Textarea
                      className="min-h-24 font-mono text-xs"
                      id="devapi-key-ips"
                      onChange={(event) => setIps(event.target.value)}
                      placeholder={"203.0.113.7\n198.51.100.0/24"}
                      value={ips}
                    />
                    <p className="text-xs text-muted-foreground">
                      One per line, addresses or ranges. Leave empty to allow
                      any.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </form>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            disabled={isSaving}
            form="developer-api-key-form"
            type="submit"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : null}
            {editing ? "Save changes" : "Create key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type RevealedKey = { name: string; key: string }
