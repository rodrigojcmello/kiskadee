import type { RippleMode } from '@kiskadee/core';

// [RIPPLE EFFECT 19] START: Runtime ripple mode availability resolution.
export type RippleEffectBuckets = {
  ris?: string;
  rio?: string;
  rix?: string;
  rip?: string;
};

export function resolveRippleModeAvailability(
  e1: { e?: RippleEffectBuckets } | undefined
): RippleMode[] {
  const availableModes: RippleMode[] = [];
  if (e1?.e?.ris) availableModes.push('surface');
  if (e1?.e?.rio) availableModes.push('overflow');
  if (e1?.e?.rix) availableModes.push('overflow-static');
  return availableModes;
}
// [RIPPLE EFFECT 19] END: Runtime ripple mode availability resolution.
