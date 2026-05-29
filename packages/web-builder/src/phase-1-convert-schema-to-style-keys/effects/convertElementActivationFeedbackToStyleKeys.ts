import type {
  ActivationFeedbackEffectSchema,
  StyleKeysByInteractionState
} from '@kiskadee/core';
import { resolveActivationFeedbackConfig } from '@kiskadee/core';
import { buildStyleKey } from '../../utils/index.ts';

type ConvertActivationFeedbackOptions = {
  config?: ActivationFeedbackEffectSchema;
};

export function convertElementActivationFeedbackToStyleKeys({
  config
}: ConvertActivationFeedbackOptions): StyleKeysByInteractionState {
  return {
    rest: [
      buildStyleKey({
        propertyName: 'activationFeedback',
        value: resolveActivationFeedbackConfig(config)
      })
    ]
  };
}
