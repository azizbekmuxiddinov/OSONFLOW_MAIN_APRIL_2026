"use client"

import { OrganizationSwitcher, UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { useMutation, useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { ArrowRightIcon, MenuIcon, SearchIcon } from "lucide-react"

import { Hint } from "@workspace/ui/components/hint"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { LanguageSwitcher } from "@/components/i18n/language-switcher"
import { useConversationView } from "../../hooks/use-conversation-view"
import { DashboardThemeToggle } from "../dashboard-theme-toggle"
import { CommandMenu } from "./command-menu"
import { ShortcutsDialog } from "./shortcuts-dialog"
import {
  NAV_AREAS,
  areaForPath,
  type NavArea,
  type NavItem,
} from "./navigation"

/** One easing and one spring for everything the shell moves. */
const EASE_OUT = [0.16, 1, 0.3, 1] as const
const PILL_SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 42,
  mass: 0.8,
} as const

/**
 * The dashboard frame, laid out the way Intercom's is: a narrow rail of areas
 * on a warm grey canvas, a sidebar listing the current area's pages, and the
 * page itself in a white panel floating beside them.
 */

const SUBNAV_STORAGE_KEY = "osonflow-subnav-open"
const SUBNAV_EVENT = "osonflow-subnav-change"

// Whether the area sidebar is open, remembered per browser. Read through
// useSyncExternalStore so the server render (always open) and the browser's
// stored choice reconcile without a flash of the wrong layout.
let subnavFallback = true

const readSubnavOpen = () => {
  try {
    const stored = window.localStorage.getItem(SUBNAV_STORAGE_KEY)
    return stored === null ? subnavFallback : stored === "true"
  } catch {
    return subnavFallback
  }
}

const writeSubnavOpen = (open: boolean) => {
  subnavFallback = open
  try {
    window.localStorage.setItem(SUBNAV_STORAGE_KEY, String(open))
  } catch {
    // Storage can be blocked; the choice then lasts until the page reloads.
  }
  window.dispatchEvent(new Event(SUBNAV_EVENT))
}

const subscribeToSubnav = (onChange: () => void) => {
  window.addEventListener(SUBNAV_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(SUBNAV_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

type ShellContextValue = {
  hasSubnav: boolean
  isSubnavOpen: boolean
  toggleSubnav: () => void
}

const ShellContext = createContext<ShellContextValue>({
  hasSubnav: false,
  isSubnavOpen: false,
  toggleSubnav: () => {},
})

export const useShell = () => useContext(ShellContext)

const organizationSwitcherAppearance = {
  elements: {
    rootBox: "flex! justify-center!",
    organizationSwitcherTrigger:
      "p-1! rounded-lg! hover:bg-[var(--canvas-strong)]! focus:shadow-none!",
    organizationPreview: "gap-0!",
    organizationPreviewTextContainer: "hidden!",
    organizationSwitcherTriggerIcon: "hidden!",
    avatarBox: "size-7! rounded-lg!",
  },
}

const sheetOrganizationSwitcherAppearance = {
  elements: {
    rootBox: "w-full!",
    organizationSwitcherTrigger: "w-full! justify-start! px-2! py-1.5!",
    avatarBox: "size-6! rounded-md!",
  },
}

const userButtonAppearance = {
  elements: {
    avatarBox: "size-7!",
  },
}

/** Pages that need the whole width: the workflow canvas. */
const isFullBleed = (pathname: string) =>
  /^\/workflows\/(?!$)[^/]+/.test(pathname)

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const area = areaForPath(pathname)
  const { isLoaded, orgId } = useAuth()
  const hasOrganization = isLoaded && Boolean(orgId)

  const isSubnavOpen = useSyncExternalStore(
    subscribeToSubnav,
    readSubnavOpen,
    () => true
  )
  const toggleSubnav = useCallback(() => {
    writeSubnavOpen(!readSubnavOpen())
  }, [])

  // ⌘K / Ctrl+K opens search and actions from anywhere in the dashboard.
  // "?" shows every shortcut.
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setIsCommandOpen((open) => !open)
        return
      }

      const target = event.target as HTMLElement | null
      const isTyping =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"

      if (event.key === "?" && !isTyping) {
        event.preventDefault()
        setIsShortcutsOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // The phone menu closes whenever the page changes.
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [menuPathname, setMenuPathname] = useState(pathname)
  if (menuPathname !== pathname) {
    setMenuPathname(pathname)
    setIsMobileNavOpen(false)
  }

  // ── counts shown on the rail and in the area sidebars ──────────────────
  const conversationUnread = useQuery(
    api.private.conversations.getUnreadSummary,
    hasOrganization ? {} : "skip"
  )
  const voiceUnread = useQuery(
    api.private.aiConversations.getUnreadSummary,
    hasOrganization ? {} : "skip"
  )
  const onboarding = useQuery(
    api.private.onboarding.getStatus,
    hasOrganization ? {} : "skip"
  )
  const learning = useQuery(
    api.private.learning.counts,
    hasOrganization ? {} : "skip"
  )
  const markConversationsRead = useMutation(
    api.private.conversations.markAllAsRead
  )
  const markVoiceRead = useMutation(api.private.aiConversations.markAllAsRead)

  const conversationUnreadCount =
    conversationUnread?.unreadConversationCount ?? 0
  const voiceUnreadCount = voiceUnread?.unreadConversationCount ?? 0
  const answersWaiting =
    (learning?.suggested ?? 0) + (learning?.needsAnswer ?? 0)

  // Opening a list counts as having seen what was new in it.
  useEffect(() => {
    if (!hasOrganization) {
      return
    }

    if (pathname.startsWith("/conversations") && conversationUnreadCount > 0) {
      void markConversationsRead({})
    }

    if (pathname.startsWith("/ai-conversations") && voiceUnreadCount > 0) {
      void markVoiceRead({})
    }
  }, [
    conversationUnreadCount,
    hasOrganization,
    markConversationsRead,
    markVoiceRead,
    pathname,
    voiceUnreadCount,
  ])

  const counts: Record<string, number> = {
    "/conversations": pathname.startsWith("/conversations")
      ? 0
      : conversationUnreadCount,
    "/ai-conversations": pathname.startsWith("/ai-conversations")
      ? 0
      : voiceUnreadCount,
    "/teach": answersWaiting,
  }

  const setup =
    onboarding && !onboarding.isSetupComplete
      ? {
          done: onboarding.completedCount,
          total: onboarding.totalCount,
        }
      : null

  const hasSubnav = area.sections.length > 0 && !isFullBleed(pathname)
  const showSubnav = hasSubnav && isSubnavOpen

  // A new page settles in rather than snapping: a short fade and a 4px rise
  // each time the top-level page changes. Moving inside a page (opening a
  // conversation, a workflow) does not replay it.
  const pageRef = useRef<HTMLElement>(null)
  const pageKey = pathname.split("/")[1] ?? ""
  useEffect(() => {
    const node = pageRef.current
    if (
      !node ||
      typeof node.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    node.animate(
      [
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 240, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    )
  }, [pageKey])

  return (
    <ShellContext.Provider value={{ hasSubnav, isSubnavOpen, toggleSubnav }}>
      <MotionConfig reducedMotion="user">
        <div className="dash-shell flex h-svh w-full overflow-hidden bg-[var(--canvas)] text-foreground">
          {/* ── rail ─────────────────────────────────────────────────────── */}
          <nav
            aria-label="Areas"
            className="hidden w-[52px] shrink-0 flex-col items-center gap-1 py-2.5 md:flex"
          >
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/organization-created"
              appearance={organizationSwitcherAppearance}
              createOrganizationMode="navigation"
              createOrganizationUrl="/create-organization"
              hidePersonal
              organizationProfileMode="navigation"
              organizationProfileUrl="/organization-settings"
              skipInvitationScreen
            />
            <div className="my-1.5 h-px w-6 bg-[var(--console-hairline)]" />
            {NAV_AREAS.filter((item) => !item.bottom).map((item) => (
              <RailLink
                active={item.id === area.id}
                area={item}
                dot={
                  item.id === "inbox"
                    ? conversationUnreadCount + voiceUnreadCount > 0
                    : item.id === "assistant"
                      ? answersWaiting > 0
                      : false
                }
                key={item.id}
              />
            ))}

            <div className="mt-auto flex flex-col items-center gap-1">
              <Hint align="center" keys={["⌘", "K"]} side="right" text="Search">
                <button
                  aria-label="Search and actions"
                  className="dash-rail-item flex size-9 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-[var(--canvas-strong)] hover:text-foreground"
                  onClick={() => setIsCommandOpen(true)}
                  type="button"
                >
                  <SearchIcon className="size-[18px]" />
                </button>
              </Hint>
              <LanguageSwitcher
                className="size-8 min-w-8 rounded-lg border-0 bg-transparent px-0 text-[10px] text-muted-foreground hover:bg-[var(--canvas-strong)]"
                compact
                display="code"
              />
              <DashboardThemeToggle />
              {NAV_AREAS.filter((item) => item.bottom).map((item) => (
                <RailLink
                  active={item.id === area.id}
                  area={item}
                  key={item.id}
                />
              ))}
              <div className="mt-1.5">
                <UserButton
                  appearance={userButtonAppearance}
                  userProfileMode="navigation"
                  userProfileUrl="/account"
                />
              </div>
            </div>
          </nav>

          {/* ── area sidebar ─────────────────────────────────────────────── */}
          {/* The sidebar slides shut rather than vanishing; its contents keep
            their width so the labels never reflow while it moves. */}
          <AnimatePresence initial={false}>
            {showSubnav ? (
              <motion.aside
                animate={{ width: 232, opacity: 1 }}
                className="hidden shrink-0 overflow-hidden md:block"
                exit={{ width: 0, opacity: 0 }}
                initial={{ width: 0, opacity: 0 }}
                key="subnav"
                transition={{ duration: 0.26, ease: EASE_OUT }}
              >
                <div className="flex h-full w-[232px] flex-col py-2.5 pr-2">
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    className="flex min-h-0 flex-1 flex-col"
                    initial={{ opacity: 0, x: -6 }}
                    key={area.id}
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                  >
                    <AreaNav area={area} counts={counts} pillId="subnav-pill" />
                  </motion.div>
                  {setup ? <SetupCard setup={setup} /> : null}
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>

          {/* ── page ─────────────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col md:py-2 md:pr-2">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--console-hairline-soft)] bg-background px-3 md:hidden">
              <button
                aria-label="Open menu"
                className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
                onClick={() => setIsMobileNavOpen(true)}
                type="button"
              >
                <MenuIcon className="size-4" />
              </button>
              <span className="truncate text-sm font-medium">{area.label}</span>
              <div className="ml-auto flex items-center gap-1">
                <DashboardThemeToggle />
                <UserButton appearance={userButtonAppearance} />
              </div>
            </header>

            <main
              className="dash-page relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-[14px]"
              id="main"
              ref={pageRef}
            >
              {children}
            </main>
          </div>
        </div>
      </MotionConfig>

      <CommandMenu
        onOpenChange={setIsCommandOpen}
        onShowShortcuts={() => setIsShortcutsOpen(true)}
        open={isCommandOpen}
      />
      <ShortcutsDialog
        onOpenChange={setIsShortcutsOpen}
        open={isShortcutsOpen}
      />

      {/* ── phone menu: every area at once ─────────────────────────────── */}
      <Sheet onOpenChange={setIsMobileNavOpen} open={isMobileNavOpen}>
        <SheetContent
          className="w-[min(86vw,320px)] gap-0 overflow-y-auto bg-[var(--canvas)] p-3"
          side="left"
        >
          <SheetHeader className="p-0 pb-2">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/organization-created"
              appearance={sheetOrganizationSwitcherAppearance}
              createOrganizationMode="navigation"
              createOrganizationUrl="/create-organization"
              hidePersonal
              organizationProfileMode="navigation"
              organizationProfileUrl="/organization-settings"
              skipInvitationScreen
            />
          </SheetHeader>
          <div className="flex flex-col gap-4">
            {NAV_AREAS.map((item) =>
              item.sections.length ? (
                <AreaNav area={item} counts={counts} key={item.id} compact />
              ) : (
                <NavLink
                  active={pathname.startsWith(item.href)}
                  count={0}
                  item={{ title: item.label, url: item.href, icon: item.icon }}
                  key={item.id}
                />
              )
            )}
            <LanguageSwitcher compact display="name" />
          </div>
        </SheetContent>
      </Sheet>
    </ShellContext.Provider>
  )
}

/* ── rail item ──────────────────────────────────────────────────────────── */

const RailLink = ({
  area,
  active,
  dot = false,
}: {
  area: NavArea
  active: boolean
  dot?: boolean
}) => (
  <Hint align="center" side="right" text={area.label}>
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={area.label}
      className={cn(
        "dash-rail-item relative flex size-9 items-center justify-center rounded-[10px]",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:bg-[var(--canvas-strong)] hover:text-foreground"
      )}
      href={area.href}
    >
      {/* One white tile that glides between areas instead of blinking. */}
      {active ? (
        <motion.span
          className="dash-pill absolute inset-0 rounded-[10px]"
          layoutId="rail-pill"
          transition={PILL_SPRING}
        />
      ) : null}
      <area.icon
        className="relative size-[18px]"
        strokeWidth={active ? 2.1 : 1.8}
      />
      {dot ? (
        <span className="dash-dot absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--console-critical)] ring-2 ring-[var(--canvas)]" />
      ) : null}
    </Link>
  </Hint>
)

/* ── area sidebar ───────────────────────────────────────────────────────── */

const AreaNav = ({
  area,
  counts,
  compact = false,
  pillId,
}: {
  area: NavArea
  counts: Record<string, number>
  compact?: boolean
  /** Shared id for the active tile, so it slides between items. */
  pillId?: string
}) => {
  const pathname = usePathname()
  const { view, setView } = useConversationView()

  const isItemActive = (item: NavItem) => {
    if (item.view) {
      return pathname.startsWith("/conversations") && view === item.view
    }

    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        !compact && "flex-1 overflow-y-auto"
      )}
    >
      <p
        className={cn(
          "px-2.5 font-semibold tracking-[-0.015em]",
          compact ? "pb-1 text-sm" : "pt-1.5 pb-3.5 text-[1.0625rem]"
        )}
      >
        {area.label}
      </p>
      <div className="flex flex-col gap-3">
        {area.sections.map((section, index) => (
          <div className="flex flex-col gap-px" key={section.label ?? index}>
            {section.label ? (
              <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-[0.01em] text-muted-foreground/90">
                {section.label}
              </p>
            ) : null}
            {section.items.map((item) => (
              <NavLink
                active={isItemActive(item)}
                count={
                  item.view
                    ? item.view === "all"
                      ? (counts["/conversations"] ?? 0)
                      : 0
                    : (counts[item.url] ?? 0)
                }
                item={item}
                key={`${item.url}-${item.view ?? item.title}`}
                pillId={pillId}
                onSelect={item.view ? () => setView(item.view!) : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const NavLink = ({
  item,
  active,
  count,
  onSelect,
  pillId,
}: {
  item: NavItem
  active: boolean
  count: number
  onSelect?: () => void
  pillId?: string
}) => (
  <Link
    aria-current={active ? "page" : undefined}
    className={cn(
      "dash-nav-item group/nav relative flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px]",
      active
        ? "font-medium text-foreground"
        : "text-foreground/75 hover:bg-[var(--canvas-strong)] hover:text-foreground",
      active && !pillId && "dash-pill"
    )}
    href={item.url}
    onClick={onSelect}
  >
    {active && pillId ? (
      <motion.span
        className="dash-pill absolute inset-0 rounded-lg"
        layoutId={pillId}
        transition={PILL_SPRING}
      />
    ) : null}
    <item.icon
      className={cn(
        "relative size-4 shrink-0 transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground group-hover/nav:text-foreground/80"
      )}
      strokeWidth={1.8}
    />
    <span className="relative min-w-0 flex-1 truncate">{item.title}</span>
    {count > 0 ? (
      <span className="relative inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)] px-1.5 text-[10.5px] leading-none font-semibold text-white tabular-nums">
        {count > 99 ? "99+" : count}
      </span>
    ) : null}
  </Link>
)

/* ── setup card, Intercom's "Get set up" ────────────────────────────────── */

const SetupCard = ({ setup }: { setup: { done: number; total: number } }) => (
  <Link
    className="dash-setup group/setup mt-3 block rounded-xl px-3.5 py-3 text-white"
    href="/start"
  >
    <span className="flex items-center gap-2.5">
      <SetupRing done={setup.done} total={setup.total} />
      <span className="text-[13px] font-semibold">Get set up</span>
      <span className="ml-auto text-[11px] font-medium text-white/55 tabular-nums">
        {setup.done}/{setup.total}
      </span>
      <ArrowRightIcon className="size-3.5 text-white/60 transition-transform duration-200 ease-out group-hover/setup:translate-x-0.5 group-hover/setup:text-white" />
    </span>
    <span className="mt-1.5 block text-xs leading-snug text-white/65">
      Finish the last steps so your assistant can answer customers.
    </span>
  </Link>
)

const SetupRing = ({ done, total }: { done: number; total: number }) => {
  const radius = 7
  const circumference = 2 * Math.PI * radius
  const progress = total ? done / total : 0

  return (
    <svg aria-hidden className="size-[18px] -rotate-90" viewBox="0 0 18 18">
      <circle
        cx="9"
        cy="9"
        fill="none"
        r={radius}
        stroke="rgb(255 255 255 / 0.2)"
        strokeWidth="2.5"
      />
      <circle
        cx="9"
        cy="9"
        fill="none"
        r={radius}
        stroke="#4ade80"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        strokeWidth="2.5"
      />
    </svg>
  )
}
