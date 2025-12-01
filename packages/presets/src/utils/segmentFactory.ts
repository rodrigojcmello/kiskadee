import type { Segment, ThemeColorPalette, ThemeMode } from '@kiskadee/core';

// Partial<Record<ThemeMode, Partial<ThemeColorPalette>>>
// Use Partial to allow providing only some modes or some semantic colors
export type SegmentOverrides = Partial<Record<ThemeMode, Partial<ThemeColorPalette>>>;

/**
 * Creates a factory function for defining segments that inherit from a base theme.
 *
 * @param baseThemes - The base definitions for light/dark themes (e.g. neutral, redLike).
 * @returns A function (createSegment) that generates a full Segment object.
 */
export function createSegmentFactory(
  baseThemes: Partial<Record<ThemeMode, ThemeColorPalette>>
) {
  return (
    name: string,
    mainColor: Segment['mainColor'],
    overrides?: SegmentOverrides
  ): Segment => {
    const themes: Segment['themes'] = {};

    // Modes to process (could be strictly light/dark or dynamic based on baseThemes)
    // We'll iterate over keys present in baseThemes or overrides
    const allModes = new Set([
      ...Object.keys(baseThemes),
      ...Object.keys(overrides || {})
    ]) as Set<ThemeMode>;

    for (const mode of allModes) {
      const base = baseThemes[mode] || {};
      const override = overrides?.[mode] || {};

      themes[mode] = {
        ...base,
        ...override
      };
    }

    return {
      name,
      mainColor,
      themes
    };
  };
}
