import { EMBED_CONFIG } from "./config"
import {
  chatBubbleIcon,
  closeIcon,
  collapseIcon,
  questionIcon,
  sparklesIcon,
} from "./icons"

type WidgetPosition = "bottom-right" | "bottom-left"
type WidgetLauncherIcon = "chat" | "sparkles" | "question"
type WidgetAnimation = "slide-up" | "scale" | "fade" | "pop"
type WidgetLauncherAttention = "none" | "pulse" | "bounce" | "wiggle" | "glow"

type WidgetAutoOpenFrequency = "session" | "visitor" | "always"

type WidgetAppearancePayload = {
  launcherColor?: string
  launcherLabel?: string
  voiceLauncherLabel?: string
  launcherIcon?: WidgetLauncherIcon
  launcherIconUrl?: string
  launcherPromptEnabled?: boolean
  launcherPromptText?: string
  launcherPromptDelaySeconds?: number
  launcherQuickReplies?: string[]
  launcherAttention?: WidgetLauncherAttention
  launcherBadgeEnabled?: boolean
  animation?: WidgetAnimation
  showPoweredBy?: boolean
  launcherPosition?: WidgetPosition
  launcherOffsetX?: number
  launcherOffsetY?: number
  launcherSize?: number
  widgetWidth?: number
  widgetHeight?: number
  autoOpenEnabled?: boolean
  autoOpenDelaySeconds?: number
  autoOpenFrequency?: WidgetAutoOpenFrequency
  notificationSoundEnabled?: boolean
}

/** Who the invitation bubble speaks as: the assistant's name and logo. */
type WidgetTeaserPayload = {
  name?: string
  avatarUrl?: string
}

type WidgetSettingsPayload = {
  appearance?: WidgetAppearancePayload
  liveVoiceEnabled?: boolean
  teaser?: WidgetTeaserPayload
}

const LAUNCHER_EDGE_OFFSET = 20
const LAUNCHER_BUTTON_SIZE = 48
const LAUNCHER_MIN_SIZE = 40
const LAUNCHER_MAX_SIZE = 76
const LAUNCHER_MAX_EDGE_OFFSET = 160
const AUTO_OPEN_MAX_DELAY_SECONDS = 300
const AUTO_OPEN_STORAGE_KEY = "echo-widget-auto-opened"
const STANDARD_OPEN_CLOSE_BUTTON_GAP = 8
const STANDARD_CLOSE_RETURN_OFFSET_X = 18
const STANDARD_LAUNCHER_REVEAL_DURATION = 180
const LAUNCHER_ORB_SIZE = 34
const LAUNCHER_BUTTON_GAP = 10
const LAUNCHER_LABEL_PADDING_X = 18
const LAUNCHER_PROMPT_GAP = 8
const LAUNCHER_PROMPT_GAP_EXTRA = 4
const LAUNCHER_PROMPT_MAX_WIDTH = 296
const LAUNCHER_PROMPT_TYPING_MS = 900
const LAUNCHER_PROMPT_DISMISSED_KEY = "echo-widget-teaser-dismissed"
const LAUNCHER_QUICK_REPLY_MAX = 3
const LAUNCHER_QUICK_REPLY_MAX_LENGTH = 40
const LAUNCHER_ATTENTIONS: readonly WidgetLauncherAttention[] = [
  "none",
  "pulse",
  "bounce",
  "wiggle",
  "glow",
]
const WIDGET_CONTAINER_WIDTH = 380
const WIDGET_CONTAINER_STANDARD_HEIGHT = 640
const WIDGET_CONTAINER_WIDTH_RANGE = { min: 340, max: 560 }
const WIDGET_CONTAINER_HEIGHT_RANGE = { min: 520, max: 880 }
const WIDGET_CONTAINER_VOICE_HEIGHT = 470
const WIDGET_CONTAINER_VOICE_CLOSED_TRANSFORM =
  "translate3d(0, 26px, 0) scale(0.975)"
const WIDGET_CONTAINER_VOICE_OPEN_TRANSFORM =
  "translate3d(0, 0, 0) scale(1)"
const WIDGET_CONTAINER_VOICE_OPEN_DURATION = 360
const WIDGET_CONTAINER_VOICE_CLOSE_DURATION = 220
const WIDGET_CONTAINER_VOICE_OPEN_EASING = "cubic-bezier(0.16, 1, 0.3, 1)"
const WIDGET_CONTAINER_VOICE_CLOSE_EASING = "cubic-bezier(0.4, 0, 1, 1)"
const WIDGET_CONTAINER_VOICE_CLOSED_FILTER = "blur(10px)"
const WIDGET_CONTAINER_VOICE_OPEN_FILTER = "blur(0px)"
const WIDGET_CONTAINER_OPEN_RADIUS = "30px"
const LAUNCHER_STYLE_ID = "echo-widget-launcher-styles"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
const LIVE_VOICE_LAUNCHER_LABEL = "Talk with us"
const NOTIFICATION_SOUND_PATH = "/sounds/notification.mp3"

;(function () {
  let iframe: HTMLIFrameElement | null = null
  let container: HTMLDivElement | null = null
  let revealSurface: HTMLDivElement | null = null
  let button: HTMLButtonElement | null = null
  let isOpen = false
  let hideTimer: number | null = null
  let launcherPromptTimer: number | null = null
  let launcherPrompt: HTMLDivElement | null = null
  let launcherPromptDismissed = false
  let isLauncherReady = false
  let isLiveVoiceEnabled = false
  let notificationAudio: HTMLAudioElement | null = null
  let canPlayNotificationSound = false
  let isListeningForHostUserActivation = false
  let launcherBadge: HTMLSpanElement | null = null
  // Replies the visitor has not seen yet, as reported by the widget.
  let unreadCount = 0
  let isLauncherPromptVisible = false
  let launcherPromptTypingTimer: number | null = null
  // Attention motion stops for good once the visitor has opened the widget:
  // it has done its job, and repeating it after that only nags.
  let hasOpenedWidget = false
  let teaserName = ""
  let teaserAvatarUrl = ""

  const launcherAppearance: Required<
    Pick<
      WidgetAppearancePayload,
      | "launcherColor"
      | "launcherLabel"
      | "voiceLauncherLabel"
      | "launcherIcon"
      | "launcherIconUrl"
      | "launcherPromptEnabled"
      | "launcherPromptText"
      | "launcherPromptDelaySeconds"
      | "launcherQuickReplies"
      | "launcherAttention"
      | "launcherBadgeEnabled"
      | "animation"
    >
  > = {
    launcherColor: "#6366f1",
    launcherLabel: "Chat with us",
    voiceLauncherLabel: LIVE_VOICE_LAUNCHER_LABEL,
    launcherIcon: "chat",
    launcherIconUrl: "",
    launcherPromptEnabled: false,
    launcherPromptText: "Need help? Talk with us",
    launcherPromptDelaySeconds: 5,
    launcherQuickReplies: [],
    launcherAttention: "none",
    launcherBadgeEnabled: false,
    animation: "slide-up",
  }

  const widgetAnimations: Record<
    WidgetAnimation,
    {
      closedTransform: string
      openTransform: string
      duration: number
      easing: string
    }
  > = {
    "slide-up": {
      closedTransform: "translate3d(0, 18px, 0) scale(0.98)",
      openTransform: "translate3d(0, 0, 0) scale(1)",
      duration: 260,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
    scale: {
      closedTransform: "translate3d(0, 8px, 0) scale(0.92)",
      openTransform: "translate3d(0, 0, 0) scale(1)",
      duration: 240,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
    fade: {
      closedTransform: "translate3d(0, 0, 0) scale(1)",
      openTransform: "translate3d(0, 0, 0) scale(1)",
      duration: 200,
      easing: "ease",
    },
    pop: {
      closedTransform: "translate3d(0, 20px, 0) scale(0.86)",
      openTransform: "translate3d(0, 0, 0) scale(1)",
      duration: 320,
      easing: "cubic-bezier(0.18, 1.35, 0.32, 1)",
    },
  }

  // Get configuration from script tag
  let organizationId: string | null = null
  let agentId: string | null = null
  let position: WidgetPosition = EMBED_CONFIG.DEFAULT_POSITION

  // Geometry starts at the documented defaults and is replaced the moment the
  // widget reports the organization's published appearance. The launcher stays
  // hidden until that happens, so the visitor never sees it jump.
  let launcherOffsetX = LAUNCHER_EDGE_OFFSET
  let launcherOffsetY = LAUNCHER_EDGE_OFFSET
  let launcherSize = LAUNCHER_BUTTON_SIZE
  // The open panel's size, set by the organization. The container's
  // max-width/max-height still cap it to the visitor's viewport.
  let widgetWidth = WIDGET_CONTAINER_WIDTH
  let widgetHeight = WIDGET_CONTAINER_STANDARD_HEIGHT
  let autoOpenEnabled = false
  let autoOpenDelaySeconds = 0
  let autoOpenFrequency: WidgetAutoOpenFrequency = "session"
  let autoOpenTimer: number | null = null
  let hasScheduledAutoOpen = false
  let isNotificationSoundEnabled = true

  const clampNumber = (value: number, min: number, max: number) =>
    Math.round(Math.max(min, Math.min(max, value)))

  const getContainerMaxHeightGutter = () => launcherOffsetY * 2

  const getStandardOpenContainerBottom = () =>
    launcherOffsetY + launcherSize + STANDARD_OPEN_CLOSE_BUTTON_GAP

  const getStandardOpenContainerMaxHeightGutter = () =>
    launcherOffsetY + getStandardOpenContainerBottom()

  /**
   * Pushes the current placement onto the three fixed elements. Called after
   * settings arrive rather than only at render time, because position, offsets
   * and size are all published settings now, not just script attributes.
   */
  const applyLauncherGeometry = () => {
    const edgeSide = position === "bottom-right" ? "right" : "left"
    const oppositeSide = position === "bottom-right" ? "left" : "right"

    if (button) {
      button.style[edgeSide] = `${launcherOffsetX}px`
      button.style[oppositeSide] = ""
      button.style.bottom = `${launcherOffsetY}px`
    }

    if (container) {
      container.style[edgeSide] = `${launcherOffsetX}px`
      container.style[oppositeSide] = ""
      container.style.transformOrigin =
        position === "bottom-right" ? "bottom right" : "bottom left"
    }

    // The individual properties are set rather than re-running
    // `syncLauncherPromptPosition`, which rewrites `cssText` and would hide a
    // prompt that is already on screen.
    if (launcherPrompt) {
      launcherPrompt.style[edgeSide] = `${launcherOffsetX}px`
      launcherPrompt.style[oppositeSide] = ""
      launcherPrompt.style.bottom = `${
        launcherOffsetY + launcherSize + LAUNCHER_PROMPT_GAP
      }px`
      launcherPrompt.style.textAlign =
        position === "bottom-right" ? "right" : "left"
    }

    syncContainerSize()
    applyLauncherAppearance()
  }

  /**
   * Proactive open.
   *
   * "Once per visitor" is remembered in localStorage and "once per session" in
   * sessionStorage; both are wrapped because a host page can block storage
   * entirely, and a blocked read must not stop the widget from loading.
   */
  const getAutoOpenStorage = (): Storage | null => {
    if (autoOpenFrequency === "always") {
      return null
    }

    try {
      return autoOpenFrequency === "visitor"
        ? window.localStorage
        : window.sessionStorage
    } catch {
      return null
    }
  }

  const getAutoOpenStorageKey = () =>
    `${AUTO_OPEN_STORAGE_KEY}:${organizationId ?? "default"}`

  const hasAlreadyAutoOpened = () => {
    const storage = getAutoOpenStorage()

    if (!storage) {
      return false
    }

    try {
      return storage.getItem(getAutoOpenStorageKey()) === "1"
    } catch {
      return false
    }
  }

  const rememberAutoOpen = () => {
    const storage = getAutoOpenStorage()

    if (!storage) {
      return
    }

    try {
      storage.setItem(getAutoOpenStorageKey(), "1")
    } catch {
      // Storage is full or blocked; the widget simply opens again next time.
    }
  }

  const cancelAutoOpen = () => {
    if (autoOpenTimer !== null) {
      window.clearTimeout(autoOpenTimer)
      autoOpenTimer = null
    }
  }

  const scheduleAutoOpen = () => {
    if (!autoOpenEnabled || hasScheduledAutoOpen || isOpen) {
      return
    }

    if (hasAlreadyAutoOpened()) {
      return
    }

    hasScheduledAutoOpen = true
    autoOpenTimer = window.setTimeout(() => {
      autoOpenTimer = null

      if (isOpen) {
        return
      }

      rememberAutoOpen()
      show()
    }, autoOpenDelaySeconds * 1000)
  }

  const getLauncherIconMarkup = (icon: WidgetLauncherIcon): string => {
    switch (icon) {
      case "sparkles":
        return sparklesIcon
      case "question":
        return questionIcon
      default:
        return chatBubbleIcon
    }
  }

  const parseLauncherIcon = (icon: unknown): WidgetLauncherIcon => {
    if (icon === "sparkles" || icon === "question" || icon === "chat") {
      return icon
    }

    return "chat"
  }

  const parseWidgetAnimation = (animation: unknown): WidgetAnimation => {
    if (
      animation === "slide-up" ||
      animation === "scale" ||
      animation === "fade" ||
      animation === "pop"
    ) {
      return animation
    }

    return "slide-up"
  }

  const normalizeHexColor = (value: string): string | null => {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
      return null
    }

    if (value.length === 4) {
      const [hash, r, g, b] = value
      return `${hash}${r}${r}${g}${g}${b}${b}`
    }

    return value
  }

  // The launcher icon is injected into an `<img src>` on the customer's page, so
  // reject anything that is not a plain http(s) or inline image URL.
  const sanitizeImageUrl = (value: string): string => {
    const trimmed = value.trim()

    if (!trimmed || /[()"'\\\s;<>]/.test(trimmed)) {
      return ""
    }

    if (
      /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(
        trimmed
      )
    ) {
      return trimmed
    }

    try {
      const protocol = new URL(trimmed, window.location.href).protocol
      return protocol === "http:" || protocol === "https:" ? trimmed : ""
    } catch {
      return ""
    }
  }

  const getContrastingTextColor = (color: string): string => {
    const normalizedHex = normalizeHexColor(color)
    if (!normalizedHex) {
      return "#ffffff"
    }

    const red = parseInt(normalizedHex.slice(1, 3), 16)
    const green = parseInt(normalizedHex.slice(3, 5), 16)
    const blue = parseInt(normalizedHex.slice(5, 7), 16)
    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

    return luminance > 0.6 ? "#111111" : "#ffffff"
  }

  const toShadowColor = (color: string): string => {
    const normalizedHex = normalizeHexColor(color)
    if (!normalizedHex) {
      return "rgba(99, 102, 241, 0.35)"
    }

    const red = parseInt(normalizedHex.slice(1, 3), 16)
    const green = parseInt(normalizedHex.slice(3, 5), 16)
    const blue = parseInt(normalizedHex.slice(5, 7), 16)
    return `rgba(${red}, ${green}, ${blue}, 0.35)`
  }

  const escapeHtml = (value: string): string => {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  const clampLauncherPromptDelaySeconds = (value: number): number => {
    if (Number.isNaN(value)) {
      return 5
    }

    return Math.max(0, Math.min(120, value))
  }

  const clearLauncherPromptTimer = () => {
    if (launcherPromptTimer !== null) {
      window.clearTimeout(launcherPromptTimer)
      launcherPromptTimer = null
    }

    if (launcherPromptTypingTimer !== null) {
      window.clearTimeout(launcherPromptTypingTimer)
      launcherPromptTypingTimer = null
    }
  }

  const parseLauncherAttention = (value: unknown): WidgetLauncherAttention =>
    LAUNCHER_ATTENTIONS.includes(value as WidgetLauncherAttention)
      ? (value as WidgetLauncherAttention)
      : "none"

  const parseQuickReplies = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
      return []
    }

    const replies = value
      .filter((reply): reply is string => typeof reply === "string")
      .map((reply) => reply.trim().slice(0, LAUNCHER_QUICK_REPLY_MAX_LENGTH))
      .filter(Boolean)

    return [...new Set(replies)].slice(0, LAUNCHER_QUICK_REPLY_MAX)
  }

  /**
   * A dismissed invitation stays dismissed for the rest of the visit, not just
   * this page load, so a visitor clicking around the site is not asked again
   * on every page. Storage can be blocked by the host, so every access is
   * guarded and a failure simply means the invitation may reappear.
   */
  const getPromptDismissedKey = () =>
    `${LAUNCHER_PROMPT_DISMISSED_KEY}:${organizationId ?? "default"}`

  const wasPromptDismissedThisSession = () => {
    try {
      return window.sessionStorage.getItem(getPromptDismissedKey()) === "1"
    } catch {
      return false
    }
  }

  const rememberPromptDismissed = () => {
    try {
      window.sessionStorage.setItem(getPromptDismissedKey(), "1")
    } catch {
      // Blocked storage; the invitation may show again on the next page.
    }
  }

  const syncLauncherPromptPosition = () => {
    if (!launcherPrompt) {
      return
    }

    launcherPrompt.style.cssText = `
      position: fixed;
      ${
        position === "bottom-right"
          ? `right: ${launcherOffsetX}px;`
          : `left: ${launcherOffsetX}px;`
      }
      bottom: ${launcherOffsetY + launcherSize + LAUNCHER_PROMPT_GAP + LAUNCHER_PROMPT_GAP_EXTRA}px;
      width: min(${LAUNCHER_PROMPT_MAX_WIDTH}px, calc(100vw - ${launcherOffsetX * 2}px));
      z-index: 999999;
      --echo-accent: ${launcherAppearance.launcherColor};
      --echo-accent-ink: ${getContrastingTextColor(launcherAppearance.launcherColor)};
      transform-origin: ${position === "bottom-right" ? "bottom right" : "bottom left"};
      display: ${isLauncherPromptVisible ? "block" : "none"};
    `
    launcherPrompt.dataset.side =
      position === "bottom-right" ? "right" : "left"
  }

  const dismissLauncherPrompt = () => {
    launcherPromptDismissed = true
    rememberPromptDismissed()
    hideLauncherPrompt()
  }

  const sendQuickReply = (reply: string) => {
    show()

    // The widget only accepts replies its own settings list, so this cannot
    // be used to put arbitrary words in the visitor's mouth.
    iframe?.contentWindow?.postMessage(
      { type: "start-chat", payload: { message: reply } },
      new URL(EMBED_CONFIG.WIDGET_URL).origin
    )
  }

  /**
   * Builds the invitation card with DOM APIs and `textContent` only: the name,
   * message and replies are organization-authored text rendered on someone
   * else's page, so none of it is ever parsed as markup.
   */
  const buildLauncherPromptContent = (withTyping: boolean) => {
    if (!launcherPrompt) {
      return
    }

    const card = document.createElement("div")
    card.className = "echo-teaser"
    if (withTyping) {
      card.classList.add("is-typing")
    }

    const closeButton = document.createElement("button")
    closeButton.type = "button"
    closeButton.className = "echo-teaser__close"
    closeButton.setAttribute("aria-label", "Dismiss")
    closeButton.innerHTML = closeIcon
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation()
      dismissLauncherPrompt()
    })

    const header = document.createElement("div")
    header.className = "echo-teaser__header"

    const avatar = document.createElement("span")
    avatar.className = "echo-teaser__avatar"
    const avatarUrl = sanitizeImageUrl(teaserAvatarUrl)
    if (avatarUrl) {
      const image = document.createElement("img")
      image.src = avatarUrl
      image.alt = ""
      avatar.appendChild(image)
    } else {
      avatar.textContent = (teaserName.trim()[0] ?? "").toUpperCase()
    }

    const name = document.createElement("span")
    name.className = "echo-teaser__name"
    name.textContent = teaserName.trim()

    const status = document.createElement("span")
    status.className = "echo-teaser__status"
    status.setAttribute("aria-hidden", "true")

    header.append(avatar, name, status)

    const message = document.createElement("button")
    message.type = "button"
    message.className = "echo-teaser__message"
    message.addEventListener("click", () => show())

    const typing = document.createElement("span")
    typing.className = "echo-teaser__typing"
    typing.setAttribute("aria-hidden", "true")
    typing.append(
      document.createElement("i"),
      document.createElement("i"),
      document.createElement("i")
    )

    const text = document.createElement("span")
    text.className = "echo-teaser__text"
    text.textContent = launcherAppearance.launcherPromptText.trim()

    message.append(typing, text)
    card.append(closeButton, header, message)

    if (launcherAppearance.launcherQuickReplies.length > 0) {
      const replies = document.createElement("div")
      replies.className = "echo-teaser__replies"

      launcherAppearance.launcherQuickReplies.forEach((reply, index) => {
        const chip = document.createElement("button")
        chip.type = "button"
        chip.className = "echo-teaser__chip"
        chip.style.setProperty("--echo-chip-index", String(index))
        chip.textContent = reply
        chip.addEventListener("click", () => sendQuickReply(reply))
        replies.appendChild(chip)
      })

      card.appendChild(replies)
    }

    launcherPrompt.replaceChildren(card)
  }

  const hideLauncherPrompt = () => {
    clearLauncherPromptTimer()
    isLauncherPromptVisible = false
    syncLauncherBadge()

    if (!launcherPrompt) {
      return
    }

    launcherPrompt.classList.remove("is-visible")
    launcherPrompt.style.display = "none"
  }

  const showLauncherPrompt = () => {
    if (!launcherPrompt) {
      return
    }

    if (!launcherAppearance.launcherPromptText.trim()) {
      return
    }

    const withTyping = !prefersReducedMotion()
    isLauncherPromptVisible = true
    buildLauncherPromptContent(withTyping)
    syncLauncherPromptPosition()
    syncLauncherBadge()

    window.requestAnimationFrame(() => {
      launcherPrompt?.classList.add("is-visible")
    })

    if (withTyping) {
      launcherPromptTypingTimer = window.setTimeout(() => {
        launcherPromptTypingTimer = null
        launcherPrompt
          ?.querySelector(".echo-teaser")
          ?.classList.remove("is-typing")
      }, LAUNCHER_PROMPT_TYPING_MS)
    }
  }

  const canShowLauncherPrompt = () => {
    const shouldShowButton = !isOpen || !isLiveVoiceEnabled

    return (
      launcherAppearance.launcherPromptEnabled &&
      !launcherPromptDismissed &&
      !isOpen &&
      !isLiveVoiceEnabled &&
      isLauncherReady &&
      Boolean(button) &&
      shouldShowButton
    )
  }

  const syncLauncherPrompt = () => {
    if (!canShowLauncherPrompt()) {
      hideLauncherPrompt()
      return
    }

    if (isLauncherPromptVisible) {
      // Settings changed while it is on screen: redraw in place, no retyping.
      buildLauncherPromptContent(false)
      syncLauncherPromptPosition()
      return
    }

    if (launcherPromptTimer !== null) {
      return
    }

    const delayMs =
      clampLauncherPromptDelaySeconds(
        launcherAppearance.launcherPromptDelaySeconds
      ) * 1000

    launcherPromptTimer = window.setTimeout(() => {
      launcherPromptTimer = null
      if (canShowLauncherPrompt()) {
        showLauncherPrompt()
      }
    }, delayMs)
  }

  /**
   * The launcher's badge: the number of unread replies, or a "1" while the
   * invitation is waiting. A real unread count always shows; the invitation
   * "1" only when the organization turned the badge on.
   */
  function syncLauncherBadge() {
    if (!button) {
      return
    }

    const hasUnread = unreadCount > 0
    const shouldShow =
      !isOpen &&
      !isLiveVoiceEnabled &&
      (hasUnread ||
        (launcherAppearance.launcherBadgeEnabled && isLauncherPromptVisible))

    if (!shouldShow) {
      launcherBadge?.remove()
      return
    }

    if (!launcherBadge) {
      launcherBadge = document.createElement("span")
      launcherBadge.className = "echo-widget-badge"
      launcherBadge.setAttribute("aria-hidden", "true")
    }

    const label = hasUnread ? (unreadCount > 9 ? "9+" : String(unreadCount)) : "1"
    if (launcherBadge.textContent !== label) {
      launcherBadge.textContent = label
      // Replay the pop so a new reply is noticed, not just a changed digit.
      launcherBadge.style.animation = "none"
      void launcherBadge.offsetWidth
      launcherBadge.style.animation = ""
    }

    // Centred on the launcher's outline where it meets the 45° diagonal from
    // the top-right corner: hugging the icon rather than floating off its
    // bounding box. The same corner geometry holds for the round launcher
    // and the pill, whose ends have a radius of half the launcher's height.
    const cornerInset = launcherSize * (1 - Math.SQRT1_2) * 0.5
    const badgeHalf = 9
    launcherBadge.style.top = `${Math.round(cornerInset - badgeHalf)}px`
    launcherBadge.style.right = `${Math.round(cornerInset - badgeHalf)}px`

    // `applyLauncherAppearance` rewrites the button's markup, so re-attach.
    if (launcherBadge.parentElement !== button) {
      button.appendChild(launcherBadge)
    }
  }

  /** Tells the widget whether the visitor can see it, for read receipts. */
  function announceVisibility() {
    iframe?.contentWindow?.postMessage(
      { type: "host-visibility", payload: { open: isOpen } },
      new URL(EMBED_CONFIG.WIDGET_URL).origin
    )
  }

  /** Toggles the idle motion class; stops once the widget has been opened. */
  function syncLauncherAttention() {
    if (!button) {
      return
    }

    for (const attention of LAUNCHER_ATTENTIONS) {
      button.classList.remove(`echo-widget-attn--${attention}`)
    }

    const attention = launcherAppearance.launcherAttention
    if (
      attention === "none" ||
      isOpen ||
      isLiveVoiceEnabled ||
      hasOpenedWidget
    ) {
      return
    }

    button.style.setProperty(
      "--echo-launcher-glow",
      toShadowColor(launcherAppearance.launcherColor)
    )
    button.classList.add(`echo-widget-attn--${attention}`)
  }

  const getLauncherImageMarkup = (imageUrl: string): string => {
    return `<img src="${escapeHtml(imageUrl)}" alt="Launcher" style="width: ${launcherSize}px; height: ${launcherSize}px; border-radius: 50%; object-fit: cover; display: block;" />`
  }

  const getLauncherOrbMarkup = (): string => {
    return `
      <span class="echo-widget-voice-orb" aria-hidden="true">
        <span class="echo-widget-voice-orb__pulse"></span>
        <span class="echo-widget-voice-orb__gradient"></span>
        <span class="echo-widget-voice-orb__shine"></span>
        <span class="echo-widget-voice-orb__sweep"></span>
        <span class="echo-widget-voice-orb__core"></span>
        <span class="echo-widget-voice-orb__ripple"></span>
      </span>
    `
  }

  const ensureLauncherStyles = () => {
    if (document.getElementById(LAUNCHER_STYLE_ID)) {
      return
    }

    const style = document.createElement("style")
    style.id = LAUNCHER_STYLE_ID
    style.textContent = `
      @keyframes echo-widget-orb-shape {
        0%, 100% {
          border-radius: 50%;
          transform: scale(1) rotate(0deg);
        }

        50% {
          border-radius: 44% 56% 53% 47% / 49% 44% 56% 51%;
          transform: scale(1.08) rotate(8deg);
        }
      }

      @keyframes echo-widget-orb-gradient {
        0% {
          transform: translate3d(-3%, -2%, 0) rotate(0deg) scale(1);
        }

        50% {
          transform: translate3d(3%, 2%, 0) rotate(180deg) scale(1.06);
        }

        100% {
          transform: translate3d(-3%, -2%, 0) rotate(360deg) scale(1);
        }
      }

      @keyframes echo-widget-orb-core {
        0%, 100% {
          transform: scale(0.82);
          opacity: 0.78;
        }

        50% {
          transform: scale(1.18);
          opacity: 1;
        }
      }

      @keyframes echo-widget-orb-pulse-ripple {
        0% {
          box-shadow: 0 0 0 0 rgba(125, 211, 252, 0.42);
          opacity: 0.88;
        }

        72% {
          box-shadow: 0 0 0 10px rgba(125, 211, 252, 0);
          opacity: 0;
        }

        100% {
          box-shadow: 0 0 0 10px rgba(125, 211, 252, 0);
          opacity: 0;
        }
      }

      @keyframes echo-widget-orb-sweep {
        0% {
          transform: translate3d(-140%, 110%, 0) rotate(34deg);
          opacity: 0;
        }

        24% {
          opacity: 0.72;
        }

        52% {
          opacity: 0.34;
        }

        100% {
          transform: translate3d(140%, -130%, 0) rotate(34deg);
          opacity: 0;
        }
      }

      @keyframes echo-widget-orb-click-ripple {
        0% {
          transform: scale(0.25);
          opacity: 0.46;
        }

        100% {
          transform: scale(2.15);
          opacity: 0;
        }
      }

      @keyframes echo-widget-voice-launcher-glow {
        0%, 100% {
          box-shadow:
            0 16px 36px rgba(0, 0, 0, 0.28),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            0 0 0 0 rgba(56, 189, 248, 0.18);
        }

        50% {
          box-shadow:
            0 18px 42px rgba(0, 0, 0, 0.34),
            0 0 0 1px rgba(255, 255, 255, 0.12),
            0 0 0 8px rgba(56, 189, 248, 0.08);
        }
      }

      @keyframes echo-widget-voice-shimmer {
        0% {
          transform: translateX(-130%) skewX(-18deg);
        }

        100% {
          transform: translateX(220%) skewX(-18deg);
        }
      }

      #echo-widget-button.echo-widget-button--voice {
        isolation: isolate;
        overflow: hidden;
        contain: paint;
      }

      #echo-widget-button.echo-widget-button--voice::before {
        content: "";
        position: absolute;
        inset: 1px;
        z-index: -1;
        overflow: hidden;
        border-radius: inherit;
        background:
          radial-gradient(circle at 17% 50%, rgba(56, 189, 248, 0.1), transparent 30%),
          linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 54%, rgba(241,245,249,0.96) 100%);
      }

      #echo-widget-button.echo-widget-button--voice::after {
        content: "";
        position: absolute;
        top: 1px;
        bottom: 1px;
        left: 1px;
        z-index: 0;
        width: 34%;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, rgba(14,165,233,0.12), transparent);
        animation: echo-widget-voice-shimmer 3.4s ease-in-out infinite;
        pointer-events: none;
      }

      #echo-widget-button.echo-widget-button--voice > * {
        position: relative;
        z-index: 1;
      }

      .echo-widget-voice-label {
        position: relative;
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        line-height: 1;
        letter-spacing: -0.01em;
      }

      .echo-widget-voice-orb {
        position: relative;
        display: inline-flex;
        width: ${LAUNCHER_ORB_SIZE}px;
        height: ${LAUNCHER_ORB_SIZE}px;
        flex: 0 0 ${LAUNCHER_ORB_SIZE}px;
        overflow: hidden;
        border-radius: 50%;
        clip-path: circle(50%);
        -webkit-clip-path: circle(50%);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.38),
          0 8px 18px rgba(14, 165, 233, 0.34);
        animation: echo-widget-orb-shape 1.8s ease-in-out infinite;
      }

      .echo-widget-voice-orb__pulse {
        position: absolute;
        inset: 3px;
        z-index: 0;
        border-radius: inherit;
        animation: echo-widget-orb-pulse-ripple 1.9s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      .echo-widget-voice-orb__gradient {
        position: absolute;
        inset: -8px;
        z-index: 1;
        background:
          radial-gradient(circle at 28% 22%, rgba(238, 247, 126, 0.92), transparent 30%),
          radial-gradient(circle at 72% 24%, rgba(139, 211, 255, 0.96), transparent 34%),
          radial-gradient(circle at 46% 84%, rgba(0, 120, 224, 0.95), transparent 42%),
          radial-gradient(circle at 86% 72%, rgba(4, 31, 43, 0.86), transparent 42%),
          radial-gradient(circle at 20% 70%, rgba(96, 169, 129, 0.74), transparent 34%);
        animation: echo-widget-orb-gradient 3.2s linear infinite;
      }

      .echo-widget-voice-orb__shine {
        position: absolute;
        inset: 0;
        z-index: 2;
        background: conic-gradient(from 120deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.24), rgba(255,255,255,0));
        mix-blend-mode: overlay;
        opacity: 0.82;
      }

      .echo-widget-voice-orb__sweep {
        position: absolute;
        inset: -10px;
        z-index: 3;
        width: 18px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.74), transparent);
        filter: blur(0.5px);
        animation: echo-widget-orb-sweep 2.7s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      .echo-widget-voice-orb__core {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 4;
        width: 9px;
        height: 9px;
        margin-left: -4.5px;
        margin-top: -4.5px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 0 16px rgba(255, 255, 255, 0.72);
        animation: echo-widget-orb-core 1.4s ease-in-out infinite;
      }

      .echo-widget-voice-orb__ripple {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 5;
        width: 100%;
        height: 100%;
        margin-left: -50%;
        margin-top: -50%;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.52);
        opacity: 0;
        transform: scale(0.25);
        pointer-events: none;
      }

      #echo-widget-button.echo-widget-button--voice:active .echo-widget-voice-orb__ripple {
        animation: echo-widget-orb-click-ripple 520ms ease-out;
      }

      /* ── attention motions ───────────────────────────────────────────────
         Each plays in the first part of a long cycle and then rests, so the
         launcher catches the eye without fidgeting. Bounce and wiggle use the
         standalone translate/rotate properties, which compose with the
         transform the hover scale writes instead of fighting it. */

      @keyframes echo-widget-attn-pulse {
        0% { box-shadow: 0 0 0 0 var(--echo-launcher-glow); opacity: 1; }
        38%, 100% { box-shadow: 0 0 0 16px transparent; opacity: 0; }
      }

      @keyframes echo-widget-attn-bounce {
        0%, 20%, 100% { translate: 0 0; }
        6% { translate: 0 -10px; }
        11% { translate: 0 0; }
        15% { translate: 0 -4px; }
      }

      @keyframes echo-widget-attn-wiggle {
        0%, 18%, 100% { rotate: 0deg; }
        3% { rotate: -14deg; }
        6% { rotate: 12deg; }
        9% { rotate: -8deg; }
        12% { rotate: 5deg; }
        15% { rotate: -2deg; }
      }

      @keyframes echo-widget-attn-glow {
        0%, 100% { filter: drop-shadow(0 0 0 transparent); }
        20% { filter: drop-shadow(0 0 14px var(--echo-launcher-glow)) brightness(1.08); }
        40% { filter: drop-shadow(0 0 0 transparent); }
      }

      #echo-widget-button.echo-widget-attn--pulse::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        animation: echo-widget-attn-pulse 2.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      #echo-widget-button.echo-widget-attn--bounce {
        animation: echo-widget-attn-bounce 5s cubic-bezier(0.3, 0, 0.3, 1) 1.2s infinite;
      }

      #echo-widget-button.echo-widget-attn--wiggle {
        animation: echo-widget-attn-wiggle 6s ease-in-out 1.2s infinite;
      }

      #echo-widget-button.echo-widget-attn--glow {
        animation: echo-widget-attn-glow 3.2s ease-in-out infinite;
      }

      /* ── unread badge ──────────────────────────────────────────────────── */

      @keyframes echo-widget-badge-in {
        0% { transform: scale(0); }
        60% { transform: scale(1.18); }
        100% { transform: scale(1); }
      }

      #echo-widget-button .echo-widget-badge {
        position: absolute;
        z-index: 2;
        display: grid;
        place-items: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        box-sizing: border-box;
        border-radius: 999px;
        background: #ef4444;
        color: #fff;
        font: 700 11px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 0 0 2px #fff, 0 4px 10px rgba(239, 68, 68, 0.45);
        pointer-events: none;
        animation: echo-widget-badge-in 420ms cubic-bezier(0.18, 1.35, 0.32, 1) both;
      }

      /* ── invitation card ───────────────────────────────────────────────── */

      #echo-widget-launcher-prompt button {
        all: unset;
        box-sizing: border-box;
        cursor: pointer;
      }

      #echo-widget-launcher-prompt {
        opacity: 0;
        transform: translate3d(0, 12px, 0) scale(0.92);
        transition:
          opacity 260ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 420ms cubic-bezier(0.18, 1.25, 0.32, 1);
      }

      #echo-widget-launcher-prompt.is-visible {
        opacity: 1;
        transform: none;
      }

      #echo-widget-launcher-prompt .echo-teaser {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px 14px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.97);
        color: #0f172a;
        box-shadow:
          0 0 0 1px rgba(15, 23, 42, 0.06),
          0 24px 48px -24px rgba(15, 23, 42, 0.45),
          0 8px 18px -12px rgba(15, 23, 42, 0.25);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      #echo-widget-launcher-prompt[data-side="right"] .echo-teaser {
        border-bottom-right-radius: 6px;
      }

      #echo-widget-launcher-prompt[data-side="left"] .echo-teaser {
        border-bottom-left-radius: 6px;
      }

      #echo-widget-launcher-prompt .echo-teaser__close {
        position: absolute;
        top: -9px;
        right: -9px;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        background: #fff;
        color: #475569;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08), 0 6px 14px -6px rgba(15, 23, 42, 0.4);
        opacity: 0;
        transform: scale(0.8);
        transition: opacity 160ms ease, transform 160ms ease, color 160ms ease;
      }

      #echo-widget-launcher-prompt[data-side="left"] .echo-teaser__close {
        right: auto;
        left: -9px;
      }

      #echo-widget-launcher-prompt .echo-teaser__close svg {
        width: 12px;
        height: 12px;
      }

      #echo-widget-launcher-prompt .echo-teaser:hover .echo-teaser__close,
      #echo-widget-launcher-prompt .echo-teaser__close:focus-visible {
        opacity: 1;
        transform: scale(1);
      }

      #echo-widget-launcher-prompt .echo-teaser__close:hover {
        color: #0f172a;
      }

      /* Touch screens have no hover, so the dismiss control is always there. */
      @media (hover: none) {
        #echo-widget-launcher-prompt .echo-teaser__close {
          opacity: 1;
          transform: scale(1);
        }
      }

      #echo-widget-launcher-prompt .echo-teaser__header {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      #echo-widget-launcher-prompt .echo-teaser__avatar {
        position: relative;
        display: grid;
        place-items: center;
        flex: 0 0 26px;
        width: 26px;
        height: 26px;
        overflow: hidden;
        border-radius: 999px;
        background: var(--echo-accent);
        color: var(--echo-accent-ink);
        font-size: 12px;
        font-weight: 700;
      }

      #echo-widget-launcher-prompt .echo-teaser__avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #fff;
      }

      #echo-widget-launcher-prompt .echo-teaser__name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12.5px;
        font-weight: 650;
        letter-spacing: -0.01em;
      }

      @keyframes echo-teaser-online {
        0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
        60% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
      }

      #echo-widget-launcher-prompt .echo-teaser__status {
        flex: 0 0 7px;
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #22c55e;
        animation: echo-teaser-online 2.4s ease-out infinite;
      }

      #echo-widget-launcher-prompt .echo-teaser__message {
        display: block;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.45;
        letter-spacing: -0.006em;
        overflow-wrap: anywhere;
      }

      @keyframes echo-teaser-dot {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
        30% { transform: translateY(-3px); opacity: 1; }
      }

      #echo-widget-launcher-prompt .echo-teaser__typing {
        display: none;
        gap: 4px;
        padding: 6px 0;
      }

      #echo-widget-launcher-prompt .echo-teaser__typing i {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #64748b;
        animation: echo-teaser-dot 1s ease-in-out infinite;
      }

      #echo-widget-launcher-prompt .echo-teaser__typing i:nth-child(2) { animation-delay: 0.14s; }
      #echo-widget-launcher-prompt .echo-teaser__typing i:nth-child(3) { animation-delay: 0.28s; }

      #echo-widget-launcher-prompt .echo-teaser.is-typing .echo-teaser__typing {
        display: inline-flex;
      }

      @keyframes echo-teaser-reveal {
        from { opacity: 0; transform: translate3d(0, 6px, 0); }
        to { opacity: 1; transform: none; }
      }

      #echo-widget-launcher-prompt .echo-teaser__text {
        display: block;
        animation: echo-teaser-reveal 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      #echo-widget-launcher-prompt .echo-teaser.is-typing .echo-teaser__text,
      #echo-widget-launcher-prompt .echo-teaser.is-typing .echo-teaser__replies {
        display: none;
      }

      #echo-widget-launcher-prompt .echo-teaser__replies {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      #echo-widget-launcher-prompt .echo-teaser__chip {
        max-width: 100%;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--echo-accent) 38%, #e2e8f0);
        background: color-mix(in srgb, var(--echo-accent) 7%, #fff);
        color: #0f172a;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        animation: echo-teaser-reveal 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: calc(80ms + var(--echo-chip-index, 0) * 70ms);
        transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease;
      }

      #echo-widget-launcher-prompt .echo-teaser__chip:hover,
      #echo-widget-launcher-prompt .echo-teaser__chip:focus-visible {
        background: var(--echo-accent);
        border-color: var(--echo-accent);
        color: var(--echo-accent-ink);
        transform: translateY(-1px);
      }

      #echo-widget-launcher-prompt .echo-teaser__message:focus-visible,
      #echo-widget-launcher-prompt .echo-teaser__chip:focus-visible,
      #echo-widget-launcher-prompt .echo-teaser__close:focus-visible {
        outline: 2px solid var(--echo-accent);
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        #echo-widget-button.echo-widget-button--voice,
        #echo-widget-button.echo-widget-button--voice::after,
        .echo-widget-voice-orb,
        .echo-widget-voice-orb__pulse,
        .echo-widget-voice-orb__gradient,
        .echo-widget-voice-orb__core,
        .echo-widget-voice-orb__sweep,
        .echo-widget-voice-orb__ripple {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #echo-widget-button[class*="echo-widget-attn--"],
        #echo-widget-button[class*="echo-widget-attn--"]::after,
        #echo-widget-launcher-prompt,
        #echo-widget-launcher-prompt * {
          animation: none !important;
          transition: none !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  const applyLauncherAppearance = () => {
    if (!button) {
      return
    }

    button.style.transition = "all 0.2s ease"

    if (isOpen) {
      button.classList.remove("echo-widget-button--voice")
      if (!isLiveVoiceEnabled) {
        button.style.width = `${launcherSize}px`
        button.style.minWidth = `${launcherSize}px`
        button.style.height = `${launcherSize}px`
        button.style.padding = "0"
        button.style.borderRadius = "50%"
        button.style.justifyContent = "center"
        button.style.background = launcherAppearance.launcherColor
        button.style.color = getContrastingTextColor(
          launcherAppearance.launcherColor
        )
        button.style.boxShadow = `0 18px 40px ${toShadowColor(
          launcherAppearance.launcherColor
        )}`
        button.style.animation = "none"
        button.setAttribute("aria-label", "Close chat widget")
        button.innerHTML = collapseIcon
      }
      syncLauncherAttention()
      syncLauncherBadge()
      syncLauncherVisibility()
      return
    }

    const isVoiceSurface = isLiveVoiceEnabled
    const isVoiceLauncher = isVoiceSurface && !isOpen
    const cleanedLabel = isVoiceLauncher
      ? launcherAppearance.voiceLauncherLabel.trim() ||
        LIVE_VOICE_LAUNCHER_LABEL
      : launcherAppearance.launcherLabel.trim()
    const hasLauncherImage =
      !isVoiceLauncher &&
      !isOpen &&
      launcherAppearance.launcherIconUrl.trim().length > 0
    const hasVisibleLabel =
      !isOpen &&
      (isVoiceLauncher || (!hasLauncherImage && cleanedLabel.length > 0))
    const iconMarkup = hasLauncherImage
      ? getLauncherImageMarkup(launcherAppearance.launcherIconUrl)
      : isVoiceLauncher
        ? getLauncherOrbMarkup()
        : getLauncherIconMarkup(launcherAppearance.launcherIcon)

    button.classList.toggle("echo-widget-button--voice", isVoiceLauncher)
    button.style.width = hasVisibleLabel ? "auto" : `${launcherSize}px`
    button.style.minWidth = `${launcherSize}px`
    button.style.height = `${launcherSize}px`
    button.style.padding = isVoiceLauncher
      ? "0 22px 0 7px"
      : hasVisibleLabel
        ? `0 ${LAUNCHER_LABEL_PADDING_X}px 0 8px`
        : "0"
    button.style.borderRadius = hasVisibleLabel ? "9999px" : "50%"
    button.style.justifyContent = hasVisibleLabel ? "flex-start" : "center"
    button.style.background = isVoiceSurface
      ? "rgba(255, 255, 255, 0.94)"
      : launcherAppearance.launcherColor
    button.style.color = isVoiceSurface
      ? "#0f172a"
      : getContrastingTextColor(launcherAppearance.launcherColor)
    button.style.boxShadow = isVoiceSurface
      ? "0 16px 36px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08)"
      : `0 4px 24px ${toShadowColor(launcherAppearance.launcherColor)}`
    // Cleared rather than "none" for the standard launcher: an inline value
    // would override the attention motion applied by class.
    button.style.animation = isVoiceLauncher
      ? "echo-widget-voice-launcher-glow 2.8s ease-in-out infinite"
      : ""
    button.setAttribute(
      "aria-label",
      isOpen
        ? isVoiceSurface
          ? "Close voice widget"
          : "Close chat widget"
        : hasVisibleLabel
          ? cleanedLabel
          : "Open chat widget"
    )

    if (hasVisibleLabel) {
      button.innerHTML = `${iconMarkup}<span class="echo-widget-voice-label">${escapeHtml(cleanedLabel)}</span>`
    } else {
      button.innerHTML = iconMarkup
    }

    syncLauncherAttention()
    syncLauncherBadge()
    syncLauncherVisibility()
  }

  const revealStandardClosedLauncher = () => {
    if (!button) {
      return
    }

    applyLauncherAppearance()
    button.style.transition = "none"
    button.style.visibility = "visible"
    button.style.display = "flex"
    button.style.opacity = "0"
    button.style.pointerEvents = "none"
    button.style.transform = `translate3d(${STANDARD_CLOSE_RETURN_OFFSET_X}px, 0, 0) scale(0.94)`

    window.requestAnimationFrame(() => {
      if (!button) {
        return
      }

      button.style.transition = `opacity ${STANDARD_LAUNCHER_REVEAL_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${STANDARD_LAUNCHER_REVEAL_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`
      button.style.opacity = "1"
      button.style.pointerEvents = "auto"
      button.style.transform = "scale(1)"
    })
  }

  const updateLauncherAppearance = (appearance: WidgetAppearancePayload) => {
    if (typeof appearance.launcherColor === "string") {
      // Applied straight to `button.style.background` on the customer's own
      // page, so only accept a literal hex colour.
      const launcherColor = normalizeHexColor(appearance.launcherColor.trim())

      if (launcherColor) {
        launcherAppearance.launcherColor = launcherColor
      }
    }

    if (typeof appearance.launcherLabel === "string") {
      launcherAppearance.launcherLabel = appearance.launcherLabel
    }

    if (typeof appearance.voiceLauncherLabel === "string") {
      launcherAppearance.voiceLauncherLabel = appearance.voiceLauncherLabel
    }

    if (typeof appearance.launcherIcon === "string") {
      launcherAppearance.launcherIcon = parseLauncherIcon(
        appearance.launcherIcon
      )
    }

    if (typeof appearance.launcherIconUrl === "string") {
      launcherAppearance.launcherIconUrl = sanitizeImageUrl(
        appearance.launcherIconUrl
      )
    }

    if (typeof appearance.animation === "string") {
      launcherAppearance.animation = parseWidgetAnimation(appearance.animation)
      applyContainerAnimationState(isOpen ? "open" : "closed")
    }

    if (typeof appearance.launcherPromptEnabled === "boolean") {
      launcherAppearance.launcherPromptEnabled =
        appearance.launcherPromptEnabled
    }

    if (typeof appearance.launcherPromptText === "string") {
      launcherAppearance.launcherPromptText = appearance.launcherPromptText
    }

    if (typeof appearance.launcherPromptDelaySeconds === "number") {
      launcherAppearance.launcherPromptDelaySeconds =
        clampLauncherPromptDelaySeconds(appearance.launcherPromptDelaySeconds)
    }

    if (appearance.launcherQuickReplies !== undefined) {
      launcherAppearance.launcherQuickReplies = parseQuickReplies(
        appearance.launcherQuickReplies
      )
    }

    if (appearance.launcherAttention !== undefined) {
      launcherAppearance.launcherAttention = parseLauncherAttention(
        appearance.launcherAttention
      )
    }

    if (typeof appearance.launcherBadgeEnabled === "boolean") {
      launcherAppearance.launcherBadgeEnabled = appearance.launcherBadgeEnabled
    }

    if (
      appearance.launcherPosition === "bottom-right" ||
      appearance.launcherPosition === "bottom-left"
    ) {
      position = appearance.launcherPosition
    }

    if (typeof appearance.launcherOffsetX === "number") {
      launcherOffsetX = clampNumber(
        appearance.launcherOffsetX,
        0,
        LAUNCHER_MAX_EDGE_OFFSET
      )
    }

    if (typeof appearance.launcherOffsetY === "number") {
      launcherOffsetY = clampNumber(
        appearance.launcherOffsetY,
        0,
        LAUNCHER_MAX_EDGE_OFFSET
      )
    }

    if (typeof appearance.launcherSize === "number") {
      launcherSize = clampNumber(
        appearance.launcherSize,
        LAUNCHER_MIN_SIZE,
        LAUNCHER_MAX_SIZE
      )
    }

    if (typeof appearance.widgetWidth === "number") {
      widgetWidth = clampNumber(
        appearance.widgetWidth,
        WIDGET_CONTAINER_WIDTH_RANGE.min,
        WIDGET_CONTAINER_WIDTH_RANGE.max
      )
    }

    if (typeof appearance.widgetHeight === "number") {
      widgetHeight = clampNumber(
        appearance.widgetHeight,
        WIDGET_CONTAINER_HEIGHT_RANGE.min,
        WIDGET_CONTAINER_HEIGHT_RANGE.max
      )
    }

    if (typeof appearance.notificationSoundEnabled === "boolean") {
      isNotificationSoundEnabled = appearance.notificationSoundEnabled
    }

    if (typeof appearance.autoOpenEnabled === "boolean") {
      autoOpenEnabled = appearance.autoOpenEnabled
    }

    if (typeof appearance.autoOpenDelaySeconds === "number") {
      autoOpenDelaySeconds = clampNumber(
        appearance.autoOpenDelaySeconds,
        0,
        AUTO_OPEN_MAX_DELAY_SECONDS
      )
    }

    if (
      appearance.autoOpenFrequency === "session" ||
      appearance.autoOpenFrequency === "visitor" ||
      appearance.autoOpenFrequency === "always"
    ) {
      autoOpenFrequency = appearance.autoOpenFrequency
    }

    applyLauncherGeometry()
    revealLauncher()
    scheduleAutoOpen()
  }

  const revealLauncher = () => {
    if (!button || isLauncherReady) {
      return
    }

    isLauncherReady = true
    syncLauncherVisibility()
    syncLauncherPrompt()
  }

  const syncLauncherVisibility = () => {
    if (!button || !isLauncherReady) {
      return
    }

    const shouldShowButton = !isOpen || !isLiveVoiceEnabled
    button.style.visibility = shouldShowButton ? "visible" : "hidden"
    button.style.display = shouldShowButton ? "flex" : "none"
    button.style.opacity = shouldShowButton ? "1" : "0"
    button.style.pointerEvents = shouldShowButton ? "auto" : "none"
    button.style.transform = "scale(1)"
    syncLauncherPrompt()
  }

  // Try to get the current script
  const currentScript = document.currentScript as HTMLScriptElement
  if (currentScript) {
    organizationId = currentScript.getAttribute("data-organization-id")
    agentId = currentScript.getAttribute("data-agent-id")
    position =
      (currentScript.getAttribute("data-position") as WidgetPosition) ||
      EMBED_CONFIG.DEFAULT_POSITION
    launcherAppearance.animation = parseWidgetAnimation(
      currentScript.getAttribute("data-animation")
    )
  } else {
    // Fallback: find script tag by src
    const scripts = document.querySelectorAll('script[src*="embed"]')
    const embedScript = Array.from(scripts).find((script) =>
      script.hasAttribute("data-organization-id")
    ) as HTMLScriptElement

    if (embedScript) {
      organizationId = embedScript.getAttribute("data-organization-id")
      agentId = embedScript.getAttribute("data-agent-id")
      position =
        (embedScript.getAttribute("data-position") as WidgetPosition) ||
        EMBED_CONFIG.DEFAULT_POSITION
      launcherAppearance.animation = parseWidgetAnimation(
        embedScript.getAttribute("data-animation")
      )
    }
  }

  // Exit if no organization ID
  if (!organizationId) {
    console.error("Echo Widget: data-organization-id attribute is required")
    return
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render)
    } else {
      render()
    }
  }

  function render() {
    ensureLauncherStyles()

    // Create floating action button
    button = document.createElement("button")
    button.id = "echo-widget-button"
    button.style.cssText = `
      position: fixed;
      ${
        position === "bottom-right"
          ? `right: ${launcherOffsetX}px;`
          : `left: ${launcherOffsetX}px;`
      }
      bottom: ${launcherOffsetY}px;
      width: auto;
      min-width: ${launcherSize}px;
      height: ${launcherSize}px;
      border-radius: 9999px;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 15px;
      font-weight: 600;
      line-height: 1;
      transition: all 0.2s ease;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    `

    applyLauncherAppearance()

    button.addEventListener("click", toggleWidget)
    button.addEventListener("mouseenter", () => {
      if (button) button.style.transform = "scale(1.05)"
    })
    button.addEventListener("mouseleave", () => {
      if (button) button.style.transform = "scale(1)"
    })

    document.body.appendChild(button)

    launcherPrompt = document.createElement("div")
    launcherPrompt.id = "echo-widget-launcher-prompt"
    launcherPrompt.setAttribute("role", "status")
    launcherPromptDismissed = wasPromptDismissedThisSession()
    syncLauncherPromptPosition()
    document.body.appendChild(launcherPrompt)

    // Create container (hidden by default)
    container = document.createElement("div")
    container.id = "echo-widget-container"
    container.style.cssText = `
      position: fixed;
      ${
        position === "bottom-right"
          ? `right: ${launcherOffsetX}px;`
          : `left: ${launcherOffsetX}px;`
      }
      bottom: ${launcherOffsetY}px;
      width: ${widgetWidth}px;
      height: ${widgetHeight}px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - ${getContainerMaxHeightGutter()}px);
      z-index: 999998;
      border-radius: ${WIDGET_CONTAINER_OPEN_RADIUS};
      overflow: hidden;
      isolation: isolate;
      background: transparent;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      filter: ${WIDGET_CONTAINER_VOICE_OPEN_FILTER};
      transform: ${widgetAnimations[launcherAppearance.animation].closedTransform};
      transform-origin: ${position === "bottom-right" ? "bottom right" : "bottom left"};
      transition:
        opacity ${widgetAnimations[launcherAppearance.animation].duration}ms ${widgetAnimations[launcherAppearance.animation].easing},
        transform ${widgetAnimations[launcherAppearance.animation].duration}ms ${widgetAnimations[launcherAppearance.animation].easing},
        filter ${widgetAnimations[launcherAppearance.animation].duration}ms ${widgetAnimations[launcherAppearance.animation].easing},
        border-radius ${widgetAnimations[launcherAppearance.animation].duration}ms ${widgetAnimations[launcherAppearance.animation].easing};
      will-change: opacity, transform, filter, border-radius;
    `

    revealSurface = document.createElement("div")
    revealSurface.setAttribute("aria-hidden", "true")
    revealSurface.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0) 22%),
        linear-gradient(0deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0) 24%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      mask-image: linear-gradient(180deg, black 0%, transparent 26%, transparent 74%, black 100%);
      -webkit-mask-image: linear-gradient(180deg, black 0%, transparent 26%, transparent 74%, black 100%);
      transform: translate3d(0, 8px, 0);
      transition: none;
      will-change: opacity, transform;
    `

    // Create iframe
    iframe = document.createElement("iframe")
    iframe.src = buildWidgetUrl()
    iframe.style.cssText = `
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      border: none;
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transform-origin: center;
      will-change: opacity, transform;
    `
    // Add permissions for microphone, clipboard and notification sounds.
    // Without `autoplay`, a cross-origin iframe cannot play audio at all: the
    // browser rejects every play() call, so new-message chimes stay silent.
    iframe.allow = "microphone; clipboard-read; clipboard-write; autoplay"

    container.appendChild(revealSurface)
    container.appendChild(iframe)
    document.body.appendChild(container)

    // Handle messages from widget
    window.addEventListener("message", handleMessage)

    listenForHostUserActivation()
  }

  // Browsers only grant audio playback to a document the visitor has interacted
  // with, and visitors click the launcher on this page rather than inside the
  // cross-origin iframe. So the host page owns the chime: it unlocks playback on
  // the first real interaction here and plays on request from the widget.
  function listenForHostUserActivation() {
    if (isListeningForHostUserActivation) {
      return
    }

    isListeningForHostUserActivation = true

    const onUserActivation = () => {
      unlockNotificationSound()

      if (canPlayNotificationSound) {
        window.removeEventListener("pointerdown", onUserActivation)
        window.removeEventListener("touchstart", onUserActivation)
        window.removeEventListener("keydown", onUserActivation)
      }
    }

    window.addEventListener("pointerdown", onUserActivation, { passive: true })
    window.addEventListener("touchstart", onUserActivation, { passive: true })
    window.addEventListener("keydown", onUserActivation)
  }

  function getNotificationAudio(): HTMLAudioElement {
    if (!notificationAudio) {
      notificationAudio = new Audio(
        `${EMBED_CONFIG.WIDGET_URL}${NOTIFICATION_SOUND_PATH}`
      )
      notificationAudio.preload = "auto"
    }

    return notificationAudio
  }

  function unlockNotificationSound() {
    if (canPlayNotificationSound) {
      return
    }

    try {
      const audio = getNotificationAudio()
      audio.muted = true
      audio.currentTime = 0

      const played = audio.play()

      if (!(played instanceof Promise)) {
        return
      }

      void played
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.muted = false
          canPlayNotificationSound = true
          announceNotificationSoundSupport()
        })
        .catch(() => {
          audio.muted = false
        })
    } catch {
      // Ignore playback failures in unsupported environments.
    }
  }

  function playNotificationSound() {
    try {
      const audio = getNotificationAudio()
      audio.muted = false
      audio.currentTime = 0
      void audio.play().catch(() => {
        // Nothing to recover here; the widget already tried its own frame.
      })
    } catch {
      // Ignore playback failures in unsupported environments.
    }
  }

  // Tells the widget to route chimes through this page instead of playing them
  // inside the iframe, which browsers frequently block.
  function announceNotificationSoundSupport() {
    if (!iframe?.contentWindow) {
      return
    }

    iframe.contentWindow.postMessage(
      { type: "host-audio-ready" },
      new URL(EMBED_CONFIG.WIDGET_URL).origin
    )
  }

  function buildWidgetUrl(): string {
    const params = new URLSearchParams()
    params.append("organizationId", organizationId!)
    const resolvedAgentId = agentId?.trim()
    if (resolvedAgentId) {
      params.append("agentId", resolvedAgentId)
    }
    return `${EMBED_CONFIG.WIDGET_URL}?${params.toString()}`
  }

  function handleMessage(event: MessageEvent) {
    if (event.origin !== new URL(EMBED_CONFIG.WIDGET_URL).origin) return

    const { type, payload } = event.data

    switch (type) {
      case "widget-ready":
        announceVisibility()
        // The widget may have mounted after the visitor already interacted with
        // this page, so repeat the announcement it missed.
        if (canPlayNotificationSound) {
          announceNotificationSoundSupport()
        }
        break
      case "notification-sound":
        if (isNotificationSoundEnabled) {
          playNotificationSound()
        }
        break
      case "close":
        hide()
        break
      case "unread-count": {
        const count = Number(payload?.count)
        unreadCount =
          Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
        syncLauncherBadge()
        break
      }
      // "resize" is no longer honoured: the panel size is an organization
      // setting now, and older widget builds posted a fixed 640px that would
      // override it.
      case "widget-settings":
        if (payload) {
          const settingsPayload = payload as WidgetSettingsPayload
          if (settingsPayload.teaser) {
            if (typeof settingsPayload.teaser.name === "string") {
              teaserName = settingsPayload.teaser.name.slice(0, 60)
            }
            if (typeof settingsPayload.teaser.avatarUrl === "string") {
              teaserAvatarUrl = settingsPayload.teaser.avatarUrl
            }
          }
          if (typeof settingsPayload.liveVoiceEnabled === "boolean") {
            isLiveVoiceEnabled = settingsPayload.liveVoiceEnabled
            applyContainerAnimationState(isOpen ? "open" : "closed")
          }

          if (settingsPayload.appearance) {
            updateLauncherAppearance(settingsPayload.appearance)
          } else {
            applyLauncherAppearance()
          }
        }
        break
    }
  }

  function toggleWidget() {
    cancelAutoOpen()

    if (isOpen) {
      hide()
    } else {
      show()
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false
  }

  function getContainerAnimationDuration(state: "open" | "closed") {
    if (prefersReducedMotion()) {
      return 0
    }

    if (isLiveVoiceEnabled) {
      return state === "open"
        ? WIDGET_CONTAINER_VOICE_OPEN_DURATION
        : WIDGET_CONTAINER_VOICE_CLOSE_DURATION
    }

    return widgetAnimations[launcherAppearance.animation].duration
  }

  function getContainerAnimationEasingForState(state: "open" | "closed") {
    if (isLiveVoiceEnabled) {
      return state === "open"
        ? WIDGET_CONTAINER_VOICE_OPEN_EASING
        : WIDGET_CONTAINER_VOICE_CLOSE_EASING
    }

    return widgetAnimations[launcherAppearance.animation].easing
  }

  function getContainerTransform(state: "open" | "closed") {
    if (isLiveVoiceEnabled) {
      return state === "open"
        ? WIDGET_CONTAINER_VOICE_OPEN_TRANSFORM
        : WIDGET_CONTAINER_VOICE_CLOSED_TRANSFORM
    }

    const animation = widgetAnimations[launcherAppearance.animation]
    return state === "open" ? animation.openTransform : animation.closedTransform
  }

  function syncContainerTransformOrigin() {
    if (!container || !button) {
      return
    }

    container.style.transformOrigin =
      position === "bottom-right" ? "bottom right" : "bottom left"
  }

  function syncContainerSize() {
    if (!container) {
      return
    }

    const shouldReserveCloseButtonSpace = isOpen && !isLiveVoiceEnabled
    container.style.width = `${widgetWidth}px`
    container.style.bottom = `${
      shouldReserveCloseButtonSpace
        ? getStandardOpenContainerBottom()
        : launcherOffsetY
    }px`
    container.style.maxHeight = `calc(100vh - ${
      shouldReserveCloseButtonSpace
        ? getStandardOpenContainerMaxHeightGutter()
        : getContainerMaxHeightGutter()
    }px)`
    container.style.height = `${
      isLiveVoiceEnabled
        ? WIDGET_CONTAINER_VOICE_HEIGHT
        : widgetHeight
    }px`
  }

  function applyIframeAnimationState(
    state: "open" | "closed",
    immediate = false
  ) {
    if (!iframe) {
      return
    }

    if (!isLiveVoiceEnabled || immediate || prefersReducedMotion()) {
      iframe.style.opacity = "1"
      iframe.style.transition = "none"
      iframe.style.transform = "translate3d(0, 0, 0)"
      iframe.style.filter = "blur(0px)"
      if (isLiveVoiceEnabled && state === "closed") {
        iframe.style.opacity = "0"
        iframe.style.transform = "translate3d(0, 10px, 0)"
        iframe.style.filter = "blur(8px)"
      }
      return
    }

    const duration = state === "open" ? 260 : 120
    const delay = state === "open" ? 72 : 0
    const easing =
      state === "open"
        ? WIDGET_CONTAINER_VOICE_OPEN_EASING
        : WIDGET_CONTAINER_VOICE_CLOSE_EASING
    iframe.style.transition = `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms, filter ${duration}ms ${easing} ${delay}ms`
    iframe.style.opacity = state === "open" ? "1" : "0"
    iframe.style.transform =
      state === "open" ? "translate3d(0, 0, 0)" : "translate3d(0, 10px, 0)"
    iframe.style.filter = state === "open" ? "blur(0px)" : "blur(8px)"
  }

  function applyRevealSurfaceAnimationState(
    state: "open" | "closed",
    immediate = false
  ) {
    if (!revealSurface) {
      return
    }

    if (!isLiveVoiceEnabled || immediate || prefersReducedMotion()) {
      revealSurface.style.opacity = "0"
      revealSurface.style.transition = "none"
      revealSurface.style.transform = "translate3d(0, 8px, 0)"
      return
    }

    const duration = state === "open" ? 220 : 120
    const delay = state === "open" ? 42 : 0
    const easing =
      state === "open"
        ? WIDGET_CONTAINER_VOICE_OPEN_EASING
        : WIDGET_CONTAINER_VOICE_CLOSE_EASING
    revealSurface.style.transition = `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`
    revealSurface.style.opacity = state === "open" ? "0" : "1"
    revealSurface.style.transform =
      state === "open" ? "translate3d(0, -4px, 0)" : "translate3d(0, 8px, 0)"
  }

  function applyContainerAnimationState(
    state: "open" | "closed",
    options: { immediate?: boolean } = {}
  ) {
    if (!container) {
      return
    }

    const duration = getContainerAnimationDuration(state)
    const easing = getContainerAnimationEasingForState(state)
    const immediate = options.immediate || duration === 0
    const finalTransform = getContainerTransform(state)
    const finalBoxShadow =
      isLiveVoiceEnabled && state === "open"
        ? "0 24px 70px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06)"
        : "0 4px 24px rgba(0, 0, 0, 0.15)"
    const finalFilter =
      isLiveVoiceEnabled && state === "closed"
        ? WIDGET_CONTAINER_VOICE_CLOSED_FILTER
        : WIDGET_CONTAINER_VOICE_OPEN_FILTER

    syncContainerSize()
    container.style.transition = immediate
      ? "none"
      : `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}, filter ${duration}ms ${easing}, border-radius ${duration}ms ${easing}, box-shadow ${duration}ms ${easing}`
    container.style.opacity = isLiveVoiceEnabled
      ? "1"
      : state === "open"
        ? "1"
        : "0"
    // Transparent, not white: the iframe is its own compositing layer, so the
    // rounded clip anti-aliases its edge and any solid fill here bleeds through
    // as a light hairline around the corners.
    container.style.background = "transparent"
    container.style.transform = finalTransform
    container.style.filter = finalFilter
    container.style.borderRadius = WIDGET_CONTAINER_OPEN_RADIUS
    container.style.boxShadow = finalBoxShadow
    applyRevealSurfaceAnimationState(state, immediate)
    applyIframeAnimationState(state, immediate)
  }

  function show() {
    if (container && button) {
      if (hideTimer !== null) {
        window.clearTimeout(hideTimer)
        hideTimer = null
      }

      if (!launcherPromptDismissed) {
        launcherPromptDismissed = true
        rememberPromptDismissed()
      }
      hasOpenedWidget = true
      hideLauncherPrompt()

      container.style.display = "block"
      syncContainerTransformOrigin()
      isOpen = true
      announceVisibility()
      applyContainerAnimationState("closed", { immediate: true })
      syncLauncherVisibility()
      // Trigger animation
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => applyContainerAnimationState("open"))
      })
      applyLauncherAppearance()
    }
  }

  function hide() {
    if (container && button) {
      if (hideTimer !== null) {
        window.clearTimeout(hideTimer)
        hideTimer = null
      }

      const shouldRevealStandardLauncherNow = !isLiveVoiceEnabled

      isOpen = false
      announceVisibility()
      const shouldDelayLauncherReveal = isLiveVoiceEnabled
      if (!shouldDelayLauncherReveal) {
        revealStandardClosedLauncher()
      }
      syncContainerTransformOrigin()
      if (isLiveVoiceEnabled && button) {
        button.style.visibility = "hidden"
        button.style.opacity = "0"
        button.style.pointerEvents = "none"
      }
      applyContainerAnimationState("closed")
      // Hide after animation
      hideTimer = window.setTimeout(() => {
        if (container && !isOpen) {
          container.style.display = "none"
        }
        if (shouldDelayLauncherReveal) {
          syncLauncherVisibility()
        } else if (shouldRevealStandardLauncherNow && button) {
          button.style.pointerEvents = "auto"
        }
        hideTimer = null
      }, getContainerAnimationDuration("closed"))
    }
  }

  function destroy() {
    window.removeEventListener("message", handleMessage)
    if (container) {
      container.remove()
      container = null
      iframe = null
      revealSurface = null
    }
    if (launcherPrompt) {
      launcherPrompt.remove()
      launcherPrompt = null
    }
    if (button) {
      button.remove()
      button = null
    }
    launcherBadge = null
    unreadCount = 0
    isLauncherPromptVisible = false
    hasOpenedWidget = false
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer)
      hideTimer = null
    }
    clearLauncherPromptTimer()
    cancelAutoOpen()
    hasScheduledAutoOpen = false
    isOpen = false
    isLauncherReady = false
    isLiveVoiceEnabled = false
    launcherPromptDismissed = false
  }

  // Function to reinitialize with new config
  function reinit(newConfig: {
    organizationId?: string
    agentId?: string
    position?: WidgetPosition
    animation?: WidgetAnimation
  }) {
    // Destroy existing widget
    destroy()

    // Update config
    if (newConfig.organizationId) {
      organizationId = newConfig.organizationId
    }
    if (newConfig.agentId !== undefined) {
      agentId = newConfig.agentId
    }
    if (newConfig.position) {
      position = newConfig.position
    }
    if (newConfig.animation) {
      launcherAppearance.animation = parseWidgetAnimation(newConfig.animation)
    }

    // Reinitialize
    init()
  }

  // Expose API to global scope
  ;(window as any).EchoWidget = {
    init: reinit,
    show,
    hide,
    destroy,
    setAppearance: updateLauncherAppearance,
  }

  // Auto-initialize
  init()
})()
