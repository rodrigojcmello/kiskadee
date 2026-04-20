'use client';

import { type TabsBridgeLowerCurve, type TabsTabWidth } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsBridge } from '@kiskadee/react-components/tabs/bridge';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  bridgeLowerCurveLabels,
  DEFAULT_TAB_VALUE,
  type TabsTabWidthControl,
  renderTabsSlots,
  TabsShowcasePageShell,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsBridgePage() {
  const { global } = useKiskadee();
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [bridgeLowerCurve, setBridgeLowerCurve] =
    useState<TabsBridgeLowerCurve>('curved');
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
  const bridgeLowerCurveOptions = [
    { value: 'curved', label: bridgeLowerCurveLabels.curved },
    { value: 'flush-start', label: bridgeLowerCurveLabels['flush-start'] },
    { value: 'flush-end', label: bridgeLowerCurveLabels['flush-end'] },
    { value: 'flush-both', label: bridgeLowerCurveLabels['flush-both'] },
    { value: 'flush-all', label: bridgeLowerCurveLabels['flush-all'] }
  ];

  const tabWidthProp: TabsTabWidth | undefined = tabWidth === 'default' ? undefined : tabWidth;
  const { tabs, contents } = renderTabsSlots(TabsBridge, 'bridge');

  return (
    <TabsShowcasePageShell
      activeVariant="bridge"
      title="Tabs / Bridge"
      description="Bridge exposes only its structural controls: tab width and the bridge-only `lowerCurve`."
      controls={
        <>
          <Select
            label="Tab Width"
            width={220}
            options={tabWidthOptions}
            value={tabWidth}
            onValueChange={(value) => setTabWidth(value as TabsTabWidthControl)}
          />
          <Select
            label="Lower Curve"
            width={220}
            options={bridgeLowerCurveOptions}
            value={bridgeLowerCurve}
            onValueChange={(value) => setBridgeLowerCurve(value as TabsBridgeLowerCurve)}
          />
        </>
      }
    >
      <TabsBridge.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidth={tabWidthProp}
        lowerCurve={bridgeLowerCurve}
      >
        {tabs}
        {contents}
      </TabsBridge.Root>
    </TabsShowcasePageShell>
  );
}
