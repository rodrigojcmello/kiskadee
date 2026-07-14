import type { HexColor } from '@kiskadee/core';

/**
 * Helper function to convert a full hex color string into its shorthand version,
 * if possible. For example, "#000000" becomes "#000" and "#ff00ff00" becomes "#f00f".
 *
 * The function expects an input that starts with "#" and has either:
 * - 4 characters (valid 3-digit shorthand), or
 * - 7 characters (a 6-digit hex color), or
 * - 9 characters (an 8-digit hex color).
 *
 * If the input format is invalid, an Error is thrown.
 * If the full hex color cannot be shortened (i.e., each pair of digits is not identical),
 * the original hex color is returned.
 */
export function toShortHex(hex: HexColor): HexColor {
  if (hex[0] !== '#') {
    throw new Error(`Invalid hex format: ${hex}`);
  }

  // Already shortened (3-digit)
  if (hex.length === 4) {
    return hex;
  }

  if (hex.length !== 7 && hex.length !== 9) {
    throw new Error(`Invalid hex format: ${hex}`);
  }

  let short = '#';
  let isShortenable = true;

  for (let i = 1; i < hex.length; i += 2) {
    if (hex[i] !== hex[i + 1]) {
      isShortenable = false;
      break;
    }
    short += hex[i];
  }

  return (isShortenable ? short : hex) as HexColor;
}
