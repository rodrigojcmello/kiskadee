import { generatePrimaryScale } from './generator';

export type {
  DefinedFontFamily,
  FontFamilyDefinitionInput,
  FontFamilyPreparationResult,
  FontFamilyPreparationStatus,
  FontFamilyPrepare
} from './fontFamily';
export {
  defineFontFamily,
  getFontFamilyPreparationResult,
  getFontFamilyPreparationStatus,
  prepareFontFamilies,
  prepareFontFamily
} from './fontFamily';
export type {
  ApplyRuntimePlatformClassesOptions,
  RuntimeEngine,
  RuntimeOs,
  RuntimePlatformInfo
} from './platformClasses';
export {
  applyRuntimePlatformClasses,
  clearRuntimePlatformClasses,
  detectRuntimePlatform,
  resolveRuntimePlatformClasses
} from './platformClasses';

/**
 * Applies a dynamic theme by injecting CSS variables for the primary color scale
 * into the document root.
 *
 * @param primaryColorHex - The primary color in Hex format (e.g. #0091FF).
 * @param target - The target element to apply variables to (default: document.documentElement).
 */
export function applyDynamicTheme(
  primaryColorHex: string,
  target: HTMLElement = document.documentElement
): void {
  const vars = generatePrimaryScale(primaryColorHex);

  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value);
  }
}

export { generatePrimaryScale };
