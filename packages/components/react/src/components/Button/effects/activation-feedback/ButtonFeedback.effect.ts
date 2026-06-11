import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  ComponentEmphasis
} from '@kiskadee/core';
import type { ButtonClassNamePatch } from '../../Button.class-names.ts';
import type { ButtonClassesMap } from '../../Button.types.ts';
import type { ButtonActivationFeedbackEffectModule } from './ButtonActivationFeedback.loader.ts';
import type { ButtonFeedbackKind } from './ButtonFeedback.types.ts';

export type ButtonFeedbackClassNamePatchOptions = {
  activationFeedbackEffect: ButtonActivationFeedbackEffectModule | null;
  activationFeedbackConfig: ActivationFeedbackEffectSchema | undefined;
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
  activationFeedbackConfig,
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
          activationFeedbackConfig,
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
