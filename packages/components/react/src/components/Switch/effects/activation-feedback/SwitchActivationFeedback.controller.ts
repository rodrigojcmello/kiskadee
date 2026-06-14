import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackOrigin,
  ActivationFeedbackProfileMode
} from '@kiskadee/core';
import {
  resolveActivationFeedbackProfileDefinition,
  usesActivationFeedbackStaticRuntime
} from '@kiskadee/core';
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useMemo
} from 'react';
import { useActivationFeedbackHalo } from '../../../../hooks/effects/activation-feedback/useActivationFeedbackHalo.ts';
import {
  type ActivationFeedbackRadialRuntimeConfig,
  resolveActivationFeedbackProfileRadialRuntimeConfig,
  resolvePressedActivationFeedbackRadialRuntimeConfig,
  useActivationFeedbackRadialStateMachine
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';

type SwitchActivationFeedbackControllerOptions = {
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  enabled: boolean;
  forcedActive?: boolean;
  geometryKey?: string;
  interactionLocked?: boolean;
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
  geometryKey,
  interactionLocked,
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
  const profileDefinition = resolveActivationFeedbackProfileDefinition(profile);
  const usesStaticRuntime = usesActivationFeedbackStaticRuntime(profile);
  const activationFeedbackMachine = useActivationFeedbackHalo<
    HTMLLabelElement,
    HTMLSpanElement
  >({
    capturePointer: false,
    config,
    disabled: disabled || interactionLocked,
    enabled: enabled && usesStaticRuntime,
    forcedActive: usesStaticRuntime ? forcedActive : false,
    geometryKey,
    hostRef: thumbRef,
    minPointerHoldMs: SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS,
    origin,
    profile,
    readOnly,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
    shouldStartPointerFeedback
  });

  const radialRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig | null>(() => {
    if (profileDefinition.runtime !== 'radial') return null;

    return resolveActivationFeedbackProfileRadialRuntimeConfig({
      config,
      fallbackDurationMs: 468,
      profile
    });
  }, [config, profile, profileDefinition.runtime]);

  const pressedRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig>(() => {
    return resolvePressedActivationFeedbackRadialRuntimeConfig({ config });
  }, [config]);

  const radialActivationFeedbackMachine = useActivationFeedbackRadialStateMachine<
    HTMLLabelElement,
    HTMLSpanElement
  >({
    capturePointer: false,
    effectProfile: enabled && profileDefinition.runtime === 'radial' ? profile : null,
    hostRef: thumbRef,
    isDisabled: disabled || interactionLocked || readOnly,
    localActivationFeedbackOrigin: undefined,
    globalActivationFeedbackOrigin: origin,
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

      if (usesStaticRuntime) {
        activationFeedbackMachine.trigger(event, SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS);
        return;
      }

      radialActivationFeedbackMachine.handleClick(event);
    },
    [
      activationFeedbackMachine.trigger,
      isEventInsideTrack,
      onClickCapture,
      radialActivationFeedbackMachine.handleClick,
      usesStaticRuntime
    ]
  );

  const activeMachine =
    usesStaticRuntime ? activationFeedbackMachine : radialActivationFeedbackMachine;

  return {
    cancel: activeMachine.cancel,
    isActive: enabled && activeMachine.isActive,
    isFading: enabled && activeMachine.isFading,
    rootHandlers: {
      onClickCapture: enabled ? handleClickCapture : onClickCapture,
      onPointerDown:
        enabled && profileDefinition.runtime === 'radial'
          ? radialActivationFeedbackMachine.handlePointerDown
          : onPointerDown,
      onPointerUp:
        enabled && profileDefinition.runtime === 'radial'
          ? radialActivationFeedbackMachine.handlePointerUp
          : onPointerUp,
      onPointerCancel:
        enabled && profileDefinition.runtime === 'radial'
          ? radialActivationFeedbackMachine.handlePointerCancel
          : onPointerCancel,
      onBlur: enabled ? activeMachine.handleBlur : onBlur
    }
  };
}
