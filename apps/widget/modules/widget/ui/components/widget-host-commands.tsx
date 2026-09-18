"use client"

import { useEffect, useRef, useState } from "react"
import { useAtomValue } from "jotai"
import { mergeWidgetAppearance } from "@workspace/ui/lib/widget-customization"
import {
  screenAtom,
  widgetSettingsAtom,
} from "@/modules/widget/atoms/widget-atoms"
import { useStartWidgetConversation } from "../../hooks/use-start-widget-conversation"

/**
 * Carries out requests the embed script makes from the host page — today, a
 * visitor tapping a quick reply under the invitation bubble, which opens the
 * widget and sends that reply as their first message.
 *
 * Only a reply the organization configured is accepted. Any page can embed the
 * widget and post to it, so free text from the host would let that page speak
 * in the visitor's name.
 */
export const WidgetHostCommands = () => {
  const screen = useAtomValue(screenAtom)
  const widgetSettings = useAtomValue(widgetSettingsAtom)
  const { startConversation } = useStartWidgetConversation()
  // The reply waits in a ref; the counter only tells the effect below that a
  // new one arrived.
  const pendingReplyRef = useRef<string | null>(null)
  const [replyRequest, setReplyRequest] = useState(0)
  const startConversationRef = useRef(startConversation)

  useEffect(() => {
    startConversationRef.current = startConversation
  })

  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) {
      return
    }

    const hostWindow = window.parent

    const onHostMessage = (event: MessageEvent) => {
      if (
        event.source !== hostWindow ||
        !event.origin ||
        event.origin === "null" ||
        event.data?.type !== "start-chat"
      ) {
        return
      }

      const message = event.data.payload?.message
      if (typeof message === "string" && message.trim()) {
        pendingReplyRef.current = message.trim()
        setReplyRequest((count) => count + 1)
      }
    }

    window.addEventListener("message", onHostMessage)
    return () => window.removeEventListener("message", onHostMessage)
  }, [])

  useEffect(() => {
    // Held until the widget has loaded its settings and left the splash, so
    // a tap that lands mid-load is sent rather than lost.
    const pendingReply = pendingReplyRef.current
    if (!pendingReply || !widgetSettings || screen === "loading") {
      return
    }

    pendingReplyRef.current = null

    const { launcherQuickReplies } = mergeWidgetAppearance(
      widgetSettings.appearance
    )
    if (!launcherQuickReplies.includes(pendingReply)) {
      return
    }

    void startConversationRef.current({
      initialMessage: pendingReply,
      returnScreen: "selection",
    })
  }, [replyRequest, screen, widgetSettings])

  return null
}
