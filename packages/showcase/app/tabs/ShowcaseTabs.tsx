'use client';

import {
  type TabsBridgeLowerCurveMode,
  type TabsBoxIndicatorVariant,
  type TabsIndicatorPosition,
  type TabsIndicatorWidthMode,
  type TabsLineIndicatorVariant,
  type TabsTabWidthMode,
  tabsIndicatorVariantsByType
} from '@kiskadee/core';
import type { TabsIndicatorMotionStyle, TabsSpringPreset } from '@kiskadee/react-components';
import { useKiskadee } from '@kiskadee/react-components';
import { TabsBox } from '@kiskadee/react-components/tabs/box';
import { TabsBridge } from '@kiskadee/react-components/tabs/bridge';
import { TabsDot } from '@kiskadee/react-components/tabs/dot';
import { TabsLine } from '@kiskadee/react-components/tabs/line';
import { TabsSegmented } from '@kiskadee/react-components/tabs/segmented';
import { useState } from 'react';
import { Select } from '@/k-components';

type TabsMode = 'animated' | 'static';
type TabsSpring = TabsSpringPreset;
type TabsIndicatorMotionStyleControl = TabsIndicatorMotionStyle;
type TabsIndicatorPositionControl = 'default' | TabsIndicatorPosition;
type TabsLineWidthModeControl = 'default' | TabsIndicatorWidthMode;
type TabsTabWidthModeControl = 'default' | TabsTabWidthMode;
type TabsExampleId =
  | `line:${TabsLineIndicatorVariant}`
  | `box:${TabsBoxIndicatorVariant}`
  | 'segmented'
  | 'dot'
  | 'bridge';
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

const indicatorPositionLabels: Record<TabsIndicatorPosition, string> = {
  bottom: 'Bottom',
  top: 'Top'
};

const indicatorMotionStyleLabels: Record<TabsIndicatorMotionStyle, string> = {
  direct: 'Direct',
  stretch: 'Stretch'
};

const bridgeLowerCurveModeLabels: Record<TabsBridgeLowerCurveMode, string> = {
  curved: 'Curved',
  'flush-start': 'Flush Start',
  'flush-end': 'Flush End',
  'flush-both': 'Flush Both',
  'flush-all': 'Flush All'
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

const segmentedExample = { title: 'Segmented' } as const;
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
        position: TabsIndicatorPosition;
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
      type: 'segmented';
      indicator: {};
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
        position: TabsIndicatorPosition;
      };
    };

type TabsCompoundSlots = Pick<typeof TabsLine, 'Bar' | 'Tab' | 'Content'>;

function renderTabsSlots(Component: TabsCompoundSlots, keyBase: string) {
  const tabs = (
    <Component.Bar>
      {tabItems.map((tab) => (
        <Component.Tab key={`${keyBase}-${tab.value}`} value={tab.value} label={tab.label} />
      ))}
    </Component.Bar>
  );
  const contents = tabItems.map((tab) => (
    <Component.Content key={`${keyBase}-content-${tab.value}`} value={tab.value}>
      {loremByValue[tab.value]}
    </Component.Content>
  ));

  return { tabs, contents };
}

function TabsExample(props: TabsExampleProps) {
  const { title, mode, spring, selectedValue, onSelectedValueChange, tabWidthMode } = props;
  const type = props.type;
  const tabVariantKey =
    props.type === 'line'
      ? props.indicator.variant
      : props.type === 'box'
        ? props.indicator.variant
        : props.type;
  const keyBase = `${type}-${tabVariantKey}`;

  if (props.type === 'line') {
    const resolvedIndicator = {
      ...props.indicator,
      motion: mode === 'animated' ? ('auto' as const) : ('none' as const)
    };
    const { tabs, contents } = renderTabsSlots(TabsLine, keyBase);

    return (
      <div>
        <h3>{title}</h3>
        <TabsLine.Root
          value={selectedValue}
          onValueChange={onSelectedValueChange}
          activationMode="manual"
          tabWidthMode={tabWidthMode}
          indicator={resolvedIndicator}
          spring={spring}
        >
          {tabs}
          {contents}
        </TabsLine.Root>
      </div>
    );
  }

  if (props.type === 'box') {
    const resolvedIndicator = {
      ...props.indicator,
      motion: mode === 'animated' ? ('auto' as const) : ('none' as const)
    };
    const { tabs, contents } = renderTabsSlots(TabsBox, keyBase);

    return (
      <div>
        <h3>{title}</h3>
        <TabsBox.Root
          value={selectedValue}
          onValueChange={onSelectedValueChange}
          activationMode="manual"
          tabWidthMode={tabWidthMode}
          indicator={resolvedIndicator}
          spring={spring}
        >
          {tabs}
          {contents}
        </TabsBox.Root>
      </div>
    );
  }

  if (props.type === 'segmented') {
    const { tabs, contents } = renderTabsSlots(TabsSegmented, keyBase);

    return (
      <div>
        <h3>{title}</h3>
        <TabsSegmented.Root
          value={selectedValue}
          onValueChange={onSelectedValueChange}
          activationMode="manual"
          tabWidthMode={tabWidthMode}
          indicator={props.indicator}
          spring={spring}
        >
          {tabs}
          {contents}
        </TabsSegmented.Root>
      </div>
    );
  }

  const resolvedIndicator = {
    ...props.indicator,
    motion: mode === 'animated' ? ('auto' as const) : ('none' as const)
  };
  const { tabs, contents } = renderTabsSlots(TabsDot, keyBase);

  return (
    <div>
      <h3>{title}</h3>
      <TabsDot.Root
        value={selectedValue}
        onValueChange={onSelectedValueChange}
        activationMode="manual"
        tabWidthMode={tabWidthMode}
        indicator={resolvedIndicator}
        spring={spring}
      >
        {tabs}
        {contents}
      </TabsDot.Root>
    </div>
  );
}

export default function ShowcaseTabs() {
  const { global } = useKiskadee();
  const [mode, setMode] = useState<TabsMode>('animated');
  const [spring, setSpring] = useState<TabsSpring>('snappy');
  const [indicatorMotionStyle, setIndicatorMotionStyle] =
    useState<TabsIndicatorMotionStyleControl>('direct');
  const [indicatorPosition, setIndicatorPosition] = useState<TabsIndicatorPositionControl>('default');
  const [lineWidthMode, setLineWidthMode] = useState<TabsLineWidthModeControl>('default');
  const [tabWidthMode, setTabWidthMode] = useState<TabsTabWidthModeControl>('default');
  const [bridgeLowerCurveMode, setBridgeLowerCurveMode] =
    useState<TabsBridgeLowerCurveMode>('curved');
  const [selectedTabsByExample, setSelectedTabsByExample] = useState<TabsSelectionByExample>({});
  const indicatorMotionStyleOptions = [
    { value: 'direct', label: indicatorMotionStyleLabels.direct },
    { value: 'stretch', label: indicatorMotionStyleLabels.stretch }
  ];
  const schemaLineWidthMode = global?.components?.tabs?.options?.indicatorWidthMode ?? 'tab';
  const schemaIndicatorPosition = global?.components?.tabs?.options?.indicatorPosition ?? 'bottom';
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
  const indicatorPositionOptions = [
    {
      value: 'default',
      label: `Schema Default (${indicatorPositionLabels[schemaIndicatorPosition]})`
    },
    { value: 'bottom', label: indicatorPositionLabels.bottom },
    { value: 'top', label: indicatorPositionLabels.top }
  ];
  const indicatorPositionProp =
    indicatorPosition === 'default' ? schemaIndicatorPosition : indicatorPosition;
  const tabWidthModeOptions = [
    {
      value: 'default',
      label: `Schema Default (${tabWidthModeLabels[schemaTabWidthMode]})`
    },
    { value: 'auto', label: tabWidthModeLabels.auto },
    { value: 'fixed', label: tabWidthModeLabels.fixed }
  ];
  const tabWidthModeProp = tabWidthMode === 'default' ? undefined : tabWidthMode;
  const bridgeLowerCurveModeOptions = [
    { value: 'curved', label: bridgeLowerCurveModeLabels.curved },
    { value: 'flush-start', label: bridgeLowerCurveModeLabels['flush-start'] },
    { value: 'flush-end', label: bridgeLowerCurveModeLabels['flush-end'] },
    { value: 'flush-both', label: bridgeLowerCurveModeLabels['flush-both'] },
    { value: 'flush-all', label: bridgeLowerCurveModeLabels['flush-all'] }
  ];
  const bridgeRuntimeSlots = renderTabsSlots(TabsBridge, 'bridge-runtime');
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
      </div>

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
            position: indicatorPositionProp,
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
          position: indicatorPositionProp
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

      <h2 style={{ marginTop: 40 }}>Segmented</h2>
      <TabsExample
        key="segmented"
        title={segmentedExample.title}
        mode={mode}
        spring={spring}
        selectedValue={resolveSelectedTabValue('segmented')}
        onSelectedValueChange={(value) => handleSelectedTabChange('segmented', value)}
        tabWidthMode={tabWidthModeProp}
        type="segmented"
        indicator={{}}
      />

      <h2 style={{ marginTop: 40 }}>Bridge</h2>
      <p style={{ marginTop: 0, marginBottom: 20, maxWidth: 720 }}>
        Bridge tabs are now running through the real schema, builder, runtime, and component flow.
        The control below overrides the bridge-only `lowerCurveMode` prop so we can inspect each
        structural mode directly in the runtime implementation.
      </p>
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
          label="Lower Curve"
          width={220}
          options={bridgeLowerCurveModeOptions}
          value={bridgeLowerCurveMode}
          onValueChange={(value) => setBridgeLowerCurveMode(value as TabsBridgeLowerCurveMode)}
        />
      </div>
      <div>
        <h3>Bridge / Runtime</h3>
        <TabsBridge.Root
          value={resolveSelectedTabValue('bridge')}
          onValueChange={(value: string) => handleSelectedTabChange('bridge', value)}
          activationMode="manual"
          tabWidthMode={tabWidthModeProp}
          lowerCurveMode={bridgeLowerCurveMode}
        >
          {bridgeRuntimeSlots.tabs}
          {bridgeRuntimeSlots.contents}
        </TabsBridge.Root>
      </div>
    </section>
  );
}
