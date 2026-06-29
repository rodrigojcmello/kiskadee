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

export type ShadowLayerValue = ShadowLayer | readonly ShadowLayer[];

export type ShadowKind = 'inner' | 'outer';

export type ShadowGlobalEffectSchema = {
  inner?: {
    levels: Partial<Record<ElementSizeValue, ShadowLayerValue>>;
  };
  outer?: {
    levels: Partial<Record<ElementSizeValue, ShadowLayerValue>>;
  };
};

export type ShadowStateValue = ElementSizeValue | false;

export type ShadowElementEffectSchema = {
  fixedLevels?: readonly ElementSizeValue[];
  kind: ShadowKind;
  states?: Partial<Record<InteractionState, ShadowStateValue>>;
};

export type ShadowEffectSchema = Partial<Record<string, ShadowElementEffectSchema>>;

export type ShadowSchema = Partial<{
  blur: ShadowByInteractionState;
  color: Partial<Record<InteractionState, SolidColor>>;
  spread: ShadowByInteractionState;
  y: ShadowByInteractionState;
  x: ShadowByInteractionState;
}>;
