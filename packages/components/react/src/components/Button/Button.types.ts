import type {
  ActivationFeedbackOrigin,
  ActivationFeedbackProfileMode,
  ButtonIntent,
  ClassNameByElementJSON,
  ComponentEmphasis,
  ElementSizeValue,
  ProjectedStateKeys,
  RadiusMode,
  SurfaceContext
} from '@kiskadee/core';
import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';

export type ButtonStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type ButtonElementName = 'e1' | 'e2' | 'e3';

export type ButtonClassesMap = Partial<Record<ButtonElementName, ClassNameByElementJSON>>;

export type ButtonActivationFeedbackEffect = {
  /** Override activation-feedback profile for this button. */
  profile?: ActivationFeedbackProfileMode;
  /** Override activation-feedback origin for this button (center vs. pointer). */
  origin?: ActivationFeedbackOrigin;
};

export type ButtonProps = HeadlessButtonProps & {
  /** Force Kiskadee visual/interaction state on the root element (e1). Excludes 'selected' and 'shadow'. */
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
   * `inverse` requires explicit support from the active preset palette.
   */
  surfaceContext?: SurfaceContext;
  /** Duration for the pressed visual state (ms). */
  pressedDurationMs?: number;
};
