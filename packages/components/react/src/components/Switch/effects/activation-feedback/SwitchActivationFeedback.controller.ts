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
import {
  type ActivationFeedbackStaticGeometry,
  useActivationFeedbackHalo
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackHalo.ts';
import {
  type ActivationFeedbackRadialRuntimeConfig,
  resolveActivationFeedbackProfileRadialRuntimeConfig,
  resolvePressedActivationFeedbackRadialRuntimeConfig,
  useActivationFeedbackRadialStateMachine
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackRadialStateMachine.ts';
import {
  hasSwitchThumbShrinkClass,
  resolveSwitchThumbVisualElement
} from '../.././SwitchGeometry.utils.ts';

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

type SwitchActivationFeedbackPointerHandler = (
  event: PointerEvent<HTMLLabelElement>
) => void;

const SWITCH_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS = 140;

function resolveSwitchActivationFeedbackStaticGeometry(
  thumbElement: HTMLSpanElement
): ActivationFeedbackStaticGeometry | null {
  const visualElement = hasSwitchThumbShrinkClass(thumbElement)
    ? resolveSwitchThumbVisualElement(thumbElement)
    : null;
  const geometryElement = visualElement ?? thumbElement;
  const geometryRect = geometryElement.getBoundingClientRect();
  if (geometryRect.width === 0 || geometryRect.height === 0) return null;

  const geometryStyle = window.getComputedStyle(geometryElement);
  const width = geometryRect.width;
  const height = geometryRect.height;
  const radius = geometryStyle.borderTopLeftRadius;

  return {
    height,
    radius,
    size: Math.max(width, height),
    width
  };
}

function shouldSyncSwitchActivationFeedbackGeometryOnTransitionEnd(
  event: TransitionEvent,
  thumbElement: HTMLSpanElement
): boolean {
  if (event.target === thumbElement) return true;

  const visualElement = hasSwitchThumbShrinkClass(thumbElement)
    ? resolveSwitchThumbVisualElement(thumbElement)
    : null;
  return visualElement !== null && event.target === visualElement;
}

function pickSwitchActivationFeedbackPointerHandler({
  enabled,
  fallbackHandler,
  radialHandler,
  staticHandler,
  usesRadialRuntime,
  usesStaticRuntime
}: {
  enabled: boolean;
  fallbackHandler?: SwitchActivationFeedbackPointerHandler;
  radialHandler: SwitchActivationFeedbackPointerHandler;
  staticHandler: SwitchActivationFeedbackPointerHandler;
  usesRadialRuntime: boolean;
  usesStaticRuntime: boolean;
}): SwitchActivationFeedbackPointerHandler | undefined {
  if (!enabled) return fallbackHandler;
  if (usesRadialRuntime) return radialHandler;
  if (usesStaticRuntime) return staticHandler;
  return fallbackHandler;
}

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
  const resolveStaticGeometry = useCallback(
    (thumbElement: HTMLSpanElement) =>
      resolveSwitchActivationFeedbackStaticGeometry(thumbElement),
    []
  );

  const origin: ActivationFeedbackOrigin = config?.origin ?? 'center';
  const profileDefinition = resolveActivationFeedbackProfileDefinition(profile);
  const usesRadialRuntime = profileDefinition.runtime === 'radial';
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
    resolveStaticGeometry,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
    shouldSyncGeometryOnTransitionEnd:
      shouldSyncSwitchActivationFeedbackGeometryOnTransitionEnd,
    shouldStartPointerFeedback
  });

  const radialRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig | null>(() => {
    if (!usesRadialRuntime) return null;

    return resolveActivationFeedbackProfileRadialRuntimeConfig({
      config,
      fallbackDurationMs: 468,
      profile
    });
  }, [config, profile, usesRadialRuntime]);

  const pressedRuntimeConfig = useMemo<ActivationFeedbackRadialRuntimeConfig>(() => {
    return resolvePressedActivationFeedbackRadialRuntimeConfig({ config });
  }, [config]);

  const radialActivationFeedbackMachine = useActivationFeedbackRadialStateMachine<
    HTMLLabelElement,
    HTMLSpanElement
  >({
    capturePointer: false,
    effectProfile: enabled && usesRadialRuntime ? profile : null,
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
        return;
      }

      radialActivationFeedbackMachine.handleClick(event);
    },
    [
      isEventInsideTrack,
      onClickCapture,
      radialActivationFeedbackMachine.handleClick,
      usesStaticRuntime
    ]
  );

  const activeMachine =
    usesStaticRuntime ? activationFeedbackMachine : radialActivationFeedbackMachine;
  const pointerHandlers = {
    onPointerDown: pickSwitchActivationFeedbackPointerHandler({
      enabled,
      fallbackHandler: onPointerDown,
      radialHandler: radialActivationFeedbackMachine.handlePointerDown,
      staticHandler: activationFeedbackMachine.handlePointerDown,
      usesRadialRuntime,
      usesStaticRuntime
    }),
    onPointerUp: pickSwitchActivationFeedbackPointerHandler({
      enabled,
      fallbackHandler: onPointerUp,
      radialHandler: radialActivationFeedbackMachine.handlePointerUp,
      staticHandler: activationFeedbackMachine.handlePointerUp,
      usesRadialRuntime,
      usesStaticRuntime
    }),
    onPointerCancel: pickSwitchActivationFeedbackPointerHandler({
      enabled,
      fallbackHandler: onPointerCancel,
      radialHandler: radialActivationFeedbackMachine.handlePointerCancel,
      staticHandler: activationFeedbackMachine.handlePointerCancel,
      usesRadialRuntime,
      usesStaticRuntime
    })
  };

  return {
    cancel: activeMachine.cancel,
    isActive: enabled && activeMachine.isActive,
    isFading: enabled && activeMachine.isFading,
    rootHandlers: {
      onClickCapture: enabled ? handleClickCapture : onClickCapture,
      ...pointerHandlers,
      onBlur: enabled ? activeMachine.handleBlur : onBlur
    }
  };
}
