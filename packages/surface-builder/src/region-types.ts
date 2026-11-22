import type { ContentSurfaceContextMap } from '@kiskadee/core';

export type RegionSurface = {
  output: ContentSurfaceContextMap;
  /** Sparse exceptions. Each matched coordinate replaces the entire state leaf. */
  against?: Record<string, ContentSurfaceContextMap>;
};

export type SurfaceRegionBranch = {
  regions?: Record<string, RegionSurface>;
  variants?: Record<string, SurfaceRegionBranch>;
  modes?: Record<string, SurfaceRegionBranch>;
};

export type SurfaceDiagnostic = { path: string; reason: string };
