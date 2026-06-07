import {
  ACTIVATION_FEEDBACK_DURATION_TOKEN_TO_MS,
  DEFAULT_ACTIVATION_FEEDBACK
} from './activation-feedback.constants.ts';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackMotionDurationToken
} from './activation-feedback.types.ts';

export function resolveActivationFeedbackConfig(
  config?: ActivationFeedbackEffectSchema
): Required<ActivationFeedbackEffectSchema> {
  return {
    thickness:
      typeof config?.thickness === 'number' && config.thickness >= 0
        ? config.thickness
        : DEFAULT_ACTIVATION_FEEDBACK.thickness,
    holdDurationToken: config?.holdDurationToken ?? DEFAULT_ACTIVATION_FEEDBACK.holdDurationToken,
    fadeDurationToken: config?.fadeDurationToken ?? DEFAULT_ACTIVATION_FEEDBACK.fadeDurationToken,
    curveToken: config?.curveToken ?? DEFAULT_ACTIVATION_FEEDBACK.curveToken
  };
}

export function resolveActivationFeedbackDurationMs(
  token: ActivationFeedbackMotionDurationToken | undefined,
  fallbackMs: number
): number {
  if (!token) return fallbackMs;
  return ACTIVATION_FEEDBACK_DURATION_TOKEN_TO_MS[token] ?? fallbackMs;
}
