import { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button"
import { Hint } from "@workspace/ui/components/hint"
import { CheckIcon, RotateCcwIcon } from "lucide-react"

/**
 * The thread's one decisive action, the way Intercom puts it: a black Close
 * while the conversation is open, Reopen once it is done. Handing over to a
 * person lives in the "…" menu beside it.
 */
export const ConversationStatusButton = ({
  status,
  onClose,
  onReopen,
  disabled,
}: {
  status: Doc<"conversations">["status"]
  onClose: () => void
  onReopen: () => void
  disabled?: boolean
}) => {
  if (status === "resolved") {
    return (
      <Button
        className="gap-1.5"
        disabled={disabled}
        onClick={onReopen}
        size="sm"
        variant="outline"
      >
        <RotateCcwIcon className="size-3.5" />
        Reopen
      </Button>
    )
  }

  return (
    <Hint text="Close conversation">
      <Button
        className="gap-1.5"
        disabled={disabled}
        onClick={onClose}
        size="sm"
      >
        <CheckIcon className="size-3.5" />
        Close
      </Button>
    </Hint>
  )
}
