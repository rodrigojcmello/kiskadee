import './Slider.structural.scss';
import {
  resolveActivationFeedbackSetting,
  usesActivationFeedbackStaticRuntime
} from '@kiskadee/core';
import { HeadlessSlider } from '@kiskadee/react-headless';
import { memo, useId, useMemo, useRef } from 'react';
import { useIsCompactViewport } from '../../shared/interaction/useIsCompactViewport.ts';
import { useIsLikelyTouch } from '../../shared/interaction/useIsLikelyTouch.ts';
import {
  hasSliderActivationFeedbackEffect,
  useSliderActivationFeedbackController,
  useSliderActivationFeedbackEffect
} from './effects/activation-feedback/index.ts';
import { useSliderArtifactConfig } from './hooks/useSliderArtifactConfig.ts';
import {
  DEFAULT_SLIDER_EMPHASIS,
  DEFAULT_SLIDER_INTENT,
  DEFAULT_SLIDER_SCALE,
  join,
  resolveSliderClassNames,
  resolveVariantElements
} from './Slider.class-names.ts';
import type {
  SliderClassNames,
  SliderEdgeMarkLabelAlignmentOption,
  SliderEdgeMarkLabelPlacementOption,
  SliderEdgeMarksOption,
  SliderMarkLabelPlacementOption,
  SliderMark,
  SliderMarks,
  SliderResolvedEdgeMarkLabelAlignment,
  SliderResolvedEdgeMarkLabelPlacement,
  SliderResolvedMarkLabelPlacement,
  SliderProps
} from './Slider.types.ts';

const EMPTY_SLIDER_CLASS_NAMES: SliderClassNames = {};
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const STEP_MARK_LIMIT = 101;
const START_EDGE_MARK_LABEL_INSIDE_CLASS_NAME = 'k-sld-e14c-a';
const END_EDGE_MARK_LABEL_INSIDE_CLASS_NAME = 'k-sld-e14d-a';

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
    .map((mark) => ({ value: mark.value, label: mark.label, icon: mark.icon }));
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

function resolveEdgeMarkLabelAlignment(
  alignment: SliderEdgeMarkLabelAlignmentOption,
  isCompactViewport: boolean
): SliderResolvedEdgeMarkLabelAlignment {
  if (alignment !== 'auto') return alignment;
  return isCompactViewport ? 'inside' : 'center';
}

function isEdgeMark(mark: SliderMark, min: number, max: number): boolean {
  return mark.value === min || mark.value === max;
}

function getEdgeMarkLabelAlignmentClassName(
  mark: SliderMark,
  min: number,
  max: number,
  alignment: SliderResolvedEdgeMarkLabelAlignment
): string | undefined {
  if (alignment !== 'inside') return undefined;
  if (mark.value === min) return START_EDGE_MARK_LABEL_INSIDE_CLASS_NAME;
  if (mark.value === max) return END_EDGE_MARK_LABEL_INSIDE_CLASS_NAME;
  return undefined;
}

function getEdgeMark(
  marks: SliderMark[],
  value: number
): SliderMark | undefined {
  return marks.find((mark) => mark.value === value);
}

function renderEndpoint(
  side: 'start' | 'end',
  edgeMark: SliderMark | undefined,
  shouldRenderEdgeMarkLabel: boolean
) {
  const edgeMarkLabel = shouldRenderEdgeMarkLabel ? edgeMark?.label : undefined;
  const hasEdgeMarkLabel = edgeMarkLabel !== undefined;
  const hasEdgeMarkIcon = edgeMark?.icon !== undefined;
  if (!hasEdgeMarkLabel && !hasEdgeMarkIcon) return null;

  const edgeMarkIconNode = hasEdgeMarkIcon ? (
    <HeadlessSlider.EndpointIcon>{edgeMark.icon}</HeadlessSlider.EndpointIcon>
  ) : null;
  const edgeMarkLabelNode =
    hasEdgeMarkLabel ? (
      <HeadlessSlider.EndpointLabel>{edgeMarkLabel}</HeadlessSlider.EndpointLabel>
    ) : null;

  return (
    <HeadlessSlider.Endpoint>
      {side === 'end' ? edgeMarkLabelNode : edgeMarkIconNode}
      {side === 'end' ? edgeMarkIconNode : edgeMarkLabelNode}
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
    radius,
    variant,
    mode,
    valueMode,
    value,
    defaultValue,
    min: minProp,
    max: maxProp,
    step: stepProp,
    required,
    marks,
    edgeMarks,
    markLabelPlacement,
    edgeMarkLabelPlacement,
    edgeMarkLabelAlignment,
    valueDisplay,
    activationFeedback,
    formatValue,
    thumbAriaLabels,
    thumbAriaLabelledBy,
    disabled,
    readOnly,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rootProps
  } = props;
  const isLikelyTouch = useIsLikelyTouch();
  const isCompactViewport = useIsCompactViewport();
  const generatedId = useId();
  const startThumbRef = useRef<HTMLSpanElement | null>(null);
  const endThumbRef = useRef<HTMLSpanElement | null>(null);
  const rootId = id ?? `slider-${generatedId}`;
  const labelId = `${rootId}-label`;
  const helperTextId = `${rootId}-helper`;
  const { sliderClassesMap, options, componentEffects, globalEffects } = useSliderArtifactConfig();
  const resolvedVariant = variant ?? options.variant;
  const resolvedMode = mode ?? options.mode;
  const resolvedRadius = radius ?? options.radius;
  const resolvedValueDisplay = valueDisplay ?? options.valueDisplay;
  const resolvedMarkLabelPlacement = resolveMarkLabelPlacement(
    markLabelPlacement ?? options.markLabelPlacement,
    isLikelyTouch
  );
  const resolvedEdgeMarkLabelPlacement = resolveEdgeMarkLabelPlacement(
    edgeMarkLabelPlacement ?? options.edgeMarkLabelPlacement,
    isCompactViewport
  );
  const resolvedEdgeMarkLabelAlignment = resolveEdgeMarkLabelAlignment(
    edgeMarkLabelAlignment ?? options.edgeMarkLabelAlignment,
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
  const startEdgeMark = getEdgeMark(normalizedMarks, min);
  const endEdgeMark = getEdgeMark(normalizedMarks, max);
  const hasLabel = label !== undefined && label !== null;
  const hasValueSummary = resolvedValueDisplay === 'summary' || resolvedValueDisplay === 'both';
  const hasValueIndicator = resolvedValueDisplay === 'tooltip' || resolvedValueDisplay === 'both';
  const hasHelperText = helperText !== undefined && helperText !== null;
  const elements = resolveVariantElements(sliderClassesMap, resolvedVariant, resolvedMode);
  const activationFeedbackConfig = useMemo(
    () =>
      resolveActivationFeedbackSetting(
        globalEffects.activationFeedback,
        componentEffects.activationFeedback
      ),
    [componentEffects.activationFeedback, globalEffects.activationFeedback]
  );
  const activationFeedbackProfile = activationFeedbackConfig?.profile ?? 'halo';
  const shouldUseActivationFeedback =
    activationFeedback !== false &&
    usesActivationFeedbackStaticRuntime(activationFeedbackProfile) &&
    hasSliderActivationFeedbackEffect(elements, activationFeedbackProfile);
  const activationFeedbackEffect = useSliderActivationFeedbackEffect(shouldUseActivationFeedback);
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
        radius: resolvedRadius,
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
      resolvedRadius,
      resolvedMarkLabelPlacement,
      scale
    ]
  );
  const describedBy = join(ariaDescribedBy, hasHelperText ? helperTextId : undefined);
  const activationFeedbackController = useSliderActivationFeedbackController({
    config: activationFeedbackConfig,
    disabled,
    enabled: Boolean(activationFeedbackEffect),
    forcedActive: activationFeedback === 'active',
    geometryKey: `${scale}:${resolvedRadius}:${resolvedValueMode}:${structuralClassNames.e10}:${structuralClassNames.e11}`,
    isRange: resolvedValueMode === 'range',
    profile: activationFeedbackProfile,
    readOnly,
    startThumbRef,
    endThumbRef
  });
  const activationFeedbackClassNames = useMemo(() => {
    if (!activationFeedbackEffect) {
      return {
        activeThumbClassName: '',
        thumbClassName: ''
      };
    }

    return activationFeedbackEffect.resolveSliderActivationFeedbackEffect({
      config: activationFeedbackConfig,
      elements,
      emphasis,
      profile: activationFeedbackProfile
    });
  }, [
    activationFeedbackConfig,
    activationFeedbackEffect,
    activationFeedbackProfile,
    elements,
    emphasis
  ]);
  const getThumbActivationFeedbackClassName = (index: 0 | 1) =>
    join(
      activationFeedbackClassNames.thumbClassName,
      activationFeedbackController.isThumbActive(index) &&
        activationFeedbackClassNames.activeThumbClassName
    );
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
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      formatValue={formatValue}
      aria-describedby={describedBy}
      onThumbInteractionCancel={
        activationFeedbackController.thumbInteractionHandlers.onThumbInteractionCancel
      }
      onThumbInteractionEnd={
        activationFeedbackController.thumbInteractionHandlers.onThumbInteractionEnd
      }
      onThumbInteractionStart={
        activationFeedbackController.thumbInteractionHandlers.onThumbInteractionStart
      }
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
        {renderEndpoint('start', startEdgeMark, shouldRenderEdgeMarkLabelsAsEndpoints)}
        <HeadlessSlider.Track>
          <HeadlessSlider.ActiveTrack />
          {visualMarks.map((mark) => (
            <HeadlessSlider.Mark key={`mark-${mark.value}`} value={mark.value} />
          ))}
          {markLabels.map((mark) => (
            <HeadlessSlider.MarkLabel
              key={`mark-label-${mark.value}`}
              className={getEdgeMarkLabelAlignmentClassName(
                mark,
                min,
                max,
                resolvedEdgeMarkLabelAlignment
              )}
              value={mark.value}
            >
              {mark.label}
            </HeadlessSlider.MarkLabel>
          ))}
          <HeadlessSlider.Thumb
            ref={startThumbRef}
            index={0}
            className={getThumbActivationFeedbackClassName(0)}
            aria-label={getThumbAriaLabel(0)}
            aria-labelledby={getThumbAriaLabelledBy(0)}
          >
            <HeadlessSlider.ThumbInner />
          </HeadlessSlider.Thumb>
          {resolvedValueMode === 'range' ? (
            <HeadlessSlider.Thumb
              ref={endThumbRef}
              index={1}
              className={getThumbActivationFeedbackClassName(1)}
              aria-label={getThumbAriaLabel(1)}
              aria-labelledby={getThumbAriaLabelledBy(1)}
            >
              <HeadlessSlider.ThumbInner />
            </HeadlessSlider.Thumb>
          ) : null}
          {hasValueIndicator ? <HeadlessSlider.ValueIndicator index={0} /> : null}
          {hasValueIndicator && resolvedValueMode === 'range' ? (
            <HeadlessSlider.ValueIndicator index={1} />
          ) : null}
        </HeadlessSlider.Track>
        {renderEndpoint('end', endEdgeMark, shouldRenderEdgeMarkLabelsAsEndpoints)}
      </HeadlessSlider.ControlRow>
      {hasHelperText ? (
        <HeadlessSlider.HelperText id={helperTextId}>{helperText}</HeadlessSlider.HelperText>
      ) : null}
    </HeadlessSlider.Root>
  );
}

export const Slider = memo(SliderRoot);
Slider.displayName = 'Slider';
