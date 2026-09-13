import { Suspense } from "react"

import { AuthFormSkeleton } from "@/modules/auth/ui/components/auth-fields"
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view"

const Page = () => {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignUpView />
    </Suspense>
  )
}

export default Page
