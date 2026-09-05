import '../../../../hooks/effects/activation-feedback/ActivationFeedbackHalo.structural.css';
import './SwitchActivationFeedback.structural.css';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  ComponentEmphasis,
  SurfaceContext
} from '@kiskadee/core';
import { resolveActivationFeedbackToneClass } from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import {
  join,
  resolveSwitchActivationFeedbackEffectClassName
} from '../.././Switch.class-names.ts';
import type { SwitchClassesMap, SwitchClassNames } from '../.././Switch.types.ts';

export type SwitchActivationFeedbackEffectOptions = {
  surfaceContext?: SurfaceContext;
  config?: ActivationFeedbackEffectSchema;
  emphasis: ComponentEmphasis;
  elements: SwitchClassesMap;
  isActive: boolean;
  profile: ActivationFeedbackProfileMode;
};

export type SwitchActivationFeedbackEffectResult = {
  classNamePatch: SwitchClassNames;
};

export function resolveSwitchActivationFeedbackEffect({
  surfaceContext,
  config,
  emphasis,
  elements,
  isActive,
  profile
}: SwitchActivationFeedbackEffectOptions): SwitchActivationFeedbackEffectResult {
  const activationFeedbackClassName = resolveSwitchActivationFeedbackEffectClassName(
    elements.e3,
    profile
  );

  if (!activationFeedbackClassName) {
    return {
      classNamePatch: {}
    };
  }

  return {
    classNamePatch: {
      e2: 'k-swt-e2a-a',
      e3:
        join(
          activationFeedbackClassName,
          'k-afx',
          resolveActivationFeedbackToneClass({ config, emphasis, surfaceContext }),
          isActive ? 'k-afxa' : ''
        ) ?? ''
    }
  };
}
