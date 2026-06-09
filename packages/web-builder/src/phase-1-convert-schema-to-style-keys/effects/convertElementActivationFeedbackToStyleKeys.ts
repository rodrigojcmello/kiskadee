import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  StyleKeysByInteractionState
} from '@kiskadee/core';
import {
  resolveActivationFeedbackConfig,
  resolveActivationFeedbackProfile,
  resolvePressedActivationFeedbackProfile
} from '@kiskadee/core';
import { buildStyleKey } from '../../utils/index.ts';

type ConvertActivationFeedbackOptions = {
  config?: ActivationFeedbackEffectSchema;
};

function resolveDeclaredRadialProfiles(
  config?: ActivationFeedbackEffectSchema
): ActivationFeedbackProfileMode[] {
  const profiles = config?.profiles;
  const modes: ActivationFeedbackProfileMode[] = [];
  if (profiles?.surface) modes.push('surface');
  if (profiles?.overflow) modes.push('overflow');
  if (profiles?.overflowStatic) modes.push('overflow-static');
  return modes;
}

function hasDeclaredProfileConfig(config?: ActivationFeedbackEffectSchema): boolean {
  return Boolean(
    config?.profile ||
      config?.profiles?.surface ||
      config?.profiles?.overflow ||
      config?.profiles?.overflowStatic ||
      config?.profiles?.pressed
  );
}

export function convertElementActivationFeedbackToStyleKeys({
  config
}: ConvertActivationFeedbackOptions): StyleKeysByInteractionState {
  // The base activationFeedback key remains the compatibility/common layer.
  // Profile keys are additive and should not replace the legacy/base vars consumed by Switch.
  const styleKeys = [
    buildStyleKey({
      propertyName: 'activationFeedback',
      value: resolveActivationFeedbackConfig(config)
    })
  ];

  const hasProfileConfig = hasDeclaredProfileConfig(config);
  if (hasProfileConfig) {
    const defaultProfile = config?.profile ?? 'surface';
    const declaredProfiles = resolveDeclaredRadialProfiles(config);
    const profiles = declaredProfiles.length ? [...declaredProfiles] : [defaultProfile];
    if (!profiles.includes(defaultProfile)) profiles.unshift(defaultProfile);

    styleKeys.push(
      ...profiles.map((profile) =>
        buildStyleKey({
          propertyName: 'activationFeedbackProfile',
          value: {
            profile,
            profileConfig: resolveActivationFeedbackProfile(profile, { config })
          }
        })
      )
    );

    if (config?.profiles?.pressed) {
      styleKeys.push(
        buildStyleKey({
          propertyName: 'activationFeedbackProfile',
          value: {
            profile: 'pressed',
            profileConfig: resolvePressedActivationFeedbackProfile({ config })
          }
        })
      );
    }
  }

  return {
    rest: styleKeys
  };
}
