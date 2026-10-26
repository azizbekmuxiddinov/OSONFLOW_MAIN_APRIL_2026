"use client"

import { InboxIcon } from "lucide-react"
import { Kbd } from "@workspace/ui/components/kbd"

export const ConversationsView = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background p-6">
      <div className="flex max-w-[320px] flex-col items-center gap-5 text-center">
        <div className="console-medallion size-12">
          <InboxIcon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            No conversation open
          </p>
          <p className="mt-1.5 max-w-[220px] text-sm text-muted-foreground">
            Select a thread from the left panel to view messages and reply.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Kbd className="text-[10px]">J</Kbd>
            <Kbd className="text-[10px]">K</Kbd>
            <span>Move through the list</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd className="text-[10px]">/</Kbd>
            <span>Search it</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd className="text-[10px]">⌘K</Kbd>
            <span>Go anywhere</span>
          </span>
        </div>
      </div>
    </div>
  )
}
