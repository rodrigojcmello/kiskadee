import type {
  BreakpointValue,
  ElementSizeValue,
  ScaleProperty,
  StyleKeyByElement
} from '@kiskadee/core';
import { deepUpdate, buildStyleKey } from '../../utils/index.ts';

export type ScaleValue = Partial<Record<ElementSizeValue, Record<string, number> | number>> | number;

/**
 * Converts an element's scale schema into style keys organized by size and breakpoint.
 *
 * Iterates over scale properties to handle direct numeric values, size-specific
 * numbers, and nested breakpoint overrides, generating style keys with
 * {@link buildStyleKey} for each dimension.
 *
 * @param scales - The scale definition keyed by scale property.
 * @returns A map from size and breakpoint tokens to arrays of style key strings.
 */
export function convertElementScalesToStyleKeys(
  scales: Partial<Record<ScaleProperty, ScaleValue>>
): StyleKeyByElement['scales'] {
  const styleKeys: StyleKeyByElement['scales'] = {};

  for (const [propertyName, propertyValue] of Object.entries(scales)) {
    // Case 1: Direct numeric value (e.g. { paddingTop: 10 } or { textSize: 16 })
    // => always mapped under "s:all"
    if (typeof propertyValue === 'number') {
      const styleKey = buildStyleKey({ propertyName, value: propertyValue });
      deepUpdate(styleKeys, ['s:all'], (arr: string[] = []) => [...arr, styleKey]);
    } else if (propertyValue && typeof propertyValue === 'object') {
      for (const [s, sizeValue] of Object.entries(propertyValue as Record<string, unknown>)) {
        const size = s as ElementSizeValue;

        if (typeof sizeValue === 'number') {
          // Case 2: Size-specific number without breakpoint
          // Do NOT include the size token in the style key (size controls are applied later)
          const styleKey = buildStyleKey({ propertyName, value: sizeValue });
          deepUpdate(styleKeys, [size], (arr: string[] = []) => [...arr, styleKey]);
        }

        // Case 3: Nested breakpoint overrides
        // e.g. { textSize: { 's:md:1': { 'bp:all': 16, 'bp:lg:2': 10 } } }
        // => 'bp:all' for default size omits the size in the key
        else if (sizeValue && typeof sizeValue === 'object') {
          for (const [b, value] of Object.entries(sizeValue as Record<string, number>)) {
            const breakpoint = b as BreakpointValue;
            let styleKey: string;

            // If it's the default breakpoint for a known size, omit the size token
            if (breakpoint === 'bp:all') {
              styleKey = buildStyleKey({ propertyName, value });
            } else {
              // Include size so buildStyleKey generates the correct key format with media query support
              styleKey = buildStyleKey({ propertyName, value, breakpoint, size });
            }

            deepUpdate(styleKeys, [size], (arr: string[] = []) => [...arr, styleKey]);
          }
        }
      }
    }
  }

  return styleKeys;
}
