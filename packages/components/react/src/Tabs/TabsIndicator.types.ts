import type {
  TabsBoxIndicatorShape,
  TabsIndicatorPosition,
  TabsIndicatorWidthMode,
  TabsLineIndicatorShape
} from '@kiskadee/core';

export type TabsIndicatorMotion = 'auto' | 'none';

type TabsIndicatorMotionConfig<TMotion extends TabsIndicatorMotion> = {
  motion?: TMotion;
};

type TabsLineIndicatorShared<TMotion extends TabsIndicatorMotion> = TabsIndicatorMotionConfig<TMotion> & {
  position?: TabsIndicatorPosition;
};

type TabsLineIndicatorDotConfig<TMotion extends TabsIndicatorMotion> = TabsLineIndicatorShared<TMotion> & {
  shape: 'dot';
  widthMode?: never;
};

type TabsLineIndicatorBarConfig<TMotion extends TabsIndicatorMotion> = TabsLineIndicatorShared<TMotion> & {
  shape?: Exclude<TabsLineIndicatorShape, 'dot'>;
  widthMode?: TabsIndicatorWidthMode;
};

export type TabsLineIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  | TabsLineIndicatorDotConfig<TMotion>
  | TabsLineIndicatorBarConfig<TMotion>;

export type TabsBoxIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  TabsIndicatorMotionConfig<TMotion> & {
    shape?: TabsBoxIndicatorShape;
    position?: never;
    widthMode?: never;
  };

export type TabsIndicatorConfig<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> =
  | TabsLineIndicatorConfig<TMotion>
  | TabsBoxIndicatorConfig<TMotion>;

export type ResolvedTabsIndicator<TMotion extends TabsIndicatorMotion = TabsIndicatorMotion> = {
  motion: TMotion;
  position: TabsIndicatorPosition;
  shape: TabsLineIndicatorShape | TabsBoxIndicatorShape;
  widthMode: TabsIndicatorWidthMode;
};
