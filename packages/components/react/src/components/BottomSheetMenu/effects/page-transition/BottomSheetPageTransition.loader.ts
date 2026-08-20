import { createLazyModuleCache, useLazyModule } from '../../../../shared/utils/lazyModule.ts';

export type BottomSheetPageTransitionEffectModule =
  typeof import('./BottomSheetPageTransition.effect.tsx');

const bottomSheetPageTransitionEffectCache =
  createLazyModuleCache<BottomSheetPageTransitionEffectModule>(
    () => import('./BottomSheetPageTransition.effect.tsx')
  );

export function loadBottomSheetPageTransitionEffect(): Promise<BottomSheetPageTransitionEffectModule> {
  return bottomSheetPageTransitionEffectCache.load();
}

export function useBottomSheetPageTransitionEffect(
  enabled: boolean
): BottomSheetPageTransitionEffectModule | null {
  return useLazyModule(bottomSheetPageTransitionEffectCache, enabled);
}
