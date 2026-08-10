import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const FIRA_SANS_GOOGLE_FAMILY_PARAMETERS = 'Fira Sans:wght@400;500;700';

export const firaSansFontFamily = defineFontFamily({
  id: 'fira-sans',
  stack: ['Fira Sans', 'sans-serif'],
  prepare: () =>
    prepareGoogleFontStylesheet('fira-sans', FIRA_SANS_GOOGLE_FAMILY_PARAMETERS, {
      weights: [400, 500, 700]
    })
});
