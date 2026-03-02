'use client';

import { KTabs, KTabsStatic } from '@kiskadee/react-components';
import type { TabsSpringPreset } from '@kiskadee/react-components';
import {
  tabsIndicatorShapesByVariant,
  type TabsBoxIndicatorShape,
  type TabsIndicatorShape,
  type TabsLineIndicatorShape,
  type TabsVariant
} from '@kiskadee/core';
import { useState } from 'react';
import { Select } from '@/k-components';

type TabsMode = 'animated' | 'static';
type TabsSpring = TabsSpringPreset;

const loremByValue: Record<string, string> = {
  home: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.`,
  locations: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.`,
  forms: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.`,
  services: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla.`,
  'single-letter': `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.`,
  'fifteen-letters': `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.`
};

const tabItems = [
  { value: 'home', label: 'Home' },
  { value: 'locations', label: 'Locations' },
  { value: 'forms', label: 'Forms' },
  { value: 'services', label: 'Services' },
  { value: 'single-letter', label: 'A' },
  { value: 'fifteen-letters', label: 'ABCDEFGHIJKLMNO' }
] as const;

const modeOptions = [
  { value: 'animated', label: 'Animated' },
  { value: 'static', label: 'Static' }
];

const springOptions = [
  { value: 'snappy', label: 'Snappy' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'debugSlow', label: 'Debug Slow' }
];

const lineShapeTitles: Record<TabsLineIndicatorShape, string> = {
  square: 'Line / Square',
  rounded: 'Line / Rounded',
  roundedClip: 'Line / Rounded Clip'
};

const boxShapeTitles: Record<TabsBoxIndicatorShape, string> = {
  square: 'Box / Square',
  rounded: 'Box / Rounded',
  pill: 'Box / Pill'
};

const lineExamples: Array<{ title: string; shape: TabsLineIndicatorShape }> =
  tabsIndicatorShapesByVariant.line.map((shape) => ({
    title: lineShapeTitles[shape],
    shape
  }));

const boxExamples: Array<{ title: string; shape: TabsBoxIndicatorShape }> =
  tabsIndicatorShapesByVariant.box.map((shape) => ({
    title: boxShapeTitles[shape],
    shape
  }));

function TabsExample({
  title,
  mode,
  spring,
  variant,
  indicatorShape
}: {
  title: string;
  mode: TabsMode;
  spring: TabsSpring;
  variant: TabsVariant;
  indicatorShape: TabsIndicatorShape;
}) {
  if (mode === 'animated') {
    return (
      <div>
        <h3>{title}</h3>
        <KTabs.Root
          defaultValue="locations"
          indicatorPosition="bottom"
          indicatorShape={indicatorShape}
          variant={variant}
          activationMode="manual"
          spring={spring}
        >
          <KTabs.Bar>
            {tabItems.map((tab) => (
              <KTabs.Tab
                key={`${variant}-${indicatorShape}-${tab.value}`}
                value={tab.value}
                label={tab.label}
              />
            ))}
          </KTabs.Bar>

          {tabItems.map((tab) => (
            <KTabs.Content
              key={`${variant}-${indicatorShape}-content-${tab.value}`}
              value={tab.value}
            >
              {loremByValue[tab.value]}
            </KTabs.Content>
          ))}
        </KTabs.Root>
      </div>
    );
  }

  return (
    <div>
      <h3>{title}</h3>
      <KTabsStatic.Root
        defaultValue="locations"
        indicatorPosition="bottom"
        indicatorShape={indicatorShape}
        variant={variant}
        activationMode="manual"
      >
        <KTabsStatic.Bar>
          {tabItems.map((tab) => (
            <KTabsStatic.Tab
              key={`${variant}-${indicatorShape}-static-${tab.value}`}
              value={tab.value}
              label={tab.label}
            />
          ))}
          <KTabsStatic.Indicator />
        </KTabsStatic.Bar>

        {tabItems.map((tab) => (
          <KTabsStatic.Content
            key={`${variant}-${indicatorShape}-static-content-${tab.value}`}
            value={tab.value}
          >
            {loremByValue[tab.value]}
          </KTabsStatic.Content>
        ))}
      </KTabsStatic.Root>
    </div>
  );
}

export default function ShowcaseTabs() {
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');

  return (
    <section style={{ marginTop: 106 }}>
      <h2>Tabs</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <Select
          label="Type"
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
      </div>

      <h2>Type A (Line)</h2>
      {lineExamples.map((example) => (
        <TabsExample
          key={`line-${example.shape}-${mode}`}
          title={example.title}
          mode={mode}
          spring={spring}
          variant="line"
          indicatorShape={example.shape}
        />
      ))}

      <h2 style={{ marginTop: 40 }}>Type B (Box)</h2>
      {boxExamples.map((example) => (
        <TabsExample
          key={`box-${example.shape}-${mode}`}
          title={example.title}
          mode={mode}
          spring={spring}
          variant="box"
          indicatorShape={example.shape}
        />
      ))}
    </section>
  );
}
