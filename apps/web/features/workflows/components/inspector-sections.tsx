"use client"

import type { ReactNode } from "react"
import { Icon } from "../nodes/StepIcon"

/**
 * The shared grammar every step editor is built from.
 *
 * A Voiceflow-style editor is a stack of hairline-separated sections, each of
 * which is either a titled list with an add button, a labelled switch, or a
 * free-form body. Keeping those three shapes here is what makes every step's
 * panel line up: no editor sets its own padding, rule or row height.
 */

/** A hairline-separated block. `flush` drops the padding for editors that
 *  supply their own (the message composer, the code editor). */
export const InspectorSection = ({
  children,
  flush,
}: {
  children: ReactNode
  flush?: boolean
}) => (
  <section className={`inspector-section${flush ? "flush" : ""}`}>
    {children}
  </section>
)

/** A section headed by a title and an add button, e.g. "Buttons  +". */
export const InspectorListSection = ({
  title,
  onAdd,
  addLabel,
  onRemove,
  removeLabel,
  children,
  empty,
}: {
  title: string
  onAdd?: () => void
  addLabel?: string
  /** Removes the whole section's subject, e.g. one card of a carousel. */
  onRemove?: () => void
  removeLabel?: string
  children?: ReactNode
  empty?: string
}) => (
  <section className="inspector-section">
    <div className="inspector-section-head">
      <h3>{title}</h3>
      {onAdd || onRemove ? (
        <span className="inspector-section-actions">
          {onRemove ? (
            <button
              type="button"
              className="inspector-remove"
              onClick={onRemove}
              aria-label={removeLabel ?? `Remove ${title}`}
              title={removeLabel ?? `Remove ${title}`}
            >
              <Icon name="trash" size={14} />
            </button>
          ) : null}
          {onAdd ? (
            <button
              type="button"
              className="inspector-add"
              onClick={onAdd}
              aria-label={addLabel ?? `Add to ${title}`}
              title={addLabel ?? `Add to ${title}`}
            >
              <Icon name="plus" size={16} />
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
    {children}
    {empty ? <p className="inspector-section-empty">{empty}</p> : null}
  </section>
)

/**
 * One captioned field: the caption above, the control flush beneath it, and
 * an optional sentence of guidance under that. Every plain input in a step
 * editor is one of these, so captions, spacing and hints match everywhere.
 */
export const InspectorField = ({
  label,
  hint,
  action,
  compound = false,
  children,
}: {
  label: ReactNode
  hint?: ReactNode
  /** A small control beside the caption, e.g. "open full window". */
  action?: ReactNode
  /**
   * The control is not one native input — a rich text box with its own
   * toolbar, a pill editor, or several controls in a row. Those must not sit
   * inside a <label>: a click anywhere in a label is forwarded to its first
   * button or input, so clicking into the text pressed Bold.
   */
  compound?: boolean
  children: ReactNode
}) => {
  const caption = action ? (
    <span className="inspector-field-label label-with-action">
      {label}
      {action}
    </span>
  ) : (
    <span className="inspector-field-label">{label}</span>
  )
  const hintLine = hint ? (
    <span className="inspector-field-hint">{hint}</span>
  ) : null

  return compound || action ? (
    <div className="inspector-field">
      {caption}
      {children}
      {hintLine}
    </div>
  ) : (
    <label className="inspector-field">
      {caption}
      {children}
      {hintLine}
    </label>
  )
}

/** A sentence of guidance that belongs to the section, not to one field. */
export const InspectorNote = ({ children }: { children: ReactNode }) => (
  <p className="inspector-section-empty">{children}</p>
)

/**
 * A labelled switch. Rows sharing one section are separated by nothing, so
 * several toggles read as a single settings group the way Voiceflow's
 * "No match / No reply / Listen for other triggers" block does.
 */
export const InspectorToggleRow = ({
  label,
  checked,
  onChange,
  disabled,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  hint?: string
}) => (
  <label className={`inspector-toggle-row${disabled ? "blocked" : ""}`}>
    <span className="inspector-toggle-label">
      {label}
      {hint ? <em>{hint}</em> : null}
    </span>
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span className="agent-switch" aria-hidden />
  </label>
)

/** The pill tab pair used for Scripted|Prompt and Upload|Link. */
export const InspectorSegmented = <T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (next: T) => void
  label: string
}) => (
  <div className="inspector-segmented" role="tablist" aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="tab"
        aria-selected={value === option.value}
        className={value === option.value ? "active" : ""}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
)

/** One removable row inside a list section. */
export const InspectorListRow = ({
  children,
  onRemove,
  removeLabel,
}: {
  children: ReactNode
  onRemove?: () => void
  removeLabel?: string
}) => (
  <div className="inspector-list-row">
    {children}
    {onRemove ? (
      <button
        type="button"
        className="inspector-remove"
        onClick={onRemove}
        aria-label={removeLabel ?? "Remove"}
        title={removeLabel ?? "Remove"}
      >
        <Icon name="close" size={14} />
      </button>
    ) : null}
  </div>
)
