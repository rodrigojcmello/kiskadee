import type { ActivationFeedbackProfileMode } from '@kiskadee/core';

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
  if (element?.e?.afs) availableProfiles.push('surface');
  if (element?.e?.afo) availableProfiles.push('overflow');
  if (element?.e?.afx) availableProfiles.push('overflow-static');
  return availableProfiles;
}

export function resolveActivationFeedbackBucketClass(
  profile: ActivationFeedbackProfileMode | null,
  effects: ActivationFeedbackEffectBuckets | undefined
): string {
  if (!profile) return '';
  if (profile === 'surface') return effects?.afs ?? '';
  if (profile === 'overflow') return effects?.afo ?? '';
  if (profile === 'overflow-static') return effects?.afx ?? '';
  return '';
}

export function resolveActivationFeedbackPressedBucketClass(
  effects: ActivationFeedbackEffectBuckets | undefined
): string {
  return effects?.afp ?? '';
}
