"use client"

import { useOrganization } from "@clerk/nextjs"
import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Switch } from "@workspace/ui/components/switch"
import {
  ArrowUpRightIcon,
  CameraIcon as InstagramIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  GlobeIcon,
  KeyRoundIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  Trash2Icon,
  WebhookIcon,
  ZapIcon,
} from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { ConsolePage } from "@/modules/dashboard/ui/components/console"
import "@/modules/dashboard/ui/styles/report.css"
import "../styles/setup.css"
import {
  DEFAULT_WIDGET_SCRIPT_URL,
  type IntegrationId,
  INTEGRATIONS,
  type WebhookEventType,
  type WebhookProvider,
  WEBHOOK_EVENT_TYPES,
  WEBHOOK_PROVIDERS,
  type WidgetPosition,
  WIDGET_POSITIONS,
} from "../../constants"
import {
  createScript,
  isValidWidgetScriptUrl,
  normalizeScriptUrl,
} from "../../utils"
import {
  ApiKeysSection,
  type ProviderStatuses,
} from "../components/api-keys-section"
import { ProFeatureGate } from "@/modules/billing/ui/components/pro-feature-gate"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  SetupPanelSkeleton,
  SkeletonRows,
} from "@/modules/dashboard/ui/components/report-skeleton"

type WebhookDestination = {
  _id: string
  _creationTime: number
  url: string
  description?: string
  provider: WebhookProvider
  providerConfigPreview?: {
    telegramChatId?: string
    hasTelegramBotToken?: boolean
    whatsappPhoneNumberId?: string
    whatsappRecipientPhone?: string
    hasWhatsappAccessToken?: boolean
  }
  isEnabled: boolean
  eventTypes: WebhookEventType[]
  updatedAt: number
  signingSecretPreview: string
}

type WebhookDelivery = {
  _id: string
  _creationTime: number
  webhookId: string
  webhookUrl: string
  eventId: string
  eventType: WebhookEventType
  status: "success" | "failed"
  attempt: number
  responseStatus?: number
  responseBody?: string
  error?: string
  durationMs?: number
}

type WebhookDashboard = {
  webhooks: WebhookDestination[]
  deliveries: WebhookDelivery[]
}

type TelegramDashboard = {
  integration: null | {
    _id: string
    _creationTime: number
    botUsername?: string
    botFirstName?: string
    webhookUrl?: string
    isEnabled: boolean
    status: "connected" | "needs_webhook_url" | "error"
    setupError?: string
    lastWebhookAt?: number
    updatedAt: number
  }
}

type InstagramDashboard = {
  integration: null | {
    _id: string
    _creationTime: number
    instagramUserId: string
    username?: string
    webhookUrl?: string
    verifyToken: string
    isEnabled: boolean
    status: "connected" | "needs_webhook_url" | "error"
    setupError?: string
    lastWebhookAt?: number
    updatedAt: number
  }
}

type WhatsAppDashboard = {
  integration: null | {
    _id: string
    _creationTime: number
    phoneNumberId: string
    businessAccountId?: string
    displayPhoneNumber?: string
    verifiedName?: string
    webhookUrl?: string
    verifyToken: string
    isEnabled: boolean
    status: "connected" | "needs_webhook_url" | "error"
    setupError?: string
    lastWebhookAt?: number
    updatedAt: number
  }
}

const webhookEventTypeById = WEBHOOK_EVENT_TYPES.reduce(
  (acc, e) => {
    acc[e.id] = e
    return acc
  },
  {} as Record<WebhookEventType, (typeof WEBHOOK_EVENT_TYPES)[number]>
)
const webhookProviderById = WEBHOOK_PROVIDERS.reduce(
  (acc, p) => {
    acc[p.id] = p
    return acc
  },
  {} as Record<WebhookProvider, (typeof WEBHOOK_PROVIDERS)[number]>
)

const formatEventTypeLabel = (e: WebhookEventType) =>
  webhookEventTypeById[e]?.label ?? e
const formatWebhookProviderLabel = (p: WebhookProvider) =>
  webhookProviderById[p]?.label ?? p
const formatTimeAgo = (ts: number) =>
  formatDistanceToNow(ts, { addSuffix: true })
const DELIVERY_HISTORY_VISIBLE_COUNT = 10

const PROVIDER_IMAGE_SRC: Partial<Record<WebhookProvider, string>> = {
  discord: "/discord.png",
  telegram: "/telegram.png",
  whatsapp: "/whatsapp.png",
}

const ProviderIcon = ({
  provider,
  size = 24,
}: {
  provider: WebhookProvider
  size?: number
}) => {
  const src = PROVIDER_IMAGE_SRC[provider]
  if (src) {
    return (
      <Image
        alt={formatWebhookProviderLabel(provider)}
        src={src}
        width={size}
        height={size}
        className="rounded-sm object-contain"
      />
    )
  }
  return (
    <WebhookIcon
      style={{ width: size, height: size }}
      className="text-muted-foreground"
    />
  )
}

const ChannelIcon = ({
  channel,
  size = 24,
}: {
  channel: "telegram" | "instagram" | "whatsapp"
  size?: number
}) => {
  if (channel === "instagram") {
    return (
      <InstagramIcon
        style={{ width: size, height: size }}
        className="text-pink-600"
      />
    )
  }

  if (channel === "whatsapp") {
    return <ProviderIcon provider="whatsapp" size={size} />
  }

  return <ProviderIcon provider="telegram" size={size} />
}

// Simple token-class syntax highlighter for generated snippets
const tokenizeSnippet = (code: string): { text: string; cls: string }[] => {
  const tokens: { text: string; cls: string }[] = []
  const regex =
    /(\/\/[^\n]*|<!--[\s\S]*?-->|"[^"]*"|'[^']*'|`[^`]*`|<\/?[A-Za-z][A-Za-z0-9.]*|\/?>|import|export|const|return|function|async|await|useEffect|null|undefined|true|false|[A-Za-z_$][A-Za-z0-9_$.]*\s*(?=\()|[{}[\]();,])/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(code)) !== null) {
    if (match.index > last)
      tokens.push({ text: code.slice(last, match.index), cls: "text-zinc-300" })
    const t = match[0]
    let cls = "text-zinc-300"
    if (/^(\/\/|<!--)/.test(t)) cls = "text-zinc-500 italic"
    else if (/^["'`]/.test(t) || /^"[^"]*"$/.test(t)) cls = "text-amber-300"
    else if (/^<\/?[A-Za-z]|[/>]>?$/.test(t)) cls = "text-emerald-400"
    else if (
      /^(import|export|const|return|function|async|await|useEffect|null|undefined|true|false)$/.test(
        t
      )
    )
      cls = "text-sky-400"
    else if (/^[A-Za-z_$][A-Za-z0-9_$.]*\s*\($/.test(t)) cls = "text-yellow-300"
    else if (/^[{}[\]();,]$/.test(t)) cls = "text-zinc-500"
    tokens.push({ text: t, cls })
    last = match.index + t.length
  }
  if (last < code.length)
    tokens.push({ text: code.slice(last), cls: "text-zinc-300" })
  return tokens
}

// ─── setup primitives ─────────────────────────────────────────────────────────

type SetupTone = "live" | "attention" | "error" | "off" | "neutral" | "loading"
type SetupState = { tone: SetupTone; label: string }

const StatusLine = ({
  state,
  className,
}: {
  state: SetupState
  className?: string
}) =>
  state.tone === "loading" ? (
    <span className={cn("flex min-w-0 items-center py-0.5", className)}>
      <span className="sr-only">{state.label}</span>
      <Skeleton aria-hidden className="h-2.5 w-28 rounded-full" />
    </span>
  ) : (
  <span
    className={cn(
      "flex min-w-0 items-center gap-2 text-xs text-muted-foreground",
      className
    )}
  >
    <span className="setup-dot" data-tone={state.tone} />
    <span
      className={cn(
        "truncate",
        (state.tone === "attention" || state.tone === "error") &&
          "font-medium text-foreground"
      )}
    >
      {state.label}
    </span>
  </span>
)

const PanelHeader = ({
  glyph,
  title,
  state,
  description,
  actions,
}: {
  glyph: React.ReactNode
  title: string
  state: SetupState
  description: React.ReactNode
  actions?: React.ReactNode
}) => (
  <header className="pb-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <span className="setup-glyph size-14" data-size="lg">
          {glyph}
        </span>
        <div className="min-w-0">
          <h2 className="setup-panel-title">{title}</h2>
          <StatusLine className="mt-2" state={state} />
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
    <p className="report-lede mt-5 max-w-[62ch]">{description}</p>
  </header>
)

const Step = ({
  index,
  title,
  children,
}: {
  index: number
  title: React.ReactNode
  children?: React.ReactNode
}) => (
  <li>
    <span className="setup-step-index">{index}</span>
    <div className="min-w-0">
      <p className="setup-step-title">{title}</p>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  </li>
)

const CopyField = ({
  label,
  value,
  onCopy,
}: {
  label: string
  value: string
  onCopy: () => void
}) => (
  <div className="setup-field flex items-center justify-between gap-4 py-3">
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <code className="mt-1 block truncate font-mono text-[0.8rem] text-foreground">
        {value}
      </code>
    </div>
    <Button
      aria-label={`Copy ${label.toLowerCase()}`}
      className="shrink-0"
      onClick={onCopy}
      size="sm"
      type="button"
      variant="ghost"
    >
      <CopyIcon data-icon="inline-start" />
      Copy
    </Button>
  </div>
)

const Callout = ({
  tone = "attention",
  children,
}: {
  tone?: "attention" | "error" | "info"
  children: React.ReactNode
}) => (
  <div
    className="setup-callout text-sm leading-relaxed text-foreground"
    data-tone={tone}
    role={tone === "error" ? "alert" : undefined}
  >
    {children}
  </div>
)

const Disclosure = ({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string
  children: React.ReactNode
  defaultOpen?: boolean
}) => (
  <details className="setup-disclosure" open={defaultOpen}>
    <summary>
      <ChevronRightIcon aria-hidden className="size-4" />
      {summary}
    </summary>
    <div className="pb-4">{children}</div>
  </details>
)

const DisconnectButton = ({
  what,
  consequence,
  busy,
  onConfirm,
}: {
  what: string
  consequence: string
  busy: boolean
  onConfirm: () => void
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        className="text-muted-foreground hover:text-destructive"
        disabled={busy}
        size="sm"
        type="button"
        variant="ghost"
      >
        {busy ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : (
          <Trash2Icon data-icon="inline-start" />
        )}
        Disconnect
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Disconnect {what}?</AlertDialogTitle>
        <AlertDialogDescription>{consequence}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep connected</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Disconnect</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

const INSTALL_HINT: Record<IntegrationId, string> = {
  html5:
    "Paste it just before the closing </body> tag — or into the custom code / footer section of your site builder.",
  react: "Render <EchoWidget /> once, in your root component.",
  nextjs: "Render <EchoWidgetScript /> once, in your root layout.",
  javascript: "Run it once when your page loads.",
}

type ActiveSection =
  | "widget"
  | "apiKeys"
  | "telegram"
  | "instagram"
  | "whatsapp"
  | "webhooks"

export const IntegrationsView = () => {
  const { organization } = useOrganization()
  const searchParams = useSearchParams()
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [isAddingWebhook, setIsAddingWebhook] = useState(false)

  const [activeSection, setActiveSection] = useState<ActiveSection>("widget")
  const [selectedIntegration, setSelectedIntegration] =
    useState<IntegrationId>("html5")
  const [scriptUrl, setScriptUrl] = useState(DEFAULT_WIDGET_SCRIPT_URL)
  const [position, setPosition] = useState<WidgetPosition>("bottom-right")
  const [selectedAgentId, setSelectedAgentId] = useState("default")
  const [snippetCopied, setSnippetCopied] = useState(false)

  const [selectedWebhookProvider, setSelectedWebhookProvider] =
    useState<WebhookProvider>("discord")
  const [webhookUrl, setWebhookUrl] = useState<string>(
    webhookProviderById.discord.defaultUrl
  )
  const [webhookDescription, setWebhookDescription] = useState("")
  const [telegramBotToken, setTelegramBotToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [whatsappAccessToken, setWhatsappAccessToken] = useState("")
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState("")
  const [whatsappRecipientPhone, setWhatsappRecipientPhone] = useState("")
  const [selectedWebhookEvents, setSelectedWebhookEvents] = useState<
    WebhookEventType[]
  >(WEBHOOK_EVENT_TYPES.map((e) => e.id))
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false)
  const [isClearingDeliveryHistory, setIsClearingDeliveryHistory] =
    useState(false)
  const [loadingWebhookId, setLoadingWebhookId] = useState<string | null>(null)
  const [latestSigningSecret, setLatestSigningSecret] = useState<string | null>(
    null
  )
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(
    null
  )
  const [telegramChannelBotToken, setTelegramChannelBotToken] = useState("")
  const [isConnectingTelegram, setIsConnectingTelegram] = useState(false)
  const [isDisconnectingTelegram, setIsDisconnectingTelegram] = useState(false)
  const [isStartingInstagramOAuth, setIsStartingInstagramOAuth] = useState(false)
  const [isDisconnectingInstagram, setIsDisconnectingInstagram] =
    useState(false)
  const [isResyncingInstagram, setIsResyncingInstagram] = useState(false)
  const [whatsappChannelAccessToken, setWhatsappChannelAccessToken] =
    useState("")
  const [whatsappChannelPhoneNumberId, setWhatsappChannelPhoneNumberId] =
    useState("")
  const [whatsappChannelBusinessAccountId, setWhatsappChannelBusinessAccountId] =
    useState("")
  const [isConnectingWhatsapp, setIsConnectingWhatsapp] = useState(false)
  const [isDisconnectingWhatsapp, setIsDisconnectingWhatsapp] = useState(false)

  const agentsState = useQuery(api.private.widgetSettings.listAgents)

  const normalizedScriptUrl = useMemo(
    () => normalizeScriptUrl(scriptUrl),
    [scriptUrl]
  )
  const scriptUrlIsValid = useMemo(
    () => isValidWidgetScriptUrl(normalizedScriptUrl),
    [normalizedScriptUrl]
  )
  const selectedIntegrationItem = useMemo(
    () => INTEGRATIONS.find((i) => i.id === selectedIntegration),
    [selectedIntegration]
  )
  const selectedWebhookProviderItem = useMemo(
    () => webhookProviderById[selectedWebhookProvider],
    [selectedWebhookProvider]
  )
  const agents = (agentsState?.agents ?? []) as Array<{
    agentId: string
    name: string
    isDefault: boolean
  }>

  useEffect(() => {
    if (!agentsState || agents.length === 0) return
    const exists = agents.some(
      (agent: { agentId: string }) => agent.agentId === selectedAgentId
    )
    if (!exists) {
      setSelectedAgentId(agents[0]?.agentId ?? "default")
    }
  }, [agents, agentsState, selectedAgentId])

  const snippet = useMemo(() => {
    if (!organization?.id) return ""
    return createScript(selectedIntegration, {
      organizationId: organization.id,
      scriptUrl: normalizedScriptUrl,
      position,
      agentId: selectedAgentId,
    })
  }, [
    organization?.id,
    selectedIntegration,
    normalizedScriptUrl,
    position,
    selectedAgentId,
  ])

  const snippetTokens = useMemo(() => tokenizeSnippet(snippet), [snippet])

  const webhookDashboard = useQuery(
    (api as any).private.integrationWebhooks.getDashboard,
    {}
  ) as WebhookDashboard | undefined
  const telegramDashboard = useQuery(
    (api as any).private.telegram.getDashboard,
    {}
  ) as TelegramDashboard | undefined
  const instagramDashboard = useQuery(
    (api as any).private.instagram.getDashboard,
    {}
  ) as InstagramDashboard | undefined
  const whatsappDashboard = useQuery(
    (api as any).private.whatsapp.getDashboard,
    {}
  ) as WhatsAppDashboard | undefined
  const providerStatuses = useQuery(api.private.secrets.getProviderStatuses) as
    | ProviderStatuses
    | undefined

  const connectTelegram = useAction(
    (api as any).private.telegram.connect
  ) as (args: { botToken: string }) => Promise<{
    integrationId: string
    botUsername?: string
    status: "connected" | "needs_webhook_url"
    webhookUrl?: string
  }>

  const disconnectTelegram = useAction(
    (api as any).private.telegram.disconnect
  )

  const getInstagramOAuthAuthorizationUrl = useAction(
    (api as any).private.instagram.getOAuthAuthorizationUrl
  ) as () => Promise<{ authorizationUrl: string }>

  const disconnectInstagram = useAction(
    (api as any).private.instagram.disconnect
  ) as () => Promise<{ removed: boolean }>

  const resyncInstagramWebhooks = useAction(
    (api as any).private.instagram.resyncWebhooks
  ) as () => Promise<{
    status: "connected" | "needs_webhook_url"
    webhookUrl?: string
    verifyToken: string
    setupError?: string
  }>

  const connectWhatsapp = useAction(
    (api as any).private.whatsapp.connect
  ) as (args: {
    accessToken: string
    phoneNumberId: string
    businessAccountId?: string
  }) => Promise<{
    integrationId: string
    phoneNumberId: string
    displayPhoneNumber?: string
    status: "connected" | "needs_webhook_url"
    webhookUrl?: string
    verifyToken: string
  }>

  const disconnectWhatsapp = useAction(
    (api as any).private.whatsapp.disconnect
  ) as () => Promise<{ removed: boolean }>

  useEffect(() => {
    const section = searchParams.get("section")

    if (
      section === "widget" ||
      section === "apiKeys" ||
      section === "telegram" ||
      section === "instagram" ||
      section === "whatsapp" ||
      section === "webhooks"
    ) {
      setActiveSection(section)
    }
  }, [searchParams])

  const createWebhook = useMutation(
    (api as any).private.integrationWebhooks.createWebhook
  ) as (args: {
    url?: string
    description?: string
    provider: WebhookProvider
    providerConfig?: {
      telegramBotToken?: string
      telegramChatId?: string
      whatsappAccessToken?: string
      whatsappPhoneNumberId?: string
      whatsappRecipientPhone?: string
    }
    eventTypes: WebhookEventType[]
  }) => Promise<{ webhookId: string; signingSecret: string }>

  const updateWebhook = useMutation(
    (api as any).private.integrationWebhooks.updateWebhook
  ) as (args: {
    webhookId: string
    isEnabled?: boolean
    url?: string
    description?: string
    eventTypes?: WebhookEventType[]
    provider?: WebhookProvider
    providerConfig?: {
      telegramBotToken?: string
      telegramChatId?: string
      whatsappAccessToken?: string
      whatsappPhoneNumberId?: string
      whatsappRecipientPhone?: string
    }
  }) => Promise<void>

  const rotateSigningSecret = useMutation(
    (api as any).private.integrationWebhooks.rotateSigningSecret
  ) as (args: { webhookId: string }) => Promise<{ signingSecret: string }>
  const removeWebhook = useMutation(
    (api as any).private.integrationWebhooks.removeWebhook
  ) as (args: { webhookId: string }) => Promise<void>
  const clearDeliveryHistory = useMutation(
    (api as any).private.integrationWebhooks.clearDeliveryHistory
  ) as (args: {
    webhookId?: string
  }) => Promise<{ deletedCount: number; hasMore: boolean }>

  const copyText = async (
    value: string,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(successMessage)
    } catch {
      toast.error(errorMessage)
    }
  }

  const handleCopyOrganizationId = async () => {
    if (!organization?.id) {
      toast.error("Organization ID not found")
      return
    }
    await copyText(
      organization.id,
      "Organization ID copied",
      "Failed to copy organization ID"
    )
  }

  const handleCopySnippet = async () => {
    if (!snippet) {
      toast.error("Generate a snippet first")
      return
    }
    try {
      await navigator.clipboard.writeText(snippet)
      toast.success("Snippet copied to clipboard")
      setSnippetCopied(true)
      setTimeout(() => setSnippetCopied(false), 2000)
    } catch {
      toast.error("Failed to copy snippet")
    }
  }

  /** Resolves true once the destination exists, so the form knows to close. */
  const handleCreateWebhook = async (): Promise<boolean> => {
    const normalizedUrl = webhookUrl.trim()
    const isUrlRequired =
      selectedWebhookProvider === "webhook" ||
      selectedWebhookProvider === "discord"
    if (isUrlRequired && !normalizedUrl) {
      toast.error("Destination URL is required")
      return false
    }
    if (
      selectedWebhookProvider === "telegram" &&
      (!telegramBotToken.trim() || !telegramChatId.trim())
    ) {
      toast.error("Telegram requires bot token and chat ID")
      return false
    }
    if (
      selectedWebhookProvider === "whatsapp" &&
      (!whatsappAccessToken.trim() ||
        !whatsappPhoneNumberId.trim() ||
        !whatsappRecipientPhone.trim())
    ) {
      toast.error(
        "WhatsApp requires access token, phone number ID, and recipient"
      )
      return false
    }
    if (selectedWebhookEvents.length === 0) {
      toast.error("Select at least one event type")
      return false
    }

    setIsCreatingWebhook(true)
    try {
      const providerConfig =
        selectedWebhookProvider === "telegram"
          ? {
              telegramBotToken: telegramBotToken.trim(),
              telegramChatId: telegramChatId.trim(),
            }
          : selectedWebhookProvider === "whatsapp"
            ? {
                whatsappAccessToken: whatsappAccessToken.trim(),
                whatsappPhoneNumberId: whatsappPhoneNumberId.trim(),
                whatsappRecipientPhone: whatsappRecipientPhone.trim(),
              }
            : undefined

      const result = await createWebhook({
        url: normalizedUrl || undefined,
        description: webhookDescription.trim() || undefined,
        provider: selectedWebhookProvider,
        providerConfig,
        eventTypes: selectedWebhookEvents,
      })
      setLatestSigningSecret(result.signingSecret)
      setWebhookUrl(selectedWebhookProviderItem.defaultUrl)
      setWebhookDescription("")
      setTelegramBotToken("")
      setTelegramChatId("")
      setWhatsappAccessToken("")
      setWhatsappPhoneNumberId("")
      setWhatsappRecipientPhone("")
      toast.success("Webhook destination created")
      return true
    } catch {
      toast.error("Failed to create webhook destination")
      return false
    } finally {
      setIsCreatingWebhook(false)
    }
  }

  const handleConnectTelegram = async () => {
    if (!telegramChannelBotToken.trim()) {
      toast.error("Telegram bot token is required")
      return
    }

    setIsConnectingTelegram(true)
    try {
      const result = await connectTelegram({
        botToken: telegramChannelBotToken.trim(),
      })
      setTelegramChannelBotToken("")
      if (result.status === "connected") {
        toast.success(
          result.botUsername
            ? `Connected @${result.botUsername}`
            : "Telegram bot connected"
        )
      } else {
        toast.info("Bot saved. Add a webhook base URL to receive messages.")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect Telegram bot"
      )
    } finally {
      setIsConnectingTelegram(false)
    }
  }

  const handleDisconnectTelegram = async () => {
    setIsDisconnectingTelegram(true)
    try {
      await disconnectTelegram()
      toast.success("Telegram bot disconnected")
    } catch {
      toast.error("Failed to disconnect Telegram bot")
    } finally {
      setIsDisconnectingTelegram(false)
    }
  }

  const handleConnectInstagram = async () => {
    setIsStartingInstagramOAuth(true)
    try {
      const { authorizationUrl } = await getInstagramOAuthAuthorizationUrl()
      window.location.assign(authorizationUrl)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start Instagram authorization"
      )
      setIsStartingInstagramOAuth(false)
    }
  }

  const handleDisconnectInstagram = async () => {
    setIsDisconnectingInstagram(true)
    try {
      await disconnectInstagram()
      toast.success("Instagram account disconnected")
    } catch {
      toast.error("Failed to disconnect Instagram account")
    } finally {
      setIsDisconnectingInstagram(false)
    }
  }

  const handleResyncInstagramWebhooks = async () => {
    setIsResyncingInstagram(true)
    try {
      const result = await resyncInstagramWebhooks()
      if (result.status === "connected") {
        toast.success("Instagram webhooks refreshed")
      } else {
        toast.error(
          result.setupError ||
            "Instagram connected, but webhook setup still needs attention"
        )
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to refresh Instagram webhooks"
      )
    } finally {
      setIsResyncingInstagram(false)
    }
  }

  const handleConnectWhatsapp = async () => {
    if (
      !whatsappChannelPhoneNumberId.trim() ||
      !whatsappChannelAccessToken.trim()
    ) {
      toast.error("WhatsApp phone number ID and access token are required")
      return
    }

    setIsConnectingWhatsapp(true)
    try {
      const result = await connectWhatsapp({
        phoneNumberId: whatsappChannelPhoneNumberId.trim(),
        accessToken: whatsappChannelAccessToken.trim(),
        businessAccountId:
          whatsappChannelBusinessAccountId.trim() || undefined,
      })
      setWhatsappChannelPhoneNumberId("")
      setWhatsappChannelAccessToken("")
      setWhatsappChannelBusinessAccountId("")
      if (result.status === "connected") {
        toast.success(
          result.displayPhoneNumber
            ? `Connected ${result.displayPhoneNumber}`
            : "WhatsApp number connected"
        )
      } else {
        toast.info(
          "WhatsApp number saved. Add a webhook base URL to receive messages."
        )
      }
    } catch {
      toast.error("Failed to connect WhatsApp number")
    } finally {
      setIsConnectingWhatsapp(false)
    }
  }

  const handleDisconnectWhatsapp = async () => {
    setIsDisconnectingWhatsapp(true)
    try {
      await disconnectWhatsapp()
      toast.success("WhatsApp number disconnected")
    } catch {
      toast.error("Failed to disconnect WhatsApp number")
    } finally {
      setIsDisconnectingWhatsapp(false)
    }
  }

  const handleToggleWebhookEvent = (eventType: WebhookEventType) => {
    setSelectedWebhookEvents((prev) =>
      prev.includes(eventType)
        ? prev.filter((v) => v !== eventType)
        : [...prev, eventType]
    )
  }

  const handleWebhookProviderChange = (provider: WebhookProvider) => {
    setSelectedWebhookProvider(provider)
    setWebhookUrl(webhookProviderById[provider].defaultUrl)
  }

  const handleToggleWebhookEnabled = async (webhook: WebhookDestination) => {
    setLoadingWebhookId(webhook._id)
    try {
      await updateWebhook({
        webhookId: webhook._id,
        isEnabled: !webhook.isEnabled,
      })
      toast.success(
        webhook.isEnabled
          ? "Webhook destination disabled"
          : "Webhook destination enabled"
      )
    } catch {
      toast.error("Failed to update webhook destination")
    } finally {
      setLoadingWebhookId(null)
    }
  }

  const handleRotateSigningSecret = async (webhook: WebhookDestination) => {
    setLoadingWebhookId(webhook._id)
    try {
      const result = await rotateSigningSecret({ webhookId: webhook._id })
      setLatestSigningSecret(result.signingSecret)
      toast.success("Signing secret rotated")
    } catch {
      toast.error("Failed to rotate signing secret")
    } finally {
      setLoadingWebhookId(null)
    }
  }

  const handleDeleteWebhook = async (webhook: WebhookDestination) => {
    setLoadingWebhookId(webhook._id)
    try {
      await removeWebhook({ webhookId: webhook._id })
      toast.success("Webhook destination removed")
    } catch {
      toast.error("Failed to remove webhook destination")
    } finally {
      setLoadingWebhookId(null)
    }
  }

  const handleClearDeliveryHistory = async () => {
    if (deliveryLogs.length === 0) {
      toast.info("No delivery history to clear")
      return
    }
    setIsClearingDeliveryHistory(true)
    try {
      let totalDeleted = 0
      let hasMore = true
      let safetyCounter = 0
      while (hasMore && safetyCounter < 20) {
        const result = await clearDeliveryHistory({})
        totalDeleted += result.deletedCount
        hasMore = result.hasMore && result.deletedCount > 0
        safetyCounter += 1
        if (result.deletedCount === 0) break
      }
      if (totalDeleted > 0) {
        toast.success(
          `Cleared ${totalDeleted} delivery histor${totalDeleted === 1 ? "y entry" : "y entries"}`
        )
      } else {
        toast.info("No delivery history to clear")
      }
    } catch {
      toast.error("Failed to clear delivery history")
    } finally {
      setIsClearingDeliveryHistory(false)
    }
  }

  const resetGenerator = () => {
    setSelectedIntegration("html5")
    setScriptUrl(DEFAULT_WIDGET_SCRIPT_URL)
    setPosition("bottom-right")
    setSelectedAgentId(agents[0]?.agentId ?? "default")
  }

  const webhookDestinations = webhookDashboard?.webhooks ?? []
  const deliveryLogs = webhookDashboard?.deliveries ?? []
  const telegramIntegration = telegramDashboard?.integration ?? null
  const instagramIntegration = instagramDashboard?.integration ?? null

  const convexSiteHost = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

    if (!convexUrl) {
      return null
    }

    try {
      return new URL(convexUrl).hostname.replace(/\.convex\.cloud$/, ".convex.site")
    } catch {
      return null
    }
  }, [])

  const instagramWebhookHostMismatch = useMemo(() => {
    if (!instagramIntegration?.webhookUrl || !convexSiteHost) {
      return false
    }

    try {
      const webhookHost = new URL(instagramIntegration.webhookUrl).hostname

      // Production webhooks often live on a different Convex deployment than local dev.
      if (webhookHost.includes("nautical-gazelle-675")) {
        return false
      }

      return webhookHost !== convexSiteHost
    } catch {
      return false
    }
  }, [convexSiteHost, instagramIntegration?.webhookUrl])
  const whatsappIntegration = whatsappDashboard?.integration ?? null
  const configuredApiKeyCount = [
    providerStatuses?.openaiConfigured ??
      providerStatuses?.openaiRealtimeConfigured,
    providerStatuses?.geminiLiveConfigured,
  ].filter(Boolean).length

  const hasOverflowingDeliveryHistory =
    deliveryLogs.length > DELIVERY_HISTORY_VISIBLE_COUNT
  const successCount = deliveryLogs.filter((d) => d.status === "success").length
  const failedCount = deliveryLogs.filter((d) => d.status === "failed").length

  // Last delivery per webhook
  const lastDeliveryByWebhookId = useMemo(() => {
    const map: Record<string, WebhookDelivery> = {}
    for (const d of deliveryLogs) {
      if (!map[d.webhookId]) map[d.webhookId] = d
    }
    return map
  }, [deliveryLogs])

  const channelState = (
    integration:
      | null
      | undefined
      | { status: "connected" | "needs_webhook_url" | "error" },
    dashboardLoaded: boolean,
    connectedLabel: string,
    hasMismatch = false
  ): SetupState => {
    if (!dashboardLoaded) return { tone: "loading", label: "Checking…" }
    if (!integration) return { tone: "off", label: "Not connected" }
    if (integration.status === "error")
      return { tone: "error", label: "Connection error" }
    if (integration.status === "needs_webhook_url")
      return { tone: "attention", label: "Finish webhook setup" }
    if (hasMismatch)
      return { tone: "attention", label: "Check webhook address" }
    return { tone: "live", label: connectedLabel }
  }

  const telegramState = channelState(
    telegramIntegration,
    telegramDashboard !== undefined,
    telegramIntegration?.botUsername
      ? `Connected as @${telegramIntegration.botUsername}`
      : "Connected"
  )
  const instagramState = channelState(
    instagramIntegration,
    instagramDashboard !== undefined,
    instagramIntegration?.username
      ? `Connected as @${instagramIntegration.username}`
      : "Connected",
    instagramWebhookHostMismatch
  )
  const whatsappState = channelState(
    whatsappIntegration,
    whatsappDashboard !== undefined,
    whatsappIntegration?.displayPhoneNumber
      ? `Connected as ${whatsappIntegration.displayPhoneNumber}`
      : "Connected"
  )
  const websiteState: SetupState = {
    tone: "neutral",
    label: "Add the code to your site once",
  }
  const apiKeysState: SetupState =
    providerStatuses === undefined
      ? { tone: "loading", label: "Checking…" }
      : configuredApiKeyCount > 0
        ? {
            tone: "live",
            label: `${configuredApiKeyCount} of 2 keys saved`,
          }
        : { tone: "neutral", label: "Using Osonflow's keys" }
  const latestDelivery = deliveryLogs[0]
  const webhooksState: SetupState =
    webhookDashboard === undefined
      ? { tone: "loading", label: "Checking…" }
      : webhookDestinations.length === 0
        ? { tone: "off", label: "None set up" }
        : latestDelivery?.status === "failed"
          ? { tone: "attention", label: "Last delivery failed" }
          : {
              tone: "live",
              label: `${webhookDestinations.length} ${
                webhookDestinations.length === 1 ? "destination" : "destinations"
              }`,
            }

  const SECTIONS: {
    group: "Channels" | "Advanced"
    id: ActiveSection
    title: string
    glyph: React.ReactNode
    state: SetupState
  }[] = [
    {
      group: "Channels",
      id: "widget",
      title: "Website chat",
      glyph: <GlobeIcon className="size-4" />,
      state: websiteState,
    },
    {
      group: "Channels",
      id: "telegram",
      title: "Telegram",
      glyph: <ProviderIcon provider="telegram" size={18} />,
      state: telegramState,
    },
    {
      group: "Channels",
      id: "instagram",
      title: "Instagram",
      glyph: <ChannelIcon channel="instagram" size={17} />,
      state: instagramState,
    },
    {
      group: "Channels",
      id: "whatsapp",
      title: "WhatsApp",
      glyph: <ProviderIcon provider="whatsapp" size={18} />,
      state: whatsappState,
    },
    {
      group: "Advanced",
      id: "apiKeys",
      title: "Your AI keys",
      glyph: <KeyRoundIcon className="size-4" />,
      state: apiKeysState,
    },
    {
      group: "Advanced",
      id: "webhooks",
      title: "Event webhooks",
      glyph: <WebhookIcon className="size-4" />,
      state: webhooksState,
    },
  ]

  const messagingStates = [telegramState, instagramState, whatsappState]
  const isCheckingChannels =
    telegramDashboard === undefined ||
    instagramDashboard === undefined ||
    whatsappDashboard === undefined
  const connectedApps = messagingStates.filter(
    (state) => state.tone === "live" || state.tone === "attention"
  ).length
  const attentionItems = SECTIONS.filter(
    (section) =>
      section.state.tone === "attention" || section.state.tone === "error"
  )

  const selectSection = (id: ActiveSection) => {
    setActiveSection(id)
    router.replace(`?section=${id}`, { scroll: false })
    // On narrow screens the panel sits below the index — bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      )
    }
  }

  const copy = (value: string, what: string) =>
    void copyText(value, `${what} copied`, `Couldn't copy ${what.toLowerCase()}`)

  // ── panels ──────────────────────────────────────────────────────────────

  const websitePanel = (
    <>
      <PanelHeader
        description="A chat button on your website that answers visitors with your knowledge base, day and night. Add the code once — changes you make in Widget customization appear on your site automatically."
        glyph={<GlobeIcon className="size-6 text-primary" />}
        state={websiteState}
        title="Website chat"
      />

      <ol className="setup-steps">
        <Step index={1} title="Where is your website built?">
          <div
            aria-label="Website platform"
            className="flex flex-wrap gap-2"
            role="radiogroup"
          >
            {INTEGRATIONS.map((integration) => (
              <button
                aria-checked={integration.id === selectedIntegration}
                className="setup-choice"
                key={integration.id}
                onClick={() => setSelectedIntegration(integration.id)}
                role="radio"
                type="button"
              >
                <span className="setup-choice-icon">
                  <Image
                    alt=""
                    height={16}
                    src={integration.icon}
                    width={16}
                  />
                </span>
                {integration.id === "html5" ? "Any website" : integration.title}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {selectedIntegration === "html5"
              ? "Not sure? Choose this — it works with plain HTML and most site builders."
              : selectedIntegrationItem?.description}
          </p>
        </Step>

        <Step index={2} title="Copy your code">
          <div className="setup-code">
            <Button
              className="absolute top-3 right-3 z-10"
              disabled={!snippet || !scriptUrlIsValid}
              onClick={handleCopySnippet}
              size="sm"
              type="button"
              variant={snippetCopied ? "secondary" : "default"}
            >
              {snippetCopied ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <CopyIcon data-icon="inline-start" />
              )}
              {snippetCopied ? "Copied" : "Copy code"}
            </Button>
            <pre>
              {snippet ? (
                snippetTokens.map((tok, i) => (
                  <span className={tok.cls} key={i}>
                    {tok.text}
                  </span>
                ))
              ) : (
                <span className="text-zinc-500">
                  {"// Choose an organization to generate your code."}
                </span>
              )}
            </pre>
          </div>
          {!scriptUrlIsValid ? (
            <div className="mt-3">
              <Callout tone="error">
                The script address under Advanced options isn&apos;t a valid
                web address, so the code can&apos;t be copied yet.
              </Callout>
            </div>
          ) : null}
        </Step>

        <Step index={3} title="Paste it on your site and publish">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {INSTALL_HINT[selectedIntegration]} Then open your site — the chat
            button appears in the{" "}
            {WIDGET_POSITIONS.find(
              (option) => option.id === position
            )?.label.toLowerCase() ?? "bottom right"}{" "}
            corner.
          </p>
        </Step>
      </ol>

      <div className="mt-10 border-t border-[var(--report-rule)]">
        <Disclosure summary="Advanced options">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="widget-agent">Assistant</Label>
              <Select
                disabled={agentsState === undefined || agents.length === 0}
                onValueChange={setSelectedAgentId}
                value={selectedAgentId}
              >
                <SelectTrigger className="w-full" id="widget-agent">
                  <SelectValue placeholder="Select assistant" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.agentId} value={agent.agentId}>
                      {agent.name}
                      {agent.isDefault ? " (default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The code loads this assistant&apos;s published settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="launcher-position">Chat button position</Label>
              <Select
                onValueChange={(value) => setPosition(value as WidgetPosition)}
                value={position}
              >
                <SelectTrigger className="w-full" id="launcher-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {WIDGET_POSITIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="widget-script-url">Script address</Label>
              <Input
                aria-invalid={!scriptUrlIsValid}
                className="font-mono text-xs"
                id="widget-script-url"
                onChange={(event) => setScriptUrl(event.target.value)}
                placeholder="https://widget.osonflow.uz/widget.js"
                value={scriptUrl}
              />
              <p className="text-xs text-muted-foreground">
                Only change this if Osonflow support asked you to.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <CopyField
              label="Organization ID"
              onCopy={() => void handleCopyOrganizationId()}
              value={organization?.id ?? "—"}
            />
          </div>

          <button
            className="mt-4 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            onClick={resetGenerator}
            type="button"
          >
            Reset to defaults
          </button>
        </Disclosure>
      </div>
    </>
  )

  const telegramPanel = (
    <>
      <PanelHeader
        actions={
          telegramIntegration ? (
            <DisconnectButton
              busy={isDisconnectingTelegram}
              consequence="Customers messaging your bot will no longer reach your inbox or your assistant. Past conversations stay in Osonflow."
              onConfirm={() => void handleDisconnectTelegram()}
              what="your Telegram bot"
            />
          ) : null
        }
        description="Customers who message your Telegram bot are answered by your assistant, and the conversations land in your inbox."
        glyph={<ProviderIcon provider="telegram" size={30} />}
        state={telegramState}
        title="Telegram"
      />

      {!telegramIntegration ? (
        <ol className="setup-steps">
          <Step index={1} title="Create a bot with BotFather">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open BotFather in Telegram, send <code className="font-mono text-foreground">/newbot</code>{" "}
              and follow its questions — it takes a minute.
            </p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <a href="https://t.me/BotFather" rel="noreferrer" target="_blank">
                Open BotFather
                <ArrowUpRightIcon data-icon="inline-end" />
              </a>
            </Button>
          </Step>
          <Step index={2} title="Paste the token BotFather sends you">
            <div className="flex max-w-xl flex-col gap-3 sm:flex-row">
              <Label className="sr-only" htmlFor="telegram-channel-token">
                Bot token
              </Label>
              <Input
                className="min-w-0 flex-1 font-mono text-xs"
                id="telegram-channel-token"
                onChange={(event) =>
                  setTelegramChannelBotToken(event.target.value)
                }
                placeholder="123456789:AA..."
                type="password"
                value={telegramChannelBotToken}
              />
              <Button
                disabled={isConnectingTelegram || !telegramChannelBotToken.trim()}
                onClick={handleConnectTelegram}
                type="button"
              >
                {isConnectingTelegram ? (
                  <Loader2Icon className="animate-spin" data-icon="inline-start" />
                ) : (
                  <SendIcon data-icon="inline-start" />
                )}
                {isConnectingTelegram ? "Connecting…" : "Connect"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              It looks like <span className="font-mono">123456789:AAH…</span>{" "}
              Keep it private — anyone with it controls your bot.
            </p>
          </Step>
          <Step index={3} title="Say hello to your bot">
            <p className="text-sm text-muted-foreground">
              Open your bot, tap Start and send a message. It appears in your
              inbox within seconds.
            </p>
          </Step>
        </ol>
      ) : (
        <div className="flex flex-col gap-6">
          {telegramIntegration.setupError ? (
            <Callout tone="error">{telegramIntegration.setupError}</Callout>
          ) : null}
          <div>
            <CopyField
              label="Bot"
              onCopy={() =>
                copy(
                  telegramIntegration.botUsername
                    ? `https://t.me/${telegramIntegration.botUsername}`
                    : "",
                  "Bot link"
                )
              }
              value={
                telegramIntegration.botUsername
                  ? `t.me/${telegramIntegration.botUsername}`
                  : "Connected bot"
              }
            />
            <div className="setup-field flex items-center justify-between gap-4 py-3">
              <p className="text-xs text-muted-foreground">Last message</p>
              <p className="text-sm text-foreground">
                {telegramIntegration.lastWebhookAt
                  ? formatTimeAgo(telegramIntegration.lastWebhookAt)
                  : "None yet"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {telegramIntegration.botUsername ? (
              <Button asChild size="sm" variant="outline">
                <a
                  href={`https://t.me/${telegramIntegration.botUsername}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open @{telegramIntegration.botUsername}
                  <ArrowUpRightIcon data-icon="inline-end" />
                </a>
              </Button>
            ) : null}
            <p className="text-sm text-muted-foreground">
              Send it a text message to test. Only text messages are handled
              for now.
            </p>
          </div>
        </div>
      )}
    </>
  )

  const instagramPanel = (
    <>
      <PanelHeader
        actions={
          instagramIntegration ? (
            <>
              <Button
                disabled={isResyncingInstagram}
                onClick={handleResyncInstagramWebhooks}
                size="sm"
                type="button"
                variant="outline"
              >
                {isResyncingInstagram ? (
                  <Loader2Icon className="animate-spin" data-icon="inline-start" />
                ) : (
                  <RefreshCwIcon data-icon="inline-start" />
                )}
                Refresh connection
              </Button>
              <DisconnectButton
                busy={isDisconnectingInstagram}
                consequence="Instagram DMs will stop reaching your inbox and your assistant. Past conversations stay in Osonflow."
                onConfirm={() => void handleDisconnectInstagram()}
                what="Instagram"
              />
            </>
          ) : null
        }
        description="Direct messages to your Instagram professional account are answered by your assistant and collected in your inbox."
        glyph={<ChannelIcon channel="instagram" size={28} />}
        state={instagramState}
        title="Instagram"
      />

      {!instagramIntegration ? (
        <ol className="setup-steps">
          <Step index={1} title="Sign in with Instagram">
            <p className="text-sm text-muted-foreground">
              You&apos;ll be asked to allow Osonflow to:
            </p>
            <ul className="mt-3 max-w-md">
              {[
                "Read and reply to direct messages",
                "Read and reply to comments on your posts",
                "See your account's name and profile picture",
              ].map((permission) => (
                <li
                  className="setup-check flex items-center gap-3 py-2.5 text-sm text-foreground"
                  key={permission}
                >
                  <CheckIcon aria-hidden className="size-4 text-primary" />
                  {permission}
                </li>
              ))}
            </ul>
            <Button
              className="mt-5"
              disabled={isStartingInstagramOAuth}
              onClick={handleConnectInstagram}
              type="button"
            >
              {isStartingInstagramOAuth ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : (
                <InstagramIcon data-icon="inline-start" />
              )}
              {isStartingInstagramOAuth
                ? "Opening Instagram…"
                : "Continue with Instagram"}
            </Button>
          </Step>
          <Step index={2} title="Come back here">
            <p className="text-sm text-muted-foreground">
              After you approve, Instagram sends you back and your account shows
              as connected. Nothing to copy or paste.
            </p>
          </Step>
        </ol>
      ) : (
        <div className="flex flex-col gap-6">
          {instagramIntegration.status === "needs_webhook_url" ? (
            <Callout>
              {instagramIntegration.setupError ||
                "Instagram is connected, but messages can't arrive until the Meta webhook setup is finished."}
            </Callout>
          ) : null}
          {instagramIntegration.status === "error" &&
          instagramIntegration.setupError ? (
            <Callout tone="error">{instagramIntegration.setupError}</Callout>
          ) : null}
          {instagramWebhookHostMismatch ? (
            <Callout>
              Your Meta webhook may point to a different Osonflow environment.
              Press Refresh connection, then check the callback URL in your Meta
              app.
            </Callout>
          ) : null}

          <div>
            <div className="setup-field flex items-center justify-between gap-4 py-3">
              <p className="text-xs text-muted-foreground">Account</p>
              <p className="truncate text-sm text-foreground">
                {instagramIntegration.username
                  ? `@${instagramIntegration.username}`
                  : instagramIntegration.instagramUserId}
              </p>
            </div>
            <div className="setup-field flex items-center justify-between gap-4 py-3">
              <p className="text-xs text-muted-foreground">Last message</p>
              <p className="text-sm text-foreground">
                {instagramIntegration.lastWebhookAt
                  ? formatTimeAgo(instagramIntegration.lastWebhookAt)
                  : "None yet"}
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--report-rule)]">
            <Disclosure summary="Meta app setup (for your developer)">
              <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                In Meta App Dashboard, open Instagram → Webhooks and make sure{" "}
                <code className="font-mono text-foreground">messages</code> is
                subscribed — it&apos;s required for DMs and only needs doing
                once. For production, switch the Meta app to Live mode and
                complete App Review so any professional account can connect.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Account ID{" "}
                <span className="font-mono">
                  {instagramIntegration.instagramUserId}
                </span>
              </p>
            </Disclosure>
          </div>
        </div>
      )}
    </>
  )

  const whatsappPanel = (
    <>
      <PanelHeader
        actions={
          whatsappIntegration ? (
            <DisconnectButton
              busy={isDisconnectingWhatsapp}
              consequence="Messages to this WhatsApp number will stop reaching your inbox and your assistant. Past conversations stay in Osonflow."
              onConfirm={() => void handleDisconnectWhatsapp()}
              what="WhatsApp"
            />
          ) : null
        }
        description="Messages to your WhatsApp Business number are answered by your assistant and collected in your inbox."
        glyph={<ProviderIcon provider="whatsapp" size={30} />}
        state={whatsappState}
        title="WhatsApp"
      />

      {!whatsappIntegration ? (
        <ol className="setup-steps">
          <Step index={1} title="Open WhatsApp API setup in Meta">
            <p className="text-sm leading-relaxed text-muted-foreground">
              In your Meta developer app, go to WhatsApp → API setup. You need
              the <span className="text-foreground">Phone number ID</span> and a{" "}
              <span className="text-foreground">permanent access token</span>.
            </p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <a
                href="https://developers.facebook.com/apps"
                rel="noreferrer"
                target="_blank"
              >
                Open Meta for Developers
                <ArrowUpRightIcon data-icon="inline-end" />
              </a>
            </Button>
          </Step>
          <Step index={2} title="Paste them here">
            <div className="grid max-w-xl gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-channel-phone-number-id">
                  Phone number ID
                </Label>
                <Input
                  className="font-mono text-xs"
                  id="whatsapp-channel-phone-number-id"
                  onChange={(event) =>
                    setWhatsappChannelPhoneNumberId(event.target.value)
                  }
                  placeholder="123456789012345"
                  value={whatsappChannelPhoneNumberId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-channel-access-token">
                  Access token
                </Label>
                <Input
                  className="font-mono text-xs"
                  id="whatsapp-channel-access-token"
                  onChange={(event) =>
                    setWhatsappChannelAccessToken(event.target.value)
                  }
                  placeholder="EAAG..."
                  type="password"
                  value={whatsappChannelAccessToken}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-channel-business-account-id">
                  Business account ID{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  className="font-mono text-xs"
                  id="whatsapp-channel-business-account-id"
                  onChange={(event) =>
                    setWhatsappChannelBusinessAccountId(event.target.value)
                  }
                  placeholder="987654321098765"
                  value={whatsappChannelBusinessAccountId}
                />
              </div>
              <Button
                className="w-fit"
                disabled={
                  isConnectingWhatsapp ||
                  !whatsappChannelPhoneNumberId.trim() ||
                  !whatsappChannelAccessToken.trim()
                }
                onClick={handleConnectWhatsapp}
                type="button"
              >
                {isConnectingWhatsapp ? (
                  <Loader2Icon className="animate-spin" data-icon="inline-start" />
                ) : (
                  <SendIcon data-icon="inline-start" />
                )}
                {isConnectingWhatsapp ? "Connecting…" : "Connect WhatsApp"}
              </Button>
            </div>
          </Step>
          <Step index={3} title="Finish the webhook in Meta">
            <p className="text-sm text-muted-foreground">
              Once connected, this page shows the callback URL and verify token
              to paste into Meta&apos;s webhook settings.
            </p>
          </Step>
        </ol>
      ) : (
        <div className="flex flex-col gap-6">
          {whatsappIntegration.status === "needs_webhook_url" ? (
            <Callout>
              {whatsappIntegration.setupError ||
                "Connected — paste the callback URL and verify token below into Meta's webhook settings so messages can arrive."}
            </Callout>
          ) : null}
          {whatsappIntegration.status === "error" &&
          whatsappIntegration.setupError ? (
            <Callout tone="error">{whatsappIntegration.setupError}</Callout>
          ) : null}

          <div>
            <div className="setup-field flex items-center justify-between gap-4 py-3">
              <p className="text-xs text-muted-foreground">Number</p>
              <p className="truncate text-sm text-foreground">
                {[
                  whatsappIntegration.verifiedName,
                  whatsappIntegration.displayPhoneNumber,
                ]
                  .filter(Boolean)
                  .join(" · ") || whatsappIntegration.phoneNumberId}
              </p>
            </div>
            <div className="setup-field flex items-center justify-between gap-4 py-3">
              <p className="text-xs text-muted-foreground">Last message</p>
              <p className="text-sm text-foreground">
                {whatsappIntegration.lastWebhookAt
                  ? formatTimeAgo(whatsappIntegration.lastWebhookAt)
                  : "None yet"}
              </p>
            </div>
          </div>

          <div>
            <p className="console-label mb-2">Meta webhook settings</p>
            {whatsappIntegration.webhookUrl ? (
              <CopyField
                label="Callback URL"
                onCopy={() =>
                  copy(whatsappIntegration.webhookUrl || "", "Callback URL")
                }
                value={whatsappIntegration.webhookUrl}
              />
            ) : null}
            <CopyField
              label="Verify token"
              onCopy={() => copy(whatsappIntegration.verifyToken, "Verify token")}
              value={whatsappIntegration.verifyToken}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Phone number ID{" "}
              <span className="font-mono">{whatsappIntegration.phoneNumberId}</span>
            </p>
          </div>
        </div>
      )}
    </>
  )

  const apiKeysPanel = (
    <>
      <PanelHeader
        description="Osonflow's own AI keys work out of the box. Add your company's keys only if you want AI usage billed to your own OpenAI or Google account."
        glyph={<KeyRoundIcon className="size-6 text-primary" />}
        state={apiKeysState}
        title="Your AI keys"
      />
      <ProFeatureGate fallback={<SkeletonRows count={2} trailing={1} />}>
        <ApiKeysSection providerStatuses={providerStatuses} />
      </ProFeatureGate>
    </>
  )

  const showWebhookForm = isAddingWebhook || webhookDestinations.length === 0

  const webhooksPanel = (
    <>
      <PanelHeader
        actions={
          webhookDestinations.length > 0 && !isAddingWebhook ? (
            <Button
              onClick={() => setIsAddingWebhook(true)}
              size="sm"
              type="button"
            >
              <PlusIcon data-icon="inline-start" />
              Add destination
            </Button>
          ) : null
        }
        description="Send a notice to Discord, Telegram, WhatsApp or your own system whenever something happens — a new chat, a message, a conversation handed to your team."
        glyph={<WebhookIcon className="size-6 text-primary" />}
        state={webhooksState}
        title="Event webhooks"
      />

      {latestSigningSecret ? (
        <div className="mb-8">
          <Callout>
            <p className="font-medium">Save this signing secret now — it&apos;s shown only once.</p>
            <div className="mt-3 flex max-w-xl items-center gap-2">
              <Input
                aria-label="Signing secret"
                className="font-mono text-xs"
                readOnly
                value={latestSigningSecret}
              />
              <Button
                onClick={() => copy(latestSigningSecret, "Signing secret")}
                size="sm"
                type="button"
                variant="outline"
              >
                <CopyIcon data-icon="inline-start" />
                Copy
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your developer uses it to confirm events really came from Osonflow.
            </p>
          </Callout>
        </div>
      ) : null}

      {webhookDestinations.length > 0 ? (
        <section className="pb-8">
          <p className="console-label mb-3">Destinations</p>
          <ul>
            {webhookDestinations.map((webhook) => {
              const isExpanded = expandedWebhookId === webhook._id
              const lastDelivery = lastDeliveryByWebhookId[webhook._id]
              const isBusy = loadingWebhookId === webhook._id

              return (
                <li className="setup-row" key={webhook._id}>
                  <div className="flex items-center gap-3 px-2 py-3">
                    <button
                      aria-expanded={isExpanded}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      onClick={() =>
                        setExpandedWebhookId(isExpanded ? null : webhook._id)
                      }
                      type="button"
                    >
                      <span className="setup-glyph size-9">
                        <ProviderIcon provider={webhook.provider} size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.95rem] font-medium text-foreground">
                          {webhook.description ||
                            formatWebhookProviderLabel(webhook.provider)}
                        </span>
                        <StatusLine
                          className="mt-0.5"
                          state={
                            !webhook.isEnabled
                              ? { tone: "off", label: "Paused" }
                              : lastDelivery?.status === "failed"
                                ? {
                                    tone: "attention",
                                    label: `Last delivery failed ${formatTimeAgo(lastDelivery._creationTime)}`,
                                  }
                                : lastDelivery
                                  ? {
                                      tone: "live",
                                      label: `Delivered ${formatTimeAgo(lastDelivery._creationTime)}`,
                                    }
                                  : { tone: "live", label: "On · no events yet" }
                          }
                        />
                      </span>
                      <ChevronDownIcon
                        aria-hidden
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                    <Switch
                      aria-label={
                        webhook.isEnabled
                          ? "Pause destination"
                          : "Turn destination on"
                      }
                      checked={webhook.isEnabled}
                      disabled={isBusy}
                      onCheckedChange={() => handleToggleWebhookEnabled(webhook)}
                    />
                  </div>

                  {isExpanded ? (
                    <div className="setup-panel grid gap-4 pr-2 pb-5 pl-14">
                      <p className="text-sm text-muted-foreground">
                        {formatWebhookProviderLabel(webhook.provider)}
                        {webhook.provider === "telegram"
                          ? ` · chat ${webhook.providerConfigPreview?.telegramChatId || "—"}`
                          : null}
                        {webhook.provider === "whatsapp"
                          ? ` · to ${webhook.providerConfigPreview?.whatsappRecipientPhone || "—"}`
                          : null}
                      </p>
                      {webhook.url ? (
                        <code className="font-mono text-xs break-all text-muted-foreground">
                          {webhook.url}
                        </code>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        Sends:{" "}
                        <span className="text-foreground">
                          {webhook.eventTypes.map(formatEventTypeLabel).join(", ")}
                        </span>
                      </p>
                      <p className="font-mono text-[0.7rem] text-muted-foreground">
                        Signing secret {webhook.signingSecretPreview}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          disabled={isBusy}
                          onClick={() => handleRotateSigningSecret(webhook)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <RefreshCwIcon data-icon="inline-start" />
                          New signing secret
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="text-muted-foreground hover:text-destructive"
                              disabled={isBusy}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2Icon data-icon="inline-start" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove this destination?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently deletes the{" "}
                                {formatWebhookProviderLabel(webhook.provider)}{" "}
                                destination
                                {webhook.description
                                  ? ` “${webhook.description}”`
                                  : ""}{" "}
                                and its delivery history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteWebhook(webhook)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {showWebhookForm ? (
        <section className="setup-panel border-t border-[var(--report-rule)] py-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="setup-step-title pt-0">
              {webhookDestinations.length ? "Add a destination" : "Add your first destination"}
            </p>
            {webhookDestinations.length ? (
              <Button
                onClick={() => setIsAddingWebhook(false)}
                size="sm"
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            ) : null}
          </div>

          <ol className="setup-steps">
            <Step index={1} title="Where should notices go?">
              <div
                aria-label="Destination"
                className="flex flex-wrap gap-2"
                role="radiogroup"
              >
                {WEBHOOK_PROVIDERS.map((provider) => (
                  <button
                    aria-checked={selectedWebhookProvider === provider.id}
                    className="setup-choice"
                    key={provider.id}
                    onClick={() =>
                      handleWebhookProviderChange(provider.id as WebhookProvider)
                    }
                    role="radio"
                    type="button"
                  >
                    <span className="setup-choice-icon">
                      <ProviderIcon
                        provider={provider.id as WebhookProvider}
                        size={16}
                      />
                    </span>
                    {provider.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {selectedWebhookProviderItem.description}
              </p>
            </Step>

            <Step index={2} title="Connection details">
              <div className="grid max-w-xl gap-4">
                {selectedWebhookProvider === "telegram" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="telegram-bot-token">Bot token</Label>
                      <Input
                        className="font-mono text-xs"
                        id="telegram-bot-token"
                        onChange={(event) => setTelegramBotToken(event.target.value)}
                        placeholder="123456789:AA..."
                        type="password"
                        value={telegramBotToken}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram-chat-id">Chat ID</Label>
                      <Input
                        className="font-mono text-xs"
                        id="telegram-chat-id"
                        onChange={(event) => setTelegramChatId(event.target.value)}
                        placeholder="-1001234567890"
                        value={telegramChatId}
                      />
                    </div>
                  </>
                ) : null}

                {selectedWebhookProvider === "whatsapp" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-access-token">Access token</Label>
                      <Input
                        className="font-mono text-xs"
                        id="whatsapp-access-token"
                        onChange={(event) =>
                          setWhatsappAccessToken(event.target.value)
                        }
                        placeholder="EAAG..."
                        type="password"
                        value={whatsappAccessToken}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-phone-number-id">
                        Phone number ID
                      </Label>
                      <Input
                        className="font-mono text-xs"
                        id="whatsapp-phone-number-id"
                        onChange={(event) =>
                          setWhatsappPhoneNumberId(event.target.value)
                        }
                        placeholder="123456789012345"
                        value={whatsappPhoneNumberId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-recipient-phone">
                        Send to phone number
                      </Label>
                      <Input
                        className="font-mono text-xs"
                        id="whatsapp-recipient-phone"
                        onChange={(event) =>
                          setWhatsappRecipientPhone(event.target.value)
                        }
                        placeholder="15551234567"
                        value={whatsappRecipientPhone}
                      />
                    </div>
                  </>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">
                    {selectedWebhookProvider === "telegram" ||
                    selectedWebhookProvider === "whatsapp"
                      ? "Endpoint URL (optional)"
                      : "Webhook URL"}
                  </Label>
                  <Input
                    className="font-mono text-xs"
                    id="webhook-url"
                    onChange={(event) => setWebhookUrl(event.target.value)}
                    placeholder={selectedWebhookProviderItem.defaultUrl}
                    value={webhookUrl}
                  />
                  <p className="text-xs text-muted-foreground">
                    {selectedWebhookProvider === "telegram" ||
                    selectedWebhookProvider === "whatsapp"
                      ? "Leave as it is unless you use a custom relay."
                      : selectedWebhookProvider === "discord"
                        ? "In Discord: channel settings → Integrations → Webhooks → Copy webhook URL."
                        : "The address your system gave you for receiving events."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-description">
                    Name{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="webhook-description"
                    onChange={(event) => setWebhookDescription(event.target.value)}
                    placeholder="e.g. Reception alerts"
                    value={webhookDescription}
                  />
                </div>
              </div>
            </Step>

            <Step index={3} title="What should it be told about?">
              <ul className="max-w-xl">
                {WEBHOOK_EVENT_TYPES.map((eventType) => {
                  const checked = selectedWebhookEvents.includes(eventType.id)
                  const inputId = `webhook-event-${eventType.id}`

                  return (
                    <li className="setup-check" key={eventType.id}>
                      <label
                        className="flex cursor-pointer items-start gap-3 py-3"
                        htmlFor={inputId}
                      >
                        <Checkbox
                          checked={checked}
                          className="mt-0.5"
                          id={inputId}
                          onCheckedChange={() =>
                            handleToggleWebhookEvent(eventType.id)
                          }
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            {eventType.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {eventType.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>

              <Button
                className="mt-6"
                disabled={isCreatingWebhook}
                onClick={async () => {
                  if (await handleCreateWebhook()) setIsAddingWebhook(false)
                }}
                type="button"
              >
                {isCreatingWebhook ? (
                  <Loader2Icon className="animate-spin" data-icon="inline-start" />
                ) : (
                  <ZapIcon data-icon="inline-start" />
                )}
                {isCreatingWebhook ? "Creating…" : "Create destination"}
              </Button>
            </Step>
          </ol>
        </section>
      ) : null}

      {webhookDestinations.length > 0 || deliveryLogs.length > 0 ? (
        <section className={cn(showWebhookForm ? "pt-2" : "pt-4")}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="console-label">Recent deliveries</p>
              {deliveryLogs.length ? (
                <p className="text-xs text-muted-foreground">
                  <span className="console-numeral text-foreground">
                    {successCount}
                  </span>{" "}
                  delivered ·{" "}
                  <span className="console-numeral text-foreground">
                    {failedCount}
                  </span>{" "}
                  failed
                </p>
              ) : null}
            </div>
            {deliveryLogs.length ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isClearingDeliveryHistory}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2Icon data-icon="inline-start" />
                    {isClearingDeliveryHistory ? "Clearing…" : "Clear history"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear delivery history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes all {deliveryLogs.length} delivery
                      {deliveryLogs.length === 1 ? " record" : " records"}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearDeliveryHistory}>
                      Clear history
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>

          {deliveryLogs.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Nothing sent yet. Deliveries appear here the first time an event
              fires.
            </p>
          ) : (
            <ScrollArea
              className={cn(hasOverflowingDeliveryHistory && "h-[30rem]")}
            >
              <ul>
                {deliveryLogs.map((delivery) => (
                  <li
                    className="setup-row grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-2 py-3"
                    key={delivery._id}
                  >
                    <StatusLine
                      className="text-sm"
                      state={{
                        tone: delivery.status === "success" ? "live" : "error",
                        label: `${formatEventTypeLabel(delivery.eventType)} — ${
                          delivery.status === "success" ? "delivered" : "failed"
                        }`,
                      }}
                    />
                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatTimeAgo(delivery._creationTime)}
                    </span>
                    <p className="col-span-2 truncate pl-4 text-xs text-muted-foreground">
                      <span className="font-mono">{delivery.webhookUrl}</span>
                      {delivery.responseStatus
                        ? ` · HTTP ${delivery.responseStatus}`
                        : ""}
                      {delivery.durationMs ? ` · ${delivery.durationMs}ms` : ""}
                      {delivery.attempt > 1 ? ` · attempt ${delivery.attempt}` : ""}
                    </p>
                    {delivery.error ? (
                      <p className="col-span-2 pl-4 text-xs break-words text-foreground">
                        {delivery.error}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </section>
      ) : null}
    </>
  )

  // A panel whose data hasn't arrived would otherwise flash its
  // "not connected" steps for a moment before showing the real state.
  const panelLoading: Record<ActiveSection, boolean> = {
    widget: false,
    telegram: telegramDashboard === undefined,
    instagram: instagramDashboard === undefined,
    whatsapp: whatsappDashboard === undefined,
    apiKeys: false,
    webhooks: webhookDashboard === undefined,
  }

  const panels: Record<ActiveSection, React.ReactNode> = {
    widget: websitePanel,
    telegram: telegramPanel,
    instagram: instagramPanel,
    whatsapp: whatsappPanel,
    apiKeys: apiKeysPanel,
    webhooks: webhooksPanel,
  }

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <ConsolePage width="wide">
      <div className="report setup">
        <section className="pt-2 pb-10">
          <p className="console-eyebrow">Setup &amp; integrations</p>

          {isCheckingChannels ? (
            <div aria-busy="true" role="status">
              <span className="sr-only">Checking your connections</span>
              <div aria-hidden className="mt-7 space-y-3">
                <Skeleton className="h-11 w-full max-w-[30rem] rounded-2xl" />
                <Skeleton className="h-11 w-3/5 max-w-[20rem] rounded-2xl" />
              </div>
              <div aria-hidden className="mt-6 space-y-2.5">
                <Skeleton className="h-4 w-full max-w-[36rem] rounded-full" />
                <Skeleton className="h-4 w-4/5 max-w-[26rem] rounded-full" />
              </div>
            </div>
          ) : attentionItems.length ? (
            <>
              <h1 className="report-headline mt-6 max-w-[24ch]">
                <span className="report-headline-figure">
                  {attentionItems.length}{" "}
                  {attentionItems.length === 1 ? "connection" : "connections"}
                </span>{" "}
                {attentionItems.length === 1 ? "needs" : "need"} your attention.
              </h1>
              <p className="report-lede mt-5 max-w-[62ch]">
                {attentionItems.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 ? " " : null}
                    <button
                      className="font-semibold text-foreground underline decoration-[var(--outcome-open)] decoration-2 underline-offset-4"
                      onClick={() => selectSection(item.id)}
                      type="button"
                    >
                      {item.title}
                    </button>
                    : {item.state.label.toLowerCase()}.
                  </span>
                ))}
              </p>
            </>
          ) : connectedApps ? (
            <>
              <h1 className="report-headline mt-6 max-w-[24ch]">
                Your assistant answers on{" "}
                <span className="report-headline-figure">
                  {connectedApps} of 3
                </span>{" "}
                messaging apps.
              </h1>
              <p className="report-lede mt-5 max-w-[62ch]">
                {SECTIONS.filter(
                  (section) =>
                    section.group === "Channels" && section.state.tone === "live"
                )
                  .map((section) => section.title)
                  .join(" and ")}{" "}
                {connectedApps === 1 ? "is" : "are"} connected, plus your
                website once the chat code is on it.
              </p>
            </>
          ) : (
            <>
              <h1 className="report-headline mt-6 max-w-[22ch]">
                Put your assistant where customers already talk to you.
              </h1>
              <p className="report-lede mt-5 max-w-[62ch]">
                Start with your website — it takes one copy and paste. Then
                connect Telegram, Instagram or WhatsApp so every message is
                answered in one place.
              </p>
            </>
          )}
        </section>

        <div className="grid gap-10 border-t border-[var(--report-rule)] pt-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
          <nav
            aria-label="Setup sections"
            className="lg:sticky lg:top-6 lg:self-start"
          >
            {(["Channels", "Advanced"] as const).map((group) => (
              <div className="mb-6 last:mb-0" key={group}>
                <p className="console-label mb-2 px-3">
                  {group === "Channels" ? "Where customers reach you" : "Advanced"}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {SECTIONS.filter((section) => section.group === group).map(
                    (section) => (
                      <li key={section.id}>
                        <button
                          aria-current={activeSection === section.id}
                          className="setup-nav-row grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 text-left focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                          onClick={() => selectSection(section.id)}
                          type="button"
                        >
                          <span className="setup-glyph size-9">
                            {section.glyph}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {section.title}
                            </span>
                            <StatusLine
                              className="mt-0.5"
                              state={section.state}
                            />
                          </span>
                          <ChevronRightIcon
                            aria-hidden
                            className="setup-nav-chevron size-4 text-muted-foreground"
                          />
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </nav>

          <div
            className="setup-panel min-w-0 scroll-mt-6 pb-10"
            key={activeSection}
            ref={panelRef}
          >
            {panelLoading[activeSection] ? (
              <SetupPanelSkeleton />
            ) : (
              panels[activeSection]
            )}
          </div>
        </div>
      </div>
    </ConsolePage>
  )
}
