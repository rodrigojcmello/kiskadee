import type { Manifest } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

export async function loadManifest(designSystemKey: string): Promise<Manifest> {
  const manifest = await loadJsonFromBuild<Manifest>(`${designSystemKey}/manifest.json`, {
    required: true
  });
  if (manifest.formatVersion !== 3) throw new Error('Unsupported manifest format version.');
  return manifest;
}

export function useManifest(designSystemKey?: string): Manifest | undefined {
  const [loaded, setLoaded] = useState<{ key: string; manifest: Manifest }>();

  useEffect(() => {
    let cancelled = false;

    if (!designSystemKey) {
      setLoaded(undefined);
      return () => {
        cancelled = true;
      };
    }

    loadManifest(designSystemKey)
      .then((result) => {
        if (!cancelled) {
          setLoaded({ key: designSystemKey, manifest: result });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [designSystemKey]);

  return loaded && loaded.key === designSystemKey ? loaded.manifest : undefined;
}
