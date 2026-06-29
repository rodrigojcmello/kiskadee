import type { SliderMarks, SliderMode, SliderValueDisplay, SliderVariant } from '@kiskadee/core';
import type { SliderComponentArtifactJSON } from '@kiskadee/web-builder/types';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
import { useLoadedComponentArtifact } from '../../../shared/contexts/useLoadedComponentArtifact.ts';
import {
  DEFAULT_SLIDER_MARKS,
  DEFAULT_SLIDER_MODE,
  DEFAULT_SLIDER_VALUE_DISPLAY,
  DEFAULT_SLIDER_VARIANT
} from '../Slider.class-names.ts';
import type { SliderVariantClassesMap } from '../Slider.types.ts';

export type SliderArtifactConfig = {
  sliderClassesMap: SliderVariantClassesMap | undefined;
  options: {
    variant: SliderVariant;
    mode: SliderMode;
    valueDisplay: SliderValueDisplay;
    marks: SliderMarks;
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
      valueDisplay: options?.valueDisplay ?? DEFAULT_SLIDER_VALUE_DISPLAY,
      marks: options?.marks ?? DEFAULT_SLIDER_MARKS
    }
  };
}
