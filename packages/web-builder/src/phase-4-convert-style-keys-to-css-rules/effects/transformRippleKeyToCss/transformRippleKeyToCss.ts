import {
  type RippleMotionCurveToken,
  type RippleMotionDurationToken,
  type RippleMode,
  type RippleProfile,
  resolveRippleDurationMs,
  resolvePressedRippleProfile,
  resolveRippleProfile,
  stateActivator
} from '@kiskadee/core';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages';

// [RIPPLE EFFECT 13] START: Transform ripple style keys into CSS variable rules.
type RippleValue = {
  mode?: RippleMode;
  profile?: RippleProfile;
};

type RippleCssRuleVars = {
  overflow: string;
  clip: string;
  color: string;
  opacity: string;
  duration: string;
  ease: string;
  fadeDuration: string;
  fadeEase: string;
  borderWidth: string;
  borderColor: string;
  borderOpacity: string;
};

const CURVE_TOKEN_TO_CSS: Record<RippleMotionCurveToken, string> = {
  'motion.standard.out': 'ease-out',
  'motion.emphasized.out': 'cubic-bezier(0.2, 0, 0.2, 1)'
};

const FILL_TOKEN_TO_VARS = {
  surface: {
    colorVar: '--k-ripple-surface-color',
    colorFallback: '#000',
    opacityVar: '--k-ripple-surface-opacity',
    opacityFallback: '0.12'
  },
  overflow: {
    colorVar: '--k-ripple-overflow-color',
    colorFallback: '#0481FF',
    opacityVar: '--k-ripple-overflow-opacity',
    opacityFallback: '0.15'
  },
  overflowStatic: {
    colorVar: '--k-ripple-overflow-static-color',
    colorFallback: '#0481FF',
    opacityVar: '--k-ripple-overflow-static-opacity',
    opacityFallback: '0.15'
  }
} as const;

const BORDER_COLOR_TOKEN_TO_VAR = {
  surface: '--k-ripple-surface-color',
  overflow: '--k-ripple-overflow-color',
  overflowStatic: '--k-ripple-overflow-static-color',
  overflowStaticBorder: '--k-ripple-overflow-static-border-color'
} as const;

const BORDER_OPACITY_TOKEN_TO_VAR = {
  surface: '--k-ripple-surface-opacity',
  overflow: '--k-ripple-overflow-opacity',
  overflowStatic: '--k-ripple-overflow-static-opacity',
  overflowStaticBorder: '--k-ripple-overflow-static-border-opacity'
} as const;

function parseRippleValue(
  rawValue: string,
  propertyName: 'ripple',
  styleKey: string
): RippleValue {
  if (!rawValue.startsWith('{')) {
    throw new Error(UNSUPPORTED_VALUE(propertyName, rawValue, styleKey));
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      mode?: RippleMode;
      profile?: RippleProfile;
    };
    return {
      mode: parsed.mode,
      profile: parsed.profile
    };
  } catch {
    throw new Error(UNSUPPORTED_VALUE(propertyName, rawValue, styleKey));
  }
}

function parseRipplePressedValue(
  rawValue: string,
  propertyName: 'ripplePressed',
  styleKey: string
): { profile?: RippleProfile } {
  if (!rawValue.startsWith('{')) {
    throw new Error(UNSUPPORTED_VALUE(propertyName, rawValue, styleKey));
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      profile?: RippleProfile;
    };
    return {
      profile: parsed.profile
    };
  } catch {
    throw new Error(UNSUPPORTED_VALUE(propertyName, rawValue, styleKey));
  }
}

function toCssDuration(token: RippleMotionDurationToken | undefined, fallbackMs: number): string {
  return `${resolveRippleDurationMs(token, fallbackMs)}ms`;
}

function toCssCurve(token: RippleMotionCurveToken | undefined, fallback: string): string {
  if (!token) return fallback;
  return CURVE_TOKEN_TO_CSS[token] ?? fallback;
}

function buildRippleCssRule(selector: string, vars: RippleCssRuleVars): string {
  return `${selector} { --k-ripple-overflow: ${vars.overflow}; --k-ripple-clip: ${vars.clip}; --k-ripple-color: ${vars.color}; --k-ripple-opacity: ${vars.opacity}; --k-ripple-duration: ${vars.duration}; --k-ripple-ease: ${vars.ease}; --k-ripple-fade-duration: ${vars.fadeDuration}; --k-ripple-fade-ease: ${vars.fadeEase}; --k-ripple-border-width: ${vars.borderWidth}; --k-ripple-border-color: ${vars.borderColor}; --k-ripple-border-opacity: ${vars.borderOpacity}; --k-ripple-z: 2; }`;
}

export function transformRippleKeyToCss(styleKey: string, className: string): string {
  const match = styleKey.match(/^(ripplePressed|ripple)(?:--(\w+))?__(.+)$/);

  if (!match) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME('ripple', styleKey));
  }

  const propertyName = match[1] as 'ripplePressed' | 'ripple';
  const rawValue = match[3];
  const interactiveSuffix = stateActivator.interactive;
  const selector = `.${className}.${interactiveSuffix}`;

  if (propertyName === 'ripplePressed') {
    const { profile } = parseRipplePressedValue(rawValue, propertyName, styleKey);
    const resolvedPressedProfile = resolvePressedRippleProfile({
      profile
    });
    const pressedFillToken = resolvedPressedProfile.fillToken ?? 'surface';
    const pressedFillVars = FILL_TOKEN_TO_VARS[pressedFillToken];
    const pressedDuration = toCssDuration(resolvedPressedProfile.durationToken, 0);
    const pressedEase = toCssCurve(resolvedPressedProfile.curveToken, 'ease-out');
    const pressedFadeDuration = toCssDuration(resolvedPressedProfile.fade?.durationToken, 100);
    const pressedFadeEase = toCssCurve(resolvedPressedProfile.fade?.curveToken, 'ease-out');
    const pressedOverflow = 'hidden';
    const pressedClip = 'inset(0 round var(--k-br, 0px))';
    const pressedBorderWidth =
      resolvedPressedProfile.border?.width !== undefined
        ? `${resolvedPressedProfile.border.width}px`
        : '0';
    const pressedBorderColorVar = resolvedPressedProfile.border?.colorToken
      ? BORDER_COLOR_TOKEN_TO_VAR[resolvedPressedProfile.border.colorToken]
      : undefined;
    const pressedBorderColor = pressedBorderColorVar
      ? `var(${pressedBorderColorVar}, transparent)`
      : 'transparent';
    const pressedBorderOpacityVar = resolvedPressedProfile.border?.colorToken
      ? BORDER_OPACITY_TOKEN_TO_VAR[resolvedPressedProfile.border.colorToken]
      : undefined;
    const pressedBorderOpacity = pressedBorderOpacityVar
      ? `var(${pressedBorderOpacityVar}, 1)`
      : '1';
    const pressedColor = `var(${pressedFillVars.colorVar}, ${pressedFillVars.colorFallback})`;
    const pressedOpacity = `var(${pressedFillVars.opacityVar}, ${pressedFillVars.opacityFallback})`;

    return buildRippleCssRule(selector, {
      overflow: pressedOverflow,
      clip: pressedClip,
      color: pressedColor,
      opacity: pressedOpacity,
      duration: pressedDuration,
      ease: pressedEase,
      fadeDuration: pressedFadeDuration,
      fadeEase: pressedFadeEase,
      borderWidth: pressedBorderWidth,
      borderColor: pressedBorderColor,
      borderOpacity: pressedBorderOpacity
    });
  }

  const { mode, profile } = parseRippleValue(rawValue, propertyName, styleKey);
  const resolvedMode: RippleMode = mode ?? 'surface';
  const resolvedProfile = resolveRippleProfile(resolvedMode, { profile });
  const fillToken = resolvedProfile.fillToken ?? 'surface';
  const fillVars = FILL_TOKEN_TO_VARS[fillToken];
  const isOverflowMode = resolvedMode === 'overflow' || resolvedMode === 'overflow-static';
  const overflow = isOverflowMode ? 'visible' : 'hidden';
  const clip = isOverflowMode ? 'none' : 'inset(0 round var(--k-br, 0px))';
  const resolvedColor = `var(${fillVars.colorVar}, ${fillVars.colorFallback})`;
  const resolvedOpacity = `var(${fillVars.opacityVar}, ${fillVars.opacityFallback})`;
  const duration = toCssDuration(resolvedProfile.durationToken, 468);
  const easing = toCssCurve(resolvedProfile.curveToken, 'ease-out');
  const fadeDuration = toCssDuration(resolvedProfile.fade?.durationToken, 100);
  const fadeEase = toCssCurve(resolvedProfile.fade?.curveToken, 'ease-out');
  const borderWidth = resolvedProfile.border?.width !== undefined ? `${resolvedProfile.border.width}px` : '0';
  const borderColorVar = resolvedProfile.border?.colorToken
    ? BORDER_COLOR_TOKEN_TO_VAR[resolvedProfile.border.colorToken]
    : undefined;
  const borderColor = borderColorVar ? `var(${borderColorVar}, transparent)` : 'transparent';
  const borderOpacityVar = resolvedProfile.border?.colorToken
    ? BORDER_OPACITY_TOKEN_TO_VAR[resolvedProfile.border.colorToken]
    : undefined;
  const borderOpacity = borderOpacityVar ? `var(${borderOpacityVar}, 1)` : '1';

  return buildRippleCssRule(selector, {
    overflow,
    clip,
    color: resolvedColor,
    opacity: resolvedOpacity,
    duration,
    ease: easing,
    fadeDuration,
    fadeEase,
    borderWidth,
    borderColor,
    borderOpacity
  });
}
// [RIPPLE EFFECT 13] END: Transform ripple style keys into CSS variable rules.
