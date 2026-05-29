import { breakpoints, type ColorProperty, CssColorProperty, scaleProperties } from '@kiskadee/core';
import {
  type TransformShadowKeyToCssOptions,
  transformBorderStyleKeyToCss,
  transformShadowKeyToCss,
  transformTextAlignKeyToCss,
  transformTextFontKeyToCss,
  transformTextItalicKeyToCss,
  transformTextLineTypeKeyToCss,
  transformTextWeightKeyToCss
} from './decorations/index.ts';
import { transformBorderRadiusKeyToCss } from './effects/transformBorderRadiusKeyToCss/transformBorderRadiusKeyToCss.ts';
import { transformRippleKeyToCss } from './effects/transformRippleKeyToCss/transformRippleKeyToCss.ts';
import { transformThumbSizeKeyToCss } from './effects/transformThumbSizeKeyToCss/transformThumbSizeKeyToCss.ts';
import {
  type TransformColorKeyToCssOptions,
  transformColorKeyToCss
} from './palettes/transformColorKeyToCss.ts';
import { transformActivationFeedbackKeyToCss } from './effects/transformActivationFeedbackKeyToCss/transformActivationFeedbackKeyToCss.ts';
import {
  type TransformScaleKeyToCssOptions,
  transformScaleKeyToCss
} from './scales/transformScaleKeyToCss.ts';

export type GenerateCssRuleFromStyleKeyOptions = TransformColorKeyToCssOptions &
  TransformScaleKeyToCssOptions &
  TransformShadowKeyToCssOptions;

export function generateCssRuleFromStyleKey(
  styleKey: string,
  className: string,
  forceState?: boolean,
  options?: GenerateCssRuleFromStyleKeyOptions
): string {
  let generatedCss: string | undefined;

  // Appearances ---------------------------------------------------------------------------------
  if (styleKey.startsWith('borderStyle')) {
    generatedCss = transformBorderStyleKeyToCss(styleKey, className);
  } else if (styleKey.startsWith('activationFeedback')) {
    generatedCss = transformActivationFeedbackKeyToCss(styleKey, className);
  } else if (styleKey.startsWith('thumbSize')) {
    generatedCss = transformThumbSizeKeyToCss(styleKey, className);
  } else if (styleKey.startsWith('shadow')) {
    generatedCss = transformShadowKeyToCss(styleKey, className, forceState, options);
    // [RIPPLE EFFECT 12] START: Route ripple style keys through ripple CSS transformer.
  } else if (styleKey.startsWith('ripple')) {
    generatedCss = transformRippleKeyToCss(styleKey, className);
    // [RIPPLE EFFECT 12] END: Route ripple style keys through ripple CSS transformer.
  } else if (styleKey.startsWith('textAlign')) {
    generatedCss = transformTextAlignKeyToCss(styleKey, className);
  } else if (styleKey.startsWith('textFont')) {
    generatedCss = transformTextFontKeyToCss(styleKey, className);
  } else if (styleKey.startsWith('textLineType')) {
    generatedCss = transformTextLineTypeKeyToCss(styleKey, className);
  } else if (styleKey.startsWith('textItalic')) {
    generatedCss = transformTextItalicKeyToCss(styleKey, className);
  } else if (styleKey.startsWith('textWeight')) {
    generatedCss = transformTextWeightKeyToCss(styleKey, className);
  } else if (generatedCss === undefined) {
    const isBorderRadiusEffectKey =
      styleKey.startsWith('borderRadius') && (styleKey.includes('--') || styleKey.includes('=='));
    const matchScale = scaleProperties.find((scaleProperty) => styleKey.startsWith(scaleProperty));
    if (matchScale != null && !isBorderRadiusEffectKey) {
      generatedCss = transformScaleKeyToCss(styleKey, breakpoints, className, options);
    } else {
      // Colors ------------------------------------------------------------------------------------
      const colorProperties = Object.keys(CssColorProperty) as ColorProperty[];
      const matchColor = colorProperties.find((colorProperty) =>
        styleKey.startsWith(colorProperty)
      );
      if (matchColor != null) {
        generatedCss = transformColorKeyToCss(styleKey, className, forceState, options);
      } else if (isBorderRadiusEffectKey) {
        // Border-radius effect: supports native and forced selectors controlled by forceState.
        generatedCss = transformBorderRadiusKeyToCss(styleKey, className, forceState, options);
      }
    }
  }

  if (generatedCss === undefined) {
    throw new Error(`Unsupported style key: ${styleKey}`);
  }

  return generatedCss;
}
