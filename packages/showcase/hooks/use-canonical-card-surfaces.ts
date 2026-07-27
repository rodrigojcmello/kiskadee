'use client';

import type { ThemeMode } from '@kiskadee/core';
import { useCardArtifactConfig, useKiskadee } from '@kiskadee/react-components';
import { useMemo } from 'react';
import {
  type CanonicalCardSurfaceKey,
  resolveCanonicalCardSurfaces
} from '@/utils/canonical-card-surfaces';

export function useCanonicalCardSurfaces(themeOverride?: ThemeMode) {
  const { segment, theme: activeTheme } = useKiskadee();
  const { options } = useCardArtifactConfig();
  const theme = themeOverride ?? activeTheme;

  const tones = useMemo(
    () =>
      resolveCanonicalCardSurfaces({
        canonicalSurfaces: options.canonicalSurfaces,
        segment: String(segment ?? 'default'),
        theme
      }),
    [options.canonicalSurfaces, segment, theme]
  );

  const items = useMemo(
    () =>
      tones.map((tone) => ({
        value: tone.key,
        label: tone.label,
        swatch: {
          color: tone.resolvedColor
        }
      })),
    [tones]
  );

  return {
    defaultToneKey: (tones[0]?.key ?? 'neutral.low') as CanonicalCardSurfaceKey,
    items,
    tones
  };
}
