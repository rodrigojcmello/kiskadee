import './Slider.structural.scss';
import {
  resolveActivationFeedbackSetting,
  usesActivationFeedbackStaticRuntime
} from '@kiskadee/core';
import {
  HeadlessSlider,
  type SliderValueIndicatorRenderDetails,
  type SliderValueSummaryRenderDetails
} from '@kiskadee/react-headless';
import { type CSSProperties, memo, type ReactNode, useId, useMemo, useRef, useState } from 'react';
import { useIsCompactViewport } from '../../shared/interaction/useIsCompactViewport.ts';
import { useIsLikelyTouch } from '../../shared/interaction/useIsLikelyTouch.ts';
import { useIsomorphicLayoutEffect } from '../../shared/utils/useIsomorphicLayoutEffect.ts';
import { RollingNumber } from '../RollingNumber/RollingNumber.tsx';
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
  SliderEdgeLabelAlignmentOption,
  SliderEdgeLabelPlacementOption,
  SliderEdgeMarksOption,
  SliderFillOriginMarkOption,
  SliderFillOriginOption,
  SliderMark,
  SliderMarkLabelPlacementOption,
  SliderMarkPlacementOption,
  SliderMarks,
  SliderProps,
  SliderResolvedEdgeLabelAlignment,
  SliderResolvedEdgeLabelPlacement,
  SliderResolvedMarkLabelPlacement,
  SliderSnapAnimationOption,
  SliderThumbEdgeOption,
  SliderThumbIcon,
  SliderThumbIconDetails,
  SliderThumbStepBehaviorOption,
  SliderValueAnimationOption,
  SliderValueSummaryPlacementOption
} from './Slider.types.ts';

const EMPTY_SLIDER_CLASS_NAMES: SliderClassNames = {};
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const STEP_MARK_LIMIT = 101;
const START_EDGE_MARK_LABEL_INSIDE_CLASS_NAME = 'k-sld-e16c-a';
const END_EDGE_MARK_LABEL_INSIDE_CLASS_NAME = 'k-sld-e16d-a';
const SNAP_MOTION_CLASS_NAME = 'k-sld-sm';
const VALUE_INDICATOR_DRAG_ONLY_CLASS_NAME = 'k-sld-e14b-a';

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

function normalizeMarkInterval(markInterval: number | undefined, fallbackStep: number): number {
  return typeof markInterval === 'number' && Number.isFinite(markInterval) && markInterval > 0
    ? markInterval
    : fallbackStep;
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
  step: number,
  markInterval: number | undefined
): SliderMark[] {
  if (marks === 'none' || marks === undefined) return [];
  if (marks === 'step')
    return generateStepMarks(min, max, normalizeMarkInterval(markInterval, step));
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
  if (placement !== 'adaptive') return placement;
  return isLikelyTouch ? 'above' : 'below';
}

function resolveEdgeLabelPlacement(
  placement: SliderEdgeLabelPlacementOption,
  isCompactViewport: boolean
): SliderResolvedEdgeLabelPlacement {
  if (placement !== 'adaptive') return placement;
  return isCompactViewport ? 'markLabels' : 'endpoints';
}

function resolveEdgeLabelAlignment(
  alignment: SliderEdgeLabelAlignmentOption,
  isCompactViewport: boolean
): SliderResolvedEdgeLabelAlignment {
  if (alignment !== 'adaptive') return alignment;
  return isCompactViewport ? 'inside' : 'center';
}

function getEdgeLabelAlignmentClassName(
  mark: SliderMark,
  min: number,
  max: number,
  alignment: SliderResolvedEdgeLabelAlignment
): string | undefined {
  if (alignment !== 'inside') return undefined;
  if (mark.value === min) return START_EDGE_MARK_LABEL_INSIDE_CLASS_NAME;
  if (mark.value === max) return END_EDGE_MARK_LABEL_INSIDE_CLASS_NAME;
  return undefined;
}

function getEdgeMark(marks: SliderMark[], value: number): SliderMark | undefined {
  return marks.find((mark) => mark.value === value);
}

function resolveFillOriginValue(
  fillOrigin: SliderFillOriginOption,
  min: number,
  max: number
): number {
  if (fillOrigin === 'center') return min + (max - min) / 2;
  if (typeof fillOrigin === 'number') return Math.min(max, Math.max(min, fillOrigin));
  return min;
}

function shouldRenderFillOriginMark(
  fillOriginMark: SliderFillOriginMarkOption,
  fillOrigin: SliderFillOriginOption,
  min: number,
  max: number
): boolean {
  if (fillOriginMark !== 'auto') return false;
  return resolveFillOriginValue(fillOrigin, min, max) !== min;
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
  const edgeMarkLabelNode = hasEdgeMarkLabel ? (
    <HeadlessSlider.EndpointLabel>{edgeMarkLabel}</HeadlessSlider.EndpointLabel>
  ) : null;

  return (
    <HeadlessSlider.Endpoint>
      {side === 'end' ? edgeMarkLabelNode : edgeMarkIconNode}
      {side === 'end' ? edgeMarkIconNode : edgeMarkLabelNode}
    </HeadlessSlider.Endpoint>
  );
}

function canRenderRollingValue(value: ReactNode): value is number | string {
  return typeof value === 'number' || typeof value === 'string';
}

function renderSliderValue(
  valueAnimation: SliderValueAnimationOption,
  value: number,
  formattedValue: ReactNode
): ReactNode {
  if (valueAnimation !== 'rolling' || !canRenderRollingValue(formattedValue)) {
    return formattedValue;
  }

  return <RollingNumber value={value} formatValue={() => formattedValue} />;
}

function renderSliderValueIndicator(
  valueAnimation: SliderValueAnimationOption,
  details: SliderValueIndicatorRenderDetails
): ReactNode {
  return renderSliderValue(valueAnimation, details.value, details.formattedValue);
}

function renderSliderValueSummary(
  valueAnimation: SliderValueAnimationOption,
  details: SliderValueSummaryRenderDetails
): ReactNode {
  if (details.selectionMode !== 'range') {
    return renderSliderValue(valueAnimation, details.values[0] ?? 0, details.formattedValues[0]);
  }

  return (
    <>
      {renderSliderValue(valueAnimation, details.values[0] ?? 0, details.formattedValues[0])}
      <span aria-hidden="true"> - </span>
      {renderSliderValue(valueAnimation, details.values[1] ?? 0, details.formattedValues[1])}
    </>
  );
}

function renderSliderThumbIcon(
  thumbIcon: SliderThumbIcon | undefined,
  details: SliderThumbIconDetails
): ReactNode {
  if (thumbIcon === undefined || thumbIcon === null) return null;
  return typeof thumbIcon === 'function' ? thumbIcon(details) : thumbIcon;
}

function resolveSelectionMode(selectionMode: SliderProps['selectionMode'], props: SliderProps) {
  if (selectionMode) return selectionMode;
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
    optionalIndicator,
    helperText,
    className,
    classNames = EMPTY_SLIDER_CLASS_NAMES,
    style,
    scale = DEFAULT_SLIDER_SCALE,
    emphasis = DEFAULT_SLIDER_EMPHASIS,
    intent = DEFAULT_SLIDER_INTENT,
    radius,
    variant,
    mode,
    selectionMode,
    value,
    defaultValue,
    min: minProp,
    max: maxProp,
    step: stepProp,
    required,
    marks,
    markInterval,
    edgeMarks,
    markPlacement,
    markLabelPlacement,
    edgeLabelPlacement,
    edgeLabelAlignment,
    thumbEdge,
    fillOrigin,
    fillOriginMark,
    valueDisplay,
    valueSummaryPlacement,
    valueSummaryWidth,
    valueAnimation,
    snapAnimation,
    thumbStepBehavior,
    thumbCrossing,
    activationFeedback,
    formatValue,
    thumbIcon,
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
  const startValueIndicatorRef = useRef<HTMLSpanElement | null>(null);
  const endValueIndicatorRef = useRef<HTMLSpanElement | null>(null);
  const [valueIndicatorLane, setValueIndicatorLane] = useState<string | undefined>();
  const rootId = id ?? `slider-${generatedId}`;
  const labelId = `${rootId}-label`;
  const helperTextId = `${rootId}-helper`;
  const { sliderClassesMap, options, componentEffects, globalEffects } = useSliderArtifactConfig();
  const resolvedVariant = variant ?? options.variant;
  const resolvedMode = mode ?? options.mode;
  const resolvedRadius = radius ?? options.radius;
  const resolvedValueDisplay = valueDisplay ?? options.valueDisplay;
  const resolvedValueSummaryPlacement: SliderValueSummaryPlacementOption =
    valueSummaryPlacement ?? options.valueSummaryPlacement;
  const resolvedValueAnimation = valueAnimation ?? options.valueAnimation;
  const resolvedSnapAnimation: SliderSnapAnimationOption = snapAnimation ?? options.snapAnimation;
  const resolvedThumbStepBehavior: SliderThumbStepBehaviorOption =
    thumbStepBehavior ?? options.thumbStepBehavior;
  const resolvedThumbCrossing = thumbCrossing ?? options.thumbCrossing;
  const resolvedThumbEdge: SliderThumbEdgeOption = thumbEdge ?? options.thumbEdge;
  const resolvedFillOrigin: SliderFillOriginOption = fillOrigin ?? options.fillOrigin;
  const resolvedFillOriginMark: SliderFillOriginMarkOption =
    fillOriginMark ?? options.fillOriginMark;
  const resolvedMarkPlacement: SliderMarkPlacementOption = markPlacement ?? options.markPlacement;
  const resolvedMarkLabelPlacement = resolveMarkLabelPlacement(
    markLabelPlacement ?? options.markLabelPlacement,
    isLikelyTouch
  );
  const resolvedEdgeLabelPlacement = resolveEdgeLabelPlacement(
    edgeLabelPlacement ?? options.edgeLabelPlacement,
    isCompactViewport
  );
  const resolvedEdgeLabelAlignment = resolveEdgeLabelAlignment(
    edgeLabelAlignment ?? options.edgeLabelAlignment,
    isCompactViewport
  );
  const resolvedSelectionMode = resolveSelectionMode(selectionMode, props);
  const { min, max } = normalizeBounds(minProp, maxProp);
  const step = normalizeStep(stepProp);
  const resolvedMarkInterval = markInterval ?? options.markInterval;
  const resolvedEdgeMarks = edgeMarks ?? options.edgeMarks;
  const normalizedMarks = useMemo(
    () => resolveMarks(marks ?? options.marks, min, max, step, resolvedMarkInterval),
    [marks, max, min, options.marks, resolvedMarkInterval, step]
  );
  const visualMarks = useMemo(
    () => applyEdgeMarks(normalizedMarks, min, max, resolvedEdgeMarks),
    [max, min, normalizedMarks, resolvedEdgeMarks]
  );
  const markLabels = useMemo(
    () =>
      resolvedEdgeLabelPlacement === 'endpoints'
        ? []
        : normalizedMarks.filter((mark) => mark.label !== undefined),
    [max, min, normalizedMarks, resolvedEdgeLabelPlacement]
  );
  const shouldRenderEdgeLabelsAsEndpoints = resolvedEdgeLabelPlacement === 'endpoints';
  const startEdgeMark = getEdgeMark(normalizedMarks, min);
  const endEdgeMark = getEdgeMark(normalizedMarks, max);
  const hasLabel = label !== undefined && label !== null;
  const hasOptionalIndicator =
    hasLabel &&
    optionalIndicator !== undefined &&
    optionalIndicator !== null &&
    optionalIndicator !== false;
  const hasThumbIcon = thumbIcon !== undefined && thumbIcon !== null;
  const hasMarkLabels = markLabels.length > 0;
  const hasValueSummary =
    resolvedValueDisplay === 'summary' ||
    resolvedValueDisplay === 'both' ||
    resolvedValueDisplay === 'auto';
  const hasHeaderValueSummary = hasValueSummary && resolvedValueSummaryPlacement === 'headerEnd';
  const hasControlValueSummary = hasValueSummary && resolvedValueSummaryPlacement === 'controlEnd';
  const valueSummaryInlineSize =
    hasControlValueSummary &&
    typeof valueSummaryWidth === 'number' &&
    Number.isFinite(valueSummaryWidth) &&
    valueSummaryWidth > 0
      ? `${valueSummaryWidth}px`
      : undefined;
  const hasValueIndicator =
    resolvedValueDisplay === 'tooltip' ||
    resolvedValueDisplay === 'both' ||
    resolvedValueDisplay === 'auto';
  const hasPersistentValueIndicator =
    resolvedValueDisplay === 'tooltip' || resolvedValueDisplay === 'both';
  const valueIndicatorClassName =
    resolvedValueDisplay === 'auto' ? VALUE_INDICATOR_DRAG_ONLY_CLASS_NAME : undefined;
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
          e1: join(
            classNames.e1,
            className,
            resolvedSnapAnimation === 'smooth' && SNAP_MOTION_CLASS_NAME
          )
        },
        structuralBranch: 'a',
        scale,
        intent,
        emphasis,
        radius: resolvedRadius,
        hasLabel,
        hasOptionalIndicator,
        hasValueSummary,
        valueSummaryPlacement: resolvedValueSummaryPlacement,
        hasPersistentValueIndicator,
        hasThumbIcon,
        hasHelperText,
        hasMarkLabels,
        markPlacement: resolvedMarkPlacement,
        markLabelPlacement: resolvedMarkLabelPlacement
      }),
    [
      className,
      classNames,
      elements,
      emphasis,
      hasHelperText,
      hasLabel,
      hasOptionalIndicator,
      hasPersistentValueIndicator,
      hasThumbIcon,
      resolvedValueSummaryPlacement,
      hasMarkLabels,
      hasValueSummary,
      intent,
      resolvedRadius,
      resolvedMarkPlacement,
      resolvedMarkLabelPlacement,
      resolvedSnapAnimation,
      scale
    ]
  );
  const headlessClassNames = useMemo(
    () => ({
      ...structuralClassNames,
      e10: join(structuralClassNames.e10, structuralClassNames.e12),
      e11: join(structuralClassNames.e11, structuralClassNames.e13)
    }),
    [structuralClassNames]
  );
  const describedBy = join(ariaDescribedBy, hasHelperText ? helperTextId : undefined);
  const activationFeedbackController = useSliderActivationFeedbackController({
    config: activationFeedbackConfig,
    disabled,
    enabled: Boolean(activationFeedbackEffect),
    forcedActive: activationFeedback === 'active',
    geometryKey: `${scale}:${resolvedRadius}:${resolvedSelectionMode}:${headlessClassNames.e10}:${headlessClassNames.e11}`,
    isRange: resolvedSelectionMode === 'range',
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
  const renderValueIndicator = (index: 0 | 1) => {
    if (!hasValueIndicator) return null;

    const valueIndicatorRef = index === 0 ? startValueIndicatorRef : endValueIndicatorRef;

    return resolvedValueAnimation === 'rolling' ? (
      <HeadlessSlider.ValueIndicator
        ref={valueIndicatorRef}
        index={index}
        className={valueIndicatorClassName}
        aria-hidden="true"
      >
        {(details) => renderSliderValueIndicator(resolvedValueAnimation, details)}
      </HeadlessSlider.ValueIndicator>
    ) : (
      <HeadlessSlider.ValueIndicator
        ref={valueIndicatorRef}
        index={index}
        className={valueIndicatorClassName}
        aria-hidden="true"
      />
    );
  };
  const renderValueSummary = () =>
    resolvedValueAnimation === 'rolling' ? (
      <HeadlessSlider.ValueSummary>
        {(details) => renderSliderValueSummary(resolvedValueAnimation, details)}
      </HeadlessSlider.ValueSummary>
    ) : (
      <HeadlessSlider.ValueSummary />
    );
  const renderThumbIcon = (index: 0 | 1) => {
    if (thumbIcon === undefined || thumbIcon === null) return null;

    return (
      <HeadlessSlider.ThumbIcon index={index}>
        {(details) => renderSliderThumbIcon(thumbIcon, details)}
      </HeadlessSlider.ThumbIcon>
    );
  };

  useIsomorphicLayoutEffect(() => {
    if (!hasPersistentValueIndicator) {
      setValueIndicatorLane((currentValue) =>
        currentValue === undefined ? currentValue : undefined
      );
      return;
    }

    const valueIndicatorElement = startValueIndicatorRef.current ?? endValueIndicatorRef.current;
    if (!valueIndicatorElement || typeof window === 'undefined') return;

    const nextValue =
      window.getComputedStyle(valueIndicatorElement).getPropertyValue('--k-mgt').trim() || '0px';
    setValueIndicatorLane((currentValue) =>
      currentValue === nextValue ? currentValue : nextValue
    );
  }, [hasPersistentValueIndicator, structuralClassNames.e14]);

  const rootStyle = useMemo(() => {
    if (!valueIndicatorLane && !valueSummaryInlineSize) return style;

    return {
      ...style,
      ...(valueIndicatorLane ? { '--k-sld-value-indicator-lane': valueIndicatorLane } : {}),
      ...(valueSummaryInlineSize
        ? { '--k-sld-value-summary-inline-size': valueSummaryInlineSize }
        : {})
    } as CSSProperties;
  }, [style, valueIndicatorLane, valueSummaryInlineSize]);

  return (
    <HeadlessSlider.Root
      {...rootProps}
      id={rootId}
      style={rootStyle}
      classNames={headlessClassNames}
      labelId={hasLabel ? labelId : false}
      describedBy={describedBy}
      selectionMode={resolvedSelectionMode}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      thumbStepBehavior={resolvedThumbStepBehavior}
      thumbCrossing={resolvedThumbCrossing}
      thumbEdge={resolvedThumbEdge}
      fillOrigin={resolvedFillOrigin}
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
      onThumbInteractionSwitch={
        activationFeedbackController.thumbInteractionHandlers.onThumbInteractionSwitch
      }
    >
      {hasLabel || hasHeaderValueSummary ? (
        <div className="k-sld-x1-a">
          {hasLabel ? (
            <HeadlessSlider.FieldLabel>
              {label}
              {hasOptionalIndicator ? (
                <HeadlessSlider.OptionalIndicator>
                  {optionalIndicator}
                </HeadlessSlider.OptionalIndicator>
              ) : null}
              {labelAdornment}
            </HeadlessSlider.FieldLabel>
          ) : null}
          {hasHeaderValueSummary ? renderValueSummary() : null}
        </div>
      ) : null}
      <HeadlessSlider.ControlRow>
        <div className="k-sld-x2-a">
          {renderEndpoint('start', startEdgeMark, shouldRenderEdgeLabelsAsEndpoints)}
          <HeadlessSlider.Track>
            <HeadlessSlider.ActiveTrack />
            {shouldRenderFillOriginMark(resolvedFillOriginMark, resolvedFillOrigin, min, max) ? (
              <HeadlessSlider.OriginMark />
            ) : null}
            {visualMarks.map((mark) => (
              <HeadlessSlider.Mark key={`mark-${mark.value}`} value={mark.value} />
            ))}
            {markLabels.map((mark) => (
              <HeadlessSlider.MarkLabel
                key={`mark-label-${mark.value}`}
                className={getEdgeLabelAlignmentClassName(
                  mark,
                  min,
                  max,
                  resolvedEdgeLabelAlignment
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
              {renderThumbIcon(0)}
              {renderValueIndicator(0)}
            </HeadlessSlider.Thumb>
            {resolvedSelectionMode === 'range' ? (
              <HeadlessSlider.Thumb
                ref={endThumbRef}
                index={1}
                className={getThumbActivationFeedbackClassName(1)}
                aria-label={getThumbAriaLabel(1)}
                aria-labelledby={getThumbAriaLabelledBy(1)}
              >
                <HeadlessSlider.ThumbInner />
                {renderThumbIcon(1)}
                {renderValueIndicator(1)}
              </HeadlessSlider.Thumb>
            ) : null}
          </HeadlessSlider.Track>
          {renderEndpoint('end', endEdgeMark, shouldRenderEdgeLabelsAsEndpoints)}
        </div>
        {hasControlValueSummary ? renderValueSummary() : null}
      </HeadlessSlider.ControlRow>
      {hasHelperText ? (
        <HeadlessSlider.HelperText id={helperTextId}>{helperText}</HeadlessSlider.HelperText>
      ) : null}
    </HeadlessSlider.Root>
  );
}

export const Slider = memo(SliderRoot);
Slider.displayName = 'Slider';
