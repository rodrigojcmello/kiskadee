import { CssTextAlignValue, type TextAlignValue } from '@kiskadee/core';
import { SEPARATORS } from '../../../utils/index.ts';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

/**
 * Builds a CSS rule that sets the text-align property from a style key.
 *
 * The style key must follow the "textAlign__<value>" convention, where <value>
 * is a supported key of CssTextAlignValue (e.g., "left", "center").
 *
 * Example:
 * ```TypeScript
 * transformTextAlignKeyToCss('textAlign__center', 'myClass');
 * // => ".myClass { text-align: center }"
 * ```
 *
 * @param styleKey - The namespaced property key to parse (e.g., "textAlign__left").
 * @param className - The CSS class name to use in the selector (without a leading dot).
 * @returns The full CSS rule string (selector plus declaration), e.g. ".foo { text-align: left }".
 *
 * @throws Error when:
 *   - The key does not start with the expected "textAlign" property segment.
 *   - The extracted value is missing, unknown, or multiple values are provided.
 */
export function transformTextAlignKeyToCss(styleKey: string, className: string): string {
  const propertyName = 'textAlign';

  // Split the namespaced key by the configured value separator.
  // Expected shape: ["textAlign", "<value>"] or invalid variants.
  const [parsedProperty, valueKey, ...extraSegments] = styleKey.split(SEPARATORS.VALUE);

  // Validate that the property segment matches the supported property.
  const isUnsupportedProperty = parsedProperty !== propertyName;

  if (isUnsupportedProperty === true) {
    // Surface a descriptive error if the property prefix is not supported.
    throw new Error(UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey));
  }

  // Map the parsed key (e.g., "center") to its concrete CSS value via the schema enum.
  const value = valueKey === undefined ? undefined : CssTextAlignValue[valueKey as TextAlignValue];

  // Consider the value unsupported when:
  // - More than one value part is present (e.g., "textAlign__left__extra"), or
  // - The mapped value is not found in the enum (unknown or missing value).
  const hasExtraSegments = valueKey !== undefined && extraSegments.length > 0;
  const isValueUndefined = value === undefined;
  const isUnsupportedValue = hasExtraSegments || isValueUndefined;

  if (isUnsupportedValue === true) {
    // Provide a clear error for unknown, missing, or malformed values.
    const invalidValueForError = hasExtraSegments
      ? [valueKey, ...extraSegments].join(SEPARATORS.VALUE)
      : valueKey;
    throw new Error(
      UNSUPPORTED_VALUE(propertyName, invalidValueForError as unknown as string, styleKey)
    );
  }

  // Produce a minimal CSS rule targeting the provided class name.
  return `.${className} { text-align: ${value} }`;
}
