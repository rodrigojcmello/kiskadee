'use client';

import {
  type TabsBoxIndicatorShape,
  type TabsTabWidth,
  tabsIndicatorShapesByVariant
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
  type TabsTabWidthControl,
  boxIndicatorShapeLabels,
  indicatorMotionStyleLabels,
  modeOptions,
  renderTabsSlots,
  springOptions,
  TabsShowcasePageShell,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsBoxPage() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [indicatorShape, setIndicatorShape] = useState<TabsBoxIndicatorShape>('square');
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaTabWidth = global?.components?.tabs?.options?.tabWidth ?? 'auto';
  const boxShapeOptions = tabsIndicatorShapesByVariant.box.map((value) => ({
    value,
    label: boxIndicatorShapeLabels[value]
  }));
  const indicatorMotionStyleOptions = [
    { value: 'direct', label: indicatorMotionStyleLabels.direct },
    { value: 'stretch', label: indicatorMotionStyleLabels.stretch }
  ];
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
  const { tabs, contents } = renderTabsSlots(TabsBox, `box-${indicatorShape}`);

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
            label="Indicator Shape"
            width={200}
            options={boxShapeOptions}
            value={indicatorShape}
            onValueChange={(value) => setIndicatorShape(value as TabsBoxIndicatorShape)}
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
      <TabsBox.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidth={tabWidthProp}
        indicator={{
          motion: mode === 'animated' ? 'auto' : 'none',
          motionStyle: indicatorMotionStyle,
          shape: indicatorShape
        }}
        spring={spring}
      >
        {tabs}
        {contents}
      </TabsBox.Root>
    </TabsShowcasePageShell>
  );
}
