import { useControlState } from '@kiskadee/react-headless';
import { type MouseEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  applySwitchV2MotionGeometry,
  calculateSwitchV2MotionGeometry,
  clearSwitchV2MotionGeometry
} from './SwitchV2Motion.geometry.ts';

type SwitchV2MotionControllerOptions = {
  controlState?: boolean;
  defaultControlState?: boolean;
  disabled?: boolean;
  enabled: boolean;
  geometryKey: string;
  onClickCapture?: (event: MouseEvent<HTMLLabelElement>) => void;
  onControlStateChange?: (controlState: boolean) => void;
  readOnly?: boolean;
};

type SwitchV2MotionThumbRuntimeProps = {
  controlState: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  requestSuppressNextClick: () => void;
  setControlState: (controlState: boolean) => void;
  setDragPreviewControlState: (controlState: boolean | null) => void;
  thumbRef: RefObject<HTMLSpanElement | null>;
  thumbTranslation: number;
  trackRef: RefObject<HTMLSpanElement | null>;
};

type SwitchV2MotionControllerResult = {
  handleClickCapture: (event: MouseEvent<HTMLLabelElement>) => void;
  projectedControlState: boolean;
  setControlState: (controlState: boolean) => void;
  thumbProps: SwitchV2MotionThumbRuntimeProps;
};

const SWITCH_V2_MOTION_DRAG_CLICK_SUPPRESSION_MS = 450;

function useSwitchV2MotionThumbTranslation(options: {
  enabled: boolean;
  geometryKey: string;
  onTranslationChange: (translation: number) => void;
  thumbRef: RefObject<HTMLSpanElement | null>;
  trackRef: RefObject<HTMLSpanElement | null>;
}) {
  const syncThumbTranslation = useCallback(() => {
    if (!options.enabled) return;

    const trackElement = options.trackRef.current;
    const thumbElement = options.thumbRef.current;
    if (!trackElement || !thumbElement) return;

    const geometry = calculateSwitchV2MotionGeometry(trackElement, thumbElement);
    applySwitchV2MotionGeometry(trackElement, geometry);
    options.onTranslationChange(geometry.translation);
  }, [options.enabled, options.onTranslationChange, options.trackRef, options.thumbRef]);

  useEffect(() => {
    syncThumbTranslation();
  }, [options.geometryKey, syncThumbTranslation]);

  useEffect(() => {
    if (!options.enabled) return;

    const trackElement = options.trackRef.current;
    const thumbElement = options.thumbRef.current;
    if (!trackElement || !thumbElement) return;

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncThumbTranslation) : null;
    resizeObserver?.observe(trackElement);
    resizeObserver?.observe(thumbElement);
    window.addEventListener('resize', syncThumbTranslation);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncThumbTranslation);
      clearSwitchV2MotionGeometry(trackElement);
    };
  }, [options.enabled, options.trackRef, options.thumbRef, syncThumbTranslation]);
}

export function useSwitchV2MotionController({
  controlState: controlStateProp,
  defaultControlState,
  disabled,
  enabled,
  geometryKey,
  onClickCapture,
  onControlStateChange,
  readOnly
}: SwitchV2MotionControllerOptions): SwitchV2MotionControllerResult {
  const { controlState, setControlState } = useControlState({
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    readOnly,
    onControlStateChange
  });
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const suppressNextClickRef = useRef(false);
  const suppressNextClickTimeoutRef = useRef<number | null>(null);
  const [thumbTranslation, setThumbTranslation] = useState(0);
  const [dragPreviewControlState, setDragPreviewControlState] = useState<boolean | null>(null);
  const projectedControlState = enabled ? (dragPreviewControlState ?? controlState) : controlState;

  const requestSuppressNextClick = useCallback(() => {
    suppressNextClickRef.current = true;
    if (suppressNextClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressNextClickTimeoutRef.current);
    }
    suppressNextClickTimeoutRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = false;
      suppressNextClickTimeoutRef.current = null;
    }, SWITCH_V2_MOTION_DRAG_CLICK_SUPPRESSION_MS);
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

  useSwitchV2MotionThumbTranslation({
    enabled,
    trackRef,
    thumbRef,
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
      readOnly,
      requestSuppressNextClick,
      setControlState,
      setDragPreviewControlState,
      thumbRef,
      thumbTranslation,
      trackRef
    }
  };
}
