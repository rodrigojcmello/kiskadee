import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackOrigin,
  ActivationFeedbackProfileMode
} from '@kiskadee/core';
import {
  resolveActivationFeedbackSetting,
  usesActivationFeedbackRadialRuntime
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
  type ActivationFeedbackRadialRuntimeConfig,
  resolveActivationFeedbackProfileRadialRuntimeConfig,
  resolvePressedActivationFeedbackRadialRuntimeConfig,
  useActivationFeedbackRadialStateMachine
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';
import {
  resolveButtonAccessibilityFromCommon,
  type ButtonCommonProps,
  useTransientPressedState
} from '../../hooks/useButtonBase.ts';
import type { ButtonFeedbackKind } from './ButtonFeedback.types.ts';

type ButtonActivationFeedbackControllerResult = {
  activationFeedbackConfig: ActivationFeedbackEffectSchema | undefined;
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
  shouldForceOverlayPressed: boolean;
  shouldUsePressedFeedback: boolean;
  shouldUsePressedProfile: boolean;
};

function resolveModernActivationFeedbackProfile({
  activationFeedback,
  availableProfiles,
  feedbackEnabled,
  globalProfile,
  localProfile
}: {
  activationFeedback: ButtonCommonProps['activationFeedback'];
  availableProfiles: ActivationFeedbackProfileMode[];
  feedbackEnabled: boolean;
  globalProfile: ActivationFeedbackProfileMode | undefined;
  localProfile: ActivationFeedbackProfileMode | undefined;
}): ActivationFeedbackProfileMode | null {
  if (!feedbackEnabled) return null;
  if (availableProfiles.length === 0) return null;
  if (activationFeedback === false) return null;

  const requested = localProfile ?? globalProfile ?? 'ripple';
  if (availableProfiles.includes(requested)) return requested;
  return availableProfiles[0] ?? null;
}

export function useButtonActivationFeedbackController(
  common: ButtonCommonProps,
  options: { feedbackEnabled?: boolean } = {}
): ButtonActivationFeedbackControllerResult {
  const {
    activationFeedback,
    controlState,
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
    componentEffects,
    globalEffects
  } = common;

  const accessibility = resolveButtonAccessibilityFromCommon(common);
  const feedbackEnabled = options.feedbackEnabled ?? true;
  const localActivationFeedback =
    activationFeedback && typeof activationFeedback === 'object' ? activationFeedback : undefined;
  const componentActivationFeedbackConfig = useMemo(
    () =>
      resolveActivationFeedbackSetting(
        globalEffects.activationFeedback,
        componentEffects.activationFeedback
      ),
    [componentEffects.activationFeedback, globalEffects.activationFeedback]
  );
  const activationFeedbackConfig = useMemo(
    () =>
      resolveActivationFeedbackSetting(componentActivationFeedbackConfig, localActivationFeedback),
    [componentActivationFeedbackConfig, localActivationFeedback]
  );
  const { isPressed, triggerPressed } = useTransientPressedState(pressedDurationMs);

  const availableActivationFeedbackProfiles = useMemo(
    () => resolveActivationFeedbackProfileAvailability(e1),
    [e1?.e?.afs, e1?.e?.afo, e1?.e?.afx]
  );
  const availableRadialActivationFeedbackProfiles = useMemo(
    () => availableActivationFeedbackProfiles.filter(usesActivationFeedbackRadialRuntime),
    [availableActivationFeedbackProfiles]
  );

  const activationFeedbackProfile = useMemo(
    () =>
      resolveModernActivationFeedbackProfile({
        activationFeedback,
        availableProfiles: availableRadialActivationFeedbackProfiles,
        feedbackEnabled,
        globalProfile: activationFeedbackConfig?.profile,
        localProfile: localActivationFeedback?.profile
      }),
    [
      activationFeedback,
      activationFeedbackConfig?.profile,
      availableRadialActivationFeedbackProfiles,
      feedbackEnabled,
      localActivationFeedback?.profile
    ]
  );

  const feedbackKind: ButtonFeedbackKind | null = activationFeedbackProfile
    ? 'activationFeedback'
    : null;
  const effectProfile = activationFeedbackProfile;
  const globalActivationFeedbackOrigin: ActivationFeedbackOrigin =
    activationFeedbackConfig?.origin ?? 'center';
  const localActivationFeedbackOrigin: ActivationFeedbackOrigin | undefined =
    localActivationFeedback?.origin;

  const modeActivationFeedbackRuntimeConfig =
    useMemo<ActivationFeedbackRadialRuntimeConfig | null>(() => {
      if (!activationFeedbackProfile) return null;

      return resolveActivationFeedbackProfileRadialRuntimeConfig({
        config: activationFeedbackConfig,
        fallbackDurationMs: 468,
        profile: activationFeedbackProfile
      });
    }, [activationFeedbackConfig, activationFeedbackProfile]);

  const pressedActivationFeedbackRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig>(
    () => {
      return resolvePressedActivationFeedbackRadialRuntimeConfig({
        config: activationFeedbackConfig
      });
    },
    [activationFeedbackConfig]
  );

  const shouldForceOverlayPressed =
    status === 'pressed' &&
    Boolean(effectProfile) &&
    activationFeedbackConfig?.visual?.layer === 'overlay';
  const activationFeedbackMachine = useActivationFeedbackRadialStateMachine<HTMLButtonElement>({
    effectProfile,
    isDisabled: accessibility.isDisabled,
    localActivationFeedbackOrigin,
    globalActivationFeedbackOrigin,
    modeActivationFeedbackRadialRuntimeConfig: modeActivationFeedbackRuntimeConfig,
    pressedActivationFeedbackRadialRuntimeConfig: pressedActivationFeedbackRuntimeConfig,
    shouldForceOverlayPressed,
    allowPressedFeedback: controlState !== true,
    triggerPressed,
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur
  });

  const shouldUsePressedFeedback = isPressed && controlState !== true;
  const isActive =
    Boolean(effectProfile) && (activationFeedbackMachine.isActive || shouldForceOverlayPressed);
  const shouldUsePressedProfile =
    Boolean(effectProfile) &&
    (activationFeedbackMachine.isOverlayActive || shouldForceOverlayPressed);

  return {
    ...accessibility,
    activationFeedbackConfig,
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
    shouldForceOverlayPressed,
    shouldUsePressedFeedback,
    shouldUsePressedProfile
  };
}
