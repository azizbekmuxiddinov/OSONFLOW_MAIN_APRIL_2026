/**
 * Hue <-> hex, for the colour sliders on the node and line menus.
 *
 * The sliders move one axis only. Saturation and lightness are fixed per
 * surface so a hand-picked colour still belongs to the palette the preset
 * swatches come from: the canvas reads as one design whatever hue someone
 * lands on, and no slider position can produce something unreadable.
 */

const toHexPair = (value: number) =>
  Math.round(value * 255)
    .toString(16)
    .padStart(2, '0');

export const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const s = saturation / 100;
  const l = lightness / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return `#${toHexPair(channel(0))}${toHexPair(channel(8))}${toHexPair(channel(4))}`;
};

/** Hue of a #rrggbb colour, or null if it is grey or unparseable. */
export const hexToHue = (hex: string | undefined): number | null => {
  const match = /^#([\da-f]{6})$/i.exec(hex?.trim() ?? '');

  if (!match) {
    return null;
  }

  const int = Number.parseInt(match[1]!, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // A grey has no hue to report; the caller decides where to park the thumb.
  if (delta === 0) {
    return null;
  }

  let hue: number;

  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  return Math.round(((hue * 60) % 360 + 360) % 360);
};
