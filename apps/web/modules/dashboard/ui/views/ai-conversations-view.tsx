"use client"

import { AudioLinesIcon, SearchIcon } from "lucide-react"

import { Kbd } from "@workspace/ui/components/kbd"

export const AIConversationsView = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-[26rem] flex-col items-center text-center">
        <span className="console-medallion size-12">
          <AudioLinesIcon className="size-5" />
        </span>

        <p className="mt-5 text-[0.95rem] font-semibold text-foreground">
          Select a transcript
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Pick a call from the list to read the full transcript, with the
          page it started on and how long it lasted.
        </p>

        <span className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <SearchIcon className="size-3.5" />
          Quick search
          <Kbd className="text-[0.62rem]">⌘K</Kbd>
        </span>
      </div>
    </div>
  )
}
