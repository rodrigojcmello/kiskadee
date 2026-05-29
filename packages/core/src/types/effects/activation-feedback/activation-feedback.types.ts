import type { SolidColor } from '../../colors/colors.types.ts';

export type ActivationFeedbackMotionDurationToken =
  | 'interaction.instant'
  | 'interaction.fast'
  | 'interaction.slow'
  | 'interaction.hold.short'
  | 'interaction.fade.short'
  | 'interaction.fade.long';

export type ActivationFeedbackMotionCurveToken =
  | 'motion.standard.out'
  | 'motion.emphasized.out';

export type ActivationFeedbackEffectSchema = {
  thickness?: number;
  holdDurationToken?: ActivationFeedbackMotionDurationToken;
  fadeDurationToken?: ActivationFeedbackMotionDurationToken;
  curveToken?: ActivationFeedbackMotionCurveToken;
};

export type ActivationFeedbackThemeTokens = {
  color?: SolidColor;
  opacity?: number;
};
