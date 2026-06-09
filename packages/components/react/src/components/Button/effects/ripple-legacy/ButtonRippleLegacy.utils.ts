import type { RippleMode } from '@kiskadee/core';

export type RippleEffectBuckets = {
  rio?: string;
  rip?: string;
  ris?: string;
  rix?: string;
};

export function resolveButtonRippleModeAvailability(
  element: { e?: RippleEffectBuckets } | undefined
): RippleMode[] {
  const availableModes: RippleMode[] = [];
  if (element?.e?.ris) availableModes.push('surface');
  if (element?.e?.rio) availableModes.push('overflow');
  if (element?.e?.rix) availableModes.push('overflow-static');
  return availableModes;
}
