import { breakpoints, type ColorProperty, CssColorProperty, scaleProperties } from '@kiskadee/core';
import postcss from 'postcss';
import combineMq from 'postcss-combine-media-query';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames';
import {
  transformBorderStyleKeyToCss,
  transformShadowKeyToCss,
  transformTextAlignKeyToCss,
  transformTextFontKeyToCss,
  transformTextItalicKeyToCss,
  transformTextLineTypeKeyToCss,
  transformTextWeightKeyToCss
} from './decorations';
import { transformBorderRadiusKeyToCss } from './effects/transformBorderRadiusKeyToCss/transformBorderRadiusKeyToCss';
import {
  transformColorKeyToCss,
  type TransformColorKeyToCssOptions
} from './palettes/transformColorKeyToCss';
import { transformScaleKeyToCss } from './scales/transformScaleKeyToCss';

export type GenerateCssRuleFromStyleKeyOptions = TransformColorKeyToCssOptions;

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
  } else if (styleKey.startsWith('shadow')) {
    generatedCss = transformShadowKeyToCss(styleKey, className, forceState);
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
  } else if (styleKey.startsWith('borderRadius')) {
    // Border-radius effect: supports native and forced selectors controlled by forceState.
    generatedCss = transformBorderRadiusKeyToCss(styleKey, className, forceState);
  } else if (generatedCss === undefined) {
    const matchScale = scaleProperties.find((scaleProperty) => styleKey.startsWith(scaleProperty));
    if (matchScale != null) {
      generatedCss = transformScaleKeyToCss(styleKey, breakpoints, className);
    } else {
      // Colors ------------------------------------------------------------------------------------
      const colorProperties = Object.keys(CssColorProperty) as ColorProperty[];
      const matchColor = colorProperties.find((colorProperty) =>
        styleKey.startsWith(colorProperty)
      );
      if (matchColor != null) {
        generatedCss = transformColorKeyToCss(styleKey, className, forceState, options);
      }
    }
  }

  if (generatedCss === undefined) {
    throw new Error(`Unsupported style key: ${styleKey}`);
  }

  return generatedCss;
}

/**
 * Generates CSS rules from the style object by iterating just once over its keys.
 * Keys are first sorted by their numeric values (descending), then reassigned tokens.
 *
 * @returns A string containing all the generated CSS class rules.
 *
 * Expected Output (using a simple style example):
 * For an input style object:
 * {
 *   textItalic__true: 3,
 *   textAlign__center: 2,
 *   textDecoration__underline: 1
 * }
 *
 * The sorted order will be:
 *   textItalic__true -> token: "a"
 *   textAlign__center  -> token: "b"
 *   textDecoration__underline -> token: "c"
 *
 * And the expected generated CSS is:
 * .a { font-style: italic; }
 * .b { text-align: center; }
 * .c { text-decoration: underline; }
 * @param cssClassNames
 */
export async function generateCssFromStyleKeyList(
  cssClassNames: ShortenCssClassNames
): Promise<string> {
  const cssRuleList: string[] = [];

  // Get an array of keys sorted by their frequency (highest first)
  // const sortedKeys = Object.keys(styleKeyList).sort();

  // // Map to store the token for each key.
  // const tokenMapping: Record<string, string> = {};
  //
  // // Assign tokens based on sorted order.
  // sortedKeys.forEach((key, index) => {
  //   tokenMapping[key] = getToken(index);
  // });

  // Iterate over the sorted keys and generate CSS rules using tokens.
  for (const styleKey of Object.keys(cssClassNames)) {
    const className = cssClassNames[styleKey];
    const generatedCss = generateCssRuleFromStyleKey(styleKey, className, true);

    // const cssRule = extractCssClassName(rule);
    // console.log({ styleKey, generatedCss });

    // Replace the original class name with the assigned token.
    // const token = tokenMapping[styleKey];
    // rule = rule.replace(new RegExp(`\\.${styleKey}\\b`), `.${token}`);
    cssRuleList.push(generatedCss);
  }

  const rawCss = cssRuleList.sort().join('\n');

  // Apply postcss-combine-media-query plugin to combine media queries
  const grouped = await postcss([combineMq()]).process(rawCss, {
    from: undefined // avoid source file warning
  });

  return grouped.css;
}
