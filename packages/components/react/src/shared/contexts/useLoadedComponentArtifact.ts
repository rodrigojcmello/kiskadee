import { useCallback, useRef, useSyncExternalStore } from 'react';
import {
  getComponentArtifactCacheKey,
  loadCachedArtifactOrThrow
} from './componentArtifactCache.ts';
import { useKiskadee } from './KiskadeeContext.tsx';

type ArtifactSnapshot = {
  status: 'pending' | 'ready' | 'absent' | 'error';
  artifact?: unknown;
  error?: unknown;
};
const PENDING: ArtifactSnapshot = { status: 'pending' };
const snapshots = new Map<string, ArtifactSnapshot>();
const listeners = new Map<string, Set<() => void>>();
const pendingLoads = new Set<string>();
const serverSnapshot = () => PENDING;

function publish(cacheKey: string, snapshot: ArtifactSnapshot) {
  snapshots.set(cacheKey, snapshot);
  for (const notify of listeners.get(cacheKey) ?? []) notify();
}

function loadArtifact(cacheKey: string, load: () => Promise<unknown>) {
  if (pendingLoads.has(cacheKey)) return;
  pendingLoads.add(cacheKey);
  publish(cacheKey, PENDING);
  void loadCachedArtifactOrThrow({ cacheKey, load }).then(
    (artifact) => {
      pendingLoads.delete(cacheKey);
      publish(cacheKey, { status: artifact === undefined ? 'absent' : 'ready', artifact });
    },
    (error) => {
      pendingLoads.delete(cacheKey);
      publish(cacheKey, { status: 'error', error });
    }
  );
}

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
  status: ArtifactSnapshot['status'];
  error: unknown;
  retry: () => void;
};

export function useLoadedComponentArtifact<TArtifact>({
  componentName,
  isArtifact,
  preservePrevious = false,
  resetWhenLoaderMissing = true
}: UseLoadedComponentArtifactOptions<TArtifact>): LoadedComponentArtifact<TArtifact> {
  const { artifactVersion, designSystem, loadComponentArtifact } = useKiskadee();
  const cacheKey = getComponentArtifactCacheKey({ designSystem, artifactVersion, componentName });
  const previous = useRef<{ cacheKey: string; artifact: unknown } | undefined>(undefined);
  const load = useCallback(
    () =>
      loadComponentArtifact ? loadComponentArtifact(componentName) : Promise.resolve(undefined),
    [componentName, loadComponentArtifact]
  );
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!loadComponentArtifact) {
        if (resetWhenLoaderMissing) previous.current = undefined;
        return () => {};
      }
      const subscribers = listeners.get(cacheKey) ?? new Set<() => void>();
      const capture = () => {
        const snapshot = snapshots.get(cacheKey);
        if (snapshot?.status === 'ready') {
          previous.current = { cacheKey, artifact: snapshot.artifact };
        } else if (snapshot?.status === 'absent') {
          previous.current = undefined;
        }
        notify();
      };
      subscribers.add(capture);
      listeners.set(cacheKey, subscribers);
      const snapshot = snapshots.get(cacheKey);
      if (!snapshot || snapshot.status === 'error') loadArtifact(cacheKey, load);
      else capture();
      return () => {
        subscribers.delete(capture);
        if (!subscribers.size) listeners.delete(cacheKey);
      };
    },
    [cacheKey, load, loadComponentArtifact, resetWhenLoaderMissing]
  );
  const read = useCallback(() => snapshots.get(cacheKey) ?? PENDING, [cacheKey]);
  const snapshot = useSyncExternalStore(subscribe, read, serverSnapshot);
  const canRead = Boolean(loadComponentArtifact) || !resetWhenLoaderMissing;
  const currentArtifact =
    canRead && snapshot.status === 'ready' && isArtifact(snapshot.artifact)
      ? snapshot.artifact
      : undefined;
  const retry = useCallback(() => {
    if (loadComponentArtifact) loadArtifact(cacheKey, load);
  }, [cacheKey, load, loadComponentArtifact]);

  return {
    cacheKey,
    currentArtifact,
    previousArtifact:
      canRead &&
      preservePrevious &&
      previous.current !== undefined &&
      previous.current.cacheKey !== cacheKey &&
      isArtifact(previous.current?.artifact)
        ? previous.current.artifact
        : undefined,
    status: !canRead
      ? 'absent'
      : snapshot.status === 'ready' && !currentArtifact
        ? 'absent'
        : snapshot.status,
    error: snapshot.error,
    retry
  };
}
