import type { Metadata } from "next"

import { SettingsView } from "@/modules/dashboard/ui/views/settings-view"

export const metadata: Metadata = {
  title: "Settings",
}

const Page = () => {
  return <SettingsView />
}

export default Page
