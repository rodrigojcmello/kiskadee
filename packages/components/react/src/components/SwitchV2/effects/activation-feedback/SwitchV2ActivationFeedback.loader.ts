import { useEffect, useState } from 'react';

export type SwitchV2ActivationFeedbackEffectModule =
  typeof import('./SwitchV2ActivationFeedback.effect.ts');

let switchV2ActivationFeedbackEffectModule: SwitchV2ActivationFeedbackEffectModule | null = null;
let switchV2ActivationFeedbackEffectPromise: Promise<SwitchV2ActivationFeedbackEffectModule> | null =
  null;

export function loadSwitchV2ActivationFeedbackEffect(): Promise<SwitchV2ActivationFeedbackEffectModule> {
  if (switchV2ActivationFeedbackEffectModule) {
    return Promise.resolve(switchV2ActivationFeedbackEffectModule);
  }

  switchV2ActivationFeedbackEffectPromise ??= import('./SwitchV2ActivationFeedback.effect.ts').then(
    (module) => {
      switchV2ActivationFeedbackEffectModule = module;
      return module;
    }
  );

  return switchV2ActivationFeedbackEffectPromise;
}

export function useSwitchV2ActivationFeedbackEffect(
  enabled: boolean
): SwitchV2ActivationFeedbackEffectModule | null {
  const [module, setModule] = useState<SwitchV2ActivationFeedbackEffectModule | null>(
    switchV2ActivationFeedbackEffectModule
  );

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    loadSwitchV2ActivationFeedbackEffect().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [enabled, module]);

  return enabled ? module : null;
}
