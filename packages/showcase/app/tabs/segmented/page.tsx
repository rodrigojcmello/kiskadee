'use client';

import { type TabsTabWidthMode } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsSegmented } from '@kiskadee/react-components/tabs/segmented';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  DEFAULT_TAB_VALUE,
  type TabsTabWidthModeControl,
  renderTabsSlots,
  TabsShowcasePageShell,
  tabWidthModeLabels
} from '../ShowcaseTabs.shared';

export default function TabsSegmentedPage() {
  const { global } = useKiskadee();
  const [tabWidthMode, setTabWidthMode] = useState<TabsTabWidthModeControl>('default');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaTabWidthMode = global?.components?.tabs?.options?.tabWidthMode ?? 'auto';
  const tabWidthModeOptions = [
    {
      value: 'default',
      label: `Schema Default (${tabWidthModeLabels[schemaTabWidthMode]})`
    },
    { value: 'auto', label: tabWidthModeLabels.auto },
    { value: 'fixed', label: tabWidthModeLabels.fixed },
    { value: 'distributed', label: tabWidthModeLabels.distributed }
  ];
  const tabWidthModeProp: TabsTabWidthMode | undefined =
    tabWidthMode === 'default' ? undefined : tabWidthMode;
  const { tabs, contents } = renderTabsSlots(TabsSegmented, 'segmented');

  return (
    <TabsShowcasePageShell
      activeVariant="segmented"
      title="Tabs / Segmented"
      description="Segmented does not expose indicator controls, so this page focuses only on tab width behavior."
      controls={
        <Select
          label="Tab Width"
          width={220}
          options={tabWidthModeOptions}
          value={tabWidthMode}
          onValueChange={(value) => setTabWidthMode(value as TabsTabWidthModeControl)}
        />
      }
    >
      <TabsSegmented.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidthMode={tabWidthModeProp}
      >
        {tabs}
        {contents}
      </TabsSegmented.Root>
    </TabsShowcasePageShell>
  );
}
