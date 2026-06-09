import {
  type ActivationFeedbackEffectSchema,
  type ActivationFeedbackMotionCurveToken,
  type ActivationFeedbackProfile,
  type ActivationFeedbackProfileConfig,
  resolveActivationFeedbackConfig,
  resolveActivationFeedbackDurationMs,
  resolveActivationFeedbackProfile,
  resolvePressedActivationFeedbackProfile
} from '@kiskadee/core';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

const CURVE_TOKEN_TO_CSS: Record<ActivationFeedbackMotionCurveToken, string> = {
  'motion.standard.out': 'ease-out',
  'motion.emphasized.out': 'cubic-bezier(0.2, 0, 0.2, 1)'
};

type ActivationFeedbackProfileValue = {
  profile?: ActivationFeedbackProfile;
  profileConfig?: ActivationFeedbackProfileConfig;
};

type ParsedActivationFeedbackStyleKey =
  | {
      propertyName: 'activationFeedback';
      value: ActivationFeedbackEffectSchema;
    }
  | {
      propertyName: 'activationFeedbackProfile';
      value: ActivationFeedbackProfileValue;
    };

function parseActivationFeedbackValue(styleKey: string): ParsedActivationFeedbackStyleKey {
  const match = styleKey.match(/^(activationFeedbackProfile|activationFeedback)__(.+)$/);

  if (!match) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME('activationFeedback', styleKey));
  }

  const propertyName = match[1] as 'activationFeedbackProfile' | 'activationFeedback';
  const rawValue = match[2];
  if (!rawValue.startsWith('{')) {
    throw new Error(UNSUPPORTED_VALUE('activationFeedback', rawValue, styleKey));
  }

  try {
    return {
      propertyName,
      value: JSON.parse(rawValue) as ActivationFeedbackEffectSchema | ActivationFeedbackProfileValue
    } as ParsedActivationFeedbackStyleKey;
  } catch {
    throw new Error(UNSUPPORTED_VALUE('activationFeedback', rawValue, styleKey));
  }
}

function toCssCurve(token: ActivationFeedbackMotionCurveToken): string {
  return CURVE_TOKEN_TO_CSS[token] ?? 'ease-out';
}

function toCssDuration(token: string | undefined, fallbackMs: number): string {
  return `${resolveActivationFeedbackDurationMs(
    token as ActivationFeedbackEffectSchema['fadeDurationToken'],
    fallbackMs
  )}ms`;
}

function resolveProfileConfig(value: ActivationFeedbackProfileValue): {
  profile: ActivationFeedbackProfile;
  profileConfig: ActivationFeedbackProfileConfig;
} {
  const profile = value.profile ?? 'surface';
  if (profile === 'pressed') {
    return {
      profile,
      profileConfig: resolvePressedActivationFeedbackProfile({ profile: value.profileConfig })
    };
  }

  return {
    profile,
    profileConfig: resolveActivationFeedbackProfile(profile, { profile: value.profileConfig })
  };
}

function transformActivationFeedbackProfileToCss(
  value: ActivationFeedbackProfileValue,
  className: string
): string {
  const { profile, profileConfig } = resolveProfileConfig(value);
  const isOverflowProfile = profile === 'overflow' || profile === 'overflow-static';
  const overflow = isOverflowProfile ? 'visible' : 'hidden';
  const clip = isOverflowProfile ? 'none' : 'inset(0 round var(--k-bdr, 0px))';
  const size =
    profileConfig.size === 'auto'
      ? 'auto'
      : typeof profileConfig.size === 'number' && profileConfig.size > 0
        ? `${profileConfig.size}px`
        : 'auto';
  const duration = toCssDuration(profileConfig.durationToken, profile === 'pressed' ? 0 : 468);
  const ease = toCssCurve(profileConfig.curveToken ?? 'motion.standard.out');
  const fadeDelay = toCssDuration(profileConfig.fade?.delayToken, 50);
  const fadeDuration = toCssDuration(profileConfig.fade?.durationToken, 100);
  const fadeEase = toCssCurve(profileConfig.fade?.curveToken ?? 'motion.standard.out');
  const animateSize = profileConfig.animateSize === false ? '0' : '1';
  const borderWidth =
    profileConfig.border?.width !== undefined ? `${profileConfig.border.width}px` : '0';
  const borderTone = profileConfig.border?.surfaceTone;
  const borderColor =
    borderTone === 'vivid'
      ? 'var(--k-af-vivid-color, var(--k-af-current-color, currentColor))'
      : borderTone === 'subtle'
        ? 'var(--k-af-subtle-color, var(--k-af-current-color, currentColor))'
        : 'var(--k-af-current-color, var(--k-af-color, currentColor))';
  const borderOpacity =
    borderTone === 'vivid'
      ? 'var(--k-af-vivid-opacity, var(--k-af-current-opacity, 1))'
      : borderTone === 'subtle'
        ? 'var(--k-af-subtle-opacity, var(--k-af-current-opacity, 1))'
        : 'var(--k-af-current-opacity, var(--k-af-opacity, 1))';

  return `.${className} { --k-af-profile: ${profile}; --k-af-overflow: ${overflow}; --k-af-clip: ${clip}; --k-af-size: ${size}; --k-af-animate-size: ${animateSize}; --k-af-duration: ${duration}; --k-af-ease: ${ease}; --k-af-fade-delay: ${fadeDelay}; --k-af-fade-duration: ${fadeDuration}; --k-af-fade-ease: ${fadeEase}; --k-af-border-width: ${borderWidth}; --k-af-border-color: ${borderColor}; --k-af-border-opacity: ${borderOpacity}; }`;
}

export function transformActivationFeedbackKeyToCss(styleKey: string, className: string): string {
  const parsed = parseActivationFeedbackValue(styleKey);
  if (parsed.propertyName === 'activationFeedbackProfile') {
    return transformActivationFeedbackProfileToCss(parsed.value, className);
  }

  const resolved = resolveActivationFeedbackConfig(parsed.value);
  const fadeDuration = resolveActivationFeedbackDurationMs(resolved.fadeDurationToken, 360);

  // Keep --k-af-token-* in the fallback chain for consumers overriding legacy vars directly.
  return `.${className} { --k-af-color: var(--k-af-current-color, var(--k-af-subtle-color, var(--k-af-token-color, var(--k-focus-color, currentColor)))); --k-af-opacity: var(--k-af-current-opacity, var(--k-af-subtle-opacity, var(--k-af-token-opacity, 0.16))); --k-af-thickness: ${resolved.thickness}px; --k-af-fade-duration: ${fadeDuration}ms; --k-af-ease: ${toCssCurve(resolved.curveToken)}; }`;
}
