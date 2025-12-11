import { useEffect, useState } from 'react';
import type { Manifest } from '@kiskadee/web-builder/types';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

async function loadManifest(designSystemKey: string): Promise<Manifest> {
  return loadJsonFromBuild<Manifest>(`${designSystemKey}/manifest.json`, { required: true });
}

export function useManifest(designSystemKey: string): Manifest | undefined {
  const [manifest, setManifest] = useState<Manifest | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    loadManifest(designSystemKey)
      .then((result) => {
        if (!cancelled) {
          setManifest(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setManifest(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [designSystemKey]);

  return manifest;
}
