import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackOrigin,
  ActivationFeedbackProfileMode
} from '@kiskadee/core';
import { usesActivationFeedbackStaticRuntime } from '@kiskadee/core';
import type {
  SliderThumbIndex,
  SliderThumbInteractionDetails,
  SliderThumbInteractionSwitchDetails
} from '@kiskadee/react-headless';
import type { RefObject } from 'react';
import { useCallback } from 'react';
import {
  type ActivationFeedbackStaticGeometry,
  useActivationFeedbackHalo
} from '../../../../hooks/effects/activation-feedback/useActivationFeedbackHalo.ts';

type SliderActivationFeedbackControllerOptions = {
  config?: ActivationFeedbackEffectSchema;
  disabled?: boolean;
  enabled: boolean;
  forcedActive?: boolean;
  geometryKey?: string;
  isRange: boolean;
  profile: ActivationFeedbackProfileMode;
  readOnly?: boolean;
  startThumbRef: RefObject<HTMLSpanElement | null>;
  endThumbRef: RefObject<HTMLSpanElement | null>;
};

type SliderActivationFeedbackControllerResult = {
  thumbInteractionHandlers: {
    onThumbInteractionCancel?: (details: SliderThumbInteractionDetails) => void;
    onThumbInteractionEnd?: (details: SliderThumbInteractionDetails) => void;
    onThumbInteractionStart?: (details: SliderThumbInteractionDetails) => void;
    onThumbInteractionSwitch?: (details: SliderThumbInteractionSwitchDetails) => void;
  };
  isThumbActive: (index: SliderThumbIndex) => boolean;
};

const SLIDER_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS = 140;

function resolveSliderActivationFeedbackStaticGeometry(
  thumbElement: HTMLSpanElement
): ActivationFeedbackStaticGeometry | null {
  const rect = thumbElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const style = window.getComputedStyle(thumbElement);
  const width = rect.width;
  const height = rect.height;

  return {
    height,
    radius: style.borderTopLeftRadius,
    size: Math.max(width, height),
    width
  };
}

function shouldSyncSliderActivationFeedbackGeometryOnTransitionEnd(
  event: TransitionEvent,
  thumbElement: HTMLSpanElement
): boolean {
  return event.target === thumbElement;
}

export function useSliderActivationFeedbackController({
  config,
  disabled,
  enabled,
  forcedActive,
  geometryKey,
  isRange,
  profile,
  readOnly,
  startThumbRef,
  endThumbRef
}: SliderActivationFeedbackControllerOptions): SliderActivationFeedbackControllerResult {
  const origin: ActivationFeedbackOrigin = config?.origin ?? 'center';
  const usesStaticRuntime = usesActivationFeedbackStaticRuntime(profile);
  const shouldEnableStartThumb = enabled && usesStaticRuntime;
  const shouldEnableEndThumb = enabled && isRange && usesStaticRuntime;
  const resolveStaticGeometry = useCallback(
    (thumbElement: HTMLSpanElement) =>
      resolveSliderActivationFeedbackStaticGeometry(thumbElement),
    []
  );

  const startMachine = useActivationFeedbackHalo<HTMLDivElement, HTMLSpanElement>({
    capturePointer: false,
    config,
    disabled,
    enabled: shouldEnableStartThumb,
    forcedActive: forcedActive && shouldEnableStartThumb,
    geometryKey,
    hostRef: startThumbRef,
    minPointerHoldMs: SLIDER_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS,
    origin,
    profile,
    readOnly,
    resolveStaticGeometry,
    shouldSyncGeometryOnTransitionEnd:
      shouldSyncSliderActivationFeedbackGeometryOnTransitionEnd
  });

  const endMachine = useActivationFeedbackHalo<HTMLDivElement, HTMLSpanElement>({
    capturePointer: false,
    config,
    disabled,
    enabled: shouldEnableEndThumb,
    forcedActive: forcedActive && shouldEnableEndThumb,
    geometryKey,
    hostRef: endThumbRef,
    minPointerHoldMs: SLIDER_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS,
    origin,
    profile,
    readOnly,
    resolveStaticGeometry,
    shouldSyncGeometryOnTransitionEnd:
      shouldSyncSliderActivationFeedbackGeometryOnTransitionEnd
  });

  const pickMachine = useCallback(
    (index: SliderThumbIndex) => (index === 1 ? endMachine : startMachine),
    [endMachine, startMachine]
  );

  const handleThumbInteractionStart = useCallback(
    ({ event, index }: SliderThumbInteractionDetails) => {
      if (!enabled || !usesStaticRuntime) return;
      if (event.defaultPrevented || event.button !== 0 || event.isPrimary === false) return;
      pickMachine(index).trigger(event, SLIDER_ACTIVATION_FEEDBACK_MIN_POINTER_HOLD_MS);
    },
    [enabled, pickMachine, usesStaticRuntime]
  );

  const handleThumbInteractionEnd = useCallback(
    ({ event, index }: SliderThumbInteractionDetails) => {
      if (!enabled || !usesStaticRuntime) return;
      if (index === 1 && !isRange) return;
      pickMachine(index).handlePointerUp(event);
    },
    [enabled, isRange, pickMachine, usesStaticRuntime]
  );

  const handleThumbInteractionCancel = useCallback(
    ({ index }: SliderThumbInteractionDetails) => {
      if (!enabled || !usesStaticRuntime) return;
      pickMachine(index).cancel();
    },
    [enabled, pickMachine, usesStaticRuntime]
  );

  const handleThumbInteractionSwitch = useCallback(
    ({ fromIndex, toIndex }: SliderThumbInteractionSwitchDetails) => {
      if (!enabled || !usesStaticRuntime) return;
      if (toIndex === 1 && !isRange) return;

      pickMachine(fromIndex).cancel();
    },
    [enabled, isRange, pickMachine, usesStaticRuntime]
  );

  const isThumbActive = useCallback(
    (index: SliderThumbIndex) => {
      const machine = pickMachine(index);
      const isMountedThumb = index === 0 || isRange;
      return enabled && isMountedThumb && machine.isActive && !machine.isFading;
    },
    [enabled, isRange, pickMachine]
  );

  return {
    thumbInteractionHandlers: {
      onThumbInteractionCancel: enabled ? handleThumbInteractionCancel : undefined,
      onThumbInteractionEnd: enabled ? handleThumbInteractionEnd : undefined,
      onThumbInteractionStart: enabled ? handleThumbInteractionStart : undefined,
      onThumbInteractionSwitch: enabled ? handleThumbInteractionSwitch : undefined
    },
    isThumbActive
  };
}
