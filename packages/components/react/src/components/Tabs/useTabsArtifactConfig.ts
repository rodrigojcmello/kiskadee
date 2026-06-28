import type {
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorShape,
  TabsIndicatorWidth,
  TabsTabWidth,
  TabsVariant
} from '@kiskadee/core';
import type { TabsComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { useLoadedComponentArtifact } from '../../shared/contexts/useLoadedComponentArtifact.ts';
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

type LegacyTabsOptions = TabsArtifactConfig['options'] & {
  type?: TabsVariant;
  indicatorVariant?: TabsIndicatorShape;
  indicatorWidthMode?: TabsIndicatorWidth;
  tabWidthMode?: TabsTabWidth;
  lowerCurveMode?: TabsBridgeLowerCurve;
};

function isTabsComponentArtifact(artifact: unknown): artifact is TabsComponentArtifactJSON {
  return (artifact as TabsComponentArtifactJSON | undefined)?.component === 'tabs';
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
  const { classesMap, global } = useKiskadee();
  const { currentArtifact: tabsComponentArtifact } = useLoadedComponentArtifact({
    componentName: 'tabs',
    isArtifact: isTabsComponentArtifact
  });
  const legacyTabsConfig = global?.components?.tabs;
  const tabsClassesMap = useComponentClassMap(
    'tabs',
    classesMap.tabs as TabsVariantClassesMap | undefined
  );

  return {
    tabsClassesMap,
    options: tabsComponentArtifact?.options ?? normalizeTabsOptions(legacyTabsConfig?.options)
  };
}
