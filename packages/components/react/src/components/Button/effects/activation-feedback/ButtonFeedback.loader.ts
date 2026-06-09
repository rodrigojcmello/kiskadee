import { useMemo } from 'react';
import type { ButtonFeedbackEffectAvailability } from './ButtonActivationFeedback.utils.ts';
import type { ButtonFeedbackKind } from './ButtonFeedback.types.ts';
import {
  type ButtonActivationFeedbackEffectModule,
  useButtonActivationFeedbackEffect
} from './ButtonActivationFeedback.loader.ts';
import {
  type ButtonRippleLegacyEffectModule,
  useButtonRippleLegacyEffect
} from '../ripple-legacy/ButtonRippleLegacy.loader.ts';

export type ButtonFeedbackEffectState = {
  activationFeedbackEffect: ButtonActivationFeedbackEffectModule | null;
  loadedFeedbackKind: ButtonFeedbackKind | null;
  rippleLegacyEffect: ButtonRippleLegacyEffectModule | null;
};

export function useButtonFeedbackEffect({
  hasModernActivationFeedbackEffect,
  hasRippleLegacyEffect
}: ButtonFeedbackEffectAvailability): ButtonFeedbackEffectState {
  const activationFeedbackEffect = useButtonActivationFeedbackEffect(
    hasModernActivationFeedbackEffect
  );
  const rippleLegacyEffect = useButtonRippleLegacyEffect(
    !hasModernActivationFeedbackEffect && hasRippleLegacyEffect
  );

  return useMemo(
    () => ({
      activationFeedbackEffect,
      loadedFeedbackKind: activationFeedbackEffect
        ? 'activationFeedback'
        : rippleLegacyEffect
          ? 'rippleLegacy'
          : null,
      rippleLegacyEffect
    }),
    [activationFeedbackEffect, rippleLegacyEffect]
  );
}
