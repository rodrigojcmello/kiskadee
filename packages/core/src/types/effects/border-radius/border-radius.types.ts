// Responsive numeric value compatible with `scales`: either a single pixel value or
// a map keyed by element size/breakpoint tokens like 's:md:1'.

import type { ElementAllSizeValue, ElementSizeValue } from '../../../breakpoints';
import type { InteractionState } from '../../colors/colors.types';
import type { PixelValue } from '../../scales/scales.types';

export type ResponsiveNumeric =
  | PixelValue
  | Partial<Record<ElementSizeValue | ElementAllSizeValue, PixelValue>>;

// Numeric values by interaction state (excluding the compound 'selected' container)
export type NumericByInteractionState = Partial<
  Record<Exclude<InteractionState, 'selected'>, ResponsiveNumeric>
>;

// Allows a nested `selected` block mirroring the palette structure
export type NumericWithSelected = NumericByInteractionState &
  Partial<{
    selected: NumericByInteractionState;
  }>;

export type BorderRadiusEffectMode = 'rounded' | 'full';

// Effect schema for border-radius with optional transition control
export type BorderRadiusEffectSchema = Partial<Record<BorderRadiusEffectMode, NumericWithSelected>>;
