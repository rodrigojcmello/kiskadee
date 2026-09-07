import type { SurfaceContext, ThemeMode } from '@kiskadee/core';
import type { ButtonStressTestBackgroundAvailability } from './button-stress-test-backgrounds';

// Showcase presentation policy only. Colors and availability remain preset-owned.
const canonicalDefaults: Record<ThemeMode, Record<SurfaceContext, readonly string[]>> = {
  light: {
    onSubtle: ['neutral.low', 'neutral.medium', 'neutral.lowest'],
    onVivid: ['primary.highest']
  },
  dark: {
    onSubtle: ['neutral.low', 'neutral.medium', 'neutral.lowest'],
    onVivid: ['primary.highest']
  },
  darker: {
    onSubtle: ['neutral.highest', 'neutral.medium', 'neutral.low', 'neutral.lowest'],
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

export function getPreferredButtonStressTestBackground<
  T extends ButtonStressTestBackgroundAvailability
>(tones: readonly T[], theme: ThemeMode, surfaceContext: SurfaceContext): T | undefined {
  return tones.find(
    (tone) => tone.availableThemes.includes(theme) && tone.surfaceContexts.includes(surfaceContext)
  );
}
