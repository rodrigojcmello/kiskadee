import { useEffect, useState } from 'react';

export type ButtonRippleLegacyEffectModule = typeof import('./ButtonRippleLegacy.effect.ts');

let buttonRippleLegacyEffectModule: ButtonRippleLegacyEffectModule | null = null;
let buttonRippleLegacyEffectPromise: Promise<ButtonRippleLegacyEffectModule> | null = null;

export function loadButtonRippleLegacyEffect(): Promise<ButtonRippleLegacyEffectModule> {
  if (buttonRippleLegacyEffectModule) {
    return Promise.resolve(buttonRippleLegacyEffectModule);
  }

  buttonRippleLegacyEffectPromise ??= import('./ButtonRippleLegacy.effect.ts').then((module) => {
    buttonRippleLegacyEffectModule = module;
    return module;
  });

  return buttonRippleLegacyEffectPromise;
}

export function useButtonRippleLegacyEffect(enabled: boolean): ButtonRippleLegacyEffectModule | null {
  const [module, setModule] = useState<ButtonRippleLegacyEffectModule | null>(
    buttonRippleLegacyEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadButtonRippleLegacyEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
