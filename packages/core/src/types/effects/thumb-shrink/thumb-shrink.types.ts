import type { PixelValue, ScaleBySize } from '../../scales/scales.types.ts';

export type ThumbShrinkEffectValue = PixelValue | ScaleBySize;

export type ThumbShrinkEffectRest = Partial<{
  boxWidth: ThumbShrinkEffectValue;
  boxHeight: ThumbShrinkEffectValue;
}>;

/** Switch runtimes apply this effect only at resolved lg sizes, never sm/md tiers. */
export type ThumbShrinkEffectSchema = Partial<{
  rest: ThumbShrinkEffectRest;
}>;
