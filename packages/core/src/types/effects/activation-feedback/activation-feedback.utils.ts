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
  ActivationFeedbackSetting,
  ActivationFeedbackVisual,
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
  if (profile === 'ripple-overflow') return 'rippleOverflow';
  return profile;
}

export function normalizeActivationFeedbackSetting(
  setting?: ActivationFeedbackSetting
): ActivationFeedbackEffectSchema | false | undefined {
  if (setting === false) return false;
  if (setting === true) return {};
  return setting;
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

function mergeActivationFeedbackVisual(
  base: ActivationFeedbackVisual | undefined,
  override: ActivationFeedbackVisual | undefined
): ActivationFeedbackVisual | undefined {
  if (!base && !override) return undefined;

  return {
    ...base,
    ...override,
    tone:
      base?.tone || override?.tone
        ? {
            ...base?.tone,
            ...override?.tone,
            byEmphasis: {
              ...base?.tone?.byEmphasis,
              ...override?.tone?.byEmphasis
            }
          }
        : undefined
  };
}

export function mergeActivationFeedbackConfig(
  base?: ActivationFeedbackEffectSchema,
  override?: ActivationFeedbackEffectSchema
): ActivationFeedbackEffectSchema | undefined {
  if (!base && !override) return undefined;

  const baseProfiles = base?.profiles;
  const overrideProfiles = override?.profiles;
  const hasProfiles = baseProfiles !== undefined || overrideProfiles !== undefined;
  const visual = mergeActivationFeedbackVisual(base?.visual, override?.visual);

  return {
    ...base,
    ...override,
    ...(visual ? { visual } : {}),
    ...(hasProfiles
      ? {
          profiles: {
            ...(baseProfiles?.ripple || overrideProfiles?.ripple
              ? {
                  ripple: mergeActivationFeedbackProfile(
                    baseProfiles?.ripple ?? {},
                    overrideProfiles?.ripple
                  )
                }
              : {}),
            ...(baseProfiles?.rippleOverflow || overrideProfiles?.rippleOverflow
              ? {
                  rippleOverflow: mergeActivationFeedbackProfile(
                    baseProfiles?.rippleOverflow ?? {},
                    overrideProfiles?.rippleOverflow
                  )
                }
              : {}),
            ...(baseProfiles?.halo || overrideProfiles?.halo
              ? {
                  halo: mergeActivationFeedbackProfile(
                    baseProfiles?.halo ?? {},
                    overrideProfiles?.halo
                  )
                }
              : {}),
            ...(baseProfiles?.pressed || overrideProfiles?.pressed
              ? {
                  pressed: mergeActivationFeedbackProfile(
                    baseProfiles?.pressed ?? {},
                    overrideProfiles?.pressed
                  )
                }
              : {})
          }
        }
      : {})
  };
}

export function resolveActivationFeedbackSetting(
  base?: ActivationFeedbackEffectSchema,
  setting?: ActivationFeedbackSetting
): ActivationFeedbackEffectSchema | undefined {
  const normalized = normalizeActivationFeedbackSetting(setting);
  if (normalized === false) return undefined;
  if (normalized === undefined) return base;
  return mergeActivationFeedbackConfig(base, normalized);
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
