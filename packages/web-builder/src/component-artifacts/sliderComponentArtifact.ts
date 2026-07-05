import type {
  ActivationFeedbackSetting,
  Schema,
  SliderActiveTrackOrigin,
  SliderEdgeMarkLabelAlignment,
  SliderEdgeMarkLabelPlacement,
  SliderEdgeMarks,
  SliderMarkLabelPlacement,
  SliderMarkPlacement,
  SliderMarks,
  SliderMode,
  SliderOriginMark,
  SliderSnapMotion,
  SliderThumbEdgeBehavior,
  SliderThumbCrossing,
  SliderValueAnimation,
  SliderValueDisplay,
  SliderVariant
} from '@kiskadee/core';

export const SLIDER_COMPONENT_ARTIFACT_PATH = 'components/slider.kiskadee.json';

export type SliderComponentOptionsPayload = {
  variant?: SliderVariant;
  valueDisplay?: SliderValueDisplay;
  valueAnimation?: SliderValueAnimation;
  snapMotion?: SliderSnapMotion;
  thumbCrossing?: SliderThumbCrossing;
  marks?: SliderMarks;
  edgeMarks?: SliderEdgeMarks;
  markPlacement?: SliderMarkPlacement;
  markLabelPlacement?: SliderMarkLabelPlacement;
  edgeMarkLabelPlacement?: SliderEdgeMarkLabelPlacement;
  edgeMarkLabelAlignment?: SliderEdgeMarkLabelAlignment;
  thumbEdgeBehavior?: SliderThumbEdgeBehavior;
  activeTrackOrigin?: SliderActiveTrackOrigin;
  originMark?: SliderOriginMark;
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
    ...(sliderSchema.options?.valueAnimation
      ? { valueAnimation: sliderSchema.options.valueAnimation }
      : {}),
    ...(sliderSchema.options?.snapMotion ? { snapMotion: sliderSchema.options.snapMotion } : {}),
    ...(sliderSchema.options?.thumbCrossing
      ? { thumbCrossing: sliderSchema.options.thumbCrossing }
      : {}),
    ...(sliderSchema.options?.marks ? { marks: sliderSchema.options.marks } : {}),
    ...(sliderSchema.options?.edgeMarks ? { edgeMarks: sliderSchema.options.edgeMarks } : {}),
    ...(sliderSchema.options?.markPlacement
      ? { markPlacement: sliderSchema.options.markPlacement }
      : {}),
    ...(sliderSchema.options?.markLabelPlacement
      ? { markLabelPlacement: sliderSchema.options.markLabelPlacement }
      : {}),
    ...(sliderSchema.options?.edgeMarkLabelPlacement
      ? { edgeMarkLabelPlacement: sliderSchema.options.edgeMarkLabelPlacement }
      : {}),
    ...(sliderSchema.options?.edgeMarkLabelAlignment
      ? { edgeMarkLabelAlignment: sliderSchema.options.edgeMarkLabelAlignment }
      : {}),
    ...(sliderSchema.options?.thumbEdgeBehavior
      ? { thumbEdgeBehavior: sliderSchema.options.thumbEdgeBehavior }
      : {}),
    ...(sliderSchema.options?.activeTrackOrigin !== undefined
      ? { activeTrackOrigin: sliderSchema.options.activeTrackOrigin }
      : {}),
    ...(sliderSchema.options?.originMark ? { originMark: sliderSchema.options.originMark } : {})
  };
  const effects = buildSliderEffectsPayload(schema);
  const variants = buildSliderVariantsPayload(schema);

  if (!Object.keys(options).length && !Object.keys(effects).length && !Object.keys(variants).length) {
    return null;
  }

  return {
    component: 'slider',
    options,
    effects,
    variants
  };
}
