import type { FontFamilyPreparationResult } from '@kiskadee/runtime/font-family';
import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const OPEN_SANS_GOOGLE_FAMILY_PARAMETERS = 'Open Sans:wght@400;500;600;700';

export function prepareOpenSansFontFamily(): Promise<FontFamilyPreparationResult> {
  return prepareGoogleFontStylesheet('open-sans', OPEN_SANS_GOOGLE_FAMILY_PARAMETERS);
}

export const openSansFontFamily = defineFontFamily({
  id: 'open-sans',
  stack: ['Open Sans', 'sans-serif'],
  prepare: prepareOpenSansFontFamily
});
