import type {
  RippleInputFeedback,
  RippleMode,
  RippleOrigin,
  RipplePressedVisual
} from '@kiskadee/core';
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

// [RIPPLE EFFECT 22] START: Ripple runtime state machine and interaction handlers.
type NativeMouseEventWithSourceCapabilities = globalThis.MouseEvent & {
  sourceCapabilities?: { firesTouchEvents?: boolean };
};

export type RippleRuntimeConfig = {
  size: number | 'auto';
  durationMs: number;
  releaseRatio: number;
  fadeDelayMs: number;
  fadeDurationMs: number;
  startSizePx: number;
};

type RippleExternalHandlers = {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
};

type UseRippleStateMachineArgs = RippleExternalHandlers & {
  rippleMode: RippleMode | null;
  isDisabled: boolean | undefined;
  pressedVisual: RipplePressedVisual;
  localRippleOrigin: RippleOrigin | undefined;
  globalRippleOrigin: RippleOrigin;
  mouseInputFeedback: RippleInputFeedback;
  keyboardInputFeedback: RippleInputFeedback;
  modeRippleRuntimeConfig: RippleRuntimeConfig | null;
  pressedRippleRuntimeConfig: RippleRuntimeConfig;
  shouldForceOverlayPressed: boolean;
  allowPressedFeedback: boolean;
  triggerPressed: () => void;
};

const MIN_POINTER_CLICK_HOLD_MS = 120;

// Ripple writes CSS custom properties directly on the button node on purpose.
// This avoids React render churn during pointer/keyboard interactions and keeps
// animation timing stable. The tradeoff is imperative DOM state, so cleanup is
// mandatory and centralized via clearAllTimers + clearRippleInlineVars.
const isTouchLikePointer = (pointerType: string): boolean =>
  pointerType === 'touch' || pointerType === 'pen';

const isTouchSourcedClick = (event: MouseEvent<HTMLButtonElement>): boolean | null => {
  const nativeEvent = event.nativeEvent as NativeMouseEventWithSourceCapabilities;
  if (!nativeEvent.sourceCapabilities) return null;
  return nativeEvent.sourceCapabilities.firesTouchEvents === true;
};

const trySetPointerCapture = (target: HTMLButtonElement, pointerId: number) => {
  if (typeof target.setPointerCapture !== 'function') return;
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // Ignore capture errors from non-active pointer ids.
  }
};

const tryReleasePointerCapture = (target: HTMLButtonElement, pointerId: number) => {
  if (typeof target.releasePointerCapture !== 'function') return;
  try {
    if (typeof target.hasPointerCapture === 'function' && target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  } catch {
    // Ignore release errors from stale pointer ids.
  }
};

export function useRippleStateMachine({
  rippleMode,
  isDisabled,
  pressedVisual,
  localRippleOrigin,
  globalRippleOrigin,
  mouseInputFeedback,
  keyboardInputFeedback,
  modeRippleRuntimeConfig,
  pressedRippleRuntimeConfig,
  shouldForceOverlayPressed,
  allowPressedFeedback,
  triggerPressed,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur
}: UseRippleStateMachineArgs) {
  const [isRippleActive, setIsRippleActive] = useState(false);
  const [isRippleFading, setIsRippleFading] = useState(false);
  const [isOverlayRippleActive, setIsOverlayRippleActive] = useState(false);

  const rippleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleFrameRef = useRef<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const rippleStartTimeRef = useRef<number | null>(null);
  const rippleDurationRef = useRef<number | null>(null);
  const rippleReleaseRatioRef = useRef<number>(1);
  const rippleFadeDelayRef = useRef<number>(50);
  const rippleFadeDurationRef = useRef<number>(100);
  const pendingClickFeedbackRef = useRef<RippleInputFeedback>('pressed');
  const hasPreClickFeedbackRef = useRef(false);
  const pointerRippleInFlightRef = useRef(false);
  const keyboardRippleInFlightRef = useRef(false);
  const pointerOverlayPressedInFlightRef = useRef(false);
  const keyboardOverlayPressedInFlightRef = useRef(false);
  const hasPointerDownFeedbackRef = useRef(false);
  const pointerDownFeedbackRef = useRef<RippleInputFeedback | null>(null);

  const clearRippleInlineVars = useCallback((target: HTMLButtonElement) => {
    // Required counterpart for imperative style.setProperty writes.
    // Prevents stale geometry when the interaction mode changes between pointer/keyboard/programmatic.
    target.style.removeProperty('--k-ripple-x');
    target.style.removeProperty('--k-ripple-y');
    target.style.removeProperty('--k-ripple-end-size');
    target.style.removeProperty('--k-ripple-start-size');
  }, []);

  const clearAllTimers = useCallback(() => {
    // Single cleanup choke-point for all in-flight ripple scheduling.
    if (rippleTimeoutRef.current) {
      clearTimeout(rippleTimeoutRef.current);
      rippleTimeoutRef.current = null;
    }
    if (rippleFadeTimeoutRef.current) {
      clearTimeout(rippleFadeTimeoutRef.current);
      rippleFadeTimeoutRef.current = null;
    }
    if (rippleFrameRef.current !== null) {
      cancelAnimationFrame(rippleFrameRef.current);
      rippleFrameRef.current = null;
    }
  }, []);

  const resolveRippleEndSize = useCallback(
    (rect: DOMRect, x: number, y: number, configuredSize: number | 'auto'): number => {
      if (configuredSize !== 'auto') {
        return Math.max(1, configuredSize);
      }
      const maxX = Math.max(x, rect.width - x);
      const maxY = Math.max(y, rect.height - y);
      const radius = Math.sqrt(maxX * maxX + maxY * maxY);
      return Math.max(1, radius * 2);
    },
    []
  );

  const applyOverlayPressed = useCallback(
    (target: HTMLButtonElement): boolean => {
      if (!rippleMode) return false;

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      clearRippleInlineVars(target);

      const x = rect.width / 2;
      const y = rect.height / 2;
      const size = resolveRippleEndSize(rect, x, y, pressedRippleRuntimeConfig.size);

      // Imperative CSS var writes are intentional for per-interaction animation perf.
      target.style.setProperty('--k-ripple-x', `${x}px`);
      target.style.setProperty('--k-ripple-y', `${y}px`);
      target.style.setProperty('--k-ripple-end-size', `${size}px`);
      target.style.setProperty('--k-ripple-start-size', `${size}px`);

      rippleStartTimeRef.current = Date.now();
      rippleDurationRef.current = pressedRippleRuntimeConfig.durationMs;
      rippleReleaseRatioRef.current = pressedRippleRuntimeConfig.releaseRatio;
      rippleFadeDelayRef.current = pressedRippleRuntimeConfig.fadeDelayMs;
      rippleFadeDurationRef.current = pressedRippleRuntimeConfig.fadeDurationMs;

      setIsOverlayRippleActive(true);
      setIsRippleActive(true);
      setIsRippleFading(false);
      return true;
    },
    [clearRippleInlineVars, pressedRippleRuntimeConfig, resolveRippleEndSize, rippleMode]
  );

  const startOverlayPressed = useCallback(
    (target: HTMLButtonElement): boolean => {
      if (isDisabled === true) return false;
      return applyOverlayPressed(target);
    },
    [applyOverlayPressed, isDisabled]
  );

  const startRipple = useCallback(
    (
      target: HTMLButtonElement,
      opts?: { originOverride?: RippleOrigin; clientX?: number; clientY?: number }
    ): boolean => {
      if (!rippleMode || isDisabled === true) return false;
      if (!modeRippleRuntimeConfig) return false;

      // Ensure we read base ripple vars even if a previous interaction left overlay class active.
      clearRippleInlineVars(target);

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      const origin =
        rippleMode === 'overflow' || rippleMode === 'overflow-static'
          ? 'pointer'
          : (opts?.originOverride ?? localRippleOrigin ?? globalRippleOrigin);

      const clientX = opts?.clientX ?? rect.left + rect.width / 2;
      const clientY = opts?.clientY ?? rect.top + rect.height / 2;
      const x =
        origin === 'pointer'
          ? Math.max(0, Math.min(rect.width, clientX - rect.left))
          : rect.width / 2;
      const y =
        origin === 'pointer'
          ? Math.max(0, Math.min(rect.height, clientY - rect.top))
          : rect.height / 2;

      const size = resolveRippleEndSize(rect, x, y, modeRippleRuntimeConfig.size);
      const startSize = `${modeRippleRuntimeConfig.startSizePx}px`;

      // Imperative CSS var writes are intentional for per-interaction animation perf.
      target.style.setProperty('--k-ripple-x', `${x}px`);
      target.style.setProperty('--k-ripple-y', `${y}px`);
      target.style.setProperty('--k-ripple-end-size', `${size}px`);
      target.style.setProperty('--k-ripple-start-size', startSize);

      clearAllTimers();

      setIsOverlayRippleActive(false);
      setIsRippleFading(false);
      setIsRippleActive(false);

      rippleStartTimeRef.current = Date.now();
      rippleDurationRef.current = modeRippleRuntimeConfig.durationMs;
      rippleReleaseRatioRef.current = modeRippleRuntimeConfig.releaseRatio;
      rippleFadeDelayRef.current = modeRippleRuntimeConfig.fadeDelayMs;
      rippleFadeDurationRef.current = modeRippleRuntimeConfig.fadeDurationMs;

      // One frame separation is enough to restart the ripple transition
      // without forcing synchronous layout.
      rippleFrameRef.current = requestAnimationFrame(() => {
        setIsRippleActive(true);
      });
      return true;
    },
    [
      clearAllTimers,
      clearRippleInlineVars,
      globalRippleOrigin,
      isDisabled,
      localRippleOrigin,
      modeRippleRuntimeConfig,
      resolveRippleEndSize,
      rippleMode
    ]
  );

  const scheduleRippleFade = useCallback(
    (minHoldMs = 0) => {
      if (!rippleMode) return;
      const target = buttonRef.current;
      if (!target) return;

      const durationMs = rippleDurationRef.current ?? 0;
      const releaseRatio = rippleReleaseRatioRef.current;
      const removalDelayMs = Math.max(0, Math.round(durationMs * releaseRatio));
      const rippleFadeDelayMs = rippleFadeDelayRef.current;
      const rippleFadeDurationMs = rippleFadeDurationRef.current;
      const startMs = rippleStartTimeRef.current ?? Date.now();
      const elapsedMs = Math.max(0, Date.now() - startMs);
      const remainingByProfileMs = Math.max(0, removalDelayMs - elapsedMs);
      const remainingByMinHoldMs = Math.max(0, minHoldMs - elapsedMs);
      const remainingMs = Math.max(remainingByProfileMs, remainingByMinHoldMs);

      if (rippleFadeTimeoutRef.current) {
        clearTimeout(rippleFadeTimeoutRef.current);
      }
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }

      rippleFadeTimeoutRef.current = setTimeout(() => {
        setIsRippleFading(true);
      }, remainingMs + rippleFadeDelayMs);

      rippleTimeoutRef.current = setTimeout(
        () => {
          setIsOverlayRippleActive(false);
          setIsRippleActive(false);
          setIsRippleFading(false);
          clearRippleInlineVars(target);
        },
        remainingMs + rippleFadeDelayMs + rippleFadeDurationMs
      );
    },
    [clearRippleInlineVars, rippleMode]
  );

  const finalizePointerFeedback = useCallback(
    (pointerType: string, opts?: { resetPendingFeedback?: boolean }) => {
      const minHoldMs = isTouchLikePointer(pointerType) ? 0 : MIN_POINTER_CLICK_HOLD_MS;
      if (pointerRippleInFlightRef.current) {
        pointerRippleInFlightRef.current = false;
        scheduleRippleFade(minHoldMs);
      }
      if (pointerOverlayPressedInFlightRef.current) {
        pointerOverlayPressedInFlightRef.current = false;
        scheduleRippleFade(minHoldMs);
      }
      if (opts?.resetPendingFeedback) {
        hasPreClickFeedbackRef.current = false;
        pendingClickFeedbackRef.current = 'pressed';
      }
    },
    [scheduleRippleFade]
  );

  const finalizeKeyboardFeedback = useCallback(() => {
    if (keyboardRippleInFlightRef.current) {
      keyboardRippleInFlightRef.current = false;
      scheduleRippleFade();
    }
    if (keyboardOverlayPressedInFlightRef.current) {
      keyboardOverlayPressedInFlightRef.current = false;
      scheduleRippleFade();
    }
  }, [scheduleRippleFade]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    if (rippleMode) return;

    clearAllTimers();
    setIsRippleActive(false);
    setIsRippleFading(false);
    setIsOverlayRippleActive(false);

    pointerRippleInFlightRef.current = false;
    keyboardRippleInFlightRef.current = false;
    pointerOverlayPressedInFlightRef.current = false;
    keyboardOverlayPressedInFlightRef.current = false;
    hasPointerDownFeedbackRef.current = false;
    pointerDownFeedbackRef.current = null;
    hasPreClickFeedbackRef.current = false;
    pendingClickFeedbackRef.current = 'pressed';

    rippleDurationRef.current = null;
    rippleReleaseRatioRef.current = 1;
    rippleFadeDelayRef.current = 50;
    rippleFadeDurationRef.current = 100;

    const target = buttonRef.current;
    if (target) clearRippleInlineVars(target);
  }, [clearAllTimers, clearRippleInlineVars, rippleMode]);

  useEffect(() => {
    if (!shouldForceOverlayPressed || !rippleMode) return;

    const target = buttonRef.current;
    if (!target) return;

    // Persistent showcase state uses center to simulate "currently pressed".
    applyOverlayPressed(target);
  }, [applyOverlayPressed, rippleMode, shouldForceOverlayPressed]);

  const previousShouldForceOverlayPressedRef = useRef(false);
  useEffect(() => {
    if (previousShouldForceOverlayPressedRef.current && !shouldForceOverlayPressed) {
      const target = buttonRef.current;
      if (target) clearRippleInlineVars(target);
      setIsRippleActive(false);
      setIsRippleFading(false);
      setIsOverlayRippleActive(false);
    }
    previousShouldForceOverlayPressedRef.current = shouldForceOverlayPressed;
  }, [clearRippleInlineVars, shouldForceOverlayPressed]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const resetPointerDownFeedback = () => {
        hasPointerDownFeedbackRef.current = false;
        pointerDownFeedbackRef.current = null;
      };

      if (isDisabled === true) {
        resetPointerDownFeedback();
        return;
      }

      const touchSourcedClick = isTouchSourcedClick(event);
      const clickFeedback: RippleInputFeedback = (() => {
        if (hasPointerDownFeedbackRef.current) {
          const pointerFeedback = pointerDownFeedbackRef.current ?? pendingClickFeedbackRef.current;
          // Pointerdown can be stale right after DevTools modality switch.
          // If click is explicitly non-touch-sourced, prefer mouse profile for this interaction.
          if (
            touchSourcedClick === false &&
            pointerFeedback === 'ripple' &&
            mouseInputFeedback === 'pressed'
          ) {
            return 'pressed';
          }
          return pointerFeedback;
        }

        if (pendingClickFeedbackRef.current === 'pressed' && touchSourcedClick === true) {
          return 'ripple';
        }

        return pendingClickFeedbackRef.current;
      })();

      const shouldStartOverlayFromClick =
        Boolean(rippleMode) &&
        clickFeedback === 'pressed' &&
        pressedVisual === 'overlay' &&
        !hasPreClickFeedbackRef.current;
      if (shouldStartOverlayFromClick) {
        const started = startOverlayPressed(event.currentTarget);
        if (started) {
          // Mouse/trackpad click should respect minimum hold; keyboard click (detail=0) should not.
          const minHoldMs = event.detail > 0 ? MIN_POINTER_CLICK_HOLD_MS : 0;
          scheduleRippleFade(minHoldMs);
        }
      }

      const shouldUsePressed =
        !rippleMode || (clickFeedback === 'pressed' && pressedVisual !== 'overlay');
      if (allowPressedFeedback && shouldUsePressed) {
        triggerPressed();
      }

      hasPreClickFeedbackRef.current = false;
      pendingClickFeedbackRef.current = 'pressed';
      resetPointerDownFeedback();
      onClick?.(event);
    },
    [
      allowPressedFeedback,
      isDisabled,
      mouseInputFeedback,
      onClick,
      pressedVisual,
      rippleMode,
      scheduleRippleFade,
      startOverlayPressed,
      triggerPressed
    ]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented) return;

      const target = event.currentTarget;
      const feedback: RippleInputFeedback = isTouchLikePointer(event.pointerType)
        ? 'ripple'
        : mouseInputFeedback;
      const shouldUseOverlayPressed = feedback === 'pressed' && pressedVisual === 'overlay';

      pendingClickFeedbackRef.current = feedback;
      hasPointerDownFeedbackRef.current = true;
      pointerDownFeedbackRef.current = feedback;
      hasPreClickFeedbackRef.current = false;
      pointerRippleInFlightRef.current = false;
      pointerOverlayPressedInFlightRef.current = false;

      trySetPointerCapture(target, event.pointerId);

      if (feedback === 'ripple') {
        pointerRippleInFlightRef.current = startRipple(target, {
          clientX: event.clientX,
          clientY: event.clientY
        });
        hasPreClickFeedbackRef.current = pointerRippleInFlightRef.current;
      } else if (shouldUseOverlayPressed) {
        pointerOverlayPressedInFlightRef.current = startOverlayPressed(target);
        hasPreClickFeedbackRef.current = pointerOverlayPressedInFlightRef.current;
      }
    },
    [mouseInputFeedback, onPointerDown, pressedVisual, startOverlayPressed, startRipple]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerUp?.(event);
      tryReleasePointerCapture(event.currentTarget, event.pointerId);
      finalizePointerFeedback(event.pointerType);
      hasPointerDownFeedbackRef.current = false;
      pointerDownFeedbackRef.current = null;
    },
    [finalizePointerFeedback, onPointerUp]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerCancel?.(event);
      tryReleasePointerCapture(event.currentTarget, event.pointerId);
      finalizePointerFeedback(event.pointerType, { resetPendingFeedback: true });
      hasPointerDownFeedbackRef.current = false;
      pointerDownFeedbackRef.current = null;
    },
    [finalizePointerFeedback, onPointerCancel]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.repeat) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;

      pendingClickFeedbackRef.current = keyboardInputFeedback;
      hasPreClickFeedbackRef.current = false;
      keyboardRippleInFlightRef.current = false;
      keyboardOverlayPressedInFlightRef.current = false;

      const shouldUseOverlayPressed =
        keyboardInputFeedback === 'pressed' && pressedVisual === 'overlay';
      if (keyboardInputFeedback === 'ripple') {
        keyboardRippleInFlightRef.current = startRipple(event.currentTarget, {
          originOverride: 'center'
        });
        hasPreClickFeedbackRef.current = keyboardRippleInFlightRef.current;
      } else if (shouldUseOverlayPressed) {
        keyboardOverlayPressedInFlightRef.current = startOverlayPressed(event.currentTarget);
        hasPreClickFeedbackRef.current = keyboardOverlayPressedInFlightRef.current;
      }
    },
    [keyboardInputFeedback, onKeyDown, pressedVisual, startOverlayPressed, startRipple]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyUp?.(event);
      if (event.key !== 'Enter' && event.key !== ' ') return;
      finalizeKeyboardFeedback();
    },
    [finalizeKeyboardFeedback, onKeyUp]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLButtonElement>) => {
      onBlur?.(event);
      if (event.defaultPrevented) return;

      finalizeKeyboardFeedback();
      hasPreClickFeedbackRef.current = false;
      pendingClickFeedbackRef.current = 'pressed';
    },
    [finalizeKeyboardFeedback, onBlur]
  );

  return {
    buttonRef,
    isRippleActive,
    isRippleFading,
    isOverlayRippleActive,
    handleClick,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown,
    handleKeyUp,
    handleBlur
  };
}
// [RIPPLE EFFECT 22] END: Ripple runtime state machine and interaction handlers.
