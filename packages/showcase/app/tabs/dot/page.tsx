'use client';

import { type TabsIndicatorPosition, type TabsTabWidthMode } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsDot } from '@kiskadee/react-components/tabs/dot';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  DEFAULT_TAB_VALUE,
  type TabsIndicatorPositionControl,
  type TabsMode,
  type TabsTabWidthModeControl,
  indicatorPositionLabels,
  modeOptions,
  renderTabsSlots,
  TabsShowcasePageShell,
  tabWidthModeLabels
} from '../ShowcaseTabs.shared';

export default function TabsDotPage() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [indicatorPosition, setIndicatorPosition] = useState<TabsIndicatorPositionControl>('default');
  const [tabWidthMode, setTabWidthMode] = useState<TabsTabWidthModeControl>('default');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaIndicatorPosition = global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const schemaTabWidthMode = global?.components?.tabs?.options?.tabWidthMode ?? 'auto';
  const indicatorPositionOptions = [
    {
      value: 'default',
      label: `Schema Default (${indicatorPositionLabels[schemaIndicatorPosition]})`
    },
    { value: 'bottom', label: indicatorPositionLabels.bottom },
    { value: 'top', label: indicatorPositionLabels.top }
  ];
  const tabWidthModeOptions = [
    {
      value: 'default',
      label: `Schema Default (${tabWidthModeLabels[schemaTabWidthMode]})`
    },
    { value: 'auto', label: tabWidthModeLabels.auto },
    { value: 'fixed', label: tabWidthModeLabels.fixed },
    { value: 'distributed', label: tabWidthModeLabels.distributed }
  ];

  const indicatorPositionProp: TabsIndicatorPosition =
    indicatorPosition === 'default' ? schemaIndicatorPosition : indicatorPosition;
  const tabWidthModeProp: TabsTabWidthMode | undefined =
    tabWidthMode === 'default' ? undefined : tabWidthMode;
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
            options={tabWidthModeOptions}
            value={tabWidthMode}
            onValueChange={(value) => setTabWidthMode(value as TabsTabWidthModeControl)}
          />
        </>
      }
    >
      <TabsDot.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidthMode={tabWidthModeProp}
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
