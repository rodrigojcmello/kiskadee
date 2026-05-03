import type { InteractionState, SolidColor } from '../../colors/colors.types.ts';
import type { PixelValue } from '../../scales/scales.types.ts';

/** Represents a shadow property that can have different numeric values for various interaction states. */
export type ShadowByInteractionState = Partial<Record<InteractionState, PixelValue>>;

export type ShadowSchema = Partial<{
  blur: ShadowByInteractionState;
  color: Partial<Record<InteractionState, SolidColor>>;
  y: ShadowByInteractionState;
  x: ShadowByInteractionState;
}>;
