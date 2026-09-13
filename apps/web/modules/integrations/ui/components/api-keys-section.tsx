"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { KeyRoundIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type ProviderService = "openai_realtime" | "gemini_live"

export type ProviderStatuses = {
  openaiConfigured?: boolean
  openaiRealtimeConfigured?: boolean
  geminiLiveConfigured?: boolean
}

type ApiKeyConfig = {
  service: ProviderService
  title: string
  label: string
  logoAlt: string
  logoSrc: string
  placeholder: string
  configured: boolean
  description: string
  statusLabel: string
  savedMessage: string
  removedMessage: string
}

const ApiKeyCard = ({
  config,
  inputValue,
  isRemoving,
  isSaving,
  onChange,
  onRemove,
  onSave,
}: {
  config: ApiKeyConfig
  inputValue: string
  isRemoving: boolean
  isSaving: boolean
  onChange: (value: string) => void
  onRemove: () => void
  onSave: () => void
}) => {
  const inputId = `api-key-${config.service}`

  return (
    <div className="setup-row grid gap-4 px-2 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="setup-glyph size-10 overflow-hidden">
          <Image
            alt={config.logoAlt}
            className="size-6 object-contain"
            height={24}
            src={config.logoSrc}
            width={24}
          />
        </span>
        <div className="min-w-0">
          <p className="text-[0.95rem] font-medium text-foreground">
            {config.title}
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="setup-dot"
              data-tone={config.configured ? "live" : "neutral"}
            />
            {config.configured ? config.statusLabel : "Using Osonflow's key"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <label className="sr-only" htmlFor={inputId}>
          {config.title}
        </label>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            className="min-w-0 flex-1 font-mono text-sm"
            id={inputId}
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              config.configured ? "Paste a new key to replace it" : config.placeholder
            }
            type="password"
            value={inputValue}
          />
          <Button
            disabled={isSaving || inputValue.trim().length === 0}
            onClick={onSave}
            type="button"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : (
              <KeyRoundIcon data-icon="inline-start" />
            )}
            {config.configured ? "Replace" : "Save"}
          </Button>
          {config.configured ? (
            <Button
              className="text-muted-foreground hover:text-destructive"
              disabled={isRemoving || isSaving}
              onClick={onRemove}
              type="button"
              variant="ghost"
            >
              {isRemoving ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : (
                <Trash2Icon data-icon="inline-start" />
              )}
              Remove
            </Button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {config.label} is stored securely for your organization only, and is
          never included in widget settings.
        </p>
      </div>
    </div>
  )
}

export const ApiKeysSection = ({
  providerStatuses,
}: {
  providerStatuses?: ProviderStatuses
}) => {
  const upsertSecret = useMutation(api.private.secrets.upsert)
  const removePlugin = useMutation(api.private.plugins.remove)

  const [openAIKey, setOpenAIKey] = useState("")
  const [geminiKey, setGeminiKey] = useState("")
  const [savingService, setSavingService] = useState<ProviderService | null>(
    null
  )
  const [removingService, setRemovingService] =
    useState<ProviderService | null>(null)

  const openAIConfigured = Boolean(
    providerStatuses?.openaiConfigured ??
      providerStatuses?.openaiRealtimeConfigured
  )

  const configs: ApiKeyConfig[] = [
    {
      service: "openai_realtime",
      title: "OpenAI API key",
      label: "The OpenAI key",
      logoAlt: "OpenAI logo",
      logoSrc: "/logos/chatgpt-logo.png",
      placeholder: "sk-...",
      configured: openAIConfigured,
      description:
        "Used for regular AI chat, knowledge-base answer summaries, operator AI polish, and OpenAI Realtime voice.",
      statusLabel: "Custom OpenAI key saved",
      savedMessage: "OpenAI API key saved",
      removedMessage: "OpenAI API key removed",
    },
    {
      service: "gemini_live",
      title: "Gemini API key",
      label: "The Gemini key",
      logoAlt: "Google Gemini logo",
      logoSrc: "/logos/gemini-logo.png",
      placeholder: "AIza...",
      configured: Boolean(providerStatuses?.geminiLiveConfigured),
      description:
        "Used for Gemini Live voice sessions when that voice channel is enabled.",
      statusLabel: "Custom Gemini key saved",
      savedMessage: "Gemini API key saved",
      removedMessage: "Gemini API key removed",
    },
  ]

  const getKeyState = (service: ProviderService) =>
    service === "openai_realtime"
      ? { value: openAIKey, reset: () => setOpenAIKey("") }
      : { value: geminiKey, reset: () => setGeminiKey("") }

  const saveKey = async (config: ApiKeyConfig) => {
    const keyState = getKeyState(config.service)
    const trimmedKey = keyState.value.trim()

    if (!trimmedKey) {
      toast.error("Enter an API key first")
      return
    }

    setSavingService(config.service)
    try {
      await upsertSecret({
        service: config.service,
        value: { apiKey: trimmedKey },
      })
      keyState.reset()
      toast.success(config.savedMessage)
    } catch {
      toast.error("Unable to save API key")
    } finally {
      setSavingService(null)
    }
  }

  const removeKey = async (config: ApiKeyConfig) => {
    setRemovingService(config.service)
    try {
      await removePlugin({ service: config.service })
      toast.success(config.removedMessage)
    } catch {
      toast.error("Unable to remove API key")
    } finally {
      setRemovingService(null)
    }
  }

  return (
    <div>
      {configs.map((config) => {
        const value =
          config.service === "openai_realtime" ? openAIKey : geminiKey
        const onChange =
          config.service === "openai_realtime" ? setOpenAIKey : setGeminiKey

        return (
          <ApiKeyCard
            key={config.service}
            config={config}
            inputValue={value}
            isRemoving={removingService === config.service}
            isSaving={savingService === config.service}
            onChange={onChange}
            onRemove={() => void removeKey(config)}
            onSave={() => void saveKey(config)}
          />
        )
      })}
    </div>
  )
}
