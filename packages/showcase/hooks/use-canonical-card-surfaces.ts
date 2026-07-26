'use client';

import { useKiskadee } from '@kiskadee/react-components';
import { useMemo } from 'react';
import { useDesignSystemSchema } from '@/hooks/use-design-system-schema';
import {
  type CanonicalCardSurfaceKey,
  resolveCanonicalCardSurfaces
} from '@/utils/canonical-card-surfaces';

export function useCanonicalCardSurfaces() {
  const { designSystem, segment, theme } = useKiskadee();
  const designSystemKey = String(designSystem ?? '');
  const schema = useDesignSystemSchema(designSystemKey);

  const tones = useMemo(
    () =>
      resolveCanonicalCardSurfaces({
        schema,
        segment: String(segment ?? 'default'),
        theme: String(theme ?? 'light')
      }),
    [schema, segment, theme]
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
