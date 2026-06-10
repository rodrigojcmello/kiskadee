import {
  createLazyModuleCache,
  useLazyModule
} from '../../../../shared/utils/lazyModule.ts';

export type SwitchRuntimeMotionEffectModule = typeof import('./SwitchRuntimeMotion.effect.tsx');

const switchRuntimeMotionEffectCache = createLazyModuleCache<SwitchRuntimeMotionEffectModule>(
  () => import('./SwitchRuntimeMotion.effect.tsx')
);

export function loadSwitchRuntimeMotionEffect(): Promise<SwitchRuntimeMotionEffectModule> {
  return switchRuntimeMotionEffectCache.load();
}

export function useSwitchRuntimeMotionEffect(
  enabled = true
): SwitchRuntimeMotionEffectModule | null {
  return useLazyModule(switchRuntimeMotionEffectCache, enabled);
}
