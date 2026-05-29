import './SwitchMotion.structural.css';
import { breakpoints, type SwitchActivationMotion } from '@kiskadee/core';
import { HeadlessSwitch, useControlState } from '@kiskadee/react-headless';
import { animate, motion, useMotionValue } from 'motion/react';
import {
  type ComponentType,
  type LazyExoticComponent,
  type MouseEvent,
  lazy,
  memo,
  type RefObject,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import {
  DEFAULT_SWITCH_ACTIVATION_MOTION,
  DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY,
  DEFAULT_SWITCH_EMPHASIS,
  DEFAULT_SWITCH_INTENT,
  DEFAULT_SWITCH_LABEL_POSITION,
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_RADIUS,
  DEFAULT_SWITCH_SCALE,
  DEFAULT_SWITCH_VARIANT,
  hasSwitchActivationFeedbackEffect,
  hasSwitchThumbSizeEffect,
  join,
  resolveSwitchClassNames,
  resolveVariantElements
} from './Switch.class-names.ts';
import type { SwitchMotionProps, SwitchVariantClassesMap } from './Switch.types.ts';
import type { SwitchMotionWithEffectsProps } from './SwitchMotionWithEffects.tsx';

const LazySwitchMotionWithEffects = lazy(
  () => import('./SwitchMotionWithEffects.tsx')
) as LazyExoticComponent<ComponentType<SwitchMotionWithEffectsProps>>;

type InlineDirection = 1 | -1;

type SwitchMotionThumbProps = {
  activationMotion: SwitchActivationMotion;
  controlState: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  requestSuppressNextClick: () => void;
  setDragPreviewControlState: (controlState: boolean | null) => void;
  setControlState: (controlState: boolean) => void;
  thumbClassName: string;
  thumbRef: RefObject<HTMLSpanElement | null>;
  thumbTranslation: number;
  trackRef: RefObject<HTMLSpanElement | null>;
};

const SWITCH_CONTROL_SIDE_CLASS_NAME = 'k-swt-x2-b';
const SWITCH_CONTROL_TEXT_OFF_CLASS_NAME = 'k-swt-x3-b';
const SWITCH_CONTROL_TEXT_ON_CLASS_NAME = 'k-swt-x4-b';
const SWITCH_CONTROL_VISUAL_CLASS_NAME = 'k-swt-x6-b';
const SWITCH_CONTROL_TEXT_LARGE_QUERY = `(min-width: ${breakpoints['bp:lg:1']}px)`;
const SWITCH_DRAG_CLICK_SUPPRESSION_MS = 450;
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

function parsePixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function subscribeToLargeControlTextViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(SWITCH_CONTROL_TEXT_LARGE_QUERY);
  mediaQueryList.addEventListener('change', onStoreChange);

  return () => {
    mediaQueryList.removeEventListener('change', onStoreChange);
  };
}

function getLargeControlTextViewportSnapshot(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(SWITCH_CONTROL_TEXT_LARGE_QUERY).matches
  );
}

function getLargeControlTextViewportServerSnapshot(): boolean {
  return false;
}

function useLargeControlTextViewport(): boolean {
  return useSyncExternalStore(
    subscribeToLargeControlTextViewport,
    getLargeControlTextViewportSnapshot,
    getLargeControlTextViewportServerSnapshot
  );
}

function useSwitchMotionThumbTranslation(options: {
  trackRef: RefObject<HTMLSpanElement | null>;
  thumbRef: RefObject<HTMLSpanElement | null>;
  onTranslationChange: (translation: number) => void;
}) {
  useEffect(() => {
    const trackElement = options.trackRef.current;
    const thumbElement = options.thumbRef.current;
    if (!trackElement || !thumbElement) return;

    const syncThumbTranslation = () => {
      const trackStyles = getComputedStyle(trackElement);
      const paddingInlineStart = parsePixelValue(trackStyles.paddingInlineStart);
      const paddingInlineEnd = parsePixelValue(trackStyles.paddingInlineEnd);
      const paddingBlockStart = parsePixelValue(trackStyles.paddingBlockStart);
      const paddingBlockEnd = parsePixelValue(trackStyles.paddingBlockEnd);
      const borderInlineStart = parsePixelValue(
        trackStyles.getPropertyValue('border-inline-start-width')
      );
      const borderBlockStart = parsePixelValue(
        trackStyles.getPropertyValue('border-block-start-width')
      );
      const trackContentWidth = trackElement.clientWidth - paddingInlineStart - paddingInlineEnd;
      const trackContentHeight = trackElement.clientHeight - paddingBlockStart - paddingBlockEnd;
      const thumbWidth = thumbElement.offsetWidth;
      const thumbHeight = thumbElement.offsetHeight;
      const translation = Math.max(0, trackContentWidth - thumbWidth);
      const inlineStart = borderInlineStart + paddingInlineStart;
      const blockStart =
        borderBlockStart + paddingBlockStart + Math.max(0, (trackContentHeight - thumbHeight) / 2);
      const scopeElement = trackElement.parentElement ?? trackElement;

      trackElement.style.setProperty('--k-swt-tx', `${translation}px`);
      trackElement.style.setProperty('--k-swt-ti', `${inlineStart}px`);
      trackElement.style.setProperty('--k-swt-ty', `${blockStart}px`);
      scopeElement.style.setProperty('--k-swt-tx', `${translation}px`);
      scopeElement.style.setProperty('--k-swt-ti', `${inlineStart}px`);
      scopeElement.style.setProperty('--k-swt-ty', `${blockStart}px`);
      options.onTranslationChange(translation);
    };

    syncThumbTranslation();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncThumbTranslation) : null;
    resizeObserver?.observe(trackElement);
    resizeObserver?.observe(thumbElement);
    window.addEventListener('resize', syncThumbTranslation);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncThumbTranslation);
      trackElement.style.removeProperty('--k-swt-tx');
      trackElement.style.removeProperty('--k-swt-ti');
      trackElement.style.removeProperty('--k-swt-ty');
      trackElement.parentElement?.style.removeProperty('--k-swt-tx');
      trackElement.parentElement?.style.removeProperty('--k-swt-ti');
      trackElement.parentElement?.style.removeProperty('--k-swt-ty');
    };
  }, [options.onTranslationChange, options.trackRef, options.thumbRef]);
}

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

function SwitchMotionThumb({
  activationMotion,
  controlState,
  disabled,
  readOnly,
  requestSuppressNextClick,
  setDragPreviewControlState,
  setControlState,
  thumbClassName,
  thumbRef,
  thumbTranslation,
  trackRef
}: SwitchMotionThumbProps) {
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
    />
  );
}

function SwitchMotionCoreRoot(props: SwitchMotionProps) {
  const {
    id,
    label,
    controlText,
    className,
    classNames = {},
    inputProps,
    scale = DEFAULT_SWITCH_SCALE,
    emphasis = DEFAULT_SWITCH_EMPHASIS,
    intent = DEFAULT_SWITCH_INTENT,
    radius,
    variant = DEFAULT_SWITCH_VARIANT,
    mode = DEFAULT_SWITCH_MODE,
    labelPosition = DEFAULT_SWITCH_LABEL_POSITION,
    disabled,
    readOnly,
    controlState: controlStateProp,
    defaultControlState,
    onControlStateChange,
    onClickCapture,
    ...rootProps
  } = props;
  const { classesMap, global } = useKiskadee();
  const resolvedRadius =
    radius ??
    global?.components?.switch?.options?.radius ??
    global?.radius ??
    DEFAULT_SWITCH_RADIUS;
  const resolvedActivationMotion =
    global?.components?.switch?.options?.activationMotion ?? DEFAULT_SWITCH_ACTIVATION_MOTION;
  const resolvedControlTextVisibility =
    global?.components?.switch?.options?.controlTextVisibility ??
    DEFAULT_SWITCH_CONTROL_TEXT_VISIBILITY;
  const elements = resolveVariantElements(
    classesMap.switch as SwitchVariantClassesMap | undefined,
    variant,
    mode
  );
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
  const projectedControlState = dragPreviewControlState ?? controlState;
  const isLargeControlTextViewport = useLargeControlTextViewport();
  const hasLabel = label !== undefined && label !== null;
  const hasControlText = controlText !== undefined && controlText !== null;
  const shouldRenderControlText =
    hasControlText &&
    (resolvedControlTextVisibility === 'always' ||
      (resolvedControlTextVisibility === 'largeOnly' && isLargeControlTextViewport));

  useSwitchMotionThumbTranslation({
    trackRef,
    thumbRef,
    onTranslationChange: setThumbTranslation
  });

  const requestSuppressNextClick = useCallback(() => {
    suppressNextClickRef.current = true;
    if (suppressNextClickTimeoutRef.current !== null) {
      window.clearTimeout(suppressNextClickTimeoutRef.current);
    }
    suppressNextClickTimeoutRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = false;
      suppressNextClickTimeoutRef.current = null;
    }, SWITCH_DRAG_CLICK_SUPPRESSION_MS);
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
      if (suppressNextClickRef.current) {
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
    [onClickCapture]
  );

  const resolvedClassNames = useMemo(
    () =>
      resolveSwitchClassNames({
        elements,
        classNames: {
          ...classNames,
          e1: join(classNames.e1, className)
        },
        structuralBranch: 'b',
        scale,
        intent,
        emphasis,
        radius: resolvedRadius,
        activationMotion: resolvedActivationMotion,
        labelPosition,
        hasLabel,
        hasControlText: shouldRenderControlText
      }),
    [
      classNames,
      className,
      elements,
      emphasis,
      hasLabel,
      shouldRenderControlText,
      intent,
      labelPosition,
      resolvedActivationMotion,
      resolvedControlTextVisibility,
      resolvedRadius,
      scale
    ]
  );

  return (
    <HeadlessSwitch.Root
      {...rootProps}
      inputId={id}
      inputProps={inputProps}
      disabled={disabled}
      readOnly={readOnly}
      controlState={projectedControlState}
      onControlStateChange={setControlState}
      onClickCapture={handleClickCapture}
      classNames={resolvedClassNames}
    >
      <span className={SWITCH_CONTROL_SIDE_CLASS_NAME}>
        {shouldRenderControlText && controlText ? (
          <HeadlessSwitch.State>
            <span className={SWITCH_CONTROL_TEXT_OFF_CLASS_NAME}>{controlText.off}</span>
            <span className={SWITCH_CONTROL_TEXT_ON_CLASS_NAME}>{controlText.on}</span>
          </HeadlessSwitch.State>
        ) : null}
        <span className={SWITCH_CONTROL_VISUAL_CLASS_NAME}>
          <HeadlessSwitch.Track ref={trackRef} />
          <SwitchMotionThumb
            activationMotion={resolvedActivationMotion}
            controlState={projectedControlState}
            disabled={disabled}
            readOnly={readOnly}
            requestSuppressNextClick={requestSuppressNextClick}
            setDragPreviewControlState={setDragPreviewControlState}
            setControlState={setControlState}
            thumbClassName={resolvedClassNames.e3}
            thumbRef={thumbRef}
            thumbTranslation={thumbTranslation}
            trackRef={trackRef}
          />
        </span>
      </span>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

const SwitchMotionCore = memo(SwitchMotionCoreRoot);

function SwitchMotionRoot(props: SwitchMotionProps) {
  const {
    scale = DEFAULT_SWITCH_SCALE,
    variant = DEFAULT_SWITCH_VARIANT,
    mode = DEFAULT_SWITCH_MODE
  } = props;
  const { classesMap } = useKiskadee();
  const elements = resolveVariantElements(
    classesMap.switch as SwitchVariantClassesMap | undefined,
    variant,
    mode
  );
  const hasThumbSize = useMemo(
    () => hasSwitchThumbSizeEffect(elements.e3, scale),
    [elements.e3, scale]
  );
  const hasActivationFeedback = useMemo(
    () => hasSwitchActivationFeedbackEffect(elements.e3),
    [elements.e3]
  );

  if (hasThumbSize || hasActivationFeedback) {
    return (
      <Suspense fallback={<SwitchMotionCore {...props} />}>
        <LazySwitchMotionWithEffects {...props} />
      </Suspense>
    );
  }

  return <SwitchMotionCore {...props} />;
}

export const SwitchMotion = memo(SwitchMotionRoot);
