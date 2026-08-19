import { useControlState } from '@kiskadee/react-headless';
import { type MouseEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../../../../shared/utils/useIsomorphicLayoutEffect.ts';
import {
  applySwitchFocusOffsetExtra,
  calculateSwitchFocusOffsetExtra,
  clearSwitchFocusOffsetExtra,
  hasSwitchThumbShrinkClass
} from '../.././SwitchGeometry.utils.ts';
import {
  applySwitchRuntimeMotionGeometry,
  calculateSwitchRuntimeMotionGeometry,
  clearSwitchRuntimeMotionGeometry
} from './SwitchRuntimeMotion.geometry.ts';

type SwitchRuntimeMotionControllerOptions = {
  controlState?: boolean;
  defaultControlState?: boolean;
  disabled?: boolean;
  enabled: boolean;
  geometryKey: string;
  interactionLocked?: boolean;
  onClickCapture?: (event: MouseEvent<HTMLLabelElement>) => void;
  onControlStateChange?: (controlState: boolean) => void;
  readOnly?: boolean;
};

type SwitchRuntimeMotionThumbRuntimeProps = {
  controlState: boolean;
  disabled?: boolean;
  interactionLocked?: boolean;
  readOnly?: boolean;
  requestSuppressNextClick: () => void;
  setControlState: (controlState: boolean) => void;
  setDragPreviewControlState: (controlState: boolean | null) => void;
  thumbRef: RefObject<HTMLSpanElement | null>;
  thumbRefCallback: (element: HTMLSpanElement | null) => void;
  thumbTranslation: number;
  trackRef: RefObject<HTMLSpanElement | null>;
  trackRefCallback: (element: HTMLSpanElement | null) => void;
};

type SwitchRuntimeMotionControllerResult = {
  handleClickCapture: (event: MouseEvent<HTMLLabelElement>) => void;
  projectedControlState: boolean;
  setControlState: (controlState: boolean) => void;
  thumbProps: SwitchRuntimeMotionThumbRuntimeProps;
};

const SWITCH_MOTION_DRAG_CLICK_SUPPRESSION_MS = 450;

function useSwitchRuntimeMotionThumbTranslation(options: {
  enabled: boolean;
  geometryKey: string;
  onTranslationChange: (translation: number) => void;
  thumbElement: HTMLSpanElement | null;
  trackElement: HTMLSpanElement | null;
}) {
  const { enabled, geometryKey, onTranslationChange, thumbElement, trackElement } = options;
  const syncAnimationFrameRef = useRef<number | null>(null);
  const thumbShrinkElementRef = useRef<HTMLSpanElement | null>(null);
  const thumbShrinkTrackClassNameRef = useRef<string | null>(null);
  const syncThumbTranslation = useCallback(() => {
    if (!trackElement || !thumbElement) return;

    applySwitchFocusOffsetExtra(
      trackElement,
      calculateSwitchFocusOffsetExtra(trackElement, thumbElement)
    );

    if (!enabled) return;

    if (thumbShrinkElementRef.current !== thumbElement) {
      thumbShrinkElementRef.current = thumbElement;
      thumbShrinkTrackClassNameRef.current = null;
    }

    const trackClassName = trackElement.className;
    const hasThumbShrinkClass = hasSwitchThumbShrinkClass(thumbElement);
    if (hasThumbShrinkClass) {
      thumbShrinkTrackClassNameRef.current = trackClassName;
    } else if (
      thumbShrinkTrackClassNameRef.current !== null &&
      thumbShrinkTrackClassNameRef.current !== trackClassName
    ) {
      thumbShrinkTrackClassNameRef.current = null;
    }

    const geometry = calculateSwitchRuntimeMotionGeometry(trackElement, thumbElement, {
      preserveReducedThumbAlignment: thumbShrinkTrackClassNameRef.current !== null
    });
    applySwitchRuntimeMotionGeometry(trackElement, geometry);
    onTranslationChange(geometry.translation);
    if (!hasThumbShrinkClass && !geometry.isReducedThumb) {
      thumbShrinkTrackClassNameRef.current = null;
    }
  }, [enabled, onTranslationChange, thumbElement, trackElement]);
  const cancelScheduledThumbTranslationSync = useCallback(() => {
    if (syncAnimationFrameRef.current === null) return;

    window.cancelAnimationFrame(syncAnimationFrameRef.current);
    syncAnimationFrameRef.current = null;
  }, []);
  const scheduleThumbTranslationSync = useCallback(() => {
    if (syncAnimationFrameRef.current !== null) return;

    syncAnimationFrameRef.current = window.requestAnimationFrame(() => {
      syncAnimationFrameRef.current = null;
      syncThumbTranslation();
    });
  }, [enabled, syncThumbTranslation]);

  useEffect(
    () => () => {
      cancelScheduledThumbTranslationSync();
    },
    [cancelScheduledThumbTranslationSync]
  );

  useIsomorphicLayoutEffect(() => {
    syncThumbTranslation();
  }, [geometryKey, syncThumbTranslation]);

  useEffect(() => {
    if (!trackElement || !thumbElement) return;

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncThumbTranslation) : null;
    resizeObserver?.observe(trackElement);
    resizeObserver?.observe(thumbElement);
    window.addEventListener('resize', scheduleThumbTranslationSync);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleThumbTranslationSync);
      cancelScheduledThumbTranslationSync();
      clearSwitchFocusOffsetExtra(trackElement);
      if (enabled) {
        clearSwitchRuntimeMotionGeometry(trackElement);
      }
    };
  }, [
    cancelScheduledThumbTranslationSync,
    enabled,
    syncThumbTranslation,
    trackElement,
    thumbElement,
    scheduleThumbTranslationSync
  ]);
}

export function useSwitchRuntimeMotionController({
  controlState: controlStateProp,
  defaultControlState,
  disabled,
  enabled,
  geometryKey,
  interactionLocked,
  onClickCapture,
  onControlStateChange,
  readOnly
}: SwitchRuntimeMotionControllerOptions): SwitchRuntimeMotionControllerResult {
  const { controlState, setControlState } = useControlState({
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    interactionLocked,
    readOnly,
    onControlStateChange
  });
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const [trackElement, setTrackElement] = useState<HTMLSpanElement | null>(null);
  const [thumbElement, setThumbElement] = useState<HTMLSpanElement | null>(null);
  const suppressNextClickRef = useRef(false);
  const suppressNextClickTimeoutRef = useRef<number | null>(null);
  const [thumbTranslation, setThumbTranslation] = useState(0);
  const [dragPreviewControlState, setDragPreviewControlState] = useState<boolean | null>(null);
  const projectedControlState = enabled ? (dragPreviewControlState ?? controlState) : controlState;
  const trackRefCallback = useCallback((element: HTMLSpanElement | null) => {
    trackRef.current = element;
    setTrackElement(element);
  }, []);
  const thumbRefCallback = useCallback((element: HTMLSpanElement | null) => {
    thumbRef.current = element;
    setThumbElement(element);
  }, []);

  const requestSuppressNextClick = useCallback(() => {
    suppressNextClickRef.current = true;
    if (suppressNextClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressNextClickTimeoutRef.current);
    }
    suppressNextClickTimeoutRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = false;
      suppressNextClickTimeoutRef.current = null;
    }, SWITCH_MOTION_DRAG_CLICK_SUPPRESSION_MS);
  }, []);

  useEffect(
    () => () => {
      if (suppressNextClickTimeoutRef.current !== null) {
        window.clearTimeout(suppressNextClickTimeoutRef.current);
      }
    },
    []
  );

  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLLabelElement>) => {
      if (enabled && suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        if (suppressNextClickTimeoutRef.current !== null) {
          window.clearTimeout(suppressNextClickTimeoutRef.current);
          suppressNextClickTimeoutRef.current = null;
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClickCapture?.(event);
    },
    [enabled, onClickCapture]
  );

  useSwitchRuntimeMotionThumbTranslation({
    enabled,
    trackElement,
    thumbElement,
    onTranslationChange: setThumbTranslation,
    geometryKey
  });

  return {
    handleClickCapture,
    projectedControlState,
    setControlState,
    thumbProps: {
      controlState: projectedControlState,
      disabled,
      interactionLocked,
      readOnly,
      requestSuppressNextClick,
      setControlState,
      setDragPreviewControlState,
      thumbRef,
      thumbRefCallback,
      thumbTranslation,
      trackRef,
      trackRefCallback
    }
  };
}
