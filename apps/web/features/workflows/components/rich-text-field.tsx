"use client"

import { useRef } from "react"

import type { WorkflowVariable } from "../lib/variable-tokens"
import Icon from "../nodes/StepIcon"
import { MessageEditorInput } from "./message-editor-input"

export type MessageFormat = "bold" | "italic" | "underline" | "strike" | "link"

/**
 * A field the customer will read, with the Message step's writing tools.
 *
 * Only copy that reaches the end of the conversation gets one of these: a
 * prompt, a card description. Instructions to a model, a JSON body and the
 * author's own notes stay plain, because formatting there would be noise the
 * runtime throws away.
 *
 * The toolbar finds its own editor through the wrapper rather than through the
 * panel, so several of these can sit in one step editor without the buttons
 * reaching into the wrong field.
 */
export const RichTextField = ({
  fieldId,
  value,
  placeholder,
  ariaLabel,
  variables,
  onChange,
  onFormat,
}: {
  /** Distinct per field, so switching steps re-seeds the editor. */
  fieldId: string
  value: string
  placeholder: string
  ariaLabel: string
  variables?: WorkflowVariable[]
  onChange: (html: string) => void
  /** The panel's own rich-text command, handed this field's editor and sync. */
  onFormat: (
    format: MessageFormat,
    editor: HTMLElement | null,
    sync: (html: string) => void
  ) => void
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const apply = (format: MessageFormat) =>
    onFormat(
      format,
      wrapperRef.current?.querySelector<HTMLElement>(".message-editor-input") ??
        null,
      onChange
    )

  return (
    <div className="rich-text-field" ref={wrapperRef}>
      <div className="message-editor-toolbar" aria-label={`${ariaLabel} tools`}>
        <button
          type="button"
          title="Bold"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => apply("bold")}
        >
          B
        </button>
        <button
          type="button"
          title="Italic"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => apply("italic")}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          title="Underline"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => apply("underline")}
        >
          <u>U</u>
        </button>
        <button
          type="button"
          title="Strikethrough"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => apply("strike")}
        >
          <s>S</s>
        </button>
        <span aria-hidden />
        <button
          type="button"
          title="Insert link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => apply("link")}
        >
          <Icon name="link" size={16} />
        </button>
      </div>
      <MessageEditorInput
        nodeId={fieldId}
        value={value}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        variables={variables}
        onSync={(_fieldId, html) => onChange(html)}
      />
    </div>
  )
}

export default RichTextField
