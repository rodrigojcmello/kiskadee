import type { SchemaSegments } from '@kiskadee/core';

// iOS 26 - https://www.sketch.com/s/f63aa308-1f82-498c-8019-530f3b846db9
// iOS 18 - https://www.sketch.com/s/bb57439f-19da-4c7a-bfd2-a196cf51f766/symbols

type Segment = 'default';

export const segments: SchemaSegments<Segment> = {
  default: {
    name: 'Default',
    mainColor: 'blue',
    themes: {
      light: {
        primary: {
          soft: {
            // Soft track: 0–10 (every 1%), then 15, 20, 25, 30
            0: [208, 85, 100, 1], // 0% darkness (white/lightest)
            1: [208, 85, 99, 1], // 1% darkness
            2: [208, 85, 98, 1], // 2% darkness
            3: [208, 85, 97, 1], // 3% darkness
            4: [208, 85, 96, 1], // 4% darkness
            5: [208, 85, 95, 1], // 5% darkness
            6: [208, 85, 94, 1], // 6% darkness
            7: [208, 85, 93, 1], // 7% darkness
            8: [208, 85, 92, 1], // 8% darkness
            9: [208, 85, 91, 1], // 9% darkness
            10: [208, 85, 90, 1], // 10% darkness
            15: [208, 85, 85, 1], // 15% darkness
            20: [208, 85, 80, 1], // 20% darkness
            25: [208, 85, 75, 1], // 25% darkness
            30: [208, 85, 70, 1] // 30% darkness
          },
          solid: {
            // Solid track: 40–100 every 10% darkness (40,50,60,70,80,90,100); 50 is the anchor
            40: [208, 85, 60, 1], // 40% darkness
            50: [208, 85, 50, 1], // 50% darkness - #0F6CBD - ANCHOR (unchanged)
            60: [208, 85, 40, 1], // 60% darkness
            70: [208, 85, 30, 1], // 70% darkness
            80: [208, 85, 20, 1], // 80% darkness
            90: [208, 85, 10, 1], // 90% darkness
            100: [208, 85, 0, 1] // 100% darkness (black/darkest)
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
            0: [0, 0, 100, 1],
            1: [0, 40, 90, 1],
            5: [0, 70, 75, 1],
            10: [0, 80, 60, 1]
          },
          solid: {
            50: [0, 85, 50, 1], // Red mid-tone for "urgent", "notification"
            100: [0, 85, 10, 1]
          }
        }
      }
    }
  }
};
