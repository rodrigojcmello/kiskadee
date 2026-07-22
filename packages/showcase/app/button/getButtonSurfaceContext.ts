import type { SurfaceContext } from '@kiskadee/core';
import type { BackgroundToneKey } from '@/hooks/use-background-tones';

const DEFAULT_SURFACES: ReadonlySet<BackgroundToneKey> = new Set([
  'white',
  'gray',
  'light-primary'
]);

export function getButtonSurfaceContext(surface: BackgroundToneKey): SurfaceContext {
  return DEFAULT_SURFACES.has(surface) ? 'default' : 'inverse';
}

export function getButtonBackgroundForSurfaceContext(
  surfaceContext: SurfaceContext
): BackgroundToneKey {
  return surfaceContext === 'default' ? 'white' : 'primary';
}
