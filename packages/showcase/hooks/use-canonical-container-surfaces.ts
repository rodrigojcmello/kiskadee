'use client';

import { useComponentMetadata, useKiskadee } from '@kiskadee/react-components/resources';
import type { CardCanonicalSurfacesPayload } from '@kiskadee/web-builder/types';
import { useMemo } from 'react';
import { resolveCanonicalCardSurfaces } from '@/utils/canonical-card-surfaces';

/** The Shell consumes the complete Container canvas catalog, including companion surfaces. */
export function useCanonicalContainerSurfaces() {
  const { segment, theme } = useKiskadee();
  const containerMetadata = useComponentMetadata('container');
  const options = (
    containerMetadata as unknown as
      | { options?: { canonicalSurfaces?: CardCanonicalSurfacesPayload } }
      | undefined
  )?.options;
  return useMemo(
    () =>
      resolveCanonicalCardSurfaces({
        canonicalSurfaces: options?.canonicalSurfaces,
        segment: String(segment ?? 'default'),
        theme,
        deduplicateColors: false,
        includeComplementary: true
      }),
    [options?.canonicalSurfaces, segment, theme]
  );
}
