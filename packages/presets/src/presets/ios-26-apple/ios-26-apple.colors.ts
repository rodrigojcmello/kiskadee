import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';
import greenLight from './colors/green.light.ts';
import neutralLight from './colors/neutral.light.ts';
import primaryLight from './colors/primary.light.ts';
import redLight from './colors/red.light.ts';

// iOS 26 - https://www.sketch.com/s/f63aa308-1f82-498c-8019-530f3b846db9
// iOS 18 - https://www.sketch.com/s/bb57439f-19da-4c7a-bfd2-a196cf51f766/symbols

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

// NOTE: This preset is currently light-only. We keep `dark` keys present as placeholders.

export const primitiveColors = {
  blue: {
    v1: {
      solid: {
        light: primaryLight,
        dark: primaryLight
      }
    }
  },
  black: {
    v1: {
      solid: {
        light: neutralLight,
        dark: neutralLight
      }
    }
  },
  green: {
    v1: {
      solid: {
        light: greenLight,
        dark: greenLight
      }
    }
  },
  red: {
    v1: {
      solid: {
        light: redLight,
        dark: redLight
      }
    }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' },
    redLike: { v1: 'primitive.red.v1' },
    greenLike: { v1: 'primitive.green.v1' }
  },
  dark: {
    primary: { v1: 'primitive.blue.v1' },
    neutral: { v1: 'primitive.black.v1' },
    redLike: { v1: 'primitive.red.v1' },
    greenLike: { v1: 'primitive.green.v1' }
  }
} as const satisfies GlobalSemanticsByTheme;

// -------------------------------------------------------------------------------------------------
// Color Layer 2 - Global semantics by segment (registry + optional overrides)
// -------------------------------------------------------------------------------------------------

/**
 * Segment registry + optional per-segment overrides for global semantics.
 *
 * - `default` is always present to register the primary segment.
 * - `themes` is optional and should be used only when a segment must override Layer 2 mappings.
 */
export const globalSemanticsBySegment = {
  default: {
    meta: {
      name: 'Default'
    }
  }
} as const satisfies GlobalSemanticsBySegment;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'
  },
  switch: {
    neutral: 'neutral',
    primary: 'primary',
    // Composite intent: role lookup points at the positive/on pole; off uses redLike in the palette.
    polarity: 'greenLike'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
