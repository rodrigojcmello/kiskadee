import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackOrigin,
  ActivationFeedbackProfileMode
} from '@kiskadee/core';
import {
  resolveActivationFeedbackDurationMs,
  resolveActivationFeedbackProfile
} from '@kiskadee/core';
import type {
  FocusEvent,
  MouseEvent,
  PointerEvent,
  RefObject
} from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tryReleasePointerCapture, trySetPointerCapture } from './pointerCapture.ts';

type UseActivationFeedbackHaloArgs<
  TPointerElement extends HTMLElement,
  THostElement extends HTMLElement
> = {
  capturePointer?: boolean;
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  enabled: boolean;
  forcedActive?: boolean;
  geometry?: 'host' | 'profile-size';
  hostRef?: RefObject<THostElement | null>;
  minPointerHoldMs?: number;
  onBlur?: (event: FocusEvent<TPointerElement>) => void;
  onPointerCancel?: (event: PointerEvent<TPointerElement>) => void;
  onPointerDown?: (event: PointerEvent<TPointerElement>) => void;
  onPointerUp?: (event: PointerEvent<TPointerElement>) => void;
  origin?: ActivationFeedbackOrigin;
  profile?: ActivationFeedbackProfileMode;
  readOnly?: boolean;
  shouldStartPointerFeedback?: (event: PointerEvent<TPointerElement>) => boolean;
};

export function useActivationFeedbackHalo<
  TPointerElement extends HTMLElement = HTMLElement,
  THostElement extends HTMLElement = TPointerElement
>({
  capturePointer = true,
  config,
  disabled,
  enabled,
  forcedActive,
  geometry = 'host',
  hostRef,
  minPointerHoldMs = 0,
  onBlur,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  origin = 'pointer',
  profile = 'halo',
  readOnly,
  shouldStartPointerFeedback
}: UseActivationFeedbackHaloArgs<TPointerElement, THostElement>) {
  const [isActive, setIsActive] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uncapturedPointerCleanupRef = useRef<(() => void) | null>(null);
  const startedAtRef = useRef<number>(0);
  const pointerInFlightRef = useRef(false);
  const isInteractionDisabled = disabled || readOnly || !enabled;
  const isForcedActive = enabled && forcedActive === true && !disabled;

  const runtimeConfig = useMemo(() => {
    const profileConfig = resolveActivationFeedbackProfile(profile, { config });
    return {
      durationMs: resolveActivationFeedbackDurationMs(profileConfig.durationToken, 0),
      fadeDelayMs: resolveActivationFeedbackDurationMs(profileConfig.fade?.delayToken, 50),
      fadeDurationMs: resolveActivationFeedbackDurationMs(profileConfig.fade?.durationToken, 100),
      sizePx:
        typeof profileConfig.size === 'number' && profileConfig.size > 0
          ? profileConfig.size
          : null
    };
  }, [config, profile]);

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
  }, []);

  const clearOriginVars = useCallback(() => {
    const host = hostRef?.current ?? null;
    if (!host) return;

    host.style.removeProperty('--k-af-x');
    host.style.removeProperty('--k-af-y');
  }, [hostRef]);

  const clearGeometryVars = useCallback(() => {
    const host = hostRef?.current;
    if (!host) return;

    host.style.removeProperty('--k-af-start-size');
    host.style.removeProperty('--k-af-end-size');
    host.style.removeProperty('--k-af-host-width');
    host.style.removeProperty('--k-af-host-height');
    host.style.removeProperty('--k-af-host-radius');
  }, [hostRef]);

  const applyOriginVars = useCallback(
    (event?: PointerEvent<TPointerElement> | MouseEvent<TPointerElement>) => {
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

    const size =
      geometry === 'profile-size' && runtimeConfig.sizePx !== null
        ? runtimeConfig.sizePx
        : Math.max(rect.width, rect.height);
    const hostStyle = window.getComputedStyle(host);
    host.style.setProperty('--k-af-start-size', `${size}px`);
    host.style.setProperty('--k-af-end-size', `${size}px`);
    host.style.setProperty('--k-af-host-width', `${rect.width}px`);
    host.style.setProperty('--k-af-host-height', `${rect.height}px`);
    host.style.setProperty('--k-af-host-radius', hostStyle.borderTopLeftRadius);
    return true;
  }, [geometry, hostRef, runtimeConfig.sizePx]);

  const applyStaticFeedback = useCallback(
    (event?: PointerEvent<TPointerElement> | MouseEvent<TPointerElement>) => {
      clearGeometryVars();
      clearOriginVars();
      applyOriginVars(event);
      if (applyStaticGeometryVars()) return true;

      clearGeometryVars();
      clearOriginVars();
      return false;
    },
    [applyOriginVars, applyStaticGeometryVars, clearGeometryVars, clearOriginVars]
  );

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

  const start = useCallback(
    (event?: PointerEvent<TPointerElement> | MouseEvent<TPointerElement>) => {
      if (isInteractionDisabled || isForcedActive) return false;
      if (hostRef && !hostRef.current) return false;

      clearTimers();
      if (!applyStaticFeedback(event)) return false;
      startedAtRef.current = Date.now();
      setIsFading(false);
      setIsActive(true);

      return true;
    },
    [
      applyStaticFeedback,
      clearTimers,
      hostRef,
      isForcedActive,
      isInteractionDisabled
    ]
  );

  const finish = useCallback(
    (minHoldMs = 0) => {
      const elapsedMs = Math.max(0, Date.now() - startedAtRef.current);
      const remainingDurationMs = Math.max(0, runtimeConfig.durationMs - elapsedMs);
      const remainingMs = Math.max(remainingDurationMs, minHoldMs);

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
    () => {
      if (!pointerInFlightRef.current) return;
      pointerInFlightRef.current = false;
      finish(minPointerHoldMs);
    },
    [finish, minPointerHoldMs]
  );

  const trigger = useCallback(
    (
      event?: PointerEvent<TPointerElement> | MouseEvent<TPointerElement>,
      minHoldMs = minPointerHoldMs
    ) => {
      if (!start(event)) return false;
      finish(minHoldMs);
      return true;
    },
    [finish, minPointerHoldMs, start]
  );

  const registerUncapturedPointerEnd = useCallback(
    (pointerId: number) => {
      clearUncapturedPointerListeners();
      if (typeof window === 'undefined') return;

      const handlePointerEnd = (event: globalThis.PointerEvent) => {
        if (event.pointerId !== pointerId) return;

        if (event.type === 'pointercancel') {
          cancel();
        } else {
          finalizePointerFeedback();
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
    if (!isInteractionDisabled || isForcedActive) return;
    cancel();
  }, [cancel, isForcedActive, isInteractionDisabled]);

  useEffect(() => {
    if (!isForcedActive) return;

    let animationFrame: number | null = null;
    const host = hostRef?.current;

    const applyForcedFeedback = () => {
      clearTimers();
      clearUncapturedPointerListeners();
      resetInFlight();

      if (!applyStaticFeedback()) {
        setIsActive(false);
        setIsFading(false);
        return;
      }

      setIsFading(false);
      setIsActive(true);
    };

    applyForcedFeedback();

    const resizeObserver =
      host && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (animationFrame !== null) return;
            animationFrame = window.requestAnimationFrame(() => {
              animationFrame = null;
              applyForcedFeedback();
            });
          })
        : null;

    if (resizeObserver && host) {
      resizeObserver.observe(host);
    }

    return () => {
      resizeObserver?.disconnect();
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      clearGeometryVars();
      clearOriginVars();
      setIsActive(false);
      setIsFading(false);
    };
  }, [
    applyStaticFeedback,
    clearGeometryVars,
    clearOriginVars,
    clearTimers,
    clearUncapturedPointerListeners,
    hostRef,
    isForcedActive,
    resetInFlight
  ]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || isInteractionDisabled || isForcedActive) return;
      if (event.button !== 0 || event.isPrimary === false) return;
      if (shouldStartPointerFeedback?.(event) === false) return;

      const started = start(event);
      pointerInFlightRef.current = started;
      if (!started) return;

      if (capturePointer) {
        trySetPointerCapture(event.currentTarget, event.pointerId);
      } else {
        registerUncapturedPointerEnd(event.pointerId);
      }
    },
    [
      capturePointer,
      isForcedActive,
      isInteractionDisabled,
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
      finalizePointerFeedback();
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

  const handleBlur = useCallback(
    (event: FocusEvent<TPointerElement>) => {
      onBlur?.(event);
      if (event.defaultPrevented) return;
      cancel();
    },
    [cancel, onBlur]
  );

  return {
    cancel,
    handleBlur,
    handlePointerCancel,
    handlePointerDown,
    handlePointerUp,
    isActive: isForcedActive || isActive,
    isFading: isForcedActive ? false : isFading,
    trigger
  };
}
