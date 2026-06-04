import './SwitchRuntimeMotion.structural.css';
import type { SwitchActivationMotion } from '@kiskadee/core';
import { animate, motion, useMotionValue } from 'motion/react';
import { type ReactNode, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
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
  readOnly?: boolean;
  requestSuppressNextClick: () => void;
  setControlState: (controlState: boolean) => void;
  setDragPreviewControlState: (controlState: boolean | null) => void;
  thumbClassName: string;
  thumbRef: RefObject<HTMLSpanElement | null>;
  thumbTranslation: number;
  trackRef: RefObject<HTMLSpanElement | null>;
  onActivationFeedbackCancel?: () => void;
};

const SWITCH_MOTION_DRAG_THRESHOLD = 3;
const SWITCH_MOTION_EXTREMITY_EPSILON = 0.5;
const SWITCH_MOTION_VELOCITY_PROJECTION = 0.18;
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
      e1: join('k-swt-m', options.activationMotion === 'slow' ? 'k-swt-e1b-a' : '') ?? ''
    }
  };
}

export function SwitchRuntimeMotionThumb({
  activationMotion,
  children,
  controlState,
  disabled,
  readOnly,
  requestSuppressNextClick,
  setControlState,
  setDragPreviewControlState,
  thumbClassName,
  thumbRef,
  thumbTranslation,
  trackRef,
  onActivationFeedbackCancel
}: SwitchRuntimeMotionThumbProps) {
  const [inlineDirection, setInlineDirection] = useState<InlineDirection>(() =>
    resolveInlineDirection(trackRef.current)
  );
  const thumbX = useMotionValue(
    resolveThumbTarget(controlState, thumbTranslation, inlineDirection)
  );
  const animationControlsRef = useRef<{ stop: () => void } | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const latestDragControlStateRef = useRef(controlState);
  const previousControlStateRef = useRef(controlState);
  const previousInlineDirectionRef = useRef(inlineDirection);
  const previousThumbTranslationRef = useRef(thumbTranslation);
  const canDrag = !disabled && !readOnly;
  const selectedTarget = resolveThumbTarget(controlState, thumbTranslation, inlineDirection);
  const dragMin = Math.min(0, thumbTranslation * inlineDirection);
  const dragMax = Math.max(0, thumbTranslation * inlineDirection);
  const thumbTransition = SWITCH_MOTION_THUMB_TRANSITIONS[activationMotion];

  const animateThumbTo = useCallback(
    (target: number) => {
      animationControlsRef.current?.stop();
      animationControlsRef.current = animate(thumbX, target, thumbTransition);
    },
    [thumbTransition, thumbX]
  );

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

    previousControlStateRef.current = controlState;
    previousInlineDirectionRef.current = inlineDirection;
    previousThumbTranslationRef.current = thumbTranslation;

    if (hasGeometryChanged && !hasControlStateChanged) {
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
      ref={thumbRef}
      aria-hidden="true"
      className={thumbClassName}
      drag={canDrag ? 'x' : false}
      dragConstraints={{ left: dragMin, right: dragMax }}
      dragElastic={0}
      dragMomentum={false}
      initial={false}
      style={{ x: thumbX }}
      onDragStart={() => {
        if (!canDrag) return;
        isDraggingRef.current = true;
        onActivationFeedbackCancel?.();
        hasDraggedRef.current = false;
        setDragPreviewControlState(null);
        latestDragControlStateRef.current = controlState;
        animationControlsRef.current?.stop();
      }}
      onDrag={(_, info) => {
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
        }

        if (Math.abs(info.offset.x) > SWITCH_MOTION_DRAG_THRESHOLD) {
          hasDraggedRef.current = true;
          onActivationFeedbackCancel?.();
        }
      }}
      onDragEnd={(_, info) => {
        if (!canDrag) return;

        const currentOffset = normalizeThumbOffset(thumbX.get(), inlineDirection, thumbTranslation);
        const projectedOffset =
          currentOffset + info.velocity.x * inlineDirection * SWITCH_MOTION_VELOCITY_PROJECTION;
        const nextControlState = projectedOffset >= thumbTranslation / 2;

        isDraggingRef.current = false;
        if (hasDraggedRef.current || Math.abs(info.offset.x) > SWITCH_MOTION_DRAG_THRESHOLD) {
          requestSuppressNextClick();
        }
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
