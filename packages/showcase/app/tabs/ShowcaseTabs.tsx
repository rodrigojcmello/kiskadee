'use client';

import {
  type TabsBoxIndicatorVariant,
  type TabsLineIndicatorVariant,
  tabsIndicatorVariantsByType
} from '@kiskadee/core';
import type { TabsSpringPreset } from '@kiskadee/react-components';
import { KTabs, KTabsStatic } from '@kiskadee/react-components';
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

const lineIndicatorVariantTitles: Record<TabsLineIndicatorVariant, string> = {
  square: 'Line / Square',
  rounded: 'Line / Rounded',
  roundedClip: 'Line / Rounded Clip'
};

const boxIndicatorVariantTitles: Record<TabsBoxIndicatorVariant, string> = {
  square: 'Box / Square',
  rounded: 'Box / Rounded',
  pill: 'Box / Pill'
};

const lineExamples: Array<{ title: string; indicatorVariant: TabsLineIndicatorVariant }> =
  tabsIndicatorVariantsByType.line.map((indicatorVariant) => ({
    title: lineIndicatorVariantTitles[indicatorVariant],
    indicatorVariant
  }));

const boxExamples: Array<{ title: string; indicatorVariant: TabsBoxIndicatorVariant }> =
  tabsIndicatorVariantsByType.box.map((indicatorVariant) => ({
    title: boxIndicatorVariantTitles[indicatorVariant],
    indicatorVariant
  }));

const dotExample = { title: 'Dot' } as const;

type TabsExampleProps =
  | {
      title: string;
      mode: TabsMode;
      spring: TabsSpring;
      type: 'line';
      indicator: {
        position: 'bottom';
        variant: TabsLineIndicatorVariant;
      };
    }
  | {
      title: string;
      mode: TabsMode;
      spring: TabsSpring;
      type: 'box';
      indicator: {
        variant: TabsBoxIndicatorVariant;
      };
    }
  | {
      title: string;
      mode: TabsMode;
      spring: TabsSpring;
      type: 'dot';
      indicator: {
        position: 'bottom';
      };
    };

function TabsExample(props: TabsExampleProps) {
  const { title, mode, spring } = props;
  const type = props.type;
  const indicator = props.indicator;
  const tabVariantKey = 'variant' in indicator ? indicator.variant : 'dot';
  const tabs = (
    <KTabs.Bar>
      {tabItems.map((tab) => (
        <KTabs.Tab key={`${type}-${tabVariantKey}-${tab.value}`} value={tab.value} label={tab.label} />
      ))}
    </KTabs.Bar>
  );
  const contents = tabItems.map((tab) => (
    <KTabs.Content key={`${type}-${tabVariantKey}-content-${tab.value}`} value={tab.value}>
      {loremByValue[tab.value]}
    </KTabs.Content>
  ));
  const staticTabs = (
    <KTabsStatic.Bar>
      {tabItems.map((tab) => (
        <KTabsStatic.Tab
          key={`${type}-${tabVariantKey}-static-${tab.value}`}
          value={tab.value}
          label={tab.label}
        />
      ))}
      <KTabsStatic.Indicator />
    </KTabsStatic.Bar>
  );
  const staticContents = tabItems.map((tab) => (
    <KTabsStatic.Content
      key={`${type}-${tabVariantKey}-static-content-${tab.value}`}
      value={tab.value}
    >
      {loremByValue[tab.value]}
    </KTabsStatic.Content>
  ));

  if (mode === 'animated') {
    return (
      <div>
        <h3>{title}</h3>
        {props.type === 'box' ? (
          <KTabs.Root
            defaultValue="locations"
            activationMode="manual"
            type={props.type}
            indicator={props.indicator}
            spring={spring}
          >
            {tabs}
            {contents}
          </KTabs.Root>
        ) : props.type === 'dot' ? (
          <KTabs.Root
            defaultValue="locations"
            activationMode="manual"
            type={props.type}
            indicator={props.indicator}
            spring={spring}
          >
            {tabs}
            {contents}
          </KTabs.Root>
        ) : (
          <KTabs.Root
            defaultValue="locations"
            activationMode="manual"
            type={props.type}
            indicator={props.indicator}
            spring={spring}
          >
            {tabs}
            {contents}
          </KTabs.Root>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3>{title}</h3>
      {props.type === 'box' ? (
        <KTabsStatic.Root
          defaultValue="locations"
          activationMode="manual"
          type={props.type}
          indicator={props.indicator}
        >
          {staticTabs}
          {staticContents}
        </KTabsStatic.Root>
      ) : props.type === 'dot' ? (
        <KTabsStatic.Root
          defaultValue="locations"
          activationMode="manual"
          type={props.type}
          indicator={props.indicator}
        >
          {staticTabs}
          {staticContents}
        </KTabsStatic.Root>
      ) : (
        <KTabsStatic.Root
          defaultValue="locations"
          activationMode="manual"
          type={props.type}
          indicator={props.indicator}
        >
          {staticTabs}
          {staticContents}
        </KTabsStatic.Root>
      )}
    </div>
  );
}

export default function ShowcaseTabs() {
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');

  return (
    <section style={{ marginTop: 106 }}>
      <h2>Tabs</h2>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20
        }}
      >
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
      </div>

      <h2>Line</h2>
      {lineExamples.map((example) => (
        <TabsExample
          key={`line-${example.indicatorVariant}-${mode}`}
          title={example.title}
          mode={mode}
          spring={spring}
          type="line"
          indicator={{
            position: 'bottom',
            variant: example.indicatorVariant
          }}
        />
      ))}

      <h2 style={{ marginTop: 40 }}>Dot</h2>
      <TabsExample
        key={`dot-${mode}`}
        title={dotExample.title}
        mode={mode}
        spring={spring}
        type="dot"
        indicator={{
          position: 'bottom'
        }}
      />

      <h2 style={{ marginTop: 40 }}>Box</h2>
      {boxExamples.map((example) => (
        <TabsExample
          key={`box-${example.indicatorVariant}-${mode}`}
          title={example.title}
          mode={mode}
          spring={spring}
          type="box"
          indicator={{
            variant: example.indicatorVariant
          }}
        />
      ))}
    </section>
  );
}
