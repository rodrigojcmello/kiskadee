import { useEffect, useState } from 'react';

export type SwitchV2MotionEffectModule = typeof import('./SwitchV2Motion.effect.tsx');

let switchV2MotionEffectModule: SwitchV2MotionEffectModule | null = null;
let switchV2MotionEffectPromise: Promise<SwitchV2MotionEffectModule> | null = null;

export function loadSwitchV2MotionEffect(): Promise<SwitchV2MotionEffectModule> {
  if (switchV2MotionEffectModule) return Promise.resolve(switchV2MotionEffectModule);

  switchV2MotionEffectPromise ??= import('./SwitchV2Motion.effect.tsx').then((module) => {
    switchV2MotionEffectModule = module;
    return module;
  });

  return switchV2MotionEffectPromise;
}

export function useSwitchV2MotionEffect(enabled = true): SwitchV2MotionEffectModule | null {
  const [module, setModule] = useState<SwitchV2MotionEffectModule | null>(
    switchV2MotionEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadSwitchV2MotionEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
