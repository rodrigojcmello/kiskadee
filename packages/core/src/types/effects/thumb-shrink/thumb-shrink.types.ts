import type { PixelValue, ScaleBySize } from '../../scales/scales.types.ts';

export type ThumbShrinkEffectValue = PixelValue | ScaleBySize;

export type ThumbShrinkEffectRest = Partial<{
  boxWidth: ThumbShrinkEffectValue;
  boxHeight: ThumbShrinkEffectValue;
}>;

/** Switch runtimes apply this effect only at resolved md/lg sizes, never sm tiers. */
export type ThumbShrinkEffectSchema = Partial<{
  rest: ThumbShrinkEffectRest;
}>;
