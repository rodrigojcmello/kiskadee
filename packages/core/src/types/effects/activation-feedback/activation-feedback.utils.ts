import {
  ACTIVATION_FEEDBACK_PROFILE_DEFINITIONS,
  ACTIVATION_FEEDBACK_DURATION_TOKEN_TO_MS,
  DEFAULT_ACTIVATION_FEEDBACK_PROFILES,
  DEFAULT_PRESSED_ACTIVATION_FEEDBACK_PROFILE
} from './activation-feedback.constants.ts';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackMotionDurationToken,
  ActivationFeedbackProfileDefinition,
  ActivationFeedbackProfileKey,
  ActivationFeedbackProfileConfig,
  ActivationFeedbackProfileMode,
  ActivationFeedbackSetting,
  ActivationFeedbackVisual
} from './activation-feedback.types.ts';

export function isActivationFeedbackProfileKey(
  value: unknown
): value is ActivationFeedbackProfileKey {
  return (
    value === 'ripple' ||
    value === 'ripple-overflow' ||
    value === 'halo' ||
    value === 'pressed'
  );
}

export function isActivationFeedbackProfileMode(
  value: unknown
): value is ActivationFeedbackProfileMode {
  return value === 'ripple' || value === 'ripple-overflow' || value === 'halo';
}

export function resolveActivationFeedbackProfileDefinition(
  profile: ActivationFeedbackProfileKey
): ActivationFeedbackProfileDefinition {
  const definition = ACTIVATION_FEEDBACK_PROFILE_DEFINITIONS[profile];
  if (!definition) {
    throw new Error(`Unsupported activation feedback profile "${String(profile)}".`);
  }
  return definition;
}

export function resolveActivationFeedbackProfileBucket(
  profile: ActivationFeedbackProfileKey
): ActivationFeedbackProfileDefinition['bucket'] {
  return resolveActivationFeedbackProfileDefinition(profile).bucket;
}

export function usesActivationFeedbackOverflowGeometry(
  profile: ActivationFeedbackProfileKey
): boolean {
  return resolveActivationFeedbackProfileDefinition(profile).overflow === 'visible';
}

export function usesActivationFeedbackStaticRuntime(
  profile: ActivationFeedbackProfileMode
): boolean {
  return resolveActivationFeedbackProfileDefinition(profile).runtime === 'static';
}

export function usesActivationFeedbackRadialRuntime(
  profile: ActivationFeedbackProfileMode
): boolean {
  return resolveActivationFeedbackProfileDefinition(profile).runtime === 'radial';
}

export function resolveActivationFeedbackProfileKey(
  profile: ActivationFeedbackProfileKey
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
  return {
    ...base,
    ...override,
    fade: {
      ...base.fade,
      ...override?.fade
    }
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
  if (!isActivationFeedbackProfileMode(profile)) {
    throw new Error(`Unsupported activation feedback profile "${String(profile)}".`);
  }

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
