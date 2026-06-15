import type {
  CardIntent,
  CardRadiusMode,
  ClassNameByElementJSON,
  ComponentEmphasis,
  ProjectedStateKeys
} from '@kiskadee/core';
import type {
  CardActionProps as HeadlessCardActionProps,
  CardProps as HeadlessCardProps
} from '@kiskadee/react-headless';

export type CardStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type CardElementName = 'e1';

export type CardClassesMap = Partial<Record<CardElementName, ClassNameByElementJSON>>;

export type CardVisualProps = {
  /** Force Kiskadee visual/interaction state on the root element (e1). Excludes 'selected'. */
  status?: CardStatus;
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

export type CardProps = HeadlessCardProps & CardVisualProps;

export type CardActionProps = HeadlessCardActionProps & CardVisualProps;
