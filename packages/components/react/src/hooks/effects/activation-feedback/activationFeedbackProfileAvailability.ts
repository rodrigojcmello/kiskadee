import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  ComponentEmphasis
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
  if (element?.e?.afs) availableProfiles.push('ripple');
  if (element?.e?.afo) availableProfiles.push('ripple-overflow');
  if (element?.e?.afx) availableProfiles.push('halo');
  return availableProfiles;
}

export function resolveActivationFeedbackBucketClass(
  profile: ActivationFeedbackProfileMode | null,
  effects: ActivationFeedbackEffectBuckets | undefined
): string {
  if (!profile) return '';
  if (profile === 'ripple') return effects?.afs ?? '';
  if (profile === 'ripple-overflow') return effects?.afo ?? '';
  if (profile === 'halo') return effects?.afx ?? '';
  return '';
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
