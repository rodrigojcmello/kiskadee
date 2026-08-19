import { createLazyModuleCache, useLazyModule } from '../../../../shared/utils/lazyModule.ts';

export type ButtonActivationFeedbackEffectModule =
  typeof import('./ButtonActivationFeedback.effect.ts');

const buttonActivationFeedbackEffectCache =
  createLazyModuleCache<ButtonActivationFeedbackEffectModule>(
    () => import('./ButtonActivationFeedback.effect.ts')
  );

export function loadButtonActivationFeedbackEffect(): Promise<ButtonActivationFeedbackEffectModule> {
  return buttonActivationFeedbackEffectCache.load();
}

export function useButtonActivationFeedbackEffect(
  enabled: boolean
): ButtonActivationFeedbackEffectModule | null {
  return useLazyModule(buttonActivationFeedbackEffectCache, enabled);
}
