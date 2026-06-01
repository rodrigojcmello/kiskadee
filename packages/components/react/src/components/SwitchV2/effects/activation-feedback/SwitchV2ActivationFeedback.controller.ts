import type { ActivationFeedbackEffectSchema } from '@kiskadee/core';
import type { SwitchInputProps } from '@kiskadee/react-headless';
import { type FocusEvent, type PointerEvent, type RefObject, useCallback, useMemo } from 'react';
import { useActivationFeedback } from '../../../../hooks/effects/activation-feedback/useActivationFeedback.ts';

type SwitchV2ActivationFeedbackControllerOptions = {
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  enabled: boolean;
  inputProps?: SwitchInputProps;
  onBlur?: (event: FocusEvent<HTMLLabelElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLLabelElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLLabelElement>) => void;
  readOnly?: boolean;
  trackRef: RefObject<HTMLSpanElement | null>;
};

type SwitchV2ActivationFeedbackControllerResult = {
  cancel: () => void;
  inputProps?: SwitchInputProps;
  isActive: boolean;
  rootHandlers: {
    onBlur?: (event: FocusEvent<HTMLLabelElement>) => void;
    onPointerCancel?: (event: PointerEvent<HTMLLabelElement>) => void;
    onPointerDown?: (event: PointerEvent<HTMLLabelElement>) => void;
  };
};

export function useSwitchV2ActivationFeedbackController({
  config,
  disabled,
  enabled,
  inputProps,
  onBlur,
  onPointerCancel,
  onPointerDown,
  readOnly,
  trackRef
}: SwitchV2ActivationFeedbackControllerOptions): SwitchV2ActivationFeedbackControllerResult {
  const shouldStartPointerFeedback = useCallback(
    (event: PointerEvent<HTMLLabelElement>) => {
      const trackElement = trackRef.current;
      const target = event.target;

      return trackElement !== null && target instanceof Node
        ? trackElement.contains(target)
        : false;
    },
    [trackRef]
  );

  const {
    cancel,
    handleBlur,
    handleInputBlur,
    handleInputKeyDown,
    handlePointerCancel,
    handlePointerDown,
    isActive
  } = useActivationFeedback<HTMLLabelElement, HTMLInputElement>({
    config,
    disabled,
    readOnly,
    onPointerDown,
    onPointerCancel,
    onBlur,
    onInputKeyDown: inputProps?.onKeyDown,
    onInputBlur: inputProps?.onBlur,
    shouldStartPointerFeedback
  });

  const resolvedInputProps = useMemo(
    () =>
      enabled
        ? {
            ...inputProps,
            onKeyDown: handleInputKeyDown,
            onBlur: handleInputBlur
          }
        : inputProps,
    [enabled, handleInputBlur, handleInputKeyDown, inputProps]
  );

  return {
    cancel,
    inputProps: resolvedInputProps,
    isActive: enabled && isActive,
    rootHandlers: {
      onPointerDown: enabled ? handlePointerDown : onPointerDown,
      onPointerCancel: enabled ? handlePointerCancel : onPointerCancel,
      onBlur: enabled ? handleBlur : onBlur
    }
  };
}
