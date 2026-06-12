'use client';

import type { TabsIndicatorPosition, TabsTabWidth } from '@kiskadee/core';
import { TabsDot, useTabsArtifactConfig } from '@kiskadee/react-components';
import { useState } from 'react';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import {
  DEFAULT_TAB_SIZE,
  DEFAULT_TAB_VALUE,
  indicatorPositionLabels,
  renderTabsSlots,
  type TabsIndicatorPositionControl,
  type TabsMode,
  TabsShowcasePageShell,
  type TabsSizeControl,
  type TabsTabWidthControl,
  tabSizeOptions,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsDotPage() {
  const { options: tabsArtifactOptions } = useTabsArtifactConfig();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [indicatorPosition, setIndicatorPosition] =
    useState<TabsIndicatorPositionControl>('default');
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [tabSize, setTabSize] = useState<TabsSizeControl>(DEFAULT_TAB_SIZE);
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaIndicatorPosition = tabsArtifactOptions.indicatorPosition ?? 'bottom';
  const schemaTabWidth = tabsArtifactOptions.tabWidth ?? 'content';
  const indicatorPositionOptions = [
    {
      value: 'default',
      label: `Schema Default (${indicatorPositionLabels[schemaIndicatorPosition]})`
    },
    { value: 'bottom', label: indicatorPositionLabels.bottom },
    { value: 'top', label: indicatorPositionLabels.top }
  ];
  const tabWidthOptions = [
    {
      value: 'default',
      label: `Schema Default (${tabWidthLabels[schemaTabWidth]})`
    },
    { value: 'content', label: tabWidthLabels.content },
    { value: 'fixed', label: tabWidthLabels.fixed },
    { value: 'adaptive', label: tabWidthLabels.adaptive },
    { value: 'distributed', label: tabWidthLabels.distributed }
  ];

  const indicatorPositionProp: TabsIndicatorPosition =
    indicatorPosition === 'default' ? schemaIndicatorPosition : indicatorPosition;
  const tabWidthProp: TabsTabWidth | undefined = tabWidth === 'default' ? undefined : tabWidth;
  const { tabs, contents } = renderTabsSlots(TabsDot, 'dot');
  const tabsDotControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Layout">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Size"
            options={tabSizeOptions}
            value={tabSize}
            onValueChange={(value) => setTabSize(value as TabsSizeControl)}
          />
          <ShowcaseSelectControl
            label="Indicator Side"
            options={indicatorPositionOptions}
            value={indicatorPosition}
            onValueChange={(value) => setIndicatorPosition(value as TabsIndicatorPositionControl)}
          />
          <ShowcaseSelectControl
            label="Tab Width"
            options={tabWidthOptions}
            value={tabWidth}
            onValueChange={(value) => setTabWidth(value as TabsTabWidthControl)}
          />
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Motion">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Animated"
            checked={mode === 'animated'}
            onCheckedChange={(checked) => setMode(checked ? 'animated' : 'static')}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <TabsShowcasePageShell
      activeVariant="dot"
      title="Tabs / Dot"
      description="Dot only needs the controls that affect its own runtime: mode, indicator side, and tab width."
      controls={tabsDotControls}
    >
      <TabsDot.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        scale={tabSize}
        tabWidth={tabWidthProp}
        indicator={{
          motion: mode === 'animated' ? 'auto' : 'none',
          position: indicatorPositionProp
        }}
      >
        {tabs}
        {contents}
      </TabsDot.Root>
    </TabsShowcasePageShell>
  );
}
