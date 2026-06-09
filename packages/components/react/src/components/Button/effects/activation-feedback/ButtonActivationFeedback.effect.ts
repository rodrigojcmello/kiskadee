import './ButtonActivationFeedback.structural.css';
import type { ActivationFeedbackProfileMode, ComponentEmphasis } from '@kiskadee/core';
import {
  type ActivationFeedbackEffectBuckets,
  resolveActivationFeedbackBucketClass,
  resolveActivationFeedbackPressedBucketClass
} from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import type { ButtonClassNamePatch } from '../../Button.class-names.ts';
import { join } from '../../Button.class-names.ts';
import type { ButtonClassesMap } from '../../Button.types.ts';

export type ButtonActivationFeedbackEffectOptions = {
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
  controlState: boolean | undefined;
  elements: ButtonClassesMap;
  emphasis: ComponentEmphasis | undefined;
  isActive: boolean;
  isFading: boolean;
  profile: ActivationFeedbackProfileMode | null;
  shouldForceOverlayPressed: boolean;
  shouldUsePressedProfile: boolean;
};

const resolveActivationFeedbackSurfaceToneClass = (
  emphasis: ComponentEmphasis | undefined,
  controlState: boolean | undefined
): string => {
  if (controlState) return 'k-btn-e1d';
  if (emphasis === 'high') return 'k-btn-e1d';
  return '';
};

export function resolveButtonActivationFeedbackClassNamePatch({
  controlState,
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
        resolveActivationFeedbackSurfaceToneClass(emphasis, controlState),
        'k-btn-e1a',
        isActive ? 'k-btn-e1b' : '',
        isFading && !shouldForceOverlayPressed ? 'k-btn-e1c' : ''
      ) ?? ''
  };
}

export function resolveButtonActivationFeedbackEffect({
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
