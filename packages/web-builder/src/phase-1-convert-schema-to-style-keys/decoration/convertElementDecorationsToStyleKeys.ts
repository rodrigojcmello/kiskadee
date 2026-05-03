import type { DecorationSchema, StyleKeyByElement } from '@kiskadee/core';
import { buildStyleKey } from '../../utils/buildStyleKey/buildStyleKey.ts';

/**
 * Converts an element's decoration schema into style keys.
 *
 * Iterates over each decoration property (boolean, string, number, or array)
 * and generates a style key string using {@link buildStyleKey}.
 *
 * @param decoration - The DecorationSchema defining element decorations.
 * @returns An array of style key strings for the element's decorations.
 */
export function convertElementDecorationsToStyleKeys(
  decoration: DecorationSchema
): StyleKeyByElement['decorations'] {
  const styleKeys: StyleKeyByElement['decorations'] = [];

  for (const [propertyName, value] of Object.entries(decoration)) {
    if (
      typeof value === 'boolean' ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      Array.isArray(value)
    ) {
      const styleKey = buildStyleKey({ propertyName, value });
      styleKeys.push(styleKey);
    }
  }

  return styleKeys;
}
