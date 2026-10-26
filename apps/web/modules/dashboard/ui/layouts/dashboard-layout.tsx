import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard"
import { DashboardNotificationSound } from "../components/dashboard-notification-sound"
import { DashboardShell } from "../components/shell/dashboard-shell"
import { OnboardingGate } from "@/modules/onboarding/ui/components/onboarding-gate"
import { Provider } from "jotai"

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <AuthGuard>
      <OrganizationGuard>
        <Provider>
          <DashboardNotificationSound />
          <OnboardingGate />
          {/* The page panel is flex-col with a real height so resizable panes
              inside it (the inboxes) can fill it. */}
          <DashboardShell>
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </DashboardShell>
        </Provider>
      </OrganizationGuard>
    </AuthGuard>
  )
}
