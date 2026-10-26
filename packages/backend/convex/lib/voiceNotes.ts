import { saveMessage } from "@convex-dev/agent"
import { components, internal } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import { MAX_ATTACHMENT_SIZE_BYTES } from "./chatAttachments"
import { getOpenAIKeyFromSecretValue } from "./openai"
import { safeFetch } from "./outboundUrl"

/**
 * Customer voice notes on Telegram, WhatsApp and Instagram.
 *
 * In Uzbekistan a large share of customers speak to a business rather than type
 * to it. A voice note used to be dropped on the floor — the channel handlers only
 * read text — so those customers got silence. Now the audio is kept as an
 * attachment the inbox can play, and its transcript becomes the message the
 * assistant (and the team) reads.
 */

/** Longer notes are kept and playable, but not transcribed. */
export const MAX_TRANSCRIBED_VOICE_SECONDS = 600

/**
 * Billed per minute of audio, at a small fraction of what the reply to it costs.
 * The mini model is plenty for a customer asking a business a question.
 */
const TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe"

/**
 * Only steers spelling and script; it never asks the model to translate. Uzbek
 * is written in Latin script in business chat, and a transcription left to its
 * own devices tends to come back in Cyrillic.
 */
const TRANSCRIPTION_PROMPT =
  "A customer is leaving a voice message for a business in Uzbekistan. They usually speak Uzbek (write it in Latin script) or Russian, sometimes mixing both. Write down exactly what they say, in the language they say it."

/**
 * What the thread holds for a voice note that could not be transcribed. It is
 * a symbol rather than a word because the inbox shows it as the message text
 * next to the audio player, to people who may not read English.
 */
export const VOICE_NOTE_PLACEHOLDER = "🎤"

export type DownloadedAudio = {
  blob: Blob
  mediaType: string
  durationSeconds?: number
}

const extensionFor = (mediaType: string) => {
  const type = mediaType.split(";")[0]?.trim().toLowerCase() ?? ""

  if (type.includes("ogg") || type.includes("opus")) return "ogg"
  if (type.includes("mpeg") || type.includes("mp3")) return "mp3"
  if (type.includes("wav")) return "wav"
  if (type.includes("webm")) return "webm"
  if (type.includes("mp4") || type.includes("m4a") || type.includes("aac")) {
    return "m4a"
  }

  return "ogg"
}

/** The media type without codec parameters, as the attachment row stores it. */
const baseMediaType = (mediaType: string) =>
  mediaType.split(";")[0]?.trim().toLowerCase() || "audio/ogg"

const readAudioResponse = async (
  response: Response,
  fallbackMediaType: string
): Promise<Blob | null> => {
  if (!response.ok) {
    return null
  }

  const declaredLength = Number(response.headers.get("content-length") ?? 0)

  if (declaredLength > MAX_ATTACHMENT_SIZE_BYTES) {
    return null
  }

  const bytes = await response.arrayBuffer()

  if (bytes.byteLength === 0 || bytes.byteLength > MAX_ATTACHMENT_SIZE_BYTES) {
    return null
  }

  return new Blob([bytes], {
    type: response.headers.get("content-type") || fallbackMediaType,
  })
}

/** A Telegram file, by the `file_id` a voice or audio message carries. */
export const downloadTelegramAudio = async ({
  botToken,
  fileId,
  mediaType,
  durationSeconds,
}: {
  botToken: string
  fileId: string
  mediaType?: string
  durationSeconds?: number
}): Promise<DownloadedAudio | null> => {
  try {
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`
    )
    const file = (await fileResponse.json()) as {
      ok?: boolean
      result?: { file_path?: string }
    }
    const filePath = file.result?.file_path

    if (!file.ok || !filePath) {
      return null
    }

    const blob = await readAudioResponse(
      await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`),
      mediaType || "audio/ogg"
    )

    return blob
      ? {
          blob,
          // Telegram serves voice notes as application/octet-stream.
          mediaType: baseMediaType(mediaType || "audio/ogg"),
          durationSeconds,
        }
      : null
  } catch (error) {
    console.error("Telegram voice note download failed", error)
    return null
  }
}

/** A WhatsApp media object, by the id an `audio` message carries. */
export const downloadWhatsAppAudio = async ({
  accessToken,
  mediaId,
  graphApiVersion,
}: {
  accessToken: string
  mediaId: string
  graphApiVersion: string
}): Promise<DownloadedAudio | null> => {
  try {
    const mediaResponse = await fetch(
      `https://graph.facebook.com/${graphApiVersion}/${encodeURIComponent(mediaId)}`,
      { headers: { authorization: `Bearer ${accessToken}` } }
    )
    const media = (await mediaResponse.json()) as {
      url?: string
      mime_type?: string
      file_size?: number
    }

    if (!mediaResponse.ok || !media.url) {
      return null
    }

    if ((media.file_size ?? 0) > MAX_ATTACHMENT_SIZE_BYTES) {
      return null
    }

    const blob = await readAudioResponse(
      await fetch(media.url, {
        headers: { authorization: `Bearer ${accessToken}` },
      }),
      media.mime_type || "audio/ogg"
    )

    return blob
      ? { blob, mediaType: baseMediaType(media.mime_type || "audio/ogg") }
      : null
  } catch (error) {
    console.error("WhatsApp voice note download failed", error)
    return null
  }
}

/** An Instagram attachment, whose payload carries a signed CDN URL. */
export const downloadAudioFromUrl = async (
  url: string
): Promise<DownloadedAudio | null> => {
  try {
    const parsed = new URL(url)

    if (parsed.protocol !== "https:") {
      return null
    }

    // The URL comes from an Instagram webhook payload, so it is only as
    // trustworthy as the signature that admitted that payload; safeFetch keeps
    // it from reaching an internal address through DNS or a redirect.
    const blob = await readAudioResponse(await safeFetch(parsed.toString()), "audio/mp4")

    return blob
      ? { blob, mediaType: baseMediaType(blob.type || "audio/mp4") }
      : null
  } catch (error) {
    console.error("Instagram voice note download failed", error)
    return null
  }
}

const transcribe = async (
  audio: DownloadedAudio,
  apiKey: string
): Promise<string | null> => {
  const form = new FormData()

  form.append(
    "file",
    new Blob([audio.blob], { type: audio.mediaType }),
    `voice.${extensionFor(audio.mediaType)}`
  )
  form.append("model", TRANSCRIPTION_MODEL)
  form.append("prompt", TRANSCRIPTION_PROMPT)
  form.append("response_format", "json")

  try {
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}` },
        body: form,
      }
    )

    if (!response.ok) {
      console.error(
        "Voice note transcription failed",
        response.status,
        await response.text().catch(() => "")
      )
      return null
    }

    const body = (await response.json()) as { text?: string }

    return body.text?.trim() || null
  } catch (error) {
    console.error("Voice note transcription failed", error)
    return null
  }
}

/**
 * Writes a customer's voice note into the thread as their message: the audio
 * as an attachment the inbox can play, the transcript as the words the
 * assistant and the team read. Returns the saved message, so the reply can be
 * generated against it rather than writing the prompt a second time.
 */
export const saveCustomerVoiceNote = async (
  ctx: any,
  args: {
    organizationId: string
    conversationId: Id<"conversations">
    threadId: string
    contactSessionId: Id<"contactSessions">
    /** Null when the channel would not hand the file over; the note is still recorded. */
    audio: DownloadedAudio | null
    /** Off when the organization has no active plan: the audio is still kept. */
    transcribe: boolean
  }
): Promise<{ messageId: string; transcript: string | null }> => {
  const audio = args.audio
  let attachmentId: Id<"chatAttachments"> | null = null

  if (audio) {
    try {
      attachmentId = await keepAudio(ctx, { ...args, audio })
    } catch (error) {
      console.error("Could not keep the voice note audio", error)
    }
  }

  let transcript: string | null = null
  const withinLength =
    (audio?.durationSeconds ?? 0) <= MAX_TRANSCRIBED_VOICE_SECONDS

  if (audio && args.transcribe && withinLength) {
    const openAIPlugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      { organizationId: args.organizationId, service: "openai_realtime" }
    )
    const apiKey =
      getOpenAIKeyFromSecretValue(openAIPlugin?.secretValue) ||
      process.env.OPENAI_API_KEY

    if (apiKey) {
      transcript = await transcribe(audio, apiKey)
    }
  }

  const saved = await saveMessage(ctx, components.agent, {
    threadId: args.threadId,
    message: {
      role: "user",
      content: transcript ?? VOICE_NOTE_PLACEHOLDER,
    },
  })

  if (attachmentId) {
    await ctx.runMutation(internal.system.chatAttachments.bindToMessage, {
      conversationId: args.conversationId,
      attachmentIds: [attachmentId],
      messageId: saved.messageId,
      source: "contact",
      contactSessionId: args.contactSessionId,
    })
  }

  return { messageId: saved.messageId, transcript }
}

const keepAudio = async (
  ctx: any,
  args: {
    organizationId: string
    conversationId: Id<"conversations">
    threadId: string
    contactSessionId: Id<"contactSessions">
    audio: DownloadedAudio
  }
): Promise<Id<"chatAttachments">> => {
  const storageId = await ctx.storage.store(args.audio.blob)
  const attachment = await ctx.runMutation(
    internal.system.chatAttachments.record,
    {
      organizationId: args.organizationId,
      conversationId: args.conversationId,
      threadId: args.threadId,
      storageId,
      source: "contact",
      contactSessionId: args.contactSessionId,
      filename: `voice.${extensionFor(args.audio.mediaType)}`,
      mediaType: args.audio.mediaType,
      size: args.audio.blob.size,
      durationSeconds: args.audio.durationSeconds,
    }
  )

  return attachment.id
}
