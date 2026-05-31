import { useEffect, useState } from 'react';

export type SwitchV2ThumbSizeEffectModule = typeof import('./SwitchV2ThumbSize.effect.ts');

let switchV2ThumbSizeEffectModule: SwitchV2ThumbSizeEffectModule | null = null;
let switchV2ThumbSizeEffectPromise: Promise<SwitchV2ThumbSizeEffectModule> | null = null;

export function loadSwitchV2ThumbSizeEffect(): Promise<SwitchV2ThumbSizeEffectModule> {
  if (switchV2ThumbSizeEffectModule) return Promise.resolve(switchV2ThumbSizeEffectModule);

  switchV2ThumbSizeEffectPromise ??= import('./SwitchV2ThumbSize.effect.ts').then((module) => {
    switchV2ThumbSizeEffectModule = module;
    return module;
  });

  return switchV2ThumbSizeEffectPromise;
}

export function useSwitchV2ThumbSizeEffect(enabled: boolean): SwitchV2ThumbSizeEffectModule | null {
  const [module, setModule] = useState<SwitchV2ThumbSizeEffectModule | null>(
    switchV2ThumbSizeEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadSwitchV2ThumbSizeEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
