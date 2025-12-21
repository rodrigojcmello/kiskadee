import type {
  ComponentIntents,
  GlobalSemanticsByTheme,
  PrimitiveColors,
  SchemaColors,
  SchemaSegments
} from '@kiskadee/core';

// NOTE:
// - The segment key must stay in sync with the palette name used in the
//   schema ("material" in material-3-google.schema.ts).
// - Palette files are emitted as <segment>.<theme>.kiskadee.(css|json), so
//   using "material" here ensures the generated filenames match
//   "material.light.kiskadee.*" and can be correctly discovered by the
//   Next.js showcase registry.

type Segment = 'default';

export const segments: SchemaSegments<Segment> = {
  default: {
    name: 'Material Design - Default (purple)', // e.g. YouTube, Google, WhatsApp
    mainColor: 'purple',
    themes: {
      light: {
        primary: {
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
        },
        secondary: {
          subtle: {
            0: [180, 0, 100, 1],
            1: [180, 20, 92, 1],
            5: [180, 40, 75, 1],
            10: [180, 50, 60, 1]
          },
          vivid: {
            50: [180, 60, 40, 1],
            100: [180, 60, 5, 1]
          }
        },
        greenLike: {
          subtle: {
            0: [140, 0, 100, 1],
            1: [140, 30, 90, 1],
            5: [140, 50, 70, 1],
            10: [140, 60, 55, 1]
          },
          vivid: {
            50: [140, 70, 40, 1], // Green mid-emphasis for "buy", "confirm"
            100: [140, 70, 5, 1]
          }
        },
        yellowLike: {
          subtle: {
            0: [45, 0, 100, 1],
            1: [45, 40, 90, 1],
            5: [45, 80, 75, 1],
            10: [45, 90, 60, 1]
          },
          vivid: {
            50: [45, 95, 50, 1], // Yellow/amber for "attention"
            100: [45, 95, 10, 1]
          }
        },
        redLike: {
          subtle: {
            0: [0, 0, 100, 1],
            1: [0, 40, 90, 1],
            5: [0, 70, 75, 1],
            10: [0, 80, 60, 1]
          },
          vivid: {
            50: [0, 85, 50, 1], // Red mid-emphasis for "urgent", "notification"
            100: [0, 85, 10, 1]
          }
        },
        neutral: {
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
        }
      }
    }
  }
};

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

// NOTE: This preset is currently light-only. We keep `dark` keys present as placeholders.

export const primitiveColors = {
  purple: {
    default: {
      solid: {
        light: segments?.default?.themes?.light?.primary,
        dark: segments?.default?.themes?.light?.primary
      }
    }
  },
  black: {
    default: {
      solid: {
        light: segments?.default?.themes?.light?.neutral,
        dark: segments?.default?.themes?.light?.neutral
      }
    }
  }
} as const satisfies PrimitiveColors;

export const globalSemantics = {
  light: {
    primary: { solid: { hue: 'purple', name: 'default' } },
    neutral: { solid: { hue: 'black', name: 'default' } }
  },
  dark: {
    primary: { solid: { hue: 'purple', name: 'default' } },
    neutral: { solid: { hue: 'black', name: 'default' } }
  }
} as const satisfies GlobalSemanticsByTheme;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral'
  }
} as const satisfies ComponentIntents;

export const schemaColors = {
  primitiveColors,
  globalSemantics,
  componentIntents
} as const satisfies SchemaColors;
