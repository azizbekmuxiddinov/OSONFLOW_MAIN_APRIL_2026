import { UserProfile } from "@clerk/nextjs"

import {
  ConsoleHeader,
  ConsolePage,
} from "@/modules/dashboard/ui/components/console"
import { clerkProfileAppearance } from "@/modules/dashboard/ui/lib/clerk-profile-appearance"

const AccountPage = () => {
  return (
    <ConsolePage>
      <ConsoleHeader
        description="Name, email, password and how you sign in."
        title="Your account"
      />
      <UserProfile
        appearance={clerkProfileAppearance}
        path="/account"
        routing="path"
      />
    </ConsolePage>
  )
}

export default AccountPage
