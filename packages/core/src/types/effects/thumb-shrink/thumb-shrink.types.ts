import type { PixelValue, ScaleBySize } from '../../scales/scales.types.ts';

export type ThumbShrinkEffectValue = PixelValue | ScaleBySize;

export type ThumbShrinkEffectRest = Partial<{
  boxWidth: ThumbShrinkEffectValue;
  boxHeight: ThumbShrinkEffectValue;
}>;

export type ThumbShrinkEffectSchema = Partial<{
  rest: ThumbShrinkEffectRest;
}>;
