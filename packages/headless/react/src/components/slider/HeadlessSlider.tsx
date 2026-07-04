import { stateActivator as cn, type ProjectedStateKeys } from '@kiskadee/core';
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';

export type SliderValueMode = 'single' | 'range';
export type SliderRangeValue = [number, number];
export type SliderValue = number | SliderRangeValue;
export type SliderThumbIndex = 0 | 1;

export type SliderElementName =
  | 'e1'
  | 'e2'
  | 'e3'
  | 'e4'
  | 'e5'
  | 'e6'
  | 'e7'
  | 'e8'
  | 'e9'
  | 'e10'
  | 'e11'
  | 'e12'
  | 'e13'
  | 'e14'
  | 'e15';

export type SliderStatus = Exclude<ProjectedStateKeys, 'selected' | 'filled'>;

export type SliderClassNames = Partial<Record<SliderElementName, string>>;

type SliderSlotPropsValue = {
  className?: string;
};

type SliderSlotProps = Partial<Record<SliderElementName, SliderSlotPropsValue>>;

type SliderRootDivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'>;

export type SliderFormatValue = (value: number, index: SliderThumbIndex) => ReactNode;

export type SliderThumbInteractionDetails = {
  event: ReactPointerEvent<HTMLDivElement>;
  index: SliderThumbIndex;
};

export type SliderRootProps = SliderRootDivProps & {
  children?: ReactNode;
  classNames?: SliderClassNames;
  labelId?: string | false;
  describedBy?: string;
  valueMode?: SliderValueMode;
  value?: SliderValue;
  defaultValue?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  status?: SliderStatus;
  formatValue?: SliderFormatValue;
  getAriaValueText?: (value: number, index: SliderThumbIndex) => string;
  onThumbInteractionCancel?: (details: SliderThumbInteractionDetails) => void;
  onThumbInteractionEnd?: (details: SliderThumbInteractionDetails) => void;
  onThumbInteractionStart?: (details: SliderThumbInteractionDetails) => void;
  onValueChange?: (value: SliderValue) => void;
};

export type SliderFieldLabelProps = HTMLAttributes<HTMLSpanElement>;
export type SliderValueSummaryProps = HTMLAttributes<HTMLSpanElement>;
export type SliderControlRowProps = HTMLAttributes<HTMLDivElement>;
export type SliderEndpointProps = HTMLAttributes<HTMLSpanElement>;
export type SliderEndpointIconProps = HTMLAttributes<HTMLSpanElement>;
export type SliderEndpointLabelProps = HTMLAttributes<HTMLSpanElement>;
export type SliderTrackProps = HTMLAttributes<HTMLDivElement>;
export type SliderActiveTrackProps = HTMLAttributes<HTMLSpanElement>;
export type SliderThumbInnerProps = HTMLAttributes<HTMLSpanElement>;
export type SliderValueIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  index?: SliderThumbIndex;
};
export type SliderMarkProps = HTMLAttributes<HTMLSpanElement> & {
  value?: number;
};
export type SliderMarkLabelProps = HTMLAttributes<HTMLSpanElement> & {
  value?: number;
};
export type SliderHelperTextProps = HTMLAttributes<HTMLParagraphElement>;

export type SliderThumbProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | 'aria-disabled'
  | 'aria-orientation'
  | 'aria-readonly'
  | 'aria-valuemax'
  | 'aria-valuemin'
  | 'aria-valuenow'
  | 'aria-valuetext'
  | 'role'
  | 'tabIndex'
> & {
  index?: SliderThumbIndex;
};

type SliderContextValue = {
  slotProps: SliderSlotProps;
  labelId: string | undefined;
  describedBy: string | undefined;
  valueMode: SliderValueMode;
  value: SliderValue;
  min: number;
  max: number;
  step: number;
  disabled: boolean | undefined;
  readOnly: boolean | undefined;
  required: boolean | undefined;
  trackRef: React.MutableRefObject<HTMLDivElement | null>;
  getThumbValue: (index: SliderThumbIndex) => number;
  getThumbPercent: (index: SliderThumbIndex) => number;
  getActiveRangePercent: () => SliderRangeValue;
  getFormattedValue: (index: SliderThumbIndex) => ReactNode;
  getAriaValueText: (index: SliderThumbIndex) => string;
  isMarkSelected: (value: number) => boolean;
  setTrackElement: (node: HTMLDivElement | null) => void;
  handleTrackPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleTrackPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleTrackPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleTrackPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleThumbFocus: (index: SliderThumbIndex, event: FocusEvent<HTMLSpanElement>) => void;
  handleThumbBlur: (event: FocusEvent<HTMLSpanElement>) => void;
  handleThumbKeyDown: (index: SliderThumbIndex, event: KeyboardEvent<HTMLSpanElement>) => void;
};

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const MAX_DECIMAL_PLACES = 15;

const SliderContext = createContext<SliderContextValue | null>(null);

function useSliderContext() {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error('Slider compound components must be used within a Slider.Root');
  }
  return context;
}

function mergeClassNames(...parts: Array<string | undefined | null | false>): string | undefined {
  const joined = parts.filter(Boolean).join(' ').trim();
  return joined.length > 0 ? joined : undefined;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  ref.current = value;
}

function finiteNumber(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeBounds(minProp: number | undefined, maxProp: number | undefined) {
  const min = finiteNumber(minProp, DEFAULT_MIN);
  const rawMax = finiteNumber(maxProp, DEFAULT_MAX);
  const max = rawMax > min ? rawMax : min + DEFAULT_STEP;
  return { min, max };
}

function normalizeStep(step: number | undefined): number {
  return typeof step === 'number' && Number.isFinite(step) && step > 0 ? step : DEFAULT_STEP;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getDecimalPlaces(value: number): number {
  const text = String(value).toLowerCase();
  const [base, exponentPart] = text.split('e');
  const exponent = exponentPart ? Number(exponentPart) : 0;
  const decimalIndex = base.indexOf('.');
  const baseDecimalPlaces = decimalIndex >= 0 ? base.length - decimalIndex - 1 : 0;
  return Math.max(0, baseDecimalPlaces - exponent);
}

function roundToStep(value: number, min: number, max: number, step: number): number {
  const decimalPlaces = Math.max(getDecimalPlaces(min), getDecimalPlaces(step));
  const steps = Math.round((value - min) / step);
  const rounded = min + steps * step;
  return clamp(Number(rounded.toFixed(Math.min(decimalPlaces, MAX_DECIMAL_PLACES))), min, max);
}

function normalizeValue(
  value: SliderValue | undefined,
  valueMode: SliderValueMode,
  min: number,
  max: number,
  step: number
): SliderValue {
  if (valueMode === 'range') {
    const rawStart = Array.isArray(value) ? value[0] : min;
    const rawEnd = Array.isArray(value) ? value[1] : typeof value === 'number' ? value : max;
    const start = roundToStep(finiteNumber(rawStart, min), min, max, step);
    const end = roundToStep(finiteNumber(rawEnd, max), min, max, step);
    return [Math.min(start, end), Math.max(start, end)];
  }

  const rawValue = Array.isArray(value) ? value[0] : value;
  return roundToStep(finiteNumber(rawValue, min), min, max, step);
}

function valuesEqual(left: SliderValue, right: SliderValue): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left[0] === right[0] && left[1] === right[1];
  }
  return left === right;
}

function valueToPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function getPointerValue(
  event: ReactPointerEvent,
  track: HTMLDivElement | null,
  min: number,
  max: number
): number {
  if (!track) return min;
  const rect = track.getBoundingClientRect();
  if (rect.width <= 0) return min;
  const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  return clamp(min + ratio * (max - min), min, max);
}

function getThumbIndexFromEventTarget(target: EventTarget | null): SliderThumbIndex | null {
  if (!(target instanceof Element)) return null;
  const thumb = target.closest('[data-slider-thumb-index]');
  const index = thumb?.getAttribute('data-slider-thumb-index');
  return index === '1' ? 1 : index === '0' ? 0 : null;
}

function sliderStateClassName(states: {
  status?: SliderStatus;
  hovered: boolean;
  pressed: boolean;
  focused: boolean;
  focusVisible: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}): string | undefined {
  const isHovered = states.hovered || states.status === 'hover';
  const isPressed = states.pressed || states.status === 'pressed';
  const isFocused = states.focused || states.status === 'focus';
  const isFocusVisible = isFocused && (states.focusVisible || states.status === 'focus');
  const isDisabled = states.disabled || states.status === 'disabled';
  const isReadOnly = states.readOnly || states.status === 'readOnly';
  const hasProjectedState = isHovered || isPressed || isFocused || isDisabled || isReadOnly;

  return mergeClassNames(
    cn.interactive,
    cn.nativeInteraction,
    isHovered && cn.hover,
    isPressed && cn.pressed,
    isFocused && cn.focus,
    isFocusVisible && cn.focusVisible,
    isDisabled && cn.disabled,
    isReadOnly && cn.readOnly,
    hasProjectedState && cn.activator
  );
}

const SliderRoot = forwardRef<HTMLDivElement, SliderRootProps>(function SliderRoot(
  {
    children,
    classNames = {},
    labelId,
    describedBy,
    valueMode = 'single',
    value,
    defaultValue,
    min: minProp,
    max: maxProp,
    step: stepProp,
    disabled,
    readOnly,
    required,
    status,
    formatValue,
    getAriaValueText,
    onThumbInteractionCancel,
    onThumbInteractionEnd,
    onThumbInteractionStart,
    onValueChange,
    onPointerEnter,
    onPointerLeave,
    ...rootProps
  },
  ref
) {
  const generatedId = useId();
  const resolvedLabelId =
    labelId === false ? undefined : (labelId ?? `slider-${generatedId}-label`);
  const { min, max } = normalizeBounds(minProp, maxProp);
  const step = normalizeStep(stepProp);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<SliderValue>(() =>
    normalizeValue(defaultValue, valueMode, min, max, step)
  );
  const resolvedValue = normalizeValue(
    isControlled ? value : uncontrolledValue,
    valueMode,
    min,
    max,
    step
  );
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [activeThumbIndex, setActiveThumbIndex] = useState<SliderThumbIndex>(0);
  const [draggingThumbIndex, setDraggingThumbIndex] = useState<SliderThumbIndex | null>(null);
  const [dragPreviewValue, setDragPreviewValue] = useState<{
    index: SliderThumbIndex;
    value: number;
  } | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const getCommittedThumbValue = useCallback(
    (index: SliderThumbIndex) => {
      if (Array.isArray(resolvedValue)) return resolvedValue[index];
      return resolvedValue;
    },
    [resolvedValue]
  );

  const getVisualThumbValue = useCallback(
    (index: SliderThumbIndex) =>
      dragPreviewValue?.index === index ? dragPreviewValue.value : getCommittedThumbValue(index),
    [dragPreviewValue, getCommittedThumbValue]
  );

  const getThumbValue = useCallback(
    (index: SliderThumbIndex) => roundToStep(getVisualThumbValue(index), min, max, step),
    [getVisualThumbValue, max, min, step]
  );

  const getActiveRangePercent = useCallback((): SliderRangeValue => {
    if (Array.isArray(resolvedValue)) {
      return [
        valueToPercent(getVisualThumbValue(0), min, max),
        valueToPercent(getVisualThumbValue(1), min, max)
      ];
    }
    return [0, valueToPercent(getVisualThumbValue(0), min, max)];
  }, [getVisualThumbValue, max, min, resolvedValue]);

  const getThumbPercent = useCallback(
    (index: SliderThumbIndex) => valueToPercent(getVisualThumbValue(index), min, max),
    [getVisualThumbValue, max, min]
  );

  const commitValue = useCallback(
    (nextValue: SliderValue) => {
      const normalizedValue = normalizeValue(nextValue, valueMode, min, max, step);
      if (valuesEqual(normalizedValue, resolvedValue)) return;
      if (!isControlled) {
        setUncontrolledValue(normalizedValue);
      }
      onValueChange?.(normalizedValue);
    },
    [isControlled, max, min, onValueChange, resolvedValue, step, valueMode]
  );

  const setThumbValue = useCallback(
    (index: SliderThumbIndex, rawValue: number) => {
      if (disabled || readOnly) return;

      if (valueMode === 'range') {
        const [start, end] = Array.isArray(resolvedValue) ? resolvedValue : [min, max];
        const nextValue = roundToStep(rawValue, min, max, step);
        commitValue(
          index === 0 ? [Math.min(nextValue, end), end] : [start, Math.max(nextValue, start)]
        );
        return;
      }

      commitValue(roundToStep(rawValue, min, max, step));
    },
    [commitValue, disabled, max, min, readOnly, resolvedValue, step, valueMode]
  );

  const getConstrainedPreviewValue = useCallback(
    (index: SliderThumbIndex, rawValue: number) => {
      const nextValue = clamp(rawValue, min, max);
      if (valueMode !== 'range') return nextValue;

      const [start, end] = Array.isArray(resolvedValue) ? resolvedValue : [min, max];
      return index === 0 ? Math.min(nextValue, end) : Math.max(nextValue, start);
    },
    [max, min, resolvedValue, valueMode]
  );

  const setThumbPreviewValue = useCallback(
    (index: SliderThumbIndex, rawValue: number) => {
      if (disabled || readOnly) return;
      setDragPreviewValue({
        index,
        value: getConstrainedPreviewValue(index, rawValue)
      });
    },
    [disabled, getConstrainedPreviewValue, readOnly]
  );

  const pickNearestThumbIndex = useCallback(
    (nextValue: number): SliderThumbIndex => {
      if (valueMode !== 'range' || !Array.isArray(resolvedValue)) return 0;
      const startDistance = Math.abs(nextValue - resolvedValue[0]);
      const endDistance = Math.abs(nextValue - resolvedValue[1]);
      if (startDistance === endDistance) return activeThumbIndex;
      return startDistance < endDistance ? 0 : 1;
    },
    [activeThumbIndex, resolvedValue, valueMode]
  );

  const getFormattedValue = useCallback(
    (index: SliderThumbIndex) => {
      const thumbValue = getThumbValue(index);
      return formatValue ? formatValue(thumbValue, index) : String(thumbValue);
    },
    [formatValue, getThumbValue]
  );

  const resolveAriaValueText = useCallback(
    (index: SliderThumbIndex) => {
      const thumbValue = getThumbValue(index);
      return getAriaValueText?.(thumbValue, index) ?? String(thumbValue);
    },
    [getAriaValueText, getThumbValue]
  );

  const isMarkSelected = useCallback(
    (markValue: number) => {
      if (Array.isArray(resolvedValue)) {
        return markValue >= getVisualThumbValue(0) && markValue <= getVisualThumbValue(1);
      }
      return markValue <= getVisualThumbValue(0);
    },
    [getVisualThumbValue, resolvedValue]
  );

  const setTrackElement = useCallback((node: HTMLDivElement | null) => {
    trackRef.current = node;
  }, []);

  const updateThumbFromPointer = useCallback(
    (index: SliderThumbIndex, event: ReactPointerEvent) => {
      const nextValue = getPointerValue(event, trackRef.current, min, max);
      setThumbPreviewValue(index, nextValue);
    },
    [max, min, setThumbPreviewValue]
  );

  const handleTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || disabled || readOnly) return;
      const nextValue = getPointerValue(event, trackRef.current, min, max);
      const targetIndex =
        getThumbIndexFromEventTarget(event.target) ?? pickNearestThumbIndex(nextValue);
      setActiveThumbIndex(targetIndex);
      setDraggingThumbIndex(targetIndex);
      setPressed(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setThumbPreviewValue(targetIndex, nextValue);
      onThumbInteractionStart?.({ event, index: targetIndex });
    },
    [
      disabled,
      max,
      min,
      onThumbInteractionStart,
      pickNearestThumbIndex,
      readOnly,
      setThumbPreviewValue
    ]
  );

  const handleTrackPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || draggingThumbIndex === null || disabled || readOnly) return;
      updateThumbFromPointer(draggingThumbIndex, event);
    },
    [disabled, draggingThumbIndex, readOnly, updateThumbFromPointer]
  );

  const handleTrackPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (draggingThumbIndex !== null && !disabled && !readOnly) {
        const nextValue = getPointerValue(event, trackRef.current, min, max);
        setThumbValue(draggingThumbIndex, nextValue);
      }

      if (draggingThumbIndex !== null) {
        onThumbInteractionEnd?.({ event, index: draggingThumbIndex });
      }

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDraggingThumbIndex(null);
      setDragPreviewValue(null);
      setPressed(false);
    },
    [disabled, draggingThumbIndex, max, min, onThumbInteractionEnd, readOnly, setThumbValue]
  );

  const handleTrackPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (draggingThumbIndex !== null) {
        onThumbInteractionCancel?.({ event, index: draggingThumbIndex });
      }

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDraggingThumbIndex(null);
      setDragPreviewValue(null);
      setPressed(false);
    },
    [draggingThumbIndex, onThumbInteractionCancel]
  );

  const handleThumbFocus = useCallback(
    (index: SliderThumbIndex, event: FocusEvent<HTMLSpanElement>) => {
      setActiveThumbIndex(index);
      setFocused(true);
      setFocusVisible(event.currentTarget.matches(':focus-visible'));
    },
    []
  );

  const handleThumbBlur = useCallback(() => {
    setFocused(false);
    setFocusVisible(false);
  }, []);

  const handleThumbKeyDown = useCallback(
    (index: SliderThumbIndex, event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.defaultPrevented) return;
      if (disabled) return;

      const currentValue = getThumbValue(index);
      let nextValue: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          nextValue = currentValue + step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          nextValue = currentValue - step;
          break;
        case 'PageUp':
          nextValue = currentValue + step * 10;
          break;
        case 'PageDown':
          nextValue = currentValue - step * 10;
          break;
        case 'Home':
          nextValue =
            valueMode === 'range' && index === 1 && Array.isArray(resolvedValue)
              ? resolvedValue[0]
              : min;
          break;
        case 'End':
          nextValue =
            valueMode === 'range' && index === 0 && Array.isArray(resolvedValue)
              ? resolvedValue[1]
              : max;
          break;
        default:
          return;
      }

      event.preventDefault();
      setFocusVisible(true);
      if (!readOnly) {
        setThumbValue(index, nextValue);
      }
    },
    [disabled, getThumbValue, max, min, readOnly, resolvedValue, setThumbValue, step, valueMode]
  );

  const slotProps = useMemo<SliderSlotProps>(() => {
    const stateClassName = sliderStateClassName({
      status,
      hovered,
      pressed,
      focused,
      focusVisible,
      disabled,
      readOnly
    });

    return {
      e1: { className: mergeClassNames(classNames.e1, stateClassName) },
      e2: { className: classNames.e2 },
      e3: { className: classNames.e3 },
      e4: { className: classNames.e4 },
      e5: { className: classNames.e5 },
      e6: { className: classNames.e6 },
      e7: { className: classNames.e7 },
      e8: { className: classNames.e8 },
      e9: { className: classNames.e9 },
      e10: { className: classNames.e10 },
      e11: { className: classNames.e11 },
      e12: { className: classNames.e12 },
      e13: { className: classNames.e13 },
      e14: { className: classNames.e14 },
      e15: { className: classNames.e15 }
    };
  }, [classNames, disabled, focused, focusVisible, hovered, pressed, readOnly, status]);

  const contextValue = useMemo<SliderContextValue>(
    () => ({
      slotProps,
      labelId: resolvedLabelId,
      describedBy,
      valueMode,
      value: resolvedValue,
      min,
      max,
      step,
      disabled,
      readOnly,
      required,
      trackRef,
      getThumbValue,
      getThumbPercent,
      getActiveRangePercent,
      getFormattedValue,
      getAriaValueText: resolveAriaValueText,
      isMarkSelected,
      setTrackElement,
      handleTrackPointerDown,
      handleTrackPointerMove,
      handleTrackPointerUp,
      handleTrackPointerCancel,
      handleThumbFocus,
      handleThumbBlur,
      handleThumbKeyDown
    }),
    [
      describedBy,
      disabled,
      getActiveRangePercent,
      getFormattedValue,
      getThumbPercent,
      getThumbValue,
      handleThumbBlur,
      handleThumbFocus,
      handleThumbKeyDown,
      handleTrackPointerCancel,
      handleTrackPointerDown,
      handleTrackPointerMove,
      handleTrackPointerUp,
      isMarkSelected,
      max,
      min,
      readOnly,
      required,
      resolveAriaValueText,
      resolvedLabelId,
      resolvedValue,
      setTrackElement,
      slotProps,
      step,
      valueMode
    ]
  );
  const { className: rootClassName, ...rootSlotProps } = slotProps.e1 ?? {};

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      setHovered(true);
      onPointerEnter?.(event);
    },
    [onPointerEnter]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      setHovered(false);
      onPointerLeave?.(event);
    },
    [onPointerLeave]
  );

  return (
    <SliderContext.Provider value={contextValue}>
      <div
        {...rootSlotProps}
        ref={ref}
        className={rootClassName}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-required={required ? '' : undefined}
        data-value-mode={valueMode}
        {...rootProps}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {children}
      </div>
    </SliderContext.Provider>
  );
});

const SliderFieldLabel = forwardRef<HTMLSpanElement, SliderFieldLabelProps>(
  function SliderFieldLabel({ className, children, id, ...props }, ref) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e2 ?? {};

    return (
      <span
        {...slotProps}
        ref={ref}
        id={id ?? context.labelId}
        className={mergeClassNames(slotClassName, className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

const SliderValueSummary = forwardRef<HTMLSpanElement, SliderValueSummaryProps>(
  function SliderValueSummary({ className, children, ...props }, ref) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e3 ?? {};
    const content =
      children ??
      (context.valueMode === 'range' ? (
        <>
          {context.getFormattedValue(0)}
          <span aria-hidden="true"> - </span>
          {context.getFormattedValue(1)}
        </>
      ) : (
        context.getFormattedValue(0)
      ));

    return (
      <span
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        {...props}
      >
        {content}
      </span>
    );
  }
);

const SliderControlRow = forwardRef<HTMLDivElement, SliderControlRowProps>(
  function SliderControlRow({ className, children, ...props }, ref) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e4 ?? {};

    return (
      <div
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const SliderEndpoint = forwardRef<HTMLSpanElement, SliderEndpointProps>(function SliderEndpoint(
  { className, children, ...props },
  ref
) {
  const context = useSliderContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e5 ?? {};

  return (
    <span {...slotProps} ref={ref} className={mergeClassNames(slotClassName, className)} {...props}>
      {children}
    </span>
  );
});

const SliderEndpointIcon = forwardRef<HTMLSpanElement, SliderEndpointIconProps>(
  function SliderEndpointIcon(
    { className, children, 'aria-hidden': ariaHidden = true, ...props },
    ref
  ) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e6 ?? {};

    return (
      <span
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        aria-hidden={ariaHidden}
        {...props}
      >
        {children}
      </span>
    );
  }
);

const SliderEndpointLabel = forwardRef<HTMLSpanElement, SliderEndpointLabelProps>(
  function SliderEndpointLabel({ className, children, ...props }, ref) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e7 ?? {};

    return (
      <span
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(function SliderTrack(
  { className, children, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...props },
  ref
) {
  const context = useSliderContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e8 ?? {};

  return (
    <div
      {...slotProps}
      ref={(node) => {
        context.setTrackElement(node);
        assignRef(ref, node);
      }}
      className={mergeClassNames(slotClassName, className)}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        context.handleTrackPointerDown(event);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        context.handleTrackPointerMove(event);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        context.handleTrackPointerUp(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        context.handleTrackPointerCancel(event);
      }}
      {...props}
    >
      {children}
    </div>
  );
});

const SliderActiveTrack = forwardRef<HTMLSpanElement, SliderActiveTrackProps>(
  function SliderActiveTrack({ className, children, style, ...props }, ref) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e9 ?? {};
    const [start, end] = context.getActiveRangePercent();
    const activeStyle = {
      '--k-sld-start': `${start}%`,
      '--k-sld-end': `${end}%`,
      ...style
    } as CSSProperties;

    return (
      <span
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        style={activeStyle}
        aria-hidden="true"
        {...props}
      >
        {children}
      </span>
    );
  }
);

const SliderThumb = forwardRef<HTMLSpanElement, SliderThumbProps>(function SliderThumb(
  {
    className,
    children,
    index = 0,
    style,
    onFocus,
    onBlur,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const context = useSliderContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e10 ?? {};
  const thumbValue = context.getThumbValue(index);
  const thumbStyle = {
    '--k-sld-value': `${context.getThumbPercent(index)}%`,
    ...style
  } as CSSProperties;

  return (
    <span
      {...slotProps}
      {...props}
      ref={ref}
      role="slider"
      tabIndex={context.disabled ? undefined : 0}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabelledBy ?? (ariaLabel || !context.labelId ? undefined : context.labelId)
      }
      aria-describedby={ariaDescribedBy ?? context.describedBy}
      aria-orientation="horizontal"
      aria-valuemin={context.min}
      aria-valuemax={context.max}
      aria-valuenow={thumbValue}
      aria-valuetext={context.getAriaValueText(index)}
      aria-disabled={context.disabled || undefined}
      aria-readonly={context.readOnly || undefined}
      data-slider-thumb-index={index}
      className={mergeClassNames(slotClassName, className)}
      style={thumbStyle}
      onFocus={(event) => {
        context.handleThumbFocus(index, event);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        context.handleThumbBlur(event);
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        context.handleThumbKeyDown(index, event);
      }}
    >
      {children}
    </span>
  );
});

const SliderValueIndicator = forwardRef<HTMLSpanElement, SliderValueIndicatorProps>(
  function SliderValueIndicator({ className, children, index = 0, style, ...props }, ref) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e12 ?? {};
    const indicatorStyle = {
      '--k-sld-value': `${context.getThumbPercent(index)}%`,
      ...style
    } as CSSProperties;

    return (
      <span
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        style={indicatorStyle}
        {...props}
      >
        {children ?? context.getFormattedValue(index)}
      </span>
    );
  }
);

const SliderThumbInner = forwardRef<HTMLSpanElement, SliderThumbInnerProps>(
  function SliderThumbInner(
    { className, children, 'aria-hidden': ariaHidden = true, ...props },
    ref
  ) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e11 ?? {};

    return (
      <span
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        aria-hidden={ariaHidden}
        {...props}
      >
        {children}
      </span>
    );
  }
);

const SliderMark = forwardRef<HTMLSpanElement, SliderMarkProps>(function SliderMark(
  { className, children, value, style, ...props },
  ref
) {
  const context = useSliderContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e13 ?? {};
  const markValue = value ?? context.min;
  const isSelected = context.isMarkSelected(markValue);
  const markStyle = {
    '--k-sld-mark': `${valueToPercent(markValue, context.min, context.max)}%`,
    ...style
  } as CSSProperties;

  return (
    <span
      {...slotProps}
      ref={ref}
      className={mergeClassNames(
        slotClassName,
        isSelected && cn.selected,
        isSelected && cn.activator,
        className
      )}
      data-selected={isSelected ? '' : undefined}
      style={markStyle}
      aria-hidden="true"
      {...props}
    >
      {children}
    </span>
  );
});

const SliderMarkLabel = forwardRef<HTMLSpanElement, SliderMarkLabelProps>(function SliderMarkLabel(
  { className, children, value, style, ...props },
  ref
) {
  const context = useSliderContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e14 ?? {};
  const markValue = value ?? context.min;
  const labelStyle = {
    '--k-sld-mark': `${valueToPercent(markValue, context.min, context.max)}%`,
    ...style
  } as CSSProperties;

  return (
    <span
      {...slotProps}
      ref={ref}
      className={mergeClassNames(slotClassName, className)}
      style={labelStyle}
      {...props}
    >
      {children}
    </span>
  );
});

const SliderHelperText = forwardRef<HTMLParagraphElement, SliderHelperTextProps>(
  function SliderHelperText({ className, children, id, ...props }, ref) {
    const context = useSliderContext();
    const { className: slotClassName, ...slotProps } = context.slotProps.e15 ?? {};

    if (!children) return null;

    return (
      <p
        {...slotProps}
        ref={ref}
        id={id ?? context.describedBy}
        className={mergeClassNames(slotClassName, className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

export const HeadlessSlider = Object.assign(SliderRoot, {
  Root: SliderRoot,
  FieldLabel: SliderFieldLabel,
  ValueSummary: SliderValueSummary,
  ControlRow: SliderControlRow,
  Endpoint: SliderEndpoint,
  EndpointIcon: SliderEndpointIcon,
  EndpointLabel: SliderEndpointLabel,
  Track: SliderTrack,
  ActiveTrack: SliderActiveTrack,
  Thumb: SliderThumb,
  ThumbInner: SliderThumbInner,
  ValueIndicator: SliderValueIndicator,
  Mark: SliderMark,
  MarkLabel: SliderMarkLabel,
  HelperText: SliderHelperText
});

export default HeadlessSlider;
