"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  Loader2Icon,
  LogOutIcon,
  RefreshCwIcon,
  Table2Icon,
} from "lucide-react"

import { BrandMark } from "./brand-mark"
import { Callout, Disclosure, StatusLine } from "./tools-primitives"

export type GoogleSheetsStatus =
  | {
      isConfigured: boolean
      authMethod?: "oauth" | "api_key"
      email?: string
      oauthAvailable: boolean
    }
  | undefined

type GoogleConnectionCardProps = {
  status: GoogleSheetsStatus
  variant?: "full" | "compact"
  isConnecting: boolean
  isDisconnecting: boolean
  isSavingApiKey: boolean
  apiKey: string
  showApiKeyFallback: boolean
  onApiKeyChange: (value: string) => void
  onToggleApiKeyFallback: () => void
  onSaveApiKey: () => void
  onConnect: () => void
  onDisconnect: () => void
  /** Compact variant only — jumps to the accounts section. */
  onManage?: () => void
  spreadsheetCount?: number
  loadError?: string | null
  onRefresh?: () => void
  isRefreshing?: boolean
}

const GOOGLE_SHEETS_BRAND = "#0f9d58"

const statusOf = (status: GoogleSheetsStatus) => {
  if (status === undefined) return null

  if (status.authMethod === "oauth") {
    return {
      tone: "live" as const,
      label: status.email ? `Connected as ${status.email}` : "Connected",
    }
  }

  if (status.authMethod === "api_key") {
    return { tone: "attention" as const, label: "API key — lookups only" }
  }

  return { tone: "off" as const, label: "Not connected" }
}

export const GoogleConnectionCard = ({
  status,
  variant = "full",
  isConnecting,
  isDisconnecting,
  isSavingApiKey,
  apiKey,
  showApiKeyFallback,
  onApiKeyChange,
  onToggleApiKeyFallback,
  onSaveApiKey,
  onConnect,
  onDisconnect,
  onManage,
  spreadsheetCount,
  loadError,
  onRefresh,
  isRefreshing = false,
}: GoogleConnectionCardProps) => {
  const isOAuth = status?.authMethod === "oauth"
  // The server has no Google Sheets OAuth app, so no connect flow can start.
  const isOAuthUnavailable = status !== undefined && !status.oauthAvailable
  const state = statusOf(status)

  const connectButton = (
    <Button
      disabled={isConnecting || !status?.oauthAvailable}
      onClick={onConnect}
      size={variant === "compact" ? "sm" : "default"}
      type="button"
    >
      {isConnecting ? (
        <Loader2Icon className="animate-spin" data-icon="inline-start" />
      ) : null}
      {isConnecting ? "Opening Google…" : "Connect Google"}
    </Button>
  )

  const refreshButton =
    isOAuth && onRefresh ? (
      <Button
        disabled={isRefreshing}
        onClick={onRefresh}
        size="sm"
        type="button"
        variant="ghost"
      >
        {isRefreshing ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : (
          <RefreshCwIcon data-icon="inline-start" />
        )}
        Refresh
      </Button>
    ) : null

  if (variant === "compact") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {state ? (
            <StatusLine
              label={
                isOAuth
                  ? `${state.label} · ${spreadsheetCount ?? 0} spreadsheet${
                      spreadsheetCount === 1 ? "" : "s"
                    }`
                  : state.label
              }
              tone={state.tone}
            />
          ) : (
            <Skeleton className="h-2.5 w-40 rounded-full" />
          )}
          <div className="flex shrink-0 items-center gap-1.5">
            {refreshButton}
            {isOAuth ? (
              onManage ? (
                <Button
                  onClick={onManage}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Manage
                </Button>
              ) : null
            ) : (
              connectButton
            )}
          </div>
        </div>
        {isOAuthUnavailable && !isOAuth ? (
          <Callout>
            Google sign-in isn&apos;t switched on for this workspace yet. Ask
            whoever runs your Osonflow account to add the Google Sheets sign-in
            keys.
          </Callout>
        ) : null}
        {loadError ? <Callout tone="error">{loadError}</Callout> : null}
      </div>
    )
  }

  return (
    <div className="setup-row px-2 py-5">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-3 sm:grid-cols-[3rem_minmax(0,1fr)_auto]">
        <BrandMark brand={GOOGLE_SHEETS_BRAND} icon={Table2Icon} size="lg" />

        <div className="min-w-0">
          <p className="text-[0.95rem] font-medium text-foreground">
            Google Sheets
          </p>
          {state ? (
            <StatusLine
              className="mt-1"
              label={state.label}
              tone={state.tone}
            />
          ) : (
            <Skeleton className="mt-2 h-2.5 w-36 rounded-full" />
          )}
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            Connect once and every spreadsheet tool uses this account. The
            assistant only sees spreadsheets this Google account can open.
          </p>
        </div>

        <div className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-1 sm:col-start-3 sm:justify-end">
          {refreshButton}
          {isOAuth ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="text-muted-foreground hover:text-destructive"
                  disabled={isDisconnecting}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {isDisconnecting ? (
                    <Loader2Icon
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <LogOutIcon data-icon="inline-start" />
                  )}
                  Disconnect
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Google Sheets?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Every spreadsheet tool stops working until an account is
                    connected again. Your tools and their settings are kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep connected</AlertDialogCancel>
                  <AlertDialogAction onClick={onDisconnect}>
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            connectButton
          )}
        </div>

        <div className="col-span-2 min-w-0 space-y-3 sm:col-start-2">
          {isOAuthUnavailable ? (
            <Callout>
              Google sign-in isn&apos;t switched on for this workspace yet. Ask
              whoever runs your Osonflow account to add the Google Sheets
              sign-in keys, or use an API key below for lookups.
            </Callout>
          ) : null}

          {loadError ? <Callout tone="error">{loadError}</Callout> : null}

          {isOAuth ? (
            <Disclosure summary="Spreadsheets not showing up?">
              <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                Remove Osonflow from your{" "}
                <a
                  className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
                  href="https://myaccount.google.com/permissions"
                  rel="noreferrer"
                  target="_blank"
                >
                  Google account permissions
                  <ExternalLinkIcon aria-hidden className="size-3" />
                </a>
                , then disconnect and connect again so Drive access is granted.
                The Google Drive API also has to be enabled for the sign-in
                project.
              </p>
            </Disclosure>
          ) : null}

          <details
            className="setup-disclosure"
            onToggle={(event) => {
              if (event.currentTarget.open !== showApiKeyFallback) {
                onToggleApiKeyFallback()
              }
            }}
            open={showApiKeyFallback}
          >
            <summary>
              <ChevronRightIcon aria-hidden className="size-4" />
              Use an API key instead
            </summary>
            <div className="space-y-3 pb-2">
              <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                For developers. An API key only reads public sheets or sheets
                shared with your Google Cloud project, and it can only look rows
                up — adding, changing or deleting rows needs a connected
                account.
              </p>
              <div className="flex max-w-xl flex-col gap-2 sm:flex-row">
                <Input
                  aria-label="Google Sheets API key"
                  autoComplete="off"
                  className="font-mono text-xs"
                  onChange={(event) => onApiKeyChange(event.target.value)}
                  placeholder="AIza…"
                  type="password"
                  value={apiKey}
                />
                <Button
                  disabled={isSavingApiKey || !apiKey.trim()}
                  onClick={onSaveApiKey}
                  type="button"
                  variant="outline"
                >
                  {isSavingApiKey ? (
                    <Loader2Icon
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                  ) : null}
                  Save key
                </Button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
