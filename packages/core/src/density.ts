import type { ElementSizeValue } from './breakpoints.ts';

/** Available proportions within one visual identity, independent of operating system. */
export type Density = 'adaptive' | 'compact' | 'regular' | 'spacious';

export type DensityScaleMap =
  | { compact: ElementSizeValue; regular?: ElementSizeValue; spacious?: ElementSizeValue }
  | { compact?: ElementSizeValue; regular: ElementSizeValue; spacious?: ElementSizeValue }
  | { compact?: ElementSizeValue; regular?: ElementSizeValue; spacious: ElementSizeValue };

/** Compact artifact references to existing size buckets. */
export type DensityScaleMapJSON = { c?: string; r?: string; s?: string };

/** Sparse size support for one recipe, optionally specialized by variant and mode. */
export type ComponentSizeSupport = {
  sizes?: readonly string[];
  variants?: Record<string, ComponentSizeSupport>;
  modes?: Record<string, ComponentSizeSupport>;
};

export function selectSizeSupport(
  support: ComponentSizeSupport,
  selection: { variant?: string; mode?: string } = {}
): readonly string[] {
  const variant = selection.variant ? support.variants?.[selection.variant] : undefined;
  const branch = variant ?? support;
  return (selection.mode ? branch.modes?.[selection.mode]?.sizes : undefined) ?? branch.sizes ?? [];
}

/** Resolve the whole recipe once; an invariant recipe needs only its common values. */
export function resolveSupportedSize(requested: string, supported: readonly string[]): string {
  const normalized = requested.replace(/^s:/, '');
  const sizes = supported.map((size) => size.replace(/^s:/, '')).filter((size) => size !== 'all');
  if (sizes.length === 0) return 'md:1';
  if (!sizes.includes('md:1')) throw new Error('A sized recipe must support Medium (s:md:1).');
  return sizes.includes(normalized) ? normalized : 'md:1';
}

export function compileDensityMap(map: DensityScaleMap): DensityScaleMapJSON {
  return {
    ...(map.compact ? { c: map.compact.slice(2) } : {}),
    ...(map.regular ? { r: map.regular.slice(2) } : {}),
    ...(map.spacious ? { s: map.spacious.slice(2) } : {})
  };
}

export const DEFAULT_DENSITY: Density = 'adaptive';
export const REGULAR_DENSITY_BREAKPOINT = 'bp:md:2' as const;
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
