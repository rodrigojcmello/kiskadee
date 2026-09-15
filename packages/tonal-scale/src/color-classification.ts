import type { TonalColorClassification } from '@kiskadee/core';
import { classifyMunsellHex, MUNSELL_OKLCH_PROJECTION } from './munsell-oklch.ts';

export { MUNSELL_OKLCH_PROJECTION, MUNSELL_OKLCH_SECTOR_ORDER } from './munsell-oklch.ts';

/** Classification of the Light vivid reference, independent of segment/theme selection. */
export function classifyTonalReference(referenceHex: string): TonalColorClassification {
  const result = classifyMunsellHex(referenceHex);
  const achromatic = result.oklch.c < 0.0001;
  return {
    classifier: MUNSELL_OKLCH_PROJECTION,
    referenceHex: result.hex,
    sector: achromatic ? null : result.sector,
    positionInSector: achromatic ? null : result.positionInSector
  };
}
