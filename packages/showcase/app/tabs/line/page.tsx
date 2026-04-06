'use client';

import {
  type TabsIndicatorPosition,
  type TabsIndicatorWidthMode,
  type TabsLineIndicatorVariant,
  type TabsTabWidthMode,
  tabsIndicatorVariantsByType
} from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsLine } from '@kiskadee/react-components/tabs/line';
import { useState } from 'react';
import { Select } from '@/k-components';
import {
  DEFAULT_TAB_VALUE,
  type TabsIndicatorMotionStyleControl,
  type TabsIndicatorPositionControl,
  type TabsLineWidthModeControl,
  type TabsMode,
  type TabsSpring,
  type TabsTabWidthModeControl,
  indicatorMotionStyleLabels,
  indicatorPositionLabels,
  lineIndicatorVariantLabels,
  lineIndicatorWidthModeLabels,
  modeOptions,
  renderTabsSlots,
  springOptions,
  TabsShowcasePageShell,
  tabWidthModeLabels
} from '../ShowcaseTabs.shared';

export default function TabsLinePage() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [indicatorPosition, setIndicatorPosition] = useState<TabsIndicatorPositionControl>('default');
  const [lineWidthMode, setLineWidthMode] = useState<TabsLineWidthModeControl>('default');
  const [tabWidthMode, setTabWidthMode] = useState<TabsTabWidthModeControl>('default');
  const [indicatorVariant, setIndicatorVariant] = useState<TabsLineIndicatorVariant>('square');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaLineWidthMode = global?.components?.tabs?.options?.indicatorWidthMode ?? 'tab';
  const schemaIndicatorPosition = global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
  const schemaTabWidthMode = global?.components?.tabs?.options?.tabWidthMode ?? 'auto';

  const lineVariantOptions = tabsIndicatorVariantsByType.line.map((value) => ({
    value,
    label: lineIndicatorVariantLabels[value]
  }));
  const indicatorMotionStyleOptions = [
    { value: 'direct', label: indicatorMotionStyleLabels.direct },
    { value: 'stretch', label: indicatorMotionStyleLabels.stretch }
  ];
  const lineWidthModeOptions = [
    {
      value: 'default',
      label: `Schema Default (${lineIndicatorWidthModeLabels[schemaLineWidthMode]})`
    },
    { value: 'tab', label: lineIndicatorWidthModeLabels.tab },
    { value: 'content', label: lineIndicatorWidthModeLabels.content },
    { value: 'fixed', label: lineIndicatorWidthModeLabels.fixed }
  ];
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

  const lineWidthModeProp = lineWidthMode === 'default' ? undefined : lineWidthMode;
  const indicatorPositionProp: TabsIndicatorPosition =
    indicatorPosition === 'default' ? schemaIndicatorPosition : indicatorPosition;
  const tabWidthModeProp: TabsTabWidthMode | undefined =
    tabWidthMode === 'default' ? undefined : tabWidthMode;
  const resolvedIndicator = {
    motion: mode === 'animated' ? ('auto' as const) : ('none' as const),
    motionStyle: indicatorMotionStyle,
    position: indicatorPositionProp,
    variant: indicatorVariant,
    ...(lineWidthModeProp ? { widthMode: lineWidthModeProp as TabsIndicatorWidthMode } : {})
  };
  const { tabs, contents } = renderTabsSlots(TabsLine, `line-${indicatorVariant}`);

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
            label="Indicator Variant"
            width={200}
            options={lineVariantOptions}
            value={indicatorVariant}
            onValueChange={(value) => setIndicatorVariant(value as TabsLineIndicatorVariant)}
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
            options={lineWidthModeOptions}
            value={lineWidthMode}
            onValueChange={(value) => setLineWidthMode(value as TabsLineWidthModeControl)}
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
      <TabsLine.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        tabWidthMode={tabWidthModeProp}
        indicator={resolvedIndicator}
        spring={spring}
      >
        {tabs}
        {contents}
      </TabsLine.Root>
    </TabsShowcasePageShell>
  );
}
