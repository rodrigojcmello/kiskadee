import type {
  CardIntent,
  CardRadiusMode,
  CardSurfaceIntent,
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  ProjectedStateKeys,
  SurfaceContext
} from '@kiskadee/core';
import type {
  CardActionInteractionStateSource,
  CardActionProps as HeadlessCardActionProps,
  CardProps as HeadlessCardProps
} from '@kiskadee/react-headless';
import type { ReactNode } from 'react';

export type { CardActionInteractionStateSource };

export type CardStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type CardElementName = 'e1';

export type CardClassesMap = Partial<Record<CardElementName, ClassNameByElementJSON>>;

export type CardBaseVisualProps = {
  /** Semantic surface consumed by the Card palette. */
  surfaceContext?: SurfaceContext;
  /** Border radius mode. Card v1 supports rounded and square only. */
  radius?: CardRadiusMode;
  /**
   * Emphasis level for the card colors.
   * Card v1 starts with `medium`; other buckets render only when the active preset defines them.
   */
  emphasis?: ComponentEmphasis;
  /** Semantic color family to use on the Card root. Card v1 starts with 'neutral'. */
  intent?: CardIntent;
};

export type CardVisualProps = Omit<CardBaseVisualProps, 'intent'> & {
  /** Static Cards may also use a Container complementary surface. */
  intent?: CardSurfaceIntent;
  /** Override border visibility; omitted follows the preset for the current surface. */
  border?: boolean;
  /** Let child regions meet the Card edge while retaining its radius and clipping. */
  flushContent?: boolean;
  /** Opt into shadow, or choose a fixed global shadow level for static cards. */
  shadow?: boolean | ElementSizeValue;
};

export type CardActionVisualProps = CardBaseVisualProps & {
  /** Keep the schema border visible when shadow is active. Defaults to true. */
  preserveBorderWithShadow?: boolean;
  /** Force Kiskadee visual/interaction state on the root element (e1). Excludes 'selected'. */
  status?: CardStatus;
  /** Opt into the stateful CardAction shadow recipe. */
  shadow?: boolean;
};

export type CardProps = HeadlessCardProps & CardVisualProps;

export type CardActionProps = Omit<HeadlessCardActionProps, 'children'> &
  CardActionVisualProps & {
    children?: ReactNode;
  };
