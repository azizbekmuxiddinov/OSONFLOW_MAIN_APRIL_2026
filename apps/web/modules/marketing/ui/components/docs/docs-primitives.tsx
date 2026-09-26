"use client"

import { Fragment, useEffect, useState, type ReactNode } from "react"

import { copyTextToClipboard } from "@/lib/clipboard"
import { tokenize } from "../api-docs/samples"

// The building blocks both documentation pages share — the product guide at
// /docs and the API reference at /docs/api — so the two read as one site.
// Styles live in api-docs/api-docs.css.

export const Code = ({ children }: { children: ReactNode }) => (
  <code className="api-docs__inline" translate="no">
    {children}
  </code>
)

export const Highlighted = ({ code }: { code: string }) => (
  <pre translate="no">
    <code>
      {tokenize(code).map((token, index) =>
        token.kind === "plain" ? (
          <Fragment key={index}>{token.text}</Fragment>
        ) : (
          <span data-token={token.kind} key={index}>
            {token.text}
          </span>
        )
      )}
    </code>
  </pre>
)

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  return (
    <button
      className="api-code__copy"
      onClick={async () => {
        if (await copyTextToClipboard(text)) {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        }
      }}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export const CodePanel = ({ title, code }: { title: string; code: string }) => (
  <div className="api-code">
    <div className="api-code__bar">
      <span className="api-code__title">{title}</span>
      <CopyButton text={code} />
    </div>
    <Highlighted code={code} />
  </div>
)

export const Table = ({
  head,
  rows,
  numeric = [],
}: {
  head: string[]
  rows: ReactNode[][]
  numeric?: number[]
}) => (
  <div className="api-docs__table-wrap">
    <table className="api-docs__table">
      <thead>
        <tr>
          {head.map((cell, index) => (
            <th
              className={numeric.includes(index) ? "num" : undefined}
              key={cell}
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, index) => (
              <td
                className={numeric.includes(index) ? "num" : undefined}
                key={index}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const Section = ({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
}) => (
  <section className="api-docs__section" data-docs-anchor id={id}>
    {/* Group names like "Get started" read as headings here, not as the
        call-to-action they are elsewhere on the site. */}
    <p className="api-docs__eyebrow" data-i18n-context="docs">
      {eyebrow}
    </p>
    <h2 className="api-docs__h2">{title}</h2>
    <div className="api-docs__prose">{children}</div>
  </section>
)

export const useActiveAnchor = (initial: string) => {
  const [active, setActive] = useState<string>(initial)

  useEffect(() => {
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>("[data-docs-anchor]")
    )

    if (!("IntersectionObserver" in window) || anchors.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: "-110px 0px -65% 0px" }
    )

    anchors.forEach((anchor) => observer.observe(anchor))
    return () => observer.disconnect()
  }, [])

  return active
}
