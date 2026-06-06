import { useEffect, useState } from 'react';

export type SwitchThumbShrinkEffectModule = typeof import('./SwitchThumbShrink.effect.ts');

let switchThumbShrinkEffectModule: SwitchThumbShrinkEffectModule | null = null;
let switchThumbShrinkEffectPromise: Promise<SwitchThumbShrinkEffectModule> | null = null;

export function loadSwitchThumbShrinkEffect(): Promise<SwitchThumbShrinkEffectModule> {
  if (switchThumbShrinkEffectModule) return Promise.resolve(switchThumbShrinkEffectModule);

  switchThumbShrinkEffectPromise ??= import('./SwitchThumbShrink.effect.ts').then((module) => {
    switchThumbShrinkEffectModule = module;
    return module;
  });

  return switchThumbShrinkEffectPromise;
}

export function useSwitchThumbShrinkEffect(enabled: boolean): SwitchThumbShrinkEffectModule | null {
  const [module, setModule] = useState<SwitchThumbShrinkEffectModule | null>(
    switchThumbShrinkEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadSwitchThumbShrinkEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
