"use client"

import { AIInputButton } from "@workspace/ui/components/ai/input"
import { Loader2Icon, MicIcon, SendIcon, Trash2Icon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { webmOpusToOgg } from "@/lib/audio/webm-opus-to-ogg"

/**
 * Formats in order of preference. Telegram shows Ogg/Opus as a proper voice
 * note, so Firefox records it directly and Chrome/Edge record WebM/Opus that is
 * rewrapped as Ogg; Safari can only produce MP4 audio, which Telegram also
 * accepts for voice.
 */
const RECORDING_FORMATS = [
  { mimeType: "audio/ogg;codecs=opus", fileType: "audio/ogg", rewrap: false },
  { mimeType: "audio/webm;codecs=opus", fileType: "audio/ogg", rewrap: true },
  { mimeType: "audio/mp4;codecs=mp4a.40.2", fileType: "audio/mp4", rewrap: false },
  { mimeType: "audio/mp4", fileType: "audio/mp4", rewrap: false },
] as const

type RecordingFormat = (typeof RECORDING_FORMATS)[number]

const pickRecordingFormat = (): RecordingFormat | null => {
  if (
    typeof MediaRecorder === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return null
  }

  return (
    RECORDING_FORMATS.find((format) =>
      MediaRecorder.isTypeSupported(format.mimeType)
    ) ?? null
  )
}

/** Recording stops and sends itself at this length. */
const MAX_RECORDING_SECONDS = 10 * 60
/** Anything shorter is an accidental tap, and is dropped. */
const MIN_RECORDING_SECONDS = 1

const formatElapsed = (seconds: number) => {
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

export type RecordedVoiceMessage = {
  file: Blob
  durationSeconds: number
}

/**
 * The composer's voice-message control: a microphone button that turns into a
 * recording bar with a timer, a discard button and a send button.
 */
export const VoiceMessageRecorder = ({
  disabled,
  onSend,
  onRecordingChange,
}: {
  disabled?: boolean
  onSend: (voice: RecordedVoiceMessage) => Promise<void>
  /** Lets the composer make room for the recording bar. */
  onRecordingChange?: (isActive: boolean) => void
}) => {
  const [state, setState] = useState<"idle" | "recording" | "sending">("idle")
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const outcomeRef = useRef<"send" | "discard">("discard")

  useEffect(() => {
    onRecordingChange?.(state !== "idle")
  }, [onRecordingChange, state])

  const releaseMicrophone = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const stopRecording = useCallback((outcome: "send" | "discard") => {
    outcomeRef.current = outcome
    const recorder = recorderRef.current

    if (recorder && recorder.state !== "inactive") {
      recorder.stop()
    }
  }, [])

  // Leaving the conversation mid-recording throws the recording away and
  // turns the microphone off.
  useEffect(
    () => () => {
      outcomeRef.current = "discard"
      const recorder = recorderRef.current

      if (recorder && recorder.state !== "inactive") {
        recorder.stop()
      }

      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    []
  )

  useEffect(() => {
    if (state !== "recording") {
      return
    }

    const intervalId = window.setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000
      setElapsedSeconds(elapsed)

      if (elapsed >= MAX_RECORDING_SECONDS) {
        stopRecording("send")
      }
    }, 200)

    return () => window.clearInterval(intervalId)
  }, [state, stopRecording])

  const finishRecording = async (format: RecordingFormat) => {
    releaseMicrophone()
    recorderRef.current = null

    const durationSeconds = (Date.now() - startedAtRef.current) / 1000
    const chunks = chunksRef.current
    chunksRef.current = []

    if (
      outcomeRef.current === "discard" ||
      durationSeconds < MIN_RECORDING_SECONDS ||
      chunks.length === 0
    ) {
      setState("idle")
      return
    }

    setState("sending")

    try {
      const recording = new Blob(chunks, { type: format.mimeType })
      const file = format.rewrap
        ? new Blob([webmOpusToOgg(new Uint8Array(await recording.arrayBuffer()))], {
            type: format.fileType,
          })
        : new Blob(chunks, { type: format.fileType })

      await onSend({ file, durationSeconds })
    } catch (error) {
      toast.error("Failed to send the voice message")
      console.error(error)
    } finally {
      setState("idle")
    }
  }

  const startRecording = async () => {
    const format = pickRecordingFormat()

    if (!format) {
      toast.error("This browser can't record voice messages")
      return
    }

    let stream: MediaStream

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
    } catch {
      toast.error("Microphone access was blocked")
      return
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: format.mimeType,
      audioBitsPerSecond: 32_000,
    })

    chunksRef.current = []
    outcomeRef.current = "discard"
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }
    recorder.onstop = () => void finishRecording(format)

    streamRef.current = stream
    recorderRef.current = recorder
    startedAtRef.current = Date.now()
    setElapsedSeconds(0)
    recorder.start()
    setState("recording")
  }

  if (state === "sending") {
    return (
      <span className="flex h-9 items-center gap-2 px-3 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Sending…
      </span>
    )
  }

  if (state === "recording") {
    return (
      <div className="flex items-center gap-1">
        <AIInputButton
          aria-label="Cancel recording"
          onClick={() => stopRecording("discard")}
          title="Cancel recording"
        >
          <Trash2Icon />
        </AIInputButton>
        <span className="flex items-center gap-2 px-1.5 text-sm tabular-nums">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500/70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
          </span>
          {formatElapsed(elapsedSeconds)}
        </span>
        <AIInputButton
          aria-label="Send voice message"
          className="text-primary"
          onClick={() => stopRecording("send")}
          title="Send voice message"
        >
          <SendIcon />
        </AIInputButton>
      </div>
    )
  }

  return (
    <AIInputButton
      aria-label="Record a voice message"
      disabled={disabled}
      onClick={() => void startRecording()}
      title="Record a voice message"
    >
      <MicIcon />
    </AIInputButton>
  )
}
