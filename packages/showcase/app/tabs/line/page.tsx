'use client';

import {
  type TabsIndicatorPosition,
  type TabsIndicatorWidth,
  type TabsLineIndicatorShape,
  type TabsTabWidth,
  tabsIndicatorShapesByVariant
} from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsLine } from '@kiskadee/react-components/tabs/line';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  DEFAULT_TAB_VALUE,
  type TabsIndicatorMotionStyleControl,
  type TabsIndicatorPositionControl,
  type TabsLineWidthControl,
  type TabsMode,
  type TabsSpring,
  type TabsTabWidthControl,
  indicatorMotionStyleLabels,
  indicatorPositionLabels,
  lineIndicatorShapeLabels,
  lineIndicatorWidthLabels,
  modeOptions,
  renderTabsSlots,
  springOptions,
  TabsShowcasePageShell,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsLinePage() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [indicatorPosition, setIndicatorPosition] = useState<TabsIndicatorPositionControl>('default');
  const [lineWidth, setLineWidth] = useState<TabsLineWidthControl>('default');
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [indicatorShape, setIndicatorShape] = useState<TabsLineIndicatorShape>('square');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaLineWidth = global?.components?.tabs?.options?.indicatorWidth ?? 'tab';
  const schemaIndicatorPosition = global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const schemaTabWidth = global?.components?.tabs?.options?.tabWidth ?? 'auto';

  const lineShapeOptions = tabsIndicatorShapesByVariant.line.map((value) => ({
    value,
    label: lineIndicatorShapeLabels[value]
  }));
  const indicatorMotionStyleOptions = [
    { value: 'direct', label: indicatorMotionStyleLabels.direct },
    { value: 'stretch', label: indicatorMotionStyleLabels.stretch }
  ];
  const lineWidthOptions = [
    {
      value: 'default',
      label: `Schema Default (${lineIndicatorWidthLabels[schemaLineWidth]})`
    },
    { value: 'tab', label: lineIndicatorWidthLabels.tab },
    { value: 'content', label: lineIndicatorWidthLabels.content },
    { value: 'fixed', label: lineIndicatorWidthLabels.fixed }
  ];
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

  const lineWidthProp = lineWidth === 'default' ? undefined : lineWidth;
  const indicatorPositionProp: TabsIndicatorPosition =
    indicatorPosition === 'default' ? schemaIndicatorPosition : indicatorPosition;
  const tabWidthProp: TabsTabWidth | undefined = tabWidth === 'default' ? undefined : tabWidth;
  const resolvedIndicator = {
    motion: mode === 'animated' ? ('auto' as const) : ('none' as const),
    motionStyle: indicatorMotionStyle,
    position: indicatorPositionProp,
    shape: indicatorShape,
    ...(lineWidthProp ? { width: lineWidthProp as TabsIndicatorWidth } : {})
  };
  const { tabs, contents } = renderTabsSlots(TabsLine, `line-${indicatorShape}`);

  return (
    <TabsShowcasePageShell
      activeVariant="line"
      title="Tabs / Line"
      description="Line exposes the full indicator surface: shape, side, width behavior, motion mode, and tab width."
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
            options={lineShapeOptions}
            value={indicatorShape}
            onValueChange={(value) => setIndicatorShape(value as TabsLineIndicatorShape)}
          />
          <Select
            label="Indicator Side"
            width={220}
            options={indicatorPositionOptions}
            value={indicatorPosition}
            onValueChange={(value) => setIndicatorPosition(value as TabsIndicatorPositionControl)}
          />
          <Select
            label="Line Width"
            width={220}
            options={lineWidthOptions}
            value={lineWidth}
            onValueChange={(value) => setLineWidth(value as TabsLineWidthControl)}
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
      <TabsLine.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidth={tabWidthProp}
        indicator={resolvedIndicator}
        spring={spring}
      >
        {tabs}
        {contents}
      </TabsLine.Root>
    </TabsShowcasePageShell>
  );
}
