"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import { CopyIcon, Loader2Icon, PlayIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import type { AssistantTool } from "../../constants"
import { Callout } from "./tools-primitives"

type TestRun = {
  output: string
  durationMs: number
  failed: boolean
}

type ToolParameter = AssistantTool["parameters"][number]

type ToolTestConsoleProps = {
  parameters: AssistantTool["parameters"]
  /** Non-null when the tool cannot be exercised yet, with the reason shown. */
  blockedReason: string | null
  onRun: (args: Record<string, unknown>) => Promise<string>
}

type FieldValue = string | boolean

const emptyValue = (parameter: ToolParameter): FieldValue =>
  parameter.type === "boolean" ? false : ""

/** Turns the typed form back into the arguments the model would send. */
const toArgs = (
  parameters: ToolParameter[],
  values: Record<string, FieldValue>
) => {
  const args: Record<string, unknown> = {}

  for (const parameter of parameters) {
    const value = values[parameter.name]

    if (parameter.type === "boolean") {
      args[parameter.name] = Boolean(value)
      continue
    }

    const text = typeof value === "string" ? value.trim() : ""
    if (!text) continue

    args[parameter.name] = parameter.type === "number" ? Number(text) : text
  }

  return args
}

/**
 * Runs the saved tool with values you type, and shows exactly what the
 * assistant would read back. Each argument gets its own labelled field; the raw
 * JSON is still one click away for anyone pasting a payload.
 *
 * Mount with a `key` per tool so a previous run never leaks into the next.
 */
export const ToolTestConsole = ({
  parameters,
  blockedReason,
  onRun,
}: ToolTestConsoleProps) => {
  const named = parameters.filter((parameter) => parameter.name.trim())
  const [values, setValues] = useState<Record<string, FieldValue>>(() =>
    Object.fromEntries(
      named.map((parameter) => [parameter.name, emptyValue(parameter)])
    )
  )
  const [isJsonMode, setIsJsonMode] = useState(false)
  const [argsJson, setArgsJson] = useState("{}")
  const [isRunning, setIsRunning] = useState(false)
  const [run, setRun] = useState<TestRun | null>(null)

  const missingRequired = isJsonMode
    ? []
    : named.filter(
        (parameter) =>
          parameter.required &&
          parameter.type !== "boolean" &&
          !String(values[parameter.name] ?? "").trim()
      )

  const switchMode = () => {
    if (!isJsonMode) {
      setArgsJson(JSON.stringify(toArgs(named, values), null, 2))
    }
    setIsJsonMode((current) => !current)
  }

  const handleRun = async () => {
    let args: Record<string, unknown>

    if (isJsonMode) {
      try {
        const candidate = JSON.parse(argsJson || "{}") as unknown

        if (
          typeof candidate !== "object" ||
          candidate === null ||
          Array.isArray(candidate)
        ) {
          throw new Error("The test values must be a JSON object.")
        }

        args = candidate as Record<string, unknown>
      } catch (error) {
        setRun({
          output:
            error instanceof Error
              ? error.message
              : "The test values must be valid JSON.",
          durationMs: 0,
          failed: true,
        })
        return
      }
    } else {
      args = toArgs(named, values)
    }

    setIsRunning(true)
    setRun(null)
    const startedAt = performance.now()

    try {
      const output = await onRun(args)
      setRun({
        output,
        durationMs: Math.round(performance.now() - startedAt),
        failed: false,
      })
    } catch (error) {
      setRun({
        output: error instanceof Error ? error.message : "Test failed.",
        durationMs: Math.round(performance.now() - startedAt),
        failed: true,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {blockedReason ? <Callout>{blockedReason}</Callout> : null}

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="console-label">
            {named.length === 0
              ? "This tool takes no values"
              : "Values the assistant would send"}
          </p>
          {named.length > 0 ? (
            <Button
              onClick={switchMode}
              size="xs"
              type="button"
              variant="ghost"
            >
              {isJsonMode ? "Use the form" : "Edit as JSON"}
            </Button>
          ) : null}
        </div>

        {isJsonMode ? (
          <Textarea
            aria-label="Test values as JSON"
            className="font-mono text-xs"
            onChange={(event) => setArgsJson(event.target.value)}
            rows={6}
            value={argsJson}
          />
        ) : named.length > 0 ? (
          <div>
            {named.map((parameter) => {
              const id = `test-${parameter.name}`

              return (
                <div
                  className="tools-field grid gap-2 py-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-center sm:gap-6"
                  key={parameter.name}
                >
                  <div className="min-w-0">
                    <label
                      className="flex items-center gap-1.5 text-sm font-medium text-foreground"
                      htmlFor={id}
                    >
                      <span className="truncate font-mono text-[0.8rem]">
                        {parameter.name}
                      </span>
                      {parameter.required ? (
                        <span className="text-xs font-normal text-muted-foreground">
                          required
                        </span>
                      ) : null}
                    </label>
                    {parameter.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {parameter.description}
                      </p>
                    ) : null}
                  </div>

                  {parameter.type === "boolean" ? (
                    <Switch
                      checked={Boolean(values[parameter.name])}
                      id={id}
                      onCheckedChange={(checked) =>
                        setValues((current) => ({
                          ...current,
                          [parameter.name]: checked,
                        }))
                      }
                    />
                  ) : (
                    <Input
                      id={id}
                      inputMode={
                        parameter.type === "number" ? "decimal" : undefined
                      }
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [parameter.name]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !blockedReason) {
                          event.preventDefault()
                          void handleRun()
                        }
                      }}
                      type={parameter.type === "number" ? "number" : "text"}
                      value={String(values[parameter.name] ?? "")}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run it to see what comes back.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={
            isRunning || Boolean(blockedReason) || missingRequired.length > 0
          }
          onClick={handleRun}
          type="button"
        >
          {isRunning ? (
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
          ) : (
            <PlayIcon data-icon="inline-start" />
          )}
          {isRunning ? "Running…" : "Run test"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {missingRequired.length > 0
            ? `Fill in ${missingRequired.map((parameter) => parameter.name).join(", ")} first.`
            : "Uses the saved setup and calls the real service, exactly as the assistant would."}
        </p>
      </div>

      <div aria-live="polite">
        {run ? (
          <div className="tools-code">
            <div className="tools-code-bar">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-2 font-medium text-[#eef1fb]">
                  <span
                    aria-hidden
                    className="setup-dot"
                    data-tone={run.failed ? "error" : "live"}
                  />
                  {run.failed ? "Failed" : "Worked"}
                </span>
                <span className="tabular-nums">{run.durationMs} ms</span>
                <span className="tabular-nums">
                  {run.output.length.toLocaleString()} characters
                </span>
              </span>
              <button
                className="tools-code-action"
                onClick={() => {
                  void navigator.clipboard.writeText(run.output)
                  toast.success("Response copied")
                }}
                type="button"
              >
                <CopyIcon aria-hidden className="size-3.5" />
                Copy
              </button>
            </div>
            <pre
              className={run.failed ? "tools-code-error" : undefined}
              data-wrap
            >
              {run.output}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  )
}
