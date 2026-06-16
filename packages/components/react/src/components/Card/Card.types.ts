import type {
  CardIntent,
  CardRadiusMode,
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  ProjectedStateKeys
} from '@kiskadee/core';
import type {
  CardActionProps as HeadlessCardActionProps,
  CardProps as HeadlessCardProps
} from '@kiskadee/react-headless';

export type CardStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type CardElementName = 'e1';

export type CardClassesMap = Partial<Record<CardElementName, ClassNameByElementJSON>>;

export type CardBaseVisualProps = {
  /** Border radius mode. Card v1 supports rounded and square only. */
  radius?: CardRadiusMode;
  /** Keep the schema border visible when shadow is active. Defaults to true. */
  preserveBorderWithShadow?: boolean;
  /**
   * Emphasis level for the card colors.
   * Card v1 starts with `medium`; other buckets render only when the active preset defines them.
   */
  emphasis?: ComponentEmphasis;
  /** Semantic color family to use on the Card root. Card v1 starts with 'neutral'. */
  intent?: CardIntent;
};

export type CardVisualProps = CardBaseVisualProps & {
  /** Opt into shadow, or choose a fixed global shadow level for static cards. */
  shadow?: boolean | ElementSizeValue;
};

export type CardActionVisualProps = CardBaseVisualProps & {
  /** Force Kiskadee visual/interaction state on the root element (e1). Excludes 'selected'. */
  status?: CardStatus;
  /** Opt into the stateful CardAction shadow recipe. */
  shadow?: boolean;
};

export type CardProps = HeadlessCardProps & CardVisualProps;

export type CardActionProps = HeadlessCardActionProps & CardActionVisualProps;
