import type {
  ActivationFeedbackSetting,
  Schema,
  SliderEdgeLabelAlignment,
  SliderEdgeLabelPlacement,
  SliderEdgeMarks,
  SliderFillOrigin,
  SliderFillOriginMark,
  SliderMarkLabelPlacement,
  SliderMarkPlacement,
  SliderMarks,
  SliderMode,
  SliderSnapAnimation,
  SliderThumbCrossing,
  SliderThumbEdge,
  SliderThumbStepBehavior,
  SliderValueAnimation,
  SliderValueDisplay,
  SliderValueSummaryPlacement,
  SliderVariant
} from '@kiskadee/core';

export const SLIDER_COMPONENT_ARTIFACT_PATH = 'components/slider.kiskadee.json';

export type SliderComponentOptionsPayload = {
  variant?: SliderVariant;
  valueDisplay?: SliderValueDisplay;
  valueSummaryPlacement?: SliderValueSummaryPlacement;
  valueAnimation?: SliderValueAnimation;
  snapAnimation?: SliderSnapAnimation;
  thumbStepBehavior?: SliderThumbStepBehavior;
  thumbCrossing?: SliderThumbCrossing;
  marks?: SliderMarks;
  markInterval?: number;
  edgeMarks?: SliderEdgeMarks;
  markPlacement?: SliderMarkPlacement;
  markLabelPlacement?: SliderMarkLabelPlacement;
  edgeLabelPlacement?: SliderEdgeLabelPlacement;
  edgeLabelAlignment?: SliderEdgeLabelAlignment;
  thumbEdge?: SliderThumbEdge;
  fillOrigin?: SliderFillOrigin;
  fillOriginMark?: SliderFillOriginMark;
};

export type SliderComponentEffectsPayload = {
  activationFeedback?: ActivationFeedbackSetting;
};

export type SliderComponentVariantsPayload = {
  [TVariant in SliderVariant]?: {
    options?: {
      mode?: SliderMode;
    };
  };
};

export type SliderComponentArtifactJSON = {
  component: 'slider';
  options: SliderComponentOptionsPayload;
  effects: SliderComponentEffectsPayload;
  variants: SliderComponentVariantsPayload;
};

function pickSliderVariantOptions(
  options: unknown
): NonNullable<SliderComponentVariantsPayload[SliderVariant]>['options'] | undefined {
  const mode = (options as { mode?: SliderMode } | undefined)?.mode;
  return mode ? { mode } : undefined;
}

function buildSliderVariantsPayload(schema: Schema): SliderComponentVariantsPayload {
  const variants: SliderComponentVariantsPayload = {};
  const standardOptions = pickSliderVariantOptions(
    schema.components?.slider?.variants?.standard?.options
  );
  if (standardOptions) {
    variants.standard = {
      options: standardOptions
    };
  }

  return variants;
}

function buildSliderEffectsPayload(schema: Schema): SliderComponentEffectsPayload {
  const sliderSchema = schema.components?.slider;
  if (!sliderSchema?.effects) return {};

  return {
    ...(sliderSchema.effects.activationFeedback !== undefined
      ? { activationFeedback: sliderSchema.effects.activationFeedback }
      : {})
  };
}

export function buildSliderComponentArtifact(schema: Schema): SliderComponentArtifactJSON | null {
  const sliderSchema = schema.components?.slider;
  if (!sliderSchema) return null;

  const options: SliderComponentOptionsPayload = {
    ...(sliderSchema.options?.variant ? { variant: sliderSchema.options.variant } : {}),
    ...(sliderSchema.options?.valueDisplay
      ? { valueDisplay: sliderSchema.options.valueDisplay }
      : {}),
    ...(sliderSchema.options?.valueSummaryPlacement
      ? { valueSummaryPlacement: sliderSchema.options.valueSummaryPlacement }
      : {}),
    ...(sliderSchema.options?.valueAnimation
      ? { valueAnimation: sliderSchema.options.valueAnimation }
      : {}),
    ...(sliderSchema.options?.snapAnimation
      ? { snapAnimation: sliderSchema.options.snapAnimation }
      : {}),
    ...(sliderSchema.options?.thumbStepBehavior
      ? { thumbStepBehavior: sliderSchema.options.thumbStepBehavior }
      : {}),
    ...(sliderSchema.options?.thumbCrossing
      ? { thumbCrossing: sliderSchema.options.thumbCrossing }
      : {}),
    ...(sliderSchema.options?.marks ? { marks: sliderSchema.options.marks } : {}),
    ...(sliderSchema.options?.markInterval !== undefined
      ? { markInterval: sliderSchema.options.markInterval }
      : {}),
    ...(sliderSchema.options?.edgeMarks ? { edgeMarks: sliderSchema.options.edgeMarks } : {}),
    ...(sliderSchema.options?.markPlacement
      ? { markPlacement: sliderSchema.options.markPlacement }
      : {}),
    ...(sliderSchema.options?.markLabelPlacement
      ? { markLabelPlacement: sliderSchema.options.markLabelPlacement }
      : {}),
    ...(sliderSchema.options?.edgeLabelPlacement
      ? { edgeLabelPlacement: sliderSchema.options.edgeLabelPlacement }
      : {}),
    ...(sliderSchema.options?.edgeLabelAlignment
      ? { edgeLabelAlignment: sliderSchema.options.edgeLabelAlignment }
      : {}),
    ...(sliderSchema.options?.thumbEdge ? { thumbEdge: sliderSchema.options.thumbEdge } : {}),
    ...(sliderSchema.options?.fillOrigin !== undefined
      ? { fillOrigin: sliderSchema.options.fillOrigin }
      : {}),
    ...(sliderSchema.options?.fillOriginMark
      ? { fillOriginMark: sliderSchema.options.fillOriginMark }
      : {})
  };
  const effects = buildSliderEffectsPayload(schema);
  const variants = buildSliderVariantsPayload(schema);

  if (
    !Object.keys(options).length &&
    !Object.keys(effects).length &&
    !Object.keys(variants).length
  ) {
    return null;
  }

  return {
    component: 'slider',
    options,
    effects,
    variants
  };
}
