import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackOrigin
} from '@kiskadee/core';
import {
  resolveActivationFeedbackDurationMs,
  resolveActivationFeedbackProfile
} from '@kiskadee/core';
import type {
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  RefObject
} from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UseActivationFeedbackOverflowStaticArgs<
  TPointerElement extends HTMLElement,
  THostElement extends HTMLElement,
  TKeyboardElement extends HTMLElement
> = {
  capturePointer?: boolean;
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  enabled: boolean;
  hostRef?: RefObject<THostElement | null>;
  keyboardActivationKeys?: readonly string[];
  minPointerHoldMs?: number;
  onBlur?: (event: FocusEvent<TPointerElement>) => void;
  onKeyboardBlur?: (event: FocusEvent<TKeyboardElement>) => void;
  onKeyDown?: (event: KeyboardEvent<TKeyboardElement>) => void;
  onKeyUp?: (event: KeyboardEvent<TKeyboardElement>) => void;
  onPointerCancel?: (event: PointerEvent<TPointerElement>) => void;
  onPointerDown?: (event: PointerEvent<TPointerElement>) => void;
  onPointerUp?: (event: PointerEvent<TPointerElement>) => void;
  origin?: ActivationFeedbackOrigin;
  readOnly?: boolean;
  shouldStartPointerFeedback?: (event: PointerEvent<TPointerElement>) => boolean;
};

const DEFAULT_KEYBOARD_ACTIVATION_KEYS = ['Enter', ' '] as const;

const isTouchLikePointer = (pointerType: string): boolean =>
  pointerType === 'touch' || pointerType === 'pen';

const trySetPointerCapture = (target: HTMLElement, pointerId: number) => {
  if (typeof target.setPointerCapture !== 'function') return;
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // Ignore capture errors from non-active pointer ids.
  }
};

const tryReleasePointerCapture = (target: HTMLElement, pointerId: number) => {
  if (typeof target.releasePointerCapture !== 'function') return;
  try {
    if (typeof target.hasPointerCapture === 'function' && target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  } catch {
    // Ignore release errors from stale pointer ids.
  }
};

export function useActivationFeedbackOverflowStatic<
  TPointerElement extends HTMLElement = HTMLElement,
  THostElement extends HTMLElement = TPointerElement,
  TKeyboardElement extends HTMLElement = TPointerElement
>({
  capturePointer = true,
  config,
  disabled,
  enabled,
  hostRef,
  keyboardActivationKeys = DEFAULT_KEYBOARD_ACTIVATION_KEYS,
  minPointerHoldMs = 0,
  onBlur,
  onKeyboardBlur,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  origin = 'pointer',
  readOnly,
  shouldStartPointerFeedback
}: UseActivationFeedbackOverflowStaticArgs<TPointerElement, THostElement, TKeyboardElement>) {
  const [isActive, setIsActive] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uncapturedPointerCleanupRef = useRef<(() => void) | null>(null);
  const startedAtRef = useRef<number>(0);
  const pointerInFlightRef = useRef(false);
  const keyboardInFlightRef = useRef(false);
  const isDisabled = disabled || readOnly || !enabled;

  const runtimeConfig = useMemo(() => {
    const profileConfig = resolveActivationFeedbackProfile('overflow-static', { config });
    return {
      durationMs: resolveActivationFeedbackDurationMs(profileConfig.durationToken, 0),
      fadeDelayMs: resolveActivationFeedbackDurationMs(profileConfig.fade?.delayToken, 50),
      fadeDurationMs: resolveActivationFeedbackDurationMs(profileConfig.fade?.durationToken, 100)
    };
  }, [config]);

  const clearTimers = useCallback(() => {
    if (feedbackTimeoutRef.current !== null) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current !== null) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
  }, []);

  const clearUncapturedPointerListeners = useCallback(() => {
    uncapturedPointerCleanupRef.current?.();
    uncapturedPointerCleanupRef.current = null;
  }, []);

  const resetInFlight = useCallback(() => {
    pointerInFlightRef.current = false;
    keyboardInFlightRef.current = false;
  }, []);

  const clearOriginVars = useCallback(() => {
    const host = hostRef?.current;
    if (!host) return;

    host.style.removeProperty('--k-af-x');
    host.style.removeProperty('--k-af-y');
  }, [hostRef]);

  const clearGeometryVars = useCallback(() => {
    const host = hostRef?.current;
    if (!host) return;

    host.style.removeProperty('--k-af-start-size');
    host.style.removeProperty('--k-af-end-size');
  }, [hostRef]);

  const applyOriginVars = useCallback(
    (event?: PointerEvent<TPointerElement> | KeyboardEvent<TKeyboardElement>) => {
      const host = hostRef?.current;
      if (!host) return;

      if (origin === 'pointer' && event && 'clientX' in event) {
        const rect = host.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
        host.style.setProperty('--k-af-x', `${x}px`);
        host.style.setProperty('--k-af-y', `${y}px`);
        return;
      }

      host.style.setProperty('--k-af-x', '50%');
      host.style.setProperty('--k-af-y', '50%');
    },
    [hostRef, origin]
  );

  const applyStaticGeometryVars = useCallback((): boolean => {
    const host = hostRef?.current;
    if (!host) return true;

    const rect = host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const size = Math.max(rect.width, rect.height);
    host.style.setProperty('--k-af-start-size', `${size}px`);
    host.style.setProperty('--k-af-end-size', `${size}px`);
    return true;
  }, [hostRef]);

  const cancel = useCallback(() => {
    clearTimers();
    clearUncapturedPointerListeners();
    clearGeometryVars();
    clearOriginVars();
    resetInFlight();
    setIsActive(false);
    setIsFading(false);
  }, [
    clearGeometryVars,
    clearOriginVars,
    clearTimers,
    clearUncapturedPointerListeners,
    resetInFlight
  ]);

  const start = useCallback((event?: PointerEvent<TPointerElement> | KeyboardEvent<TKeyboardElement>) => {
    if (isDisabled) return false;
    if (hostRef && !hostRef.current) return false;

    clearTimers();
    clearGeometryVars();
    clearOriginVars();
    applyOriginVars(event);
    if (!applyStaticGeometryVars()) {
      clearGeometryVars();
      clearOriginVars();
      return false;
    }
    startedAtRef.current = Date.now();
    setIsFading(false);
    setIsActive(true);

    return true;
  }, [
    applyOriginVars,
    applyStaticGeometryVars,
    clearGeometryVars,
    clearOriginVars,
    clearTimers,
    hostRef,
    isDisabled
  ]);

  const finish = useCallback(
    (minHoldMs = 0) => {
      const elapsedMs = Math.max(0, Date.now() - startedAtRef.current);
      const remainingDurationMs = Math.max(0, runtimeConfig.durationMs - elapsedMs);
      const remainingMinHoldMs = Math.max(0, minHoldMs - elapsedMs);
      const remainingMs = Math.max(remainingDurationMs, remainingMinHoldMs);

      if (fadeTimeoutRef.current !== null) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      if (feedbackTimeoutRef.current !== null) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }

      fadeTimeoutRef.current = setTimeout(() => {
        fadeTimeoutRef.current = null;
        setIsFading(true);
      }, remainingMs + runtimeConfig.fadeDelayMs);

      feedbackTimeoutRef.current = setTimeout(
        () => {
          clearGeometryVars();
          clearOriginVars();
          resetInFlight();
          setIsActive(false);
          setIsFading(false);
          feedbackTimeoutRef.current = null;
        },
        remainingMs + runtimeConfig.fadeDelayMs + runtimeConfig.fadeDurationMs
      );
    },
    [clearGeometryVars, clearOriginVars, resetInFlight, runtimeConfig]
  );

  const finalizePointerFeedback = useCallback(
    (pointerType: string) => {
      if (!pointerInFlightRef.current) return;
      pointerInFlightRef.current = false;
      finish(isTouchLikePointer(pointerType) ? 0 : minPointerHoldMs);
    },
    [finish, minPointerHoldMs]
  );

  const registerUncapturedPointerEnd = useCallback(
    (pointerId: number, pointerType: string) => {
      clearUncapturedPointerListeners();
      if (typeof window === 'undefined') return;

      const handlePointerEnd = (event: globalThis.PointerEvent) => {
        if (event.pointerId !== pointerId) return;

        if (event.type === 'pointercancel') {
          cancel();
        } else {
          finalizePointerFeedback(event.pointerType || pointerType);
        }
        clearUncapturedPointerListeners();
      };

      window.addEventListener('pointerup', handlePointerEnd, true);
      window.addEventListener('pointercancel', handlePointerEnd, true);
      uncapturedPointerCleanupRef.current = () => {
        window.removeEventListener('pointerup', handlePointerEnd, true);
        window.removeEventListener('pointercancel', handlePointerEnd, true);
      };
    },
    [cancel, clearUncapturedPointerListeners, finalizePointerFeedback]
  );

  useEffect(() => cancel, [cancel]);

  useEffect(() => {
    if (!isDisabled) return;
    cancel();
  }, [cancel, isDisabled]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || isDisabled) return;
      if (event.button !== 0 || event.isPrimary === false) return;
      if (shouldStartPointerFeedback?.(event) === false) return;

      const started = start(event);
      pointerInFlightRef.current = started;
      if (!started) return;

      if (capturePointer) {
        trySetPointerCapture(event.currentTarget, event.pointerId);
      } else {
        registerUncapturedPointerEnd(event.pointerId, event.pointerType);
      }
    },
    [
      capturePointer,
      isDisabled,
      onPointerDown,
      registerUncapturedPointerEnd,
      shouldStartPointerFeedback,
      start
    ]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerUp?.(event);
      tryReleasePointerCapture(event.currentTarget, event.pointerId);
      clearUncapturedPointerListeners();
      finalizePointerFeedback(event.pointerType);
    },
    [clearUncapturedPointerListeners, finalizePointerFeedback, onPointerUp]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerCancel?.(event);
      tryReleasePointerCapture(event.currentTarget, event.pointerId);
      clearUncapturedPointerListeners();
      cancel();
    },
    [cancel, clearUncapturedPointerListeners, onPointerCancel]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<TKeyboardElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.repeat || isDisabled) return;
      if (!keyboardActivationKeys.includes(event.key)) return;

      keyboardInFlightRef.current = start(event);
    },
    [isDisabled, keyboardActivationKeys, onKeyDown, start]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<TKeyboardElement>) => {
      onKeyUp?.(event);
      if (!keyboardActivationKeys.includes(event.key)) return;
      if (!keyboardInFlightRef.current) return;

      keyboardInFlightRef.current = false;
      finish();
    },
    [finish, keyboardActivationKeys, onKeyUp]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<TPointerElement>) => {
      onBlur?.(event);
      if (event.defaultPrevented) return;
      cancel();
    },
    [cancel, onBlur]
  );

  const handleKeyboardBlur = useCallback(
    (event: FocusEvent<TKeyboardElement>) => {
      onKeyboardBlur?.(event);
      if (event.defaultPrevented) return;
      cancel();
    },
    [cancel, onKeyboardBlur]
  );

  return {
    cancel,
    handleBlur,
    handleKeyboardBlur,
    handleKeyDown,
    handleKeyUp,
    handlePointerCancel,
    handlePointerDown,
    handlePointerUp,
    isActive,
    isFading
  };
}
