"use client"

import { AudioLinesIcon } from "lucide-react"

import { InboxEmptyPane, InboxKey } from "../components/inbox-empty-pane"

export const AIConversationsView = () => (
  <InboxEmptyPane
    description="Pick a call from the list to read the full transcript, with the page it started on and how long it lasted."
    icon={AudioLinesIcon}
    title="Select a transcript"
  >
    <span className="flex items-center gap-1.5">
      <InboxKey>/</InboxKey>
      <span>Search calls</span>
    </span>
    <span className="flex items-center gap-1.5">
      <InboxKey>⌘</InboxKey>
      <InboxKey>K</InboxKey>
      <span>Go anywhere</span>
    </span>
  </InboxEmptyPane>
)
