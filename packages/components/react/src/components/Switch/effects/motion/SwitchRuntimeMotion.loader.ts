import { useEffect, useState } from 'react';

export type SwitchRuntimeMotionEffectModule = typeof import('./SwitchRuntimeMotion.effect.tsx');

let switchRuntimeMotionEffectModule: SwitchRuntimeMotionEffectModule | null = null;
let switchRuntimeMotionEffectPromise: Promise<SwitchRuntimeMotionEffectModule> | null = null;

export function loadSwitchRuntimeMotionEffect(): Promise<SwitchRuntimeMotionEffectModule> {
  if (switchRuntimeMotionEffectModule) return Promise.resolve(switchRuntimeMotionEffectModule);

  switchRuntimeMotionEffectPromise ??= import('./SwitchRuntimeMotion.effect.tsx').then((module) => {
    switchRuntimeMotionEffectModule = module;
    return module;
  });

  return switchRuntimeMotionEffectPromise;
}

export function useSwitchRuntimeMotionEffect(
  enabled = true
): SwitchRuntimeMotionEffectModule | null {
  const [module, setModule] = useState<SwitchRuntimeMotionEffectModule | null>(
    switchRuntimeMotionEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadSwitchRuntimeMotionEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
