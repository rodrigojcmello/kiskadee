import type { PixelValue, ScaleBySize } from '../../scales/scales.types.ts';

export type ThumbSizeEffectValue = PixelValue | ScaleBySize;

export type ThumbSizeEffectRest = Partial<{
  boxWidth: ThumbSizeEffectValue;
  boxHeight: ThumbSizeEffectValue;
}>;

export type ThumbSizeEffectSchema = Partial<{
  rest: ThumbSizeEffectRest;
}>;
