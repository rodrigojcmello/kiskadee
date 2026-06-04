import { useEffect, useState } from 'react';

export type SwitchThumbSizeEffectModule = typeof import('./SwitchThumbSize.effect.ts');

let switchThumbSizeEffectModule: SwitchThumbSizeEffectModule | null = null;
let switchThumbSizeEffectPromise: Promise<SwitchThumbSizeEffectModule> | null = null;

export function loadSwitchThumbSizeEffect(): Promise<SwitchThumbSizeEffectModule> {
  if (switchThumbSizeEffectModule) return Promise.resolve(switchThumbSizeEffectModule);

  switchThumbSizeEffectPromise ??= import('./SwitchThumbSize.effect.ts').then((module) => {
    switchThumbSizeEffectModule = module;
    return module;
  });

  return switchThumbSizeEffectPromise;
}

export function useSwitchThumbSizeEffect(enabled: boolean): SwitchThumbSizeEffectModule | null {
  const [module, setModule] = useState<SwitchThumbSizeEffectModule | null>(
    switchThumbSizeEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadSwitchThumbSizeEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
