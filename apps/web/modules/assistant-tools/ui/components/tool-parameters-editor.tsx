"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { createEmptyParameter, type AssistantTool } from "../../constants"

type ToolParameters = AssistantTool["parameters"]

type ToolParametersEditorProps = {
  parameters: ToolParameters
  onChange: (parameters: ToolParameters) => void
}

const TYPE_LABELS: Record<ToolParameters[number]["type"], string> = {
  string: "Text",
  number: "Number",
  boolean: "Yes / no",
}

/**
 * The values the assistant fills in when it calls the tool — one ruled row
 * each. Names and descriptions are read by the model, so the description field
 * is framed as an instruction rather than a type annotation.
 */
export const ToolParametersEditor = ({
  parameters,
  onChange,
}: ToolParametersEditorProps) => {
  const updateParameter = (
    index: number,
    field: keyof ToolParameters[number],
    value: string | boolean
  ) => {
    onChange(
      parameters.map((parameter, parameterIndex) =>
        parameterIndex === index ? { ...parameter, [field]: value } : parameter
      )
    )
  }

  return (
    <div>
      {parameters.length === 0 ? (
        <p className="border-y border-[var(--report-rule)] py-4 text-sm text-muted-foreground">
          The assistant calls this tool without sending anything. Add a value if
          the service needs to know something — an email, an order number.
        </p>
      ) : (
        <ul>
          {parameters.map((parameter, index) => {
            const nameId = `parameter-name-${index}`
            const descriptionId = `parameter-description-${index}`

            return (
              <li
                className="tools-field grid gap-3 py-4 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto] lg:items-end"
                key={`parameter-${index}`}
              >
                <div className="space-y-1.5">
                  <label
                    className="text-xs text-muted-foreground"
                    htmlFor={nameId}
                  >
                    Name
                  </label>
                  <Input
                    className="font-mono text-xs"
                    id={nameId}
                    onChange={(event) =>
                      updateParameter(index, "name", event.target.value)
                    }
                    placeholder="email"
                    value={parameter.name}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs text-muted-foreground"
                    htmlFor={descriptionId}
                  >
                    What the assistant should put here
                  </label>
                  <Input
                    id={descriptionId}
                    onChange={(event) =>
                      updateParameter(index, "description", event.target.value)
                    }
                    placeholder="The customer's email address"
                    value={parameter.description}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    onValueChange={(value: "string" | "number" | "boolean") =>
                      updateParameter(index, "type", value)
                    }
                    value={parameter.type}
                  >
                    <SelectTrigger
                      aria-label={`Kind of value for ${parameter.name || `value ${index + 1}`}`}
                      className="w-[7.5rem]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={parameter.required}
                      onCheckedChange={(checked) =>
                        updateParameter(index, "required", checked)
                      }
                    />
                    Required
                  </label>

                  <Button
                    aria-label={`Remove ${parameter.name || `value ${index + 1}`}`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      onChange(
                        parameters.filter(
                          (_, parameterIndex) => parameterIndex !== index
                        )
                      )
                    }
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Button
        className="mt-4"
        onClick={() => onChange([...parameters, createEmptyParameter()])}
        size="sm"
        type="button"
        variant="outline"
      >
        <PlusIcon data-icon="inline-start" />
        Add a value
      </Button>
    </div>
  )
}
