"use client"

import {
  AlertCircleIcon,
  Loader2Icon,
  PauseIcon,
  PlayIcon,
  XIcon,
  ZoomInIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import type { ChatAttachmentDraft } from "@workspace/ui/hooks/use-chat-image-attachments"
import { formatFileSize } from "@workspace/ui/lib/chat-attachments"
import { cn } from "@workspace/ui/lib/utils"

export type ChatMessageAttachment = {
  id: string
  url: string
  mediaType: string
  filename: string
  size: number
  width?: number
  height?: number
  /** Set on voice messages, from the length measured while recording. */
  durationSeconds?: number
  /** Present on server-sent attachments; absent on optimistic previews. */
  createdAt?: number
  source?: "contact" | "operator"
}

/** Keeps a single image from dominating the bubble while staying legible. */
const SINGLE_IMAGE_MAX_WIDTH = 260

const aspectRatioFor = (attachment: ChatMessageAttachment) =>
  attachment.width && attachment.height
    ? `${attachment.width} / ${attachment.height}`
    : "4 / 3"

/* ── lightbox ───────────────────────────────────────────────────────────── */

/**
 * Rendered through a portal rather than in place.
 *
 * `position: fixed` resolves against the nearest ancestor that has a transform,
 * filter or backdrop-filter — and a chat bubble usually has one (the widget
 * animates every bubble in). In place, the overlay would be sized and clipped to
 * the bubble it came from instead of covering the surface, so it is mounted on
 * `document.body`, which has no such ancestor on either surface. Inside the
 * embedded widget that fills the widget panel; in the dashboard, the window.
 */
const AttachmentLightbox = ({
  attachment,
  onClose,
}: {
  attachment: ChatMessageAttachment
  onClose: () => void
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  // Only ever mounted from a click, so there is no server render to match.
  if (typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div
      aria-label={attachment.filename}
      aria-modal="true"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
    >
      <button
        aria-label="Close image"
        className="absolute top-2.5 right-2.5 z-10 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
        onClick={onClose}
        type="button"
      >
        <XIcon className="size-4" />
      </button>
      <img
        alt={attachment.filename}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        src={attachment.url}
      />
    </div>,
    document.body
  )
}

/* ── voice messages ─────────────────────────────────────────────────────── */

const isVoiceAttachment = (attachment: ChatMessageAttachment) =>
  attachment.mediaType.startsWith("audio/")

const formatPlaybackTime = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

/**
 * A voice message as a compact player. Colors come from `currentColor`, so it
 * reads correctly on both the light and the accent-colored bubble.
 */
const VoiceAttachmentPlayer = ({
  attachment,
}: {
  attachment: ChatMessageAttachment
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  // Ogg files often report an infinite duration until fully read, so the length
  // measured while recording is preferred.
  const [mediaDuration, setMediaDuration] = useState<number | null>(null)
  const duration = attachment.durationSeconds || mediaDuration || 0
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0

  const togglePlayback = () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (audio.paused) {
      void audio.play()
    } else {
      audio.pause()
    }
  }

  const seekTo = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current

    if (!audio || duration <= 0) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - bounds.left) / bounds.width
    audio.currentTime = Math.min(duration, Math.max(0, ratio * duration))
    setCurrentTime(audio.currentTime)
  }

  return (
    <div className="flex w-56 max-w-full items-center gap-2.5 py-0.5">
      <button
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-current/15 transition-colors hover:bg-current/25"
        onClick={togglePlayback}
        type="button"
      >
        {isPlaying ? (
          <PauseIcon className="size-3.5 fill-current" />
        ) : (
          <PlayIcon className="ml-0.5 size-3.5 fill-current" />
        )}
      </button>
      <div
        aria-label="Seek"
        className="relative h-1.5 min-w-0 flex-1 cursor-pointer rounded-full bg-current/20"
        onClick={seekTo}
        role="presentation"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-current"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="shrink-0 text-[11px] tabular-nums opacity-75">
        {formatPlaybackTime(
          isPlaying || currentTime > 0 ? currentTime : duration
        )}
      </span>
      <audio
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration

          if (Number.isFinite(value) && value > 0) {
            setMediaDuration(value)
          }
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        preload="metadata"
        ref={audioRef}
        src={attachment.url}
      />
    </div>
  )
}

/* ── message attachments ────────────────────────────────────────────────── */

export type AIMessageAttachmentsProps = {
  attachments: ChatMessageAttachment[]
  className?: string
  /** Rendered per image when the viewer is allowed to take it down. */
  onRemove?: (attachmentId: string) => void
}

/**
 * The images carried by one message.
 *
 * Every image reserves its own box from the stored dimensions before it loads,
 * so a transcript does not jump around as pictures arrive, and everything below
 * the fold is left to the browser to fetch lazily.
 */
export const AIMessageAttachments = ({
  attachments,
  className,
  onRemove,
}: AIMessageAttachmentsProps) => {
  const [preview, setPreview] = useState<ChatMessageAttachment | null>(null)

  if (attachments.length === 0) {
    return null
  }

  const voiceAttachments = attachments.filter(isVoiceAttachment)
  const images = attachments.filter(
    (attachment) => !isVoiceAttachment(attachment)
  )
  const isSingle = images.length === 1

  return (
    <>
      {voiceAttachments.map((attachment) => (
        <VoiceAttachmentPlayer attachment={attachment} key={attachment.id} />
      ))}
      {images.length > 0 ? (
        <div
          className={cn(
            "grid gap-1.5",
            isSingle ? "grid-cols-1" : "grid-cols-2",
            className
          )}
          style={isSingle ? { maxWidth: SINGLE_IMAGE_MAX_WIDTH } : undefined}
        >
          {images.map((attachment) => (
            <div
              className="group/attachment relative overflow-hidden rounded-xl bg-black/5 dark:bg-white/8"
              key={attachment.id}
              style={{
                aspectRatio: isSingle ? aspectRatioFor(attachment) : "1 / 1",
              }}
            >
              <button
                aria-label={`Open ${attachment.filename}`}
                className="block size-full cursor-zoom-in"
                onClick={() => setPreview(attachment)}
                type="button"
              >
                        <img
                  alt={attachment.filename}
                  className="size-full object-cover transition-transform duration-300 group-hover/attachment:scale-[1.02]"
                  decoding="async"
                  draggable={false}
                  height={attachment.height}
                  loading="lazy"
                  src={attachment.url}
                  width={attachment.width}
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity duration-200 group-hover/attachment:bg-black/20 group-hover/attachment:opacity-100">
                  <ZoomInIcon className="size-5 text-white drop-shadow" />
                </span>
              </button>

              {onRemove ? (
                <button
                  aria-label={`Delete ${attachment.filename}`}
                  className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity hover:bg-black/75 focus-visible:opacity-100 group-hover/attachment:opacity-100"
                  onClick={() => onRemove(attachment.id)}
                  type="button"
                >
                  <XIcon className="size-3.5" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {preview ? (
        <AttachmentLightbox
          attachment={preview}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </>
  )
}

/* ── composer tray ──────────────────────────────────────────────────────── */

export type AIAttachmentTrayProps = {
  drafts: ChatAttachmentDraft[]
  onRemove: (key: string) => void
  className?: string
}

/** The strip of pending uploads above the composer, with per-image state. */
export const AIAttachmentTray = ({
  drafts,
  onRemove,
  className,
}: AIAttachmentTrayProps) => {
  const handleRemove = useCallback(
    (key: string) => () => onRemove(key),
    [onRemove]
  )

  if (drafts.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {drafts.map((draft) => (
        <div
          className={cn(
            "group/draft relative size-14 shrink-0 overflow-hidden rounded-lg border",
            draft.status === "error"
              ? "border-destructive/50"
              : "border-border/70"
          )}
          key={draft.key}
          title={
            draft.error ?? `${draft.filename} · ${formatFileSize(draft.size)}`
          }
        >
              <img
            alt={draft.filename}
            className="size-full object-cover"
            draggable={false}
            src={draft.previewUrl}
          />

          {draft.status !== "ready" ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
              {draft.status === "uploading" ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <AlertCircleIcon className="size-4" />
              )}
            </span>
          ) : null}

          <button
            aria-label={`Remove ${draft.filename}`}
            className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover/draft:opacity-100"
            onClick={handleRemove(draft.key)}
            type="button"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
