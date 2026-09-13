"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { readConsent, writeConsent } from "@/lib/consent"

export const CookieConsent = () => {
  // Undecided visitors see the notice, but only after mount: rendering it on the
  // server would flash it at people who already answered.
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (readConsent() === null) {
      setIsOpen(true)
    }
  }, [])

  const decide = (analytics: boolean) => {
    writeConsent(analytics)
    setIsOpen(false)
  }

  if (!isOpen) {
    return null
  }

  return (
    // Not a modal: it must not trap focus or block the page, because nothing
    // non-essential is loaded until the visitor answers.
    <aside
      aria-labelledby="cookie-consent-heading"
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-lg border bg-card p-5 text-card-foreground shadow-lg sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold" id="cookie-consent-heading">
            Cookies on Osonflow
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            We use only the cookies needed to sign you in and remember your
            language. We do not run advertising or tracking cookies. If we ever
            add analytics, this choice decides whether they load.{" "}
            <Link
              className="font-bold text-foreground underline underline-offset-4"
              href="/privacy"
            >
              Read the privacy policy
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-none gap-2">
          <button
            className="rounded-md border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => decide(false)}
            type="button"
          >
            Essential only
          </button>
          <button
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => decide(true)}
            type="button"
          >
            Accept all
          </button>
        </div>
      </div>
    </aside>
  )
}
