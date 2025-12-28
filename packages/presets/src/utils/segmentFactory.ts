import type { ThemeColorPalette, ThemeMode } from '@kiskadee/core';

// Partial<Record<ThemeMode, Partial<ThemeColorPalette>>>
// Use Partial to allow providing only some modes or some semantic colors
export type ThemeOverrides = Partial<Record<ThemeMode, Partial<ThemeColorPalette>>>;

/**
 * Merges base theme palettes with optional overrides.
 *
 * This is useful to keep shared semantic palettes (e.g. `neutral`, `redLike`) consistent
 * across multiple segment definitions without introducing a dedicated `segments.themes.*`
 * registry as a source of truth.
 */
export function mergeThemePalettes(
  baseThemes: Partial<Record<ThemeMode, ThemeColorPalette>>,
  overrides?: ThemeOverrides
): Partial<Record<ThemeMode, ThemeColorPalette>> {
  const out: Partial<Record<ThemeMode, ThemeColorPalette>> = {};

  const isThemeMode = (value: string): value is ThemeMode =>
    value === 'light' || value === 'dark' || value === 'darker';

  const allModes = new Set<ThemeMode>();

  for (const key of Object.keys(baseThemes)) {
    if (isThemeMode(key)) allModes.add(key);
  }

  for (const key of Object.keys(overrides || {})) {
    if (isThemeMode(key)) allModes.add(key);
  }

  for (const mode of allModes) {
    const base = baseThemes[mode] || {};
    const override = overrides?.[mode] || {};

    out[mode] = {
      ...base,
      ...override
    };
  }

  return out;
}
