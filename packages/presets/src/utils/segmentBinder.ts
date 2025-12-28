// NOTE: Segments are no longer defined by a `SchemaSegments` structure in the core.
// Presets discover segments via `schema.colors.globalSemanticsBySegment` and typically keep
// a local `segmentNames` const (e.g. `['default', 'dynamic'] as const`).

/**
 * Creates a binder function that iterates over a specific list of segment keys
 * and applies a generator function to each corresponding segment.
 *
 * This serves as the central registry for active segments in a schema.
 *
 * @param segments - The source object containing all defined segments.
 * @param keys - An array of keys (e.g., ['default', 'dynamic']) to include.
 * @returns A function that accepts a callback (fn) and returns an object mapping the keys to fn(segment).
 */
export function createSegmentBinder<const TSegmentNames extends readonly string[]>(
  segmentNames: TSegmentNames
) {
  type SegmentName = TSegmentNames[number];

  return <R>(fn: (segmentName: SegmentName) => R): Record<SegmentName, R> => {
    const result = {} as Record<SegmentName, R>;
    for (const segmentName of segmentNames) {
      const key = segmentName as SegmentName;
      result[key] = fn(key);
    }
    return result;
  };
}
