'use client';
import type { Manifest, SegmentArtifact } from '@kiskadee/web-builder/types';
import { useCallback, useEffect, useState } from 'react';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

export function useSegmentMetadata(designSystem: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; data?: SegmentArtifact; error?: Error }>();
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    setState({ key: designSystem });
    async function load() {
      const manifest = await loadJsonFromBuild<Manifest>(`${designSystem}/manifest.json`, {
        required: true
      });
      if (!manifest.segmentMetadata) throw new Error('Segment metadata is not published');
      return loadJsonFromBuild<SegmentArtifact>(
        `${designSystem}/${manifest.segmentMetadata}?revision=${encodeURIComponent(manifest.revision ?? '')}`,
        { required: true }
      );
    }
    void load().then(
      (data) => {
        if (active) setState({ key: designSystem, data });
      },
      (error: Error) => {
        if (active) setState({ key: designSystem, error });
      }
    );
    return () => {
      active = false;
    };
  }, [designSystem, attempt]);
  return { ...(state?.key === designSystem ? state : {}), retry };
}
