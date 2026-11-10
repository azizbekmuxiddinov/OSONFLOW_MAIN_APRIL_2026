"use client"

import { InboxIcon } from "lucide-react"

import { InboxEmptyPane, InboxKey } from "../components/inbox-empty-pane"

export const ConversationsView = () => (
  <InboxEmptyPane
    description="Select a thread from the list to read it and reply."
    icon={InboxIcon}
    title="No conversation open"
  >
    <span className="flex items-center gap-1.5">
      <InboxKey>J</InboxKey>
      <InboxKey>K</InboxKey>
      <span>Move through the list</span>
    </span>
    <span className="flex items-center gap-1.5">
      <InboxKey>/</InboxKey>
      <span>Search it</span>
    </span>
    <span className="flex items-center gap-1.5">
      <InboxKey>⌘</InboxKey>
      <InboxKey>K</InboxKey>
      <span>Go anywhere</span>
    </span>
  </InboxEmptyPane>
)
