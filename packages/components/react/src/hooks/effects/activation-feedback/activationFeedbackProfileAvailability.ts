import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  ComponentEmphasis
} from '@kiskadee/core';
import {
  DEFAULT_ACTIVATION_FEEDBACK_PROFILES,
  resolveActivationFeedbackProfileBucket
} from '@kiskadee/core';

export type ActivationFeedbackEffectBuckets = {
  af?: string;
  afs?: string;
  afo?: string;
  afx?: string;
  afp?: string;
};

/**
 * Returns selectable radial profiles only. The pressed bucket is internal state feedback and is
 * exposed separately by resolveActivationFeedbackPressedBucketClass.
 */
export function resolveActivationFeedbackProfileAvailability(
  element: { e?: ActivationFeedbackEffectBuckets } | undefined
): ActivationFeedbackProfileMode[] {
  const availableProfiles: ActivationFeedbackProfileMode[] = [];
  for (const profile of Object.keys(
    DEFAULT_ACTIVATION_FEEDBACK_PROFILES
  ) as ActivationFeedbackProfileMode[]) {
    if (element?.e?.[resolveActivationFeedbackProfileBucket(profile)]) {
      availableProfiles.push(profile);
    }
  }
  return availableProfiles;
}

export function resolveActivationFeedbackBucketClass(
  profile: ActivationFeedbackProfileMode | null,
  effects: ActivationFeedbackEffectBuckets | undefined
): string {
  if (!profile) return '';
  return effects?.[resolveActivationFeedbackProfileBucket(profile)] ?? '';
}

export function resolveActivationFeedbackPressedBucketClass(
  effects: ActivationFeedbackEffectBuckets | undefined
): string {
  return effects?.afp ?? '';
}

export function resolveActivationFeedbackToneClass({
  config,
  emphasis
}: {
  config?: ActivationFeedbackEffectSchema;
  emphasis?: ComponentEmphasis;
}): string {
  const toneConfig = config?.visual?.tone;
  const tone = (emphasis ? toneConfig?.byEmphasis?.[emphasis] : undefined) ?? toneConfig?.default;

  if (tone === 'vivid') return 'k-aft-v';
  if (tone === 'subtle') return 'k-aft-s';
  return '';
}
