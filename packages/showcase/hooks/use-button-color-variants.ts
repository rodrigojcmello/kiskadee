'use client';

import { useKiskadee } from '@kiskadee/react-components/resources';
import type { ComponentResourceArtifact } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import { loadComponentMetadata } from '@/utils/component-resources.client';
import { useManifest } from './use-manifest';

/** Discovers optional paint independently from component CSS and class-map readiness. */
export function useButtonColorVariantMetadata() {
  const { designSystem, componentArtifacts } = useKiskadee();
  const manifest = useManifest(designSystem);
  const key = `${designSystem}|${manifest?.revision ?? manifest?.version ?? ''}`;
  const [loaded, setLoaded] = useState<{ key: string; metadata?: ComponentResourceArtifact }>();
  useEffect(() => {
    let active = true;
    if (!manifest || !designSystem) return;
    void loadComponentMetadata(designSystem, manifest, 'button').then(
      (metadata) => {
        if (active) setLoaded({ key, metadata });
      },
      () => {
        if (active) setLoaded({ key });
      }
    );
    return () => {
      active = false;
    };
  }, [designSystem, manifest, key]);
  const metadata = loaded?.key === key ? loaded.metadata : undefined;
  return metadata ?? (componentArtifacts?.button as ComponentResourceArtifact | undefined);
}

export function useButtonColorVariants() {
  return useButtonColorVariantMetadata()?.capabilities?.colorVariants;
}
