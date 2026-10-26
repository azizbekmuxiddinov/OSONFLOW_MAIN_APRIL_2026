"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Kbd } from "@workspace/ui/components/kbd"

/** Every shortcut in one place, opened with "?" the way Linear and Intercom do. */
const SHORTCUTS: { group: string; items: { keys: string[]; label: string }[] }[] = [
  {
    group: "Anywhere",
    items: [
      { keys: ["⌘", "K"], label: "Search pages, conversations and actions" },
      { keys: ["?"], label: "Show these shortcuts" },
    ],
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
    <DialogContent className="max-w-md gap-0 p-0 sm:rounded-xl">
      <DialogHeader className="border-b border-[var(--console-hairline-soft)] px-5 py-4 text-left">
        <DialogTitle className="text-base">Keyboard shortcuts</DialogTitle>
        <DialogDescription className="text-xs">
          Move around the dashboard without reaching for the mouse.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 px-5 py-4">
        {SHORTCUTS.map((section) => (
          <section key={section.group}>
            <p className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              {section.group}
            </p>
            <ul className="flex flex-col">
              {section.items.map((item) => (
                <li
                  className="flex items-center justify-between gap-4 border-b border-[var(--console-hairline-soft)] py-2 text-[13px] last:border-b-0"
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
