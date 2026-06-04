import { resolveSwitchActivationFeedbackEffectClassName } from '../.././Switch.class-names.ts';
import type { SwitchClassesMap } from '../.././Switch.types.ts';

export function hasSwitchActivationFeedbackEffect(elements: SwitchClassesMap): boolean {
  return resolveSwitchActivationFeedbackEffectClassName(elements.e3).length > 0;
}
