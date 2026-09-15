import type { PrimitiveColors } from '@kiskadee/core';
import { classifyTonalReference } from '@kiskadee/tonal-scale/classification';

/** Supply generator provenance for legacy assets without changing their scales. */
export function classifyPrimitives<T extends PrimitiveColors>(primitives: T): T {
  return Object.fromEntries(
    Object.entries(primitives).map(([hue, variants]) => [
      hue,
      Object.fromEntries(
        Object.entries(variants ?? {}).map(([variant, asset]) => {
          if (asset.kind !== 'static' || asset.classification) return [variant, asset];
          const tone = asset.functionalReferences?.light?.vivid;
          const hex = tone === undefined ? undefined : asset.scales.light?.[tone];
          return [variant, hex ? { ...asset, classification: classifyTonalReference(hex) } : asset];
        })
      )
    ])
  ) as T;
}
