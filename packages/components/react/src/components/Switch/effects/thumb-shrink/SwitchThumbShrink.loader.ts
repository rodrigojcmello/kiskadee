import {
  createLazyModuleCache,
  useLazyModule
} from '../../../../shared/utils/lazyModule.ts';

export type SwitchThumbShrinkEffectModule = typeof import('./SwitchThumbShrink.effect.ts');

const switchThumbShrinkEffectCache = createLazyModuleCache<SwitchThumbShrinkEffectModule>(
  () => import('./SwitchThumbShrink.effect.ts')
);

export function loadSwitchThumbShrinkEffect(): Promise<SwitchThumbShrinkEffectModule> {
  return switchThumbShrinkEffectCache.load();
}

export function useSwitchThumbShrinkEffect(enabled: boolean): SwitchThumbShrinkEffectModule | null {
  return useLazyModule(switchThumbShrinkEffectCache, enabled);
}
