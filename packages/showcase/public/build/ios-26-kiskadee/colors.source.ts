import type { SchemaSegments } from '@kiskadee/core';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

/**
 * Segments definition for the iOS 26 design system.
 * Each segment represents a brand/product identity with support for multiple theme modes.
 *
 * Current implementation includes:
 * - ios: Primary segment with light theme (blue brand color HSL 206°)
 *
 * All segments include universal semantic colors:
 * - primary: Brand identity color (varies by segment)
 * - secondary: Supporting brand color
 * - greenLike: Success, purchase, confirmation, profit (always green ~140°)
 * - yellowLike: Attention, warning, caution (always yellow ~45°)
 * - redLike: Danger, error, urgent, notification (always red ~0°)
 * - neutral: Text, backgrounds, borders, dividers (always grayscale)
 */
export const segments: SchemaSegments = {
  ios: {
    name: 'Default',
    mainColor: 'blue',
    themes: {
      light: {
        primary: {
          soft: {
            // Soft track: 0–10 (every 1%), then 15, 20, 25, 30
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
          solid: {
            // Solid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
            40: [206, 100, 60, 1], // 40% darkness
            50: [206, 100, 50, 1], // 50% darkness - #0091FF - ANCHOR (unchanged)
            60: [206, 100, 40, 1], // 60% darkness
            70: [206, 100, 30, 1], // 70% darkness
            80: [206, 100, 20, 1], // 80% darkness
            90: [206, 100, 10, 1], // 90% darkness
            100: [206, 100, 0, 1] // 100% darkness (black/darkest)
          }
        },
        neutral: {
          soft: {
            // Soft track: 0–10 (every 1%), then 15, 20, 25, 30
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
          solid: {
            // Solid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
            40: [0, 0, 60, 1], // 40% darkness
            50: [0, 0, 50, 1], // 50% darkness
            60: [0, 0, 40, 1], // 60% darkness
            70: [0, 0, 30, 1], // 70% darkness
            80: [0, 0, 20, 1], // 80% darkness
            90: [0, 0, 10, 1], // 90% darkness
            100: [0, 0, 0, 1] // 100% darkness (black/darkest)
          }
        },
        secondary: {
          soft: {
            0: [180, 0, 100, 1],
            1: [180, 20, 92, 1],
            5: [180, 40, 75, 1],
            10: [180, 50, 60, 1]
          },
          solid: {
            50: [180, 60, 40, 1],
            100: [180, 60, 5, 1]
          }
        },
        greenLike: {
          soft: {
            0: [140, 0, 100, 1],
            1: [140, 30, 90, 1],
            5: [140, 50, 70, 1],
            10: [140, 60, 55, 1]
          },
          solid: {
            50: [140, 70, 40, 1], // Green mid-tone for "buy", "confirm"
            100: [140, 70, 5, 1]
          }
        },
        yellowLike: {
          soft: {
            0: [45, 0, 100, 1],
            1: [45, 40, 90, 1],
            5: [45, 80, 75, 1],
            10: [45, 90, 60, 1]
          },
          solid: {
            50: [45, 95, 50, 1], // Yellow/amber for "attention"
            100: [45, 95, 10, 1]
          }
        },
        redLike: {
          soft: {
            // Soft track: 0–10 (every 1%), then 15, 20, 25, 30
            0: [359, 100, 100, 1], // 0% darkness (white/lightest)
            1: [359, 100, 99, 1], // 1% darkness
            2: [359, 100, 98, 1], // 2% darkness
            3: [359, 100, 97, 1], // 3% darkness
            4: [359, 100, 96, 1], // 4% darkness
            5: [359, 100, 95, 1], // 5% darkness
            6: [359, 100, 94, 1], // 6% darkness
            7: [359, 100, 93, 1], // 7% darkness
            8: [359, 100, 92, 1], // 8% darkness
            9: [359, 100, 91, 1], // 9% darkness
            10: [359, 100, 90, 1], // 10% darkness
            15: [359, 100, 85, 1], // 15% darkness
            20: [359, 100, 80, 1], // 20% darkness
            25: [359, 100, 75, 1], // 25% darkness
            30: [359, 100, 70, 1] // 30% darkness
          },
          solid: {
            // Solid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
            40: [359, 100, 60, 1], // 40% darkness
            50: [359, 100, 50, 1], // 50% darkness - #FF383C - ANCHOR (unchanged)
            60: [359, 100, 40, 1], // 60% darkness
            70: [359, 100, 30, 1], // 70% darkness
            80: [359, 100, 20, 1], // 80% darkness
            90: [359, 100, 10, 1], // 90% darkness
            100: [359, 100, 0, 1] // 100% darkness (black/darkest)
          }
        }
      },
      dark: {
        redLike: {
          soft: {
            // Soft track: 0–10 (every 1%), then 15, 20, 25, 30
            0: [359, 100, 100, 1], // 0% darkness (white/lightest)
            1: [359, 100, 99, 1], // 1% darkness
            2: [359, 100, 98, 1], // 2% darkness
            3: [359, 100, 97, 1], // 3% darkness
            4: [359, 100, 96, 1], // 4% darkness
            5: [359, 100, 95, 1], // 5% darkness
            6: [359, 100, 94, 1], // 6% darkness
            7: [359, 100, 93, 1], // 7% darkness
            8: [359, 100, 92, 1], // 8% darkness
            9: [359, 100, 91, 1], // 9% darkness
            10: [359, 100, 90, 1], // 10% darkness
            15: [359, 100, 85, 1], // 15% darkness
            20: [359, 100, 80, 1], // 20% darkness
            25: [359, 100, 75, 1], // 25% darkness
            30: [359, 100, 70, 1] // 30% darkness
          },
          solid: {
            // Solid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
            40: [359, 100, 60, 1], // 40% darkness
            50: [359, 100, 50, 1], // 50% darkness - #FF4245 - ANCHOR (unchanged)
            60: [359, 100, 40, 1], // 60% darkness
            70: [359, 100, 30, 1], // 70% darkness
            80: [359, 100, 20, 1], // 80% darkness
            90: [359, 100, 10, 1], // 90% darkness
            100: [359, 100, 0, 1] // 100% darkness (black/darkest)
          }
        }
      }
    }
  }
};
