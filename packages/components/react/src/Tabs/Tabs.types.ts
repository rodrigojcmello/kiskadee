import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  RadiusMode,
  TabsBridgeLowerCurveMode,
  TabsBoxIndicatorVariant,
  TabsIndicatorPosition,
  TabsIndicatorVariant,
  TabsIndicatorWidthMode,
  TabsLineIndicatorVariant,
  TabsTabWidthMode,
  TabsType
} from '@kiskadee/core';
import type {
  TabsBarProps as HeadlessTabsBarProps,
  TabsContentProps as HeadlessTabsContentProps,
  TabsIndicatorProps as HeadlessTabsIndicatorProps,
  TabsRootProps as HeadlessTabsRootProps,
  TabsTabProps as HeadlessTabsTabProps
} from '@kiskadee/react-headless';
import type { HTMLAttributes, ReactNode, RefObject } from 'react';
import type { TabsStructuralDescriptor } from './Tabs.structural';

// ============================================
// Public API
// ============================================

export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TabsClassNames = Partial<Record<TabsElementName, string>>;

export type TabsClassesMap = Partial<Record<TabsElementName, ClassNameByElementJSON>>;

export type TabsIndicatorMotion = 'auto' | 'none';
export type TabsIndicatorMotionStyle = 'direct' | 'stretch';

type TabsIndicatorMotionConfig<TMotion extends TabsIndicatorMotion> = {
  motion?: TMotion;
};

type TabsLineIndicatorShared<TMotion extends TabsIndicatorMotion> = TabsIndicatorMotionConfig<TMotion> & {
  position?: TabsIndicatorPosition;
};

type TabsLineIndicatorBarConfig<TMotion extends TabsIndicatorMotion> =
  TabsLineIndicatorShared<TMotion> & {
    variant?: TabsLineIndicatorVariant;
    widthMode?: TabsIndicatorWidthMode;
    motionStyle?: TabsIndicatorMotionStyle;
  };

export type TabsLineIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsLineIndicatorBarConfig<TMotion>;

export type TabsBoxIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    variant?: TabsBoxIndicatorVariant;
    motionStyle?: TabsIndicatorMotionStyle;
    position?: never;
    widthMode?: never;
  };

export type TabsSegmentedIndicatorConfig = {
  variant?: never;
  motion?: never;
  motionStyle?: never;
  position?: never;
  widthMode?: never;
};

export type TabsDotIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    variant?: never;
    motionStyle?: never;
    position?: TabsIndicatorPosition;
    widthMode?: never;
  };

export type TabsBridgeIndicatorConfig = {
  variant?: never;
  motion?: never;
  motionStyle?: never;
  position?: never;
  widthMode?: never;
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
  tabWidthMode?: TabsTabWidthMode;
  separator?: boolean;
  spring?: TabsSpringPreset | TabsSpringConfig;
  /**
   * Semantic color family key for class map lookup (e.g. "primary", "neutral").
   * Falls back to the first available semantic key when not found.
   */
  intent?: string;
};

export type TabsRootLineProps = TabsRootBaseProps & {
  type?: 'line';
  indicator?: TabsLineIndicatorConfig;
};

export type TabsRootBoxProps = TabsRootBaseProps & {
  type: 'box';
  indicator?: TabsBoxIndicatorConfig;
};

export type TabsRootSegmentedProps = TabsRootBaseProps & {
  type: 'segmented';
  indicator?: TabsSegmentedIndicatorConfig;
};

export type TabsRootDotProps = TabsRootBaseProps & {
  type: 'dot';
  indicator?: TabsDotIndicatorConfig;
};

export type TabsRootBridgeProps = TabsRootBaseProps & {
  type: 'bridge';
  indicator?: TabsBridgeIndicatorConfig;
  lowerCurveMode?: TabsBridgeLowerCurveMode;
};

export type TabsRootProps =
  | TabsRootLineProps
  | TabsRootBoxProps
  | TabsRootSegmentedProps
  | TabsRootDotProps
  | TabsRootBridgeProps;

export type TabsLineRootProps = Omit<TabsRootLineProps, 'type'>;

export type TabsBoxRootProps = Omit<TabsRootBoxProps, 'type'>;

export type TabsSegmentedRootProps = Omit<TabsRootSegmentedProps, 'type'>;

export type TabsDotRootProps = Omit<TabsRootDotProps, 'type'>;

export type TabsBridgeRootProps = Omit<TabsRootBridgeProps, 'type'>;

export type TabsIndicatorConfig = TabsRootProps['indicator'];

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

// ============================================
// Internal Runtime
// ============================================

export type TabsResolvedIndicator<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> = {
  motion: TMotion;
  motionStyle: TabsIndicatorMotionStyle;
  position: TabsIndicatorPosition;
  variant: TabsIndicatorVariant;
  widthMode: TabsIndicatorWidthMode;
};

export type TabsVisualContextValue<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> = {
  selected: string | undefined;
  scale: string;
  intent: string;
  emphasis: ComponentEmphasis | undefined;
  type: TabsType;
  structural: TabsStructuralDescriptor;
  tabWidthMode: TabsTabWidthMode;
  radiusMode: RadiusMode;
  barRef: RefObject<HTMLDivElement | null>;
  indicator: TabsResolvedIndicator<TMotion>;
  lowerCurveMode: TabsBridgeLowerCurveMode;
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
