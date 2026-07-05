import { stateActivator as cn, type ProjectedStateKeys } from '@kiskadee/core';
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  Ref,
  TransitionEvent as ReactTransitionEvent
} from 'react';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';

export type SliderValueMode = 'single' | 'range';
export type SliderRangeValue = [number, number];
export type SliderValue = number | SliderRangeValue;
export type SliderThumbIndex = 0 | 1;
export type SliderThumbCrossing = 'prevent' | 'swap';
export type SliderThumbEdgeBehavior = 'overflow' | 'contain';
export type SliderActiveTrackOrigin = 'min' | 'center' | number;

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
  | 'e15'
  | 'e16';

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

export type SliderThumbInteractionSwitchDetails = {
  event: ReactPointerEvent<HTMLDivElement>;
  fromIndex: SliderThumbIndex;
  toIndex: SliderThumbIndex;
};

export type SliderValueIndicatorRenderDetails = {
  value: number;
  index: SliderThumbIndex;
  formattedValue: ReactNode;
};

export type SliderValueSummaryRenderDetails = {
  value: SliderValue;
  values: readonly number[];
  formattedValue: ReactNode;
  formattedValues: readonly ReactNode[];
  valueMode: SliderValueMode;
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
  thumbCrossing?: SliderThumbCrossing;
  thumbEdgeBehavior?: SliderThumbEdgeBehavior;
  activeTrackOrigin?: SliderActiveTrackOrigin;
  onThumbInteractionCancel?: (details: SliderThumbInteractionDetails) => void;
  onThumbInteractionEnd?: (details: SliderThumbInteractionDetails) => void;
  onThumbInteractionStart?: (details: SliderThumbInteractionDetails) => void;
  onThumbInteractionSwitch?: (details: SliderThumbInteractionSwitchDetails) => void;
  onValueChange?: (value: SliderValue) => void;
};

export type SliderFieldLabelProps = HTMLAttributes<HTMLSpanElement>;
export type SliderValueSummaryProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children?: ReactNode | ((details: SliderValueSummaryRenderDetails) => ReactNode);
};
export type SliderControlRowProps = HTMLAttributes<HTMLDivElement>;
export type SliderEndpointProps = HTMLAttributes<HTMLSpanElement>;
export type SliderEndpointIconProps = HTMLAttributes<HTMLSpanElement>;
export type SliderEndpointLabelProps = HTMLAttributes<HTMLSpanElement>;
export type SliderTrackProps = HTMLAttributes<HTMLDivElement>;
export type SliderActiveTrackProps = HTMLAttributes<HTMLSpanElement>;
export type SliderThumbInnerProps = HTMLAttributes<HTMLSpanElement>;
export type SliderValueIndicatorProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children?: ReactNode | ((details: SliderValueIndicatorRenderDetails) => ReactNode);
  index?: SliderThumbIndex;
};
export type SliderMarkProps = HTMLAttributes<HTMLSpanElement> & {
  value?: number;
};
export type SliderMarkLabelProps = HTMLAttributes<HTMLSpanElement> & {
  value?: number;
};
export type SliderOriginMarkProps = HTMLAttributes<HTMLSpanElement>;
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
  getValuePercent: (value: number) => number;
  getActiveRangePercent: () => SliderRangeValue;
  getActiveTrackOriginValue: () => number | null;
  getFormattedValue: (index: SliderThumbIndex) => ReactNode;
  getAriaValueText: (index: SliderThumbIndex) => string;
  isSettling: () => boolean;
  isThumbDragging: (index: SliderThumbIndex) => boolean;
  isThumbSettling: (index: SliderThumbIndex) => boolean;
  isMarkSelected: (value: number) => boolean;
  setTrackElement: (node: HTMLDivElement | null) => void;
  setThumbElement: (index: SliderThumbIndex, node: HTMLSpanElement | null) => void;
  handleTrackPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleTrackPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleTrackPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleTrackPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleThumbFocus: (index: SliderThumbIndex, event: FocusEvent<HTMLSpanElement>) => void;
  handleThumbBlur: (event: FocusEvent<HTMLSpanElement>) => void;
  handleThumbKeyDown: (index: SliderThumbIndex, event: KeyboardEvent<HTMLSpanElement>) => void;
  handleThumbTransitionEnd: (
    index: SliderThumbIndex,
    event: ReactTransitionEvent<HTMLSpanElement>
  ) => void;
};

type SliderDragPreview =
  | {
      valueMode: 'single';
      index: SliderThumbIndex;
      value: number;
    }
  | {
      valueMode: 'range';
      index: SliderThumbIndex;
      values: SliderRangeValue;
    };

type SliderGeometry = {
  trackWidth: number;
  thumbWidths: SliderRangeValue;
};

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const MAX_DECIMAL_PLACES = 15;
const SETTLE_FALLBACK_TIMEOUT_MS = 240;
const DEFAULT_SLIDER_GEOMETRY: SliderGeometry = {
  trackWidth: 0,
  thumbWidths: [0, 0]
};

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

function getThumbEdgeInset(
  thumbEdgeBehavior: SliderThumbEdgeBehavior,
  geometry: SliderGeometry
): number {
  if (thumbEdgeBehavior !== 'contain' || geometry.trackWidth <= 0) return 0;
  const maxThumbWidth = Math.max(geometry.thumbWidths[0], geometry.thumbWidths[1]);
  return Math.min(maxThumbWidth / 2, geometry.trackWidth / 2);
}

function valueToVisualPercent(
  value: number,
  min: number,
  max: number,
  thumbEdgeBehavior: SliderThumbEdgeBehavior,
  geometry: SliderGeometry
): number {
  const rawPercent = valueToPercent(value, min, max);
  const edgeInset = getThumbEdgeInset(thumbEdgeBehavior, geometry);
  if (edgeInset <= 0 || geometry.trackWidth <= 0) return rawPercent;
  const availableWidth = geometry.trackWidth - edgeInset * 2;
  if (availableWidth <= 0) return 50;
  const visualPosition = edgeInset + (rawPercent / 100) * availableWidth;
  return (visualPosition / geometry.trackWidth) * 100;
}

function getPointerValue(
  event: ReactPointerEvent,
  track: HTMLDivElement | null,
  min: number,
  max: number,
  thumbEdgeBehavior: SliderThumbEdgeBehavior,
  geometry: SliderGeometry
): number {
  if (!track) return min;
  const rect = track.getBoundingClientRect();
  if (rect.width <= 0) return min;
  const edgeInset = getThumbEdgeInset(thumbEdgeBehavior, geometry);
  const availableWidth = rect.width - edgeInset * 2;
  if (availableWidth <= 0) return min;
  const ratio = clamp((event.clientX - rect.left - edgeInset) / availableWidth, 0, 1);
  return clamp(min + ratio * (max - min), min, max);
}

function resolveActiveTrackOriginValue(
  activeTrackOrigin: SliderActiveTrackOrigin,
  min: number,
  max: number
): number {
  if (activeTrackOrigin === 'center') return min + (max - min) / 2;
  if (typeof activeTrackOrigin === 'number') return clamp(activeTrackOrigin, min, max);
  return min;
}

function getOppositeThumbIndex(index: SliderThumbIndex): SliderThumbIndex {
  return index === 0 ? 1 : 0;
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
    thumbCrossing = 'swap',
    thumbEdgeBehavior = 'overflow',
    activeTrackOrigin = 'min',
    onThumbInteractionCancel,
    onThumbInteractionEnd,
    onThumbInteractionStart,
    onThumbInteractionSwitch,
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
  const [settlingThumbIndex, setSettlingThumbIndex] = useState<SliderThumbIndex | null>(null);
  const [dragPreviewValue, setDragPreviewValue] = useState<SliderDragPreview | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<[HTMLSpanElement | null, HTMLSpanElement | null]>([null, null]);
  const [geometry, setGeometry] = useState<SliderGeometry>(DEFAULT_SLIDER_GEOMETRY);

  const measureGeometry = useCallback(() => {
    const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 0;
    const thumbWidths: SliderRangeValue = [
      thumbRefs.current[0]?.getBoundingClientRect().width ?? 0,
      thumbRefs.current[1]?.getBoundingClientRect().width ?? 0
    ];

    setGeometry((currentGeometry) =>
      currentGeometry.trackWidth === trackWidth &&
      currentGeometry.thumbWidths[0] === thumbWidths[0] &&
      currentGeometry.thumbWidths[1] === thumbWidths[1]
        ? currentGeometry
        : { trackWidth, thumbWidths }
    );
  }, []);

  useEffect(() => {
    if (settlingThumbIndex === null) return undefined;

    const timeoutId = setTimeout(() => {
      setSettlingThumbIndex((currentIndex) =>
        currentIndex === settlingThumbIndex ? null : currentIndex
      );
    }, SETTLE_FALLBACK_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [settlingThumbIndex]);

  useEffect(() => {
    measureGeometry();
    if (typeof ResizeObserver === 'undefined') return undefined;

    const resizeObserver = new ResizeObserver(() => {
      measureGeometry();
    });
    const observedElements = [trackRef.current, thumbRefs.current[0], thumbRefs.current[1]];

    for (const element of observedElements) {
      if (element) resizeObserver.observe(element);
    }

    return () => resizeObserver.disconnect();
  }, [measureGeometry, valueMode]);

  const getCommittedThumbValue = useCallback(
    (index: SliderThumbIndex) => {
      if (Array.isArray(resolvedValue)) return resolvedValue[index];
      return resolvedValue;
    },
    [resolvedValue]
  );

  const getVisualThumbValue = useCallback(
    (index: SliderThumbIndex) => {
      if (dragPreviewValue?.valueMode === 'range') {
        return dragPreviewValue.values[index];
      }

      if (dragPreviewValue?.valueMode === 'single' && dragPreviewValue.index === index) {
        return dragPreviewValue.value;
      }

      return getCommittedThumbValue(index);
    },
    [dragPreviewValue, getCommittedThumbValue]
  );

  const getThumbValue = useCallback(
    (index: SliderThumbIndex) => roundToStep(getVisualThumbValue(index), min, max, step),
    [getVisualThumbValue, max, min, step]
  );

  const getValuePercent = useCallback(
    (value: number) =>
      valueToVisualPercent(value, min, max, thumbEdgeBehavior, geometry),
    [geometry, max, min, thumbEdgeBehavior]
  );

  const getActiveTrackOriginValue = useCallback(() => {
    if (Array.isArray(resolvedValue)) return null;
    return resolveActiveTrackOriginValue(activeTrackOrigin, min, max);
  }, [activeTrackOrigin, max, min, resolvedValue]);

  const getActiveRangePercent = useCallback((): SliderRangeValue => {
    if (Array.isArray(resolvedValue)) {
      return [
        getValuePercent(getVisualThumbValue(0)),
        getValuePercent(getVisualThumbValue(1))
      ];
    }
    const originPercent = getValuePercent(resolveActiveTrackOriginValue(activeTrackOrigin, min, max));
    const thumbPercent = getValuePercent(getVisualThumbValue(0));
    return [Math.min(originPercent, thumbPercent), Math.max(originPercent, thumbPercent)];
  }, [activeTrackOrigin, getValuePercent, getVisualThumbValue, max, min, resolvedValue]);

  const getThumbPercent = useCallback(
    (index: SliderThumbIndex) => getValuePercent(getVisualThumbValue(index)),
    [getValuePercent, getVisualThumbValue]
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

  const switchDraggingThumbIndex = useCallback(
    (
      fromIndex: SliderThumbIndex,
      toIndex: SliderThumbIndex,
      event: ReactPointerEvent<HTMLDivElement>
    ) => {
      if (fromIndex === toIndex) return;
      setActiveThumbIndex(toIndex);
      setDraggingThumbIndex(toIndex);
      onThumbInteractionSwitch?.({ event, fromIndex, toIndex });
    },
    [onThumbInteractionSwitch]
  );

  const getCurrentRangeValues = useCallback((): SliderRangeValue => {
    if (dragPreviewValue?.valueMode === 'range') return dragPreviewValue.values;
    return Array.isArray(resolvedValue) ? resolvedValue : [min, max];
  }, [dragPreviewValue, max, min, resolvedValue]);

  const resolveRangePreview = useCallback(
    (
      index: SliderThumbIndex,
      rawValue: number,
      crossing: SliderThumbCrossing
    ): { index: SliderThumbIndex; values: SliderRangeValue } => {
      const nextValue = clamp(rawValue, min, max);
      const currentValues = getCurrentRangeValues();
      const stationaryValue = currentValues[getOppositeThumbIndex(index)];

      if (crossing !== 'swap') {
        return index === 0
          ? {
              index,
              values: [Math.min(nextValue, stationaryValue), stationaryValue]
            }
          : {
              index,
              values: [stationaryValue, Math.max(nextValue, stationaryValue)]
            };
      }

      const nextIndex =
        nextValue < stationaryValue ? 0 : nextValue > stationaryValue ? 1 : index;
      return nextIndex === 0
        ? {
            index: nextIndex,
            values: [nextValue, stationaryValue]
          }
        : {
            index: nextIndex,
            values: [stationaryValue, nextValue]
          };
    },
    [getCurrentRangeValues, max, min]
  );

  const setThumbValue = useCallback(
    (
      index: SliderThumbIndex,
      rawValue: number,
      options: { allowCrossing?: boolean } = {}
    ) => {
      if (disabled || readOnly) return;

      if (valueMode === 'range') {
        const crossing = options.allowCrossing ? thumbCrossing : 'prevent';
        commitValue(resolveRangePreview(index, rawValue, crossing).values);
        return;
      }

      commitValue(roundToStep(rawValue, min, max, step));
    },
    [
      commitValue,
      disabled,
      max,
      min,
      readOnly,
      resolveRangePreview,
      step,
      thumbCrossing,
      valueMode
    ]
  );

  const setThumbPreviewValue = useCallback(
    (index: SliderThumbIndex, rawValue: number, event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;

      if (valueMode === 'range') {
        const preview = resolveRangePreview(index, rawValue, thumbCrossing);
        switchDraggingThumbIndex(index, preview.index, event);
        setDragPreviewValue({
          valueMode: 'range',
          index: preview.index,
          values: preview.values
        });
        return;
      }

      setDragPreviewValue({
        valueMode: 'single',
        index,
        value: clamp(rawValue, min, max)
      });
    },
    [
      disabled,
      max,
      min,
      readOnly,
      resolveRangePreview,
      switchDraggingThumbIndex,
      thumbCrossing,
      valueMode
    ]
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
      const originValue = resolveActiveTrackOriginValue(activeTrackOrigin, min, max);
      const thumbValue = getVisualThumbValue(0);
      return markValue >= Math.min(originValue, thumbValue) && markValue <= Math.max(originValue, thumbValue);
    },
    [activeTrackOrigin, getVisualThumbValue, max, min, resolvedValue]
  );

  const isSettling = useCallback(() => settlingThumbIndex !== null, [settlingThumbIndex]);

  const isThumbDragging = useCallback(
    (index: SliderThumbIndex) => draggingThumbIndex === index,
    [draggingThumbIndex]
  );

  const isThumbSettling = useCallback(
    (index: SliderThumbIndex) => settlingThumbIndex === index,
    [settlingThumbIndex]
  );

  const setTrackElement = useCallback(
    (node: HTMLDivElement | null) => {
      trackRef.current = node;
      measureGeometry();
    },
    [measureGeometry]
  );

  const setThumbElement = useCallback(
    (index: SliderThumbIndex, node: HTMLSpanElement | null) => {
      thumbRefs.current[index] = node;
      measureGeometry();
    },
    [measureGeometry]
  );

  const updateThumbFromPointer = useCallback(
    (index: SliderThumbIndex, event: ReactPointerEvent<HTMLDivElement>) => {
      const nextValue = getPointerValue(
        event,
        trackRef.current,
        min,
        max,
        thumbEdgeBehavior,
        geometry
      );
      setThumbPreviewValue(index, nextValue, event);
    },
    [geometry, max, min, setThumbPreviewValue, thumbEdgeBehavior]
  );

  const handleTrackPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || disabled || readOnly) return;
      const nextValue = getPointerValue(
        event,
        trackRef.current,
        min,
        max,
        thumbEdgeBehavior,
        geometry
      );
      const targetIndex =
        getThumbIndexFromEventTarget(event.target) ?? pickNearestThumbIndex(nextValue);
      setActiveThumbIndex(targetIndex);
      setDraggingThumbIndex(targetIndex);
      setSettlingThumbIndex(null);
      setPressed(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      onThumbInteractionStart?.({ event, index: targetIndex });
      setThumbPreviewValue(targetIndex, nextValue, event);
    },
    [
      disabled,
      geometry,
      max,
      min,
      onThumbInteractionStart,
      pickNearestThumbIndex,
      readOnly,
      setThumbPreviewValue,
      thumbEdgeBehavior
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
      const nextValue = getPointerValue(
        event,
        trackRef.current,
        min,
        max,
        thumbEdgeBehavior,
        geometry
      );
      const nextPreview =
        draggingThumbIndex === null || valueMode !== 'range'
          ? null
          : resolveRangePreview(draggingThumbIndex, nextValue, thumbCrossing);
      const nextDraggingThumbIndex =
        nextPreview?.index ?? draggingThumbIndex;

      if (
        draggingThumbIndex !== null &&
        nextDraggingThumbIndex !== null &&
        !disabled &&
        !readOnly
      ) {
        switchDraggingThumbIndex(draggingThumbIndex, nextDraggingThumbIndex, event);
        if (nextPreview) {
          commitValue(nextPreview.values);
        } else {
          setThumbValue(nextDraggingThumbIndex, nextValue, {
            allowCrossing: false
          });
        }
        setSettlingThumbIndex(nextDraggingThumbIndex);
      }

      if (nextDraggingThumbIndex !== null) {
        onThumbInteractionEnd?.({ event, index: nextDraggingThumbIndex });
      }

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDraggingThumbIndex(null);
      setDragPreviewValue(null);
      setPressed(false);
    },
    [
      commitValue,
      disabled,
      draggingThumbIndex,
      geometry,
      max,
      min,
      onThumbInteractionEnd,
      readOnly,
      resolveRangePreview,
      setThumbValue,
      switchDraggingThumbIndex,
      thumbCrossing,
      thumbEdgeBehavior,
      valueMode
    ]
  );

  const handleTrackPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (draggingThumbIndex !== null) {
        onThumbInteractionCancel?.({ event, index: draggingThumbIndex });
      }

      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDraggingThumbIndex(null);
      setSettlingThumbIndex(null);
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
        setThumbValue(index, nextValue, { allowCrossing: false });
      }
    },
    [disabled, getThumbValue, max, min, readOnly, resolvedValue, setThumbValue, step, valueMode]
  );

  const handleThumbTransitionEnd = useCallback(
    (index: SliderThumbIndex, event: ReactTransitionEvent<HTMLSpanElement>) => {
      if (event.target !== event.currentTarget) return;
      setSettlingThumbIndex((currentIndex) => (currentIndex === index ? null : currentIndex));
    },
    []
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
      e15: { className: classNames.e15 },
      e16: { className: classNames.e16 }
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
      getValuePercent,
      getActiveRangePercent,
      getActiveTrackOriginValue,
      getFormattedValue,
      getAriaValueText: resolveAriaValueText,
      isSettling,
      isThumbDragging,
      isThumbSettling,
      isMarkSelected,
      setTrackElement,
      setThumbElement,
      handleTrackPointerDown,
      handleTrackPointerMove,
      handleTrackPointerUp,
      handleTrackPointerCancel,
      handleThumbFocus,
      handleThumbBlur,
      handleThumbKeyDown,
      handleThumbTransitionEnd
    }),
    [
      describedBy,
      disabled,
      getActiveRangePercent,
      getActiveTrackOriginValue,
      getFormattedValue,
      getThumbPercent,
      getThumbValue,
      getValuePercent,
      handleThumbBlur,
      handleThumbFocus,
      handleThumbKeyDown,
      handleThumbTransitionEnd,
      handleTrackPointerCancel,
      handleTrackPointerDown,
      handleTrackPointerMove,
      handleTrackPointerUp,
      isMarkSelected,
      isSettling,
      isThumbDragging,
      isThumbSettling,
      max,
      min,
      readOnly,
      required,
      resolveAriaValueText,
      resolvedLabelId,
      resolvedValue,
      setTrackElement,
      setThumbElement,
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
    const values =
      context.valueMode === 'range'
        ? ([context.getThumbValue(0), context.getThumbValue(1)] as const)
        : ([context.getThumbValue(0)] as const);
    const formattedValues =
      context.valueMode === 'range'
        ? ([context.getFormattedValue(0), context.getFormattedValue(1)] as const)
        : ([context.getFormattedValue(0)] as const);
    const formattedValue =
      context.valueMode === 'range' ? (
        <>
          {formattedValues[0]}
          <span aria-hidden="true"> - </span>
          {formattedValues[1]}
        </>
      ) : (
        formattedValues[0]
      );
    const summaryValue: SliderValue =
      context.valueMode === 'range'
        ? [values[0] ?? context.min, values[1] ?? context.max]
        : (values[0] ?? context.min);
    const content =
      typeof children === 'function'
        ? children({
            value: summaryValue,
            values,
            formattedValue,
            formattedValues,
            valueMode: context.valueMode
          })
        : (children ?? formattedValue);

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
  const { setTrackElement } = context;
  const setTrackRef = useCallback(
    (node: HTMLDivElement | null) => {
      setTrackElement(node);
      assignRef(ref, node);
    },
    [ref, setTrackElement]
  );

  return (
    <div
      {...slotProps}
      ref={setTrackRef}
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
        data-slider-settling={context.isSettling() ? '' : undefined}
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
    onTransitionEnd,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const context = useSliderContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e10 ?? {};
  const { setThumbElement } = context;
  const thumbValue = context.getThumbValue(index);
  const setThumbRef = useCallback(
    (node: HTMLSpanElement | null) => {
      setThumbElement(index, node);
      assignRef(ref, node);
    },
    [index, ref, setThumbElement]
  );
  const thumbStyle = {
    '--k-sld-value': `${context.getThumbPercent(index)}%`,
    ...style
    } as CSSProperties;

  return (
    <span
      {...slotProps}
      {...props}
      ref={setThumbRef}
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
      data-slider-dragging={context.isThumbDragging(index) ? '' : undefined}
      data-slider-settling={context.isThumbSettling(index) ? '' : undefined}
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
      onTransitionEnd={(event) => {
        onTransitionEnd?.(event);
        context.handleThumbTransitionEnd(index, event);
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
    const value = context.getThumbValue(index);
    const formattedValue = context.getFormattedValue(index);
    const indicatorStyle = {
      '--k-sld-value': `${context.getThumbPercent(index)}%`,
      ...style
    } as CSSProperties;

    return (
      <span
        {...slotProps}
        ref={ref}
        className={mergeClassNames(slotClassName, className)}
        data-slider-dragging={context.isThumbDragging(index) ? '' : undefined}
        data-slider-settling={context.isThumbSettling(index) ? '' : undefined}
        style={indicatorStyle}
        {...props}
      >
        {typeof children === 'function'
          ? children({ value, index, formattedValue })
          : (children ?? formattedValue)}
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
    '--k-sld-mark': `${context.getValuePercent(markValue)}%`,
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
    '--k-sld-mark': `${context.getValuePercent(markValue)}%`,
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

const SliderOriginMark = forwardRef<HTMLSpanElement, SliderOriginMarkProps>(function SliderOriginMark(
  { className, style, ...props },
  ref
) {
  const context = useSliderContext();
  const { className: slotClassName, ...slotProps } = context.slotProps.e16 ?? {};
  const originValue = context.getActiveTrackOriginValue();

  if (originValue === null) return null;

  const markStyle = {
    '--k-sld-mark': `${context.getValuePercent(originValue)}%`,
    ...style
  } as CSSProperties;

  return (
    <span
      {...slotProps}
      ref={ref}
      className={mergeClassNames(slotClassName, className)}
      data-slider-origin-mark=""
      style={markStyle}
      aria-hidden="true"
      {...props}
    />
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
  OriginMark: SliderOriginMark,
  HelperText: SliderHelperText
});

export default HeadlessSlider;
