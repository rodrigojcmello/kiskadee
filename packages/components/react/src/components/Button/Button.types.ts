import type {
  ActivationFeedbackOrigin,
  ActivationFeedbackProfileMode,
  ButtonIconLayout,
  ButtonIconPlacement,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ButtonIntent,
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  ProjectedStateKeys,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import type { HTMLAttributes, ReactNode } from 'react';
import type { DeterminateDecorativeProgressProps } from '../Progress/Progress.types.ts';

export type { ButtonIconSurfaceCorners, ButtonIconTreatment } from '@kiskadee/core';

export type ButtonStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type ButtonElementName = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7';

export type ButtonClassesMap = Partial<Record<ButtonElementName, ClassNameByElementJSON>>;

/** Determinate decorative progress paint rendered across the Button surface. */
export type ButtonProgressProps = Omit<
  DeterminateDecorativeProgressProps,
  'decorative' | 'children' | 'classNames' | 'mode' | 'scale'
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
  /**
   * Force size/scale for the root element (e1).
   * If not provided, Button defaults to the median scale 's:md:1'.
   */
  scale?: ElementSizeValue;
  /** Enable elevation/shadow visuals. When true, adds the shadow activation class. */
  shadow?: boolean;
  /**
   * Local activation-feedback override. Pass `false` to disable activation feedback.
   */
  activationFeedback?: ButtonActivationFeedbackEffect | false;
  /** Border radius mode. Uses schema radius scales for rounded/pill/square. */
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
  /** Semantic color family to use across ALL elements (e1, e2, e3, ...). Default is 'neutral'. */
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
   */
  iconLayout?: ButtonIconLayout;
  /** Logical icon side. Leading/trailing follow the document direction. */
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
  scale?: ElementSizeValue;
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
