import { type DeepOverride, deepMerge } from './deepMerge.ts';

export type SegmentOverride<T, S extends string> =
  | DeepOverride<T>
  | ((segmentName: S) => DeepOverride<T>);

/**
 * Builds a segment-keyed map from a base generator plus optional per-segment overrides.
 *
 * This is used by presets to avoid conditional logic when multiple segments share the
 * same component palettes with small deltas.
 */
export function buildBySegment<const TSegmentNames extends readonly string[], T>(
  segmentNames: TSegmentNames,
  base: (segmentName: TSegmentNames[number]) => T,
  overrides?: Partial<Record<TSegmentNames[number], SegmentOverride<T, TSegmentNames[number]>>>
): Record<TSegmentNames[number], T> {
  type SegmentName = TSegmentNames[number];
  const out = {} as Record<SegmentName, T>;

  for (const segmentNameRaw of segmentNames) {
    const segmentName = segmentNameRaw as SegmentName;
    const baseValue = base(segmentName);
    const override = overrides?.[segmentName];
    if (!override) {
      out[segmentName] = baseValue;
      continue;
    }

    const patch = (
      typeof override === 'function' ? override(segmentName) : override
    ) as DeepOverride<T>;
    out[segmentName] = deepMerge(baseValue, patch);
  }

  return out;
}
