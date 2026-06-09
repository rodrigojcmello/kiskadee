import type { ActivationFeedbackEffectSchema } from '@kiskadee/core';
import type { SwitchInputProps } from '@kiskadee/react-headless';
import { type FocusEvent, type PointerEvent, type RefObject, useCallback, useMemo } from 'react';
import { useActivationFeedbackOverflowStatic } from '../../../../hooks/effects/activation-feedback/useActivationFeedbackOverflowStatic.ts';

type SwitchActivationFeedbackControllerOptions = {
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  enabled: boolean;
  inputProps?: SwitchInputProps;
  onBlur?: (event: FocusEvent<HTMLLabelElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLLabelElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLLabelElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLLabelElement>) => void;
  readOnly?: boolean;
  thumbRef: RefObject<HTMLSpanElement | null>;
  trackRef: RefObject<HTMLSpanElement | null>;
};

type SwitchActivationFeedbackControllerResult = {
  cancel: () => void;
  inputProps?: SwitchInputProps;
  isActive: boolean;
  isFading: boolean;
  rootHandlers: {
    onBlur?: (event: FocusEvent<HTMLLabelElement>) => void;
    onPointerCancel?: (event: PointerEvent<HTMLLabelElement>) => void;
    onPointerDown?: (event: PointerEvent<HTMLLabelElement>) => void;
    onPointerUp?: (event: PointerEvent<HTMLLabelElement>) => void;
  };
};

const SWITCH_ACTIVATION_FEEDBACK_KEYBOARD_KEYS = [' '] as const;
const SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS = 140;

export function useSwitchActivationFeedbackController({
  config,
  disabled,
  enabled,
  inputProps,
  onBlur,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  readOnly,
  thumbRef,
  trackRef
}: SwitchActivationFeedbackControllerOptions): SwitchActivationFeedbackControllerResult {
  const shouldStartPointerFeedback = useCallback(
    (event: PointerEvent<HTMLLabelElement>) => {
      if (event.button !== 0 || event.isPrimary === false) return false;

      const trackElement = trackRef.current;
      const target = event.target;

      return trackElement !== null && target instanceof Node
        ? trackElement.contains(target)
        : false;
    },
    [trackRef]
  );

  const activationFeedbackMachine = useActivationFeedbackOverflowStatic<
    HTMLLabelElement,
    HTMLSpanElement,
    HTMLInputElement
  >({
    capturePointer: false,
    config,
    disabled,
    enabled,
    hostRef: thumbRef,
    keyboardActivationKeys: SWITCH_ACTIVATION_FEEDBACK_KEYBOARD_KEYS,
    minPointerHoldMs: SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS,
    origin: 'center',
    readOnly,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
    onKeyDown: inputProps?.onKeyDown,
    onKeyUp: inputProps?.onKeyUp,
    onKeyboardBlur: inputProps?.onBlur,
    shouldStartPointerFeedback
  });

  const resolvedInputProps = useMemo(
    () =>
      enabled
        ? {
            ...inputProps,
            onKeyDown: activationFeedbackMachine.handleKeyDown,
            onKeyUp: activationFeedbackMachine.handleKeyUp,
            onBlur: activationFeedbackMachine.handleKeyboardBlur
          }
        : inputProps,
    [
      activationFeedbackMachine.handleKeyboardBlur,
      activationFeedbackMachine.handleKeyDown,
      activationFeedbackMachine.handleKeyUp,
      enabled,
      inputProps
    ]
  );

  return {
    cancel: activationFeedbackMachine.cancel,
    inputProps: resolvedInputProps,
    isActive: enabled && activationFeedbackMachine.isActive,
    isFading: enabled && activationFeedbackMachine.isFading,
    rootHandlers: {
      onPointerDown: enabled ? activationFeedbackMachine.handlePointerDown : onPointerDown,
      onPointerUp: enabled ? activationFeedbackMachine.handlePointerUp : onPointerUp,
      onPointerCancel: enabled ? activationFeedbackMachine.handlePointerCancel : onPointerCancel,
      onBlur: enabled ? activationFeedbackMachine.handleBlur : onBlur
    }
  };
}
