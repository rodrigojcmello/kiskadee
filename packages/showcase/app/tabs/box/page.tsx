'use client';

import {
  type TabsBoxIndicatorVariant,
  type TabsTabWidthMode,
  tabsIndicatorVariantsByType
} from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsBox } from '@kiskadee/react-components/tabs/box';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  DEFAULT_TAB_VALUE,
  type TabsIndicatorMotionStyleControl,
  type TabsMode,
  type TabsSpring,
  type TabsTabWidthModeControl,
  boxIndicatorVariantLabels,
  indicatorMotionStyleLabels,
  modeOptions,
  renderTabsSlots,
  springOptions,
  TabsShowcasePageShell,
  tabWidthModeLabels
} from '../ShowcaseTabs.shared';

export default function TabsBoxPage() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [indicatorVariant, setIndicatorVariant] = useState<TabsBoxIndicatorVariant>('square');
  const [tabWidthMode, setTabWidthMode] = useState<TabsTabWidthModeControl>('default');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaTabWidthMode = global?.components?.tabs?.options?.tabWidthMode ?? 'auto';
  const boxVariantOptions = tabsIndicatorVariantsByType.box.map((value) => ({
    value,
    label: boxIndicatorVariantLabels[value]
  }));
  const indicatorMotionStyleOptions = [
    { value: 'direct', label: indicatorMotionStyleLabels.direct },
    { value: 'stretch', label: indicatorMotionStyleLabels.stretch }
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

  const tabWidthModeProp: TabsTabWidthMode | undefined =
    tabWidthMode === 'default' ? undefined : tabWidthMode;
  const { tabs, contents } = renderTabsSlots(TabsBox, `box-${indicatorVariant}`);

  return (
    <TabsShowcasePageShell
      activeVariant="box"
      title="Tabs / Box"
      description="Box exposes the indicator shape selector together with motion controls and tab width."
      controls={
        <>
          <Select
            label="Mode"
            width={180}
            options={modeOptions}
            value={mode}
            onValueChange={(value) => setMode(value as TabsMode)}
          />
          {mode === 'animated' ? (
            <Select
              label="Spring"
              width={180}
              options={springOptions}
              value={spring}
              onValueChange={(value) => setSpring(value as TabsSpring)}
            />
          ) : null}
          {mode === 'animated' ? (
            <Select
              label="Motion Style"
              width={180}
              options={indicatorMotionStyleOptions}
              value={indicatorMotionStyle}
              onValueChange={(value) =>
                setIndicatorMotionStyle(value as TabsIndicatorMotionStyleControl)
              }
            />
          ) : null}
          <Select
            label="Indicator Variant"
            width={200}
            options={boxVariantOptions}
            value={indicatorVariant}
            onValueChange={(value) => setIndicatorVariant(value as TabsBoxIndicatorVariant)}
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
      <TabsBox.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidthMode={tabWidthModeProp}
        indicator={{
          motion: mode === 'animated' ? 'auto' : 'none',
          motionStyle: indicatorMotionStyle,
          variant: indicatorVariant
        }}
        spring={spring}
      >
        {tabs}
        {contents}
      </TabsBox.Root>
    </TabsShowcasePageShell>
  );
}
