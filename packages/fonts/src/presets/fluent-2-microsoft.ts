import type { FontStack } from '@kiskadee/core';
import {
  type DefinedFontFamily,
  defineFontFamily,
  type FontFamilyPreparationResult
} from '@kiskadee/runtime/font-family';
import { prepareOpenSansFontFamily } from '../google/open-sans.ts';

const SEGEO_LOCAL_FAMILIES = ['Segoe UI', 'Segoe UI Web (West European)'] as const;

export const FLUENT_2_MICROSOFT_FONT_STACK = Object.freeze([
  'Segoe UI',
  'Segoe UI Web (West European)',
  'Open Sans',
  '-apple-system',
  'BlinkMacSystemFont',
  'Roboto',
  'Helvetica Neue',
  'sans-serif'
]) as FontStack;

async function findInstalledSegoe(): Promise<string | undefined> {
  if (typeof FontFace === 'undefined') return undefined;

  try {
    return await Promise.any(
      SEGEO_LOCAL_FAMILIES.map((family, index) =>
        new FontFace(`__kiskadee-segoe-probe-${index}`, `local("${family}")`)
          .load()
          .then(() => family)
      )
    );
  } catch {
    return undefined;
  }
}

/**
 * What
 *     Preserves an installed Segoe family and prepares Open Sans only when Segoe is unavailable.
 * Why
 *     Fluent remains source-faithful while non-Windows hosts receive an optional online fallback.
 */
export async function prepareFluent2MicrosoftFontFamily(): Promise<FontFamilyPreparationResult> {
  const installedFamily = await findInstalledSegoe();
  if (installedFamily) {
    return {
      family: installedFamily,
      source: 'local'
    };
  }

  const fallback = await prepareOpenSansFontFamily();
  return {
    ...fallback,
    fallbackFor: 'Segoe UI'
  };
}

export const fluent2MicrosoftFontFamily = defineFontFamily({
  id: 'segoe-ui',
  stack: FLUENT_2_MICROSOFT_FONT_STACK,
  prepare: prepareFluent2MicrosoftFontFamily
});

export const fluent2MicrosoftFontFamilies: readonly DefinedFontFamily[] = Object.freeze([
  fluent2MicrosoftFontFamily
]);
