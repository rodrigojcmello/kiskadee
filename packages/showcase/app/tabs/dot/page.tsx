'use client';

import { type TabsIndicatorPosition, type TabsTabWidth } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsDot } from '@kiskadee/react-components/tabs/dot';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  DEFAULT_TAB_VALUE,
  type TabsIndicatorPositionControl,
  type TabsMode,
  type TabsTabWidthControl,
  indicatorPositionLabels,
  modeOptions,
  renderTabsSlots,
  TabsShowcasePageShell,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsDotPage() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [indicatorPosition, setIndicatorPosition] = useState<TabsIndicatorPositionControl>('default');
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaIndicatorPosition = global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const schemaTabWidth = global?.components?.tabs?.options?.tabWidth ?? 'auto';
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
    { value: 'auto', label: tabWidthLabels.auto },
    { value: 'fixed', label: tabWidthLabels.fixed },
    { value: 'distributed', label: tabWidthLabels.distributed }
  ];

  const indicatorPositionProp: TabsIndicatorPosition =
    indicatorPosition === 'default' ? schemaIndicatorPosition : indicatorPosition;
  const tabWidthProp: TabsTabWidth | undefined = tabWidth === 'default' ? undefined : tabWidth;
  const { tabs, contents } = renderTabsSlots(TabsDot, 'dot');

  return (
    <TabsShowcasePageShell
      activeVariant="dot"
      title="Tabs / Dot"
      description="Dot only needs the controls that affect its own runtime: mode, indicator side, and tab width."
      controls={
        <>
          <Select
            label="Mode"
            width={180}
            options={modeOptions}
            value={mode}
            onValueChange={(value) => setMode(value as TabsMode)}
          />
          <Select
            label="Indicator Side"
            width={220}
            options={indicatorPositionOptions}
            value={indicatorPosition}
            onValueChange={(value) => setIndicatorPosition(value as TabsIndicatorPositionControl)}
          />
          <Select
            label="Tab Width"
            width={220}
            options={tabWidthOptions}
            value={tabWidth}
            onValueChange={(value) => setTabWidth(value as TabsTabWidthControl)}
          />
        </>
      }
    >
      <TabsDot.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
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
