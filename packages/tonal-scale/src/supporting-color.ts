import { hexToOklch, oklchToSrgbHex } from './color-math.ts';
import { classifyMunsellHex } from './munsell-oklch.ts';

/** Material-oriented chromatic support; independent of neutral derivation. */
export const SUPPORTING_COLOR_STRATEGY = 'material-support-v1' as const;

export function deriveSupportingColor(sourceHex: string) {
  const source = hexToOklch(sourceHex);
  const seedHex = oklchToSrgbHex({
    l: 40,
    c: Math.min(source.c, 0.12),
    h: (source.h - 25 + 360) % 360
  }).hex;
  return { seedHex, identity: classifyMunsellHex(seedHex) };
}
