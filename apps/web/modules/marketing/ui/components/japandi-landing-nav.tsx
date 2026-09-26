"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { UserButton, useOrganization, useUser } from "@clerk/nextjs"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDownIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { appPath } from "@/lib/urls"
import { NavMegaPanel, menuLinks, type NavMenuId } from "./japandi-nav-menus"

type NavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "menu"; id: NavMenuId; label: string }

const NAV_ITEMS: NavItem[] = [
  { kind: "menu", id: "platform", label: "Platform" },
  { kind: "link", href: "#loop", label: "How it works" },
  { kind: "link", href: "#experience", label: "Live demo" },
  { kind: "link", href: "#pricing", label: "Pricing" },
  { kind: "menu", id: "resources", label: "Resources" },
]

// Hover-intent timings. The panel opens a beat after the pointer arrives so a
// cursor passing over the bar on its way somewhere else doesn't flash it, and
// closes a beat after it leaves so crossing the gap into the panel is safe.
const OPEN_DELAY_MS = 60
const CLOSE_DELAY_MS = 160

// The nav points at sections of the landing page. On a secondary page (docs,
// privacy, terms, 404) a bare "#pricing" resolves to nothing, so section links
// are made absolute there. On "/" they stay bare hashes, leaving the existing
// smooth-scroll behaviour untouched. Page links ("/docs") pass through.
const useResolveHref = () => {
  const pathname = usePathname()
  const isLanding = pathname === "/"

  return useCallback(
    (href: string) => (href.startsWith("#") && !isLanding ? "/" + href : href),
    [isLanding]
  )
}

function SignedOutNav({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  return (
    <>
      <Link
        className={mobile ? "nav__mobile-auth-link" : "link-quiet"}
        href={appPath("/sign-in")}
        onClick={onNavigate}
      >
        Sign in
      </Link>
      <Link
        className={
          mobile
            ? "btn btn--primary btn--block nav__mobile-cta"
            : "btn btn--primary btn--sm"
        }
        href={appPath("/sign-up")}
        onClick={onNavigate}
      >
        Sign up
      </Link>
    </>
  )
}

function SignedInNav({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const { isLoaded: isOrgLoaded, organization } = useOrganization()
  const dashboardHref =
    isOrgLoaded && !organization
      ? appPath("/org-selection")
      : appPath("/analytics")

  if (mobile) {
    return (
      <>
        <Link
          className="btn btn--primary btn--block nav__mobile-cta"
          href={dashboardHref}
          onClick={onNavigate}
        >
          Open dashboard
        </Link>
        <div className="nav__user">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <Link className="btn btn--primary btn--sm" href={dashboardHref}>
        Open dashboard
      </Link>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    </>
  )
}

function NavAuthActions({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded || !isSignedIn) {
    return <SignedOutNav mobile={mobile} onNavigate={onNavigate} />
  }

  return <SignedInNav mobile={mobile} onNavigate={onNavigate} />
}

export const JapandiLandingNav = () => {
  const resolve = useResolveHref()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<NavMenuId | null>(null)
  const timer = useRef<number | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const scheduleMenu = (next: NavMenuId | null, delay: number) => {
    clearTimer()
    timer.current = window.setTimeout(() => setOpenMenu(next), delay)
  }

  const closeMenu = useCallback(() => {
    clearTimer()
    setOpenMenu(null)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!openMenu) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        headerRef.current
          ?.querySelector<HTMLButtonElement>(`[data-menu-trigger="${openMenu}"]`)
          ?.focus()
        closeMenu()
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeMenu()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [openMenu, closeMenu])

  useEffect(() => clearTimer, [])

  return (
    <>
      <header
        className={`nav${isScrolled ? " is-scrolled" : ""}${isOpen ? " is-open" : ""}${openMenu ? " has-menu" : ""}`}
        id="nav"
        ref={headerRef}
      >
        <div className="nav__shell">
          <div className="nav__capsule">
            <div className="nav__brand-chip">
              <Link className="brand" href="/" aria-label="Osonflow home">
                <span className="brand__mark" aria-hidden="true">
                  <Image
                    alt=""
                    className="brand__img"
                    height={30}
                    src="/landing/assets/logo-mark.png"
                    width={30}
                  />
                </span>
                <span className="brand__name">Osonflow</span>
              </Link>
            </div>

            <nav aria-label="Primary" className="nav__links">
              <div className="nav__menu" id="navMenu">
                {NAV_ITEMS.map((item) =>
                  item.kind === "menu" ? (
                    <button
                      aria-controls="navMega"
                      aria-expanded={openMenu === item.id}
                      className="nav__trigger"
                      data-menu-trigger={item.id}
                      key={item.id}
                      onClick={() => {
                        clearTimer()
                        setOpenMenu((current) =>
                          current === item.id ? null : item.id
                        )
                      }}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") {
                          scheduleMenu(item.id, openMenu ? 0 : OPEN_DELAY_MS)
                        }
                      }}
                      onPointerLeave={(event) => {
                        if (event.pointerType === "mouse") {
                          scheduleMenu(null, CLOSE_DELAY_MS)
                        }
                      }}
                      type="button"
                    >
                      {item.label}
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="nav__chevron"
                      />
                    </button>
                  ) : (
                    <Link
                      href={resolve(item.href)}
                      key={item.href}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse" && openMenu) {
                          scheduleMenu(null, CLOSE_DELAY_MS)
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            </nav>

            <div className="nav__actions">
              <div className="nav__lang">
                <LanguageSwitcher className="nav__lang-switch" compact display="code" />
              </div>
              <div className="nav__auth">
                <NavAuthActions />
              </div>
              <button
                aria-expanded={isOpen}
                aria-label="Toggle menu"
                className="nav__toggle"
                id="navToggle"
                onClick={() => setIsOpen((open) => !open)}
                type="button"
              >
                <span />
                <span />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {openMenu ? (
              <motion.div
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="nav-mega"
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                id="navMega"
                initial={{ opacity: 0, y: -8, scale: 0.985 }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") {
                    clearTimer()
                  }
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") {
                    scheduleMenu(null, CLOSE_DELAY_MS)
                  }
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={openMenu}
                    transition={{ duration: 0.16 }}
                  >
                    <NavMegaPanel
                      id={openMenu}
                      onNavigate={closeMenu}
                      resolve={resolve}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              aria-label="Close menu"
              className="nav__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              type="button"
            />
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="nav__mobile"
              exit={{ opacity: 0, y: -12 }}
              id="navMobile"
              initial={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {NAV_ITEMS.map((item) =>
                item.kind === "menu" ? (
                  <details className="nav__mobile-group" key={item.id}>
                    <summary>
                      {item.label}
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="nav__chevron"
                      />
                    </summary>
                    <div className="nav__mobile-sub">
                      {menuLinks(item.id).map((link) => (
                        <Link
                          href={resolve(link.href)}
                          key={link.href}
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    href={resolve(item.href)}
                    key={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="nav__mobile-lang">
                <LanguageSwitcher compact display="code" />
              </div>
              <div className="nav__mobile-actions">
                <NavAuthActions mobile onNavigate={() => setIsOpen(false)} />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
