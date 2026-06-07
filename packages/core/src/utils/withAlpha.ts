import type { SolidColor } from '../types/colors/colors.types.ts';

/**
 * Applies visibility (opacity) to an HSLA color.
 *
 * This helper was designed for designer-friendly usage:
 * uses 0-100 scale (percentage) instead of the standard HSLA 0-1.
 * The conversion to the internal HSLA format is done automatically.
 *
 * @param color - Color in HSLA format [hue, saturation, lightness, alpha] or CSS string. Returns undefined if undefined.
 * @param visibility - Visibility percentage from 0 (invisible) to 100 (fully visible)
 * @returns New HSLA color with modified alpha, or string with injected alpha, or undefined
 *
 * @example
 * ```TypeScript
 * // Apple: "disabled uses primary 500 with 20% opacity"
 * const disabled = withAlpha(palette.p1.primary.solid[50]!, 20);
 * // Result: [206, 100, 50, 0.2]
 *
 * // With CSS Variable
 * const dynamic = withAlpha('hsl(var(--k-p-50))', 50);
 * // Result: 'hsl(var(--k-p-50) / 0.5)'
 * ```
 */
export function withAlpha(
  color: SolidColor | undefined,
  visibility: number
): SolidColor | undefined {
  // Return undefined if the color is undefined
  if (color === undefined) {
    return undefined;
  }

  if (typeof color === 'string') {
    if (color.startsWith('hsl(') && color.endsWith(')')) {
      const clampedVisibility = Math.max(0, Math.min(100, visibility));
      const alpha = clampedVisibility / 100;
      return `${color.slice(0, -1)} / ${alpha})`;
    }
    return color;
  }

  const [h, s, l] = color;

  // Clamp between 0-100 to ensure valid values
  const clampedVisibility = Math.max(0, Math.min(100, visibility));

  // Convert percentage (0-100) to HSLA alpha (0-1)
  const alpha = clampedVisibility / 100;

  return [h, s, l, alpha];
}
