import type {
  BreakpointValue,
  ElementAllSizeValue,
  ElementSizeValue,
  ScaleBySize,
  StyleKeysByInteractionState,
  ThumbShrinkEffectSchema,
  ThumbShrinkEffectValue
} from '@kiskadee/core';
import { buildStyleKey, deepUpdate } from '../../utils/index.ts';

type ThumbShrinkPropertyName = 'thumbShrinkBoxWidth' | 'thumbShrinkBoxHeight';
type ThumbShrinkToken = ElementSizeValue | ElementAllSizeValue;

function emitThumbShrinkValue(
  out: StyleKeysByInteractionState,
  propertyName: ThumbShrinkPropertyName,
  value: ThumbShrinkEffectValue
): void {
  if (typeof value === 'number') {
    const styleKey = buildStyleKey({ propertyName, value });
    deepUpdate(out, ['rest'], (arr: string[] = []) => [...arr, styleKey]);
    return;
  }

  for (const [rawSize, rawSizeValue] of Object.entries(value as ScaleBySize)) {
    const size = rawSize as ThumbShrinkToken;

    if (typeof rawSizeValue === 'number') {
      const styleKey =
        size === 's:all'
          ? buildStyleKey({ propertyName, value: rawSizeValue })
          : buildStyleKey({ propertyName, value: rawSizeValue, size });
      deepUpdate(out, ['rest'], (arr: string[] = []) => [...arr, styleKey]);
      continue;
    }

    if (!rawSizeValue || typeof rawSizeValue !== 'object' || Array.isArray(rawSizeValue)) continue;

    for (const [rawBreakpoint, breakpointValue] of Object.entries(
      rawSizeValue as Record<string, number>
    )) {
      const breakpoint = rawBreakpoint as BreakpointValue;
      const styleKey =
        size === 's:all'
          ? buildStyleKey({ propertyName, value: breakpointValue })
          : buildStyleKey({
              propertyName,
              value: breakpointValue,
              size,
              breakpoint: breakpoint === 'bp:all' ? undefined : breakpoint
            });
      deepUpdate(out, ['rest'], (arr: string[] = []) => [...arr, styleKey]);
    }
  }
}

export function convertElementThumbShrinkToStyleKeys(
  thumbShrink: ThumbShrinkEffectSchema
): StyleKeysByInteractionState {
  const styleKeys: StyleKeysByInteractionState = {};
  const rest = thumbShrink.rest;
  if (!rest) return styleKeys;

  if (rest.boxWidth !== undefined) {
    emitThumbShrinkValue(styleKeys, 'thumbShrinkBoxWidth', rest.boxWidth);
  }

  if (rest.boxHeight !== undefined) {
    emitThumbShrinkValue(styleKeys, 'thumbShrinkBoxHeight', rest.boxHeight);
  }

  return styleKeys;
}
