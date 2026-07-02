import './Slider.structural.scss';
import { HeadlessSlider } from '@kiskadee/react-headless';
import { memo, useId, useMemo } from 'react';
import { useIsCompactViewport } from '../../shared/interaction/useIsCompactViewport.ts';
import { useIsLikelyTouch } from '../../shared/interaction/useIsLikelyTouch.ts';
import { useSliderArtifactConfig } from './hooks/useSliderArtifactConfig.ts';
import {
  DEFAULT_SLIDER_EMPHASIS,
  DEFAULT_SLIDER_INTENT,
  DEFAULT_SLIDER_RADIUS,
  DEFAULT_SLIDER_SCALE,
  join,
  resolveSliderClassNames,
  resolveVariantElements
} from './Slider.class-names.ts';
import type {
  SliderClassNames,
  SliderEdgeMarkLabelPlacementOption,
  SliderEdgeMarksOption,
  SliderEndpoint,
  SliderMarkLabelPlacementOption,
  SliderMark,
  SliderMarks,
  SliderResolvedEdgeMarkLabelPlacement,
  SliderResolvedMarkLabelPlacement,
  SliderProps
} from './Slider.types.ts';

const EMPTY_SLIDER_CLASS_NAMES: SliderClassNames = {};
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const STEP_MARK_LIMIT = 101;

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

function generateStepMarks(min: number, max: number, step: number): SliderMark[] {
  const count = Math.floor((max - min) / step);
  if (count < 1 || count + 1 > STEP_MARK_LIMIT) return [];

  const marks: SliderMark[] = [];
  for (let index = 0; index <= count; index += 1) {
    marks.push({ value: Number((min + index * step).toFixed(10)) });
  }

  if (marks[marks.length - 1]?.value !== max) {
    marks.push({ value: max });
  }

  return marks;
}

function resolveMarks(
  marks: SliderMarks | undefined,
  min: number,
  max: number,
  step: number
): SliderMark[] {
  if (marks === false || marks === 'none' || marks === undefined) return [];
  if (marks === 'step') return generateStepMarks(min, max, step);
  return marks
    .filter((mark) => Number.isFinite(mark.value) && mark.value >= min && mark.value <= max)
    .map((mark) => ({ value: mark.value, label: mark.label }));
}

function applyEdgeMarks(
  marks: SliderMark[],
  min: number,
  max: number,
  edgeMarks: SliderEdgeMarksOption
): SliderMark[] {
  if (edgeMarks === 'include') return marks;
  return marks.filter((mark) => mark.value !== min && mark.value !== max);
}

function resolveMarkLabelPlacement(
  placement: SliderMarkLabelPlacementOption,
  isLikelyTouch: boolean
): SliderResolvedMarkLabelPlacement {
  if (placement !== 'auto') return placement;
  return isLikelyTouch ? 'above' : 'below';
}

function resolveEdgeMarkLabelPlacement(
  placement: SliderEdgeMarkLabelPlacementOption,
  isCompactViewport: boolean
): SliderResolvedEdgeMarkLabelPlacement {
  if (placement !== 'auto') return placement;
  return isCompactViewport ? 'markLabels' : 'endpoints';
}

function isEdgeMark(mark: SliderMark, min: number, max: number): boolean {
  return mark.value === min || mark.value === max;
}

function getEdgeMarkLabel(
  marks: SliderMark[],
  value: number
): SliderMark['label'] | undefined {
  return marks.find((mark) => mark.value === value && mark.label !== undefined)?.label;
}

function hasEndpointContent(endpoint: SliderEndpoint | undefined): boolean {
  return endpoint?.icon !== undefined || endpoint?.label !== undefined;
}

function renderEndpoint(
  side: 'start' | 'end',
  endpoint: SliderEndpoint | undefined,
  edgeMarkLabel: SliderMark['label'] | undefined
) {
  const hasEdgeMarkLabel = edgeMarkLabel !== undefined;
  if (!hasEndpointContent(endpoint) && !hasEdgeMarkLabel) return null;

  const endpointIcon =
    endpoint?.icon !== undefined ? (
      <HeadlessSlider.EndpointIcon>{endpoint.icon}</HeadlessSlider.EndpointIcon>
    ) : null;
  const endpointLabel =
    endpoint?.label !== undefined ? (
      <HeadlessSlider.EndpointLabel>{endpoint.label}</HeadlessSlider.EndpointLabel>
    ) : null;
  const edgeMarkLabelNode = hasEdgeMarkLabel ? (
    <HeadlessSlider.EndpointLabel>{edgeMarkLabel}</HeadlessSlider.EndpointLabel>
  ) : null;

  return (
    <HeadlessSlider.Endpoint>
      {side === 'end' ? edgeMarkLabelNode : null}
      {side === 'end' ? endpointLabel : endpointIcon}
      {side === 'end' ? endpointIcon : endpointLabel}
      {side === 'start' ? edgeMarkLabelNode : null}
    </HeadlessSlider.Endpoint>
  );
}

function resolveValueMode(valueMode: SliderProps['valueMode'], props: SliderProps) {
  if (valueMode) return valueMode;
  return Array.isArray(props.value) || Array.isArray(props.defaultValue) ? 'range' : 'single';
}

function resolveThumbKey(index: 0 | 1): 'start' | 'end' {
  return index === 0 ? 'start' : 'end';
}

function SliderRoot(props: SliderProps) {
  const {
    id,
    label,
    labelAdornment,
    helperText,
    className,
    classNames = EMPTY_SLIDER_CLASS_NAMES,
    scale = DEFAULT_SLIDER_SCALE,
    emphasis = DEFAULT_SLIDER_EMPHASIS,
    intent = DEFAULT_SLIDER_INTENT,
    radius = DEFAULT_SLIDER_RADIUS,
    variant,
    mode,
    valueMode,
    value,
    defaultValue,
    min: minProp,
    max: maxProp,
    step: stepProp,
    required,
    endpoints,
    marks,
    edgeMarks,
    markLabelPlacement,
    edgeMarkLabelPlacement,
    valueDisplay,
    formatValue,
    thumbAriaLabels,
    thumbAriaLabelledBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rootProps
  } = props;
  const isLikelyTouch = useIsLikelyTouch();
  const isCompactViewport = useIsCompactViewport();
  const generatedId = useId();
  const rootId = id ?? `slider-${generatedId}`;
  const labelId = `${rootId}-label`;
  const helperTextId = `${rootId}-helper`;
  const { sliderClassesMap, options } = useSliderArtifactConfig();
  const resolvedVariant = variant ?? options.variant;
  const resolvedMode = mode ?? options.mode;
  const resolvedValueDisplay = valueDisplay ?? options.valueDisplay;
  const resolvedMarkLabelPlacement = resolveMarkLabelPlacement(
    markLabelPlacement ?? options.markLabelPlacement,
    isLikelyTouch
  );
  const resolvedEdgeMarkLabelPlacement = resolveEdgeMarkLabelPlacement(
    edgeMarkLabelPlacement ?? options.edgeMarkLabelPlacement,
    isCompactViewport
  );
  const resolvedValueMode = resolveValueMode(valueMode, props);
  const { min, max } = normalizeBounds(minProp, maxProp);
  const step = normalizeStep(stepProp);
  const resolvedEdgeMarks = edgeMarks ?? options.edgeMarks;
  const normalizedMarks = useMemo(
    () => resolveMarks(marks ?? options.marks, min, max, step),
    [marks, max, min, options.marks, step]
  );
  const visualMarks = useMemo(
    () => applyEdgeMarks(normalizedMarks, min, max, resolvedEdgeMarks),
    [max, min, normalizedMarks, resolvedEdgeMarks]
  );
  const markLabels = useMemo(
    () =>
      normalizedMarks.filter(
        (mark) =>
          mark.label !== undefined &&
          (!isEdgeMark(mark, min, max) || resolvedEdgeMarkLabelPlacement === 'markLabels')
      ),
    [max, min, normalizedMarks, resolvedEdgeMarkLabelPlacement]
  );
  const shouldRenderEdgeMarkLabelsAsEndpoints = resolvedEdgeMarkLabelPlacement === 'endpoints';
  const startEdgeMarkLabel = shouldRenderEdgeMarkLabelsAsEndpoints
    ? getEdgeMarkLabel(normalizedMarks, min)
    : undefined;
  const endEdgeMarkLabel = shouldRenderEdgeMarkLabelsAsEndpoints
    ? getEdgeMarkLabel(normalizedMarks, max)
    : undefined;
  const hasLabel = label !== undefined && label !== null;
  const hasValueSummary = resolvedValueDisplay === 'summary' || resolvedValueDisplay === 'both';
  const hasValueIndicator = resolvedValueDisplay === 'tooltip' || resolvedValueDisplay === 'both';
  const hasHelperText = helperText !== undefined && helperText !== null;
  const elements = resolveVariantElements(sliderClassesMap, resolvedVariant, resolvedMode);
  const structuralClassNames = useMemo(
    () =>
      resolveSliderClassNames({
        elements,
        classNames: {
          ...classNames,
          e1: join(classNames.e1, className)
        },
        structuralBranch: 'a',
        scale,
        intent,
        emphasis,
        radius,
        hasLabel,
        hasValueSummary,
        hasHelperText,
        markLabelPlacement: resolvedMarkLabelPlacement
      }),
    [
      className,
      classNames,
      elements,
      emphasis,
      hasHelperText,
      hasLabel,
      hasValueSummary,
      intent,
      radius,
      resolvedMarkLabelPlacement,
      scale
    ]
  );
  const describedBy = join(ariaDescribedBy, hasHelperText ? helperTextId : undefined);
  const getThumbAriaLabelledBy = (index: 0 | 1) =>
    thumbAriaLabelledBy?.[resolveThumbKey(index)] ?? (hasLabel ? undefined : ariaLabelledBy);
  const getThumbAriaLabel = (index: 0 | 1) => {
    if (getThumbAriaLabelledBy(index)) return undefined;
    return thumbAriaLabels?.[resolveThumbKey(index)] ?? (hasLabel ? undefined : ariaLabel);
  };

  return (
    <HeadlessSlider.Root
      {...rootProps}
      id={rootId}
      classNames={structuralClassNames}
      labelId={hasLabel ? labelId : false}
      describedBy={describedBy}
      valueMode={resolvedValueMode}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      required={required}
      formatValue={formatValue}
      aria-describedby={describedBy}
    >
      {hasLabel || hasValueSummary ? (
        <div className="k-sld-x1-a">
          {hasLabel ? (
            <HeadlessSlider.FieldLabel>
              {label}
              {required ? <span aria-hidden="true"> *</span> : null}
              {labelAdornment}
            </HeadlessSlider.FieldLabel>
          ) : null}
          {hasValueSummary ? <HeadlessSlider.ValueSummary /> : null}
        </div>
      ) : null}
      <HeadlessSlider.ControlRow>
        {renderEndpoint('start', endpoints?.start, startEdgeMarkLabel)}
        <HeadlessSlider.Track>
          <HeadlessSlider.ActiveTrack />
          {visualMarks.map((mark) => (
            <HeadlessSlider.Mark key={`mark-${mark.value}`} value={mark.value} />
          ))}
          {markLabels.map((mark) => (
            <HeadlessSlider.MarkLabel key={`mark-label-${mark.value}`} value={mark.value}>
              {mark.label}
            </HeadlessSlider.MarkLabel>
          ))}
          <HeadlessSlider.Thumb
            index={0}
            aria-label={getThumbAriaLabel(0)}
            aria-labelledby={getThumbAriaLabelledBy(0)}
          />
          {resolvedValueMode === 'range' ? (
            <HeadlessSlider.Thumb
              index={1}
              aria-label={getThumbAriaLabel(1)}
              aria-labelledby={getThumbAriaLabelledBy(1)}
            />
          ) : null}
          {hasValueIndicator ? <HeadlessSlider.ValueIndicator index={0} /> : null}
          {hasValueIndicator && resolvedValueMode === 'range' ? (
            <HeadlessSlider.ValueIndicator index={1} />
          ) : null}
        </HeadlessSlider.Track>
        {renderEndpoint('end', endpoints?.end, endEdgeMarkLabel)}
      </HeadlessSlider.ControlRow>
      {hasHelperText ? (
        <HeadlessSlider.HelperText id={helperTextId}>{helperText}</HeadlessSlider.HelperText>
      ) : null}
    </HeadlessSlider.Root>
  );
}

export const Slider = memo(SliderRoot);
Slider.displayName = 'Slider';
