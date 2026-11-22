import type {
  ColorVariant,
  ComponentEmphasis,
  ContentSurfaceContextMap,
  SurfaceContext,
  ThemeMode
} from '@kiskadee/core';
import type { RegionSurface, SurfaceRegions } from '@kiskadee/web-builder/types';
import { useKiskadee } from './KiskadeeContext.tsx';
import { useSurfaceContext } from './SurfaceContext.tsx';
import { useComponentMetadata } from './useComponentMetadata.ts';

export type RegionCoordinate = {
  surfaceContext: SurfaceContext;
  intent: string;
  emphasis: ComponentEmphasis;
  colorVariant?: ColorVariant;
  selected?: boolean;
  pending?: boolean;
  disabled?: boolean;
};

type RegionSurfaceRequest = RegionCoordinate & {
  segment: string;
  theme: ThemeMode;
  parent?: RegionCoordinate;
  fallback?: SurfaceContext;
};

function stableState(coordinate: RegionCoordinate) {
  if (coordinate.disabled) return 'disabled';
  if (coordinate.pending) return 'pending';
  if (coordinate.selected) return 'selected';
  return 'rest';
}

function lookup(map: ContentSurfaceContextMap | undefined, request: RegionSurfaceRequest) {
  return map?.[request.segment]?.[request.theme]?.[request.surfaceContext]?.[
    request.colorVariant ?? 'standard'
  ]?.[request.intent]?.[request.emphasis];
}

/** Resolve the precomputed output for the paint coordinates active in this region. */
export function resolveRegionSurface(
  region: RegionSurface | undefined,
  request: RegionSurfaceRequest
): SurfaceContext {
  if (!region) return request.fallback ?? request.surfaceContext;
  const { parent } = request;
  let states = lookup(region.output, request);
  if (region.against && parent) {
    const key = JSON.stringify([
      parent.surfaceContext,
      parent.colorVariant ?? 'standard',
      parent.intent,
      parent.emphasis,
      stableState(parent)
    ]);
    states = lookup(region.against[key], request) ?? states;
  }
  const output = states?.[stableState(request)] ?? states?.rest;
  return output === undefined || output === 'inherit' ? request.surfaceContext : output;
}

type RegionBranch = {
  regions?: SurfaceRegions;
  variants?: Record<
    string,
    { regions?: SurfaceRegions; modes?: Record<string, { regions?: SurfaceRegions }> }
  >;
};

export function getSurfaceRegions(
  metadata: RegionBranch | undefined,
  variant?: string,
  mode?: string
) {
  const branch = variant ? metadata?.variants?.[variant] : undefined;
  return (
    (mode ? branch?.modes?.[mode]?.regions : undefined) ?? branch?.regions ?? metadata?.regions
  );
}

export function useRegionSurfaces(component: string, variant?: string, mode?: string) {
  return getSurfaceRegions(useComponentMetadata(component), variant, mode);
}

export function useRegionSurface(
  component: string,
  element: string,
  options: Omit<RegionSurfaceRequest, 'surfaceContext' | 'segment' | 'theme'> & {
    surfaceContext?: SurfaceContext;
    variant?: string;
    mode?: string;
  }
) {
  const { segment, theme } = useKiskadee();
  const surfaceContext = useSurfaceContext(options.surfaceContext);
  const regions = useRegionSurfaces(component, options.variant, options.mode);
  return resolveRegionSurface(regions?.[element], { ...options, segment, theme, surfaceContext });
}
