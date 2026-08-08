'use client';

import type { TypographyArtifact } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

const typographyArtifactCache = new Map<string, Promise<TypographyArtifact>>();

type TypographyArtifactState = {
  artifact?: TypographyArtifact;
  error?: Error;
  key?: string;
  loading: boolean;
};

function loadTypographyArtifact(
  designSystemKey: string,
  artifactPath: string
): Promise<TypographyArtifact> {
  const cacheKey = `${designSystemKey}/${artifactPath}`;
  const cached = typographyArtifactCache.get(cacheKey);
  if (cached) return cached;

  const pending = loadJsonFromBuild<TypographyArtifact>(cacheKey, { required: true }).catch(
    (error: unknown) => {
      if (typographyArtifactCache.get(cacheKey) === pending) {
        typographyArtifactCache.delete(cacheKey);
      }
      throw error;
    }
  );
  typographyArtifactCache.set(cacheKey, pending);
  return pending;
}

export function useTypographyArtifact(
  designSystemKey: string,
  artifactPath?: string
): TypographyArtifactState {
  const requestedKey = artifactPath ? `${designSystemKey}/${artifactPath}` : undefined;
  const [state, setState] = useState<TypographyArtifactState>(() => ({
    key: requestedKey,
    loading: requestedKey !== undefined
  }));

  useEffect(() => {
    let cancelled = false;

    if (!artifactPath || !requestedKey) {
      setState({ loading: false });
      return () => {
        cancelled = true;
      };
    }

    setState({ key: requestedKey, loading: true });
    loadTypographyArtifact(designSystemKey, artifactPath)
      .then((artifact) => {
        if (!cancelled) setState({ artifact, key: requestedKey, loading: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            error: error instanceof Error ? error : new Error(String(error)),
            key: requestedKey,
            loading: false
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [artifactPath, designSystemKey, requestedKey]);

  return state.key === requestedKey
    ? state
    : { key: requestedKey, loading: requestedKey !== undefined };
}
