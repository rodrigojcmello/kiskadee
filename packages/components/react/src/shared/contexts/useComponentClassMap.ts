import type { ComponentClassMapArtifactJSON } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import { getComponentArtifactCacheKey, loadCachedArtifact } from './componentArtifactCache.ts';
import { useKiskadee } from './KiskadeeContext.tsx';

type ComponentClassMapState<TClassMap> = {
  cacheKey: string;
  classMap: TClassMap | undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasElementClassShape = (value: Record<string, unknown>): boolean => {
  const elementKeys = ['d', 'e', 's', 'w', 'c', 'l', 'rr', 'rp', 'rs'];
  return elementKeys.some((key) => key in value);
};

const isClassElementMap = (value: unknown): value is Record<string, Record<string, unknown>> => {
  if (!isRecord(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  return entries.every(
    ([key, item]) => isRecord(item) && (/^e\d+$/.test(key) || hasElementClassShape(item))
  );
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
      const coreColors = (coreElement.c as Record<string, unknown> | undefined) ?? {};
      const paletteColors = (paletteElement.c as Record<string, unknown> | undefined) ?? {};
      mergedElement.c = { ...coreColors, ...paletteColors };
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

function mergeClassMapNode(coreNode: unknown, paletteNode: unknown): Record<string, unknown> {
  const coreIsElementMap = isClassElementMap(coreNode);
  const paletteIsElementMap = isClassElementMap(paletteNode);

  if (coreIsElementMap || paletteIsElementMap) {
    return mergeClassElementMaps(
      coreIsElementMap ? coreNode : undefined,
      paletteIsElementMap ? paletteNode : undefined
    );
  }

  const coreRecord = isRecord(coreNode) ? coreNode : {};
  const paletteRecord = isRecord(paletteNode) ? paletteNode : {};
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

export function useComponentClassMap<TClassMap>(
  componentName: string,
  aggregateClassMap: TClassMap | undefined
): TClassMap | undefined {
  const { artifactVersion, designSystem, loadComponentClassMap, segment, theme } = useKiskadee();
  const classMapCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    artifactKind: 'classMap:merged',
    segment,
    theme,
    componentName
  });
  const [classMapState, setClassMapState] = useState<ComponentClassMapState<TClassMap> | undefined>(
    undefined
  );
  const currentComponentClassMap =
    classMapState?.cacheKey === classMapCacheKey ? classMapState.classMap : undefined;
  const previousLoadedComponentClassMap =
    classMapState?.cacheKey !== classMapCacheKey ? classMapState?.classMap : undefined;

  useEffect(() => {
    let cancelled = false;

    if (!loadComponentClassMap) {
      return () => {
        cancelled = true;
      };
    }

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

    Promise.all([
      loadCachedArtifact<ComponentClassMapArtifactJSON<TClassMap>>({
        cacheKey: coreCacheKey,
        load: () => loadComponentClassMap(componentName, { kind: 'core' })
      }),
      loadCachedArtifact<ComponentClassMapArtifactJSON<TClassMap>>({
        cacheKey: paletteCacheKey,
        load: () =>
          loadComponentClassMap(componentName, {
            kind: 'palette',
            segment,
            theme
          })
      })
    ]).then(([coreArtifact, paletteArtifact]) => {
      if (cancelled) return;
      const coreClassMap = isComponentClassMapArtifact(coreArtifact, componentName)
        ? coreArtifact.classMap
        : undefined;
      const paletteClassMap = isComponentClassMapArtifact(paletteArtifact, componentName)
        ? paletteArtifact.classMap
        : undefined;
      setClassMapState({
        cacheKey: classMapCacheKey,
        classMap: mergeComponentClassMaps(coreClassMap, paletteClassMap)
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    artifactVersion,
    classMapCacheKey,
    componentName,
    designSystem,
    loadComponentClassMap,
    segment,
    theme
  ]);

  // Preserve the last loaded component map while a provider swaps manifests/design systems.
  return currentComponentClassMap ?? aggregateClassMap ?? previousLoadedComponentClassMap;
}
