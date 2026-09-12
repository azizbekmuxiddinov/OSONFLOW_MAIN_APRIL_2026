"use client"

import type { CSSProperties } from "react"

import { hexToHue, hslToHex } from "../lib/color"

/**
 * A hue slider that sits under a menu's preset swatches.
 *
 * The presets stay: they are the colours most people want and they are named.
 * This is for the cases a fixed six cannot cover — telling two blue branches
 * apart, or matching a brand. Only hue moves, so every colour it can produce
 * is as legible as the presets beside it.
 */
const ColorSlider = ({
  value,
  saturation,
  lightness,
  onChange,
  label,
}: {
  /** Current colour as #rrggbb. A grey parks the thumb at the left. */
  value: string
  saturation: number
  lightness: number
  onChange: (hex: string) => void
  label: string
}) => {
  const hue = hexToHue(value) ?? 0

  return (
    <div className="color-slider">
      <input
        type="range"
        min={0}
        max={359}
        value={hue}
        aria-label={label}
        style={{ "--slider-swatch": value } as CSSProperties}
        onChange={(event) =>
          onChange(hslToHex(Number(event.target.value), saturation, lightness))
        }
      />
    </div>
  )
}

export default ColorSlider
