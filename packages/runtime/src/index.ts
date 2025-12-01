import { hexToHsl } from './colorUtils';
import { generatePrimaryScale } from './generator';

/**
 * Applies a dynamic theme by injecting CSS variables for the primary color scale
 * into the document root.
 *
 * @param primaryColorHex - The primary color in Hex format (e.g. #0091FF).
 * @param target - The target element to apply variables to (default: document.documentElement).
 */
export function applyDynamicTheme(primaryColorHex: string, target: HTMLElement = document.documentElement): void {
  const [h, s] = hexToHsl(primaryColorHex);
  const vars = generatePrimaryScale(h, s);

  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value);
  }
}

export { hexToHsl, generatePrimaryScale };
