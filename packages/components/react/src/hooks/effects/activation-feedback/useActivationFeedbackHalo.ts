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
import { useIsomorphicLayoutEffect } from '../../../shared/utils/useIsomorphicLayoutEffect.ts';
import { tryReleasePointerCapture, trySetPointerCapture } from './pointerCapture.ts';

export type ActivationFeedbackStaticGeometry = {
  height: number;
  outlineRadius?: string;
  radius: string;
  size: number;
  width: number;
};

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
  geometryKey?: string | number;
  hostRef?: RefObject<THostElement | null>;
  minPointerHoldMs?: number;
  onBlur?: (event: FocusEvent<TPointerElement>) => void;
  onPointerCancel?: (event: PointerEvent<TPointerElement>) => void;
  onPointerDown?: (event: PointerEvent<TPointerElement>) => void;
  onPointerUp?: (event: PointerEvent<TPointerElement>) => void;
  origin?: ActivationFeedbackOrigin;
  profile?: ActivationFeedbackProfileMode;
  readOnly?: boolean;
  resolveStaticGeometry?: (
    hostElement: THostElement
  ) => ActivationFeedbackStaticGeometry | null;
  shouldStartPointerFeedback?: (event: PointerEvent<TPointerElement>) => boolean;
};

function isValidStaticGeometry(
  geometry: ActivationFeedbackStaticGeometry | null
): geometry is ActivationFeedbackStaticGeometry {
  return (
    geometry !== null &&
    geometry.width > 0 &&
    geometry.height > 0 &&
    geometry.size > 0 &&
    geometry.radius.length > 0
  );
}

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
  geometryKey,
  hostRef,
  minPointerHoldMs = 0,
  onBlur,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  origin = 'pointer',
  profile = 'halo',
  readOnly,
  resolveStaticGeometry,
  shouldStartPointerFeedback
}: UseActivationFeedbackHaloArgs<TPointerElement, THostElement>) {
  const [isActive, setIsActive] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStaticGeometryRef = useRef<ActivationFeedbackStaticGeometry | null>(null);
  const isInteractionDisabled = disabled || readOnly || !enabled;
  const isForcedActive = enabled && forcedActive === true && !disabled;

  const runtimeConfig = useMemo(() => {
    const profileConfig = resolveActivationFeedbackProfile(profile, { config });
    return {
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

  const clearOriginVars = useCallback(() => {
    const host = hostRef?.current ?? null;
    if (!host) return;

    host.style.removeProperty('--k-af-x');
    host.style.removeProperty('--k-af-y');
  }, [hostRef]);

  const clearGeometryVars = useCallback(() => {
    const host = hostRef?.current;
    lastStaticGeometryRef.current = null;
    if (!host) return;

    host.style.removeProperty('--k-af-start-size');
    host.style.removeProperty('--k-af-end-size');
    host.style.removeProperty('--k-af-host-width');
    host.style.removeProperty('--k-af-host-height');
    host.style.removeProperty('--k-af-host-radius');
    host.style.removeProperty('--k-af-outline-radius');
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

  const writeStaticGeometryVars = useCallback(
    (host: THostElement, staticGeometry: ActivationFeedbackStaticGeometry) => {
      host.style.setProperty('--k-af-start-size', `${staticGeometry.size}px`);
      host.style.setProperty('--k-af-end-size', `${staticGeometry.size}px`);
      host.style.setProperty('--k-af-host-width', `${staticGeometry.width}px`);
      host.style.setProperty('--k-af-host-height', `${staticGeometry.height}px`);
      host.style.setProperty('--k-af-host-radius', staticGeometry.radius);
      if (staticGeometry.outlineRadius !== undefined) {
        host.style.setProperty('--k-af-outline-radius', staticGeometry.outlineRadius);
      } else if (Number.parseFloat(staticGeometry.radius) <= 0) {
        host.style.setProperty('--k-af-outline-radius', '0px');
      } else {
        host.style.removeProperty('--k-af-outline-radius');
      }
      lastStaticGeometryRef.current = staticGeometry;
    },
    []
  );

  const measureStaticGeometryVars = useCallback((): ActivationFeedbackStaticGeometry | null => {
    const host = hostRef?.current;
    if (!host) return null;

    const rect = host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const hostStyle = window.getComputedStyle(host);
    const staticGeometry =
      resolveStaticGeometry?.(host) ?? {
        height: rect.height,
        radius: hostStyle.borderTopLeftRadius,
        size:
          geometry === 'profile-size' && runtimeConfig.sizePx !== null
            ? runtimeConfig.sizePx
            : Math.max(rect.width, rect.height),
        width: rect.width
      };

    return isValidStaticGeometry(staticGeometry) ? staticGeometry : null;
  }, [geometry, hostRef, resolveStaticGeometry, runtimeConfig.sizePx]);

  const syncStaticGeometryVars = useCallback((): boolean => {
    const host = hostRef?.current;
    if (!host) {
      lastStaticGeometryRef.current = null;
      return false;
    }

    const staticGeometry = measureStaticGeometryVars();
    if (!isValidStaticGeometry(staticGeometry)) return false;

    writeStaticGeometryVars(host, staticGeometry);
    return true;
  }, [hostRef, measureStaticGeometryVars, writeStaticGeometryVars]);

  const applyCachedStaticGeometryVars = useCallback((): boolean => {
    const host = hostRef?.current;
    if (!host) return true;

    const staticGeometry = lastStaticGeometryRef.current;
    if (!isValidStaticGeometry(staticGeometry)) return false;

    writeStaticGeometryVars(host, staticGeometry);
    return true;
  }, [hostRef, writeStaticGeometryVars]);

  const applyStaticFeedback = useCallback(
    (event?: PointerEvent<TPointerElement> | MouseEvent<TPointerElement>) => {
      applyOriginVars(event);
      if (applyCachedStaticGeometryVars()) return true;

      clearOriginVars();
      return false;
    },
    [applyOriginVars, applyCachedStaticGeometryVars, clearOriginVars]
  );

  const cancel = useCallback(() => {
    clearTimers();
    clearOriginVars();
    setIsActive(false);
    setIsFading(false);
  }, [clearOriginVars, clearTimers]);

  const start = useCallback(
    (event?: PointerEvent<TPointerElement> | MouseEvent<TPointerElement>) => {
      if (isInteractionDisabled || isForcedActive) return false;
      if (hostRef && !hostRef.current) return false;

      if (!applyStaticFeedback(event)) return false;
      clearTimers();
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
      const remainingMs = Math.max(0, minHoldMs);
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
          clearOriginVars();
          setIsActive(false);
          setIsFading(false);
          feedbackTimeoutRef.current = null;
        },
        remainingMs + runtimeConfig.fadeDelayMs + runtimeConfig.fadeDurationMs
      );
    },
    [clearOriginVars, runtimeConfig]
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

  useEffect(
    () => () => {
      clearTimers();
      clearGeometryVars();
      clearOriginVars();
    },
    [
      clearGeometryVars,
      clearOriginVars,
      clearTimers
    ]
  );

  useEffect(() => {
    if (!isInteractionDisabled || isForcedActive) return;
    cancel();
  }, [cancel, isForcedActive, isInteractionDisabled]);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;

    let animationFrame: number | null = null;
    const host = hostRef?.current;
    const syncGeometry = () => {
      syncStaticGeometryVars();
    };
    const scheduleGeometrySync = () => {
      if (animationFrame !== null) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        syncGeometry();
      });
    };
    const resizeObserver =
      host && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleGeometrySync)
        : null;
    const handleHostTransitionEnd = (event: TransitionEvent) => {
      if (
        !event.propertyName.includes('radius') &&
        event.propertyName !== 'width' &&
        event.propertyName !== 'height'
      ) {
        return;
      }

      syncGeometry();
    };

    syncGeometry();
    if (host) {
      resizeObserver?.observe(host);
      host.addEventListener('transitionend', handleHostTransitionEnd);
    }
    scheduleGeometrySync();

    return () => {
      resizeObserver?.disconnect();
      host?.removeEventListener('transitionend', handleHostTransitionEnd);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [
    enabled,
    geometryKey,
    hostRef,
    syncStaticGeometryVars
  ]);

  useEffect(() => {
    if (!isForcedActive) return;

    const applyForcedFeedback = () => {
      clearTimers();

      if (!applyStaticFeedback()) {
        setIsActive(false);
        setIsFading(false);
        return;
      }

      setIsFading(false);
      setIsActive(true);
    };

    applyForcedFeedback();

    return () => {
      clearOriginVars();
      setIsActive(false);
      setIsFading(false);
    };
  }, [
    applyStaticFeedback,
    clearOriginVars,
    clearTimers,
    geometryKey,
    hostRef,
    isForcedActive
  ]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || isInteractionDisabled || isForcedActive) return;
      if (event.button !== 0 || event.isPrimary === false) return;
      if (shouldStartPointerFeedback?.(event) === false) return;

      const started = trigger(event, minPointerHoldMs);
      if (!started) return;

      if (capturePointer) {
        trySetPointerCapture(event.currentTarget, event.pointerId);
      }
    },
    [
      capturePointer,
      isForcedActive,
      isInteractionDisabled,
      minPointerHoldMs,
      onPointerDown,
      shouldStartPointerFeedback,
      trigger
    ]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerUp?.(event);
      tryReleasePointerCapture(event.currentTarget, event.pointerId);
    },
    [onPointerUp]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerCancel?.(event);
      tryReleasePointerCapture(event.currentTarget, event.pointerId);
    },
    [onPointerCancel]
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
