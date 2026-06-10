// import type { SolidColor } from '../colors/colors.types.ts';
import type { ActivationFeedbackSetting } from './activation-feedback/activation-feedback.types.ts';
import type { BorderRadiusEffectSchema } from './border-radius/border-radius.types.ts';
import type { ShadowSchema } from './shadow/shadow.types.ts';
import type { ThumbShrinkEffectSchema } from './thumb-shrink/thumb-shrink.types.ts';

export type ElementEffects = Partial<{
  shadow: Partial<ShadowSchema>;
  borderRadius: BorderRadiusEffectSchema;
  thumbShrink: ThumbShrinkEffectSchema;
  activationFeedback: ActivationFeedbackSetting;
}>;
