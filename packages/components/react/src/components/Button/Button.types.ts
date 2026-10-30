import type {
  ActivationFeedbackOrigin,
  ActivationFeedbackProfileMode,
  ButtonIconLayout,
  ButtonIconPlacement,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ButtonIndicatorPlacement,
  ButtonIntent,
  ButtonSelectionEmphasis,
  ClassNameByElementJSON,
  ComponentEmphasis,
  ComponentSize,
  ProjectedStateKeys,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import type { HTMLAttributes, ReactNode } from 'react';
import type { DeterminateDecorativeProgressProps } from '../Progress/Progress.types.ts';

export type {
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ButtonIndicatorPlacement,
  ButtonSelectionEmphasis
} from '@kiskadee/core';

export type ButtonStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type ButtonElementName =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10'
  | 'e11'
  | 'e12';

export type ButtonSelectionRestClassesMap = Partial<
  Record<'e1' | 'e2' | 'e3' | 'e4' | 'e5', ClassNameByElementJSON>
>;
export type ButtonGroupClassesMap = {
  frame?: ClassNameByElementJSON;
  member?: Pick<ClassNameByElementJSON, 'c' | 'd'>;
  selectionRestMember?: Pick<ClassNameByElementJSON, 'c' | 'd'>;
};
export type ButtonClassesMap = Partial<Record<ButtonElementName, ClassNameByElementJSON>> & {
  selectionRest?: ButtonSelectionRestClassesMap;
  group?: ButtonGroupClassesMap;
};

/** Determinate decorative progress paint rendered across the Button surface. */
export type ButtonProgressProps = Omit<
  DeterminateDecorativeProgressProps,
  'decorative' | 'children' | 'classNames' | 'mode' | 'size'
>;

export type ButtonIconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: ReactNode;
};

export type ButtonDisclosureProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children?: ReactNode;
};

export type ButtonBadgePlacement =
  | 'inline-start'
  | 'inline-end'
  | 'block-start-inline-start'
  | 'block-start-inline-end'
  | 'block-end-inline-start'
  | 'block-end-inline-end';

export type ButtonBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children: ReactNode;
  placement?: ButtonBadgePlacement;
};

export type ButtonActivationFeedbackEffect = {
  /** Override activation-feedback profile for this button. */
  profile?: ActivationFeedbackProfileMode;
  /** Override activation-feedback origin for this button (center vs. pointer). */
  origin?: ActivationFeedbackOrigin;
};

export type ButtonProps = HeadlessButtonProps & {
  /**
   * Forces a projected Kiskadee state on the root element (e1).
   * `pending` is visual-only; `disabled` preserves the existing activation block.
   */
  status?: ButtonStatus;
  /** Marks this button as an intent toggle (Following vs. Follow). */
  toggle?: boolean;
  /** Semantic control state (selected/active/checked). When true, selected styles are applied. */
  controlState?: boolean;
  /** Chooses selection paint and its optional indicator without changing the semantic state. */
  selectionEmphasis?: ButtonSelectionEmphasis;
  /** Overrides the paint intent only while selected; omission follows the preset or base intent. */
  selectionIntent?: ButtonIntent;
  /** Places the optional preset-authored selection indicator inside or outside the lower edge. */
  indicatorPlacement?: ButtonIndicatorPlacement;
  /**
   * Select a fixed component size.
   * When omitted, the component uses the configured density.
   */
  size?: ComponentSize;
  /** Enable elevation/shadow visuals. When true, adds the shadow activation class. */
  shadow?: boolean;
  /**
   * Local activation-feedback override. Pass `false` to disable activation feedback.
   */
  activationFeedback?: ButtonActivationFeedbackEffect | false;
  /** Uses schema radius scales. Stacked converts Pill to Rounded and preserves Square. */
  radius?: RadiusMode;
  /** Enable border-radius effects (animated corners). */
  radiusEffect?: boolean;
  /**
   * Emphasis level for the button colors.
   * When provided, selects only classes for the specified emphasis
   * (highest/high/medium/low/lowest).
   * If not provided or if emphasis metadata is not available, uses all palette classes.
   */
  emphasis?: ComponentEmphasis;
  /** Base semantic color family; selectionIntent can override selected paint. Default is neutral. */
  intent?: ButtonIntent;
  /**
   * Local surface relationship used to resolve palette colors.
   * `onVivid` requires explicit support from the active preset palette.
   */
  surfaceContext?: SurfaceContext;
  /** Duration for the pressed visual state (ms). */
  pressedDurationMs?: number;
  /**
   * Icon/label composition. `inline` centers both as one group; `edge`
   * pins the icon to a logical edge while centering the label independently.
   * `stacked` centers an icon above a single-line label using the preset's stacked recipe.
   */
  iconLayout?: ButtonIconLayout;
  /** Logical icon side. Leading/trailing follow direction; inactive in stacked layout. */
  iconPlacement?: ButtonIconPlacement;
  /**
   * Optional visual treatment for the icon region.
   * Surfaced treatments require both an icon and a label and imply edge layout.
   */
  iconTreatment?: ButtonIconTreatment;
  /**
   * Corner policy for a surfaced icon region. `edge` keeps the label-facing
   * corners straight; `all` preserves the Button-derived radius on all corners.
   */
  iconSurfaceCorners?: ButtonIconSurfaceCorners;
};

/** Shared visual contract for a horizontal set of connected Buttons. */
export type ButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
  /** Shared size inherited by every Button in the group. */
  size?: ComponentSize;
  /** Shared radius mode. Only the outer Button corners remain rounded. */
  radius?: RadiusMode;
  /** Shared emphasis inherited by every Button in the group. */
  emphasis?: ComponentEmphasis;
  /** Shared semantic intent inherited by every Button in the group. */
  intent?: ButtonIntent;
  /** Shared surface relationship inherited by every Button in the group. */
  surfaceContext?: SurfaceContext;
  /** Applies the Button Rest shadow once to the connected group surface. */
  shadow?: boolean;
};
