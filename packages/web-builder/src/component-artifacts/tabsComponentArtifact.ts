import type {
  Schema,
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorShape,
  TabsIndicatorWidth,
  TabsTabWidth,
  TabsVariant
} from '@kiskadee/core';

export const TABS_COMPONENT_ARTIFACT_PATH = 'components/tabs.kiskadee.json';

export type TabsComponentOptionsPayload = {
  variant?: TabsVariant;
  indicatorPosition?: TabsIndicatorPosition;
  indicatorShape?: TabsIndicatorShape;
  indicatorWidth?: TabsIndicatorWidth;
  tabWidth?: TabsTabWidth;
  separator?: boolean;
  lowerCurve?: TabsBridgeLowerCurve;
};

export type TabsComponentArtifactJSON = {
  component: 'tabs';
  options: TabsComponentOptionsPayload;
};

export function buildTabsComponentArtifact(schema: Schema): TabsComponentArtifactJSON | null {
  const tabsSchema = schema.components?.tabs;
  if (!tabsSchema) return null;

  const options: TabsComponentOptionsPayload = {
    ...(tabsSchema.options?.variant ? { variant: tabsSchema.options.variant } : {}),
    ...(tabsSchema.options?.indicatorPosition
      ? { indicatorPosition: tabsSchema.options.indicatorPosition }
      : {}),
    ...(tabsSchema.options?.indicatorShape
      ? { indicatorShape: tabsSchema.options.indicatorShape }
      : {}),
    ...(tabsSchema.options?.indicatorWidth
      ? { indicatorWidth: tabsSchema.options.indicatorWidth }
      : {}),
    ...(tabsSchema.options?.tabWidth ? { tabWidth: tabsSchema.options.tabWidth } : {}),
    ...(tabsSchema.options?.separator !== undefined
      ? { separator: tabsSchema.options.separator }
      : {}),
    ...(tabsSchema.options?.lowerCurve ? { lowerCurve: tabsSchema.options.lowerCurve } : {})
  };

  if (!Object.keys(options).length) {
    return null;
  }

  return {
    component: 'tabs',
    options
  };
}
