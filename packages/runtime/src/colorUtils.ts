/**
 * Converts a hex color string to an HSL tuple.
 * Supports #RRGGBB and #RGB formats.
 */
export function hexToHsl(hex: string): [number, number, number] {
  let c = hex.trim();
  if (c.startsWith('#')) {
    c = c.slice(1);
  }

  let r = 0;
  let g = 0;
  let b = 0;

  if (c.length === 3) {
    r = Number.parseInt(c[0] + c[0], 16);
    g = Number.parseInt(c[1] + c[1], 16);
    b = Number.parseInt(c[2] + c[2], 16);
  } else if (c.length === 6) {
    r = Number.parseInt(c.slice(0, 2), 16);
    g = Number.parseInt(c.slice(2, 4), 16);
    b = Number.parseInt(c.slice(4, 6), 16);
  } else {
    // Fallback or throw? For runtime safety, maybe just return 0,0,0 or throw.
    // Let's assume valid input or fallback to black to avoid crash.
    return [0, 0, 0];
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
