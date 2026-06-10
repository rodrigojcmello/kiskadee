import type { ActivationFeedbackEffectSchema } from '@kiskadee/core';
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useCallback
} from 'react';
import { useActivationFeedbackOverflowStatic } from '../../../../hooks/effects/activation-feedback/useActivationFeedbackOverflowStatic.ts';

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

  const activationFeedbackMachine = useActivationFeedbackOverflowStatic<
    HTMLLabelElement,
    HTMLSpanElement
  >({
    capturePointer: false,
    config,
    disabled,
    enabled,
    forcedActive,
    hostRef: thumbRef,
    minPointerHoldMs: SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS,
    origin: 'center',
    readOnly,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
    shouldStartPointerFeedback
  });

  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLLabelElement>) => {
      onClickCapture?.(event);
      if (event.defaultPrevented) return;
      if (!isEventInsideTrack(event)) return;

      activationFeedbackMachine.trigger(event, SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS);
    },
    [activationFeedbackMachine.trigger, isEventInsideTrack, onClickCapture]
  );

  return {
    cancel: activationFeedbackMachine.cancel,
    isActive: enabled && activationFeedbackMachine.isActive,
    isFading: enabled && activationFeedbackMachine.isFading,
    rootHandlers: {
      onClickCapture: enabled ? handleClickCapture : onClickCapture,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onBlur: enabled ? activationFeedbackMachine.handleBlur : onBlur
    }
  };
}
