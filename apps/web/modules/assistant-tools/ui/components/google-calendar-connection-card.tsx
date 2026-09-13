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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { CalendarClockIcon, Loader2Icon, LogOutIcon } from "lucide-react"

import { BrandMark } from "./brand-mark"
import { Callout, StatusLine } from "./tools-primitives"

export type GoogleCalendarStatus =
  | {
      isConfigured: boolean
      email?: string
      oauthAvailable: boolean
    }
  | undefined

type GoogleCalendarConnectionCardProps = {
  status: GoogleCalendarStatus
  variant?: "full" | "compact"
  isConnecting: boolean
  isDisconnecting: boolean
  onConnect: () => void
  onDisconnect: () => void
  /** Compact variant only — jumps to the accounts section. */
  onManage?: () => void
}

const GOOGLE_CALENDAR_BRAND = "#1a73e8"

const statusOf = (status: GoogleCalendarStatus) => {
  if (status === undefined) return null

  if (status.isConfigured) {
    return {
      tone: "live" as const,
      label: status.email ? `Connected as ${status.email}` : "Connected",
    }
  }

  return { tone: "off" as const, label: "Not connected" }
}

export const GoogleCalendarConnectionCard = ({
  status,
  variant = "full",
  isConnecting,
  isDisconnecting,
  onConnect,
  onDisconnect,
  onManage,
}: GoogleCalendarConnectionCardProps) => {
  const isConnected = Boolean(status?.isConfigured)
  // The server has no Google Calendar OAuth app, so no connect flow can start.
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

  const unavailableNote =
    isOAuthUnavailable && !isConnected ? (
      <Callout>
        Google Calendar sign-in isn&apos;t switched on for this workspace yet.
        Ask whoever runs your Osonflow account to add the Google Calendar
        sign-in keys.
      </Callout>
    ) : null

  if (variant === "compact") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {state ? (
            <StatusLine label={state.label} tone={state.tone} />
          ) : (
            <Skeleton className="h-2.5 w-40 rounded-full" />
          )}
          <div className="flex shrink-0 items-center gap-1.5">
            {isConnected ? (
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
        {unavailableNote}
      </div>
    )
  }

  return (
    <div className="setup-row px-2 py-5">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-3 sm:grid-cols-[3rem_minmax(0,1fr)_auto]">
        <BrandMark
          brand={GOOGLE_CALENDAR_BRAND}
          icon={CalendarClockIcon}
          size="lg"
        />

        <div className="min-w-0">
          <p className="text-[0.95rem] font-medium text-foreground">
            Google Calendar
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
            Connect the account whose calendar the assistant should check and
            book on. It can only see and change calendars that account can open.
          </p>
        </div>

        <div className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-1 sm:col-start-3 sm:justify-end">
          {isConnected ? (
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
                  <AlertDialogTitle>
                    Disconnect Google Calendar?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Booking and availability tools stop working until an account
                    is connected again. Your tools and their settings are kept.
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

        {unavailableNote ? (
          <div className="col-span-2 min-w-0 sm:col-start-2">
            {unavailableNote}
          </div>
        ) : null}
      </div>
    </div>
  )
}
