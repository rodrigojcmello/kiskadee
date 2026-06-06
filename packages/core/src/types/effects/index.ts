// import type { SolidColor } from '../colors/colors.types.ts';
import type { BorderRadiusEffectSchema } from './border-radius/border-radius.types.ts';
import type { ShadowSchema } from './shadow/shadow.types.ts';
import type { ThumbShrinkEffectSchema } from './thumb-shrink/thumb-shrink.types.ts';

export type ElementEffects = Partial<{
  shadow: Partial<ShadowSchema>;
  borderRadius: BorderRadiusEffectSchema;
  thumbShrink: ThumbShrinkEffectSchema;
  activationFeedback: boolean;
  // [RIPPLE EFFECT 4] START: Element-level ripple opt-in flag.
  ripple: boolean;
  // [RIPPLE EFFECT 4] END: Element-level ripple opt-in flag.
}>;

// export type GlobalEffects = Partial<{
//   focusTrail: {
//     color: SolidColor;
//   };
//   ripple: {
//     bounded: boolean;
//     origin: 'center' | 'pointer';
//     color: SolidColor;
//   };
// }>;
