import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const INTER_GOOGLE_FAMILY_PARAMETERS = 'Inter:wght@400;500;700';

export const interFontFamily = defineFontFamily({
  id: 'inter',
  stack: ['Inter', 'sans-serif'],
  prepare: () =>
    prepareGoogleFontStylesheet('inter', INTER_GOOGLE_FAMILY_PARAMETERS, {
      weights: [400, 500, 700]
    })
});
