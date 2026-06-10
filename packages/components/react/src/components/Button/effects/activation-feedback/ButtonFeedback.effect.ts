import type { ActivationFeedbackProfileMode, ComponentEmphasis } from '@kiskadee/core';
import type { ButtonClassNamePatch } from '../../Button.class-names.ts';
import type { ButtonClassesMap } from '../../Button.types.ts';
import type { ButtonActivationFeedbackEffectModule } from './ButtonActivationFeedback.loader.ts';
import type { ButtonFeedbackKind } from './ButtonFeedback.types.ts';

export type ButtonFeedbackClassNamePatchOptions = {
  activationFeedbackEffect: ButtonActivationFeedbackEffectModule | null;
  activationFeedbackProfile: ActivationFeedbackProfileMode | null;
  controlState: boolean | undefined;
  elements: ButtonClassesMap;
  emphasis: ComponentEmphasis | undefined;
  feedbackKind: ButtonFeedbackKind | null;
  isActive: boolean;
  isFading: boolean;
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

  return undefined;
}
