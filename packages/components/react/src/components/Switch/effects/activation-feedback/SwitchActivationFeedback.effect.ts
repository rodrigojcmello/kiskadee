import '../../../../hooks/effects/activation-feedback/ActivationFeedbackHalo.structural.css';
import './SwitchActivationFeedback.structural.css';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackProfileMode,
  ComponentEmphasis
} from '@kiskadee/core';
import { resolveActivationFeedbackToneClass } from '../../../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import {
  join,
  resolveSwitchActivationFeedbackEffectClassName
} from '../.././Switch.class-names.ts';
import type { SwitchClassesMap, SwitchClassNames } from '../.././Switch.types.ts';

export type SwitchActivationFeedbackEffectOptions = {
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
          resolveActivationFeedbackToneClass({ config, emphasis }),
          isActive ? 'k-afxa' : ''
        ) ?? ''
    }
  };
}
