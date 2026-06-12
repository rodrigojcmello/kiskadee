'use client';

import {
  type TabsIndicatorPosition,
  type TabsIndicatorWidth,
  type TabsLineIndicatorShape,
  type TabsTabWidth,
  tabsIndicatorShapesByVariant
} from '@kiskadee/core';
import { TabsLine, useTabsArtifactConfig } from '@kiskadee/react-components';
import { useState } from 'react';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import {
  DEFAULT_TAB_SIZE,
  DEFAULT_TAB_VALUE,
  indicatorMotionStyleLabels,
  indicatorPositionLabels,
  lineIndicatorShapeLabels,
  lineIndicatorWidthLabels,
  renderTabsSlots,
  springOptions,
  type TabsIndicatorMotionStyleControl,
  type TabsIndicatorPositionControl,
  type TabsLineWidthControl,
  type TabsMode,
  TabsShowcasePageShell,
  type TabsSizeControl,
  type TabsSpring,
  type TabsTabWidthControl,
  tabSizeOptions,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsLinePage() {
  const { options: tabsArtifactOptions } = useTabsArtifactConfig();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [indicatorPosition, setIndicatorPosition] =
    useState<TabsIndicatorPositionControl>('default');
  const [lineWidth, setLineWidth] = useState<TabsLineWidthControl>('default');
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [tabSize, setTabSize] = useState<TabsSizeControl>(DEFAULT_TAB_SIZE);
  const [indicatorShape, setIndicatorShape] = useState<TabsLineIndicatorShape>('square');
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaLineWidth = tabsArtifactOptions.indicatorWidth ?? 'tab';
  const schemaIndicatorPosition = tabsArtifactOptions.indicatorPosition ?? 'bottom';
  const schemaTabWidth = tabsArtifactOptions.tabWidth ?? 'content';

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
    { value: 'content', label: tabWidthLabels.content },
    { value: 'fixed', label: tabWidthLabels.fixed },
    { value: 'adaptive', label: tabWidthLabels.adaptive },
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
  const tabsLineControls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Layout">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Size"
            options={tabSizeOptions}
            value={tabSize}
            onValueChange={(value) => setTabSize(value as TabsSizeControl)}
          />
          <ShowcaseSelectControl
            label="Indicator Shape"
            options={lineShapeOptions}
            value={indicatorShape}
            onValueChange={(value) => setIndicatorShape(value as TabsLineIndicatorShape)}
          />
          <ShowcaseSelectControl
            label="Indicator Side"
            options={indicatorPositionOptions}
            value={indicatorPosition}
            onValueChange={(value) => setIndicatorPosition(value as TabsIndicatorPositionControl)}
          />
          <ShowcaseSelectControl
            label="Line Width"
            options={lineWidthOptions}
            value={lineWidth}
            onValueChange={(value) => setLineWidth(value as TabsLineWidthControl)}
          />
          <ShowcaseSelectControl
            label="Tab Width"
            options={tabWidthOptions}
            value={tabWidth}
            onValueChange={(value) => setTabWidth(value as TabsTabWidthControl)}
          />
        </ShowcaseControlGrid>
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Motion">
        <ShowcaseControlStack>
          <ShowcaseBooleanControl
            label="Animated"
            checked={mode === 'animated'}
            onCheckedChange={(checked) => setMode(checked ? 'animated' : 'static')}
          />
        </ShowcaseControlStack>
        {mode === 'animated' ? (
          <ShowcaseControlGrid>
            <ShowcaseSelectControl
              label="Spring"
              options={springOptions}
              value={spring}
              onValueChange={(value) => setSpring(value as TabsSpring)}
            />
            <ShowcaseSelectControl
              label="Motion Style"
              options={indicatorMotionStyleOptions}
              value={indicatorMotionStyle}
              onValueChange={(value) =>
                setIndicatorMotionStyle(value as TabsIndicatorMotionStyleControl)
              }
            />
          </ShowcaseControlGrid>
        ) : null}
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <TabsShowcasePageShell
      activeVariant="line"
      title="Tabs / Line"
      description="Line exposes the full indicator surface: shape, side, width behavior, motion mode, and tab width."
      controls={tabsLineControls}
    >
      <TabsLine.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        scale={tabSize}
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
