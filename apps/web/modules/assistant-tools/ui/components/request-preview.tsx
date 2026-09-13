"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import type { AssistantTool } from "../../constants"

/**
 * The exact call this tool makes, rendered the way an engineer would check it.
 *
 * Credentials are masked in the preview but present in the copied cURL, so the
 * command can be pasted into a terminal to reproduce a failure. Nothing here
 * reaches the network — it is a rendering of the saved config.
 */

type RequestPreviewProps = {
  type: AssistantTool["type"]
  config: NonNullable<AssistantTool["config"]>
  parameters: AssistantTool["parameters"]
}

const SENSITIVE_HEADERS = ["authorization", "api-key", "apikey", "token", "key"]

const isSensitive = (header: string) =>
  SENSITIVE_HEADERS.some((entry) => header.toLowerCase().includes(entry))

/** Keeps the scheme and the first characters, hides the rest of the secret. */
const maskValue = (value: string) => {
  const [scheme, ...rest] = value.split(" ")
  const secret = rest.join(" ")

  if (!secret) {
    return value.length > 8 ? `${value.slice(0, 4)}••••••••` : "••••••••"
  }

  return `${scheme} ${secret.slice(0, 4)}••••••••`
}

const parseHeaders = (raw?: string): Record<string, string> => {
  if (!raw?.trim()) return {}

  try {
    const parsed = JSON.parse(raw) as unknown

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
        key,
        String(value ?? ""),
      ])
    )
  } catch {
    return {}
  }
}

/** Sample argument values, so the preview reads like a real call. */
const sampleArgs = (parameters: AssistantTool["parameters"]) =>
  Object.fromEntries(
    parameters.map((parameter) => [
      parameter.name,
      parameter.type === "number"
        ? "123"
        : parameter.type === "boolean"
          ? "true"
          : `<${parameter.name}>`,
    ])
  )

const interpolate = (template: string, args: Record<string, string>) =>
  template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key: string) =>
    key in args ? args[key]! : match
  )

export const RequestPreview = ({
  type,
  config,
  parameters,
}: RequestPreviewProps) => {
  const [copied, setCopied] = useState(false)

  const isWebhook = type === "custom_webhook"
  const method = (isWebhook ? config.webhookMethod : config.method) ?? "POST"
  const url = (isWebhook ? config.webhookUrl : config.url)?.trim() ?? ""
  const headers = isWebhook ? {} : parseHeaders(config.headersJson)
  const args = sampleArgs(parameters)

  const requestUrl =
    method === "GET" && parameters.length > 0
      ? `${url}${url.includes("?") ? "&" : "?"}${parameters
          .map(
            (parameter) =>
              `${encodeURIComponent(parameter.name)}=${encodeURIComponent(
                args[parameter.name] ?? ""
              )}`
          )
          .join("&")}`
      : url

  const body =
    method === "POST"
      ? isWebhook || !config.bodyTemplate?.trim()
        ? JSON.stringify(args, null, 2)
        : interpolate(config.bodyTemplate, args)
      : null

  const allHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  const curl = [
    `curl -X ${method} '${requestUrl || "https://…"}'`,
    ...Object.entries(allHeaders).map(
      ([key, value]) => `  -H '${key}: ${value}'`
    ),
    ...(body ? [`  -d '${body.replace(/'/g, "'\\''")}'`] : []),
  ].join(" \\\n")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  if (!url) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        Add the web address above and the exact request appears here.
      </p>
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="tools-code">
        <div className="tools-code-bar">
          <span className="tabular-nums">
            {parameters.length} value{parameters.length === 1 ? "" : "s"} from
            the assistant · sample data
          </span>
          <button
            aria-live="polite"
            className="tools-code-action"
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <CheckIcon aria-hidden className="size-3.5" />
            ) : (
              <CopyIcon aria-hidden className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy as cURL"}
          </button>
        </div>
        <pre>
          <span className="tools-code-method">{method}</span> {requestUrl}
          {"\n"}
          {Object.entries(allHeaders).map(([key, value]) => (
            <span className="tools-code-muted" key={key}>
              {key}: {isSensitive(key) ? maskValue(value) : value}
              {"\n"}
            </span>
          ))}
          {body ? `\n${body}` : null}
        </pre>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Keys are hidden here. The copied command carries the real values, so a
        developer can reproduce the call exactly.
      </p>
    </div>
  )
}
