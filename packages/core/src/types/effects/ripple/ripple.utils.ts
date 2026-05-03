import {
  DEFAULT_PRESSED_RIPPLE_PROFILE,
  DEFAULT_RIPPLE_PROFILES,
  RIPPLE_DURATION_TOKEN_TO_MS
} from './ripple.constants.ts';
import type {
  RippleEffectSchema,
  RippleMode,
  RippleMotionDurationToken,
  RippleProfile
} from './ripple.types.ts';

// [RIPPLE EFFECT 7] START: Ripple profile and duration resolution helpers.
type ResolveRippleProfileOptions = {
  config?: RippleEffectSchema;
  profile?: RippleProfile;
};

export function resolveRippleProfileKey(
  mode: RippleMode
): keyof NonNullable<RippleEffectSchema['profiles']> {
  return mode === 'overflow-static' ? 'overflowStatic' : mode;
}

function mergeRippleProfile(base: RippleProfile, override?: RippleProfile): RippleProfile {
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

export function resolveRippleProfile(
  mode: RippleMode,
  options: ResolveRippleProfileOptions = {}
): RippleProfile {
  const configured =
    options.profile ??
    options.config?.profiles?.[resolveRippleProfileKey(mode)];

  return mergeRippleProfile(DEFAULT_RIPPLE_PROFILES[mode], configured);
}

export function resolvePressedRippleProfile(
  options: ResolveRippleProfileOptions = {}
): RippleProfile {
  const configured = options.profile ?? options.config?.profiles?.pressed;
  return mergeRippleProfile(DEFAULT_PRESSED_RIPPLE_PROFILE, configured);
}

export function resolveRippleDurationMs(
  token: RippleMotionDurationToken | undefined,
  fallbackMs: number
): number {
  if (!token) return fallbackMs;
  return RIPPLE_DURATION_TOKEN_TO_MS[token] ?? fallbackMs;
}
// [RIPPLE EFFECT 7] END: Ripple profile and duration resolution helpers.
