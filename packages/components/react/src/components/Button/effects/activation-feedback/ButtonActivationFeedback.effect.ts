import './ButtonActivationFeedback.structural.css';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  ComponentEmphasis
} from '@kiskadee/core';
import {
  type ActivationFeedbackEffectBuckets,
  resolveActivationFeedbackBucketClass,
  resolveActivationFeedbackPressedBucketClass,
  resolveActivationFeedbackToneClass
} from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import type { ButtonClassNamePatch } from '../../Button.class-names.ts';
import { join } from '../../Button.class-names.ts';
import type { ButtonClassesMap } from '../../Button.types.ts';

export type ButtonActivationFeedbackEffectOptions = {
  activationFeedbackConfig: ActivationFeedbackEffectSchema | undefined;
  activationFeedbackProfile: ActivationFeedbackProfileMode | null;
  controlState: boolean | undefined;
  elements: ButtonClassesMap;
  emphasis: ComponentEmphasis | undefined;
  isActive: boolean;
  isFading: boolean;
  shouldForceOverlayPressed: boolean;
  shouldUsePressedProfile: boolean;
};

export type ButtonActivationFeedbackEffectResult = {
  classNamePatch: ButtonClassNamePatch;
};

export type ButtonActivationFeedbackClassNamePatchOptions = {
  config: ActivationFeedbackEffectSchema | undefined;
  controlState: boolean | undefined;
  elements: ButtonClassesMap;
  emphasis: ComponentEmphasis | undefined;
  isActive: boolean;
  isFading: boolean;
  profile: ActivationFeedbackProfileMode | null;
  shouldForceOverlayPressed: boolean;
  shouldUsePressedProfile: boolean;
};

export function resolveButtonActivationFeedbackClassNamePatch({
  config,
  controlState: _controlState,
  elements,
  emphasis,
  isActive,
  isFading,
  profile,
  shouldForceOverlayPressed,
  shouldUsePressedProfile
}: ButtonActivationFeedbackClassNamePatchOptions): ButtonClassNamePatch {
  if (!profile) return {};

  const effects = elements.e1?.e as ActivationFeedbackEffectBuckets | undefined;
  const profileBucket = shouldUsePressedProfile
    ? resolveActivationFeedbackPressedBucketClass(effects) ||
      resolveActivationFeedbackBucketClass(profile, effects)
    : resolveActivationFeedbackBucketClass(profile, effects);

  return {
    e1:
      join(
        effects?.af,
        profileBucket,
        resolveActivationFeedbackToneClass({ config, emphasis }),
        'k-btn-e1a',
        isActive ? 'k-btn-e1b' : '',
        isFading && !shouldForceOverlayPressed ? 'k-btn-e1c' : ''
      ) ?? ''
  };
}

export function resolveButtonActivationFeedbackEffect({
  activationFeedbackConfig,
  activationFeedbackProfile,
  controlState,
  elements,
  emphasis,
  isActive,
  isFading,
  shouldForceOverlayPressed,
  shouldUsePressedProfile
}: ButtonActivationFeedbackEffectOptions): ButtonActivationFeedbackEffectResult {
  return {
    classNamePatch: resolveButtonActivationFeedbackClassNamePatch({
      config: activationFeedbackConfig,
      controlState,
      elements,
      emphasis,
      isActive,
      isFading,
      profile: activationFeedbackProfile,
      shouldForceOverlayPressed,
      shouldUsePressedProfile
    })
  };
}
