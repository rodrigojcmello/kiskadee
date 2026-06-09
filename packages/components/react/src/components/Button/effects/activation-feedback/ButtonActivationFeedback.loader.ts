import { useEffect, useState } from 'react';

export type ButtonActivationFeedbackEffectModule =
  typeof import('./ButtonActivationFeedback.effect.ts');

let buttonActivationFeedbackEffectModule: ButtonActivationFeedbackEffectModule | null = null;
let buttonActivationFeedbackEffectPromise: Promise<ButtonActivationFeedbackEffectModule> | null =
  null;

export function loadButtonActivationFeedbackEffect(): Promise<ButtonActivationFeedbackEffectModule> {
  if (buttonActivationFeedbackEffectModule) {
    return Promise.resolve(buttonActivationFeedbackEffectModule);
  }

  buttonActivationFeedbackEffectPromise ??= import('./ButtonActivationFeedback.effect.ts').then(
    (module) => {
      buttonActivationFeedbackEffectModule = module;
      return module;
    }
  );

  return buttonActivationFeedbackEffectPromise;
}

export function useButtonActivationFeedbackEffect(
  enabled: boolean
): ButtonActivationFeedbackEffectModule | null {
  const [module, setModule] = useState<ButtonActivationFeedbackEffectModule | null>(
    buttonActivationFeedbackEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadButtonActivationFeedbackEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
