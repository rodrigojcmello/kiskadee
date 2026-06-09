import {
  type ActivationFeedbackEffectBuckets,
  resolveActivationFeedbackProfileAvailability
} from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import type { ButtonProps } from '../../Button.types.ts';
import {
  type RippleEffectBuckets,
  resolveButtonRippleModeAvailability
} from '../ripple-legacy/ButtonRippleLegacy.utils.ts';

type ButtonFeedbackEffectElement =
  | {
      e?: Record<string, unknown>;
    }
  | undefined;

export type ButtonFeedbackEffectAvailability = {
  hasModernActivationFeedbackEffect: boolean;
  hasRippleLegacyEffect: boolean;
};

type ButtonFeedbackEffectAvailabilityOptions = {
  activationFeedback: ButtonProps['activationFeedback'];
  element: ButtonFeedbackEffectElement;
  rippleEffect: ButtonProps['rippleEffect'];
};

export function resolveButtonFeedbackEffectAvailability(
  options: ButtonFeedbackEffectAvailabilityOptions
): ButtonFeedbackEffectAvailability {
  return {
    hasModernActivationFeedbackEffect: hasButtonModernActivationFeedbackEffect(options),
    hasRippleLegacyEffect: hasButtonRippleLegacyEffect(options)
  };
}

export function hasButtonActivationFeedbackEffect({
  activationFeedback,
  element,
  rippleEffect
}: {
  activationFeedback: ButtonProps['activationFeedback'];
  element: ButtonFeedbackEffectElement;
  rippleEffect: ButtonProps['rippleEffect'];
}): boolean {
  return (
    hasButtonModernActivationFeedbackEffect({ activationFeedback, element, rippleEffect }) ||
    hasButtonRippleLegacyEffect({ activationFeedback, element, rippleEffect })
  );
}

export function hasButtonModernActivationFeedbackEffect({
  activationFeedback,
  element,
  rippleEffect
}: ButtonFeedbackEffectAvailabilityOptions): boolean {
  if (activationFeedback === false || rippleEffect === false) return false;
  return (
    resolveActivationFeedbackProfileAvailability(
      element as { e?: ActivationFeedbackEffectBuckets } | undefined
    ).length > 0
  );
}

export function hasButtonRippleLegacyEffect({
  activationFeedback,
  element,
  rippleEffect
}: ButtonFeedbackEffectAvailabilityOptions): boolean {
  if (activationFeedback === false || rippleEffect === false) return false;
  return (
    resolveButtonRippleModeAvailability(element as { e?: RippleEffectBuckets } | undefined)
      .length > 0
  );
}
