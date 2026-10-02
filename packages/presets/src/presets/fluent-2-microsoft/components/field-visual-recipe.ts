import { type KiskadeeTone, primitive } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';
import { FLUENT_BUTTON_ON_VIVID_RECIPE } from './button-color-formula.ts';
import { createBalancedLowBorder } from './button-perceptual-alpha.ts';
import { createNeutralControlRecipe } from './neutral-control-recipe.ts';

export const fieldTypography = {
  's:sm:1': 'caption-medium',
  's:md:1': 'body-medium',
  's:lg:1': 'body-large'
} as const;
export const fieldSizes = (small: number, medium: number, large: number) => ({
  's:sm:1': small,
  's:md:1': medium,
  's:lg:1': large
});
// Authoring-only recipes: consumers retain independent schema elements and runtime behavior.
export function createFieldVisualRecipe(
  c: Fluent2MicrosoftColorResolver,
  theme: 'light' | 'dark' | 'darker',
  vivid = false
) {
  const dark = theme !== 'light';
  const track = dark ? 'd' : 'l';
  const palette = <T>(onSubtle: T) => ({
    default: { [theme]: { [vivid ? 'onVivid' : 'onSubtle']: onSubtle } }
  });
  const neutral = (tone: KiskadeeTone) =>
    c.resolve('default', track, exactColor('textField.neutral', tone, 'component.text-field'));
  const transparent = c.resolve(
    'default',
    track,
    absoluteCap(primitive('black', 'v1'), 'light', 0)
  );
  const white = c.resolve('default', track, absoluteCap(primitive('black', 'v1'), 'light'));
  const neutralVivid = c.resolve(
    'default',
    track,
    referenceColor('textField.neutral', 'vivid', theme === 'darker' ? -1 : 0)
  );
  const onSurfaceForeground = dark ? white : neutralVivid;
  const foreground = vivid
    ? c.resolve('default', 'l', referenceColor('textField.neutral', 'subtle', 4))
    : onSurfaceForeground;
  const lightCap = (alpha: number) =>
    c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'light', alpha));
  const brand = c.resolve(
    'default',
    vivid ? 'l' : track,
    referenceColor('primary', vivid ? 'subtle' : 'vivid', vivid ? 4 : 0)
  );
  const error = c.resolve('default', track, referenceColor('textField.error', 'vivid'));
  const warning = c.resolve('default', track, referenceColor('textField.warning', 'vivid'));
  const disabledText = vivid
    ? lightCap(FLUENT_BUTTON_ON_VIVID_RECIPE.disabled.foregroundAlpha)
    : neutral(dark ? 35 : 16);
  const disabledStroke = vivid
    ? lightCap(FLUENT_BUTTON_ON_VIVID_RECIPE.low.lightBorderAlpha.disabled)
    : neutral(dark ? 24 : 7);
  const outlineStroke = vivid
    ? lightCap(FLUENT_BUTTON_ON_VIVID_RECIPE.low.borderAlpha[theme])
    : createBalancedLowBorder({
        color: neutralVivid,
        surface:
          theme === 'darker'
            ? c.resolve('default', track, absoluteCap(primitive('black', 'v1'), 'dark'))
            : dark
              ? neutral(5)
              : white,
        targetDeltaE: dark ? 0.18 : 0.06
      });
  const neutralControl = createNeutralControlRecipe(c, theme, vivid);
  const outlineIndicator = neutralControl.bottom.rest;
  const outlineIndicatorHover = neutralControl.bottom.hover;
  const borderlessSurface = c.resolve(
    'default',
    track,
    exactColor('card.neutral', theme === 'darker' ? 2 : 3, 'component.card')
  );
  const stroke = vivid ? outlineStroke : neutral(dark ? 40 : 10);
  const strokeHover = vivid ? white : neutral(dark ? 50 : 12);
  const underline = vivid ? lightCap(75) : neutral(dark ? 80 : 50);
  const underlineHover = vivid ? white : neutral(dark ? 85 : 55);
  const placeholder = vivid ? foreground : neutral(dark ? 75 : 40);
  const filled = dark ? borderlessSurface : neutral(2);
  return {
    palette,
    neutral,
    transparent,
    white,
    onSurfaceForeground,
    foreground,
    brand,
    error,
    warning,
    disabledText,
    disabledStroke,
    outlineStroke,
    neutralControl,
    outlineIndicator,
    outlineIndicatorHover,
    borderlessSurface,
    stroke,
    strokeHover,
    underline,
    underlineHover,
    placeholder,
    filled
  };
}
