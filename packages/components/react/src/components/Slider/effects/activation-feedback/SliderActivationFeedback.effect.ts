import '../../../../hooks/effects/activation-feedback/ActivationFeedbackHalo.structural.css';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  ComponentEmphasis
} from '@kiskadee/core';
import { resolveActivationFeedbackToneClass } from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import {
  join,
  resolveSliderActivationFeedbackEffectClassName
} from '../.././Slider.class-names.ts';
import type { SliderClassesMap } from '../.././Slider.types.ts';

export type SliderActivationFeedbackEffectOptions = {
  config?: ActivationFeedbackEffectSchema;
  emphasis: ComponentEmphasis;
  elements: SliderClassesMap;
  profile: ActivationFeedbackProfileMode;
};

export type SliderActivationFeedbackEffectResult = {
  activeThumbClassName: string;
  thumbClassName: string;
};

export function resolveSliderActivationFeedbackEffect({
  config,
  emphasis,
  elements,
  profile
}: SliderActivationFeedbackEffectOptions): SliderActivationFeedbackEffectResult {
  const activationFeedbackClassName = resolveSliderActivationFeedbackEffectClassName(
    elements.e10,
    profile
  );

  if (!activationFeedbackClassName) {
    return {
      activeThumbClassName: '',
      thumbClassName: ''
    };
  }

  return {
    activeThumbClassName: 'k-afxa',
    thumbClassName:
      join(
        activationFeedbackClassName,
        'k-afx',
        resolveActivationFeedbackToneClass({ config, emphasis })
      ) ?? ''
  };
}
