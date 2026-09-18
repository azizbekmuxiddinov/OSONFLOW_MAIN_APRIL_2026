"use client"

import { api } from "@workspace/backend/_generated/api"
import type { Doc, Id } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Hint } from "@workspace/ui/components/hint"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation } from "convex/react"
import { FlagIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export type ConversationPriority = NonNullable<Doc<"conversations">["priority"]>

/** Radio items need a string for "no priority", which the backend stores as null. */
export const NO_PRIORITY_VALUE = "none"

/** Highest first, which is also the order the menus list them in. */
export const CONVERSATION_PRIORITIES: {
  value: ConversationPriority
  label: string
  /** Colors the flag icon. */
  iconClassName: string
  /** Colors a badge or button carrying the label. */
  toneClassName: string
}[] = [
  {
    value: "urgent",
    label: "Urgent",
    iconClassName: "text-red-600 dark:text-red-400",
    toneClassName:
      "border-red-500/30 bg-red-500/12 text-red-700 dark:text-red-300",
  },
  {
    value: "high",
    label: "High",
    iconClassName: "text-orange-600 dark:text-orange-400",
    toneClassName:
      "border-orange-500/30 bg-orange-500/12 text-orange-700 dark:text-orange-300",
  },
  {
    value: "medium",
    label: "Medium",
    iconClassName: "text-amber-600 dark:text-amber-400",
    toneClassName:
      "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
  },
  {
    value: "low",
    label: "Low",
    iconClassName: "text-sky-600 dark:text-sky-400",
    toneClassName:
      "border-sky-500/30 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  },
]

export const getPriorityOption = (
  priority: Doc<"conversations">["priority"]
) =>
  priority
    ? CONVERSATION_PRIORITIES.find((option) => option.value === priority)
    : undefined

export const parsePriorityValue = (value: string) =>
  value === NO_PRIORITY_VALUE ? null : (value as ConversationPriority)

export const useUpdateConversationPriority = () => {
  const updatePriority = useMutation(api.private.conversations.updatePriority)

  return async (
    conversationId: Id<"conversations">,
    priority: ConversationPriority | null
  ) => {
    try {
      await updatePriority({ conversationId, priority })
    } catch (error) {
      toast.error("Failed to update priority")
      console.error(error)
    }
  }
}

export const ConversationPriorityBadge = ({
  priority,
  className,
}: {
  priority: Doc<"conversations">["priority"]
  className?: string
}) => {
  const option = getPriorityOption(priority)

  if (!option) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-flex h-3.5 items-center gap-0.5 rounded-full border px-1 text-[10px] leading-none font-medium whitespace-nowrap",
        option.toneClassName,
        className
      )}
    >
      <FlagIcon className="size-2.5" />
      {option.label}
    </span>
  )
}

/** The priority control in the conversation header. */
export const ConversationPriorityMenu = ({
  conversationId,
  priority,
}: {
  conversationId: Id<"conversations">
  priority: Doc<"conversations">["priority"]
}) => {
  const updatePriority = useUpdateConversationPriority()
  const [isUpdating, setIsUpdating] = useState(false)
  const option = getPriorityOption(priority)

  const handleChange = async (value: string) => {
    setIsUpdating(true)

    try {
      await updatePriority(conversationId, parsePriorityValue(value))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <DropdownMenu>
      <Hint text="Set priority">
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Set priority"
            className={cn(
              "gap-1.5",
              option ? option.toneClassName : "text-muted-foreground"
            )}
            disabled={isUpdating}
            size="sm"
            variant="outline"
          >
            <FlagIcon className="size-3.5" />
            <span className="hidden sm:inline">
              {option ? option.label : "Priority"}
            </span>
          </Button>
        </DropdownMenuTrigger>
      </Hint>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Priority
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          onValueChange={(value) => void handleChange(value)}
          value={priority ?? NO_PRIORITY_VALUE}
        >
          {CONVERSATION_PRIORITIES.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              <FlagIcon className={cn("size-3.5", item.iconClassName)} />
              {item.label}
            </DropdownMenuRadioItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value={NO_PRIORITY_VALUE}>
            <FlagIcon className="size-3.5 text-muted-foreground" />
            No priority
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
