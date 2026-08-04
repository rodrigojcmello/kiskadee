import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const UBUNTU_GOOGLE_FAMILY_PARAMETERS = 'Ubuntu:wght@400;500;700';

export const ubuntuFontFamily = defineFontFamily({
  id: 'ubuntu',
  stack: ['Ubuntu', 'sans-serif'],
  prepare: () => prepareGoogleFontStylesheet('ubuntu', UBUNTU_GOOGLE_FAMILY_PARAMETERS)
});
