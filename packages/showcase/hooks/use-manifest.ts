import { useEffect, useState } from 'react';
import type { Manifest } from '@kiskadee/web-builder/types';

async function loadManifest(designSystemKey: string): Promise<Manifest> {
  const response = await fetch(`/build/${designSystemKey}/manifest.json`);

  if (!response.ok) {
    throw new Error(
      `Failed to load manifest for design system "${designSystemKey}" (status ${response.status})`
    );
  }

  return (await response.json()) as Manifest;
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
