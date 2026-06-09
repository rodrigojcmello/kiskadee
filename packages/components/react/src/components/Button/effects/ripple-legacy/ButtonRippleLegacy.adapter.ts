import type {
  ActivationFeedbackInputFeedback,
  ActivationFeedbackOrigin,
  ActivationFeedbackPressedVisual,
  ActivationFeedbackProfileMode,
  RippleEffectSchema,
  RippleInputFeedback,
  RippleMode,
  RippleOrigin,
  RipplePressedVisual,
  RippleProfile
} from '@kiskadee/core';
import {
  resolvePressedRippleProfile,
  resolveRippleDurationMs,
  resolveRippleProfile
} from '@kiskadee/core';
import type {
  ActivationFeedbackRadialCssVars,
  ActivationFeedbackRadialRuntimeConfig
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';

type RippleConfig = RippleEffectSchema | undefined;

export const BUTTON_RIPPLE_LEGACY_CSS_VARS: ActivationFeedbackRadialCssVars = {
  endSize: '--k-ripple-end-size',
  startSize: '--k-ripple-start-size',
  x: '--k-ripple-x',
  y: '--k-ripple-y'
};

export type ButtonRippleLegacyRuntimeOptions = {
  cssVars: ActivationFeedbackRadialCssVars;
  globalOrigin: ActivationFeedbackOrigin;
  keyboardInputFeedback: ActivationFeedbackInputFeedback;
  localOrigin: ActivationFeedbackOrigin | undefined;
  mouseInputFeedback: ActivationFeedbackInputFeedback;
  pressedVisual: ActivationFeedbackPressedVisual;
};

export const toButtonActivationFeedbackProfileFromRippleMode = (
  mode: RippleMode | undefined
): ActivationFeedbackProfileMode | undefined => mode;

export const toButtonActivationFeedbackOriginFromRippleOrigin = (
  origin: RippleOrigin | undefined
): ActivationFeedbackOrigin | undefined => origin;

export function toButtonActivationFeedbackInputFeedbackFromRippleInput(
  feedback: RippleInputFeedback
): ActivationFeedbackInputFeedback {
  return feedback === 'ripple' ? 'feedback' : 'pressed';
}

export function toButtonActivationFeedbackPressedVisualFromRipplePressedVisual(
  pressedVisual: RipplePressedVisual
): ActivationFeedbackPressedVisual {
  return pressedVisual === 'overlay' ? 'overlay' : 'state';
}

export function resolveButtonRippleLegacyRuntimeOptions({
  forceRippleFeedback,
  localOrigin,
  rippleConfig,
  rippleMode
}: {
  forceRippleFeedback: boolean;
  localOrigin: RippleOrigin | undefined;
  rippleConfig: RippleConfig;
  rippleMode: RippleMode | null;
}): ButtonRippleLegacyRuntimeOptions {
  const mouseFeedback = forceRippleFeedback
    ? 'ripple'
    : (rippleConfig?.inputFeedback?.mouse ?? 'ripple');
  const keyboardFeedback = forceRippleFeedback
    ? 'ripple'
    : (rippleConfig?.inputFeedback?.keyboard ?? mouseFeedback);
  const pressedVisual: RipplePressedVisual =
    rippleMode && rippleConfig?.pressedVisual === 'overlay' ? 'overlay' : 'state';

  return {
    cssVars: BUTTON_RIPPLE_LEGACY_CSS_VARS,
    globalOrigin: toButtonActivationFeedbackOriginFromRippleOrigin(rippleConfig?.origin) ?? 'center',
    keyboardInputFeedback:
      toButtonActivationFeedbackInputFeedbackFromRippleInput(keyboardFeedback),
    localOrigin: toButtonActivationFeedbackOriginFromRippleOrigin(localOrigin),
    mouseInputFeedback: toButtonActivationFeedbackInputFeedbackFromRippleInput(mouseFeedback),
    pressedVisual: toButtonActivationFeedbackPressedVisualFromRipplePressedVisual(pressedVisual)
  };
}

function resolveButtonRippleRuntimeConfig(
  profile: RippleProfile,
  fallbackDurationMs: number,
  isOverflowMode: boolean
): ActivationFeedbackRadialRuntimeConfig {
  const configuredSize =
    profile.size === 'auto'
      ? 'auto'
      : typeof profile.size === 'number' && profile.size > 0
        ? profile.size
        : 'auto';

  return {
    size: configuredSize,
    durationMs: resolveRippleDurationMs(profile.durationToken, fallbackDurationMs),
    releaseRatio: isOverflowMode && profile.animateSize ? 0.8 : 1,
    fadeDelayMs: resolveRippleDurationMs(profile.fade?.delayToken, 50),
    fadeDurationMs: resolveRippleDurationMs(profile.fade?.durationToken, 100),
    startSizePx: 18
  };
}

export function resolveButtonRippleModeRuntimeConfig(
  rippleMode: RippleMode,
  rippleConfig: RippleConfig
): ActivationFeedbackRadialRuntimeConfig {
  const profile = resolveRippleProfile(rippleMode, { config: rippleConfig });
  const isOverflowMode = rippleMode === 'overflow' || rippleMode === 'overflow-static';
  return resolveButtonRippleRuntimeConfig(profile, 468, isOverflowMode);
}

export function resolveButtonRipplePressedRuntimeConfig(
  rippleConfig: RippleConfig
): ActivationFeedbackRadialRuntimeConfig {
  const profile = resolvePressedRippleProfile({ config: rippleConfig });
  return resolveButtonRippleRuntimeConfig(profile, 0, false);
}
