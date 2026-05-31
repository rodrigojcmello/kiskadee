import type {
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorShape,
  TabsIndicatorWidth,
  TabsTabWidth,
  TabsVariant
} from '@kiskadee/core';
import type { TabsComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import {
  getComponentArtifactCacheKey,
  loadCachedComponentArtifact
} from '../../shared/contexts/componentArtifactCache.ts';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import type { TabsVariantClassesMap } from './Tabs.types.ts';

export type TabsArtifactConfig = {
  tabsClassesMap: TabsVariantClassesMap | undefined;
  options: {
    variant?: TabsVariant;
    indicatorPosition?: TabsIndicatorPosition;
    indicatorShape?: TabsIndicatorShape;
    indicatorWidth?: TabsIndicatorWidth;
    tabWidth?: TabsTabWidth;
    separator?: boolean;
    lowerCurve?: TabsBridgeLowerCurve;
  };
};

type TabsArtifactState = {
  cacheKey: string;
  artifact: TabsComponentArtifactJSON | undefined;
};

type LegacyTabsOptions = TabsArtifactConfig['options'] & {
  type?: TabsVariant;
  indicatorVariant?: TabsIndicatorShape;
  indicatorWidthMode?: TabsIndicatorWidth;
  tabWidthMode?: TabsTabWidth;
  lowerCurveMode?: TabsBridgeLowerCurve;
};

function isTabsComponentArtifact(
  artifact: TabsComponentArtifactJSON | undefined
): artifact is TabsComponentArtifactJSON {
  return artifact?.component === 'tabs';
}

function normalizeTabsOptions(
  options: LegacyTabsOptions | undefined
): TabsArtifactConfig['options'] {
  return {
    ...((options?.variant ?? options?.type) ? { variant: options.variant ?? options.type } : {}),
    ...(options?.indicatorPosition ? { indicatorPosition: options.indicatorPosition } : {}),
    ...((options?.indicatorShape ?? options?.indicatorVariant)
      ? { indicatorShape: options.indicatorShape ?? options.indicatorVariant }
      : {}),
    ...((options?.indicatorWidth ?? options?.indicatorWidthMode)
      ? { indicatorWidth: options.indicatorWidth ?? options.indicatorWidthMode }
      : {}),
    ...((options?.tabWidth ?? options?.tabWidthMode)
      ? { tabWidth: options.tabWidth ?? options.tabWidthMode }
      : {}),
    ...(options?.separator !== undefined ? { separator: options.separator } : {}),
    ...((options?.lowerCurve ?? options?.lowerCurveMode)
      ? { lowerCurve: options.lowerCurve ?? options.lowerCurveMode }
      : {})
  };
}

export function useTabsArtifactConfig(): TabsArtifactConfig {
  const { artifactVersion, classesMap, designSystem, global, loadComponentArtifact } =
    useKiskadee();
  const tabsArtifactCacheKey = getComponentArtifactCacheKey({
    designSystem,
    artifactVersion,
    componentName: 'tabs'
  });
  const [artifactState, setArtifactState] = useState<TabsArtifactState | undefined>(undefined);
  const tabsComponentArtifact =
    artifactState?.cacheKey === tabsArtifactCacheKey ? artifactState.artifact : undefined;
  const legacyTabsConfig = global?.components?.tabs;
  const tabsClassesMap = useComponentClassMap(
    'tabs',
    classesMap.tabs as TabsVariantClassesMap | undefined
  );

  useEffect(() => {
    let cancelled = false;

    if (!loadComponentArtifact) {
      setArtifactState(undefined);
      return () => {
        cancelled = true;
      };
    }

    loadCachedComponentArtifact<TabsComponentArtifactJSON>({
      cacheKey: tabsArtifactCacheKey,
      componentName: 'tabs',
      loadComponentArtifact
    }).then((artifact) => {
      if (cancelled) return;
      setArtifactState({
        cacheKey: tabsArtifactCacheKey,
        artifact: isTabsComponentArtifact(artifact) ? artifact : undefined
      });
    });

    return () => {
      cancelled = true;
    };
  }, [loadComponentArtifact, tabsArtifactCacheKey]);

  return {
    tabsClassesMap,
    options: tabsComponentArtifact?.options ?? normalizeTabsOptions(legacyTabsConfig?.options)
  };
}
