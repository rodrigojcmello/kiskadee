import type { HexColor, SolidColor } from '../types/colors/colors.types.ts';
import { normalizeHexColor } from './hexColor.ts';

/**
 * Replaces the alpha channel of a HEX color or a dynamic CSS color reference.
 *
 * @param color - Canonical HEX color or supported CSS color reference. Returns undefined if undefined.
 * @param visibility - Visibility percentage from 0 (invisible) to 100 (fully visible)
 * @returns A HEX color or color-mix expression with the requested alpha.
 *
 * @example
 * ```TypeScript
 * // Apple: "disabled uses primary 500 with 20% opacity"
 * const disabled = withAlpha('#0f6cbd', 20);
 * // Result: '#0f6cbd33'
 *
 * // With CSS Variable
 * const dynamic = withAlpha('var(--k-p-light-50)', 50);
 * // Result: 'color-mix(in srgb, var(--k-p-light-50) 50%, transparent)'
 * ```
 */
export function withAlpha(color: SolidColor, visibility: number): SolidColor;
export function withAlpha(
  color: SolidColor | undefined,
  visibility: number
): SolidColor | undefined {
  // Return undefined if the color is undefined
  if (color === undefined) {
    return undefined;
  }

  const clampedVisibility = Math.max(0, Math.min(100, visibility));
  if (color.startsWith('#')) {
    const normalized = normalizeHexColor(color);
    const rgb = normalized.slice(0, 7);
    if (clampedVisibility === 100) return rgb as HexColor;
    const alpha = Math.round((clampedVisibility / 100) * 255)
      .toString(16)
      .padStart(2, '0');
    return `${rgb}${alpha}` as HexColor;
  }

  if (!color.startsWith('var(') && !color.startsWith('color-mix(')) {
    throw new Error(`Unsupported CSS color reference: ${color}`);
  }
  return `color-mix(in srgb, ${color} ${clampedVisibility}%, transparent)`;
}
