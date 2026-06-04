import { useEffect, useState } from 'react';

export type SwitchActivationFeedbackEffectModule =
  typeof import('./SwitchActivationFeedback.effect.ts');

let switchActivationFeedbackEffectModule: SwitchActivationFeedbackEffectModule | null = null;
let switchActivationFeedbackEffectPromise: Promise<SwitchActivationFeedbackEffectModule> | null =
  null;

export function loadSwitchActivationFeedbackEffect(): Promise<SwitchActivationFeedbackEffectModule> {
  if (switchActivationFeedbackEffectModule) {
    return Promise.resolve(switchActivationFeedbackEffectModule);
  }

  switchActivationFeedbackEffectPromise ??= import('./SwitchActivationFeedback.effect.ts').then(
    (module) => {
      switchActivationFeedbackEffectModule = module;
      return module;
    }
  );

  return switchActivationFeedbackEffectPromise;
}

export function useSwitchActivationFeedbackEffect(
  enabled: boolean
): SwitchActivationFeedbackEffectModule | null {
  const [module, setModule] = useState<SwitchActivationFeedbackEffectModule | null>(
    switchActivationFeedbackEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadSwitchActivationFeedbackEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
