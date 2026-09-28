import type { Doc } from "../_generated/dataModel"

export type ConversationChannel = "widget" | "telegram" | "instagram" | "whatsapp"

/**
 * Which app a customer is writing from. Channel contacts are ordinary contact
 * sessions tagged with the channel's own identifiers, so the session metadata
 * is the one place every conversation can answer this from.
 */
export const getContactChannel = (
  session: Doc<"contactSessions"> | null | undefined
): ConversationChannel => {
  const metadata = session?.metadata

  if (metadata?.telegramUserId || metadata?.platform === "Telegram") {
    return "telegram"
  }

  if (metadata?.instagramUserId || metadata?.platform === "Instagram") {
    return "instagram"
  }

  if (metadata?.whatsappPhoneNumber || metadata?.platform === "WhatsApp") {
    return "whatsapp"
  }

  return "widget"
}

/** Channel contacts carry a made-up address; it is not somewhere to write to. */
export const isRealEmailAddress = (email?: string | null) =>
  Boolean(email) && !/\.local$/i.test(email!.trim())
