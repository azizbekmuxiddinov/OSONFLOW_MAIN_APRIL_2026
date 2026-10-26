"use client"

import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils"
import { api } from "@workspace/backend/_generated/api"
import { Id } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useAction, useQuery } from "convex/react"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import Bowser from "bowser"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import Link from "next/link"
import {
  BrainIcon,
  ClockIcon,
  GlobeIcon,
  MailIcon,
  MessagesSquareIcon,
  MonitorIcon,
  RefreshCwIcon,
  SendIcon,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner"

type InfoItem = {
  label: string
  value: string | React.ReactNode
  className?: string
}

type InfoSection = {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  items: InfoItem[]
}

const STATUS_LABELS = {
  unresolved: "Open",
  escalated: "Waiting for a person",
  resolved: "Closed",
} as const

export const ContactPanel = () => {
  const params = useParams()
  const conversationId = params.conversationId as Id<"conversations"> | null

  const contactSession = useQuery(
    api.private.contactSessions.getOneByConversationId,
    conversationId ? { conversationId } : "skip"
  )
  const refreshInstagramProfile = useAction(
    (api as any).private.instagram.refreshContactProfile
  ) as (args: { conversationId: Id<"conversations"> }) => Promise<{
    username?: string
    fullName?: string
    profilePicUrl?: string
    followerCount?: number
  }>
  const conversation = useQuery(
    api.private.conversations.getOne,
    conversationId ? { conversationId } : "skip"
  )
  const customerMemory = useQuery(
    api.private.customerMemories.getByEmail,
    contactSession?.email ? { email: contactSession.email } : "skip"
  )
  const [isRefreshingInstagramProfile, setIsRefreshingInstagramProfile] =
    useState(false)

  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) {
        return { browser: "Unknown", os: "Unknown", device: "Unknown" }
      }

      const browser = Bowser.getParser(userAgent)
      const result = browser.getResult()

      return {
        browser: result.browser.name || "Unknown",
        browserVersion: result.browser.version || "",
        os: result.os.name || "Unknown",
        osVersion: result.os.version || "",
        device: result.platform.type || "desktop",
        deviceVendor: result.platform.vendor || "",
        deviceModel: result.platform.model || "",
      }
    }
  }, [])

  const userAgentInfo = useMemo(
    () => parseUserAgent(contactSession?.metadata?.userAgent),
    [contactSession?.metadata?.userAgent, parseUserAgent]
  )

  const countryInfo = useMemo(() => {
    return getCountryFromTimezone(contactSession?.metadata?.timezone)
  }, [contactSession?.metadata?.timezone])
  const instagramProfilePic = contactSession?.metadata?.instagramProfilePic
  const instagramUsername = contactSession?.metadata?.instagramUsername
  const instagramFullName = contactSession?.metadata?.instagramFullName
  const isInstagramSession = contactSession?.metadata?.platform === "Instagram"
  const isWhatsappSession = contactSession?.metadata?.platform === "WhatsApp"
  const isTelegramSession = contactSession?.metadata?.platform === "Telegram"
  const telegramUsername = contactSession?.metadata?.telegramUsername
  const secondaryIdentity =
    isInstagramSession && instagramUsername
      ? `@${instagramUsername}`
      : isTelegramSession && telegramUsername
        ? `@${telegramUsername}`
        : isWhatsappSession && contactSession?.metadata?.whatsappPhoneNumber
          ? contactSession.metadata.whatsappPhoneNumber
          : (contactSession?.email ?? "")
  const handleRefreshInstagramProfile = async () => {
    if (!conversationId) {
      return
    }

    setIsRefreshingInstagramProfile(true)
    try {
      const profile = await refreshInstagramProfile({ conversationId })
      const label = profile.fullName || profile.username || "Instagram profile"
      toast.success(`Updated ${label}`)
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to refresh Instagram profile"
      )
    } finally {
      setIsRefreshingInstagramProfile(false)
    }
  }

  const accordionSections = useMemo<InfoSection[]>(() => {
    if (!contactSession?.metadata) {
      return []
    }

    const isExternalChannel =
      contactSession.metadata.platform === "Telegram" ||
      contactSession.metadata.platform === "Instagram" ||
      contactSession.metadata.platform === "WhatsApp"
    const isTelegramSession = contactSession.metadata.platform === "Telegram"
    const isInstagramSession = contactSession.metadata.platform === "Instagram"
    const isWhatsappSession = contactSession.metadata.platform === "WhatsApp"

    return [
      {
        id: "device-info",
        icon: MonitorIcon,
        title: "Device",
        items: isExternalChannel
          ? [
              {
                label: "Platform",
                value: contactSession.metadata.platform || "External",
              },
              {
                label: "Vendor",
                value: contactSession.metadata.vendor || "Unknown",
              },
            ]
          : [
              {
                label: "Browser",
                value:
                  userAgentInfo.browser +
                  (userAgentInfo.browserVersion
                    ? ` ${userAgentInfo.browserVersion}`
                    : ""),
              },
              {
                label: "OS",
                value:
                  userAgentInfo.os +
                  (userAgentInfo.osVersion
                    ? ` ${userAgentInfo.osVersion}`
                    : ""),
              },
            ],
      },
      // Telegram gives us no location or timezone, so the section would only
      // ever show "Unknown" rows.
      ...(isTelegramSession
        ? []
        : [
            {
              id: "location-language",
              icon: GlobeIcon,
              title: "Location & Language",
              items: [
                {
                  label: "Country",
                  value: countryInfo?.name || "Unknown",
                },
                {
                  label: "Timezone",
                  value: contactSession.metadata.timezone || "Unknown",
                },
                {
                  label: "Language",
                  value:
                    contactSession.metadata.language ||
                    contactSession.metadata.telegramLanguageCode ||
                    "Unknown",
                },
              ],
            },
          ]),
      {
        id: "session-details",
        icon: ClockIcon,
        title: "Session",
        items: [
          {
            label: "First Seen",
            value: new Date(contactSession._creationTime).toLocaleString(),
          },
          {
            label: "Resolution",
            value: contactSession.metadata.screenResolution || "Unknown",
          },
          ...(isTelegramSession
            ? [
                {
                  label: "Telegram ID",
                  value: contactSession.metadata.telegramUserId || "Unknown",
                },
                {
                  label: "Username",
                  value: contactSession.metadata.telegramUsername
                    ? `@${contactSession.metadata.telegramUsername}`
                    : "Unknown",
                },
              ]
            : []),
          ...(isInstagramSession
            ? [
                {
                  label: "Profile name",
                  value: contactSession.metadata.instagramFullName || "Unknown",
                },
                {
                  label: "Instagram ID",
                  value: contactSession.metadata.instagramUserId || "Unknown",
                },
                {
                  label: "Username",
                  value: contactSession.metadata.instagramUsername
                    ? `@${contactSession.metadata.instagramUsername}`
                    : "Unknown",
                },
                {
                  label: "Followers",
                  value:
                    typeof contactSession.metadata.instagramFollowerCount ===
                    "number"
                      ? contactSession.metadata.instagramFollowerCount.toLocaleString()
                      : "Unknown",
                },
              ]
            : []),
          ...(isWhatsappSession
            ? [
                {
                  label: "WhatsApp phone",
                  value:
                    contactSession.metadata.whatsappPhoneNumber || "Unknown",
                },
                {
                  label: "Profile name",
                  value:
                    contactSession.metadata.whatsappProfileName || "Unknown",
                },
                {
                  label: "Phone number ID",
                  value:
                    contactSession.metadata.whatsappPhoneNumberId || "Unknown",
                },
              ]
            : []),
        ],
      },
    ]
  }, [contactSession, userAgentInfo, countryInfo])

  if (contactSession === undefined) {
    return <ContactPanelSkeleton />
  }

  if (contactSession === null) {
    return null
  }

  const conversationSection: InfoSection | null = conversation
    ? {
        id: "conversation",
        icon: MessagesSquareIcon,
        title: "Conversation",
        items: [
          {
            label: "Status",
            value: (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    conversation.status === "resolved"
                      ? "bg-[var(--console-positive)]"
                      : conversation.status === "escalated"
                        ? "bg-[var(--console-warning)]"
                        : "bg-[var(--accent-blue)]"
                  )}
                />
                {STATUS_LABELS[conversation.status]}
              </span>
            ),
          },
          {
            label: "Assignee",
            value: conversation.assignedToName ?? "Unassigned",
          },
          {
            label: "Priority",
            value: conversation.priority
              ? conversation.priority[0]!.toUpperCase() +
                conversation.priority.slice(1)
              : "None",
          },
          {
            label: "Started",
            value: new Date(conversation._creationTime).toLocaleString(),
          },
        ],
      }
    : null
  const sections = [
    ...(conversationSection ? [conversationSection] : []),
    ...accordionSections,
  ]

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-x-hidden bg-background text-foreground">
      {/* Intercom's details header: one tab, level with the thread header. */}
      <div className="flex h-14 shrink-0 items-end gap-5 border-b border-[var(--console-hairline-soft)] px-4">
        <span className="relative pb-3.5 text-[13px] font-medium text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-[var(--accent-blue)]">
          Details
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Profile */}
        <div className="border-b border-[var(--console-hairline-soft)] px-4 py-4">
          <div className="flex items-center gap-3">
            <DicebearAvatar
              badgeImageUrl={
                countryInfo?.code
                  ? getCountryFlagUrl(countryInfo.code)
                  : undefined
              }
              className="shrink-0"
              imageUrl={instagramProfilePic}
              seed={contactSession._id}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm leading-snug font-semibold text-foreground">
                {contactSession.name}
              </h4>
              <p className="truncate text-xs text-muted-foreground">
                {secondaryIdentity}
              </p>
              {countryInfo?.name || (isInstagramSession && instagramFullName) ? (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                  {[
                    isInstagramSession && instagramFullName && instagramUsername
                      ? "Instagram"
                      : null,
                    countryInfo?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {isTelegramSession && telegramUsername ? (
              <Button asChild size="sm" variant="secondary">
                <a
                  href={`https://t.me/${telegramUsername}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <SendIcon className="size-3.5" />
                  Open in Telegram
                </a>
              </Button>
            ) : null}
            {!isInstagramSession && !isTelegramSession ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`mailto:${contactSession.email}`}>
                  <MailIcon className="size-3.5" />
                  Send email
                </Link>
              </Button>
            ) : null}
            {isInstagramSession ? (
              <Button
                disabled={isRefreshingInstagramProfile}
                onClick={handleRefreshInstagramProfile}
                size="sm"
                type="button"
                variant="secondary"
              >
                <RefreshCwIcon
                  className={cn(
                    "size-3.5",
                    isRefreshingInstagramProfile && "animate-spin"
                  )}
                />
                Refresh profile
              </Button>
            ) : null}
          </div>
        </div>

        {/* Sections, all open, Intercom-style */}
        <Accordion
          className="w-full"
          defaultValue={[...sections.map((section) => section.id), "memory"]}
          type="multiple"
        >
          {sections.map((section) => (
            <AccordionItem
              className="border-b border-[var(--console-hairline-soft)]"
              key={section.id}
              value={section.id}
            >
              <AccordionTrigger className="px-4 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase hover:bg-muted/30 hover:no-underline">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-0 pb-3.5">
                <dl className="grid grid-cols-[92px_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs">
                  {section.items.map((item) => (
                    <div className="contents" key={`${section.id}-${item.label}`}>
                      <dt className="text-muted-foreground">{item.label}</dt>
                      <dd
                        className={cn(
                          "min-w-0 truncate text-foreground",
                          item.className
                        )}
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
          ))}

          {customerMemory ? (
            <AccordionItem className="border-b-0" value="memory">
              <AccordionTrigger className="px-4 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase hover:bg-muted/30 hover:no-underline">
                <span className="flex items-center gap-1.5">
                  <BrainIcon className="size-3.5" />
                  Customer memory
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-0 pb-4">
                <p className="text-xs leading-relaxed text-foreground/85">
                  {customerMemory.summary}
                </p>
                {customerMemory.recentIntents.length ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {customerMemory.recentIntents.slice(0, 3).map((intent) => (
                      <Badge
                        className="text-[10px]"
                        key={intent}
                        variant="secondary"
                      >
                        {intent.replaceAll("_", " ")}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
      </div>
    </div>
  )
}

const ContactPanelSkeleton = () => {
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto bg-background text-foreground">
      <div className="border-b border-[var(--console-hairline-soft)] px-4 pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="relative size-11 shrink-0">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="absolute right-0 bottom-0 size-4 rounded-full border-2 border-background" />
          </div>
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        <Skeleton className="mt-3 h-9 w-full rounded-lg" />
      </div>

      <div className="w-full">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="border-b border-[var(--console-hairline-soft)] px-4 py-3" key={index}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="size-3 rounded" />
            </div>
            {index === 0 && (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 2 }).map((_, itemIndex) => (
                  <div
                    className="flex items-start justify-between gap-4"
                    key={itemIndex}
                  >
                    <Skeleton className="h-2.5 w-14" />
                    <Skeleton
                      className={cn("h-2.5", itemIndex === 0 ? "w-24" : "w-20")}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--console-hairline-soft)] px-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-3.5 rounded" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
