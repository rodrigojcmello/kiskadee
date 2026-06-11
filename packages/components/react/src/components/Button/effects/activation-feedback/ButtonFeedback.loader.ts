import { useMemo } from 'react';
import type { ButtonFeedbackEffectAvailability } from './ButtonActivationFeedback.utils.ts';
import type { ButtonFeedbackKind } from './ButtonFeedback.types.ts';
import {
  type ButtonActivationFeedbackEffectModule,
  useButtonActivationFeedbackEffect
} from './ButtonActivationFeedback.loader.ts';

export type ButtonFeedbackEffectState = {
  activationFeedbackEffect: ButtonActivationFeedbackEffectModule | null;
  loadedFeedbackKind: ButtonFeedbackKind | null;
};

export function useButtonFeedbackEffect({
  hasModernActivationFeedbackEffect
}: ButtonFeedbackEffectAvailability): ButtonFeedbackEffectState {
  const activationFeedbackEffect = useButtonActivationFeedbackEffect(
    hasModernActivationFeedbackEffect
  );

  return useMemo(
    () => ({
      activationFeedbackEffect,
      loadedFeedbackKind: activationFeedbackEffect ? 'activationFeedback' : null
    }),
    [activationFeedbackEffect]
  );
}
