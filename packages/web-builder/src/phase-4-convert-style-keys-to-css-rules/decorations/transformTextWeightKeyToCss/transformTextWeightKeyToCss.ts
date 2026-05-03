import { CssTextWeightValue, type TextWeightValue } from '@kiskadee/core';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

/**
 * Converts a textWeight style key into a CSS rule string.
 *
 * The key must be in the format "textWeight__<value>", where <value> is one of the
 * values defined in CssTextWeightValue.
 *
 * @example
 * ```ts
 * const css = transformTextWeightKeyToCss("textWeight__bold", "textWeight__bold");
 * // css: ".textWeight__bold { font-weight: 700 }"
 * ```
 *
 * @param styleKey - The text weight style key (e.g., "textWeight__bold").
 * @param className - The class name to use in the generated CSS (without leading dot).
 *                    Usually the same as styleKey or an optimized short name.
 * @returns The generated CSS rule string (selector + declaration).
 *
 * @throws An error if the key does not start with "textWeight__" or if the value is unsupported.
 */
export function transformTextWeightKeyToCss(styleKey: string, className: string): string {
  const propertyName = 'textWeight';
  const prefix = `${propertyName}__`;

  if (styleKey.startsWith(prefix) === false) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey));
  }

  const textWeightValue = styleKey.substring(prefix.length);
  const cssValue: CssTextWeightValue | undefined =
    CssTextWeightValue[textWeightValue as TextWeightValue];

  if (cssValue === undefined) {
    throw new Error(UNSUPPORTED_VALUE(propertyName, textWeightValue, styleKey));
  }

  return `.${className} { font-weight: ${cssValue} }`;
}
