import type { ActivationFeedbackProfileMode } from '@kiskadee/core';
import { resolveSwitchActivationFeedbackEffectClassName } from '../.././Switch.class-names.ts';
import type { SwitchClassesMap } from '../.././Switch.types.ts';

export function hasSwitchActivationFeedbackEffect(
  elements: SwitchClassesMap,
  profile?: ActivationFeedbackProfileMode
): boolean {
  return resolveSwitchActivationFeedbackEffectClassName(elements.e3, profile).length > 0;
}
