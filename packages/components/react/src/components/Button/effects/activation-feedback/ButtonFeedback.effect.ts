import type {
  ActivationFeedbackProfileMode,
  ComponentEmphasis,
  RippleMode
} from '@kiskadee/core';
import type { ButtonClassNamePatch } from '../../Button.class-names.ts';
import type { ButtonClassesMap } from '../../Button.types.ts';
import type { ButtonActivationFeedbackEffectModule } from './ButtonActivationFeedback.loader.ts';
import type { ButtonFeedbackKind } from './ButtonFeedback.types.ts';
import type { ButtonRippleLegacyEffectModule } from '../ripple-legacy/ButtonRippleLegacy.loader.ts';

export type ButtonFeedbackClassNamePatchOptions = {
  activationFeedbackEffect: ButtonActivationFeedbackEffectModule | null;
  activationFeedbackProfile: ActivationFeedbackProfileMode | null;
  controlState: boolean | undefined;
  elements: ButtonClassesMap;
  emphasis: ComponentEmphasis | undefined;
  feedbackKind: ButtonFeedbackKind | null;
  isActive: boolean;
  isFading: boolean;
  rippleLegacyEffect: ButtonRippleLegacyEffectModule | null;
  rippleMode: RippleMode | null;
  shouldForceOverlayPressed: boolean;
  shouldUsePressedProfile: boolean;
};

export function resolveButtonFeedbackClassNamePatch({
  activationFeedbackEffect,
  activationFeedbackProfile,
  controlState,
  elements,
  emphasis,
  feedbackKind,
  isActive,
  isFading,
  rippleLegacyEffect,
  rippleMode,
  shouldForceOverlayPressed,
  shouldUsePressedProfile
}: ButtonFeedbackClassNamePatchOptions): ButtonClassNamePatch | undefined {
  if (feedbackKind === 'activationFeedback') {
    return activationFeedbackEffect
      ? activationFeedbackEffect.resolveButtonActivationFeedbackEffect({
          activationFeedbackProfile,
          controlState,
          elements,
          emphasis,
          isActive,
          isFading,
          shouldForceOverlayPressed,
          shouldUsePressedProfile
        }).classNamePatch
      : undefined;
  }

  if (feedbackKind === 'rippleLegacy') {
    return rippleLegacyEffect
      ? rippleLegacyEffect.resolveButtonRippleLegacyEffect({
          controlState,
          elements,
          emphasis,
          isActive,
          isFading,
          mode: rippleMode,
          shouldForceOverlayPressed,
          shouldUsePressedProfile
        }).classNamePatch
      : undefined;
  }

  return undefined;
}
