import type { ElementSizeValue } from '../../../breakpoints.ts';
import type { InteractionState, SolidColor } from '../../colors/colors.types.ts';
import type { PixelValue } from '../../scales/scales.types.ts';

/** Represents a shadow property that can have different numeric values for various interaction states. */
export type ShadowByInteractionState = Partial<Record<InteractionState, PixelValue>>;

export type ShadowLayer = {
  blur: PixelValue;
  color: SolidColor;
  spread?: PixelValue;
  x: PixelValue;
  y: PixelValue;
};

export type ShadowValue = ShadowLayer | readonly ShadowLayer[];

export type ShadowGlobalEffectSchema = {
  levels: Partial<Record<ElementSizeValue, ShadowValue>>;
};

export type ShadowStateValue = ElementSizeValue | false;

export type ShadowEffectSchema = {
  fixedLevels?: readonly ElementSizeValue[];
  states?: Partial<Record<InteractionState, ShadowStateValue>>;
  targetElement: string;
};

export type ShadowSchema = Partial<{
  blur: ShadowByInteractionState;
  color: Partial<Record<InteractionState, SolidColor>>;
  spread: ShadowByInteractionState;
  y: ShadowByInteractionState;
  x: ShadowByInteractionState;
}>;
