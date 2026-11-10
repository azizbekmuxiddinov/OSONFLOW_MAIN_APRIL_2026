"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Kbd } from "@workspace/ui/components/kbd"

import { GO_TO_SHORTCUTS } from "./navigation"

/** Every shortcut in one place, opened with "?" the way Linear and Intercom do. */
const SHORTCUTS: {
  group: string
  /** A line under the heading saying how the group works. */
  note?: string
  /** Short rows that sit two to a line. */
  compact?: boolean
  items: { keys: string[]; label: string }[]
}[] = [
  {
    group: "Anywhere",
    items: [
      { keys: ["⌘", "K"], label: "Search pages, people, conversations and actions" },
      { keys: ["?"], label: "Show these shortcuts" },
    ],
  },
  {
    group: "Go to a page",
    note: "Press G, then the letter.",
    compact: true,
    items: GO_TO_SHORTCUTS.map((shortcut) => ({
      keys: ["G", shortcut.key.toUpperCase()],
      label: shortcut.title,
    })),
  },
  {
    group: "Inbox",
    items: [
      { keys: ["J"], label: "Next conversation" },
      { keys: ["K"], label: "Previous conversation" },
      { keys: ["/"], label: "Search the list" },
      { keys: ["Enter"], label: "Send a reply" },
      { keys: ["Shift", "Enter"], label: "New line in a reply" },
      { keys: ["/", "…"], label: "Insert a saved reply (in the reply box)" },
    ],
  },
]

export const ShortcutsDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => (
  <Dialog onOpenChange={onOpenChange} open={open}>
    <DialogContent className="gap-0 p-0 sm:max-w-[30rem] sm:rounded-xl">
      <DialogHeader className="border-b border-[var(--console-hairline-soft)] px-5 py-4 text-left">
        <DialogTitle className="text-base">Keyboard shortcuts</DialogTitle>
        <DialogDescription className="text-xs">
          Move around the dashboard without reaching for the mouse.
        </DialogDescription>
      </DialogHeader>
      <div className="flex max-h-[min(68vh,560px)] flex-col gap-5 overflow-y-auto px-5 py-4">
        {SHORTCUTS.map((section) => (
          <section key={section.group}>
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              {section.group}
            </p>
            {section.note ? (
              <p className="mt-1 text-xs text-muted-foreground">{section.note}</p>
            ) : null}
            <ul
              className={
                section.compact
                  ? "mt-2 grid grid-cols-2 gap-x-8"
                  : "mt-2 flex flex-col"
              }
            >
              {section.items.map((item) => (
                <li
                  className={
                    section.compact
                      ? "flex items-center justify-between gap-4 py-1.5 text-[13px]"
                      : "flex items-center justify-between gap-4 border-b border-[var(--console-hairline-soft)] py-2 text-[13px] last:border-b-0"
                  }
                  key={item.label}
                >
                  <span>{item.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {item.keys.map((key) => (
                      <Kbd className="text-[10px]" key={key}>
                        {key}
                      </Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DialogContent>
  </Dialog>
)
