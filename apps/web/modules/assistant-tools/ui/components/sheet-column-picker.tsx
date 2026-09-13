"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { CheckIcon } from "lucide-react"

type SheetColumnPickerProps = {
  label: string
  description?: string
  columns: string[]
  selected: string[]
  isLoading?: boolean
  emptyMessage?: string
  onChange: (columns: string[]) => void
}

/** Column headers as toggle pills — the selection reads at a glance. */
export const SheetColumnPicker = ({
  label,
  description,
  columns,
  selected,
  isLoading = false,
  emptyMessage = "Choose a spreadsheet and tab above to load its columns.",
  onChange,
}: SheetColumnPickerProps) => {
  const selectedSet = new Set(selected)

  const toggleColumn = (column: string) => {
    if (selectedSet.has(column)) {
      onChange(selected.filter((value) => value !== column))
      return
    }

    onChange([...selected, column])
  }

  return (
    <div role="group" aria-label={label}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {columns.length > 0 ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {selected.filter((column) => columns.includes(column)).length} of{" "}
            {columns.length}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1 max-w-[62ch] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      <div className="mt-3">
        {isLoading ? (
          <div aria-busy="true" className="flex flex-wrap gap-2" role="status">
            <span className="sr-only">Loading columns</span>
            {["w-20", "w-24", "w-16", "w-28"].map((width) => (
              <Skeleton className={`h-8 rounded-full ${width}`} key={width} />
            ))}
          </div>
        ) : columns.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const checked = selectedSet.has(column)

              return (
                <button
                  aria-checked={checked}
                  className="tools-chip"
                  key={column}
                  onClick={() => toggleColumn(column)}
                  role="checkbox"
                  type="button"
                >
                  {checked ? (
                    <CheckIcon aria-hidden className="size-3.5 text-primary" />
                  ) : null}
                  {column}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
