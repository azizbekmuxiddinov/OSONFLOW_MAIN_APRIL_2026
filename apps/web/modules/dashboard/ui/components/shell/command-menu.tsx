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
          hint: area.label,
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
        className="top-[18%] max-w-[560px] translate-y-0 gap-0 overflow-hidden p-0 sm:rounded-xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search and actions</DialogTitle>
        <div className="flex items-center gap-2.5 border-b border-[var(--console-hairline-soft)] px-4">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            aria-label="Search pages, conversations and actions"
            autoFocus
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, conversations and actions…"
            value={query}
          />
          <kbd className="rounded border border-[var(--console-hairline)] px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Esc
          </kbd>
        </div>

        <div className="max-h-[min(420px,60vh)] overflow-y-auto p-1.5" ref={listRef}>
          {groups.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {search.length >= 2 && conversations.isLoading
                ? "Searching…"
                : "Nothing matches that."}
            </p>
          ) : (
            groups.map(({ group, items: groupItems }) => (
              <div className="pb-1" key={group}>
                <p className="px-2.5 pt-2 pb-1 text-[11px] font-medium text-muted-foreground">
                  {group}
                </p>
                {groupItems.map((item) => {
                  runningIndex += 1
                  const index = runningIndex
                  const isActive = index === safeIndex

                  return (
                    <button
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px]",
                        isActive ? "bg-muted text-foreground" : "text-foreground/85"
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
                        <item.icon className="size-4 shrink-0 text-muted-foreground" />
                      ) : null}
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                        {item.hint ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.hint}
                          </span>
                        ) : null}
                      </span>
                      {isActive ? (
                        <CornerDownLeftIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--console-hairline-soft)] px-4 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span className="ml-auto">⌘K anywhere</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
