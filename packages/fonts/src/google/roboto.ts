import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const ROBOTO_GOOGLE_FAMILY_PARAMETERS = 'Roboto:wght@400;500;700;800';

export const robotoFontFamily = defineFontFamily({
  id: 'roboto',
  stack: ['Roboto', 'sans-serif'],
  prepare: () =>
    prepareGoogleFontStylesheet('roboto', ROBOTO_GOOGLE_FAMILY_PARAMETERS, {
      weights: [400, 500, 700, 800]
    })
});
