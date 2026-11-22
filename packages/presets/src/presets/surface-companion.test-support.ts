import { readFileSync } from 'node:fs';
import type {
  ContainerCanonicalSurface,
  ContentSurfaceContextMap,
  ThemeMode
} from '@kiskadee/core';
import { normalizeHexColor } from '@kiskadee/core';
import { contrastRatio } from '@kiskadee/tonal-scale';

type RegionBranch = {
  regions: Record<string, { output: ContentSurfaceContextMap }>;
  variants: Record<string, { modes: Record<string, RegionBranch> }>;
  options: {
    canonicalSurfaces: Record<
      string,
      Record<ThemeMode, (ContainerCanonicalSurface & { rest: string })[]>
    >;
  };
};

export function readSurfaceCompanion(preset: string): Record<string, RegionBranch> {
  const path = new URL(`./${preset}/generated/surface-contexts.json`, import.meta.url);
  const artifact = JSON.parse(readFileSync(path, 'utf8'));
  if (artifact.formatVersion !== 2)
    throw new Error(`Expected a v2 surface companion for ${preset}`);
  return artifact.components;
}

/** Independent expectation for the static paints in the Material fixtures. */
export function expectedSurface(paint: unknown, backdrop: string, theme: ThemeMode) {
  const value = typeof paint === 'object' && paint && 'ref' in paint ? paint.ref : paint;
  if (value === 'transparent' || value === undefined) return 'inherit';
  if (typeof value !== 'string') throw new Error('Expected a solid fixture color');
  const hex = normalizeHexColor(value);
  const alpha = hex.length === 9 ? Number.parseInt(hex.slice(7), 16) / 255 : 1;
  if (alpha === 0) return 'inherit';
  const channels = [1, 3, 5].map((index) => {
    const top = Number.parseInt(hex.slice(index, index + 2), 16);
    const base = Number.parseInt(backdrop.slice(index, index + 2), 16);
    return Math.round(top * alpha + base * (1 - alpha))
      .toString(16)
      .padStart(2, '0');
  });
  return contrastRatio(`#${channels.join('')}`, theme === 'light' ? '#fff' : '#000') >= 3
    ? 'onVivid'
    : 'onSubtle';
}
