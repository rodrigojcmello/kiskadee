import './SwitchV2ActivationFeedback.structural.css';
import {
  join,
  resolveSwitchActivationFeedbackEffectClassName
} from '../../../Switch/Switch.class-names.ts';
import type { SwitchClassesMap, SwitchClassNames } from '../../../Switch/Switch.types.ts';

export type SwitchV2ActivationFeedbackEffectOptions = {
  elements: SwitchClassesMap;
  isActive: boolean;
};

export type SwitchV2ActivationFeedbackEffectResult = {
  classNamePatch: SwitchClassNames;
};

export function resolveSwitchV2ActivationFeedbackEffect({
  elements,
  isActive
}: SwitchV2ActivationFeedbackEffectOptions): SwitchV2ActivationFeedbackEffectResult {
  const activationFeedbackClassName = resolveSwitchActivationFeedbackEffectClassName(elements.e3);

  if (!activationFeedbackClassName) {
    return {
      classNamePatch: {}
    };
  }

  return {
    classNamePatch: {
      e2: 'k-sw2-af-track',
      e3: join(activationFeedbackClassName, 'k-sw2-af', isActive ? 'k-sw2-af-active' : '') ?? ''
    }
  };
}
