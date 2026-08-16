import { createLazyModuleCache, useLazyModule } from '../../../../shared/utils/lazyModule.ts';

export type DropdownPresenceEffectModule = typeof import('./DropdownPresence.effect.tsx');

const dropdownPresenceEffectCache = createLazyModuleCache<DropdownPresenceEffectModule>(
  () => import('./DropdownPresence.effect.tsx')
);

export function loadDropdownPresenceEffect(): Promise<DropdownPresenceEffectModule> {
  return dropdownPresenceEffectCache.load();
}

export function useDropdownPresenceEffect(enabled: boolean): DropdownPresenceEffectModule | null {
  return useLazyModule(dropdownPresenceEffectCache, enabled);
}
