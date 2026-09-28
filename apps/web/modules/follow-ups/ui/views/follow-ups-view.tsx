"use client"

import { type ComponentType, useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { formatDistanceToNow } from "date-fns"
import {
  CheckIcon,
  Loader2Icon,
  MegaphoneIcon,
  PercentIcon,
  ReplyIcon,
  SaveIcon,
  SendIcon,
  SparklesIcon,
  SquarePenIcon,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@workspace/backend/_generated/api"
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
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { getConvexErrorMessage } from "@/lib/convex-error"
import {
  ConsolePage,
  Meter,
  Pill,
} from "@/modules/dashboard/ui/components/console"
import {
  FigureStrip,
  PageBar,
  ReportQuiet,
  ReportSection,
  StripFigure,
} from "@/modules/dashboard/ui/components/report"
import { SkeletonRows } from "@/modules/dashboard/ui/components/report-skeleton"
import "@/modules/dashboard/ui/styles/report.css"

type FollowUpChannel = "widget" | "telegram" | "instagram" | "whatsapp"
type BroadcastChannel = "telegram" | "instagram" | "whatsapp"
type Settings = FunctionReturnType<typeof api.private.followUps.getSettings>
type Broadcast = FunctionReturnType<typeof api.private.broadcasts.list>[number]

const DELAY_LABELS: Record<number, string> = {
  30: "30 minutes",
  60: "1 hour",
  120: "2 hours",
  180: "3 hours",
  360: "6 hours",
  720: "12 hours",
  1380: "23 hours",
}

const CHANNEL_LABELS: Record<FollowUpChannel, string> = {
  widget: "Website chat",
  telegram: "Telegram",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
}

const TELEGRAM_AUDIENCES = [
  { value: "all", days: undefined, label: "Everyone who wrote to your bot" },
  { value: "30", days: 30, label: "People who wrote in the last 30 days" },
  { value: "90", days: 90, label: "People who wrote in the last 90 days" },
] as const

const ChoiceCard = ({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  onClick: () => void
}) => (
  <button
    aria-pressed={active}
    className={cn(
      "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
      active
        ? "border-primary/50 bg-primary/[0.06]"
        : "border-[var(--report-rule-strong)] hover:bg-foreground/[0.03]"
    )}
    onClick={onClick}
    type="button"
  >
    <Icon
      className={cn(
        "mt-0.5 size-4 shrink-0",
        active ? "text-primary" : "text-muted-foreground"
      )}
    />
    <span className="min-w-0">
      <span className="block text-sm font-medium text-foreground">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
        {description}
      </span>
    </span>
  </button>
)

/* ── automatic follow-ups ───────────────────────────────────────────────── */

const FollowUpSettingsForm = ({ settings }: { settings: Settings }) => {
  const save = useMutation(api.private.followUps.saveSettings)
  const [draft, setDraft] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = useMemo(
    () =>
      JSON.stringify({ ...draft, delayOptions: undefined }) !==
      JSON.stringify({ ...settings, delayOptions: undefined }),
    [draft, settings]
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await save({
        enabled: draft.enabled,
        delayMinutes: draft.delayMinutes,
        mode: draft.mode,
        message: draft.message,
        channels: draft.channels,
      })
      toast.success("Follow-up settings saved")
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Couldn't save the settings"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-start justify-between gap-6">
        <span>
          <span className="block text-sm font-medium text-foreground">
            Follow up when a customer goes quiet
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            If a customer stops replying after your assistant answered them, it
            sends one short message to check in. Never more than one per
            conversation, and never to someone waiting on your team.
          </span>
        </span>
        <Switch
          checked={draft.enabled}
          onCheckedChange={(enabled) => setDraft({ ...draft, enabled })}
        />
      </label>

      <div
        className={cn(
          "flex flex-col gap-4 transition-opacity",
          !draft.enabled && "pointer-events-none opacity-50"
        )}
      >
        <div className="flex flex-col gap-2">
          <p className="console-label">Wait before following up</p>
          <Select
            onValueChange={(value) =>
              setDraft({ ...draft, delayMinutes: Number(value) })
            }
            value={String(draft.delayMinutes)}
          >
            <SelectTrigger className="h-9 w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settings.delayOptions.map((minutes) => (
                <SelectItem key={minutes} value={String(minutes)}>
                  {DELAY_LABELS[minutes] ?? `${minutes} min`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <p className="console-label">What to send</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <ChoiceCard
              active={draft.mode === "ai"}
              description="One short message in the customer's own language, written from the conversation. It never invents prices or offers."
              icon={SparklesIcon}
              onClick={() => setDraft({ ...draft, mode: "ai" })}
              title="Let the assistant write it"
            />
            <ChoiceCard
              active={draft.mode === "fixed"}
              description="The same message every time. Write it in the language your customers use."
              icon={SquarePenIcon}
              onClick={() => setDraft({ ...draft, mode: "fixed" })}
              title="Use my message"
            />
          </div>
          {draft.mode === "fixed" ? (
            <>
              <Textarea
                className="mt-1 min-h-20"
                maxLength={1000}
                onChange={(event) =>
                  setDraft({ ...draft, message: event.target.value })
                }
                placeholder="Salom {name}! Savolingizga javob oldingizmi? Yana yordam kerak bo'lsa, yozing."
                value={draft.message}
              />
              <p className="text-xs text-muted-foreground">
                {"Write {name} to use the customer's first name."}
              </p>
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <p className="console-label">Where</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {(Object.keys(CHANNEL_LABELS) as FollowUpChannel[]).map(
              (channel) => (
                <label
                  className="flex items-center gap-2 text-sm text-foreground"
                  key={channel}
                >
                  <Checkbox
                    checked={draft.channels[channel]}
                    onCheckedChange={(checked) =>
                      setDraft({
                        ...draft,
                        channels: {
                          ...draft.channels,
                          [channel]: checked === true,
                        },
                      })
                    }
                  />
                  {CHANNEL_LABELS[channel]}
                </label>
              )
            )}
          </div>
          <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
            Instagram and WhatsApp only allow a message within 24 hours of the
            customer&apos;s last one, so follow-ups there always go out within a
            day. On the website, the customer sees it the next time they open
            the chat.
          </p>
        </div>
      </div>

      <div>
        <Button
          disabled={!isDirty || isSaving}
          onClick={() => void handleSave()}
          size="sm"
        >
          {isSaving ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          Save
        </Button>
      </div>
    </div>
  )
}

const RecentFollowUps = () => {
  const overview = useQuery(api.private.followUps.getOverview)

  if (overview === undefined) {
    return <SkeletonRows avatar={false} count={3} />
  }

  if (overview.recent.length === 0) {
    return (
      <ReportQuiet icon={SendIcon}>
        No follow-ups sent yet. They appear here as they go out.
      </ReportQuiet>
    )
  }

  return (
    <ul>
      {overview.recent.map((item) => (
        <li
          className="flex flex-col gap-1 border-b border-[var(--report-rule)] py-2.5 last:border-b-0"
          key={item.id}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href={`/conversations/${item.conversationId}`}
            >
              {item.customerName || "Customer"}
            </Link>
            <span>{CHANNEL_LABELS[item.channel]}</span>
            <span>{formatDistanceToNow(item.sentAt, { addSuffix: true })}</span>
            {item.status === "failed" ? (
              <Pill tone="critical">Not delivered</Pill>
            ) : item.replied ? (
              <Pill icon={CheckIcon} tone="positive">
                Replied
              </Pill>
            ) : null}
          </div>
          <p className="max-w-[72ch] text-sm leading-relaxed text-foreground/85">
            {item.text}
          </p>
        </li>
      ))}
    </ul>
  )
}

/* ── broadcasts ─────────────────────────────────────────────────────────── */

const BroadcastComposer = () => {
  const create = useMutation(api.private.broadcasts.create)
  const [message, setMessage] = useState("")
  const [channels, setChannels] = useState<BroadcastChannel[]>(["telegram"])
  const [telegramAudience, setTelegramAudience] =
    useState<(typeof TELEGRAM_AUDIENCES)[number]["value"]>("all")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const telegramActiveWithinDays = TELEGRAM_AUDIENCES.find(
    (item) => item.value === telegramAudience
  )?.days
  const audience = useQuery(api.private.broadcasts.getAudience, {
    telegramActiveWithinDays,
  })

  const recipients = channels.reduce(
    (total, channel) =>
      total + (audience?.[channel].connected ? audience[channel].count : 0),
    0
  )
  const canSend = message.trim().length > 0 && recipients > 0 && !isSending

  const toggleChannel = (channel: BroadcastChannel, checked: boolean) =>
    setChannels((current) =>
      checked
        ? Array.from(new Set([...current, channel]))
        : current.filter((item) => item !== channel)
    )

  const handleSend = async () => {
    setIsSending(true)
    try {
      await create({
        message,
        channels,
        telegramActiveWithinDays,
      })
      setMessage("")
      setIsConfirmOpen(false)
      toast.success("Broadcast is on its way")
    } catch (error) {
      toast.error(getConvexErrorMessage(error, "Couldn't send the broadcast"))
    } finally {
      setIsSending(false)
    }
  }

  const channelNote = (channel: BroadcastChannel) => {
    const info = audience?.[channel]

    if (!info) {
      return "…"
    }

    if (!info.connected) {
      return "Not connected"
    }

    return `${info.isCapped ? "≥ " : ""}${info.count}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          className="min-h-24"
          maxLength={3500}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Salom {name}! Bu hafta barcha xizmatlarimizga 20% chegirma."
          value={message}
        />
        <p className="text-xs text-muted-foreground">
          {"Write {name} to use each customer's first name."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="console-label">Send to</p>
        <ul className="flex flex-col gap-2">
          {(["telegram", "instagram", "whatsapp"] as const).map((channel) => {
            const connected = audience?.[channel].connected ?? false

            return (
              <li className="flex flex-col gap-2" key={channel}>
                <label
                  className={cn(
                    "flex items-center gap-2.5 text-sm text-foreground",
                    !connected && "opacity-55"
                  )}
                >
                  <Checkbox
                    checked={connected && channels.includes(channel)}
                    disabled={!connected}
                    onCheckedChange={(checked) =>
                      toggleChannel(channel, checked === true)
                    }
                  />
                  <span className="font-medium">{CHANNEL_LABELS[channel]}</span>
                  <span className="console-numeral text-xs text-muted-foreground">
                    {channelNote(channel)}
                  </span>
                </label>
                {channel === "telegram" && connected ? (
                  <Select
                    onValueChange={(value) =>
                      setTelegramAudience(
                        value as (typeof TELEGRAM_AUDIENCES)[number]["value"]
                      )
                    }
                    value={telegramAudience}
                  >
                    <SelectTrigger className="ml-[1.625rem] h-8 w-[calc(100%-1.625rem)] text-xs sm:w-80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TELEGRAM_AUDIENCES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </li>
            )
          })}
        </ul>
        {audience &&
        !audience.telegram.connected &&
        !audience.instagram.connected &&
        !audience.whatsapp.connected ? (
          <p className="text-xs text-muted-foreground">
            <Link
              className="text-foreground underline underline-offset-4"
              href="/integrations"
            >
              Connect Telegram, Instagram or WhatsApp
            </Link>{" "}
            to send broadcasts.
          </p>
        ) : null}
        <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
          Instagram and WhatsApp only allow a message to people who wrote to you
          in the last 24 hours, so only they are counted. If a customer replies,
          the conversation starts with your broadcast so your assistant knows
          what they are answering.
        </p>
      </div>

      <div>
        <Button
          disabled={!canSend}
          onClick={() => setIsConfirmOpen(true)}
          size="sm"
        >
          <MegaphoneIcon data-icon="inline-start" />
          Send broadcast
        </Button>
      </div>

      <AlertDialog onOpenChange={setIsConfirmOpen} open={isConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this broadcast?</AlertDialogTitle>
            <AlertDialogDescription>
              <span>
                It goes out right away and can&apos;t be taken back once
                delivered.
              </span>{" "}
              <span>Recipients:</span> <strong>{recipients}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="max-h-40 overflow-y-auto rounded-lg bg-muted/50 px-3 py-2.5 text-sm whitespace-pre-line">
            {message}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSending}
              onClick={(event) => {
                event.preventDefault()
                void handleSend()
              }}
            >
              {isSending ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : null}
              Send now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const BroadcastHistory = () => {
  const broadcasts = useQuery(api.private.broadcasts.list)
  const cancel = useMutation(api.private.broadcasts.cancel)

  if (broadcasts === undefined) {
    return <SkeletonRows avatar={false} count={2} />
  }

  if (broadcasts.length === 0) {
    return (
      <ReportQuiet icon={MegaphoneIcon}>
        No broadcasts yet. Sent ones appear here with their delivery count.
      </ReportQuiet>
    )
  }

  const statusPill = (broadcast: Broadcast) =>
    broadcast.status === "sending" ? (
      <Pill tone="info">Sending</Pill>
    ) : broadcast.status === "cancelled" ? (
      <Pill tone="warning">Stopped</Pill>
    ) : (
      <Pill icon={CheckIcon} tone="positive">
        Sent
      </Pill>
    )

  return (
    <div>
      <ul>
        {broadcasts.map((broadcast) => {
          const done = broadcast.sentCount + broadcast.failedCount

          return (
            <li
              className="flex flex-col gap-1.5 border-b border-[var(--report-rule)] py-2.5 last:border-b-0"
              key={broadcast._id}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {statusPill(broadcast)}
                <span>
                  {formatDistanceToNow(broadcast.createdAt, {
                    addSuffix: true,
                  })}
                </span>
                <span>
                  {broadcast.channels
                    .map((channel) => CHANNEL_LABELS[channel])
                    .join(" · ")}
                </span>
                <span className="console-numeral">
                  {broadcast.sentCount}/{broadcast.totalRecipients}
                </span>
                {broadcast.failedCount ? (
                  <span className="text-[var(--mood-negative)]">
                    {broadcast.failedCount} not delivered
                  </span>
                ) : null}
                {broadcast.status === "sending" ? (
                  <button
                    className="text-foreground underline underline-offset-4"
                    onClick={() =>
                      void cancel({ broadcastId: broadcast._id }).catch(() =>
                        toast.error("Couldn't stop the broadcast")
                      )
                    }
                    type="button"
                  >
                    Stop
                  </button>
                ) : null}
              </div>
              <p className="line-clamp-2 max-w-[72ch] text-sm text-foreground/85">
                {broadcast.message}
              </p>
              {broadcast.status === "sending" && broadcast.totalRecipients ? (
                <Meter
                  className="max-w-sm"
                  value={(done / broadcast.totalRecipients) * 100}
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ── page ───────────────────────────────────────────────────────────────── */

export const FollowUpsView = () => {
  const settings = useQuery(api.private.followUps.getSettings)
  const overview = useQuery(api.private.followUps.getOverview)
  const broadcasts = useQuery(api.private.broadcasts.list)
  const replyRate =
    overview && overview.sent
      ? `${Math.round((overview.replied / overview.sent) * 100)}%`
      : "—"

  return (
    <ConsolePage width="wide">
      <div className="report flex flex-col gap-4">
        <PageBar
          hint="Check in automatically with customers who went quiet, and message everyone who wrote to you at once."
          meta={
            settings ? (
              <Pill tone={settings.enabled ? "positive" : "neutral"}>
                {settings.enabled ? "Follow-ups on" : "Follow-ups off"}
              </Pill>
            ) : null
          }
          title="Follow-ups & broadcasts"
        />

        <FigureStrip className="md:grid-cols-4">
          <StripFigure
            icon={SendIcon}
            label="Follow-ups sent"
            note="In the last 30 days"
            tone="info"
            value={overview ? overview.sent : "—"}
          />
          <StripFigure
            icon={ReplyIcon}
            label="Customers who replied"
            note="Wrote back after a follow-up"
            tone="positive"
            value={overview ? overview.replied : "—"}
          />
          <StripFigure
            icon={PercentIcon}
            label="Reply rate"
            note="Share of follow-ups that brought the customer back"
            tone="accent"
            value={replyRate}
          />
          <StripFigure
            icon={MegaphoneIcon}
            label="Broadcasts sent"
            note="Most recent 20"
            tone="warning"
            value={broadcasts ? broadcasts.length : "—"}
          />
        </FigureStrip>

        <div className="grid items-start gap-4 xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            <ReportSection
              lede="One friendly check-in, sent by your assistant, when a customer stops replying."
              title="Automatic follow-ups"
            >
              {settings === undefined ? (
                <SkeletonRows avatar={false} count={3} />
              ) : (
                // Keyed on the saved values, so a save (here or in another tab)
                // starts the form again from what is actually stored.
                <FollowUpSettingsForm
                  key={JSON.stringify(settings)}
                  settings={settings}
                />
              )}
            </ReportSection>

            <ReportSection
              lede="What your assistant sent, and who came back."
              title="Latest follow-ups"
            >
              <RecentFollowUps />
            </ReportSection>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <ReportSection
              lede="A new offer, holiday hours, a product back in stock — one message to everyone who wrote to you."
              title="New broadcast"
            >
              <BroadcastComposer />
            </ReportSection>

            <ReportSection
              lede="Delivery progress for your latest broadcasts."
              title="Sent broadcasts"
            >
              <BroadcastHistory />
            </ReportSection>
          </div>
        </div>
      </div>
    </ConsolePage>
  )
}
