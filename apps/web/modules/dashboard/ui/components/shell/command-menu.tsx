"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePaginatedQuery } from "convex/react"
import { useTheme } from "next-themes"
import { api } from "@workspace/backend/_generated/api"
import {
  CompassIcon,
  CornerDownLeftIcon,
  ExternalLinkIcon,
  KeyboardIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@workspace/ui/components/dialog"
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar"
import { richMessagePreview } from "@workspace/ui/components/ai/rich-message"
import { cn } from "@workspace/ui/lib/utils"

import {
  useConversationView,
  type ConversationView,
} from "../../hooks/use-conversation-view"
import { NAV_AREAS } from "./navigation"

/**
 * ⌘K, the way Intercom's "Search actions" bar works: type to jump to any page
 * or inbox view, find a conversation by the customer's name or words in it,
 * or run a common action — all without leaving the keyboard.
 */

type CommandItem = {
  id: string
  group: "Conversations" | "Go to" | "Actions"
  label: string
  hint?: string
  icon?: LucideIcon
  avatarSeed?: string
  keywords?: string
  run: () => void
}

const normalize = (value: string) => value.toLowerCase().trim()

export const CommandMenu = ({
  open,
  onOpenChange,
  onShowShortcuts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShowShortcuts: () => void
}) => {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { setView } = useConversationView()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const search = normalize(query)
  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    open && search.length >= 2 ? { searchQuery: search } : "skip",
    { initialNumItems: 5 }
  )

  const close = () => onOpenChange(false)

  const go = (url: string, view?: ConversationView) => {
    if (view) {
      setView(view)
    }
    router.push(url)
    close()
  }

  const navigationItems = useMemo<CommandItem[]>(() => {
    const seen = new Set<string>()
    const items: CommandItem[] = []

    for (const area of NAV_AREAS) {
      const pages = area.sections.length
        ? area.sections.flatMap((section) => section.items)
        : [{ title: area.label, url: area.href, icon: area.icon }]

      for (const page of pages) {
        const key = `${page.url}|${"view" in page ? (page.view ?? "") : ""}`
        if (seen.has(key)) continue
        seen.add(key)
        items.push({
          id: `go-${key}`,
          group: "Go to",
          label: page.title,
          hint: area.label === page.title ? undefined : area.label,
          icon: page.icon,
          keywords: `${area.label} ${page.title}`,
          run: () => go(page.url, "view" in page ? page.view : undefined),
        })
      }
    }

    return items
    // `go` only closes over stable setters and the router.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const actionItems: CommandItem[] = [
    {
      id: "action-new-workflow",
      group: "Actions",
      label: "Create a workflow",
      icon: PlusIcon,
      keywords: "new flow automation",
      run: () => go("/workflows/new"),
    },
    {
      id: "action-add-knowledge",
      group: "Actions",
      label: "Add knowledge",
      hint: "Files, web pages, FAQs",
      icon: PlusIcon,
      keywords: "upload document website source train",
      run: () => go("/files"),
    },
    {
      id: "action-preview-widget",
      group: "Actions",
      label: "Preview your widget",
      icon: ExternalLinkIcon,
      keywords: "chat test open",
      run: () => {
        window.open("/widget-preview", "_blank")
        close()
      },
    },
    {
      id: "action-setup-guide",
      group: "Actions",
      label: "Open the setup guide",
      icon: CompassIcon,
      keywords: "getting started onboarding steps",
      run: () => go("/start"),
    },
    {
      id: "action-shortcuts",
      group: "Actions",
      label: "Keyboard shortcuts",
      icon: KeyboardIcon,
      keywords: "keys hotkeys help",
      run: () => {
        close()
        onShowShortcuts()
      },
    },
    {
      id: "action-theme",
      group: "Actions",
      label:
        resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      icon: MoonIcon,
      keywords: "theme dark light appearance",
      run: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        close()
      },
    },
  ]

  const conversationItems: CommandItem[] =
    search.length >= 2
      ? conversations.results.map((conversation) => ({
          id: `conversation-${conversation._id}`,
          group: "Conversations",
          label: conversation.contactSession.name,
          hint: richMessagePreview(
            conversation.searchMatchPreview ??
              conversation.lastMessage?.text ??
              ""
          ),
          avatarSeed: conversation.contactSession._id,
          run: () => go(`/conversations/${conversation._id}`),
        }))
      : []

  const matches = (item: CommandItem) =>
    !search ||
    normalize(`${item.label} ${item.keywords ?? ""} ${item.hint ?? ""}`).includes(
      search
    )

  const items = [
    ...conversationItems,
    ...navigationItems.filter(matches),
    ...actionItems.filter(matches),
  ]
  const groups = (["Conversations", "Go to", "Actions"] as const)
    .map((group) => ({
      group,
      items: items.filter((item) => item.group === group),
    }))
    .filter((group) => group.items.length)

  const safeIndex = Math.min(activeIndex, Math.max(0, items.length - 1))

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${safeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [safeIndex])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("")
      setActiveIndex(0)
    }
    onOpenChange(next)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, items.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      items[safeIndex]?.run()
    }
  }

  let runningIndex = -1

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className="top-[15%] max-w-[calc(100%-2rem)] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-[620px]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search and actions</DialogTitle>
        <div className="flex items-center gap-3 border-b border-foreground/[0.07] px-4">
          <SearchIcon className="size-[18px] shrink-0 text-muted-foreground" />
          <input
            aria-label="Search pages, conversations and actions"
            autoFocus
            className="h-[52px] min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/80"
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, conversations and actions…"
            value={query}
          />
          <Key>Esc</Key>
        </div>

        <div
          className="max-h-[min(440px,58vh)] scroll-py-1.5 overflow-y-auto p-1.5"
          ref={listRef}
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <SearchIcon className="size-4" />
              </span>
              <p className="text-[13px] text-muted-foreground">
                {search.length >= 2 && conversations.isLoading
                  ? "Searching…"
                  : "Nothing matches that."}
              </p>
            </div>
          ) : (
            groups.map(({ group, items: groupItems }) => (
              <div className="pb-1" key={group}>
                <p className="px-2.5 pt-2.5 pb-1.5 text-[11px] font-medium text-muted-foreground">
                  {group}
                </p>
                {groupItems.map((item) => {
                  runningIndex += 1
                  const index = runningIndex
                  const isActive = index === safeIndex

                  return (
                    <button
                      className={cn(
                        "flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[13px] outline-none",
                        isActive
                          ? "bg-foreground/[0.06] text-foreground"
                          : "text-foreground/80"
                      )}
                      data-index={index}
                      key={item.id}
                      onClick={item.run}
                      onMouseMove={() => setActiveIndex(index)}
                      type="button"
                    >
                      {item.avatarSeed ? (
                        <DicebearAvatar seed={item.avatarSeed} size={20} />
                      ) : item.icon ? (
                        <item.icon
                          className={cn(
                            "size-4 shrink-0",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                          strokeWidth={1.8}
                        />
                      ) : null}
                      <span className="shrink-0 truncate font-medium">
                        {item.label}
                      </span>
                      {item.hint ? (
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                          {item.hint}
                        </span>
                      ) : (
                        <span className="flex-1" />
                      )}
                      <CornerDownLeftIcon
                        className={cn(
                          "size-3.5 shrink-0 text-muted-foreground transition-opacity duration-100",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-foreground/[0.07] bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Key>↑</Key>
            <Key>↓</Key>
            to move
          </span>
          <span className="flex items-center gap-1.5">
            <Key>↵</Key>
            to open
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Key>⌘</Key>
            <Key>K</Key>
            anywhere
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-background px-1 font-sans text-[10px] font-medium text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_0_rgb(0_0_0/0.08)] dark:bg-white/10 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
    {children}
  </kbd>
)
