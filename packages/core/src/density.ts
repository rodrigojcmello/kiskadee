import type { ElementSizeValue } from './breakpoints.ts';

/** Available proportions within one visual identity, independent of operating system. */
export type Density = 'adaptive' | 'compact' | 'regular' | 'spacious';

export type DensityScaleMap =
  | { compact: ElementSizeValue; regular?: ElementSizeValue; spacious?: ElementSizeValue }
  | { compact?: ElementSizeValue; regular: ElementSizeValue; spacious?: ElementSizeValue }
  | { compact?: ElementSizeValue; regular?: ElementSizeValue; spacious: ElementSizeValue };

/** Compact artifact references to existing size buckets. */
export type DensityScaleMapJSON = { c?: string; r?: string; s?: string };

export const DEFAULT_DENSITY: Density = 'adaptive';
export const REGULAR_DENSITY_BREAKPOINT = 'bp:md:1' as const;
export const DENSITY_BREAKPOINT = 'bp:lg:1' as const;

/** Selects artifact classes, without inspecting the viewport or deriving dimensions. */
export function resolveDensityScale(density: Density, map: DensityScaleMapJSON): string {
  if (density === 'adaptive') return 'a';
  const selected = density === 'compact' ? map.c : density === 'regular' ? map.r : map.s;
  const scale = selected ?? map.r ?? map.c ?? map.s;
  if (!scale) throw new Error('Density requires at least one compiled size reference.');
  return scale;
}

/** Validates the density-only options of components without other options. */
export function validateDensityOnlyOptions(value: unknown, path: string): string[] {
  if (value === undefined) return [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [`${path}: expected object`];
  }
  const record = value as Record<string, unknown>;
  return Object.keys(record)
    .filter((key) => key !== 'density')
    .map((key) => `${path}.${key}: unrecognized key`);
}
