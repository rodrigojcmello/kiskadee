import type { Hex, HSLA } from '@kiskadee/core';
import { convertHslaToHex as coreConvertHslaToHex } from '@kiskadee/core';
import { toShortHex } from './toShortHex.ts';

/**
 * Converts an HSLA array into a hexadecimal color string.
 * - h: hue in degrees (0-360)
 * - s and l: saturation and lightness as percentages (0-100)
 * - a: alpha (0-1)
 *
 * Returns a 6-digit hex if alpha is 1, otherwise an 8-digit hex (including alpha).
 * Uses the short version of the hex string when possible.
 *
 * Throws an error if the hsla parameter is not a valid array of 3 or 4 numbers.
 */
export function convertHslaToHex(hsla: HSLA): Hex {
  // Delegate to the core implementation so the HSLA→Hex logic stays in a
  // single place. This wrapper keeps the existing web-builder import path
  // intact for callers and tests.
  const full = coreConvertHslaToHex(hsla);
  return toShortHex(full);
}
