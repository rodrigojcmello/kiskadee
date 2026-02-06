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
const transparent = [0, 0, 0, 0] as const;

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
    // verified: 2026-02-02 | Figma v1.23
    focus: {
      width: 3, // =
      offset: 2 // =
    },
    radius: 'pill'
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          // background: c('default', 'l', 'primitive.black.v1', 4),
          // verified: 2026-02-02 | Figma v1.23
          focusColor: c('default', 'l', 'primary.v2', 60) // =
        }
        // dark: {
        //   background: c('default', 'd', 'primitive.black.v1', 85),
        //   focusColor: c('default', 'l', 'primitive.cyan.v1', 60)
        // }
      }
      // dynamic: {
      //   light: {
      //     background: c('dynamic', 'l', 'primitive.black.v1', 4),
      //     focusColor: c('dynamic', 'l', 'primitive.blue.v1', 50)
      //   },
      //   dark: {
      //     background: c('dynamic', 'd', 'primitive.black.v1', 4),
      //     focusColor: c('dynamic', 'd', 'primitive.blue.v1', 50)
      //   }
      // }
    }
  },
  components: {
    button: {
      elements: {
        e1: {
          decorations: {
            borderStyle: 'solid'
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
            borderWidth: {
              's:sm:1': 1,
              's:md:1': 1,
              's:lg:1': 1,
              's:lg:2': 1,
              's:lg:3': 1
            },
            borderRadius: {
              rounded: {
                's:sm:1': 18,
                's:md:1': 20,
                's:lg:1': 28,
                's:lg:2': 48,
                's:lg:3': 68
              },
              pill: {
                's:sm:1': 18,
                's:md:1': 20,
                's:lg:1': 28,
                's:lg:2': 48,
                's:lg:3': 68
              },
              square: {
                's:sm:1': 0,
                's:md:1': 0,
                's:lg:1': 0,
                's:lg:2': 0,
                's:lg:3': 0
              }
            }
          },
          palettes: buildBySegment(segmentNames, (s) => {
            return {
              light: {
                boxColor: {
                  primary: {
                    // It matches Material "filled button"
                    // verified: 2026-01-31 | Figma v1.23
                    high: {
                      rest: c(s, 'l', 'button.primary', 60), // match
                      focus: c(s, 'l', 'button.primary', 60),
                      hover: c(s, 'l', 'button.primary', 55),
                      pressed: c(s, 'l', 'button.primary', 70),
                      disabled: c(s, 'l', 'button.neutral', 90, 10) // match
                    },
                    // It matches Material "toggle button (normal* / elevated*)"
                    // verified: 2026-01-31 | Figma v1.23
                    medium: {
                      rest: c(s, 'l', 'button.neutral', 4), // match
                      focus: c(s, 'l', 'button.neutral', 4),
                      hover: c(s, 'l', 'button.neutral', 6),
                      pressed: c(s, 'l', 'button.neutral', 8),
                      disabled: c(s, 'l', 'button.neutral', 90, 10), // match
                      selected: {
                        rest: c(s, 'l', 'button.primary', 60), // match
                        hover: c(s, 'l', 'button.primary', 55),
                        pressed: c(s, 'l', 'button.primary', 70)
                      }
                    },
                    // It matches Material "outlined button (primary*)"
                    // verified: 2026-02-01 | Figma v1.23
                    low: {
                      rest: transparent, // match
                      focus: transparent,
                      hover: c(s, 'l', 'button.neutral', 2),
                      pressed: c(s, 'l', 'button.neutral', 5),
                      disabled: c(s, 'l', 'button.neutral', 90, 10), // match
                      selected: {
                        rest: c(s, 'l', 'button.neutral', 80), // match
                        hover: c(s, 'l', 'button.neutral', 75),
                        pressed: c(s, 'l', 'button.neutral', 90)
                      }
                    },
                    // It matches Material "button text"
                    // verified: 2026-02-02 | Figma v1.23
                    lowest: {
                      rest: transparent, // =
                      focus: c(s, 'l', 'button.primary', 60, 8), // =
                      hover: c(s, 'l', 'button.primary', 60, 8),
                      pressed: c(s, 'l', 'button.primary', 60, 16),
                      disabled: c(s, 'l', 'button.neutral', 90, 10) // =
                    }
                  },
                  neutral: {
                    high: {
                      rest: c(s, 'l', 'primary.v2', 60),
                      focus: c(s, 'l', 'primary.v2', 60),
                      hover: c(s, 'l', 'primary.v2', 55),
                      pressed: c(s, 'l', 'primary.v2', 70),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12),
                      selected: {
                        rest: c(s, 'l', 'primary.v2', 50),
                        hover: c(s, 'l', 'primary.v2', 40),
                        pressed: c(s, 'l', 'primary.v2', 60)
                      }
                    },
                    medium: {
                      rest: c(s, 'l', 'neutral', 10),
                      focus: c(s, 'l', 'neutral', 10),
                      hover: c(s, 'l', 'neutral', 8),
                      pressed: c(s, 'l', 'neutral', 15),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12),
                      selected: {
                        rest: c(s, 'l', 'neutral', 60),
                        hover: c(s, 'l', 'neutral', 55),
                        pressed: c(s, 'l', 'neutral', 65)
                      }
                    },
                    low: {
                      rest: transparent,
                      focus: c(s, 'l', 'neutral', 3),
                      hover: c(s, 'l', 'neutral', 3),
                      pressed: c(s, 'l', 'neutral', 5),
                      disabled: transparent,
                      selected: {
                        rest: c(s, 'l', 'neutral', 60),
                        hover: c(s, 'l', 'neutral', 55),
                        pressed: c(s, 'l', 'neutral', 65)
                      }
                    },
                    lowest: {
                      rest: transparent,
                      focus: c(s, 'l', 'neutral', 3),
                      hover: c(s, 'l', 'neutral', 3),
                      pressed: c(s, 'l', 'neutral', 5),
                      disabled: transparent
                    }
                  }
                },
                borderColor: {
                  primary: {
                    // It matches Material "filled button"
                    // verified: 2026-02-01 | Figma v1.23
                    high: {
                      rest: transparent, // match
                      focus: transparent, // match
                      hover: transparent, // match
                      pressed: transparent, // match
                      disabled: transparent // match
                    },
                    // It matches Material "toggle button (normal* / elevated*)"
                    // verified: 2026-02-01 | Figma v1.23
                    medium: {
                      rest: transparent, // match
                      focus: transparent, // match
                      hover: transparent, // match
                      pressed: transparent, // match
                      disabled: transparent // match
                    },
                    // It matches Material "outlined button (primary*)"
                    // verified: 2026-02-01 | Figma v1.23
                    low: {
                      rest: c(s, 'l', 'button.neutral.v2', 20), // match
                      focus: c(s, 'l', 'button.neutral.v2', 20),
                      hover: c(s, 'l', 'button.neutral.v2', 20),
                      pressed: c(s, 'l', 'button.neutral.v2', 20),
                      disabled: c(s, 'l', 'button.neutral.v2', 20), // match
                      selected: {
                        rest: transparent // match
                      }
                    },
                    // It matches Material "button text"
                    // verified: 2026-02-02 | Figma v1.23
                    lowest: {
                      rest: transparent // =
                    }
                  },
                  neutral: {
                    high: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    medium: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    low: {
                      rest: c(s, 'l', 'neutral', 15),
                      focus: c(s, 'l', 'neutral', 15),
                      hover: c(s, 'l', 'neutral', 10),
                      pressed: c(s, 'l', 'neutral', 20),
                      disabled: c(s, 'l', 'neutral', 15)
                    },
                    lowest: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    }
                  }
                }
              },
              dark: {
                boxColor: {
                  primary: {
                    medium: {
                      rest: c(s, 'd', 'button.primary', 10),
                      hover: c(s, 'd', 'button.primary', 8),
                      pressed: c(s, 'd', 'button.primary', 13),
                      focus: c(s, 'd', 'button.primary', 10),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12),
                      selected: {
                        rest: c(s, 'd', 'button.primary', 50),
                        hover: c(s, 'd', 'button.primary', 40),
                        pressed: c(s, 'd', 'button.primary', 60)
                      }
                    },
                    high: {
                      rest: c(s, 'd', 'button.primary', 30),
                      hover: c(s, 'd', 'button.primary', 35),
                      pressed: c(s, 'd', 'button.primary', 25),
                      focus: c(s, 'd', 'button.primary', 30),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12)
                    },
                    low: {
                      rest: transparent,
                      focus: c(s, 'd', 'button.primary', 10),
                      hover: c(s, 'd', 'button.primary', 8),
                      pressed: c(s, 'd', 'button.primary', 13),
                      disabled: transparent,
                      selected: {
                        rest: c(s, 'd', 'button.primary', 50),
                        hover: c(s, 'd', 'button.primary', 40),
                        pressed: c(s, 'd', 'button.primary', 60)
                      }
                    },
                    lowest: {
                      rest: transparent,
                      focus: c(s, 'd', 'button.primary', 10),
                      hover: c(s, 'd', 'button.primary', 8),
                      pressed: c(s, 'd', 'button.primary', 13),
                      disabled: transparent
                    }
                  }
                },
                borderColor: {
                  primary: {
                    high: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    medium: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    low: {
                      rest: c(s, 'd', 'button.primary', 30),
                      focus: c(s, 'd', 'button.primary', 30),
                      hover: c(s, 'd', 'button.primary', 35),
                      pressed: c(s, 'd', 'button.primary', 25),
                      disabled: transparent
                    },
                    lowest: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
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
              rounded: {
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
              pill: {
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
              square: {
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
              }
            },
            shadow: {
              // MD3-like elevation: medium at rest, stronger on hover/pressed, focused similar to hover.
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
          palettes: buildBySegment(segmentNames, (s) => {
            return {
              light: {
                textColor: {
                  primary: {
                    // It matches Material "filled button"
                    // verified: 2026-01-31 | Figma v1.23
                    high: {
                      rest: c(s, 'l', 'button.neutral', 0), // match
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // match
                      }
                    },
                    // It matches Material "toggle button (normal* / elevated*)"
                    // verified: 2026-01-31 | Figma v1.23
                    medium: {
                      rest: c(s, 'l', 'button.primary', 60), // match
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // match
                      },
                      selected: {
                        rest: {
                          ref: c(s, 'l', 'button.neutral', 0) // match
                        }
                      }
                    },
                    // It matches Material "outline button (primary*)"
                    // verified: 2026-02-01 | Figma v1.23
                    low: {
                      rest: c(s, 'l', 'button.primary', 60),
                      hover: c(s, 'l', 'button.primary', 55),
                      pressed: c(s, 'l', 'button.primary', 70),
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // match
                      },
                      selected: {
                        rest: {
                          ref: c(s, 'l', 'button.neutral', 0) // match
                        }
                      }
                    },
                    // It matches Material "button text"
                    // verified: 2026-02-02 | Figma v1.23
                    lowest: {
                      rest: c(s, 'l', 'button.primary', 60), // =
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // =
                      }
                    }
                  },
                  neutral: {
                    high: {
                      rest: c(s, 'l', 'button.neutral', 0),
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38)
                      }
                    }
                  }
                }
              },
              dark: {
                textColor: {
                  primary: {
                    medium: {
                      rest: c(s, 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
                      }
                    },
                    high: {
                      rest: c(s, 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
                      }
                    },
                    low: {
                      rest: c(s, 'd', 'button.primary', 30),
                      hover: c(s, 'd', 'button.primary', 35),
                      pressed: c(s, 'd', 'button.primary', 25),
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
                      }
                    },
                    lowest: {
                      rest: c(s, 'd', 'button.primary', 30),
                      hover: c(s, 'd', 'button.primary', 35),
                      pressed: c(s, 'd', 'button.primary', 25),
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
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
