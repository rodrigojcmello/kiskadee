'use client';

import { type TabsBridgeLowerCurveMode, type TabsTabWidthMode } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsBridge } from '@kiskadee/react-components/tabs/bridge';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  bridgeLowerCurveModeLabels,
  DEFAULT_TAB_VALUE,
  type TabsTabWidthModeControl,
  renderTabsSlots,
  TabsShowcasePageShell,
  tabWidthModeLabels
} from '../ShowcaseTabs.shared';

export default function TabsBridgePage() {
  const { global } = useKiskadee();
  const [tabWidthMode, setTabWidthMode] = useState<TabsTabWidthModeControl>('default');
  const [bridgeLowerCurveMode, setBridgeLowerCurveMode] =
    useState<TabsBridgeLowerCurveMode>('curved');
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
  const bridgeLowerCurveModeOptions = [
    { value: 'curved', label: bridgeLowerCurveModeLabels.curved },
    { value: 'flush-start', label: bridgeLowerCurveModeLabels['flush-start'] },
    { value: 'flush-end', label: bridgeLowerCurveModeLabels['flush-end'] },
    { value: 'flush-both', label: bridgeLowerCurveModeLabels['flush-both'] },
    { value: 'flush-all', label: bridgeLowerCurveModeLabels['flush-all'] }
  ];

  const tabWidthModeProp: TabsTabWidthMode | undefined =
    tabWidthMode === 'default' ? undefined : tabWidthMode;
  const { tabs, contents } = renderTabsSlots(TabsBridge, 'bridge');

  return (
    <TabsShowcasePageShell
      activeVariant="bridge"
      title="Tabs / Bridge"
      description="Bridge exposes only its structural controls: tab width and the bridge-only `lowerCurveMode`."
      controls={
        <>
          <Select
            label="Tab Width"
            width={220}
            options={tabWidthModeOptions}
            value={tabWidthMode}
            onValueChange={(value) => setTabWidthMode(value as TabsTabWidthModeControl)}
          />
          <Select
            label="Lower Curve"
            width={220}
            options={bridgeLowerCurveModeOptions}
            value={bridgeLowerCurveMode}
            onValueChange={(value) => setBridgeLowerCurveMode(value as TabsBridgeLowerCurveMode)}
          />
        </>
      }
    >
      <TabsBridge.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidthMode={tabWidthModeProp}
        lowerCurveMode={bridgeLowerCurveMode}
      >
        {tabs}
        {contents}
      </TabsBridge.Root>
    </TabsShowcasePageShell>
  );
}
