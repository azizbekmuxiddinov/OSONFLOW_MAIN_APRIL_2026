"use client"

import { PanelLeftIcon } from "lucide-react"

import { Hint } from "@workspace/ui/components/hint"
import { cn } from "@workspace/ui/lib/utils"

import { useShell } from "./dashboard-shell"

/** The small panel icon before a page title that hides or shows the area sidebar. */
export const SubnavToggle = ({ className }: { className?: string }) => {
  const { hasSubnav, isSubnavOpen, toggleSubnav } = useShell()

  if (!hasSubnav) {
    return null
  }

  return (
    <Hint side="bottom" text={isSubnavOpen ? "Hide sidebar" : "Show sidebar"}>
      <button
        aria-label={isSubnavOpen ? "Hide sidebar" : "Show sidebar"}
        aria-pressed={isSubnavOpen}
        className={cn(
          "dash-rail-item hidden size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex",
          className
        )}
        onClick={toggleSubnav}
        type="button"
      >
        <PanelLeftIcon className="size-4" />
      </button>
    </Hint>
  )
}
