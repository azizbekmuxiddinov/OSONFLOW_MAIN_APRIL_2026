"use client"

import { useState } from "react"
import { useAction, useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import {
  BellRingIcon,
  CalendarDaysIcon,
  CheckIcon,
  ExternalLinkIcon,
  Loader2Icon,
  SendIcon,
  UnlinkIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { getConvexErrorMessage } from "@/lib/convex-error"
import { useLanguage } from "@/lib/i18n/language-provider"
import { ConsolePage, Pill } from "@/modules/dashboard/ui/components/console"
import {
  FigureStrip,
  PageBar,
  ReportQuiet,
  ReportSection,
  StripFigure,
} from "@/modules/dashboard/ui/components/report"
import "../styles/team-alerts.css"
import { AnalyticsSkeleton } from "@/modules/dashboard/ui/components/report-skeleton"
import "@/modules/dashboard/ui/styles/report.css"

type State = FunctionReturnType<typeof api.private.teamAlerts.getState>
type MyLink = NonNullable<State["myLink"]>
type AlertKey = keyof MyLink["alerts"]
type TeamLanguage = "en" | "uz" | "ru"

const ALERTS: { key: AlertKey; title: string; description: string }[] = [
  {
    key: "handoff",
    title: "A customer asks for a person",
    description: "When your assistant hands a conversation to your team.",
  },
  {
    key: "waiting",
    title: "A customer writes while waiting for you",
    description: "Their new messages, so you can answer straight away.",
  },
  {
    key: "upset",
    title: "A customer seems unhappy",
    description: "Once per conversation, so you can step in early.",
  },
  {
    key: "lead",
    title: "Someone leaves their contact details",
    description: "A new lead from your website chat.",
  },
  {
    key: "digest",
    title: "Weekly summary",
    description:
      "Every Monday at 9:00 — your week in numbers, and the questions your assistant couldn't answer, ready to answer by reply.",
  },
]

const LANGUAGES: { value: TeamLanguage; label: string }[] = [
  { value: "uz", label: "O'zbek" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
]

const HOW_IT_WORKS = [
  "Reply to an alert to answer the customer. They get your message on Telegram, Instagram, WhatsApp or your website chat — wherever they wrote from.",
  "Tap “Mark resolved” when it's sorted.",
  "Reply to a question in the weekly summary with the answer, and your assistant learns it.",
  "Send /stop to the bot to pause alerts, and /resume to turn them back on.",
]

const SETUP_STEPS = [
  "Create a bot with @BotFather in Telegram and copy its token.",
  "Set it as TEAM_TELEGRAM_BOT_TOKEN in the Convex environment.",
  "Come back here and tap “Connect Telegram” — each team member does this once.",
]

/** A Telegram alert as the team sees it, so the page shows the result. */
const AlertPreview = () => (
  <div className="team-alert-preview flex flex-col gap-2.5 rounded-[12px] p-3">
    <div className="flex items-center gap-2 px-1">
      <span className="flex size-7 items-center justify-center rounded-full bg-[#2aabee] text-[0.7rem] font-semibold text-white">
        O
      </span>
      <div className="leading-tight">
        <p className="text-xs font-semibold text-foreground">Osonflow</p>
        <p className="text-[0.65rem] text-muted-foreground">bot</p>
      </div>
    </div>

    <div className="team-alert-bubble max-w-[92%] rounded-[14px] rounded-bl-[4px] px-3 py-2.5 text-[0.8rem] leading-snug">
      <p>
        🙋 <strong>Dilnoza</strong>{" "}
        <span>wants to talk to a person · Instagram</span>
      </p>
      <p className="mt-2 text-foreground/80">
        “Do you deliver to Samarkand? I need it by Friday.”
      </p>
      <p className="mt-2 text-muted-foreground">
        ↩️ Reply to this message to answer.
      </p>
    </div>
    <div className="grid max-w-[92%] grid-cols-2 gap-1.5">
      <span className="team-alert-button">Open in Osonflow</span>
      <span className="team-alert-button">✓ Mark resolved</span>
    </div>

    <div className="team-alert-bubble team-alert-bubble-own ml-auto max-w-[80%] rounded-[14px] rounded-br-[4px] px-3 py-2 text-[0.8rem] leading-snug">
      Yes — delivery to Samarkand takes 2 days.
    </div>
    <div className="team-alert-bubble max-w-[70%] rounded-[14px] rounded-bl-[4px] px-3 py-2 text-[0.8rem] leading-snug">
      ✓ Sent to Dilnoza.
    </div>
  </div>
)

const ConnectPanel = () => {
  const { language } = useLanguage()
  const createLinkCode = useAction(api.private.teamAlerts.createLinkCode)
  const [link, setLink] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleConnect = async () => {
    // Opened before the request so the browser treats it as the click's own
    // window rather than a pop-up.
    const popup = window.open("", "_blank")

    setIsCreating(true)
    try {
      const result = await createLinkCode({
        language: language as TeamLanguage,
      })

      setLink(result.url)

      if (popup) {
        popup.location.href = result.url
      }
    } catch (error) {
      popup?.close()
      toast.error(getConvexErrorMessage(error, "Couldn't create the link"))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2 text-sm text-foreground">
        {[
          "Tap “Connect Telegram” — Telegram opens our bot.",
          "Press Start in Telegram.",
          "This page updates on its own once you're connected.",
        ].map((step, index) => (
          <li className="flex items-baseline gap-3" key={step}>
            <span className="w-4 shrink-0 text-[0.7rem] font-semibold tabular-nums text-primary">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isCreating} onClick={() => void handleConnect()}>
          {isCreating ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          Connect Telegram
        </Button>
        {link ? (
          <a
            className="inline-flex items-center gap-1 text-sm text-foreground underline underline-offset-4"
            href={link}
            rel="noreferrer"
            target="_blank"
          >
            Didn&apos;t open? Open the link
            <ExternalLinkIcon className="size-3.5" />
          </a>
        ) : null}
      </div>
      {link ? (
        <p className="text-xs text-muted-foreground">
          The link works for 15 minutes and only for you.
        </p>
      ) : null}
    </div>
  )
}

const ConnectedPanel = ({ myLink }: { myLink: MyLink }) => {
  const updateMyLink = useMutation(api.private.teamAlerts.updateMyLink)
  const disconnect = useMutation(api.private.teamAlerts.disconnect)
  const sendTest = useAction(api.private.teamAlerts.sendTest)
  const [isTesting, setIsTesting] = useState(false)

  const handleTest = async () => {
    setIsTesting(true)
    try {
      const { delivered } = await sendTest({})

      if (delivered > 0) {
        toast.success("Test alert sent — check Telegram")
      } else {
        toast.error("Couldn't reach your Telegram. Try connecting again.")
      }
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Couldn't send a test alert"))
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Pill icon={CheckIcon} tone="positive">
          Connected
        </Pill>
        <span className="text-sm text-foreground">
          {myLink.telegramUsername
            ? `@${myLink.telegramUsername}`
            : myLink.telegramName}
        </span>
        {myLink.isPaused ? <Pill tone="warning">Paused</Pill> : null}
      </div>

      <label className="flex items-start justify-between gap-6">
        <span>
          <span className="block text-sm font-medium text-foreground">
            Send me alerts
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Pause them for a while without disconnecting.
          </span>
        </span>
        <Switch
          checked={!myLink.isPaused}
          onCheckedChange={(checked) =>
            void updateMyLink({ isPaused: !checked }).catch(() =>
              toast.error("Couldn't update alerts")
            )
          }
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="console-label">Alert language</p>
        <Select
          onValueChange={(value) =>
            void updateMyLink({ language: value as TeamLanguage }).catch(() =>
              toast.error("Couldn't update the language")
            )
          }
          value={myLink.language}
        >
          <SelectTrigger className="h-9 w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={isTesting}
          onClick={() => void handleTest()}
          size="sm"
          variant="outline"
        >
          {isTesting ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : (
            <BellRingIcon data-icon="inline-start" />
          )}
          Send a test alert
        </Button>
        <Button
          onClick={() =>
            void disconnect({})
              .then(() => toast.success("Telegram disconnected"))
              .catch(() => toast.error("Couldn't disconnect"))
          }
          size="sm"
          variant="ghost"
        >
          <UnlinkIcon data-icon="inline-start" />
          Disconnect
        </Button>
      </div>
    </div>
  )
}

const AlertPreferences = ({ myLink }: { myLink: MyLink | null }) => {
  const updateMyLink = useMutation(api.private.teamAlerts.updateMyLink)

  const toggle = (key: AlertKey, value: boolean) => {
    if (!myLink) {
      return
    }

    void updateMyLink({ alerts: { ...myLink.alerts, [key]: value } }).catch(
      () => toast.error("Couldn't update alerts")
    )
  }

  return (
    <ul>
      {ALERTS.map((alert) => (
        <li
          className="flex items-start justify-between gap-4 border-t border-[var(--report-rule)] px-5 py-3"
          key={alert.key}
        >
          <span>
            <span className="block text-sm font-medium text-foreground">
              {alert.title}
            </span>
            <span className="mt-1 block max-w-[60ch] text-xs leading-relaxed text-muted-foreground">
              {alert.description}
            </span>
          </span>
          <Switch
            checked={myLink ? myLink.alerts[alert.key] : true}
            disabled={!myLink || myLink.isPaused}
            onCheckedChange={(checked) => toggle(alert.key, checked)}
          />
        </li>
      ))}
    </ul>
  )
}

export const TeamAlertsView = () => {
  const state = useQuery(api.private.teamAlerts.getState)

  if (state === undefined) {
    return <AnalyticsSkeleton />
  }

  const alertsOn = state.myLink
    ? Object.values(state.myLink.alerts).filter(Boolean).length
    : 0

  return (
    <ConsolePage width="wide">
      <div className="report flex flex-col gap-4">
        <PageBar
          hint="Know the moment a customer needs a person, seems unhappy or leaves their contact details — and answer by replying to the alert."
          meta={
            state.myLink ? (
              <Pill icon={CheckIcon} tone="positive">
                Connected
              </Pill>
            ) : (
              <Pill tone="neutral">Not connected</Pill>
            )
          }
          title="Telegram alerts"
        />

        <FigureStrip className="md:grid-cols-3">
          <StripFigure
            icon={UsersIcon}
            label="Team members connected"
            note="Each person connects their own Telegram"
            tone="info"
            value={state.team.length}
          />
          <StripFigure
            icon={BellRingIcon}
            label="Alerts you get"
            note="Out of 5 kinds of alert"
            tone="accent"
            value={state.myLink ? `${alertsOn}/5` : "—"}
          />
          <StripFigure
            icon={CalendarDaysIcon}
            label="Weekly summary"
            note="Every Monday at 9:00"
            tone="positive"
            value={
              state.myLink ? (state.myLink.alerts.digest ? "On" : "Off") : "—"
            }
          />
        </FigureStrip>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-4">
            {!state.isBotConfigured ? (
              <ReportSection
                lede="One setting on the server, done once for everyone."
                title="Switch on Telegram alerts"
              >
                <ol className="flex flex-col gap-3">
                  {SETUP_STEPS.map((step, index) => (
                    <li className="flex items-start gap-3" key={step}>
                      <span className="report-stat-icon" data-tone="accent">
                        <span className="text-[0.7rem] font-semibold tabular-nums">
                          {index + 1}
                        </span>
                      </span>
                      <span className="pt-0.5 text-sm leading-snug text-foreground/85">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </ReportSection>
            ) : (
              <ReportSection
                lede="Alerts go to your own Telegram. Everyone on your team connects their own."
                title="Your Telegram"
              >
                {state.myLink ? (
                  <ConnectedPanel myLink={state.myLink} />
                ) : (
                  <ConnectPanel />
                )}
              </ReportSection>
            )}

            <ReportSection
              flush
              lede="People on your team who get alerts in Telegram."
              title="Your team"
            >
              {state.team.length ? (
                <ul className="pb-1">
                  {state.team.map((member) => (
                    <li
                      className="flex items-center justify-between gap-4 border-t border-[var(--report-rule)] px-5 py-2.5 text-sm"
                      key={member.id}
                    >
                      <span className="truncate text-foreground">
                        {member.userName}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        {member.telegramUsername
                          ? `@${member.telegramUsername}`
                          : null}
                        {member.isPaused ? (
                          <Pill tone="warning">Paused</Pill>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 pb-5">
                  <ReportQuiet icon={UsersIcon}>
                    No one on your team is connected yet.
                  </ReportQuiet>
                </div>
              )}
            </ReportSection>

          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <ReportSection
              flush
              lede="Choose what's worth a buzz in your pocket."
              title="What to send you"
            >
              <AlertPreferences myLink={state.myLink} />
            </ReportSection>

          </div>

          <ReportSection
            lede="What an alert looks like — reply to it and the customer gets your answer."
            title="Preview"
          >
            <AlertPreview />
          </ReportSection>
        </div>

        <ReportSection
          lede="Everything you can do without opening the dashboard."
          title="How it works"
        >
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {HOW_IT_WORKS.map((line, index) => (
              <li className="console-inset flex items-start gap-3 p-3.5" key={line}>
                <span className="report-stat-icon" data-tone="accent">
                  <span className="text-[0.7rem] font-semibold tabular-nums">
                    {index + 1}
                  </span>
                </span>
                <span className="text-sm leading-snug text-foreground/85">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </ReportSection>
      </div>
    </ConsolePage>
  )
}
