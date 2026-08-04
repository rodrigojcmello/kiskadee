import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const NOTO_SANS_GOOGLE_FAMILY_PARAMETERS = 'Noto Sans:wght@400;500;700';

export const notoSansFontFamily = defineFontFamily({
  id: 'noto-sans',
  stack: ['Noto Sans', 'sans-serif'],
  prepare: () => prepareGoogleFontStylesheet('noto-sans', NOTO_SANS_GOOGLE_FAMILY_PARAMETERS)
});
