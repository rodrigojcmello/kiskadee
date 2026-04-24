'use client';

import { type TabsTabWidth } from '@kiskadee/core';
import { TabsSegmented, useKiskadee } from '@kiskadee/react-components';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  DEFAULT_TAB_VALUE,
  DEFAULT_TAB_SIZE,
  type TabsSizeControl,
  type TabsTabWidthControl,
  renderTabsSlots,
  tabSizeOptions,
  TabsShowcasePageShell,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsSegmentedPage() {
  const { global } = useKiskadee();
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [tabSize, setTabSize] = useState<TabsSizeControl>(DEFAULT_TAB_SIZE);
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaTabWidth = global?.components?.tabs?.options?.tabWidth ?? 'auto';
  const tabWidthOptions = [
    {
      value: 'default',
      label: `Schema Default (${tabWidthLabels[schemaTabWidth]})`
    },
    { value: 'auto', label: tabWidthLabels.auto },
    { value: 'fixed', label: tabWidthLabels.fixed },
    { value: 'adaptive', label: tabWidthLabels.adaptive },
    { value: 'distributed', label: tabWidthLabels.distributed }
  ];
  const tabWidthProp: TabsTabWidth | undefined = tabWidth === 'default' ? undefined : tabWidth;
  const { tabs, contents } = renderTabsSlots(TabsSegmented, 'segmented');

  return (
    <TabsShowcasePageShell
      activeVariant="segmented"
      title="Tabs / Segmented"
      description="Segmented does not expose indicator controls, so this page focuses only on tab width behavior."
      controls={
        <>
          <Select
            label="Size"
            width={180}
            options={tabSizeOptions}
            value={tabSize}
            onValueChange={(value) => setTabSize(value as TabsSizeControl)}
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
      <TabsSegmented.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        scale={tabSize}
        tabWidth={tabWidthProp}
      >
        {tabs}
        {contents}
      </TabsSegmented.Root>
    </TabsShowcasePageShell>
  );
}
