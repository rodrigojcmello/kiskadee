'use client';

import type { ThemeMode } from '@kiskadee/core';
import { useCardArtifactConfig, useKiskadee } from '@kiskadee/react-components';
import { useMemo } from 'react';
import {
  resolveCanonicalCardSurfaces,
  resolveDefaultCanonicalCardSurface
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

  const defaultSurface = resolveDefaultCanonicalCardSurface(tones);

  return {
    defaultSurface,
    defaultToneKey: defaultSurface?.key,
    items,
    tones
  };
}
