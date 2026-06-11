import {
  type ActivationFeedbackEffectBuckets,
  resolveActivationFeedbackProfileAvailability
} from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import type { ButtonProps } from '../../Button.types.ts';

type ButtonFeedbackEffectElement =
  | {
      e?: Record<string, unknown>;
    }
  | undefined;

export type ButtonFeedbackEffectAvailability = {
  hasModernActivationFeedbackEffect: boolean;
};

type ButtonFeedbackEffectAvailabilityOptions = {
  activationFeedback: ButtonProps['activationFeedback'];
  element: ButtonFeedbackEffectElement;
};

export function resolveButtonFeedbackEffectAvailability(
  options: ButtonFeedbackEffectAvailabilityOptions
): ButtonFeedbackEffectAvailability {
  return {
    hasModernActivationFeedbackEffect: hasButtonModernActivationFeedbackEffect(options)
  };
}

export function hasButtonActivationFeedbackEffect({
  activationFeedback,
  element
}: {
  activationFeedback: ButtonProps['activationFeedback'];
  element: ButtonFeedbackEffectElement;
}): boolean {
  return hasButtonModernActivationFeedbackEffect({ activationFeedback, element });
}

export function hasButtonModernActivationFeedbackEffect({
  activationFeedback,
  element
}: ButtonFeedbackEffectAvailabilityOptions): boolean {
  if (activationFeedback === false) return false;
  return (
    resolveActivationFeedbackProfileAvailability(
      element as { e?: ActivationFeedbackEffectBuckets } | undefined
    ).length > 0
  );
}
