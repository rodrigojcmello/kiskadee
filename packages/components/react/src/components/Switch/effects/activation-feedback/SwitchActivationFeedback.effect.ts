import './SwitchActivationFeedback.structural.css';
import type { ComponentEmphasis } from '@kiskadee/core';
import {
  join,
  resolveSwitchActivationFeedbackEffectClassName
} from '../.././Switch.class-names.ts';
import type { SwitchClassesMap, SwitchClassNames } from '../.././Switch.types.ts';

export type SwitchActivationFeedbackEffectOptions = {
  emphasis: ComponentEmphasis;
  elements: SwitchClassesMap;
  isActive: boolean;
};

export type SwitchActivationFeedbackEffectResult = {
  classNamePatch: SwitchClassNames;
};

export function resolveSwitchActivationFeedbackEffect({
  emphasis,
  elements,
  isActive
}: SwitchActivationFeedbackEffectOptions): SwitchActivationFeedbackEffectResult {
  const activationFeedbackClassName = resolveSwitchActivationFeedbackEffectClassName(elements.e3);

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
          'k-swt-e3b-a',
          isActive ? 'k-swt-e3c-a' : '',
          emphasis === 'low' ? 'k-swt-e3f-a' : ''
        ) ?? ''
    }
  };
}
