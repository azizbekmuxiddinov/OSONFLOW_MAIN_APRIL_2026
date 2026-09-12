"use client"

import { useMemo, useRef } from "react"

import { highlightJavascript } from "../lib/highlight-javascript"

/**
 * The inspector's code box, with the same colouring as the full-window editor.
 *
 * A textarea cannot paint its own text, so the colours are a <pre> sitting
 * directly beneath one whose glyphs are transparent. Both layers carry
 * identical type metrics and padding, which is the whole trick: the painted
 * tokens land exactly on the characters being edited, and the caret, the
 * selection and every native editing behaviour stay the browser's own.
 */
const CodeField = ({
  value,
  onChange,
  placeholder = "Enter JavaScript",
  ariaLabel,
}: {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  ariaLabel?: string
}) => {
  const highlightRef = useRef<HTMLPreElement | null>(null)
  const highlighted = useMemo(() => highlightJavascript(value), [value])

  return (
    <div className="code-field">
      <pre
        ref={highlightRef}
        className="code-field-highlight"
        aria-hidden
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      <textarea
        className="code-field-area"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => {
          // The painted layer does not scroll itself; it is moved to match.
          if (highlightRef.current) {
            highlightRef.current.scrollTop = event.currentTarget.scrollTop
            highlightRef.current.scrollLeft = event.currentTarget.scrollLeft
          }
        }}
      />
    </div>
  )
}

export default CodeField
