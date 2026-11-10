"use client"

import * as React from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Hint } from "@workspace/ui/components/hint"
import { SidebarMenuButton } from "@workspace/ui/components/sidebar"

type DashboardThemeToggleProps = {
  sidebar?: boolean
}

export const DashboardThemeToggle = ({
  sidebar = false,
}: DashboardThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
  const label = mounted
    ? nextTheme === "dark"
      ? "Dark mode"
      : "Light mode"
    : "Theme"

  const icon = !mounted ? (
    <MonitorIcon className="size-[18px]" strokeWidth={1.8} />
  ) : nextTheme === "dark" ? (
    <MoonIcon className="size-[18px]" strokeWidth={1.8} />
  ) : (
    <SunIcon className="size-[18px]" strokeWidth={1.8} />
  )

  const handleToggle = () => {
    if (!mounted) return
    setTheme(nextTheme)
  }

  if (sidebar) {
    return (
      <SidebarMenuButton
        type="button"
        tooltip={label}
        onClick={handleToggle}
        className="h-8 rounded-md border-0 bg-transparent px-2 text-[13px] text-sidebar-foreground/80 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 hover:bg-sidebar-accent/70 group-data-[collapsible=icon]:[&>span]:hidden"
        aria-label={`Switch to ${label.toLowerCase()}`}
        title={`Switch to ${label.toLowerCase()}`}
      >
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    )
  }

  return (
    <Hint side="right" text={label}>
      <button
        aria-label={`Switch to ${label.toLowerCase()}`}
        className="dash-rail-item flex size-9 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-[var(--canvas-strong)] hover:text-foreground"
        onClick={handleToggle}
        type="button"
      >
        {/* The icon turns as it swaps, so the change reads as one gesture. */}
        <span className="dash-theme-icon" key={mounted ? nextTheme : "idle"}>
          {icon}
        </span>
      </button>
    </Hint>
  )
}
