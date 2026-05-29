import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackMotionDurationToken
} from './activation-feedback.types.ts';

export const ACTIVATION_FEEDBACK_DURATION_TOKEN_TO_MS: Readonly<
  Record<ActivationFeedbackMotionDurationToken, number>
> = {
  'interaction.instant': 0,
  'interaction.fast': 360,
  'interaction.slow': 468,
  'interaction.hold.short': 50,
  'interaction.fade.short': 100,
  'interaction.fade.long': 360
};

export const DEFAULT_ACTIVATION_FEEDBACK: Readonly<Required<ActivationFeedbackEffectSchema>> = {
  thickness: 3,
  holdDurationToken: 'interaction.hold.short',
  fadeDurationToken: 'interaction.fade.long',
  curveToken: 'motion.standard.out'
};
