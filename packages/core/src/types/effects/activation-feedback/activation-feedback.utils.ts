import {
  ACTIVATION_FEEDBACK_DURATION_TOKEN_TO_MS,
  DEFAULT_ACTIVATION_FEEDBACK,
  DEFAULT_ACTIVATION_FEEDBACK_PROFILES,
  DEFAULT_PRESSED_ACTIVATION_FEEDBACK_PROFILE
} from './activation-feedback.constants.ts';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackMotionDurationToken,
  ActivationFeedbackProfile,
  ActivationFeedbackProfileConfig,
  ActivationFeedbackProfileMode,
  ResolvedActivationFeedbackConfig
} from './activation-feedback.types.ts';

export function resolveActivationFeedbackConfig(
  config?: ActivationFeedbackEffectSchema
): ResolvedActivationFeedbackConfig {
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

export function resolveActivationFeedbackProfileKey(
  profile: ActivationFeedbackProfile
): keyof NonNullable<ActivationFeedbackEffectSchema['profiles']> {
  if (profile === 'overflow-static') return 'overflowStatic';
  return profile;
}

function mergeActivationFeedbackProfile(
  base: ActivationFeedbackProfileConfig,
  override?: ActivationFeedbackProfileConfig
): ActivationFeedbackProfileConfig {
  const baseBorder = base.border;
  const overrideBorder = override?.border;
  const hasBorder = baseBorder !== undefined || overrideBorder !== undefined;

  return {
    ...base,
    ...override,
    fade: {
      ...base.fade,
      ...override?.fade
    },
    ...(hasBorder
      ? {
          border: {
            ...baseBorder,
            ...overrideBorder
          }
        }
      : {})
  };
}

export function resolveActivationFeedbackProfile(
  profile: ActivationFeedbackProfileMode,
  options: { config?: ActivationFeedbackEffectSchema; profile?: ActivationFeedbackProfileConfig } = {}
): ActivationFeedbackProfileConfig {
  const configured =
    options.profile ?? options.config?.profiles?.[resolveActivationFeedbackProfileKey(profile)];

  return mergeActivationFeedbackProfile(DEFAULT_ACTIVATION_FEEDBACK_PROFILES[profile], configured);
}

export function resolvePressedActivationFeedbackProfile(
  options: { config?: ActivationFeedbackEffectSchema; profile?: ActivationFeedbackProfileConfig } = {}
): ActivationFeedbackProfileConfig {
  const configured = options.profile ?? options.config?.profiles?.pressed;
  return mergeActivationFeedbackProfile(DEFAULT_PRESSED_ACTIVATION_FEEDBACK_PROFILE, configured);
}

export function resolveActivationFeedbackDurationMs(
  token: ActivationFeedbackMotionDurationToken | undefined,
  fallbackMs: number
): number {
  if (!token) return fallbackMs;
  return ACTIVATION_FEEDBACK_DURATION_TOKEN_TO_MS[token] ?? fallbackMs;
}
