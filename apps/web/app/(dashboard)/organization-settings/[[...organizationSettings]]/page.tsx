import { OrganizationProfile } from "@clerk/nextjs"

import {
  ConsoleHeader,
  ConsolePage,
} from "@/modules/dashboard/ui/components/console"
import { clerkProfileAppearance } from "@/modules/dashboard/ui/lib/clerk-profile-appearance"

const OrganizationSettingsPage = () => {
  return (
    <ConsolePage>
      <ConsoleHeader
        description="Name, logo and the people in your workspace."
        title="Organization"
      />
      <OrganizationProfile
        appearance={clerkProfileAppearance}
        path="/organization-settings"
        routing="path"
      />
    </ConsolePage>
  )
}

export default OrganizationSettingsPage
