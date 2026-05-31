import type { ActivationFeedbackEffectSchema } from '@kiskadee/core';
import {
  resolveActivationFeedbackConfig,
  resolveActivationFeedbackDurationMs
} from '@kiskadee/core';
import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

type UseActivationFeedbackOptions<
  TRootElement extends HTMLElement,
  TInputElement extends HTMLElement
> = {
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  readOnly?: boolean;
  onPointerDown?: (event: PointerEvent<TRootElement>) => void;
  onPointerCancel?: (event: PointerEvent<TRootElement>) => void;
  onBlur?: (event: FocusEvent<TRootElement>) => void;
  onInputKeyDown?: (event: KeyboardEvent<TInputElement>) => void;
  onInputBlur?: (event: FocusEvent<TInputElement>) => void;
  shouldStartPointerFeedback?: (event: PointerEvent<TRootElement>) => boolean;
};

function isPrimaryPointer(event: PointerEvent<HTMLElement>): boolean {
  return event.button === 0;
}

export function useActivationFeedback<
  TRootElement extends HTMLElement = HTMLElement,
  TInputElement extends HTMLElement = HTMLElement
>({
  config,
  disabled,
  readOnly,
  onPointerDown,
  onPointerCancel,
  onBlur,
  onInputKeyDown,
  onInputBlur,
  shouldStartPointerFeedback
}: UseActivationFeedbackOptions<TRootElement, TInputElement>) {
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(false);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const resolvedConfig = resolveActivationFeedbackConfig(config);
  const holdDurationMs = resolveActivationFeedbackDurationMs(resolvedConfig.holdDurationToken, 50);

  const clearScheduled = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const activate = useCallback(() => {
    isActiveRef.current = true;
    setIsActive(true);
    holdTimeoutRef.current = setTimeout(() => {
      isActiveRef.current = false;
      setIsActive(false);
      holdTimeoutRef.current = null;
    }, holdDurationMs);
  }, [holdDurationMs]);

  const start = useCallback(() => {
    if (disabled || readOnly) return;

    clearScheduled();

    if (isActiveRef.current) {
      isActiveRef.current = false;
      setIsActive(false);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        activate();
      });
      return;
    }

    activate();
  }, [activate, clearScheduled, disabled, readOnly]);

  const cancel = useCallback(() => {
    clearScheduled();
    isActiveRef.current = false;
    setIsActive(false);
  }, [clearScheduled]);

  useEffect(() => cancel, [cancel]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<TRootElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || !isPrimaryPointer(event)) return;
      if (shouldStartPointerFeedback?.(event) === false) return;
      start();
    },
    [onPointerDown, shouldStartPointerFeedback, start]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<TRootElement>) => {
      onPointerCancel?.(event);
      cancel();
    },
    [cancel, onPointerCancel]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<TRootElement>) => {
      onBlur?.(event);
      cancel();
    },
    [cancel, onBlur]
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<TInputElement>) => {
      onInputKeyDown?.(event);
      if (event.defaultPrevented || event.repeat || event.key !== ' ') return;
      start();
    },
    [onInputKeyDown, start]
  );

  const handleInputBlur = useCallback(
    (event: FocusEvent<TInputElement>) => {
      onInputBlur?.(event);
      cancel();
    },
    [cancel, onInputBlur]
  );

  return {
    cancel,
    handleBlur,
    handleInputBlur,
    handleInputKeyDown,
    handlePointerCancel,
    handlePointerDown,
    isActive
  };
}
