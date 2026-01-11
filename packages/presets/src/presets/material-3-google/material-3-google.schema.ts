import { breakpoints, primitive, type Schema } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment';
import { createPresetColorGetter } from '../../utils/presetColor';
import { schemaColors } from './material-3-google.colors';

/**
 * Segments definition for the Material Design 3 design system.
 * Each segment represents a brand/product identity with support for multiple theme modes.
 *
 * Current implementation includes:
 * - default: Primary segment (purple brand color HSL 256°)
 *
 * All segments include universal semantic colors:
 * - primary: Brand identity color (varies by segment)
 * - secondary: Supporting brand color
 * - greenLike: Success, purchase, confirmation, profit (always green ~140°)
 * - yellowLike: Attention, warning, caution (always yellow ~45°)
 * - redLike: Danger, error, urgent, notification (always red ~0°)
 * - neutral: Text, backgrounds, borders, dividers (always grayscale)
 *
 * NOTE:
 * - This preset registers `default` and `dynamic` segments.
 * - Palette files are emitted as `<segment>.<theme>.kiskadee.(css|json)`.
 */

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;

const segmentNames = ['default', 'dynamic'] as const;
type SegmentName = (typeof segmentNames)[number];

const c = createPresetColorGetter<SegmentName>(schemaContext);

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = never;

export const schema: Schema<Segments> = {
  name: 'Material Design',
  prefix: 'gmd', // Google Material Design
  version: [3, 0, 0],
  author: 'Google',
  breakpoints,
  colors: schemaColors,
  fonts: {
    body: ['Roboto', 'sans-serif']
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          // Global theme tokens can reference primitive colors directly.
          background: c('default', 'l', primitive('black', 'v1'), 4)
        },
        dark: {
          background: c('default', 'd', primitive('black', 'v1'), 4)
        }
      },
      dynamic: {
        light: {
          background: c('dynamic', 'l', primitive('black', 'v1'), 4),
          focusColor: c('dynamic', 'l', 'primitive.purple.dynamic', 50)
        },
        dark: {
          background: c('dynamic', 'd', primitive('black', 'v1'), 4),
          focusColor: c('dynamic', 'd', 'primitive.purple.dynamic', 50)
        }
      }
    }
  },
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
          palettes: buildBySegment(segmentNames, (segmentName) => {
            return {
              light: {
                boxColor: {
                  primary: {
                    subtle: {
                      rest: c(segmentName, 'l', 'button.primary', 10),
                      hover: c(segmentName, 'l', 'button.primary', 40),
                      pressed: c(segmentName, 'l', 'button.primary', 60),
                      disabled: c(segmentName, 'l', 'button.neutral', 10),
                      focus: c(segmentName, 'l', 'button.primary', 50),
                      selected: {
                        rest: c(segmentName, 'l', 'button.primary', 10),
                        hover: c(segmentName, 'l', 'button.primary', 8),
                        pressed: c(segmentName, 'l', 'button.primary', 20)
                      }
                    },
                    vivid: {
                      rest: c(segmentName, 'l', 'button.primary', 50),
                      // hover: [256, 34, 48, 1], // official
                      hover: c(segmentName, 'l', 'button.primary', 40),
                      pressed: c(segmentName, 'l', 'button.primary', 60),
                      disabled: c(segmentName, 'l', 'button.neutral', 10),
                      focus: c(segmentName, 'l', 'button.primary', 50),
                      selected: {
                        rest: c(segmentName, 'l', 'button.primary', 10),
                        hover: c(segmentName, 'l', 'button.primary', 8),
                        pressed: c(segmentName, 'l', 'button.primary', 20)
                      }
                    }
                  }
                }
              },
              dark: {
                boxColor: {
                  primary: {
                    subtle: {
                      rest: c(segmentName, 'd', 'button.primary', 50),
                      hover: c(segmentName, 'd', 'button.primary', 40),
                      pressed: c(segmentName, 'd', 'button.primary', 60),
                      disabled: c(segmentName, 'd', 'button.neutral', 10),
                      focus: c(segmentName, 'd', 'button.primary', 50),
                      selected: {
                        rest: c(segmentName, 'd', 'button.primary', 10),
                        hover: c(segmentName, 'd', 'button.primary', 8),
                        pressed: c(segmentName, 'd', 'button.primary', 20)
                      }
                    },
                    vivid: {
                      rest: c(segmentName, 'd', 'button.primary', 50),
                      hover: c(segmentName, 'd', 'button.primary', 40),
                      pressed: c(segmentName, 'd', 'button.primary', 60),
                      disabled: c(segmentName, 'd', 'button.neutral', 10),
                      focus: c(segmentName, 'd', 'button.primary', 50),
                      selected: {
                        rest: c(segmentName, 'd', 'button.primary', 10),
                        hover: c(segmentName, 'd', 'button.primary', 8),
                        pressed: c(segmentName, 'd', 'button.primary', 20)
                      }
                    }
                  }
                }
              }
            };
          }),
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
          palettes: buildBySegment(segmentNames, (segmentName) => {
            return {
              light: {
                textColor: {
                  primary: {
                    subtle: {
                      rest: c(segmentName, 'l', 'button.neutral', 70),
                      disabled: {
                        ref: c(segmentName, 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c(segmentName, 'l', 'button.neutral', 70)
                        }
                      }
                    },
                    vivid: {
                      rest: c(segmentName, 'l', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c(segmentName, 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c(segmentName, 'l', 'button.neutral', 70)
                        }
                      }
                    }
                  }
                }
              },
              dark: {
                textColor: {
                  primary: {
                    subtle: {
                      rest: c(segmentName, 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c(segmentName, 'd', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c(segmentName, 'd', 'button.neutral', 70)
                        }
                      }
                    },
                    vivid: {
                      rest: c(segmentName, 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c(segmentName, 'd', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c(segmentName, 'd', 'button.neutral', 70)
                        }
                      }
                    }
                  }
                }
              }
            };
          }),
          scales: {
            textSize: {
              's:sm:1': 14,
              's:md:1': 14,
              's:lg:1': 16,
              's:lg:2': 24,
              's:lg:3': 32
            },
            textHeight: {
              // TODO: Investigate why this key is being emitted twice (likely due to size-based style keys).
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
