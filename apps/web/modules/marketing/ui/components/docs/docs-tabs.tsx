"use client"

import { BookOpenIcon, BracesIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// The two halves of the documentation. The product guide is for the people who
// run Osonflow day to day; the API reference is for the developers who build
// on it. Both pages open with this switcher so either is one click away.
const DOCS_TABS = [
  { href: "/docs", label: "Docs", icon: BookOpenIcon },
  { href: "/docs/api", label: "API", icon: BracesIcon },
] as const

export const DocsHeroTabs = () => {
  const pathname = usePathname()

  return (
    <nav aria-label="Documentation sections" className="docs-tabs">
      {DOCS_TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className="docs-tabs__tab"
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="docs-tabs__icon" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
