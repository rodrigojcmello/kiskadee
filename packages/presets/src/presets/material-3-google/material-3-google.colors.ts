import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';

// NOTE:
// - The segment key must stay in sync with the palette name used in the
//   schema ("material" in material-3-google.schema.ts).
// - Palette files are emitted as <segment>.<theme>.kiskadee.(css|json), so
//   using "material" here ensures the generated filenames match
//   "material.light.kiskadee.*" and can be correctly discovered by the
//   Next.js showcase registry.

const primaryLight = {
  subtle: {
    // Subtle track: 0–10 (every 1%), then 15, 20, 25, 30
    0: [256, 34, 100, 1], // 0% darkness (white/lightest)
    1: [256, 34, 99, 1], // 1% darkness
    2: [256, 34, 98, 1], // 2% darkness
    3: [256, 34, 97, 1], // 3% darkness
    4: [256, 34, 96, 1], // 4% darkness
    5: [256, 34, 95, 1], // 5% darkness
    6: [256, 34, 94, 1], // 6% darkness
    7: [256, 34, 93, 1], // 7% darkness
    8: [256, 34, 92, 1], // 8% darkness
    9: [256, 34, 91, 1], // 9% darkness
    10: [256, 34, 90, 1], // 10% darkness
    15: [256, 34, 85, 1], // 15% darkness
    20: [256, 34, 80, 1], // 20% darkness
    25: [256, 34, 75, 1], // 25% darkness
    30: [256, 34, 70, 1] // 30% darkness
  },
  vivid: {
    // Vivid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
    40: [256, 34, 60, 1], // 40% darkness
    50: [256, 34, 50, 1], // 50% darkness - #6750A4 - ANCHOR (unchanged)
    60: [256, 34, 40, 1], // 60% darkness
    70: [256, 34, 30, 1], // 70% darkness
    80: [256, 34, 20, 1], // 80% darkness
    90: [256, 34, 10, 1], // 90% darkness
    100: [256, 34, 0, 1] // 100% darkness (black/darkest)
  }
} as const;

const neutralLightScale = {
  subtle: {
    // Subtle track: 0–10 (every 1%), then 15, 20, 25, 30
    0: [0, 0, 100, 1], // 0% darkness (white/lightest)
    1: [0, 0, 99, 1], // 1% darkness
    2: [0, 0, 98, 1], // 2% darkness
    3: [0, 0, 97, 1], // 3% darkness
    4: [0, 0, 96, 1], // 4% darkness
    5: [0, 0, 95, 1], // 5% darkness
    6: [0, 0, 94, 1], // 6% darkness
    7: [0, 0, 93, 1], // 7% darkness
    8: [0, 0, 92, 1], // 8% darkness
    9: [0, 0, 91, 1], // 9% darkness
    10: [0, 0, 90, 1], // 10% darkness
    15: [0, 0, 85, 1], // 15% darkness
    20: [0, 0, 80, 1], // 20% darkness
    25: [0, 0, 75, 1], // 25% darkness
    30: [0, 0, 70, 1] // 30% darkness
  },
  vivid: {
    // Vivid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
    40: [0, 0, 60, 1], // 40% darkness
    50: [0, 0, 50, 1], // 50% darkness
    60: [0, 0, 40, 1], // 60% darkness
    70: [0, 0, 30, 1], // 70% darkness
    80: [0, 0, 20, 1], // 80% darkness
    90: [0, 0, 10, 1], // 90% darkness
    100: [0, 0, 0, 1] // 100% darkness (black/darkest)
  }
} as const;

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

// NOTE: This preset is currently light-only. We keep `dark` keys present as placeholders.

export const primitiveColors = {
  purple: {
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
        light: neutralLightScale,
        dark: neutralLightScale
      }
    }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: 'primitive.purple.v1',
    neutral: 'primitive.black.v1'
  },
  dark: {
    primary: 'primitive.purple.v1',
    neutral: 'primitive.black.v1'
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
      name: 'Material Design - Default (purple)'
    }
  }
} as const satisfies GlobalSemanticsBySegment;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
