import { createLazyModuleCache, useLazyModule } from '../../../../shared/utils/lazyModule.ts';

export type SliderActivationFeedbackEffectModule =
  typeof import('./SliderActivationFeedback.effect.ts');

const sliderActivationFeedbackEffectCache =
  createLazyModuleCache<SliderActivationFeedbackEffectModule>(
    () => import('./SliderActivationFeedback.effect.ts')
  );

export function loadSliderActivationFeedbackEffect(): Promise<SliderActivationFeedbackEffectModule> {
  return sliderActivationFeedbackEffectCache.load();
}

export function useSliderActivationFeedbackEffect(
  enabled: boolean
): SliderActivationFeedbackEffectModule | null {
  return useLazyModule(sliderActivationFeedbackEffectCache, enabled);
}
