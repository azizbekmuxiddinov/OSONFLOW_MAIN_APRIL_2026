"use client"

import { useSignUp } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"
import { ArrowRightIcon, MailCheckIcon, UserRoundCheckIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { marketingPath } from "@/lib/urls"
import { finalizeAuthSession } from "@/modules/auth/lib/finalize-auth"
import { AuthDivider } from "./auth-divider"
import {
  AuthErrors,
  AuthModeSwitch,
  AuthPasswordInput,
  Busy,
  PasswordStrength,
  ResendCodeButton,
} from "./auth-fields"
import { AuthFormHeader } from "./auth-form-header"
import { AuthSocialButtons } from "./auth-social-buttons"

type SignUpStep = "details" | "verify"

const otpSlots = Array.from({ length: 6 }, (_, index) => index)

export const CustomSignUpForm = () => {
  const { signUp, errors, fetchStatus } = useSignUp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") ?? "/org-selection"

  const [step, setStep] = useState<SignUpStep>("details")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")

  const isLoading = fetchStatus === "fetching"

  const completeSignUp = async () => {
    if (!signUp) return
    await finalizeAuthSession(signUp, router, redirectUrl)
  }

  const handleDetails = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!signUp || isLoading) return

    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    })
    if (error) return

    if (signUp.isTransferable) {
      return
    }

    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address")
    ) {
      await signUp.verifications.sendEmailCode()
      setVerificationCode("")
      setStep("verify")
      return
    }

    await completeSignUp()
  }

  const verifyEmail = async (code: string) => {
    if (!signUp || isLoading || code.length < 6) return

    const { error } = await signUp.verifications.verifyEmailCode({ code })

    if (error) {
      setVerificationCode("")
      return
    }

    await completeSignUp()
  }

  if (signUp?.isTransferable) {
    return (
      <div className="auth-step" key="transferable">
        <AuthFormHeader
          description="This email already has an Osonflow account. Sign in to pick up where you left off."
          icon={UserRoundCheckIcon}
          title="You already have an account"
        />

        <Button asChild className="auth-primary-btn w-full">
          <Link href="/sign-in">
            Go to sign in
            <ArrowRightIcon aria-hidden className="auth-arrow size-4" />
          </Link>
        </Button>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="auth-step" key="verify">
        <AuthFormHeader
          backLabel="Back"
          description="Enter the 6-digit code we just sent. It can take a minute to arrive — check your spam folder too."
          icon={MailCheckIcon}
          onBack={() => setStep("details")}
          title="Check your email"
        />

        <p className="auth-email-chip">
          <span className="truncate font-medium">{email}</span>
          <button onClick={() => setStep("details")} type="button">
            Change
          </button>
        </p>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            void verifyEmail(verificationCode)
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!errors?.fields?.code}>
              <FieldLabel htmlFor="verification-code">
                Verification code
              </FieldLabel>
              <InputOTP
                aria-invalid={!!errors?.fields?.code || undefined}
                autoComplete="one-time-code"
                autoFocus
                disabled={isLoading}
                id="verification-code"
                inputMode="numeric"
                maxLength={6}
                onChange={setVerificationCode}
                onComplete={(code) => void verifyEmail(code)}
                pattern="^[0-9]+$"
                value={verificationCode}
              >
                <InputOTPGroup className="w-full justify-between gap-2">
                  {otpSlots.map((index) => (
                    <InputOTPSlot
                      className="auth-otp-slot"
                      index={index}
                      key={index}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FieldError
                errors={errors?.fields?.code ? [errors.fields.code] : undefined}
              />
            </Field>
          </FieldGroup>

          <AuthErrors errors={errors?.global} />

          <Button
            className="auth-primary-btn w-full"
            disabled={isLoading || verificationCode.length < 6}
            type="submit"
          >
            {isLoading ? <Busy label="Checking…" /> : "Create my account"}
          </Button>

          <div className="flex justify-center">
            <ResendCodeButton
              disabled={isLoading}
              onResend={async () => signUp?.verifications.sendEmailCode()}
            />
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="auth-step" key="details">
      <AuthModeSwitch mode="sign-up" />

      <AuthFormHeader
        description="Set up an AI assistant that answers your customers in minutes. No credit card needed."
        title="Create your account"
      />

      <AuthSocialButtons mode="sign-up" redirectUrl={redirectUrl} />
      <AuthDivider />

      <form className="space-y-6" onSubmit={handleDetails}>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors?.fields?.firstName}>
              <FieldLabel htmlFor="first-name">First name</FieldLabel>
              <Input
                aria-invalid={!!errors?.fields?.firstName || undefined}
                autoComplete="given-name"
                className="auth-input"
                id="first-name"
                onChange={(event) => setFirstName(event.target.value)}
                value={firstName}
              />
              <FieldError
                errors={
                  errors?.fields?.firstName
                    ? [errors.fields.firstName]
                    : undefined
                }
              />
            </Field>

            <Field data-invalid={!!errors?.fields?.lastName}>
              <FieldLabel htmlFor="last-name">Last name</FieldLabel>
              <Input
                aria-invalid={!!errors?.fields?.lastName || undefined}
                autoComplete="family-name"
                className="auth-input"
                id="last-name"
                onChange={(event) => setLastName(event.target.value)}
                value={lastName}
              />
              <FieldError
                errors={
                  errors?.fields?.lastName
                    ? [errors.fields.lastName]
                    : undefined
                }
              />
            </Field>
          </div>

          <Field data-invalid={!!errors?.fields?.emailAddress}>
            <FieldLabel htmlFor="signup-email">Work email</FieldLabel>
            <Input
              aria-invalid={!!errors?.fields?.emailAddress || undefined}
              autoComplete="email"
              className="auth-input"
              id="signup-email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              type="email"
              value={email}
            />
            <FieldError
              errors={
                errors?.fields?.emailAddress
                  ? [errors.fields.emailAddress]
                  : undefined
              }
            />
          </Field>

          <Field data-invalid={!!errors?.fields?.password}>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <AuthPasswordInput
              aria-invalid={!!errors?.fields?.password || undefined}
              autoComplete="new-password"
              id="signup-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              value={password}
            />
            <PasswordStrength password={password} />
            <FieldError
              errors={
                errors?.fields?.password ? [errors.fields.password] : undefined
              }
            />
          </Field>
        </FieldGroup>

        <AuthErrors errors={errors?.global} />

        <Button
          className="auth-primary-btn w-full"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <Busy label="Creating your account…" />
          ) : (
            <>
              Create account
              <ArrowRightIcon aria-hidden className="auth-arrow size-4" />
            </>
          )}
        </Button>

        <div id="clerk-captcha" />
      </form>

      <p className="auth-footnote">
        <span>
          By creating an account, you agree to our terms and privacy policy.
        </span>{" "}
        <a className="auth-link font-medium" href={marketingPath("/terms")}>
          Terms
        </a>
        <span aria-hidden> · </span>
        <a className="auth-link font-medium" href={marketingPath("/privacy")}>
          Privacy
        </a>
      </p>
    </div>
  )
}
