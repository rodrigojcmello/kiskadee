import type {
  ActivationFeedbackOrigin,
  ActivationFeedbackPressedVisual,
  ActivationFeedbackProfileMode,
  RippleMode
} from '@kiskadee/core';
import {
  resolveActivationFeedbackProfile,
  resolvePressedActivationFeedbackProfile
} from '@kiskadee/core';
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useMemo
} from 'react';
import {
  resolveActivationFeedbackProfileAvailability
} from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import {
  type ActivationFeedbackInputFeedback,
  type ActivationFeedbackRadialRuntimeConfig,
  resolveActivationFeedbackRadialRuntimeConfig,
  useActivationFeedbackRadialStateMachine
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';
import {
  resolveButtonAccessibilityFromCommon,
  type ButtonCommonProps,
  useTransientPressedState
} from '../../hooks/useButtonBase.ts';
import { resolveButtonRippleModeAvailability } from '../ripple-legacy/ButtonRippleLegacy.utils.ts';
import type { ButtonFeedbackKind } from './ButtonFeedback.types.ts';
import {
  resolveButtonRippleModeRuntimeConfig,
  resolveButtonRipplePressedRuntimeConfig,
  resolveButtonRippleLegacyRuntimeOptions,
  toButtonActivationFeedbackOriginFromRippleOrigin,
  toButtonActivationFeedbackProfileFromRippleMode
} from '../ripple-legacy/ButtonRippleLegacy.adapter.ts';

type ButtonActivationFeedbackControllerResult = {
  activationFeedbackProfile: ActivationFeedbackProfileMode | null;
  ariaDisabled: ReturnType<typeof resolveButtonAccessibilityFromCommon>['ariaDisabled'];
  ariaPressed: ReturnType<typeof resolveButtonAccessibilityFromCommon>['ariaPressed'];
  feedbackKind: ButtonFeedbackKind | null;
  handlers: {
    onBlur: (event: FocusEvent<HTMLButtonElement>) => void;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
    onKeyUp: (event: KeyboardEvent<HTMLButtonElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  };
  hostRef: RefObject<HTMLButtonElement | null>;
  isDisabled: ReturnType<typeof resolveButtonAccessibilityFromCommon>['isDisabled'];
  isFeedbackActive: boolean;
  isFeedbackFading: boolean;
  rippleMode: RippleMode | null;
  shouldForceOverlayPressed: boolean;
  shouldUsePressedFeedback: boolean;
  shouldUsePressedProfile: boolean;
};

function resolveModernActivationFeedbackProfile({
  activationFeedback,
  availableProfiles,
  feedbackEnabled,
  globalProfile,
  legacyRippleMode,
  localProfile,
  rippleEffect
}: {
  activationFeedback: ButtonCommonProps['activationFeedback'];
  availableProfiles: ActivationFeedbackProfileMode[];
  feedbackEnabled: boolean;
  globalProfile: ActivationFeedbackProfileMode | undefined;
  legacyRippleMode: RippleMode | undefined;
  localProfile: ActivationFeedbackProfileMode | undefined;
  rippleEffect: ButtonCommonProps['rippleEffect'];
}): ActivationFeedbackProfileMode | null {
  if (!feedbackEnabled) return null;
  if (availableProfiles.length === 0) return null;
  if (activationFeedback === false || rippleEffect === false) return null;

  const requested =
    localProfile ??
    toButtonActivationFeedbackProfileFromRippleMode(legacyRippleMode) ??
    globalProfile ??
    'surface';
  if (availableProfiles.includes(requested)) return requested;
  return availableProfiles[0] ?? null;
}

function resolveLegacyRippleMode({
  activationFeedback,
  availableModes,
  feedbackEnabled,
  globalMode,
  localMode,
  modernProfile,
  rippleEffect
}: {
  activationFeedback: ButtonCommonProps['activationFeedback'];
  availableModes: RippleMode[];
  feedbackEnabled: boolean;
  globalMode: RippleMode | undefined;
  localMode: RippleMode | undefined;
  modernProfile: ActivationFeedbackProfileMode | null;
  rippleEffect: ButtonCommonProps['rippleEffect'];
}): RippleMode | null {
  if (!feedbackEnabled) return null;
  if (modernProfile) return null;
  if (availableModes.length === 0) return null;
  if (activationFeedback === false || rippleEffect === false) return null;

  const requested = localMode ?? globalMode ?? 'surface';
  if (availableModes.includes(requested)) return requested;
  return availableModes[0] ?? null;
}

export function useButtonActivationFeedbackController(
  common: ButtonCommonProps,
  options: { feedbackEnabled?: boolean } = {}
): ButtonActivationFeedbackControllerResult {
  const {
    activationFeedback,
    controlState,
    rippleEffect,
    emphasis,
    status,
    pressedDurationMs,
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur,
    e1,
    globalEffects
  } = common;

  const accessibility = resolveButtonAccessibilityFromCommon(common);
  const feedbackEnabled = options.feedbackEnabled ?? true;
  const activationFeedbackConfig = globalEffects.activationFeedback;
  const rippleConfig = globalEffects.ripple;
  const localActivationFeedback =
    activationFeedback && typeof activationFeedback === 'object' ? activationFeedback : undefined;
  const legacyRippleEffect =
    rippleEffect && typeof rippleEffect === 'object' ? rippleEffect : undefined;
  const { isPressed, triggerPressed } = useTransientPressedState(pressedDurationMs);

  const availableActivationFeedbackProfiles = useMemo(
    () => resolveActivationFeedbackProfileAvailability(e1),
    [e1?.e?.afs, e1?.e?.afo, e1?.e?.afx]
  );
  const availableRippleModes = useMemo(
    () => resolveButtonRippleModeAvailability(e1),
    [e1?.e?.ris, e1?.e?.rio, e1?.e?.rix]
  );

  const activationFeedbackProfile = useMemo(
    () =>
      resolveModernActivationFeedbackProfile({
        activationFeedback,
        availableProfiles: availableActivationFeedbackProfiles,
        feedbackEnabled,
        globalProfile: activationFeedbackConfig?.profile,
        legacyRippleMode: legacyRippleEffect?.mode,
        localProfile: localActivationFeedback?.profile,
        rippleEffect
      }),
    [
      activationFeedback,
      activationFeedbackConfig?.profile,
      availableActivationFeedbackProfiles,
      feedbackEnabled,
      legacyRippleEffect?.mode,
      localActivationFeedback?.profile,
      rippleEffect
    ]
  );

  const rippleMode = useMemo(
    () =>
      resolveLegacyRippleMode({
        activationFeedback,
        availableModes: availableRippleModes,
        feedbackEnabled,
        globalMode: rippleConfig?.mode,
        localMode: legacyRippleEffect?.mode,
        modernProfile: activationFeedbackProfile,
        rippleEffect
      }),
    [
      activationFeedback,
      activationFeedbackProfile,
      availableRippleModes,
      feedbackEnabled,
      legacyRippleEffect?.mode,
      rippleConfig?.mode,
      rippleEffect
    ]
  );

  const feedbackKind: ButtonFeedbackKind | null = activationFeedbackProfile
    ? 'activationFeedback'
    : rippleMode
      ? 'rippleLegacy'
      : null;
  const effectProfile = activationFeedbackProfile ?? rippleMode;
  const forceRippleFeedback = legacyRippleEffect?.mode !== undefined;
  const rippleRuntimeOptions =
    feedbackKind === 'rippleLegacy'
      ? resolveButtonRippleLegacyRuntimeOptions({
          forceRippleFeedback,
          localOrigin: legacyRippleEffect?.origin,
          rippleConfig,
          rippleMode
        })
      : null;
  const mouseInputFeedback: ActivationFeedbackInputFeedback =
    rippleRuntimeOptions?.mouseInputFeedback ?? 'feedback';
  // Keyboard-specific feedback is a legacy Ripple policy. Modern activationFeedback
  // keeps keyboard activation on pressed semantics instead of starting AF.
  const keyboardInputFeedback: ActivationFeedbackInputFeedback =
    rippleRuntimeOptions?.keyboardInputFeedback ?? 'pressed';
  const pressedVisual: ActivationFeedbackPressedVisual =
    rippleRuntimeOptions?.pressedVisual ??
    (activationFeedbackProfile && activationFeedbackConfig?.pressedVisual === 'overlay'
        ? 'overlay'
        : 'state');
  const globalActivationFeedbackOrigin: ActivationFeedbackOrigin =
    rippleRuntimeOptions?.globalOrigin ?? (activationFeedbackConfig?.origin ?? 'center');
  const localActivationFeedbackOrigin: ActivationFeedbackOrigin | undefined =
    rippleRuntimeOptions?.localOrigin ??
    localActivationFeedback?.origin ??
    toButtonActivationFeedbackOriginFromRippleOrigin(legacyRippleEffect?.origin);

  const modeActivationFeedbackRuntimeConfig =
    useMemo<ActivationFeedbackRadialRuntimeConfig | null>(() => {
      if (activationFeedbackProfile) {
        const profileConfig = resolveActivationFeedbackProfile(activationFeedbackProfile, {
          config: activationFeedbackConfig
        });
        const isOverflowProfile =
          activationFeedbackProfile === 'overflow' ||
          activationFeedbackProfile === 'overflow-static';
        return resolveActivationFeedbackRadialRuntimeConfig(profileConfig, {
          fallbackDurationMs: 468,
          isOverflowProfile
        });
      }

      if (rippleMode) {
        return resolveButtonRippleModeRuntimeConfig(rippleMode, rippleConfig);
      }

      return null;
    }, [activationFeedbackConfig, activationFeedbackProfile, rippleConfig, rippleMode]);

  const pressedActivationFeedbackRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig>(
    () => {
      if (feedbackKind === 'rippleLegacy') {
        return resolveButtonRipplePressedRuntimeConfig(rippleConfig);
      }

      const profileConfig = resolvePressedActivationFeedbackProfile({
        config: activationFeedbackConfig
      });
      return resolveActivationFeedbackRadialRuntimeConfig(profileConfig, {
        fallbackDurationMs: 0,
        isOverflowProfile: false
      });
    },
    [activationFeedbackConfig, feedbackKind, rippleConfig]
  );

  const shouldForceOverlayPressed =
    status === 'pressed' && Boolean(effectProfile) && pressedVisual === 'overlay';
  const activationFeedbackMachine = useActivationFeedbackRadialStateMachine<HTMLButtonElement>({
    effectProfile,
    isDisabled: accessibility.isDisabled,
    pressedVisual,
    localActivationFeedbackOrigin,
    globalActivationFeedbackOrigin,
    mouseInputFeedback,
    keyboardInputFeedback,
    modeActivationFeedbackRadialRuntimeConfig: modeActivationFeedbackRuntimeConfig,
    pressedActivationFeedbackRadialRuntimeConfig: pressedActivationFeedbackRuntimeConfig,
    shouldForceOverlayPressed,
    allowPressedFeedback: controlState !== true,
    triggerPressed,
    cssVars: rippleRuntimeOptions?.cssVars,
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur
  });

  const shouldUsePressedFeedback = isPressed && controlState !== true;
  const isActive = Boolean(effectProfile) && (activationFeedbackMachine.isActive || shouldForceOverlayPressed);
  const shouldUsePressedProfile =
    Boolean(effectProfile) &&
    (activationFeedbackMachine.isOverlayActive || shouldForceOverlayPressed);

  return {
    ...accessibility,
    activationFeedbackProfile,
    feedbackKind,
    handlers: {
      onBlur: activationFeedbackMachine.handleBlur,
      onClick: activationFeedbackMachine.handleClick,
      onKeyDown: activationFeedbackMachine.handleKeyDown,
      onKeyUp: activationFeedbackMachine.handleKeyUp,
      onPointerCancel: activationFeedbackMachine.handlePointerCancel,
      onPointerDown: activationFeedbackMachine.handlePointerDown,
      onPointerUp: activationFeedbackMachine.handlePointerUp
    },
    hostRef: activationFeedbackMachine.hostRef,
    isFeedbackActive: isActive,
    isFeedbackFading: activationFeedbackMachine.isFading,
    rippleMode,
    shouldForceOverlayPressed,
    shouldUsePressedFeedback,
    shouldUsePressedProfile
  };
}
