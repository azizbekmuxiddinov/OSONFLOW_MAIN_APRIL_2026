"use client"

import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"
import { EyeIcon, EyeOffIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

/* ── password ──────────────────────────────────────────────────────────── */

type AuthPasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "className"
>

/** A password field with a show/hide toggle; paste and managers still work. */
export const AuthPasswordInput = (props: AuthPasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="auth-password">
      <Input
        {...props}
        className="auth-input"
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-controls={props.id}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="auth-password__toggle"
        onClick={() => setIsVisible((current) => !current)}
        type="button"
      >
        {isVisible ? (
          <EyeOffIcon aria-hidden className="size-[18px]" />
        ) : (
          <EyeIcon aria-hidden className="size-[18px]" />
        )}
      </button>
    </div>
  )
}

/** Guidance, not a gate: the account rules themselves are enforced by Clerk. */
export const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null

  const score = [
    password.length >= 8,
    /[a-z]/i.test(password) && /\d/.test(password),
    password.length >= 12 || /[^a-z0-9]/i.test(password),
  ].filter(Boolean).length

  const hint =
    password.length < 8
      ? "Use at least 8 characters"
      : score === 1
        ? "Add a number to make it stronger"
        : score === 2
          ? "Good password"
          : "Strong password"

  return (
    <div className="space-y-1.5">
      <div aria-hidden className="auth-strength" data-score={score}>
        <span />
        <span />
        <span />
      </div>
      <p aria-live="polite" className="text-xs text-[var(--auth-ink-soft)]">
        {hint}
      </p>
    </div>
  )
}

/* ── messages ──────────────────────────────────────────────────────────── */

export const AuthErrors = ({
  errors,
}: {
  errors?: Array<{ message: string }> | null
}) => {
  if (!errors?.length) return null

  return (
    <div className="space-y-2" role="alert">
      {errors.map((error) => (
        <p className="auth-error" key={error.message}>
          <TriangleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{error.message}</span>
        </p>
      ))}
    </div>
  )
}

/** A submit button's label while it works. */
export const Busy = ({ label }: { label: string }) => (
  <>
    <Spinner className="size-4" />
    <span>{label}</span>
  </>
)

/* ── resend ────────────────────────────────────────────────────────────── */

const RESEND_COOLDOWN_SECONDS = 30

/**
 * "Resend code", unavailable for 30 seconds after each send. The countdown is
 * a separate number rather than part of the sentence, so the label translates
 * as a whole in every language.
 */
export const ResendCodeButton = ({
  onResend,
  disabled = false,
}: {
  onResend: () => Promise<unknown>
  disabled?: boolean
}) => {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(
      () => setSecondsLeft((value) => value - 1),
      1000
    )
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const isCoolingDown = secondsLeft > 0

  return (
    <button
      className="auth-link-muted inline-flex items-center justify-center gap-2 px-3 py-1.5"
      disabled={disabled || isCoolingDown || isSending}
      onClick={async () => {
        setIsSending(true)
        try {
          await onResend()
          setSecondsLeft(RESEND_COOLDOWN_SECONDS)
        } finally {
          setIsSending(false)
        }
      }}
      type="button"
    >
      {isSending ? <Spinner className="size-3.5" /> : null}
      <span>Resend code</span>
      {isCoolingDown ? (
        <span className="text-[var(--auth-ink-faint)] tabular-nums">
          0:{String(secondsLeft).padStart(2, "0")}
        </span>
      ) : null}
    </button>
  )
}

/* ── mode switch ───────────────────────────────────────────────────────── */

/** Sign in ⇄ create account, carrying any `redirect_url` across. */
export const AuthModeSwitch = ({ mode }: { mode: "sign-in" | "sign-up" }) => {
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  const withQuery = (path: string) => (query ? `${path}?${query}` : path)

  return (
    <nav aria-label="Account" className="auth-switch" data-mode={mode}>
      <span aria-hidden className="auth-switch__thumb" />
      <Link
        aria-current={mode === "sign-in" ? "page" : undefined}
        className="auth-switch__item"
        href={withQuery("/sign-in")}
        replace
      >
        Sign in
      </Link>
      <Link
        aria-current={mode === "sign-up" ? "page" : undefined}
        className="auth-switch__item"
        href={withQuery("/sign-up")}
        replace
      >
        Create account
      </Link>
    </nav>
  )
}

/* ── loading ───────────────────────────────────────────────────────────── */

/** Drawn in the form's own shape, so nothing jumps when Clerk is ready. */
export const AuthFormSkeleton = () => (
  <div aria-busy="true" className="auth-step" role="status">
    <span className="sr-only">Loading</span>
    <Skeleton className="h-12 w-full rounded-full" />
    <div className="space-y-3">
      <Skeleton className="h-10 w-3/5 rounded-xl" />
      <Skeleton className="h-4 w-4/5 rounded-full" />
    </div>
    <Skeleton className="h-12 w-full rounded-full" />
    <Skeleton className="h-px w-full" />
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-16 rounded-full" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-20 rounded-full" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
    <Skeleton className="h-12 w-full rounded-full" />
  </div>
)
