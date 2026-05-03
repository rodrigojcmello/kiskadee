import type { CssFontStyleValue, TextItalicKeyToken } from '@kiskadee/core';
import { SEPARATORS } from '../../../utils/index.ts';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

/**
 * Builds a CSS rule that sets the font-style property from a textItalic style key.
 *
 * The style key must follow the "textItalic__<value>" convention, where <value> is "true" or "false".
 *
 * Example:
 * ```TypeScript
 * transformTextItalicKeyToCss('textItalic__true', 'myClass');
 * // => ".myClass { font-style: italic; }"
 * ```
 *
 * @param styleKey - The namespaced property key to parse (e.g., "textItalic__true").
 * @param className - The CSS class name to use in the selector (without a leading dot).
 * @returns The full CSS rule string (selector plus declaration), e.g. ".foo { font-style: italic; }".
 *
 * @throws Error when:
 *   - The key does not start with the expected "textItalic" property segment.
 *   - The extracted value is missing, unknown, or multiple values are provided.
 */
export function transformTextItalicKeyToCss(styleKey: string, className: string): string {
  const propertyName = 'textItalic';

  // Split the namespaced key by the configured value separator.
  const [parsedProperty, v, ...extraSegments] = styleKey.split(SEPARATORS.VALUE);
  const valueKey = v as TextItalicKeyToken | undefined;

  // Validate that the property segment matches the supported property.
  const isUnsupportedProperty = parsedProperty !== propertyName;

  if (isUnsupportedProperty === true) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey));
  }

  // Consider unsupported when there are extra segments or value is not one of the allowed tokens
  const hasExtraSegments = valueKey !== undefined && extraSegments.length > 0;
  const isKnownToken = valueKey === 'true' || valueKey === 'false';
  const isUnsupportedValue = hasExtraSegments || !isKnownToken;

  if (isUnsupportedValue) {
    const invalidValueForError = hasExtraSegments
      ? [valueKey, ...extraSegments].join(SEPARATORS.VALUE)
      : (valueKey as unknown as string);
    throw new Error(UNSUPPORTED_VALUE(propertyName, invalidValueForError, styleKey));
  }

  // Map token to concrete CSS value
  const value: CssFontStyleValue = valueKey === 'true' ? 'italic' : 'normal';

  return `.${className} { font-style: ${value}; }`;
}
