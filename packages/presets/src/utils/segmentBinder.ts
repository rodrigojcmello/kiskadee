import type { SchemaSegments, Segment } from '@kiskadee/core';

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
export function createSegmentBinder<T extends SchemaSegments>(segments: T, keys: (keyof T)[]) {
  return <R>(fn: (segment: Segment) => R): Partial<Record<keyof T, R>> => {
    const result = {} as Partial<Record<keyof T, R>>;
    // We only iterate over the explicitly registered keys
    for (const key of keys) {
      const seg = segments[key];
      if (seg) {
        result[key] = fn(seg as unknown as Segment);
      }
    }
    return result;
  };
}
