/**
 * The Osonflow team bot: one Telegram bot, owned by the platform, that sends a
 * business's alerts to the people who work there and carries their replies back
 * to customers.
 *
 * It is deliberately not the business's own customer bot. Owners live in
 * Telegram whether or not their customers write to them there, and keeping the
 * team in a separate bot means a team member's chat can never be mistaken for a
 * customer's.
 *
 * Configure with TEAM_TELEGRAM_BOT_TOKEN (from @BotFather). A bot has exactly
 * one webhook, so development and production each need a bot of their own.
 */

export type TeamLanguage = "en" | "uz" | "ru"

export type TeamAlertType =
  | "handoff"
  | "waiting"
  | "upset"
  | "lead"
  | "digest"
  | "question"
  | "test"

export type TeamAlertPreferences = {
  handoff: boolean
  waiting: boolean
  upset: boolean
  lead: boolean
  digest: boolean
}

export const DEFAULT_TEAM_ALERTS: TeamAlertPreferences = {
  handoff: true,
  waiting: true,
  upset: true,
  lead: true,
  digest: true,
}

export const getTeamBotToken = () =>
  process.env.TEAM_TELEGRAM_BOT_TOKEN?.trim() || null

export const getDashboardUrl = () =>
  (process.env.DASHBOARD_URL?.trim() || "https://app.osonflow.uz").replace(
    /\/$/,
    ""
  )

/**
 * The secret Telegram echoes back on every webhook call. Derived from the token
 * rather than configured separately, so there is one variable to set, and a
 * rotated token rotates the secret with it.
 */
export const getTeamBotWebhookSecret = async (token: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`osonflow-team-bot:${token}`)
  )

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export const escapeTelegramHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const truncateText = (value: string, maxLength: number) => {
  const text = value.trim().replace(/\s+/g, " ")

  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`
}

type TelegramResponse<T> = {
  ok: boolean
  description?: string
  result?: T
}

export const callTeamBot = async <T = unknown>(
  token: string,
  method: string,
  body: Record<string, unknown>
): Promise<TelegramResponse<T>> => {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/${method}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    )

    return (await response.json()) as TelegramResponse<T>
  } catch (error) {
    return {
      ok: false,
      description: error instanceof Error ? error.message : "Network error",
    }
  }
}

export type InlineButton =
  | { text: string; url: string }
  | { text: string; callback_data: string }

/** Sends one HTML message; returns its id, or null if Telegram refused it. */
export const sendTeamMessage = async (
  token: string,
  {
    chatId,
    html,
    buttons,
    forceReply,
    replyToMessageId,
  }: {
    chatId: string
    html: string
    buttons?: InlineButton[][]
    /** Opens the reply box, so answering is one tap. */
    forceReply?: boolean
    replyToMessageId?: number
  }
): Promise<number | null> => {
  const result = await callTeamBot<{ message_id?: number }>(
    token,
    "sendMessage",
    {
      chat_id: chatId,
      text: html,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(replyToMessageId
        ? {
            reply_parameters: {
              message_id: replyToMessageId,
              allow_sending_without_reply: true,
            },
          }
        : {}),
      ...(forceReply
        ? { reply_markup: { force_reply: true } }
        : buttons?.length
          ? { reply_markup: { inline_keyboard: buttons } }
          : {}),
    }
  )

  if (!result.ok) {
    console.warn("Team bot sendMessage failed", result.description)
    return null
  }

  return result.result?.message_id ?? null
}

/* ── copy ───────────────────────────────────────────────────────────────── */

export type CustomerChannel = "widget" | "telegram" | "instagram" | "whatsapp"

const CHANNEL_NAMES: Record<TeamLanguage, Record<CustomerChannel, string>> = {
  en: {
    widget: "website chat",
    telegram: "Telegram",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
  },
  uz: {
    widget: "sayt chati",
    telegram: "Telegram",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
  },
  ru: {
    widget: "чат на сайте",
    telegram: "Telegram",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
  },
}

const formatDuration = (minutes: number, language: TeamLanguage) => {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  const units = {
    en: { h: "h", m: "min" },
    uz: { h: "soat", m: "daqiqa" },
    ru: { h: "ч", m: "мин" },
  }[language]

  if (hours === 0) {
    return `${rest} ${units.m}`
  }

  return rest ? `${hours} ${units.h} ${rest} ${units.m}` : `${hours} ${units.h}`
}

/**
 * Everything the bot says, in the language the team member uses the dashboard
 * in. Customer words are passed in already escaped.
 */
export const teamCopy = (language: TeamLanguage) => {
  const channel = (value: CustomerChannel) => CHANNEL_NAMES[language][value]

  const copy = {
    en: {
      linked:
        "✅ <b>Connected!</b> Osonflow alerts will arrive here.\n\nTo answer a customer, reply to their alert — they get your message in the app they wrote from.\n\n/stop pauses alerts, /resume turns them back on.",
      linkExpired:
        "This link has expired. Open Osonflow → Telegram alerts and connect again.",
      startHelp:
        "Hi! This bot sends Osonflow alerts to your team.\n\nTo connect, open the Osonflow dashboard → <b>Telegram alerts</b>.",
      handoff: (name: string, via: CustomerChannel) =>
        `🙋 <b>${name}</b> wants to talk to a person · ${channel(via)}`,
      waiting: (name: string, via: CustomerChannel) =>
        `💬 <b>${name}</b> wrote · ${channel(via)}`,
      upset: (name: string, via: CustomerChannel) =>
        `⚠️ <b>${name}</b> seems unhappy · ${channel(via)}`,
      lead: (name: string, via: CustomerChannel) =>
        `✨ <b>New lead:</b> ${name} · ${channel(via)}`,
      replyHint: "↩️ Reply to this message to answer.",
      openButton: "Open in Osonflow",
      leadsButton: "See leads",
      resolveButton: "✓ Mark resolved",
      answerButton: "✍️ Answer",
      sent: (name: string) => `✓ Sent to ${name}.`,
      resolved: "✓ Marked resolved.",
      closed: "This conversation is already closed.",
      answerPrompt: (question: string) =>
        `✍️ Reply with the answer to:\n“${question}”\n\nYour assistant will use it from now on.`,
      answerSaved: "✓ Saved. Your assistant knows this now.",
      answerFailed:
        "Couldn't save that answer. Please try again from the dashboard.",
      notAReply:
        "To answer a customer, reply to their alert (swipe left on it, or tap Reply).",
      textOnly: "Only text replies can be sent to customers for now.",
      paused: "🔕 Alerts paused. Send /resume to turn them back on.",
      resumed: "🔔 Alerts are back on.",
      sendFailed:
        "Couldn't send that. The customer may be out of reach on this channel — try from the dashboard.",
      test: "🔔 <b>Test alert</b> — everything works. Real alerts will look like this.",
      digestTitle: "📊 <b>Your week with Osonflow</b>",
      digestConversations: (n: number) => `Conversations: <b>${n}</b>`,
      digestAi: (n: number) => `Solved by your assistant: <b>${n}</b>`,
      digestTeam: (n: number) => `Handed to your team: <b>${n}</b>`,
      digestLeads: (n: number) => `New leads: <b>${n}</b>`,
      digestFollowUps: (n: number) => `Follow-ups sent: <b>${n}</b>`,
      digestSaved: (minutes: number) =>
        `Time saved: <b>~${formatDuration(minutes, "en")}</b>`,
      digestQuiet: "A quiet week — no conversations.",
      digestQuestions:
        "Customers asked these and your assistant didn't know. Tap <b>Answer</b> to teach it:",
      question: (question: string, count: number) =>
        count > 1 ? `❓ “${question}” — asked ${count}×` : `❓ “${question}”`,
    },
    uz: {
      linked:
        "✅ <b>Ulandi!</b> Osonflow bildirishnomalari shu yerga keladi.\n\nMijozga javob berish uchun uning bildirishnomasiga javob yozing — xabaringiz mijozga u yozgan ilovada yetib boradi.\n\n/stop — bildirishnomalarni to'xtatish, /resume — qayta yoqish.",
      linkExpired:
        "Bu havolaning muddati tugagan. Osonflow → Telegram bildirishnomalari bo'limidan qaytadan ulaning.",
      startHelp:
        "Salom! Bu bot Osonflow bildirishnomalarini jamoangizga yuboradi.\n\nUlanish uchun Osonflow panelida <b>Telegram bildirishnomalari</b> bo'limini oching.",
      handoff: (name: string, via: CustomerChannel) =>
        `🙋 <b>${name}</b> xodim bilan gaplashmoqchi · ${channel(via)}`,
      waiting: (name: string, via: CustomerChannel) =>
        `💬 <b>${name}</b> yozdi · ${channel(via)}`,
      upset: (name: string, via: CustomerChannel) =>
        `⚠️ <b>${name}</b> norozi ko'rinadi · ${channel(via)}`,
      lead: (name: string, via: CustomerChannel) =>
        `✨ <b>Yangi mijoz:</b> ${name} · ${channel(via)}`,
      replyHint: "↩️ Javob berish uchun shu xabarga javob yozing.",
      openButton: "Osonflow'da ochish",
      leadsButton: "Mijozlarni ko'rish",
      resolveButton: "✓ Hal qilindi",
      answerButton: "✍️ Javob berish",
      sent: (name: string) => `✓ ${name}ga yuborildi.`,
      resolved: "✓ Hal qilindi deb belgilandi.",
      closed: "Bu suhbat allaqachon yopilgan.",
      answerPrompt: (question: string) =>
        `✍️ Shu savolga javob yozing:\n“${question}”\n\nYordamchingiz bundan buyon shu javobdan foydalanadi.`,
      answerSaved: "✓ Saqlandi. Yordamchingiz endi buni biladi.",
      answerFailed:
        "Javobni saqlab bo'lmadi. Iltimos, panel orqali qayta urinib ko'ring.",
      notAReply:
        "Mijozga javob berish uchun uning bildirishnomasiga javob yozing (xabarni chapga suring yoki «Javob berish»ni bosing).",
      textOnly: "Hozircha mijozlarga faqat matnli javob yuborish mumkin.",
      paused:
        "🔕 Bildirishnomalar to'xtatildi. Qayta yoqish uchun /resume yuboring.",
      resumed: "🔔 Bildirishnomalar qayta yoqildi.",
      sendFailed:
        "Yuborib bo'lmadi. Mijoz bu kanalda hozir yetib bo'lmas holatda bo'lishi mumkin — panel orqali urinib ko'ring.",
      test: "🔔 <b>Sinov bildirishnomasi</b> — hammasi ishlayapti. Haqiqiy bildirishnomalar shunday ko'rinadi.",
      digestTitle: "📊 <b>Osonflow bilan haftangiz</b>",
      digestConversations: (n: number) => `Suhbatlar: <b>${n}</b>`,
      digestAi: (n: number) => `Yordamchi hal qildi: <b>${n}</b>`,
      digestTeam: (n: number) => `Jamoaga o'tkazildi: <b>${n}</b>`,
      digestLeads: (n: number) => `Yangi mijozlar: <b>${n}</b>`,
      digestFollowUps: (n: number) => `Eslatmalar yuborildi: <b>${n}</b>`,
      digestSaved: (minutes: number) =>
        `Tejalgan vaqt: <b>~${formatDuration(minutes, "uz")}</b>`,
      digestQuiet: "Tinch hafta — suhbatlar bo'lmadi.",
      digestQuestions:
        "Mijozlar bularni so'radi, yordamchingiz esa javobni bilmadi. Unga o'rgatish uchun <b>Javob berish</b>ni bosing:",
      question: (question: string, count: number) =>
        count > 1
          ? `❓ “${question}” — ${count} marta so'ralgan`
          : `❓ “${question}”`,
    },
    ru: {
      linked:
        "✅ <b>Подключено!</b> Уведомления Osonflow будут приходить сюда.\n\nЧтобы ответить клиенту, ответьте на его уведомление — клиент получит сообщение там, где он написал.\n\n/stop — приостановить уведомления, /resume — включить снова.",
      linkExpired:
        "Срок действия ссылки истёк. Откройте Osonflow → Уведомления в Telegram и подключитесь снова.",
      startHelp:
        "Здравствуйте! Этот бот отправляет уведомления Osonflow вашей команде.\n\nЧтобы подключиться, откройте панель Osonflow → <b>Уведомления в Telegram</b>.",
      handoff: (name: string, via: CustomerChannel) =>
        `🙋 <b>${name}</b> просит сотрудника · ${channel(via)}`,
      waiting: (name: string, via: CustomerChannel) =>
        `💬 <b>${name}</b> написал(а) · ${channel(via)}`,
      upset: (name: string, via: CustomerChannel) =>
        `⚠️ <b>${name}</b>, похоже, недоволен(на) · ${channel(via)}`,
      lead: (name: string, via: CustomerChannel) =>
        `✨ <b>Новый лид:</b> ${name} · ${channel(via)}`,
      replyHint: "↩️ Ответьте на это сообщение, чтобы написать клиенту.",
      openButton: "Открыть в Osonflow",
      leadsButton: "Все лиды",
      resolveButton: "✓ Решено",
      answerButton: "✍️ Ответить",
      sent: (name: string) => `✓ Отправлено: ${name}.`,
      resolved: "✓ Отмечено как решённое.",
      closed: "Этот разговор уже закрыт.",
      answerPrompt: (question: string) =>
        `✍️ Напишите ответ на вопрос:\n«${question}»\n\nАссистент будет использовать его с этого момента.`,
      answerSaved: "✓ Сохранено. Теперь ассистент это знает.",
      answerFailed:
        "Не удалось сохранить ответ. Попробуйте ещё раз в панели.",
      notAReply:
        "Чтобы ответить клиенту, ответьте на его уведомление (смахните сообщение влево или нажмите «Ответить»).",
      textOnly: "Пока клиентам можно отправлять только текстовые ответы.",
      paused:
        "🔕 Уведомления приостановлены. Отправьте /resume, чтобы включить их снова.",
      resumed: "🔔 Уведомления снова включены.",
      sendFailed:
        "Не удалось отправить. Возможно, клиент сейчас недоступен в этом канале — попробуйте из панели.",
      test: "🔔 <b>Тестовое уведомление</b> — всё работает. Настоящие уведомления будут выглядеть так.",
      digestTitle: "📊 <b>Ваша неделя с Osonflow</b>",
      digestConversations: (n: number) => `Разговоров: <b>${n}</b>`,
      digestAi: (n: number) => `Решено ассистентом: <b>${n}</b>`,
      digestTeam: (n: number) => `Передано команде: <b>${n}</b>`,
      digestLeads: (n: number) => `Новых лидов: <b>${n}</b>`,
      digestFollowUps: (n: number) => `Отправлено напоминаний: <b>${n}</b>`,
      digestSaved: (minutes: number) =>
        `Сэкономлено времени: <b>~${formatDuration(minutes, "ru")}</b>`,
      digestQuiet: "Спокойная неделя — разговоров не было.",
      digestQuestions:
        "Клиенты спрашивали это, а ассистент не знал ответа. Нажмите <b>Ответить</b>, чтобы научить его:",
      question: (question: string, count: number) =>
        count > 1
          ? `❓ «${question}» — спросили ${count} раз`
          : `❓ «${question}»`,
    },
  }

  return copy[language]
}

export const toTeamLanguage = (value?: string | null): TeamLanguage => {
  const normalized = value?.toLowerCase() ?? ""

  if (normalized.startsWith("uz")) return "uz"
  if (normalized.startsWith("ru")) return "ru"

  return normalized.startsWith("en") ? "en" : "uz"
}
