import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { Spinner } from "@workspace/ui/components/spinner"

import { appPath } from "@/lib/urls"
import "@/modules/auth/ui/styles/auth.css"

export default function SsoCallbackPage() {
  return (
    <div className="auth-page flex min-h-svh items-center justify-center px-5 py-10">
      <div
        aria-live="polite"
        className="auth-form-shell flex flex-col items-center text-center"
        role="status"
      >
        <span aria-hidden className="auth-medallion">
          <Spinner className="size-5" />
        </span>
        <p className="auth-title text-[1.75rem]">Signing you in…</p>
        <p className="auth-description mt-2">This only takes a moment.</p>
      </div>

      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={appPath("/analytics")}
        signUpFallbackRedirectUrl={appPath("/org-selection")}
      />
      <div id="clerk-captcha" />
    </div>
  )
}
