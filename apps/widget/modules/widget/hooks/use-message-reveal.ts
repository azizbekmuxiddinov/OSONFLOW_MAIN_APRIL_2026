"use client"

import { useEffect, useRef, useState } from "react"

/**
 * How long it takes to reveal whatever part of a message is still hidden.
 * Fixed, not per character: a long reply appears as fast as a short one.
 */
const REVEAL_MS = 350

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/**
 * Types a message into view over a fixed, short window.
 *
 * Every time `text` grows (a reply landing whole, or the next streamed chunk),
 * the hidden remainder is revealed over `REVEAL_MS` starting from what is
 * already shown, so the bubble never lags behind the model and never takes
 * longer because the message is long.
 *
 * `animateFromStart` is read once, on mount: false renders the text at once
 * (history the visitor has already read).
 */
export const useMessageReveal = (text: string, animateFromStart: boolean) => {
  const [cursor, setCursor] = useState(() =>
    animateFromStart ? 0 : text.length
  )
  const cursorRef = useRef(cursor)

  useEffect(() => {
    const from = Math.min(cursorRef.current, text.length)
    const to = text.length

    if (from >= to) {
      cursorRef.current = to
      setCursor(to)
      return
    }

    const startedAt = performance.now()
    let frame = 0

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / REVEAL_MS)
      const next = Math.round(from + (to - from) * easeOutCubic(progress))
      cursorRef.current = next
      setCursor(next)
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [text])

  return text.slice(0, Math.min(cursor, text.length))
}
