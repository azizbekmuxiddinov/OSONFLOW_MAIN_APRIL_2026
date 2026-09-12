"use client"

import { useEffect, useMemo, useRef } from "react"
import { highlightJavascript } from "../lib/highlight-javascript"

/**
 * The code step's editor, given the whole window.
 *
 * The inspector column is 468px wide, which is not enough for anything past a
 * few statements before every line wraps. This is the same textarea with room
 * to work in, plus the line gutter that makes a stack trace's line number mean
 * something.
 */
const CodeEditorModal = ({
  title,
  value,
  onChange,
  onClose,
}: {
  title: string
  value: string
  onChange: (next: string) => void
  onClose: () => void
}) => {
  const areaRef = useRef<HTMLTextAreaElement | null>(null)
  const gutterRef = useRef<HTMLPreElement | null>(null)
  const highlightRef = useRef<HTMLPreElement | null>(null)

  const highlighted = useMemo(() => highlightJavascript(value), [value])

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, value.split("\n").length)
    return Array.from({ length: count }, (_, index) => index + 1).join("\n")
  }, [value])

  useEffect(() => {
    areaRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <div
      className="code-editor-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} editor`}
      onClick={onClose}
    >
      <section
        className="code-editor"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="code-editor-header">
          <h2>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close editor"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="code-editor-body">
          <pre className="code-editor-gutter" ref={gutterRef} aria-hidden>
            {lineNumbers}
          </pre>
          {/*
            The colours are a <pre> sitting directly under a textarea whose own
            text is transparent. Both carry identical type metrics and padding,
            so the painted tokens land exactly on the characters being edited,
            and the caret and selection stay the browser's own.
          */}
          <div className="code-editor-stack">
            <pre
              ref={highlightRef}
              className="code-editor-highlight"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
            <textarea
              ref={areaRef}
              className="code-editor-area"
              spellCheck={false}
              value={value}
              placeholder="Enter JavaScript"
              onChange={(event) => onChange(event.target.value)}
              // The gutter and the highlight layer are separate elements, so
              // they have to be kept in step with the textarea by hand or the
              // numbers and colours drift as soon as the code scrolls.
              onScroll={(event) => {
                const { scrollTop, scrollLeft } = event.currentTarget

                if (gutterRef.current) {
                  gutterRef.current.scrollTop = scrollTop
                }

                if (highlightRef.current) {
                  highlightRef.current.scrollTop = scrollTop
                  highlightRef.current.scrollLeft = scrollLeft
                }
              }}
            />
          </div>
        </div>

        <footer className="code-editor-footer">
          <span>
            Runs server-side with a 2s limit. Read and write workflow state
            through <code>variables</code>, or return an object of values to
            set. Throwing takes the error branch.
          </span>
        </footer>
      </section>
    </div>
  )
}

export default CodeEditorModal
