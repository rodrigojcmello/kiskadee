import './SwitchV2ActivationFeedback.structural.css';
import {
  join,
  resolveSwitchActivationFeedbackEffectClassName
} from '../../../Switch/Switch.class-names.ts';
import type { SwitchClassesMap, SwitchClassNames } from '../../../Switch/Switch.types.ts';

export type SwitchV2ActivationFeedbackEffectOptions = {
  classNames: Required<SwitchClassNames>;
  elements: SwitchClassesMap;
  isActive: boolean;
};

export type SwitchV2ActivationFeedbackEffectResult = {
  classNames: Required<SwitchClassNames>;
};

export function resolveSwitchV2ActivationFeedbackEffect({
  classNames,
  elements,
  isActive
}: SwitchV2ActivationFeedbackEffectOptions): SwitchV2ActivationFeedbackEffectResult {
  const activationFeedbackClassName = resolveSwitchActivationFeedbackEffectClassName(elements.e3);

  if (!activationFeedbackClassName) {
    return {
      classNames
    };
  }

  return {
    classNames: {
      ...classNames,
      e2: join(classNames.e2, 'k-sw2-af-track') ?? '',
      e3:
        join(
          classNames.e3,
          activationFeedbackClassName,
          'k-sw2-af',
          isActive ? 'k-sw2-af-active' : ''
        ) ?? ''
    }
  };
}
