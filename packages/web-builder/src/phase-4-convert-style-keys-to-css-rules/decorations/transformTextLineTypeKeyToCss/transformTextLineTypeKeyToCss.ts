import {
  CssDecorationProperty,
  CssTextDecorationValue,
  type DecorationProperty,
  type TextLineTypeValue
} from '@kiskadee/core';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

const { textLineType }: typeof CssDecorationProperty = CssDecorationProperty;

/**
 * Converts a text‐decoration style key into a CSS rule string.
 *
 * The key must be in the format "textDecoration__<value>", where <value> is one of the
 * values defined in CssTextDecorationValue.
 *
 * @example
 * ```ts
 * const css = transformTextLineTypeKeyToCss("textLineType__underline", "textLineType__underline");
 * // css: ".textLineType__underline { text-decoration: underline; }"
 * ```
 *
 * @param styleKey - The text‐decoration key (e.g. "textLineType__underline")
 * @param className - The class name to use in the generated CSS (without leading dot).
 *                    Usually this will be the same as styleKey or an optimized short name.
 * @returns The generated CSS rule string (selector + declarations).
 * @throws Error if the property isn’t "textLineType", the format is wrong or the value is unsupported.
 */
export function transformTextLineTypeKeyToCss(styleKey: string, className: string): string {
  const propertyName: DecorationProperty = 'textLineType';
  const styleParts = styleKey.split('__');
  const styleProperty = styleParts[0];
  const styleValue = styleParts[1] as TextLineTypeValue;

  if (styleProperty !== propertyName) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey));
  }

  if (styleParts.length !== 2) {
    const [, ...invalidValue] = styleParts;
    throw new Error(UNSUPPORTED_VALUE(propertyName, invalidValue.join('__'), styleKey));
  }

  const value = CssTextDecorationValue[styleValue];

  if (value === undefined) {
    throw new Error(UNSUPPORTED_VALUE(propertyName, styleValue, styleKey));
  }

  return `.${className} { ${textLineType}: ${value} }`;
}
