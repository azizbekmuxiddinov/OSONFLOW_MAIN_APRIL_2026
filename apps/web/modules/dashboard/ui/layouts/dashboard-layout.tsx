import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { cookies } from "next/headers"
import { DashboardSidebar } from "../components/dashboard-sidebar"
import { DashboardNotificationSound } from "../components/dashboard-notification-sound"
import { DashboardSwipeMenu } from "../components/dashboard-swipe-menu"
import { DashboardThemeToggle } from "../components/dashboard-theme-toggle"
import { OnboardingGate } from "@/modules/onboarding/ui/components/onboarding-gate"
import { Provider } from "jotai"
import "../styles/liquid-glass.css"

export const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <AuthGuard>
      <OrganizationGuard>
        <Provider>
          <SidebarProvider defaultOpen={defaultOpen}>
            {/* The colour field every glass pane refracts. */}
            <div aria-hidden className="glass-field" />
            <DashboardNotificationSound />
            <OnboardingGate />
            <DashboardSidebar />
            <DashboardSwipeMenu />
            {/* main must be flex-col + h-svh so resizable panels inside get a real height */}
            <main
              className="relative flex h-svh flex-1 flex-col overflow-hidden bg-transparent"
              data-glass-shell
              id="main"
            >
              <header className="glass sticky top-0 z-20 mx-3 mt-3 flex h-12 shrink-0 items-center gap-2 rounded-full pr-1.5 pl-2 text-sidebar-foreground md:hidden">
                <SidebarTrigger className="shrink-0 rounded-full" />
                <div className="h-4 w-px bg-foreground/10" />
                <span className="truncate text-sm font-semibold tracking-tight">
                  Osonflow
                </span>
                <div className="ml-auto">
                  <DashboardThemeToggle />
                </div>
              </header>
              {/* children scroll independently; conversations layout handles its own overflow */}
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                {children}
              </div>
            </main>
          </SidebarProvider>
        </Provider>
      </OrganizationGuard>
    </AuthGuard>
  )
}
