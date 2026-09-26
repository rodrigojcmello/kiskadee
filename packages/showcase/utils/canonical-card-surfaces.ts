import type { ComponentEmphasis, ContainerIntent, SurfaceContext, ThemeMode } from '@kiskadee/core';
import type { CardCanonicalSurfacesPayload } from '@kiskadee/web-builder/types';

export type CanonicalCardSurfaceKey = `${ContainerIntent}.${ComponentEmphasis}`;

export type ResolvedCanonicalCardSurface = {
  key: CanonicalCardSurfaceKey;
  label: string;
  resolvedColor: string;
  contentSurfaceContext: SurfaceContext;
};

export { resolveDefaultCanonicalCardSurface } from './showcase-background-defaults';

function capitalize(value: string): string {
  const words = value.replace(/([a-z])([A-Z])/g, '$1 $2');
  return words.length > 0 ? `${words[0].toUpperCase()}${words.slice(1)}` : words;
}

export function normalizeSurfaceColor(color: string): string {
  return color.trim().toLowerCase();
}

export function resolveCanonicalCardSurfaces({
  canonicalSurfaces,
  segment,
  theme,
  deduplicateColors = true,
  includeComplementary = false
}: {
  canonicalSurfaces: CardCanonicalSurfacesPayload | undefined;
  segment: string;
  theme: ThemeMode;
  deduplicateColors?: boolean;
  includeComplementary?: boolean;
}): ResolvedCanonicalCardSurface[] {
  const authoredSurfaces = canonicalSurfaces?.[segment]?.[theme];
  if (!authoredSurfaces) return [];

  const seenColors = new Set<string>();
  const surfaces: ResolvedCanonicalCardSurface[] = [];

  for (const surface of authoredSurfaces) {
    if (
      !includeComplementary &&
      (surface.intent === 'neutralComplementary' || surface.intent === 'primaryComplementary')
    ) {
      continue;
    }
    const normalizedColor = normalizeSurfaceColor(surface.rest);
    if (deduplicateColors && seenColors.has(normalizedColor)) continue;

    seenColors.add(normalizedColor);
    surfaces.push({
      key: `${surface.intent}.${surface.emphasis}`,
      label: `${capitalize(surface.intent)} ${surface.emphasis}`,
      resolvedColor: surface.rest,
      contentSurfaceContext: surface.contentSurfaceContext
    });
  }

  return surfaces;
}

function parseOpaqueHex(color: string): [number, number, number] | undefined {
  const normalized = normalizeSurfaceColor(color);
  const match = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/.exec(normalized);
  if (!match) return undefined;

  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ];
}

function linearizeSrgb(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function isDarkSurfaceColor(color: string): boolean {
  const rgb = parseOpaqueHex(color);
  if (!rgb) return false;

  const [red, green, blue] = rgb.map(linearizeSrgb);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance < 0.35;
}
