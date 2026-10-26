"use client"

import { useAtom } from "jotai/react"
import {
  assignmentFilterAtom,
  priorityFilterAtom,
  sourceFilterAtom,
  statusFilterAtom,
} from "../../atoms"

/**
 * The inbox views, as the Inbox sidebar lists them. They span four stored
 * filters (status, assignment, source, priority), but only one view is ever on
 * at a time, so picking one resets the others rather than silently combining
 * into an empty list.
 */
export type ConversationView =
  | "all"
  | "unresolved"
  | "escalated"
  | "resolved"
  | "assigned_to_me"
  | "unassigned"
  | "workflow"
  | "widget"
  | "prioritized"

export const useConversationView = () => {
  const [status, setStatus] = useAtom(statusFilterAtom)
  const [assignment, setAssignment] = useAtom(assignmentFilterAtom)
  const [source, setSource] = useAtom(sourceFilterAtom)
  const [priority, setPriority] = useAtom(priorityFilterAtom)

  const view: ConversationView =
    priority !== "all"
      ? priority
      : source !== "all"
        ? source
        : assignment !== "all"
          ? assignment
          : status

  const setView = (next: ConversationView) => {
    setPriority(next === "prioritized" ? next : "all")
    setSource(next === "workflow" || next === "widget" ? next : "all")
    setAssignment(
      next === "assigned_to_me" || next === "unassigned" ? next : "all"
    )
    setStatus(
      next === "unresolved" || next === "escalated" || next === "resolved"
        ? next
        : "all"
    )
  }

  return { view, setView }
}
