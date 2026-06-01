import { resolveSwitchActivationFeedbackEffectClassName } from '../../../Switch/Switch.class-names.ts';
import type { SwitchClassesMap } from '../../../Switch/Switch.types.ts';

export function hasSwitchV2ActivationFeedbackEffect(elements: SwitchClassesMap): boolean {
  return resolveSwitchActivationFeedbackEffectClassName(elements.e3).length > 0;
}
