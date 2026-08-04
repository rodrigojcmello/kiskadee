import { defineFontFamily } from '@kiskadee/runtime/font-family';
import { prepareGoogleFontStylesheet } from './prepareGoogleFontStylesheet.ts';

export const LORA_GOOGLE_FAMILY_PARAMETERS = 'Lora:wght@400;500;700';

export const loraFontFamily = defineFontFamily({
  id: 'lora',
  stack: ['Lora', 'serif'],
  prepare: () => prepareGoogleFontStylesheet('lora', LORA_GOOGLE_FAMILY_PARAMETERS)
});
