import type {
  ClassNameByElementJSON,
  ComponentEmphasis,
  RadiusMode,
  TabsBoxIndicatorVariant,
  TabsIndicatorPosition,
  TabsIndicatorVariant,
  TabsIndicatorWidthMode,
  TabsLineIndicatorVariant,
  TabsType
} from '@kiskadee/core';

export type TabsElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TabsClassNames = Partial<Record<TabsElementName, string>>;

export type TabsClassesMap = Partial<Record<TabsElementName, ClassNameByElementJSON>>;

export type TabsIndicatorMotion = 'auto' | 'none';

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
  };

export type TabsLineIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsLineIndicatorBarConfig<TMotion>;

export type TabsBoxIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    variant?: TabsBoxIndicatorVariant;
    position?: never;
    widthMode?: never;
  };

export type TabsDotIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    variant?: never;
    position?: TabsIndicatorPosition;
    widthMode?: never;
  };

export type TabsIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  | TabsLineIndicatorConfig<TMotion>
  | TabsBoxIndicatorConfig<TMotion>
  | TabsDotIndicatorConfig<TMotion>;

export type ResolvedTabsIndicator<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> = {
  motion: TMotion;
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
  radiusMode: RadiusMode;
  indicator: ResolvedTabsIndicator<TMotion>;
  indicatorTransition?: Record<string, unknown>;
  separator: boolean;
  listClassName: string | undefined;
  separatorClassName: string | undefined;
  classNames: TabsClassNames;
  elements: TabsClassesMap;
};

export type TabsTabContextValue = {
  isSelected: boolean;
};
