import type { ComponentClassMapArtifactJSON } from '@kiskadee/web-builder/types';
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { useBrandPack } from './BrandPackContext.tsx';
import {
  getComponentArtifactCacheKey,
  loadCachedArtifactOrThrow
} from './componentArtifactCache.ts';
import { useKiskadee } from './KiskadeeContext.tsx';

type ComponentClassMapSnapshot<TClassMap> = {
  status: 'resolved';
  classMap: TClassMap | undefined;
};

const EMPTY_COMPONENT_CLASS_MAP_SNAPSHOT = { status: 'pending' } as const;
const componentClassMapSnapshots = new Map<string, ComponentClassMapSnapshot<unknown>>();
const componentClassMapLoads = new Set<string>();
const componentClassMapListeners = new Map<string, Set<() => void>>();
const readPendingComponentClassMapSnapshot = () => EMPTY_COMPONENT_CLASS_MAP_SNAPSHOT;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isClassElementMap = (value: unknown): value is Record<string, Record<string, unknown>> => {
  if (!isRecord(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  return entries.every(([key, item]) => /^e\d+$/.test(key) && isRecord(item));
};

function isComponentClassMapArtifact<TClassMap>(
  artifact: ComponentClassMapArtifactJSON<TClassMap> | undefined,
  componentName: string
): artifact is ComponentClassMapArtifactJSON<TClassMap> {
  return artifact?.component === componentName && artifact.classMap !== undefined;
}

function mergeClassElementMaps(
  coreMap: Record<string, Record<string, unknown>> | undefined,
  paletteMap: Record<string, Record<string, unknown>> | undefined
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const elementKeys = new Set([...Object.keys(coreMap ?? {}), ...Object.keys(paletteMap ?? {})]);

  for (const elementName of elementKeys) {
    const coreElement = coreMap?.[elementName] ?? {};
    const paletteElement = paletteMap?.[elementName] ?? {};
    const mergedElement: Record<string, unknown> = { ...coreElement };

    if (paletteElement.c) {
      mergedElement.c = mergeClassMapNode(coreElement.c, paletteElement.c);
    }

    for (const key of ['d', 'e', 's', 'w', 'l', 'rr', 'rp', 'rs']) {
      if (mergedElement[key] === undefined && paletteElement[key] !== undefined) {
        mergedElement[key] = paletteElement[key];
      }
    }

    out[elementName] = mergedElement;
  }

  return out;
}

function mergeClassMapNode(coreNode: unknown, paletteNode: unknown): unknown {
  if (paletteNode === undefined) return coreNode;
  if (coreNode === undefined) return paletteNode;

  const coreIsElementMap = isClassElementMap(coreNode);
  const paletteIsElementMap = isClassElementMap(paletteNode);

  if (coreIsElementMap || paletteIsElementMap) {
    return mergeClassElementMaps(
      coreIsElementMap ? coreNode : undefined,
      paletteIsElementMap ? paletteNode : undefined
    );
  }

  if (!isRecord(coreNode) || !isRecord(paletteNode)) {
    return paletteNode;
  }

  const coreRecord = coreNode;
  const paletteRecord = paletteNode;
  const keys = new Set([...Object.keys(coreRecord), ...Object.keys(paletteRecord)]);
  const out: Record<string, unknown> = {};

  for (const key of keys) {
    out[key] = mergeClassMapNode(coreRecord[key], paletteRecord[key]);
  }

  return out;
}

function mergeComponentClassMaps<TClassMap>(
  coreClassMap: TClassMap | undefined,
  paletteClassMap: TClassMap | undefined
): TClassMap | undefined {
  if (!coreClassMap && !paletteClassMap) return undefined;
  return mergeClassMapNode(coreClassMap, paletteClassMap) as TClassMap;
}

function unwrapBrandComponentClassMap<TClassMap>(
  value: unknown,
  componentName: string
): TClassMap | undefined {
  if (!value) return undefined;
  if (isRecord(value) && 'component' in value && 'classMap' in value) {
    const artifact = value as unknown as ComponentClassMapArtifactJSON<TClassMap>;
    return isComponentClassMapArtifact(artifact, componentName) ? artifact.classMap : undefined;
  }
  return value as TClassMap;
}

function getComponentClassMapSnapshot<TClassMap>(
  cacheKey: string
): ComponentClassMapSnapshot<TClassMap> | typeof EMPTY_COMPONENT_CLASS_MAP_SNAPSHOT {
  return (
    (componentClassMapSnapshots.get(cacheKey) as
      | ComponentClassMapSnapshot<TClassMap>
      | undefined) ?? EMPTY_COMPONENT_CLASS_MAP_SNAPSHOT
  );
}

function subscribeToComponentClassMap<TClassMap>({
  cacheKey,
  listener,
  load
}: {
  cacheKey: string;
  listener: () => void;
  load: () => Promise<TClassMap | undefined>;
}): () => void {
  const listeners = componentClassMapListeners.get(cacheKey) ?? new Set<() => void>();
  listeners.add(listener);
  componentClassMapListeners.set(cacheKey, listeners);

  if (!componentClassMapSnapshots.has(cacheKey) && !componentClassMapLoads.has(cacheKey)) {
    componentClassMapLoads.add(cacheKey);

    const settle = (classMap: TClassMap | undefined) => {
      componentClassMapSnapshots.set(cacheKey, { status: 'resolved', classMap });
      componentClassMapLoads.delete(cacheKey);
      for (const notify of componentClassMapListeners.get(cacheKey) ?? []) notify();
    };

    const reject = () => {
      componentClassMapLoads.delete(cacheKey);
      componentClassMapSnapshots.delete(cacheKey);
    };

    void load().then(settle, reject);
  }

  return () => {
    const currentListeners = componentClassMapListeners.get(cacheKey);
    currentListeners?.delete(listener);
    if (currentListeners?.size === 0) componentClassMapListeners.delete(cacheKey);
  };
}

export type ComponentClassMapResolution<TClassMap> = {
  classMap: TClassMap | undefined;
  pending: boolean;
};

export function useComponentClassMapResolution<TClassMap>(
  componentName: string,
  aggregateClassMap: TClassMap | undefined,
  enabled = true
): ComponentClassMapResolution<TClassMap> {
  const { artifactVersion, designSystem, loadComponentClassMap, segment, theme } = useKiskadee();
  const brandPack = useBrandPack();
  const classMapCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    artifactKind: 'classMap:merged',
    segment,
    theme,
    componentName
  });
  const previousResolvedComponentClassMapRef = useRef<{
    cacheKey: string;
    classMap: TClassMap | undefined;
  } | null>(null);
  const loadMergedComponentClassMap = useCallback(async (): Promise<TClassMap | undefined> => {
    if (!loadComponentClassMap) return undefined;
    const coreCacheKey = getComponentArtifactCacheKey({
      designSystem,
      artifactVersion,
      artifactKind: 'classMap:core',
      componentName
    });
    const paletteCacheKey = getComponentArtifactCacheKey({
      designSystem,
      artifactVersion,
      artifactKind: 'classMap:palette',
      segment,
      theme,
      componentName
    });
    const [coreArtifact, paletteArtifact] = await Promise.all([
      loadCachedArtifactOrThrow<ComponentClassMapArtifactJSON<TClassMap>>({
        cacheKey: coreCacheKey,
        load: () => loadComponentClassMap(componentName, { kind: 'core' })
      }),
      loadCachedArtifactOrThrow<ComponentClassMapArtifactJSON<TClassMap>>({
        cacheKey: paletteCacheKey,
        load: () =>
          loadComponentClassMap(componentName, {
            kind: 'palette',
            segment,
            theme
          })
      })
    ]);
    const coreClassMap = isComponentClassMapArtifact(coreArtifact, componentName)
      ? coreArtifact.classMap
      : undefined;
    const paletteClassMap = isComponentClassMapArtifact(paletteArtifact, componentName)
      ? paletteArtifact.classMap
      : undefined;
    return mergeComponentClassMaps(coreClassMap, paletteClassMap);
  }, [artifactVersion, componentName, designSystem, loadComponentClassMap, segment, theme]);

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!enabled) return () => {};

      const captureResolvedSnapshot = () => {
        const snapshot = getComponentClassMapSnapshot<TClassMap>(classMapCacheKey);
        if (snapshot.status === 'resolved') {
          previousResolvedComponentClassMapRef.current = {
            cacheKey: classMapCacheKey,
            classMap: snapshot.classMap
          };
        }
      };

      captureResolvedSnapshot();
      if (!loadComponentClassMap) return () => {};

      return subscribeToComponentClassMap({
        cacheKey: classMapCacheKey,
        listener: () => {
          captureResolvedSnapshot();
          listener();
        },
        load: loadMergedComponentClassMap
      });
    },
    [classMapCacheKey, enabled, loadComponentClassMap, loadMergedComponentClassMap]
  );
  const readSnapshot = useCallback(
    () =>
      enabled
        ? getComponentClassMapSnapshot<TClassMap>(classMapCacheKey)
        : EMPTY_COMPONENT_CLASS_MAP_SNAPSHOT,
    [classMapCacheKey, enabled]
  );
  const loadedSnapshot = useSyncExternalStore(
    subscribe,
    readSnapshot,
    readPendingComponentClassMapSnapshot
  );
  const currentComponentClassMap =
    loadedSnapshot.status === 'resolved' ? loadedSnapshot.classMap : undefined;
  const previousLoadedComponentClassMap =
    enabled && loadedSnapshot.status === 'pending'
      ? previousResolvedComponentClassMapRef.current?.classMap
      : undefined;

  // Preserve the last loaded component map while a provider swaps manifests/design systems.
  const baseClassMap =
    currentComponentClassMap ?? aggregateClassMap ?? previousLoadedComponentClassMap;
  const brandComponentClassMap = brandPack?.hasComponent(componentName)
    ? unwrapBrandComponentClassMap<TClassMap>(
        brandPack.resources.classMaps[componentName],
        componentName
      )
    : undefined;

  const classMap = useMemo(
    () => mergeComponentClassMaps(baseClassMap, brandComponentClassMap),
    [baseClassMap, brandComponentClassMap]
  );

  return {
    classMap,
    pending: Boolean(enabled && loadComponentClassMap && loadedSnapshot.status === 'pending')
  };
}

export function useComponentClassMap<TClassMap>(
  componentName: string,
  aggregateClassMap: TClassMap | undefined
): TClassMap | undefined {
  return useComponentClassMapResolution(componentName, aggregateClassMap).classMap;
}
