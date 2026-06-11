import { type BorderStyleValue, CssBorderStyleValue } from '@kiskadee/core';
import { SEPARATORS } from '../../../utils/index.ts';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

/**
 * Builds a CSS rule that sets the border-style property from a style key.
 *
 * The style key must follow the "borderStyle__<value>" convention, where <value>
 * is a supported key of CssBorderStyleValue (e.g., "solid", "dashed").
 *
 * Example:
 * ```TypeScript
 * transformBorderStyleKeyToCss('borderStyle__dashed', 'myClass');
 * // => ".myClass { border-style: dashed }"
 * ```
 *
 * @param styleKey - The namespaced property key to parse (e.g., "borderStyle__solid").
 * @param className - The CSS class name to use in the selector (without a leading dot).
 * @returns The full CSS rule string (selector plus declaration), e.g. ".foo { border-style: solid }".
 *
 * @throws Error when:
 *   - The key does not start with the expected "borderStyle" property segment.
 *   - The extracted value is missing, unknown, or multiple values are provided.
 */
export function transformBorderStyleKeyToCss(styleKey: string, className: string): string {
  const propertyName = 'borderStyle';

  // Split the namespaced key by the configured value separator.
  // Expected shape: ["borderStyle", "<value>"] or invalid variants.
  const [parsedProperty, valueKey, ...extraSegments] = styleKey.split(SEPARATORS.VALUE);

  // Validate that the property segment matches the supported property.
  const isUnsupportedProperty = parsedProperty !== propertyName;

  if (isUnsupportedProperty === true) {
    // Surface a descriptive error if the property prefix is not supported.
    throw new Error(UNSUPPORTED_PROPERTY_NAME(propertyName, styleKey));
  }

  // Map the parsed key (e.g., "solid") to its concrete CSS value via the schema enum.
  const value =
    valueKey === undefined ? undefined : CssBorderStyleValue[valueKey as BorderStyleValue];

  // Consider the value unsupported when:
  // - More than one value part is present (e.g., "borderStyle__solid__extra"), or
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
  return `.${className} { border-style: ${value} }`;
}
