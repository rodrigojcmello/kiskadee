import './SwitchActivationFeedback.structural.css';
import {
  join,
  resolveSwitchActivationFeedbackEffectClassName
} from '../.././Switch.class-names.ts';
import type { SwitchClassesMap, SwitchClassNames } from '../.././Switch.types.ts';

export type SwitchActivationFeedbackEffectOptions = {
  elements: SwitchClassesMap;
  isActive: boolean;
};

export type SwitchActivationFeedbackEffectResult = {
  classNamePatch: SwitchClassNames;
};

export function resolveSwitchActivationFeedbackEffect({
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
      e2: 'k-swt-af-track',
      e3: join(activationFeedbackClassName, 'k-swt-af', isActive ? 'k-swt-af-active' : '') ?? ''
    }
  };
}
