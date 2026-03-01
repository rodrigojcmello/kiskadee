import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  TabsVariant,
  TabsIndicatorPosition,
  TabsIndicatorShape
} from '@kiskadee/core';
import type {
  TabsBarProps as HeadlessTabsBarProps,
  TabsContentProps as HeadlessTabsContentProps,
  TabsIndicatorProps as HeadlessTabsIndicatorProps,
  TabsRootProps as HeadlessTabsRootProps,
  TabsTabProps as HeadlessTabsTabProps
} from '@kiskadee/react-headless';
import type { HTMLAttributes, ReactNode } from 'react';

export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

export type TabsClassNames = Partial<Record<TabsElementName, string>>;

export type TabsClassesMap = Partial<Record<TabsElementName, ClassNameByElementJSON>>;

export type TabsRootProps = Omit<HeadlessTabsRootProps, 'classNames'> & {
  classNames?: TabsClassNames;
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  variant?: TabsVariant;
  indicatorMotion?: 'auto' | 'none';
  indicatorPosition?: TabsIndicatorPosition;
  indicatorShape?: TabsIndicatorShape;
  /**
   * Semantic color family key for class map lookup (e.g. "primary", "neutral").
   * Falls back to the first available semantic key when not found.
   */
  intent?: string;
};

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
