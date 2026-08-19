import './SwitchRuntimeMotion.structural.scss';
import type { SwitchActivationMotion } from '@kiskadee/core';
import { animate, motion, useDragControls, useMotionValue } from 'motion/react';
import {
  type PointerEvent,
  type ReactNode,
  type RefCallback,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { join } from '../.././Switch.class-names.ts';
import type { SwitchClassNames } from '../.././Switch.types.ts';

type InlineDirection = 1 | -1;

export type SwitchRuntimeMotionEffectOptions = {
  activationMotion: SwitchActivationMotion;
};

export type SwitchRuntimeMotionEffectResult = {
  classNamePatch: SwitchClassNames;
};

export type SwitchRuntimeMotionThumbProps = {
  activationMotion: SwitchActivationMotion;
  children?: ReactNode;
  controlState: boolean;
  disabled?: boolean;
  interactionLocked?: boolean;
  readOnly?: boolean;
  requestSuppressNextClick: () => void;
  setControlState: (controlState: boolean) => void;
  setDragPreviewControlState: (controlState: boolean | null) => void;
  thumbClassName: string;
  thumbRefCallback: RefCallback<HTMLSpanElement>;
  thumbTranslation: number;
  trackRef: RefObject<HTMLSpanElement | null>;
};

const SWITCH_MOTION_EXTREMITY_EPSILON = 0.5;
const SWITCH_MOTION_CLICK_SUPPRESSION_THRESHOLD = 5;
const SWITCH_MOTION_THUMB_TRANSITIONS = {
  standard: {
    type: 'spring',
    stiffness: 520,
    damping: 38,
    mass: 0.9
  },
  slow: {
    type: 'spring',
    stiffness: 320,
    damping: 38,
    mass: 1
  }
} as const satisfies Record<
  SwitchActivationMotion,
  {
    type: 'spring';
    stiffness: number;
    damping: number;
    mass: number;
  }
>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveInlineDirection(element: HTMLElement | null): InlineDirection {
  if (!element || typeof getComputedStyle === 'undefined') return 1;
  return getComputedStyle(element).direction === 'rtl' ? -1 : 1;
}

function resolveThumbTarget(
  controlState: boolean,
  translation: number,
  direction: InlineDirection
) {
  return controlState ? translation * direction : 0;
}

function normalizeThumbOffset(value: number, direction: InlineDirection, translation: number) {
  return clamp(value * direction, 0, translation);
}

function resolveControlStateAtExtremity(
  normalizedOffset: number,
  translation: number
): boolean | null {
  if (translation <= 0) return null;
  if (normalizedOffset <= SWITCH_MOTION_EXTREMITY_EPSILON) return false;
  if (normalizedOffset >= translation - SWITCH_MOTION_EXTREMITY_EPSILON) return true;
  return null;
}

export function resolveSwitchRuntimeMotionEffect(
  options: SwitchRuntimeMotionEffectOptions
): SwitchRuntimeMotionEffectResult {
  return {
    classNamePatch: {
      e1: join('k-swt-m', options.activationMotion === 'slow' ? 'k-swt-e1b-a' : '') ?? '',
      e3: 'k-swt-e3d-a'
    }
  };
}

export function SwitchRuntimeMotionThumb({
  activationMotion,
  children,
  controlState,
  disabled,
  interactionLocked,
  readOnly,
  requestSuppressNextClick,
  setControlState,
  setDragPreviewControlState,
  thumbClassName,
  thumbRefCallback,
  thumbTranslation,
  trackRef
}: SwitchRuntimeMotionThumbProps) {
  const [inlineDirection, setInlineDirection] = useState<InlineDirection>(() =>
    resolveInlineDirection(trackRef.current)
  );
  const thumbX = useMotionValue(
    resolveThumbTarget(controlState, thumbTranslation, inlineDirection)
  );
  const dragControls = useDragControls();
  const animationControlsRef = useRef<{ stop: () => void } | null>(null);
  const isDraggingRef = useRef(false);
  const pointerIntentRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const hasSynchronizedInitialGeometryRef = useRef(false);
  const dragStartControlStateRef = useRef(controlState);
  const latestDragControlStateRef = useRef(controlState);
  const previousControlStateRef = useRef(controlState);
  const previousInlineDirectionRef = useRef(inlineDirection);
  const previousThumbTranslationRef = useRef(thumbTranslation);
  const canDrag = !disabled && !interactionLocked && !readOnly;
  const selectedTarget = resolveThumbTarget(controlState, thumbTranslation, inlineDirection);
  const dragMin = Math.min(0, thumbTranslation * inlineDirection);
  const dragMax = Math.max(0, thumbTranslation * inlineDirection);
  const thumbTransition = SWITCH_MOTION_THUMB_TRANSITIONS[activationMotion];
  const geometryStateKey = thumbTranslation > 0 ? 'ready' : 'pending';

  if (
    thumbTranslation > 0 &&
    !isDraggingRef.current &&
    !hasSynchronizedInitialGeometryRef.current
  ) {
    thumbX.set(selectedTarget);
    hasSynchronizedInitialGeometryRef.current = true;
  }

  const animateThumbTo = useCallback(
    (target: number) => {
      animationControlsRef.current?.stop();
      animationControlsRef.current = animate(thumbX, target, thumbTransition);
    },
    [thumbTransition, thumbX]
  );

  const handlePointerIntent = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      if (!canDrag) {
        pointerIntentRef.current = null;
        return;
      }

      if (event.type === 'pointerdown') {
        if (!event.isPrimary) return;

        pointerIntentRef.current = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          moved: false
        };
        dragControls.start(event.nativeEvent, {
          distanceThreshold: SWITCH_MOTION_CLICK_SUPPRESSION_THRESHOLD,
          snapToCursor: false
        });
        return;
      }

      const pointerIntent = pointerIntentRef.current;
      if (!pointerIntent || pointerIntent.id !== event.pointerId) return;

      if (event.type !== 'pointermove') {
        if (pointerIntent.moved) {
          requestSuppressNextClick();
        }
        pointerIntentRef.current = null;
        return;
      }

      if (pointerIntent.moved) return;

      const deltaX = Math.abs(event.clientX - pointerIntent.startX);
      const deltaY = Math.abs(event.clientY - pointerIntent.startY);
      if (deltaX <= SWITCH_MOTION_CLICK_SUPPRESSION_THRESHOLD || deltaX < deltaY) {
        return;
      }

      pointerIntent.moved = true;
    },
    [canDrag, dragControls, requestSuppressNextClick]
  );

  useEffect(() => {
    if (canDrag || !isDraggingRef.current) return;

    isDraggingRef.current = false;
    pointerIntentRef.current = null;
    latestDragControlStateRef.current = controlState;
    setDragPreviewControlState(null);
    animateThumbTo(selectedTarget);
  }, [animateThumbTo, canDrag, controlState, selectedTarget, setDragPreviewControlState]);

  useEffect(() => {
    const syncInlineDirection = () => {
      setInlineDirection(resolveInlineDirection(trackRef.current));
    };

    syncInlineDirection();
    window.addEventListener('resize', syncInlineDirection);

    return () => {
      window.removeEventListener('resize', syncInlineDirection);
    };
  }, [trackRef]);

  useEffect(() => {
    latestDragControlStateRef.current = controlState;
    if (isDraggingRef.current) return;

    const previousControlState = previousControlStateRef.current;
    const previousInlineDirection = previousInlineDirectionRef.current;
    const previousThumbTranslation = previousThumbTranslationRef.current;
    const hasControlStateChanged = previousControlState !== controlState;
    const hasGeometryChanged =
      previousInlineDirection !== inlineDirection || previousThumbTranslation !== thumbTranslation;
    const hasInitializedTranslation =
      previousThumbTranslation <= 0 && thumbTranslation > previousThumbTranslation;

    previousControlStateRef.current = controlState;
    previousInlineDirectionRef.current = inlineDirection;
    previousThumbTranslationRef.current = thumbTranslation;

    if (hasGeometryChanged && (!hasControlStateChanged || hasInitializedTranslation)) {
      animationControlsRef.current?.stop();
      thumbX.set(selectedTarget);
      return;
    }

    animateThumbTo(selectedTarget);

    return () => {
      animationControlsRef.current?.stop();
    };
  }, [animateThumbTo, controlState, inlineDirection, selectedTarget, thumbTranslation, thumbX]);

  return (
    <motion.span
      key={geometryStateKey}
      ref={thumbRefCallback}
      aria-hidden="true"
      className={thumbClassName}
      drag={canDrag ? 'x' : false}
      dragControls={dragControls}
      dragConstraints={{ left: dragMin, right: dragMax }}
      dragElastic={0}
      dragListener={false}
      dragMomentum={false}
      initial={false}
      style={{ x: thumbX }}
      onPointerDown={handlePointerIntent}
      onPointerMove={handlePointerIntent}
      onPointerUp={handlePointerIntent}
      onPointerCancel={handlePointerIntent}
      onDragStart={() => {
        if (!canDrag) return;
        isDraggingRef.current = true;
        dragStartControlStateRef.current = controlState;
        setDragPreviewControlState(null);
        latestDragControlStateRef.current = controlState;
        animationControlsRef.current?.stop();
      }}
      onDrag={() => {
        if (!canDrag) return;

        const constrainedOffset = clamp(thumbX.get(), dragMin, dragMax);
        if (constrainedOffset !== thumbX.get()) {
          thumbX.set(constrainedOffset);
        }
        const normalizedOffset = normalizeThumbOffset(
          constrainedOffset,
          inlineDirection,
          thumbTranslation
        );
        const extremityControlState = resolveControlStateAtExtremity(
          normalizedOffset,
          thumbTranslation
        );

        if (
          extremityControlState !== null &&
          extremityControlState !== latestDragControlStateRef.current
        ) {
          latestDragControlStateRef.current = extremityControlState;
          setDragPreviewControlState(extremityControlState);
          setControlState(extremityControlState);
        }
      }}
      onDragEnd={() => {
        if (!canDrag) {
          isDraggingRef.current = false;
          setDragPreviewControlState(null);
          animateThumbTo(selectedTarget);
          return;
        }

        const currentOffset = normalizeThumbOffset(thumbX.get(), inlineDirection, thumbTranslation);
        const nextControlState =
          thumbTranslation > 0
            ? currentOffset >= thumbTranslation / 2
            : dragStartControlStateRef.current;

        isDraggingRef.current = false;
        requestSuppressNextClick();
        latestDragControlStateRef.current = nextControlState;
        setControlState(nextControlState);
        setDragPreviewControlState(null);
        animateThumbTo(resolveThumbTarget(nextControlState, thumbTranslation, inlineDirection));
      }}
    >
      {children}
    </motion.span>
  );
}
