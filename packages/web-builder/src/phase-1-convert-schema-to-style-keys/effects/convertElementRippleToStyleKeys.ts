import type {
  RippleEffectSchema,
  RippleMode,
  StyleKeysByInteractionState
} from '@kiskadee/core';
import {
  resolvePressedRippleProfile,
  resolveRippleProfile
} from '@kiskadee/core';
import { buildStyleKey } from '../../utils/index.ts';

// [RIPPLE EFFECT 9] START: Convert ripple config into style-key buckets.
type ConvertRippleOptions = {
  config?: RippleEffectSchema;
};

function resolveAvailableModes(config?: RippleEffectSchema): RippleMode[] {
  const profiles = config?.profiles;
  const modes: RippleMode[] = [];
  if (profiles?.surface) modes.push('surface');
  if (profiles?.overflow) modes.push('overflow');
  if (profiles?.overflowStatic) modes.push('overflow-static');
  return modes;
}

export function convertElementRippleToStyleKeys({ config }: ConvertRippleOptions): StyleKeysByInteractionState {
  const defaultMode: RippleMode = config?.mode ?? 'surface';
  const declaredModes = resolveAvailableModes(config);
  const modes = declaredModes.length ? [...declaredModes] : [defaultMode];
  if (!modes.includes(defaultMode)) modes.unshift(defaultMode);

  const styleKeys = modes.map((mode) => {
    const value = {
      mode,
      profile: resolveRippleProfile(mode, { config })
    };
    return buildStyleKey({ propertyName: 'ripple', value });
  });
  styleKeys.push(
    buildStyleKey({
      propertyName: 'ripplePressed',
      value: {
        profile: resolvePressedRippleProfile({ config })
      }
    })
  );

  return { rest: styleKeys };
}
// [RIPPLE EFFECT 9] END: Convert ripple config into style-key buckets.
