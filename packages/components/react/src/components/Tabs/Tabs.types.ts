import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  TabsBoxIndicatorShape,
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorShape,
  TabsIndicatorWidth,
  TabsLineIndicatorShape,
  TabsTabWidth,
  TabsVariant
} from '@kiskadee/core';
import type {
  TabsBarProps as HeadlessTabsBarProps,
  TabsContentProps as HeadlessTabsContentProps,
  TabsIndicatorProps as HeadlessTabsIndicatorProps,
  TabsRootProps as HeadlessTabsRootProps,
  TabsTabProps as HeadlessTabsTabProps
} from '@kiskadee/react-headless';
import type { HTMLAttributes, ReactNode, RefObject } from 'react';
import type { TabsStructuralDescriptor } from './Tabs.structural.ts';

// ============================================
// Public API
// ============================================

export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TabsClassNames = Partial<Record<TabsElementName, string>>;

export type TabsClassesMap = Partial<Record<TabsElementName, ClassNameByElementJSON>>;

export type TabsVariantClassesMap = Partial<Record<TabsVariant, TabsClassesMap>>;

export type TabsIndicatorMotion = 'auto' | 'none';
export type TabsIndicatorMotionStyle = 'direct' | 'stretch';

type TabsIndicatorMotionConfig<TMotion extends TabsIndicatorMotion> = {
  motion?: TMotion;
};

type TabsLineIndicatorShared<TMotion extends TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    position?: TabsIndicatorPosition;
  };

type TabsLineIndicatorBarConfig<TMotion extends TabsIndicatorMotion> =
  TabsLineIndicatorShared<TMotion> & {
    shape?: TabsLineIndicatorShape;
    width?: TabsIndicatorWidth;
    motionStyle?: TabsIndicatorMotionStyle;
  };

export type TabsLineIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsLineIndicatorBarConfig<TMotion>;

export type TabsBoxIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    shape?: TabsBoxIndicatorShape;
    motionStyle?: TabsIndicatorMotionStyle;
    position?: never;
    width?: never;
  };

export type TabsSegmentedIndicatorConfig = {
  shape?: never;
  motion?: never;
  motionStyle?: never;
  position?: never;
  width?: never;
};

export type TabsDotIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    shape?: never;
    motionStyle?: never;
    position?: TabsIndicatorPosition;
    width?: never;
  };

export type TabsBridgeIndicatorConfig = {
  shape?: never;
  motion?: never;
  motionStyle?: never;
  position?: never;
  width?: never;
};

export type TabsSpringPreset = 'snappy' | 'gentle' | 'debugSlow';

export type TabsSpringConfig = Partial<{
  stiffness: number;
  damping: number;
  mass: number;
  restDelta: number;
  restSpeed: number;
}>;

export type TabsRootBaseProps = Omit<HeadlessTabsRootProps, 'classNames' | 'orientation'> & {
  classNames?: TabsClassNames;
  scale?: ElementSizeValue;
  emphasis?: ComponentEmphasis;
  tabWidth?: TabsTabWidth;
  separator?: boolean;
  spring?: TabsSpringPreset | TabsSpringConfig;
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

export type TabsRootSegmentedProps = TabsRootBaseProps & {
  variant: 'segmented';
  indicator?: TabsSegmentedIndicatorConfig;
};

export type TabsRootDotProps = TabsRootBaseProps & {
  variant: 'dot';
  indicator?: TabsDotIndicatorConfig;
};

export type TabsRootBridgeProps = TabsRootBaseProps & {
  variant: 'bridge';
  indicator?: TabsBridgeIndicatorConfig;
  lowerCurve?: TabsBridgeLowerCurve;
};

export type TabsRootProps =
  | TabsRootLineProps
  | TabsRootBoxProps
  | TabsRootSegmentedProps
  | TabsRootDotProps
  | TabsRootBridgeProps;

export type TabsLineRootProps = Omit<TabsRootLineProps, 'variant'>;

export type TabsBoxRootProps = Omit<TabsRootBoxProps, 'variant'>;

export type TabsSegmentedRootProps = Omit<TabsRootSegmentedProps, 'variant'>;

export type TabsDotRootProps = Omit<TabsRootDotProps, 'variant'>;

export type TabsBridgeRootProps = Omit<TabsRootBridgeProps, 'variant'>;

export type TabsIndicatorConfig = TabsRootProps['indicator'];

export type TabsBarProps = HeadlessTabsBarProps;

export type TabsTabProps = Omit<HeadlessTabsTabProps, 'children' | 'className'> & {
  className?: string;
  children?: ReactNode;
  icon?: ReactNode;
  label?: ReactNode;
  accessibilityLabel?: string;
};

export type TabsContentProps = HeadlessTabsContentProps;

export type TabsIndicatorProps = HeadlessTabsIndicatorProps;

export type TabsLabelProps = HTMLAttributes<HTMLSpanElement>;

export type TabsIconProps = HTMLAttributes<HTMLSpanElement>;

// ============================================
// Internal Runtime
// ============================================

export type TabsResolvedIndicator<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> = {
  motion: TMotion;
  motionStyle: TabsIndicatorMotionStyle;
  position: TabsIndicatorPosition;
  shape: TabsIndicatorShape;
  width: TabsIndicatorWidth;
};

export type TabsVisualContextValue<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> = {
  selected: string | undefined;
  scale: string;
  intent: string;
  emphasis: ComponentEmphasis | undefined;
  variant: TabsVariant;
  structural: TabsStructuralDescriptor;
  tabWidth: TabsTabWidth;
  tabShape: RadiusMode;
  barRef: RefObject<HTMLDivElement | null>;
  indicator: TabsResolvedIndicator<TMotion>;
  lowerCurve: TabsBridgeLowerCurve;
  indicatorTransition?: Record<string, unknown>;
  separator: boolean;
  listClassName: string | undefined;
  separatorClassName: string | undefined;
  classNames: TabsClassNames;
  elements: TabsClassesMap;
  StaticEnhancer?: (props: { children?: ReactNode }) => ReactNode;
  loadMotionEnhancer?: () => Promise<{ default: (props: { children?: ReactNode }) => ReactNode }>;
};

export type TabsTabContextValue = {
  isSelected: boolean;
};
