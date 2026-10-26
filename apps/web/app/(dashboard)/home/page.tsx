import type { Metadata } from "next"

import { HomeView } from "@/modules/dashboard/ui/views/home-view"

export const metadata: Metadata = {
  title: "Home",
}

const Page = () => {
  return <HomeView />
}

export default Page
