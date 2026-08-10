import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const IBM_PLEX_SANS_GOOGLE_FAMILY_PARAMETERS = 'IBM Plex Sans:wght@400;500;700';

export const ibmPlexSansFontFamily = defineFontFamily({
  id: 'ibm-plex-sans',
  stack: ['IBM Plex Sans', 'sans-serif'],
  prepare: () =>
    prepareGoogleFontStylesheet('ibm-plex-sans', IBM_PLEX_SANS_GOOGLE_FAMILY_PARAMETERS, {
      weights: [400, 500, 700]
    })
});
