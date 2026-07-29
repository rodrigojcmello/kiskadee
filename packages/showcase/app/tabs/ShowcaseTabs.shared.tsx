'use client';

import type {
  TabsBoxIndicatorShape,
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorWidth,
  TabsLineIndicatorShape,
  TabsTabWidth
} from '@kiskadee/core';
import type { TabsIndicatorMotionStyle, TabsSpringPreset } from '@kiskadee/react-components';
import { SunIcon } from 'lucide-react';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { ShowcaseRouteControls } from '@/components/ShowcaseControls';

export type TabsShowcaseVariant = 'line' | 'dot' | 'box' | 'segmented' | 'bridge';
export type TabsMode = 'animated' | 'static';
export type TabsSpring = TabsSpringPreset;
export type TabsIndicatorMotionStyleControl = TabsIndicatorMotionStyle;
export type TabsIndicatorPositionControl = 'default' | TabsIndicatorPosition;
export type TabsLineWidthControl = 'default' | TabsIndicatorWidth;
export type TabsTabWidthControl = 'default' | TabsTabWidth;
export type TabsSizeControl = 's:md:1' | 's:sm:1';

export const DEFAULT_TAB_VALUE = 'locations';
export const DEFAULT_TAB_SIZE: TabsSizeControl = 's:md:1';

export const loremByValue: Record<string, string> = {
  home: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.`,
  locations: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.`,
  forms: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.`,
  services: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla.`,
  'icon-only': `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.`,
  'single-letter': `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.`,
  'fifteen-letters': `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.`
};

export const tabItems: ReadonlyArray<{
  value: string;
  icon?: ReactNode;
  label?: string;
  accessibilityLabel?: string;
}> = [
  {
    value: 'home',
    label: 'Home',
    icon: <SunIcon />
  },
  { value: 'locations', label: 'Locations' },
  { value: 'forms', label: 'Forms' },
  { value: 'services', label: 'Services' },
  {
    value: 'icon-only',
    icon: <SunIcon />,
    accessibilityLabel: 'Home'
  },
  { value: 'single-letter', label: 'A' },
  { value: 'fifteen-letters', label: 'ABCDEFGHIJKLMNO' }
] as const;

export const springOptions = [
  { value: 'snappy', label: 'Snappy' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'debugSlow', label: 'Debug Slow' }
];

export const tabSizeOptions = [
  { value: 's:md:1', label: 'Medium' },
  { value: 's:sm:1', label: 'Small' }
];

export const lineIndicatorWidthLabels: Record<TabsIndicatorWidth, string> = {
  tab: 'Tab',
  content: 'Content',
  fixed: 'Fixed'
};

export const tabWidthLabels: Record<TabsTabWidth, string> = {
  content: 'Content',
  fixed: 'Fixed',
  adaptive: 'Adaptive',
  distributed: 'Distributed'
};

export const indicatorPositionLabels: Record<TabsIndicatorPosition, string> = {
  bottom: 'Bottom',
  top: 'Top'
};

export const indicatorMotionStyleLabels: Record<TabsIndicatorMotionStyle, string> = {
  direct: 'Direct',
  stretch: 'Stretch'
};

export const bridgeLowerCurveLabels: Record<TabsBridgeLowerCurve, string> = {
  curved: 'Curved',
  'flush-start': 'Flush Start',
  'flush-end': 'Flush End',
  'flush-both': 'Flush Both',
  'flush-all': 'Flush All'
};

export const lineIndicatorShapeLabels: Record<TabsLineIndicatorShape, string> = {
  square: 'Square',
  rounded: 'Rounded',
  roundedClip: 'Rounded Clip'
};

export const boxIndicatorShapeLabels: Record<TabsBoxIndicatorShape, string> = {
  square: 'Square',
  rounded: 'Rounded',
  pill: 'Pill'
};

export const tabsShowcaseDescriptionStyle = {
  marginTop: 0,
  marginBottom: 20,
  maxWidth: 720
};

type TabsCompoundSlots = {
  Bar: ComponentType<{ children?: ReactNode }>;
  Tab: ComponentType<{
    value: string;
    label?: ReactNode;
    icon?: ReactNode;
    accessibilityLabel?: string;
  }>;
  Content: ComponentType<{ value: string; children?: ReactNode }>;
};

const tabsShowcaseMenuItems: Array<{ href: string; label: string; variant: TabsShowcaseVariant }> =
  [
    { href: '/tabs/line', label: 'Line', variant: 'line' },
    { href: '/tabs/dot', label: 'Dot', variant: 'dot' },
    { href: '/tabs/box', label: 'Box', variant: 'box' },
    { href: '/tabs/segmented', label: 'Segmented', variant: 'segmented' },
    { href: '/tabs/bridge', label: 'Bridge', variant: 'bridge' }
  ];

export function renderTabsSlots(Component: TabsCompoundSlots, keyBase: string) {
  const tabs = (
    <Component.Bar>
      {tabItems.map((tab) => (
        <Component.Tab
          key={`${keyBase}-${tab.value}`}
          value={tab.value}
          label={tab.label}
          icon={tab.icon}
          accessibilityLabel={tab.accessibilityLabel}
        />
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

export function TabsShowcaseMenu({ activeVariant }: { activeVariant?: TabsShowcaseVariant }) {
  return (
    <nav aria-label="Tabs variants" style={{ marginBottom: 24 }}>
      <ul
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          padding: 0,
          margin: 0,
          listStyle: 'none'
        }}
      >
        {tabsShowcaseMenuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              style={{
                fontWeight: activeVariant === item.variant ? 700 : 400
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function TabsShowcasePageShell({
  activeVariant,
  title,
  description,
  controls,
  children
}: {
  activeVariant?: TabsShowcaseVariant;
  title: string;
  description?: ReactNode;
  controls?: ReactNode;
  children?: ReactNode;
}) {
  const panelId = activeVariant ? `tabs-${activeVariant}` : 'tabs';

  return (
    <section>
      <TabsShowcaseMenu activeVariant={activeVariant} />
      <h2>{title}</h2>
      {description ? <div style={tabsShowcaseDescriptionStyle}>{description}</div> : null}
      {controls ? (
        <ShowcaseRouteControls id={panelId} eyebrow="Tabs" title="Controls">
          {controls}
        </ShowcaseRouteControls>
      ) : null}
      {children}
    </section>
  );
}
