import { createLazyModuleCache, useLazyModule } from '../../../../shared/utils/lazyModule.ts';

export type SwitchActivationFeedbackEffectModule =
  typeof import('./SwitchActivationFeedback.effect.ts');

const switchActivationFeedbackEffectCache =
  createLazyModuleCache<SwitchActivationFeedbackEffectModule>(
    () => import('./SwitchActivationFeedback.effect.ts')
  );

export function loadSwitchActivationFeedbackEffect(): Promise<SwitchActivationFeedbackEffectModule> {
  return switchActivationFeedbackEffectCache.load();
}

export function useSwitchActivationFeedbackEffect(
  enabled: boolean
): SwitchActivationFeedbackEffectModule | null {
  return useLazyModule(switchActivationFeedbackEffectCache, enabled);
}
