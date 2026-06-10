import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackOrigin,
  ActivationFeedbackPressedVisual,
  ActivationFeedbackProfileMode
} from '@kiskadee/core';
import {
  resolveActivationFeedbackProfile,
  resolvePressedActivationFeedbackProfile
} from '@kiskadee/core';
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useMemo
} from 'react';
import { useActivationFeedbackOverflowStatic } from '../../../../hooks/effects/activation-feedback/useActivationFeedbackOverflowStatic.ts';
import {
  type ActivationFeedbackRadialRuntimeConfig,
  resolveActivationFeedbackRadialRuntimeConfig,
  useActivationFeedbackRadialStateMachine
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';

type SwitchActivationFeedbackControllerOptions = {
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  enabled: boolean;
  forcedActive?: boolean;
  onBlur?: (event: FocusEvent<HTMLLabelElement>) => void;
  onClickCapture?: (event: MouseEvent<HTMLLabelElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLLabelElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLLabelElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLLabelElement>) => void;
  profile: ActivationFeedbackProfileMode;
  readOnly?: boolean;
  thumbRef: RefObject<HTMLSpanElement | null>;
  trackRef: RefObject<HTMLSpanElement | null>;
};

type SwitchActivationFeedbackControllerResult = {
  cancel: () => void;
  isActive: boolean;
  isFading: boolean;
  rootHandlers: {
    onBlur?: (event: FocusEvent<HTMLLabelElement>) => void;
    onClickCapture?: (event: MouseEvent<HTMLLabelElement>) => void;
    onPointerCancel?: (event: PointerEvent<HTMLLabelElement>) => void;
    onPointerDown?: (event: PointerEvent<HTMLLabelElement>) => void;
    onPointerUp?: (event: PointerEvent<HTMLLabelElement>) => void;
  };
};

const SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS = 140;

export function useSwitchActivationFeedbackController({
  config,
  disabled,
  enabled,
  forcedActive,
  onBlur,
  onClickCapture,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  profile,
  readOnly,
  thumbRef,
  trackRef
}: SwitchActivationFeedbackControllerOptions): SwitchActivationFeedbackControllerResult {
  const isEventInsideTrack = useCallback(
    (event: MouseEvent<HTMLLabelElement> | PointerEvent<HTMLLabelElement>) => {
      const trackElement = trackRef.current;
      if (!trackElement) return false;

      const rect = trackElement.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    },
    [trackRef]
  );

  const shouldStartPointerFeedback = useCallback(
    (event: PointerEvent<HTMLLabelElement>) => {
      if (event.button !== 0 || event.isPrimary === false) return false;
      return isEventInsideTrack(event);
    },
    [isEventInsideTrack]
  );

  const origin: ActivationFeedbackOrigin = config?.origin ?? 'center';
  const activationFeedbackMachine = useActivationFeedbackOverflowStatic<
    HTMLLabelElement,
    HTMLSpanElement
  >({
    capturePointer: false,
    config,
    disabled,
    enabled: enabled && profile === 'halo',
    forcedActive: profile === 'halo' ? forcedActive : false,
    hostRef: thumbRef,
    minPointerHoldMs: SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS,
    origin,
    readOnly,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
    shouldStartPointerFeedback
  });

  const radialRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig | null>(() => {
    if (profile === 'halo') return null;

    const profileConfig = resolveActivationFeedbackProfile(profile, { config });
    return resolveActivationFeedbackRadialRuntimeConfig(profileConfig, {
      fallbackDurationMs: 468,
      isOverflowProfile: profile === 'ripple-overflow'
    });
  }, [config, profile]);

  const pressedRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig>(() => {
    const profileConfig = resolvePressedActivationFeedbackProfile({ config });
    return resolveActivationFeedbackRadialRuntimeConfig(profileConfig, {
      fallbackDurationMs: 0,
      isOverflowProfile: false
    });
  }, [config]);

  const pressedVisual: ActivationFeedbackPressedVisual =
    config?.visual?.layer === 'overlay' || config?.pressedVisual === 'overlay'
      ? 'overlay'
      : 'state';
  const radialActivationFeedbackMachine = useActivationFeedbackRadialStateMachine<
    HTMLLabelElement,
    HTMLSpanElement
  >({
    capturePointer: false,
    effectProfile: enabled && profile !== 'halo' ? profile : null,
    hostRef: thumbRef,
    isDisabled: disabled || readOnly,
    pressedVisual,
    localActivationFeedbackOrigin: undefined,
    globalActivationFeedbackOrigin: origin,
    mouseInputFeedback: 'feedback',
    keyboardInputFeedback: 'pressed',
    keyboardActivationKeys: [],
    modeActivationFeedbackRadialRuntimeConfig: radialRuntimeConfig,
    minPointerHoldMs: SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS,
    pressedActivationFeedbackRadialRuntimeConfig: pressedRuntimeConfig,
    shouldForceOverlayPressed: false,
    allowPressedFeedback: false,
    triggerPressed: () => undefined,
    onBlur,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    shouldStartPointerFeedback
  });

  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLLabelElement>) => {
      onClickCapture?.(event);
      if (event.defaultPrevented) return;
      if (!isEventInsideTrack(event)) return;

      if (profile === 'halo') {
        activationFeedbackMachine.trigger(event, SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS);
        return;
      }

      radialActivationFeedbackMachine.handleClick(event);
    },
    [
      activationFeedbackMachine.trigger,
      isEventInsideTrack,
      onClickCapture,
      profile,
      radialActivationFeedbackMachine.handleClick
    ]
  );

  const activeMachine =
    profile === 'halo' ? activationFeedbackMachine : radialActivationFeedbackMachine;

  return {
    cancel: activeMachine.cancel,
    isActive: enabled && activeMachine.isActive,
    isFading: enabled && activeMachine.isFading,
    rootHandlers: {
      onClickCapture: enabled ? handleClickCapture : onClickCapture,
      onPointerDown: enabled && profile !== 'halo' ? radialActivationFeedbackMachine.handlePointerDown : onPointerDown,
      onPointerUp: enabled && profile !== 'halo' ? radialActivationFeedbackMachine.handlePointerUp : onPointerUp,
      onPointerCancel:
        enabled && profile !== 'halo'
          ? radialActivationFeedbackMachine.handlePointerCancel
          : onPointerCancel,
      onBlur: enabled ? activeMachine.handleBlur : onBlur
    }
  };
}
