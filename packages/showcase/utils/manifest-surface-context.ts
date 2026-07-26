import type { SurfaceContext, ThemeMode } from '@kiskadee/core';
import type { ManifestComponent, ManifestComponentState } from '@kiskadee/web-builder/types';

export function getManifestSurfaceContext(
  component: ManifestComponent | undefined,
  segment: string,
  theme: ThemeMode,
  surfaceContext: SurfaceContext = 'onSubtle'
) {
  return component?.surfaceContexts?.[`${segment}.${theme}`]?.[surfaceContext];
}

export function getManifestComponentState(
  component: ManifestComponent | undefined,
  segment: string,
  theme: ThemeMode,
  surfaceContext: SurfaceContext = 'onSubtle'
): ManifestComponentState | undefined {
  return getManifestSurfaceContext(component, segment, theme, surfaceContext)?.state;
}

export function supportsManifestSurfaceContext(
  component: ManifestComponent | undefined,
  segment: string,
  theme: ThemeMode,
  surfaceContext: SurfaceContext
): boolean {
  return getManifestSurfaceContext(component, segment, theme, surfaceContext) !== undefined;
}
