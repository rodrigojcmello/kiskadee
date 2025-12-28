import type {
  ComponentIntents,
  GlobalSemanticsBySegment,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors
} from '@kiskadee/core';

// iOS 26 - https://www.sketch.com/s/f63aa308-1f82-498c-8019-530f3b846db9
// iOS 18 - https://www.sketch.com/s/bb57439f-19da-4c7a-bfd2-a196cf51f766/symbols

const primaryLight = {
  subtle: {
            // Subtle track: 0–10 (every 1%), then 15, 20, 25, 30
            0: [206, 100, 100, 1], // 0% darkness (white/lightest)
            1: [206, 100, 99, 1], // 1% darkness
            2: [206, 100, 98, 1], // 2% darkness
            3: [206, 100, 97, 1], // 3% darkness
            4: [206, 100, 96, 1], // 4% darkness
            5: [206, 100, 95, 1], // 5% darkness
            6: [206, 100, 94, 1], // 6% darkness
            7: [206, 100, 93, 1], // 7% darkness
            8: [206, 100, 92, 1], // 8% darkness
            9: [206, 100, 91, 1], // 9% darkness
            10: [206, 100, 90, 1], // 10% darkness
            15: [206, 100, 85, 1], // 15% darkness
            20: [206, 100, 80, 1], // 20% darkness
            25: [206, 100, 75, 1], // 25% darkness
            30: [206, 100, 70, 1] // 30% darkness
  },
  vivid: {
            // Vivid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
            40: [206, 100, 60, 1], // 40% darkness
            50: [206, 100, 50, 1], // 50% darkness - #0091FF - ANCHOR (unchanged)
            60: [206, 100, 40, 1], // 60% darkness
            70: [206, 100, 30, 1], // 70% darkness
            80: [206, 100, 20, 1], // 80% darkness
            90: [206, 100, 10, 1], // 90% darkness
            100: [206, 100, 0, 1] // 100% darkness (black/darkest)
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
        light: neutralLightScale,
        dark: neutralLightScale
      }
    }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: { solid: { hue: 'blue', name: 'v1' } },
    neutral: { solid: { hue: 'black', name: 'v1' } }
  },
  dark: {
    primary: { solid: { hue: 'blue', name: 'v1' } },
    neutral: { solid: { hue: 'black', name: 'v1' } }
  }
} as const satisfies GlobalSemanticsByTheme;

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
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;
