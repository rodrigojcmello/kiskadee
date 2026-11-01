import { deriveComplementaryColor } from './complementary-color.ts';

/** Material-oriented chromatic support; independent of neutral derivation. */
export const SUPPORTING_COLOR_STRATEGY = 'material-support-v1' as const;

export function deriveSupportingColor(sourceHex: string) {
  return deriveComplementaryColor(sourceHex, 'material-complement-v1');
}
