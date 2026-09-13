"use client"

import { useSignIn } from "@clerk/nextjs"
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
import {
  ArrowRightIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  MailCheckIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { finalizeAuthSession } from "@/modules/auth/lib/finalize-auth"
import { AuthDivider } from "./auth-divider"
import {
  AuthErrors,
  AuthModeSwitch,
  AuthPasswordInput,
  Busy,
  ResendCodeButton,
} from "./auth-fields"
import { AuthFormHeader } from "./auth-form-header"
import { AuthSocialButtons } from "./auth-social-buttons"

type SignInStep =
  | "credentials"
  | "mfa"
  | "forgot"
  | "reset-code"
  | "new-password"
type CodeChannel = "totp" | "phone" | "email"

const otpSlots = Array.from({ length: 6 }, (_, index) => index)

const CodeInput = ({
  id,
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
  invalid: boolean
  disabled: boolean
}) => (
  <InputOTP
    aria-invalid={invalid || undefined}
    autoComplete="one-time-code"
    autoFocus
    disabled={disabled}
    id={id}
    inputMode="numeric"
    maxLength={6}
    onChange={onChange}
    onComplete={onComplete}
    pattern="^[0-9]+$"
    value={value}
  >
    <InputOTPGroup className="w-full justify-between gap-2">
      {otpSlots.map((index) => (
        <InputOTPSlot className="auth-otp-slot" index={index} key={index} />
      ))}
    </InputOTPGroup>
  </InputOTP>
)

export const CustomSignInForm = () => {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") ?? "/analytics"

  const [step, setStep] = useState<SignInStep>("credentials")
  const [codeChannel, setCodeChannel] = useState<CodeChannel>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const isLoading = fetchStatus === "fetching"

  const completeSignIn = async () => {
    if (!signIn) return
    await finalizeAuthSession(signIn, router, redirectUrl)
  }

  const sendMfaCode = async (channel: CodeChannel) => {
    if (!signIn || channel === "totp") return
    return channel === "phone"
      ? signIn.mfa.sendPhoneCode()
      : signIn.mfa.sendEmailCode()
  }

  const handleCredentials = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!signIn || isLoading) return

    const { error } = await signIn.password({ emailAddress: email, password })
    if (error) return

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const factors = signIn.supportedSecondFactors ?? []
      const channel: CodeChannel = factors.some(
        (factor) => factor.strategy === "totp"
      )
        ? "totp"
        : factors.some((factor) => factor.strategy === "phone_code")
          ? "phone"
          : "email"

      setCodeChannel(channel)
      await sendMfaCode(channel)
      setStep("mfa")
      return
    }

    await completeSignIn()
  }

  const verifyMfa = async (code: string) => {
    if (!signIn || isLoading || code.length < 6) return

    const { error } =
      codeChannel === "totp"
        ? await signIn.mfa.verifyTOTP({ code })
        : codeChannel === "phone"
          ? await signIn.mfa.verifyPhoneCode({ code })
          : await signIn.mfa.verifyEmailCode({ code })

    if (error) {
      setMfaCode("")
      return
    }

    await completeSignIn()
  }

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!signIn || isLoading) return

    const created = await signIn.create({ identifier: email })
    if (created.error) return

    const sent = await signIn.resetPasswordEmailCode.sendCode()
    if (sent.error) return

    setResetCode("")
    setStep("reset-code")
  }

  const verifyResetCode = async (code: string) => {
    if (!signIn || isLoading || code.length < 6) return

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code })

    if (error) {
      setResetCode("")
      return
    }

    setStep("new-password")
  }

  const handleNewPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!signIn || isLoading) return

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    })
    if (error) return

    await completeSignIn()
  }

  const backToSignIn = () => {
    signIn?.reset()
    setMfaCode("")
    setResetCode("")
    setNewPassword("")
    setStep("credentials")
  }

  if (step === "mfa") {
    return (
      <div className="auth-step" key="mfa">
        <AuthFormHeader
          backLabel="Back to sign in"
          description={
            codeChannel === "totp"
              ? "Open your authenticator app and enter the 6-digit code it shows for Osonflow."
              : codeChannel === "phone"
                ? "We texted a 6-digit code to the phone number on your account."
                : "We emailed a 6-digit code to the address on your account."
          }
          icon={ShieldCheckIcon}
          onBack={backToSignIn}
          title="Confirm it's you"
        />

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            void verifyMfa(mfaCode)
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!errors?.fields?.code}>
              <FieldLabel htmlFor="mfa-code">Verification code</FieldLabel>
              <CodeInput
                disabled={isLoading}
                id="mfa-code"
                invalid={!!errors?.fields?.code}
                onChange={setMfaCode}
                onComplete={(code) => void verifyMfa(code)}
                value={mfaCode}
              />
              <FieldError
                errors={errors?.fields?.code ? [errors.fields.code] : undefined}
              />
            </Field>
          </FieldGroup>

          <AuthErrors errors={errors?.global} />

          <Button
            className="auth-primary-btn w-full"
            disabled={isLoading || mfaCode.length < 6}
            type="submit"
          >
            {isLoading ? <Busy label="Checking…" /> : "Verify and sign in"}
          </Button>

          {codeChannel === "totp" ? null : (
            <div className="flex justify-center">
              <ResendCodeButton
                disabled={isLoading}
                onResend={() => sendMfaCode(codeChannel) ?? Promise.resolve()}
              />
            </div>
          )}
        </form>
      </div>
    )
  }

  if (step === "forgot") {
    return (
      <div className="auth-step" key="forgot">
        <AuthFormHeader
          backLabel="Back to sign in"
          description="Enter the email you sign in with and we'll send you a code to choose a new password."
          icon={KeyRoundIcon}
          onBack={backToSignIn}
          title="Reset your password"
        />

        <form className="space-y-6" onSubmit={handleForgotPassword}>
          <FieldGroup>
            <Field data-invalid={!!errors?.fields?.identifier}>
              <FieldLabel htmlFor="reset-email">Email</FieldLabel>
              <Input
                aria-invalid={!!errors?.fields?.identifier || undefined}
                autoComplete="email"
                autoFocus
                className="auth-input"
                id="reset-email"
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                type="email"
                value={email}
              />
              <FieldError
                errors={
                  errors?.fields?.identifier
                    ? [errors.fields.identifier]
                    : undefined
                }
              />
            </Field>
          </FieldGroup>

          <AuthErrors errors={errors?.global} />

          <Button
            className="auth-primary-btn w-full"
            disabled={isLoading || !email}
            type="submit"
          >
            {isLoading ? <Busy label="Sending…" /> : "Send reset code"}
          </Button>
        </form>
      </div>
    )
  }

  if (step === "reset-code") {
    return (
      <div className="auth-step" key="reset-code">
        <AuthFormHeader
          backLabel="Back"
          description="Enter the 6-digit code we just sent. It can take a minute to arrive — check your spam folder too."
          icon={MailCheckIcon}
          onBack={() => {
            signIn?.reset()
            setStep("forgot")
          }}
          title="Check your email"
        />

        <p className="auth-email-chip">
          <span className="truncate font-medium">{email}</span>
          <button
            onClick={() => {
              signIn?.reset()
              setStep("forgot")
            }}
            type="button"
          >
            Change
          </button>
        </p>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            void verifyResetCode(resetCode)
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!errors?.fields?.code}>
              <FieldLabel htmlFor="reset-code">Reset code</FieldLabel>
              <CodeInput
                disabled={isLoading}
                id="reset-code"
                invalid={!!errors?.fields?.code}
                onChange={setResetCode}
                onComplete={(code) => void verifyResetCode(code)}
                value={resetCode}
              />
              <FieldError
                errors={errors?.fields?.code ? [errors.fields.code] : undefined}
              />
            </Field>
          </FieldGroup>

          <AuthErrors errors={errors?.global} />

          <Button
            className="auth-primary-btn w-full"
            disabled={isLoading || resetCode.length < 6}
            type="submit"
          >
            {isLoading ? <Busy label="Checking…" /> : "Continue"}
          </Button>

          <div className="flex justify-center">
            <ResendCodeButton
              disabled={isLoading}
              onResend={() =>
                signIn?.resetPasswordEmailCode.sendCode() ?? Promise.resolve()
              }
            />
          </div>
        </form>
      </div>
    )
  }

  if (step === "new-password") {
    return (
      <div className="auth-step" key="new-password">
        <AuthFormHeader
          description="Pick something you haven't used here before. You'll be signed in straight away."
          icon={LockKeyholeIcon}
          title="Choose a new password"
        />

        <form className="space-y-6" onSubmit={handleNewPassword}>
          <FieldGroup>
            <Field data-invalid={!!errors?.fields?.password}>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>
              <AuthPasswordInput
                aria-invalid={!!errors?.fields?.password || undefined}
                autoComplete="new-password"
                autoFocus
                id="new-password"
                minLength={8}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                value={newPassword}
              />
              <FieldError
                errors={
                  errors?.fields?.password
                    ? [errors.fields.password]
                    : undefined
                }
              />
            </Field>
          </FieldGroup>

          <AuthErrors errors={errors?.global} />

          <Button
            className="auth-primary-btn w-full"
            disabled={isLoading || newPassword.length < 8}
            type="submit"
          >
            {isLoading ? <Busy label="Saving…" /> : "Save and sign in"}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="auth-step" key="credentials">
      <AuthModeSwitch mode="sign-in" />

      <AuthFormHeader
        description="Sign in to reply to customers, teach your assistant and see how it's doing."
        title="Welcome back"
      />

      <AuthSocialButtons mode="sign-in" redirectUrl={redirectUrl} />
      <AuthDivider />

      <form className="space-y-6" onSubmit={handleCredentials}>
        <FieldGroup>
          <Field data-invalid={!!errors?.fields?.identifier}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              aria-invalid={!!errors?.fields?.identifier || undefined}
              autoComplete="username"
              className="auth-input"
              id="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              type="email"
              value={email}
            />
            <FieldError
              errors={
                errors?.fields?.identifier
                  ? [errors.fields.identifier]
                  : undefined
              }
            />
          </Field>

          <Field data-invalid={!!errors?.fields?.password}>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <button
                className="auth-link text-[0.84rem]"
                onClick={() => {
                  signIn?.reset()
                  setStep("forgot")
                }}
                type="button"
              >
                Forgot password?
              </button>
            </div>
            <AuthPasswordInput
              aria-invalid={!!errors?.fields?.password || undefined}
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              required
              value={password}
            />
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
            <Busy label="Signing in…" />
          ) : (
            <>
              Sign in
              <ArrowRightIcon aria-hidden className="auth-arrow size-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
