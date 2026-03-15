'use client';

import {
  type TabsBridgeIndicatorVariant,
  type TabsBoxIndicatorVariant,
  type TabsIndicatorWidthMode,
  type TabsLineIndicatorVariant,
  type TabsTabWidthMode,
  tabsIndicatorVariantsByType
} from '@kiskadee/core';
import type { TabsIndicatorMotionStyle, TabsSpringPreset } from '@kiskadee/react-components';
import { KTabs, KTabsStatic, useKiskadee } from '@kiskadee/react-components';
import { useState } from 'react';
import { Select } from '@/k-components';
import { ExperimentalBridgeTabs } from './ExperimentalBridgeTabs';

type TabsMode = 'animated' | 'static';
type TabsSpring = TabsSpringPreset;
type TabsIndicatorMotionStyleControl = TabsIndicatorMotionStyle;
type TabsLineWidthModeControl = 'default' | TabsIndicatorWidthMode;
type TabsTabWidthModeControl = 'default' | TabsTabWidthMode;
type TabsExampleId =
  | `line:${TabsLineIndicatorVariant}`
  | `box:${TabsBoxIndicatorVariant}`
  | `bridge:${TabsBridgeIndicatorVariant}`
  | 'bridge:trimmed'
  | 'dot';
type TabsSelectionByExample = Partial<Record<TabsExampleId, string>>;
const DEFAULT_TAB_VALUE = 'locations';

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

const lineIndicatorWidthModeLabels: Record<TabsIndicatorWidthMode, string> = {
  tab: 'Tab',
  content: 'Content',
  fixed: 'Fixed'
};

const tabWidthModeLabels: Record<TabsTabWidthMode, string> = {
  auto: 'Auto',
  fixed: 'Fixed'
};

const indicatorMotionStyleLabels: Record<TabsIndicatorMotionStyle, string> = {
  direct: 'Direct',
  stretch: 'Stretch'
};

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

const bridgeIndicatorVariantTitles: Record<TabsBridgeIndicatorVariant, string> = {
  square: 'Bridge / Square',
  rounded: 'Bridge / Rounded',
  pill: 'Bridge / Pill'
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

const bridgeExamples: Array<{ title: string; indicatorVariant: TabsBridgeIndicatorVariant }> =
  tabsIndicatorVariantsByType.bridge.map((indicatorVariant) => ({
    title: bridgeIndicatorVariantTitles[indicatorVariant],
    indicatorVariant
  }));

const dotExample = { title: 'Dot' } as const;

type TabsExampleProps =
  | {
      title: string;
      mode: TabsMode;
      spring: TabsSpring;
      selectedValue: string;
      onSelectedValueChange: (value: string) => void;
      tabWidthMode?: TabsTabWidthMode;
      type: 'line';
      indicator: {
        position: 'bottom';
        variant: TabsLineIndicatorVariant;
        widthMode?: TabsIndicatorWidthMode;
        motionStyle?: TabsIndicatorMotionStyle;
      };
    }
  | {
      title: string;
      mode: TabsMode;
      spring: TabsSpring;
      selectedValue: string;
      onSelectedValueChange: (value: string) => void;
      tabWidthMode?: TabsTabWidthMode;
      type: 'box';
      indicator: {
        variant: TabsBoxIndicatorVariant;
        motionStyle?: TabsIndicatorMotionStyle;
      };
    }
  | {
      title: string;
      mode: TabsMode;
      spring: TabsSpring;
      selectedValue: string;
      onSelectedValueChange: (value: string) => void;
      tabWidthMode?: TabsTabWidthMode;
      type: 'dot';
      indicator: {
        position: 'bottom';
      };
    }
  | {
      title: string;
      mode: TabsMode;
      spring: TabsSpring;
      selectedValue: string;
      onSelectedValueChange: (value: string) => void;
      tabWidthMode?: TabsTabWidthMode;
      type: 'bridge';
      trimOuterCurves?: boolean;
      indicator: {
        variant: TabsBridgeIndicatorVariant;
      };
    };

function TabsExample(props: TabsExampleProps) {
  const { title, mode, spring, selectedValue, onSelectedValueChange, tabWidthMode } = props;
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
  const sharedRootProps =
    props.type === 'bridge' && props.trimOuterCurves !== undefined
      ? { trimOuterCurves: props.trimOuterCurves }
      : {};

  if (mode === 'animated') {
    return (
      <div>
        <h3>{title}</h3>
        <KTabs.Root
          value={selectedValue}
          onValueChange={onSelectedValueChange}
          activationMode="manual"
          type={props.type}
          tabWidthMode={tabWidthMode}
          indicator={props.indicator as never}
          spring={spring}
          {...sharedRootProps}
        >
          {tabs}
          {contents}
        </KTabs.Root>
      </div>
    );
  }

  return (
    <div>
      <h3>{title}</h3>
      <KTabsStatic.Root
        value={selectedValue}
        onValueChange={onSelectedValueChange}
        activationMode="manual"
        type={props.type}
        tabWidthMode={tabWidthMode}
        indicator={props.indicator as never}
        {...sharedRootProps}
      >
        {staticTabs}
        {staticContents}
      </KTabsStatic.Root>
    </div>
  );
}

export default function ShowcaseTabs() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [lineWidthMode, setLineWidthMode] = useState<TabsLineWidthModeControl>('default');
  const [tabWidthMode, setTabWidthMode] = useState<TabsTabWidthModeControl>('default');
  const [selectedTabsByExample, setSelectedTabsByExample] = useState<TabsSelectionByExample>({});
  const indicatorMotionStyleOptions = [
    { value: 'direct', label: indicatorMotionStyleLabels.direct },
    { value: 'stretch', label: indicatorMotionStyleLabels.stretch }
  ];
  const schemaLineWidthMode = global?.components?.tabs?.options?.indicatorWidthMode ?? 'tab';
  const schemaTabWidthMode = global?.components?.tabs?.options?.tabWidthMode ?? 'auto';
  const lineWidthModeOptions = [
    {
      value: 'default',
      label: `Schema Default (${lineIndicatorWidthModeLabels[schemaLineWidthMode]})`
    },
    { value: 'tab', label: lineIndicatorWidthModeLabels.tab },
    { value: 'content', label: lineIndicatorWidthModeLabels.content },
    { value: 'fixed', label: lineIndicatorWidthModeLabels.fixed }
  ];
  const lineWidthModeProp = lineWidthMode === 'default' ? undefined : lineWidthMode;
  const tabWidthModeOptions = [
    {
      value: 'default',
      label: `Schema Default (${tabWidthModeLabels[schemaTabWidthMode]})`
    },
    { value: 'auto', label: tabWidthModeLabels.auto },
    { value: 'fixed', label: tabWidthModeLabels.fixed }
  ];
  const tabWidthModeProp = tabWidthMode === 'default' ? undefined : tabWidthMode;
  const resolveSelectedTabValue = (exampleId: TabsExampleId): string =>
    selectedTabsByExample[exampleId] ?? DEFAULT_TAB_VALUE;
  const handleSelectedTabChange = (exampleId: TabsExampleId, value: string) => {
    setSelectedTabsByExample((current) => ({ ...current, [exampleId]: value }));
  };

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

        {mode === 'animated' ? (
          <Select
            label="Motion Style"
            width={180}
            options={indicatorMotionStyleOptions}
            value={indicatorMotionStyle}
            onValueChange={(value) => setIndicatorMotionStyle(value as TabsIndicatorMotionStyle)}
          />
        ) : null}

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
      </div>

      <h2 style={{ marginTop: 0 }}>Experimental</h2>
      <p style={{ marginTop: 0, marginBottom: 20, maxWidth: 780 }}>
        This isolated prototype lives only in the showcase so we can validate the attached tab body
        and the curved shoulder that reconnects into the bottom rail before translating the idea
        into schema, build artifacts, and runtime classes.
      </p>
      <ExperimentalBridgeTabs />

      <h2>Line</h2>
      <p style={{ marginTop: 0, marginBottom: 20, maxWidth: 720 }}>
        Line tabs can use the schema default width mode or override it per component via the
        `indicator.widthMode` prop. Available modes are full tab width, rendered content width,
        and fixed indicator width. Tab width itself can also stay automatic or use the schema
        `e2.scales.boxWidth` when `tabWidthMode` is set to `fixed`. In animated mode, the
        indicator can also switch between the direct transition and the new stretch transition.
      </p>
      {lineExamples.map((example) => (
        <TabsExample
          key={`line-${example.indicatorVariant}`}
          title={example.title}
          mode={mode}
          spring={spring}
          selectedValue={resolveSelectedTabValue(`line:${example.indicatorVariant}`)}
          onSelectedValueChange={(value) =>
            handleSelectedTabChange(`line:${example.indicatorVariant}`, value)
          }
          tabWidthMode={tabWidthModeProp}
          type="line"
          indicator={{
            position: 'bottom',
            variant: example.indicatorVariant,
            motionStyle: indicatorMotionStyle,
            ...(lineWidthModeProp ? { widthMode: lineWidthModeProp } : {})
          }}
        />
      ))}

      <h2 style={{ marginTop: 40 }}>Dot</h2>
      <TabsExample
        key="dot"
        title={dotExample.title}
        mode={mode}
        spring={spring}
        selectedValue={resolveSelectedTabValue('dot')}
        onSelectedValueChange={(value) => handleSelectedTabChange('dot', value)}
        tabWidthMode={tabWidthModeProp}
        type="dot"
        indicator={{
          position: 'bottom'
        }}
      />

      <h2 style={{ marginTop: 40 }}>Box</h2>
      {boxExamples.map((example) => (
        <TabsExample
          key={`box-${example.indicatorVariant}`}
          title={example.title}
          mode={mode}
          spring={spring}
          selectedValue={resolveSelectedTabValue(`box:${example.indicatorVariant}`)}
          onSelectedValueChange={(value) =>
            handleSelectedTabChange(`box:${example.indicatorVariant}`, value)
          }
          tabWidthMode={tabWidthModeProp}
          type="box"
          indicator={{
            variant: example.indicatorVariant,
            motionStyle: indicatorMotionStyle
          }}
        />
      ))}

      <h2 style={{ marginTop: 40 }}>Bridge</h2>
      <p style={{ marginTop: 0, marginBottom: 20, maxWidth: 720 }}>
        The real `bridge` type now uses schema-driven `curveWidth`, border width, border radius,
        and the optional `trimOuterCurves` structural override. The prototype stays above as a
        reference until this runtime version is fully stable.
      </p>
      {bridgeExamples.map((example) => (
        <TabsExample
          key={`bridge-${example.indicatorVariant}`}
          title={example.title}
          mode={mode}
          spring={spring}
          selectedValue={resolveSelectedTabValue(`bridge:${example.indicatorVariant}`)}
          onSelectedValueChange={(value) =>
            handleSelectedTabChange(`bridge:${example.indicatorVariant}`, value)
          }
          tabWidthMode={tabWidthModeProp}
          type="bridge"
          indicator={{
            variant: example.indicatorVariant
          }}
        />
      ))}
      <TabsExample
        key="bridge-trimmed"
        title="Bridge / Trim Outer Curves"
        mode={mode}
        spring={spring}
        selectedValue={resolveSelectedTabValue('bridge:trimmed')}
        onSelectedValueChange={(value) => handleSelectedTabChange('bridge:trimmed', value)}
        tabWidthMode={tabWidthModeProp}
        type="bridge"
        trimOuterCurves
        indicator={{
          variant: 'rounded'
        }}
      />
    </section>
  );
}
