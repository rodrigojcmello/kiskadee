import {
  type ActivationFeedbackEffectSchema,
  type ActivationFeedbackMotionCurveToken,
  type ActivationFeedbackMotionDurationToken,
  type ActivationFeedbackProfileKey,
  type ActivationFeedbackProfileConfig,
  type ActivationFeedbackTone,
  type ActivationFeedbackVisual,
  isActivationFeedbackProfileKey,
  resolveActivationFeedbackDurationMs,
  resolveActivationFeedbackProfileDefinition,
  resolveActivationFeedbackProfile,
  resolvePressedActivationFeedbackProfile
} from '@kiskadee/core';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

const CURVE_TOKEN_TO_CSS: Record<ActivationFeedbackMotionCurveToken, string> = {
  'motion.standard.out': 'ease-out',
  'motion.emphasized.out': 'cubic-bezier(0.2, 0, 0.2, 1)'
};

type ActivationFeedbackProfileValue = {
  profile?: ActivationFeedbackProfileKey;
  profileConfig?: ActivationFeedbackProfileConfig;
  visual?: ActivationFeedbackVisual;
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
    token as ActivationFeedbackMotionDurationToken,
    fallbackMs
  )}ms`;
}

function resolveProfileConfig(value: ActivationFeedbackProfileValue, styleKey: string): {
  profile: ActivationFeedbackProfileKey;
  profileConfig: ActivationFeedbackProfileConfig;
  visual?: ActivationFeedbackVisual;
} {
  const profile = value.profile ?? 'ripple';
  if (!isActivationFeedbackProfileKey(profile)) {
    throw new Error(UNSUPPORTED_VALUE('activationFeedback', String(profile), styleKey));
  }

  if (profile === 'pressed') {
    return {
      profile,
      profileConfig: resolvePressedActivationFeedbackProfile({ profile: value.profileConfig }),
      visual: value.visual
    };
  }

  return {
    profile,
    profileConfig: resolveActivationFeedbackProfile(profile, { profile: value.profileConfig }),
    visual: value.visual
  };
}

function toneColorVar(tone: ActivationFeedbackTone): string {
  return tone === 'vivid'
    ? 'var(--k-af-vivid-color, var(--k-af-subtle-color, currentColor))'
    : 'var(--k-af-subtle-color, var(--k-focus-color, currentColor))';
}

function toneOpacityVar(tone: ActivationFeedbackTone): string {
  return tone === 'vivid'
    ? 'var(--k-af-vivid-opacity, var(--k-af-subtle-opacity, 1))'
    : 'var(--k-af-subtle-opacity, 0.16)';
}

function transformActivationFeedbackProfileToCss(
  value: ActivationFeedbackProfileValue,
  styleKey: string,
  className: string
): string {
  const { profile, profileConfig, visual } = resolveProfileConfig(value, styleKey);
  const profileDefinition = resolveActivationFeedbackProfileDefinition(profile);
  const isOverflowProfile = profileDefinition.overflow === 'visible';
  const overflow = isOverflowProfile ? 'visible' : 'hidden';
  const clip = isOverflowProfile ? 'none' : 'inset(0 round var(--k-bdr, 0px))';
  const isHaloProfile = profileDefinition.shape === 'halo';
  const isOutline = visual?.paint === 'outline';
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
  const numericSize =
    typeof profileConfig.size === 'number' && profileConfig.size > 0 ? profileConfig.size : null;
  const geometrySize = isHaloProfile && numericSize !== null ? `${numericSize}px` : '0px';
  const borderWidth = isOutline && numericSize !== null ? `${numericSize}px` : '0';
  const borderColor = 'var(--k-af-current-color, var(--k-af-color, currentColor))';
  const fillOpacity = isOutline ? '0' : '1';
  const layerWidth = isOutline
    ? `calc(var(--k-af-host-width, var(--k-af-end-size)) + (${geometrySize} * 2))`
    : `calc(var(--k-af-end-size) + (${geometrySize} * 2))`;
  const layerHeight = isOutline
    ? `calc(var(--k-af-host-height, var(--k-af-end-size)) + (${geometrySize} * 2))`
    : `calc(var(--k-af-end-size) + (${geometrySize} * 2))`;
  const layerRadius = isOutline
    ? `calc(var(--k-af-host-radius, 0px) + ${geometrySize})`
    : '999px';

  return `.${className} { --k-af-profile: ${profile}; --k-af-overflow: ${overflow}; --k-af-clip: ${clip}; --k-af-size: ${size}; --k-af-animate-size: ${animateSize}; --k-af-duration: ${duration}; --k-af-ease: ${ease}; --k-af-fade-delay: ${fadeDelay}; --k-af-fade-duration: ${fadeDuration}; --k-af-fade-ease: ${fadeEase}; --k-af-fill-opacity: ${fillOpacity}; --k-af-layer-width: ${layerWidth}; --k-af-layer-height: ${layerHeight}; --k-af-layer-radius: ${layerRadius}; --k-af-border-width: ${borderWidth}; --k-af-border-color: ${borderColor}; --k-af-border-opacity: 1; }`;
}

export function transformActivationFeedbackKeyToCss(styleKey: string, className: string): string {
  const parsed = parseActivationFeedbackValue(styleKey);
  if (parsed.propertyName === 'activationFeedbackProfile') {
    return transformActivationFeedbackProfileToCss(parsed.value, styleKey, className);
  }

  const tone = parsed.value.visual?.tone?.default ?? 'subtle';
  const layer = parsed.value.visual?.layer ?? 'overlay';
  const zIndex = layer === 'underlay' ? '-1' : '2';

  return `.${className} { --k-af-current-color: ${toneColorVar(tone)}; --k-af-current-opacity: ${toneOpacityVar(tone)}; --k-af-color: var(--k-af-current-color, var(--k-af-subtle-color, var(--k-focus-color, currentColor))); --k-af-opacity: var(--k-af-current-opacity, var(--k-af-subtle-opacity, 0.16)); --k-af-z: ${zIndex}; --k-af-fill-opacity: 1; --k-af-fade-duration: 100ms; --k-af-fade-ease: ease-out; --k-af-ease: ease-out; }`;
}
