import type { ActivationFeedbackProfileMode } from '@kiskadee/core';
import { resolveSliderActivationFeedbackEffectClassName } from '../.././Slider.class-names.ts';
import type { SliderClassesMap } from '../.././Slider.types.ts';

export function hasSliderActivationFeedbackEffect(
  elements: SliderClassesMap,
  profile?: ActivationFeedbackProfileMode
): boolean {
  return resolveSliderActivationFeedbackEffectClassName(elements.e10, profile).length > 0;
}
