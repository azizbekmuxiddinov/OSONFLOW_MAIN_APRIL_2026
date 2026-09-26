"use client"

import { useLanguage } from "@/lib/i18n/language-provider"
import type { Language } from "@/lib/i18n/translations"

// Browsers ship incomplete Uzbek date data (Chrome renders "2026 M08 28"), so
// Uzbek dates are written out by hand in the usual "2026-yil 28-avgust" form.
const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
]

const formatDate = (iso: string, language: Language) => {
  // The ISO date is a calendar day; reading it in the visitor's own timezone
  // would show the day before anywhere west of UTC.
  const date = new Date(iso)

  if (language === "uz") {
    return `${date.getUTCFullYear()}-yil ${date.getUTCDate()}-${UZ_MONTHS[date.getUTCMonth()]}`
  }

  return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/**
 * A policy date written the way the visitor's language writes dates. The page
 * translator works on fixed strings, so a date has to be formatted here rather
 * than looked up; `translate="no"` keeps the translator from touching it.
 */
export const LegalDate = ({ iso }: { iso: string }) => {
  const { language } = useLanguage()

  return (
    <time dateTime={iso} translate="no">
      {formatDate(iso, language)}
    </time>
  )
}
