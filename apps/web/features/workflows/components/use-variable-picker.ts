"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  buildVariableToken,
  type WorkflowVariable,
} from "../lib/variable-tokens"

/**
 * The "{" variable picker shared by the message editor and the single-line
 * variable inputs.
 */
export const useVariablePicker = ({
  editorRef,
  variables,
  onInserted,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>
  variables: WorkflowVariable[]
  onInserted: (editor: HTMLDivElement) => void
}) => {
  const [picker, setPicker] = useState<{
    query: string
    top: number
    left: number
  } | null>(null)
  /**
   * What the pick will replace. Captured when the picker opens: by the time
   * the author clicks a row the live selection has moved to the button.
   *
   * Two ways in. `text` is the "{query" being typed. `token` is an existing
   * pill the author clicked to change their mind about, which has no caret
   * near it at all — it is `contenteditable="false"`, so clicking one never
   * placed a selection to measure from.
   */
  type PickerAnchor =
    | { kind: "text"; node: Text; end: number; length: number }
    | { kind: "token"; element: HTMLElement }

  const anchorRef = useRef<PickerAnchor | null>(null)

  const readQuery = () => {
    const selection = window.getSelection()
    const node = selection?.focusNode

    if (!selection || !node || node.nodeType !== Node.TEXT_NODE) {
      return null
    }

    const before = (node.textContent ?? "").slice(0, selection.focusOffset)
    const match = /\{([\w.-]*)$/.exec(before)

    return match ? { query: match[1] ?? "", length: match[0].length } : null
  }

  const refresh = useCallback(() => {
    const editor = editorRef.current
    const found = readQuery()

    if (!editor || !found) {
      anchorRef.current = null
      setPicker(null)
      return
    }

    const selection = window.getSelection()

    if (selection?.focusNode) {
      anchorRef.current = {
        kind: "text",
        node: selection.focusNode as Text,
        end: selection.focusOffset,
        length: found.length,
      }
    }

    const range = selection?.getRangeAt(0).cloneRange()
    const rect = range?.getClientRects()[0] ?? range?.getBoundingClientRect()
    const host = editor.getBoundingClientRect()

    setPicker({
      query: found.query,
      top: (rect ? rect.bottom - host.top : 20) + 6,
      left: Math.max(0, (rect ? rect.left - host.left : 0) - 8),
    })
  }, [editorRef])

  /**
   * Opens the picker on an existing pill, so clicking one offers the same list
   * as typing "{" and swaps it in place.
   */
  const openForToken = useCallback(
    (element: HTMLElement) => {
      const editor = editorRef.current

      if (!editor || !editor.contains(element)) {
        return
      }

      anchorRef.current = { kind: "token", element }

      const rect = element.getBoundingClientRect()
      const host = editor.getBoundingClientRect()

      setPicker({
        query: "",
        top: rect.bottom - host.top + 6,
        left: Math.max(0, rect.left - host.left - 8),
      })
    },
    [editorRef]
  )

  const insert = useCallback(
    (name: string) => {
      const editor = editorRef.current
      const anchor = anchorRef.current

      if (!editor || !anchor) {
        return
      }

      const target =
        anchor.kind === "text" ? anchor.node : anchor.element

      if (!editor.contains(target)) {
        return
      }

      const range = document.createRange()

      if (anchor.kind === "text") {
        // Swallow the "{query" the author typed, then drop the pill in.
        range.setStart(anchor.node, Math.max(0, anchor.end - anchor.length))
        range.setEnd(anchor.node, anchor.end)
      } else {
        range.selectNode(anchor.element)
      }

      range.deleteContents()

      // Replacing a pill needs no trailing space: whatever spacing the author
      // already had around it is still there.
      const fragment = range.createContextualFragment(
        anchor.kind === "text"
          ? `${buildVariableToken(name, variables)}&nbsp;`
          : buildVariableToken(name, variables)
      )
      const lastNode = fragment.lastChild
      range.insertNode(fragment)
      editor.focus()

      const selection = window.getSelection()

      if (selection && lastNode) {
        const caret = document.createRange()
        caret.setStartAfter(lastNode)
        caret.collapse(true)
        selection.removeAllRanges()
        selection.addRange(caret)
      }

      anchorRef.current = null
      setPicker(null)
      onInserted(editor)
    },
    [editorRef, onInserted, variables]
  )

  const matches = picker
    ? variables.filter((entry) =>
        entry.name.toLowerCase().includes(picker.query.toLowerCase())
      )
    : []

  useEffect(() => {
    if (!picker) {
      return
    }

    const close = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null

      /*
       * Anything that is not the list itself dismisses it — a press back
       * inside the editor included, which previously left the list hanging
       * over the text you were trying to read.
       *
       * The list is excluded by element rather than by testing the editor,
       * because it is a sibling of the editor inside the same shell: testing
       * the editor would dismiss the list before a click on one of its rows
       * could land. A press on a pill is dismissed here too, and its own
       * click handler reopens the list a moment later on the new anchor.
       */
      if (!target?.closest?.(".variable-picker")) {
        setPicker(null)
      }
    }

    window.addEventListener("pointerdown", close)
    return () => window.removeEventListener("pointerdown", close)
  }, [picker])

  return {
    picker,
    matches,
    refresh,
    insert,
    openForToken,
    close: () => setPicker(null),
  }
}
