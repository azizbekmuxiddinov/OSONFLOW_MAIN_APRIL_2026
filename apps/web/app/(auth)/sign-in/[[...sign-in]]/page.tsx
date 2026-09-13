import { Suspense } from "react"

import { AuthFormSkeleton } from "@/modules/auth/ui/components/auth-fields"
import { SignInView } from "@/modules/auth/ui/views/sign-in-view"

const Page = () => {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignInView />
    </Suspense>
  )
}

export default Page
