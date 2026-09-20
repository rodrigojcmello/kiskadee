import type { SurfaceContext, ThemeMode } from '@kiskadee/core';

// Showcase presentation policy only. Colors and availability remain preset-owned.
const canonicalDefaults: Record<ThemeMode, Record<SurfaceContext, readonly string[]>> = {
  light: {
    onSubtle: ['neutral.medium', 'neutral.low', 'neutral.lowest'],
    onVivid: ['primary.highest']
  },
  dark: {
    onSubtle: ['neutral.medium', 'neutral.low', 'neutral.lowest'],
    onVivid: ['primary.highest']
  },
  darker: {
    onSubtle: ['neutral.medium', 'neutral.low', 'neutral.lowest', 'neutral.highest'],
    onVivid: ['primary.highest']
  }
};

export function resolveDefaultCanonicalCardSurface<
  T extends { key: string; contentSurfaceContext: SurfaceContext }
>(
  surfaces: readonly T[],
  surfaceContext: SurfaceContext = 'onSubtle',
  theme: ThemeMode = 'light'
): T | undefined {
  const compatible = surfaces.filter((surface) => surface.contentSurfaceContext === surfaceContext);
  for (const key of canonicalDefaults[theme][surfaceContext]) {
    const surface = compatible.find((item) => item.key === key);
    if (surface) return surface;
  }
  return compatible[0];
}
