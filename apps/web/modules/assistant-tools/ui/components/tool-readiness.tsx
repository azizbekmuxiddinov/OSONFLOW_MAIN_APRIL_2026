"use client"

import { Button } from "@workspace/ui/components/button"
import { ArrowRightIcon } from "lucide-react"

import { Callout, Step, Steps } from "./tools-primitives"

/**
 * The setup checklist for the tool being edited.
 *
 * A tool that is half-configured fails at call time, inside a conversation,
 * where nobody sees it. This states what is still missing before it ships, in
 * order, with a way to jump to the step that fixes it.
 */

export type ReadinessStep = {
  id: string
  label: string
  description?: string
  done: boolean
  /** Where the fix lives, when it is not on the overview itself. */
  action?: { label: string; onClick: () => void }
}

export const ToolReadiness = ({ steps }: { steps: ReadinessStep[] }) => {
  const done = steps.filter((step) => step.done).length
  const isReady = done === steps.length

  if (isReady) {
    return (
      <Callout tone="info">
        <span className="font-medium">Everything is in place.</span>{" "}
        <span className="text-muted-foreground">
          Your assistant will use this tool whenever a conversation matches the
          description below.
        </span>
      </Callout>
    )
  }

  return (
    <Steps>
      {steps.map((step, index) => (
        <Step
          aside={
            !step.done && step.action ? (
              <Button
                onClick={step.action.onClick}
                size="sm"
                type="button"
                variant="outline"
              >
                {step.action.label}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : null
          }
          description={step.done ? undefined : step.description}
          done={step.done}
          index={index + 1}
          key={step.id}
          title={step.label}
        />
      ))}
    </Steps>
  )
}
