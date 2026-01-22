import { breakpoints, primitive, type Schema } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment';
import { createPresetColorGetter } from '../../utils/presetColor';
import { schemaColors } from './material-3-google.colors';

/**
 * Segments definition for the Material Design 3 design system.
 * Each segment represents a brand/product identity with support for multiple theme modes.
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
  global: {
    fonts: {
      body: ['Roboto', 'sans-serif']
    },
    focus: {
      width: 2,
      offset: 2
    }
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          background: c('default', 'l', 'primitive.black.v1', 4),
          focusColor: c('default', 'l', 'primitive.purple.v2', 65)
        },
        dark: {
          background: c('default', 'd', 'primitive.black.v1', 85),
          focusColor: c('default', 'l', 'primitive.purple.v1', 60)
        }
      },
      dynamic: {
        light: {
          background: c('dynamic', 'l', 'primitive.black.v1', 4),
          focusColor: c('dynamic', 'l', 'primitive.purple.dynamic', 50)
        },
        dark: {
          background: c('dynamic', 'd', 'primitive.black.v1', 4),
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
          palettes: buildBySegment(segmentNames, (seg) => {
            return {
              light: {
                boxColor: {
                  primary: {
                    subtle: {
                      rest: c(seg, 'l', 'button.primary', 10),
                      hover: c(seg, 'l', 'button.primary', 8),
                      pressed: c(seg, 'l', 'button.primary', 13),
                      focus: c(seg, 'l', 'button.primary', 10),
                      disabled: c(seg, 'l', 'primitive.black.v1', 10),
                      selected: {
                        rest: c(seg, 'l', 'button.primary', 50),
                        hover: c(seg, 'l', 'button.primary', 40),
                        pressed: c(seg, 'l', 'button.primary', 60)
                      }
                    },
                    vivid: {
                      rest: c(seg, 'l', 'button.primary', 60),
                      hover: c(seg, 'l', 'button.primary', 55),
                      pressed: c(seg, 'l', 'button.primary', 65),
                      focus: c(seg, 'l', 'button.primary', 60),
                      disabled: c(seg, 'l', 'primitive.black.v1', 10),
                      selected: {
                        rest: c(seg, 'l', 'button.primary', 10),
                        hover: c(seg, 'l', 'button.primary', 8),
                        pressed: c(seg, 'l', 'button.primary', 20)
                      }
                    }
                  },
                  neutral: {
                    vivid: {
                      rest: c(seg, 'l', 'button.neutral', 60),
                      hover: c(seg, 'l', 'button.neutral', 55),
                      pressed: c(seg, 'l', 'button.neutral', 65),
                      focus: c(seg, 'l', 'button.neutral', 60),
                      disabled: c(seg, 'l', 'primitive.black.v1', 10),
                      selected: {
                        rest: c(seg, 'l', 'button.neutral', 50),
                        hover: c(seg, 'l', 'button.neutral', 40),
                        pressed: c(seg, 'l', 'button.neutral', 60)
                      }
                    }
                  }
                }
              },
              dark: {
                boxColor: {
                  primary: {
                    subtle: {
                      rest: c(seg, 'd', 'button.primary', 50),
                      hover: c(seg, 'd', 'button.primary', 40),
                      pressed: c(seg, 'd', 'button.primary', 60),
                      disabled: c(seg, 'd', 'button.neutral', 10),
                      focus: c(seg, 'd', 'button.primary', 50),
                      selected: {
                        rest: c(seg, 'd', 'button.primary', 10),
                        hover: c(seg, 'd', 'button.primary', 8),
                        pressed: c(seg, 'd', 'button.primary', 20)
                      }
                    },
                    vivid: {
                      rest: c(seg, 'd', 'button.primary', 50),
                      hover: c(seg, 'd', 'button.primary', 40),
                      pressed: c(seg, 'd', 'button.primary', 60),
                      disabled: c(seg, 'd', 'button.neutral', 10),
                      focus: c(seg, 'd', 'button.primary', 50),
                      selected: {
                        rest: c(seg, 'd', 'button.primary', 10),
                        hover: c(seg, 'd', 'button.primary', 8),
                        pressed: c(seg, 'd', 'button.primary', 20)
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
              hover: 14,
              pressed: 10,
              focus: 14,
              selected: {
                rest: 16,
                hover: 14,
                pressed: 10,
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
                          ref: c(segmentName, 'l', 'button.neutral', 0)
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
                  },
                  neutral: {
                    vivid: {
                      rest: c(segmentName, 'l', 'button.neutral', 0),
                      disabled: {
                        ref: c(segmentName, 'l', 'button.neutral', 60)
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
