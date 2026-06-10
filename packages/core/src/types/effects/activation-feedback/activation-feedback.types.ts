import type { SolidColor } from '../../colors/colors.types.ts';

export type ActivationFeedbackMotionDurationToken =
  | 'interaction.instant'
  | 'interaction.fast'
  | 'interaction.slow'
  | 'interaction.hold.short'
  | 'interaction.fade.short'
  | 'interaction.fade.long';

export type ActivationFeedbackMotionCurveToken = 'motion.standard.out' | 'motion.emphasized.out';

export type ActivationFeedbackProfile = 'surface' | 'overflow' | 'overflow-static' | 'pressed';

export type ActivationFeedbackProfileMode = Exclude<ActivationFeedbackProfile, 'pressed'>;

export type ActivationFeedbackOrigin = 'center' | 'pointer';

export type ActivationFeedbackPressedVisual = 'state' | 'overlay';

export type ActivationFeedbackSurfaceTone = 'subtle' | 'vivid';

export type ActivationFeedbackProfileConfig = {
  animateSize?: boolean;
  size?: number | 'auto';
  durationToken?: ActivationFeedbackMotionDurationToken;
  curveToken?: ActivationFeedbackMotionCurveToken;
  fade?: {
    delayToken?: ActivationFeedbackMotionDurationToken;
    durationToken?: ActivationFeedbackMotionDurationToken;
    curveToken?: ActivationFeedbackMotionCurveToken;
  };
  border?: {
    width?: number;
    surfaceTone?: ActivationFeedbackSurfaceTone;
  };
};

export type ActivationFeedbackEffectSchema = {
  thickness?: number;
  holdDurationToken?: ActivationFeedbackMotionDurationToken;
  fadeDurationToken?: ActivationFeedbackMotionDurationToken;
  curveToken?: ActivationFeedbackMotionCurveToken;
  profile?: ActivationFeedbackProfileMode;
  origin?: ActivationFeedbackOrigin;
  pressedVisual?: ActivationFeedbackPressedVisual;
  profiles?: {
    surface?: ActivationFeedbackProfileConfig;
    overflow?: ActivationFeedbackProfileConfig;
    overflowStatic?: ActivationFeedbackProfileConfig;
    pressed?: ActivationFeedbackProfileConfig;
  };
};

export type ResolvedActivationFeedbackConfig = Required<
  Pick<
    ActivationFeedbackEffectSchema,
    'thickness' | 'holdDurationToken' | 'fadeDurationToken' | 'curveToken'
  >
>;

export type ActivationFeedbackSurfaceToneTokens = {
  color?: SolidColor;
  opacity?: number;
};

export type ActivationFeedbackThemeTokens = {
  /**
   * Legacy single-tone feedback tokens. New presets should prefer surfaceTone.subtle.
   */
  color?: SolidColor;
  /**
   * Legacy single-tone feedback tokens. New presets should prefer surfaceTone.subtle.
   */
  opacity?: number;
  surfaceTone?: Partial<Record<ActivationFeedbackSurfaceTone, ActivationFeedbackSurfaceToneTokens>>;
};
