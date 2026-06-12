'use client';

import {
  type TabsBoxIndicatorShape,
  type TabsTabWidth,
  tabsIndicatorShapesByVariant
} from '@kiskadee/core';
import { TabsBox, useTabsArtifactConfig } from '@kiskadee/react-components';
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
  boxIndicatorShapeLabels,
  DEFAULT_TAB_SIZE,
  DEFAULT_TAB_VALUE,
  indicatorMotionStyleLabels,
  renderTabsSlots,
  springOptions,
  type TabsIndicatorMotionStyleControl,
  type TabsMode,
  TabsShowcasePageShell,
  type TabsSizeControl,
  type TabsSpring,
  type TabsTabWidthControl,
  tabSizeOptions,
  tabWidthLabels
} from '../ShowcaseTabs.shared';

export default function TabsBoxPage() {
  const { options: tabsArtifactOptions } = useTabsArtifactConfig();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [indicatorShape, setIndicatorShape] = useState<TabsBoxIndicatorShape>('square');
  const [tabWidth, setTabWidth] = useState<TabsTabWidthControl>('default');
  const [tabSize, setTabSize] = useState<TabsSizeControl>(DEFAULT_TAB_SIZE);
  const [selectedValue, setSelectedValue] = useState(DEFAULT_TAB_VALUE);

  const schemaTabWidth = tabsArtifactOptions.tabWidth ?? 'content';
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
    { value: 'content', label: tabWidthLabels.content },
    { value: 'fixed', label: tabWidthLabels.fixed },
    { value: 'adaptive', label: tabWidthLabels.adaptive },
    { value: 'distributed', label: tabWidthLabels.distributed }
  ];

  const tabWidthProp: TabsTabWidth | undefined = tabWidth === 'default' ? undefined : tabWidth;
  const { tabs, contents } = renderTabsSlots(TabsBox, `box-${indicatorShape}`);
  const tabsBoxControls = (
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
            options={boxShapeOptions}
            value={indicatorShape}
            onValueChange={(value) => setIndicatorShape(value as TabsBoxIndicatorShape)}
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
      activeVariant="box"
      title="Tabs / Box"
      description="Box exposes the indicator shape selector together with motion controls and tab width."
      controls={tabsBoxControls}
    >
      <TabsBox.Root
        value={selectedValue}
        onValueChange={setSelectedValue}
        activationMode="manual"
        scale={tabSize}
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
