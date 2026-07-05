import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  RadiusMode,
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
import type { SliderComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
import { useLoadedComponentArtifact } from '../../../shared/contexts/useLoadedComponentArtifact.ts';
import {
  DEFAULT_SLIDER_EDGE_MARK_LABEL_PLACEMENT,
  DEFAULT_SLIDER_EDGE_MARK_LABEL_ALIGNMENT,
  DEFAULT_SLIDER_EDGE_MARKS,
  DEFAULT_SLIDER_ACTIVE_TRACK_ORIGIN,
  DEFAULT_SLIDER_MARK_PLACEMENT,
  DEFAULT_SLIDER_MARK_LABEL_PLACEMENT,
  DEFAULT_SLIDER_MARKS,
  DEFAULT_SLIDER_MODE,
  DEFAULT_SLIDER_ORIGIN_MARK,
  DEFAULT_SLIDER_RADIUS,
  DEFAULT_SLIDER_SNAP_MOTION,
  DEFAULT_SLIDER_THUMB_EDGE_BEHAVIOR,
  DEFAULT_SLIDER_THUMB_CROSSING,
  DEFAULT_SLIDER_VALUE_ANIMATION,
  DEFAULT_SLIDER_VALUE_DISPLAY,
  DEFAULT_SLIDER_VARIANT
} from '../Slider.class-names.ts';
import type { SliderVariantClassesMap } from '../Slider.types.ts';

export type SliderArtifactConfig = {
  sliderClassesMap: SliderVariantClassesMap | undefined;
  options: {
    variant: SliderVariant;
    mode: SliderMode;
    radius: RadiusMode;
    valueDisplay: SliderValueDisplay;
    valueAnimation: SliderValueAnimation;
    snapMotion: SliderSnapMotion;
    thumbCrossing: SliderThumbCrossing;
    marks: SliderMarks;
    edgeMarks: SliderEdgeMarks;
    markPlacement: SliderMarkPlacement;
    markLabelPlacement: SliderMarkLabelPlacement;
    edgeMarkLabelPlacement: SliderEdgeMarkLabelPlacement;
    edgeMarkLabelAlignment: SliderEdgeMarkLabelAlignment;
    thumbEdgeBehavior: SliderThumbEdgeBehavior;
    activeTrackOrigin: SliderActiveTrackOrigin;
    originMark: SliderOriginMark;
  };
  componentEffects: {
    activationFeedback?: ActivationFeedbackSetting;
  };
  globalEffects: {
    activationFeedback?: ActivationFeedbackEffectSchema;
  };
};

function isSliderComponentArtifact(artifact: unknown): artifact is SliderComponentArtifactJSON {
  return (artifact as SliderComponentArtifactJSON | undefined)?.component === 'slider';
}

export function useSliderArtifactConfig(): SliderArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const {
    currentArtifact: currentSliderComponentArtifact,
    previousArtifact: previousLoadedSliderComponentArtifact
  } = useLoadedComponentArtifact({
    componentName: 'slider',
    isArtifact: isSliderComponentArtifact,
    preservePrevious: true,
    resetWhenLoaderMissing: false
  });
  const legacySliderConfig = global?.components?.slider;
  const sliderGlobalConfig =
    currentSliderComponentArtifact ?? previousLoadedSliderComponentArtifact ?? legacySliderConfig;
  const sliderClassesMap = useComponentClassMap(
    'slider',
    classesMap.slider as SliderVariantClassesMap | undefined
  );
  const options = sliderGlobalConfig?.options;
  const variant = options?.variant ?? DEFAULT_SLIDER_VARIANT;
  const variantOptions = sliderGlobalConfig?.variants?.[variant]?.options;

  return {
    sliderClassesMap,
    options: {
      variant,
      mode: variantOptions?.mode ?? DEFAULT_SLIDER_MODE,
      radius: global?.radius ?? DEFAULT_SLIDER_RADIUS,
      valueDisplay: options?.valueDisplay ?? DEFAULT_SLIDER_VALUE_DISPLAY,
      valueAnimation: options?.valueAnimation ?? DEFAULT_SLIDER_VALUE_ANIMATION,
      snapMotion: options?.snapMotion ?? DEFAULT_SLIDER_SNAP_MOTION,
      thumbCrossing: options?.thumbCrossing ?? DEFAULT_SLIDER_THUMB_CROSSING,
      marks: options?.marks ?? DEFAULT_SLIDER_MARKS,
      edgeMarks: options?.edgeMarks ?? DEFAULT_SLIDER_EDGE_MARKS,
      markPlacement: options?.markPlacement ?? DEFAULT_SLIDER_MARK_PLACEMENT,
      markLabelPlacement: options?.markLabelPlacement ?? DEFAULT_SLIDER_MARK_LABEL_PLACEMENT,
      edgeMarkLabelPlacement:
        options?.edgeMarkLabelPlacement ?? DEFAULT_SLIDER_EDGE_MARK_LABEL_PLACEMENT,
      edgeMarkLabelAlignment:
        options?.edgeMarkLabelAlignment ?? DEFAULT_SLIDER_EDGE_MARK_LABEL_ALIGNMENT,
      thumbEdgeBehavior: options?.thumbEdgeBehavior ?? DEFAULT_SLIDER_THUMB_EDGE_BEHAVIOR,
      activeTrackOrigin: options?.activeTrackOrigin ?? DEFAULT_SLIDER_ACTIVE_TRACK_ORIGIN,
      originMark: options?.originMark ?? DEFAULT_SLIDER_ORIGIN_MARK
    },
    componentEffects: {
      activationFeedback:
        currentSliderComponentArtifact?.effects?.activationFeedback ??
        previousLoadedSliderComponentArtifact?.effects?.activationFeedback ??
        global?.components?.slider?.effects?.activationFeedback
    },
    globalEffects: {
      activationFeedback: global?.effects?.activationFeedback
    }
  };
}
