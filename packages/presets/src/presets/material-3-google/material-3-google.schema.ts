import { breakpoints, color, Schema, type SegmentName } from '@kiskadee/core';
import { segments } from './material-3-google.colors';

/**
 * Segments definition for the Material Design 3 design system.
 * Each segment represents a brand/product identity with support for multiple theme modes.
 *
 * Current implementation includes:
 * - material: Primary segment with light theme (purple brand color HSL 256°)
 *
 * All segments include universal semantic colors:
 * - primary: Brand identity color (varies by segment)
 * - secondary: Supporting brand color
 * - greenLike: Success, purchase, confirmation, profit (always green ~140°)
 * - yellowLike: Attention, warning, caution (always yellow ~45°)
 * - redLike: Danger, error, urgent, notification (always red ~0°)
 * - neutral: Text, backgrounds, borders, dividers (always grayscale)
 *
 * IMPORTANT: the segment key used here ("material") must stay in sync with
 * the key defined in material-3-google.colors.ts. This ensures that:
 * - color() lookups receive a valid segment definition, and
 * - generated palette filenames (<segment>.<theme>.kiskadee.*) match the
 *   manifest consumed by the Next.js showcase registry.
 */

const materialDefault = segments.default;
type Segment = 'default';

export const schema: Schema<Segment> = {
  name: 'Material Design',
  prefix: 'gmd', // Google Material Design
  version: [3, 0, 0],
  author: 'Google',
  breakpoints,
  components: {
    button: {
      elements: {
        e1: {
          decorations: {
            borderStyle: 'none'
          },
          scales: {
            paddingTop: {
              's:sm:1': 8,
              's:md:1': 10,
              's:lg:1': 16,
              's:lg:2': 32,
              's:lg:3': 48
            },
            paddingBottom: {
              's:sm:1': 8,
              's:md:1': 10,
              's:lg:1': 16,
              's:lg:2': 32,
              's:lg:3': 48
            },
            paddingLeft: {
              's:sm:1': 12,
              's:md:1': 16,
              's:lg:1': 24,
              's:lg:2': 48,
              's:lg:3': 64
            },
            paddingRight: {
              's:sm:1': 12,
              's:md:1': 16,
              's:lg:1': 24,
              's:lg:2': 48,
              's:lg:3': 64
            },
            borderRadius: {
              's:sm:1': 18,
              's:md:1': 20,
              's:lg:1': 28,
              's:lg:2': 48,
              's:lg:3': 68
            }
          },
          palettes: {
            default: {
              light: {
                boxColor: {
                  primary: {
                    soft: {
                      rest: color(materialDefault, 'l', 'primary', 50),
                      // hover: [256, 34, 48, 1], // official
                      hover: color(materialDefault, 'l', 'primary', 40),
                      pressed: color(materialDefault, 'l', 'primary', 60),
                      disabled: color(materialDefault, 'l', 'neutral', 10),
                      focus: color(materialDefault, 'l', 'primary', 50),
                      selected: {
                        rest: color(materialDefault, 'l', 'primary', 10),
                        hover: color(materialDefault, 'l', 'primary', 8),
                        pressed: color(materialDefault, 'l', 'primary', 20)
                      }
                    },
                    solid: {
                      rest: color(materialDefault, 'l', 'primary', 50),
                      // hover: [256, 34, 48, 1], // official
                      hover: color(materialDefault, 'l', 'primary', 40),
                      pressed: color(materialDefault, 'l', 'primary', 60),
                      disabled: color(materialDefault, 'l', 'neutral', 10),
                      focus: color(materialDefault, 'l', 'primary', 50),
                      selected: {
                        rest: color(materialDefault, 'l', 'primary', 10),
                        hover: color(materialDefault, 'l', 'primary', 8),
                        pressed: color(materialDefault, 'l', 'primary', 20)
                      }
                    }
                  }
                }
              }
            }
          },
          effects: {
            // Material Design 3 interaction-driven shape. Border radius decreases as interaction intensifies
            // (rest > hover/focus > pressed), emulating MD3 "animated corners". This enables Kiskadee to
            // generate stateful CSS for rounded corners.
            borderRadius: {
              rest: 20,
              // hover: 14,
              // pressed: 16,
              // focus: 14
              selected: {
                rest: 16,
                hover: 14,
                pressed: 12,
                focus: 14
              }
            },
            shadow: {
              // MD3-like elevation: subtle at rest, stronger on hover/pressed, focused similar to hover.
              // x stays 0 to avoid lateral drift; y and blur increase with intensity. Color stays black with varying alphas.
              x: { rest: 0, hover: 0, pressed: 0, focus: 0, disabled: 0 },
              y: { rest: 2, hover: 4, pressed: 0, focus: 4, disabled: 0 },
              blur: { rest: 6, hover: 10, pressed: 0, focus: 10, disabled: 0 },
              // HSLA: [h, s, l, a] → converted to hex with alpha by the builder
              color: {
                rest: [0, 0, 0, 0.28],
                hover: [0, 0, 0, 0.35],
                pressed: [0, 0, 0, 0.32],
                focus: [0, 0, 0, 0.35],
                disabled: [0, 0, 0, 0.0]
              }
            }
          }
        },
        e2: {
          decorations: {
            textWeight: 'medium'
          },
          palettes: {
            default: {
              light: {
                textColor: {
                  primary: {
                    soft: {
                      rest: [0, 0, 100, 1],
                      disabled: {
                        ref: color(materialDefault, 'l', 'neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: color(materialDefault, 'l', 'neutral', 70)
                        }
                      }
                    },
                    solid: {
                      rest: [0, 0, 100, 1],
                      disabled: {
                        ref: color(materialDefault, 'l', 'neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: color(materialDefault, 'l', 'neutral', 70)
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          scales: {
            textSize: {
              's:sm:1': 14,
              's:md:1': 14,
              's:lg:1': 16,
              's:lg:2': 24,
              's:lg:3': 32
            },
            textHeight: {
              // TODO: Bug, tá gerando duplicado, pq a style key tem tamanho
              's:sm:1': 20,
              's:md:1': 20,
              's:lg:1': 24,
              's:lg:2': 32,
              's:lg:3': 40
            }
          }
        }
      }
    }
  }
};
