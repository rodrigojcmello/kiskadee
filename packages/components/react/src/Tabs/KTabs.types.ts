import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue
} from '@kiskadee/core';
import type {
  TabsBarProps as HeadlessTabsBarProps,
  TabsContentProps as HeadlessTabsContentProps,
  TabsIndicatorProps as HeadlessTabsIndicatorProps,
  TabsRootProps as HeadlessTabsRootProps,
  TabsTabProps as HeadlessTabsTabProps
} from '@kiskadee/react-headless';
import type { HTMLAttributes, ReactNode } from 'react';
import type {
  TabsBoxIndicatorConfig,
  TabsIndicatorMotion,
  TabsLineIndicatorConfig
} from './TabsIndicator.types.ts';

export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TabsClassNames = Partial<Record<TabsElementName, string>>;

export type TabsClassesMap = Partial<Record<TabsElementName, ClassNameByElementJSON>>;

export type TabsSpringPreset = 'snappy' | 'gentle' | 'debugSlow';

export type TabsSpringConfig = Partial<{
  stiffness: number;
  damping: number;
  mass: number;
  restDelta: number;
  restSpeed: number;
}>;

type TabsRootBaseProps = Omit<HeadlessTabsRootProps, 'classNames'> & {
  classNames?: TabsClassNames;
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  separator?: boolean;
  spring?: TabsSpringPreset | TabsSpringConfig;
  indicatorLayoutId?: string;
  /**
   * Semantic color family key for class map lookup (e.g. "primary", "neutral").
   * Falls back to the first available semantic key when not found.
   */
  intent?: string;
};

export type TabsRootLineProps = TabsRootBaseProps & {
  variant?: 'line';
  indicator?: TabsLineIndicatorConfig;
};

export type TabsRootBoxProps = TabsRootBaseProps & {
  variant: 'box';
  indicator?: TabsBoxIndicatorConfig;
};

export type TabsRootProps = TabsRootLineProps | TabsRootBoxProps;
export type TabsIndicatorConfig = TabsLineIndicatorConfig | TabsBoxIndicatorConfig;

export type TabsBarProps = HeadlessTabsBarProps;

export type TabsTabProps = Omit<HeadlessTabsTabProps, 'children' | 'className'> & {
  className?: string;
  children?: ReactNode;
  label?: ReactNode;
  icon?: ReactNode;
};

export type TabsContentProps = HeadlessTabsContentProps;

export type TabsIndicatorProps = HeadlessTabsIndicatorProps;

export type TabsLabelProps = HTMLAttributes<HTMLSpanElement>;

export type TabsIconProps = HTMLAttributes<HTMLSpanElement>;

export type { TabsBoxIndicatorConfig, TabsIndicatorMotion, TabsLineIndicatorConfig };
