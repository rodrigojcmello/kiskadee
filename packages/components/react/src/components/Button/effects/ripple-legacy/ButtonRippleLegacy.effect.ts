import './ButtonRippleLegacy.structural.css';
import type { ComponentEmphasis, RippleMode } from '@kiskadee/core';
import type { ButtonClassNamePatch } from '../../Button.class-names.ts';
import { join } from '../../Button.class-names.ts';
import type { ButtonClassesMap } from '../../Button.types.ts';
import type { RippleEffectBuckets } from './ButtonRippleLegacy.utils.ts';

export type ButtonRippleLegacyClassNamePatchOptions = {
  controlState: boolean | undefined;
  elements: ButtonClassesMap;
  emphasis: ComponentEmphasis | undefined;
  isActive: boolean;
  isFading: boolean;
  mode: RippleMode | null;
  shouldForceOverlayPressed: boolean;
  shouldUsePressedProfile: boolean;
};

export type ButtonRippleLegacyEffectOptions = ButtonRippleLegacyClassNamePatchOptions;

export type ButtonRippleLegacyEffectResult = {
  classNamePatch: ButtonClassNamePatch;
};

const resolveRippleBucketClass = (
  rippleMode: RippleMode | null,
  effects: RippleEffectBuckets | undefined
): string => {
  if (!rippleMode) return '';
  if (rippleMode === 'surface') return effects?.ris ?? '';
  if (rippleMode === 'overflow') return effects?.rio ?? '';
  if (rippleMode === 'overflow-static') return effects?.rix ?? '';
  return '';
};

const resolveRipplePressedBucketClass = (effects: RippleEffectBuckets | undefined): string =>
  effects?.rip ?? '';

const resolveRippleEmphasisClass = (
  emphasis: ComponentEmphasis | undefined,
  controlState: boolean | undefined
): string => {
  if (controlState) return 'k-emph-h';
  if (emphasis === 'high') return 'k-emph-h';
  if (emphasis === 'low') return 'k-emph-l';
  if (emphasis === 'lowest') return 'k-emph-ll';
  return 'k-emph-m';
};

export function resolveButtonRippleLegacyClassNamePatch({
  controlState,
  elements,
  emphasis,
  isActive,
  isFading,
  mode,
  shouldForceOverlayPressed,
  shouldUsePressedProfile
}: ButtonRippleLegacyClassNamePatchOptions): ButtonClassNamePatch {
  if (!mode) return {};

  const effects = elements.e1?.e;
  const profileBucket = shouldUsePressedProfile
    ? resolveRipplePressedBucketClass(effects) || resolveRippleBucketClass(mode, effects)
    : resolveRippleBucketClass(mode, effects);

  return {
    e1:
      join(
        profileBucket,
        resolveRippleEmphasisClass(emphasis, controlState),
        'k-ripple',
        'k-btn-e1a',
        isActive ? 'k-ripple-active k-btn-e1b' : '',
        isFading && !shouldForceOverlayPressed ? 'k-ripple-fade k-btn-e1c' : ''
      ) ?? ''
  };
}

export function resolveButtonRippleLegacyEffect(
  options: ButtonRippleLegacyEffectOptions
): ButtonRippleLegacyEffectResult {
  return {
    classNamePatch: resolveButtonRippleLegacyClassNamePatch(options)
  };
}
