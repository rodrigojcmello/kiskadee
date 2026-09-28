import { primitive } from '@kiskadee/core';
import { bindPresetColorRole } from '../../../utils/presetColor.ts';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver
} from '../fluent-2-microsoft.color.ts';
import {
  FLUENT_BUTTON_DEFAULT_TONAL_RECIPE,
  FLUENT_BUTTON_ON_VIVID_RECIPE
} from './button-color-formula.ts';

// Shared authoring recipe for Outline TextField, low-neutral Button and future Select.
export function createNeutralControlRecipe(
  c: Fluent2MicrosoftColorResolver,
  theme: 'light' | 'dark',
  vivid: boolean
) {
  const dark = theme === 'dark';
  const track = dark ? 'd' : 'l';
  const cap = (alpha: number, polarity: 'light' | 'dark' = 'light') =>
    c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), polarity, alpha));
  return {
    hoverBackground: vivid
      ? cap(
          dark
            ? FLUENT_BUTTON_ON_VIVID_RECIPE.low.hoverAlpha
            : FLUENT_BUTTON_ON_VIVID_RECIPE.low.lightSurfaceAlpha.hover,
          dark ? 'dark' : 'light'
        )
      : c.resolve(
          'default',
          track,
          bindPresetColorRole('button.neutral', FLUENT_BUTTON_DEFAULT_TONAL_RECIPE[theme].low.hover)
        ),
    bottom: {
      rest: vivid
        ? cap(dark ? 85 : 38)
        : c.resolve(
            'default',
            track,
            exactColor('textField.neutral', dark ? 80 : 12, 'component.text-field')
          ),
      hover: vivid
        ? cap(100)
        : c.resolve(
            'default',
            track,
            exactColor('textField.neutral', dark ? 90 : 22, 'component.text-field')
          )
    }
  };
}
