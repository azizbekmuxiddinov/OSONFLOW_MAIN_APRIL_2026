"use client"

import { useAtomValue, useSetAtom } from "jotai"
import {
  chatReturnScreenAtom,
  contactSessionIdAtomFamily,
  conversationIdAtom,
  homeScreenAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms"
import { useStartWidgetConversation } from "./use-start-widget-conversation"

/**
 * Every "back to the start" in the widget — the footer's first tab, the back
 * arrow on help and history, leaving a call — goes through here, so the widget
 * lands on whichever screen the organization chose to open on.
 *
 * On an ask-first widget that is the chat: the conversation the visitor already
 * has open, or a fresh draft. A draft still records nothing until the visitor
 * sends a message.
 */
export const useOpenHome = () => {
  const homeScreen = useAtomValue(homeScreenAtom)
  const organizationId = useAtomValue(organizationIdAtom)
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  )
  const conversationId = useAtomValue(conversationIdAtom)
  const setScreen = useSetAtom(screenAtom)
  const setChatReturnScreen = useSetAtom(chatReturnScreenAtom)
  const { isPending, startConversation } = useStartWidgetConversation()

  const openHome = () => {
    if (homeScreen === "selection") {
      setScreen("selection")
      return
    }

    setChatReturnScreen("selection")

    if (conversationId || contactSessionId) {
      setScreen("chat")
      return
    }

    void startConversation({
      returnScreen: "selection",
      captureDetailsInChat: true,
    })
  }

  return { homeScreen, isPending, openHome }
}
