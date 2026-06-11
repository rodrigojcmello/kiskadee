import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackOrigin,
  ActivationFeedbackProfile,
  ActivationFeedbackProfileConfig
} from '@kiskadee/core';
import {
  resolveActivationFeedbackDurationMs,
  resolveActivationFeedbackProfile,
  resolvePressedActivationFeedbackProfile,
  usesActivationFeedbackOverflowGeometry
} from '@kiskadee/core';
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { tryReleasePointerCapture, trySetPointerCapture } from './pointerCapture.ts';

type ActivationFeedbackRadialProfile = Extract<
  ActivationFeedbackProfile,
  'ripple' | 'ripple-overflow' | 'halo'
>;

export type { ActivationFeedbackOrigin } from '@kiskadee/core';

export type ActivationFeedbackRadialCssVars = {
  endSize: string;
  startSize: string;
  x: string;
  y: string;
};

const DEFAULT_ACTIVATION_FEEDBACK_RADIAL_CSS_VARS: ActivationFeedbackRadialCssVars = {
  endSize: '--k-af-end-size',
  startSize: '--k-af-start-size',
  x: '--k-af-x',
  y: '--k-af-y'
};

// Shared radial activation-feedback runtime state machine and interaction handlers.
export type ActivationFeedbackRadialRuntimeConfig = {
  size: number | 'auto';
  durationMs: number;
  releaseRatio: number;
  fadeDelayMs: number;
  fadeDurationMs: number;
  startSizePx: number;
};

export type ActivationFeedbackRadialRuntimeConfigOptions = {
  fallbackDurationMs: number;
  isOverflowProfile: boolean;
  startSizePx?: number;
};

export function resolveActivationFeedbackRadialRuntimeConfig(
  profileConfig: ActivationFeedbackProfileConfig,
  {
    fallbackDurationMs,
    isOverflowProfile,
    startSizePx = 18
  }: ActivationFeedbackRadialRuntimeConfigOptions
): ActivationFeedbackRadialRuntimeConfig {
  const configuredSize =
    profileConfig.size === 'auto'
      ? 'auto'
      : typeof profileConfig.size === 'number' && profileConfig.size > 0
        ? profileConfig.size
        : 'auto';

  return {
    size: configuredSize,
    durationMs: resolveActivationFeedbackDurationMs(
      profileConfig.durationToken,
      fallbackDurationMs
    ),
    releaseRatio: isOverflowProfile && profileConfig.animateSize ? 0.8 : 1,
    fadeDelayMs: resolveActivationFeedbackDurationMs(profileConfig.fade?.delayToken, 50),
    fadeDurationMs: resolveActivationFeedbackDurationMs(profileConfig.fade?.durationToken, 100),
    startSizePx
  };
}

export function resolveActivationFeedbackProfileRadialRuntimeConfig({
  config,
  fallbackDurationMs,
  profile
}: {
  config?: ActivationFeedbackEffectSchema;
  fallbackDurationMs: number;
  profile: ActivationFeedbackProfile;
}): ActivationFeedbackRadialRuntimeConfig {
  return resolveActivationFeedbackRadialRuntimeConfig(
    resolveActivationFeedbackProfile(profile, { config }),
    {
      fallbackDurationMs,
      isOverflowProfile: usesActivationFeedbackOverflowGeometry(profile)
    }
  );
}

export function resolvePressedActivationFeedbackRadialRuntimeConfig({
  config,
  fallbackDurationMs = 0
}: {
  config?: ActivationFeedbackEffectSchema;
  fallbackDurationMs?: number;
}): ActivationFeedbackRadialRuntimeConfig {
  return resolveActivationFeedbackRadialRuntimeConfig(
    resolvePressedActivationFeedbackProfile({ config }),
    {
      fallbackDurationMs,
      isOverflowProfile: usesActivationFeedbackOverflowGeometry('pressed')
    }
  );
}

type ActivationFeedbackRadialExternalHandlers<
  TPointerElement extends HTMLElement,
  TKeyboardElement extends HTMLElement
> = {
  onClick?: (event: MouseEvent<TPointerElement>) => void;
  onPointerDown?: (event: PointerEvent<TPointerElement>) => void;
  onPointerUp?: (event: PointerEvent<TPointerElement>) => void;
  onPointerCancel?: (event: PointerEvent<TPointerElement>) => void;
  onKeyDown?: (event: KeyboardEvent<TKeyboardElement>) => void;
  onKeyUp?: (event: KeyboardEvent<TKeyboardElement>) => void;
  onBlur?: (event: FocusEvent<TPointerElement>) => void;
  onKeyboardBlur?: (event: FocusEvent<TKeyboardElement>) => void;
};

type UseActivationFeedbackRadialStateMachineArgs<
  TPointerElement extends HTMLElement,
  THostElement extends HTMLElement,
  TKeyboardElement extends HTMLElement
> = ActivationFeedbackRadialExternalHandlers<TPointerElement, TKeyboardElement> & {
  effectProfile: ActivationFeedbackRadialProfile | null;
  hostRef?: RefObject<THostElement | null>;
  isDisabled: boolean | undefined;
  localActivationFeedbackOrigin: ActivationFeedbackOrigin | undefined;
  globalActivationFeedbackOrigin: ActivationFeedbackOrigin;
  modeActivationFeedbackRadialRuntimeConfig: ActivationFeedbackRadialRuntimeConfig | null;
  minPointerHoldMs?: number;
  pressedActivationFeedbackRadialRuntimeConfig: ActivationFeedbackRadialRuntimeConfig;
  shouldForceOverlayPressed: boolean;
  allowPressedFeedback: boolean;
  capturePointer?: boolean;
  triggerPressed: () => void;
  cssVars?: Partial<ActivationFeedbackRadialCssVars>;
  shouldStartPointerFeedback?: (event: PointerEvent<TPointerElement>) => boolean;
};

const MIN_POINTER_CLICK_HOLD_MS = 120;

// Radial feedback writes CSS custom properties directly on the host node on purpose.
// This avoids React render churn during pointer interactions and keeps
// animation timing stable. The tradeoff is imperative DOM state, so cleanup is
// mandatory and centralized via clearAllTimers + clearFeedbackInlineVars.
const isTouchLikePointer = (pointerType: string): boolean =>
  pointerType === 'touch' || pointerType === 'pen';

export function useActivationFeedbackRadialStateMachine<
  TPointerElement extends HTMLElement = HTMLElement,
  THostElement extends HTMLElement = TPointerElement,
  TKeyboardElement extends HTMLElement = TPointerElement
>({
  effectProfile,
  hostRef: externalHostRef,
  isDisabled,
  localActivationFeedbackOrigin,
  globalActivationFeedbackOrigin,
  modeActivationFeedbackRadialRuntimeConfig,
  minPointerHoldMs = MIN_POINTER_CLICK_HOLD_MS,
  pressedActivationFeedbackRadialRuntimeConfig,
  shouldForceOverlayPressed,
  allowPressedFeedback,
  capturePointer = true,
  triggerPressed,
  cssVars,
  shouldStartPointerFeedback,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  onKeyboardBlur
}: UseActivationFeedbackRadialStateMachineArgs<
  TPointerElement,
  THostElement,
  TKeyboardElement
>) {
  const [isFeedbackActive, setIsFeedbackActive] = useState(false);
  const [isFeedbackFading, setIsFeedbackFading] = useState(false);
  const [isOverlayFeedbackActive, setIsOverlayFeedbackActive] = useState(false);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackFrameRef = useRef<number | null>(null);
  const internalHostRef = useRef<THostElement | null>(null);
  const hostRef = externalHostRef ?? internalHostRef;
  const feedbackStartTimeRef = useRef<number | null>(null);
  const feedbackDurationRef = useRef<number | null>(null);
  const feedbackReleaseRatioRef = useRef<number>(1);
  const feedbackFadeDelayRef = useRef<number>(50);
  const feedbackFadeDurationRef = useRef<number>(100);
  const hasPreClickFeedbackRef = useRef(false);
  const pointerFeedbackInFlightRef = useRef(false);
  const uncapturedPointerCleanupRef = useRef<(() => void) | null>(null);
  const resolvedCssVars = useMemo<ActivationFeedbackRadialCssVars>(
    () => ({
      ...DEFAULT_ACTIVATION_FEEDBACK_RADIAL_CSS_VARS,
      ...cssVars
    }),
    [cssVars]
  );

  // Pass cssVars as a stable reference; inline objects intentionally produce a new var map.
  const clearFeedbackInlineVars = useCallback((target: THostElement) => {
    // Required counterpart for imperative style.setProperty writes.
    // Prevents stale geometry when the interaction mode changes between pointer/keyboard/programmatic.
    target.style.removeProperty(resolvedCssVars.x);
    target.style.removeProperty(resolvedCssVars.y);
    target.style.removeProperty(resolvedCssVars.endSize);
    target.style.removeProperty(resolvedCssVars.startSize);
  }, [resolvedCssVars]);

  const resolveFeedbackHost = useCallback(
    (fallbackElement: HTMLElement): THostElement | null => {
      if (hostRef.current) return hostRef.current;
      if (externalHostRef) return null;
      return fallbackElement as THostElement;
    },
    [externalHostRef, hostRef]
  );

  const clearAllTimers = useCallback(() => {
    // Single cleanup choke-point for all in-flight feedback scheduling.
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    if (feedbackFadeTimeoutRef.current) {
      clearTimeout(feedbackFadeTimeoutRef.current);
      feedbackFadeTimeoutRef.current = null;
    }
    if (feedbackFrameRef.current !== null) {
      cancelAnimationFrame(feedbackFrameRef.current);
      feedbackFrameRef.current = null;
    }
  }, []);

  const clearUncapturedPointerListeners = useCallback(() => {
    uncapturedPointerCleanupRef.current?.();
    uncapturedPointerCleanupRef.current = null;
  }, []);

  const resolveFeedbackEndSize = useCallback(
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
    (target: THostElement): boolean => {
      if (!effectProfile) return false;

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      clearFeedbackInlineVars(target);

      const x = rect.width / 2;
      const y = rect.height / 2;
      const size = resolveFeedbackEndSize(rect, x, y, pressedActivationFeedbackRadialRuntimeConfig.size);

      // Imperative CSS var writes are intentional for per-interaction animation perf.
      target.style.setProperty(resolvedCssVars.x, `${x}px`);
      target.style.setProperty(resolvedCssVars.y, `${y}px`);
      target.style.setProperty(resolvedCssVars.endSize, `${size}px`);
      target.style.setProperty(resolvedCssVars.startSize, `${size}px`);

      feedbackStartTimeRef.current = Date.now();
      feedbackDurationRef.current = pressedActivationFeedbackRadialRuntimeConfig.durationMs;
      feedbackReleaseRatioRef.current = pressedActivationFeedbackRadialRuntimeConfig.releaseRatio;
      feedbackFadeDelayRef.current = pressedActivationFeedbackRadialRuntimeConfig.fadeDelayMs;
      feedbackFadeDurationRef.current = pressedActivationFeedbackRadialRuntimeConfig.fadeDurationMs;

      setIsOverlayFeedbackActive(true);
      setIsFeedbackActive(true);
      setIsFeedbackFading(false);
      return true;
    },
    [
      clearFeedbackInlineVars,
      pressedActivationFeedbackRadialRuntimeConfig,
      resolveFeedbackEndSize,
      effectProfile,
      resolvedCssVars
    ]
  );

  const startFeedback = useCallback(
    (
      target: THostElement,
      opts?: { originOverride?: ActivationFeedbackOrigin; clientX?: number; clientY?: number }
    ): boolean => {
      if (!effectProfile || isDisabled === true) return false;
      if (!modeActivationFeedbackRadialRuntimeConfig) return false;

      // Ensure we read base feedback vars even if a previous interaction left overlay class active.
      clearFeedbackInlineVars(target);

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      const origin =
        opts?.originOverride ?? localActivationFeedbackOrigin ?? globalActivationFeedbackOrigin;

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

      const size = resolveFeedbackEndSize(rect, x, y, modeActivationFeedbackRadialRuntimeConfig.size);
      const startSize = `${modeActivationFeedbackRadialRuntimeConfig.startSizePx}px`;

      // Imperative CSS var writes are intentional for per-interaction animation perf.
      target.style.setProperty(resolvedCssVars.x, `${x}px`);
      target.style.setProperty(resolvedCssVars.y, `${y}px`);
      target.style.setProperty(resolvedCssVars.endSize, `${size}px`);
      target.style.setProperty(resolvedCssVars.startSize, startSize);

      clearAllTimers();

      setIsOverlayFeedbackActive(false);
      setIsFeedbackFading(false);
      setIsFeedbackActive(false);

      feedbackStartTimeRef.current = Date.now();
      feedbackDurationRef.current = modeActivationFeedbackRadialRuntimeConfig.durationMs;
      feedbackReleaseRatioRef.current = modeActivationFeedbackRadialRuntimeConfig.releaseRatio;
      feedbackFadeDelayRef.current = modeActivationFeedbackRadialRuntimeConfig.fadeDelayMs;
      feedbackFadeDurationRef.current = modeActivationFeedbackRadialRuntimeConfig.fadeDurationMs;

      // One frame separation is enough to restart the feedback transition
      // without forcing synchronous layout.
      feedbackFrameRef.current = requestAnimationFrame(() => {
        setIsFeedbackActive(true);
      });
      return true;
    },
    [
      clearAllTimers,
      clearFeedbackInlineVars,
      globalActivationFeedbackOrigin,
      isDisabled,
      localActivationFeedbackOrigin,
      modeActivationFeedbackRadialRuntimeConfig,
      resolveFeedbackEndSize,
      effectProfile,
      resolvedCssVars
    ]
  );

  const scheduleFeedbackFade = useCallback(
    (minHoldMs = 0) => {
      if (!effectProfile) return;
      const target = hostRef.current;
      if (!target) return;

      const durationMs = feedbackDurationRef.current ?? 0;
      const releaseRatio = feedbackReleaseRatioRef.current;
      const removalDelayMs = Math.max(0, Math.round(durationMs * releaseRatio));
      const feedbackFadeDelayMs = feedbackFadeDelayRef.current;
      const feedbackFadeDurationMs = feedbackFadeDurationRef.current;
      const startMs = feedbackStartTimeRef.current ?? Date.now();
      const elapsedMs = Math.max(0, Date.now() - startMs);
      const remainingByProfileMs = Math.max(0, removalDelayMs - elapsedMs);
      const remainingByMinHoldMs = Math.max(0, minHoldMs - elapsedMs);
      const remainingMs = Math.max(remainingByProfileMs, remainingByMinHoldMs);

      if (feedbackFadeTimeoutRef.current) {
        clearTimeout(feedbackFadeTimeoutRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }

      feedbackFadeTimeoutRef.current = setTimeout(() => {
        setIsFeedbackFading(true);
      }, remainingMs + feedbackFadeDelayMs);

      feedbackTimeoutRef.current = setTimeout(
        () => {
          setIsOverlayFeedbackActive(false);
          setIsFeedbackActive(false);
          setIsFeedbackFading(false);
          clearFeedbackInlineVars(target);
        },
        remainingMs + feedbackFadeDelayMs + feedbackFadeDurationMs
      );
    },
    [clearFeedbackInlineVars, effectProfile]
  );

  const finalizePointerFeedback = useCallback(
    (pointerType: string, opts?: { resetPendingFeedback?: boolean }) => {
      const minHoldMs = isTouchLikePointer(pointerType) ? 0 : minPointerHoldMs;
      if (pointerFeedbackInFlightRef.current) {
        pointerFeedbackInFlightRef.current = false;
        scheduleFeedbackFade(minHoldMs);
      }
      if (opts?.resetPendingFeedback) {
        hasPreClickFeedbackRef.current = false;
      }
    },
    [minPointerHoldMs, scheduleFeedbackFade]
  );

  const registerUncapturedPointerEnd = useCallback(
    (pointerId: number, pointerType: string) => {
      clearUncapturedPointerListeners();
      if (typeof window === 'undefined') return;

      const handlePointerEnd = (event: globalThis.PointerEvent) => {
        if (event.pointerId !== pointerId) return;

        finalizePointerFeedback(event.pointerType || pointerType, {
          resetPendingFeedback: event.type === 'pointercancel'
        });
        clearUncapturedPointerListeners();
      };

      window.addEventListener('pointerup', handlePointerEnd, true);
      window.addEventListener('pointercancel', handlePointerEnd, true);
      uncapturedPointerCleanupRef.current = () => {
        window.removeEventListener('pointerup', handlePointerEnd, true);
        window.removeEventListener('pointercancel', handlePointerEnd, true);
      };
    },
    [clearUncapturedPointerListeners, finalizePointerFeedback]
  );

  const cancel = useCallback(() => {
    clearAllTimers();
    clearUncapturedPointerListeners();

    pointerFeedbackInFlightRef.current = false;
    hasPreClickFeedbackRef.current = false;

    setIsOverlayFeedbackActive(false);
    setIsFeedbackActive(false);
    setIsFeedbackFading(false);

    const target = hostRef.current;
    if (target) clearFeedbackInlineVars(target);
  }, [clearAllTimers, clearFeedbackInlineVars, clearUncapturedPointerListeners, hostRef]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      clearUncapturedPointerListeners();
    };
  }, [clearAllTimers, clearUncapturedPointerListeners]);

  useEffect(() => {
    if (effectProfile) return;

    clearAllTimers();
    clearUncapturedPointerListeners();
    setIsFeedbackActive(false);
    setIsFeedbackFading(false);
    setIsOverlayFeedbackActive(false);

    pointerFeedbackInFlightRef.current = false;
    hasPreClickFeedbackRef.current = false;

    feedbackDurationRef.current = null;
    feedbackReleaseRatioRef.current = 1;
    feedbackFadeDelayRef.current = 50;
    feedbackFadeDurationRef.current = 100;

    const target = hostRef.current;
    if (target) clearFeedbackInlineVars(target);
  }, [clearAllTimers, clearFeedbackInlineVars, clearUncapturedPointerListeners, effectProfile, hostRef]);

  useEffect(() => {
    if (!shouldForceOverlayPressed || !effectProfile) return;

    const target = hostRef.current;
    if (!target) return;

    // Persistent showcase state uses center to simulate "currently pressed".
    applyOverlayPressed(target);
  }, [applyOverlayPressed, effectProfile, shouldForceOverlayPressed]);

  const previousShouldForceOverlayPressedRef = useRef(false);
  useEffect(() => {
    if (previousShouldForceOverlayPressedRef.current && !shouldForceOverlayPressed) {
      const target = hostRef.current;
      clearAllTimers();
      if (target) clearFeedbackInlineVars(target);
      setIsFeedbackActive(false);
      setIsFeedbackFading(false);
      setIsOverlayFeedbackActive(false);
    }
    previousShouldForceOverlayPressedRef.current = shouldForceOverlayPressed;
  }, [clearAllTimers, clearFeedbackInlineVars, shouldForceOverlayPressed]);

  const handleClick = useCallback(
    (event: MouseEvent<TPointerElement>) => {
      if (isDisabled === true) {
        return;
      }

      if (allowPressedFeedback && !hasPreClickFeedbackRef.current) {
        triggerPressed();
      }

      hasPreClickFeedbackRef.current = false;
      onClick?.(event);
    },
    [
      allowPressedFeedback,
      isDisabled,
      onClick,
      triggerPressed
    ]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<TPointerElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented) return;
      if (isDisabled === true) return;
      if (event.button !== 0 || event.isPrimary === false) return;
      if (shouldStartPointerFeedback?.(event) === false) return;

      const pointerTarget = event.currentTarget;
      const feedbackHost = resolveFeedbackHost(pointerTarget);

      hasPreClickFeedbackRef.current = false;
      pointerFeedbackInFlightRef.current = false;

      if (capturePointer) {
        trySetPointerCapture(pointerTarget, event.pointerId);
      } else {
        registerUncapturedPointerEnd(event.pointerId, event.pointerType);
      }

      if (feedbackHost) {
        pointerFeedbackInFlightRef.current = startFeedback(feedbackHost, {
          clientX: event.clientX,
          clientY: event.clientY
        });
        hasPreClickFeedbackRef.current = pointerFeedbackInFlightRef.current;
      }
    },
    [
      capturePointer,
      isDisabled,
      onPointerDown,
      resolveFeedbackHost,
      registerUncapturedPointerEnd,
      shouldStartPointerFeedback,
      startFeedback
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
      finalizePointerFeedback(event.pointerType, { resetPendingFeedback: true });
    },
    [clearUncapturedPointerListeners, finalizePointerFeedback, onPointerCancel]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<TKeyboardElement>) => {
      onKeyDown?.(event);
    },
    [onKeyDown]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<TKeyboardElement>) => {
      onKeyUp?.(event);
    },
    [onKeyUp]
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
    hostRef,
    cancel,
    isActive: isFeedbackActive,
    isFading: isFeedbackFading,
    isOverlayActive: isOverlayFeedbackActive,
    isFeedbackActive,
    isFeedbackFading,
    isOverlayFeedbackActive,
    handleClick,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown,
    handleKeyUp,
    handleBlur,
    handleKeyboardBlur
  };
}
