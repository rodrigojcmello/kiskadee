import { useEffect, useState } from 'react';
import {
  getComponentArtifactCacheKey,
  loadCachedComponentArtifact
} from './componentArtifactCache.ts';
import { useKiskadee } from './KiskadeeContext.tsx';

type ComponentArtifactState<TArtifact> = {
  cacheKey: string;
  artifact: TArtifact | undefined;
};

export type UseLoadedComponentArtifactOptions<TArtifact> = {
  componentName: string;
  isArtifact: (artifact: unknown) => artifact is TArtifact;
  preservePrevious?: boolean;
  resetWhenLoaderMissing?: boolean;
};

export type LoadedComponentArtifact<TArtifact> = {
  cacheKey: string;
  currentArtifact: TArtifact | undefined;
  previousArtifact: TArtifact | undefined;
};

export function useLoadedComponentArtifact<TArtifact>({
  componentName,
  isArtifact,
  preservePrevious = false,
  resetWhenLoaderMissing = true
}: UseLoadedComponentArtifactOptions<TArtifact>): LoadedComponentArtifact<TArtifact> {
  const { artifactVersion, designSystem, loadComponentArtifact } = useKiskadee();
  const cacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    componentName
  });
  const [artifactState, setArtifactState] = useState<ComponentArtifactState<TArtifact> | undefined>(
    undefined
  );
  const currentArtifact = artifactState?.cacheKey === cacheKey ? artifactState.artifact : undefined;
  const previousArtifact =
    preservePrevious && artifactState?.cacheKey !== cacheKey ? artifactState?.artifact : undefined;

  useEffect(() => {
    let cancelled = false;

    if (!loadComponentArtifact) {
      if (resetWhenLoaderMissing) {
        setArtifactState(undefined);
      }
      return () => {
        cancelled = true;
      };
    }

    loadCachedComponentArtifact<unknown>({
      cacheKey,
      componentName,
      loadComponentArtifact
    }).then((artifact) => {
      if (cancelled) return;
      setArtifactState({
        cacheKey,
        artifact: isArtifact(artifact) ? artifact : undefined
      });
    });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, componentName, isArtifact, loadComponentArtifact, resetWhenLoaderMissing]);

  return {
    cacheKey,
    currentArtifact,
    previousArtifact
  };
}
