import { breakpoints, color, type Schema, type SchemaColors, withAlpha } from '@kiskadee/core';
import {
  componentIntents,
  globalSemantics,
  globalSemanticsBySegment,
  primitiveColors
} from './ios-26-kiskadee.colors';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

const segmentNames = ['default', 'dynamic'] as const;
type SegmentName = (typeof segmentNames)[number];

const bindSegments = <R>(fn: (segmentName: SegmentName) => R): Partial<Record<SegmentName, R>> => ({
  default: fn('default'),
  dynamic: fn('dynamic')
});

const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;

const schemaContext = { colors: schemaColors };

const c = (
  segmentName: SegmentName,
  theme: 'l' | 'd',
  role: string,
  tone: number,
  alpha?: number
) => color(schemaContext, segmentName, theme, role as never, tone, alpha);

export const schema: Schema = {
  name: 'iOS',
  prefix: 'ak', // Apple OS by Kiskadee
  version: [26, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  colors: schemaColors,
  themeTokens: {
    palettes: bindSegments((segment) => ({
      light: {
        focusColor: c(segment, 'l', 'button.primary', 70)
      }
    }))
  },
  components: {
    button: {
      elements: {
        e1: {
          name: 'button',
          decorations: {
            borderStyle: 'none'
          },
          scales: {
            paddingTop: {
              's:sm:1': 5,
              's:md:1': {
                'bp:all': 16,
                'bp:lg:1': 8
              },
              's:lg:1': 16
            },
            paddingBottom: {
              's:sm:1': 5,
              's:md:1': {
                'bp:all': 16,
                'bp:lg:1': 8
              },
              's:lg:1': 16
            },
            paddingLeft: {
              's:sm:1': 10,
              's:md:1': {
                'bp:all': 20,
                'bp:lg:1': 12
              },
              's:lg:1': 20
            },
            paddingRight: {
              's:sm:1': 10,
              's:md:1': {
                'bp:all': 20,
                'bp:lg:1': 12
              },
              's:lg:1': 20
            },
            borderRadius: {
              's:sm:1': 14,
              's:md:1': {
                'bp:all': 25,
                'bp:lg:1': 17
              },
              's:lg:1': 25
            }
          },
          palettes: bindSegments((segment) => ({
            light: {
              boxColor: {
                primary: {
                  subtle: {
                    rest: c(segment, 'l', 'button.primary', 5),
                    hover: c(segment, 'l', 'button.primary', 3),
                    focus: c(segment, 'l', 'button.primary', 5),
                    pressed: c(segment, 'l', 'button.primary', 8),
                    disabled: c(segment, 'l', 'button.primary', 5, 20),
                    selected: {
                      rest: c(segment, 'l', 'button.primary', 50),
                      hover: c(segment, 'l', 'button.primary', 50, 80),
                      focus: c(segment, 'l', 'button.primary', 50),
                      pressed: c(segment, 'l', 'button.primary', 60)
                    }
                  },
                  vivid: {
                    rest: c(segment, 'l', 'button.primary', 50),
                    hover: c(segment, 'l', 'button.primary', 50, 80),
                    focus: c(segment, 'l', 'button.primary', 50),
                    pressed: c(segment, 'l', 'button.primary', 60),
                    disabled: c(segment, 'l', 'button.primary', 50, 20)
                  }
                },
                neutral: {
                  subtle: {
                    rest: c(segment, 'l', 'button.neutral', 5),
                    hover: c(segment, 'l', 'button.neutral', 3),
                    focus: c(segment, 'l', 'button.neutral', 5),
                    pressed: c(segment, 'l', 'button.neutral', 8),
                    disabled: c(segment, 'l', 'button.neutral', 5, 20),
                    selected: {
                      rest: c(segment, 'l', 'button.primary', 50),
                      hover: c(segment, 'l', 'button.primary', 50, 80),
                      focus: c(segment, 'l', 'button.primary', 50),
                      pressed: c(segment, 'l', 'button.primary', 60)
                    }
                  }
                },
                redLike: {
                  subtle: {
                    rest: c(segment, 'l', 'button.destructive', 5),
                    hover: c(segment, 'l', 'button.destructive', 3),
                    focus: c(segment, 'l', 'button.destructive', 5),
                    pressed: c(segment, 'l', 'button.destructive', 8),
                    disabled: c(segment, 'l', 'button.destructive', 5, 20),
                    selected: {
                      rest: c(segment, 'l', 'button.destructive', 50),
                      hover: c(segment, 'l', 'button.destructive', 50, 80),
                      pressed: c(segment, 'l', 'button.destructive', 60)
                    }
                  },
                  vivid: {
                    rest: c(segment, 'l', 'button.destructive', 50),
                    hover: c(segment, 'l', 'button.destructive', 50, 80),
                    pressed: c(segment, 'l', 'button.destructive', 60),
                    disabled: c(segment, 'l', 'button.destructive', 50, 20),
                    focus: c(segment, 'l', 'button.destructive', 50)
                  }
                }
              },
              effects: {
                shadow: {
                  x: { rest: 0, hover: 0, pressed: 0, focus: 0, disabled: 0 },
                  y: { rest: 2, hover: 4, pressed: 0, focus: 4, disabled: 0 },
                  blur: { rest: 6, hover: 10, pressed: 0, focus: 10, disabled: 0 },
                  color: {
                    rest: withAlpha([0, 0, 0, 1], 28),
                    hover: withAlpha([0, 0, 0, 1], 35),
                    pressed: withAlpha([0, 0, 0, 1], 32),
                    focus: withAlpha([0, 0, 0, 1], 35),
                    disabled: withAlpha([0, 0, 0, 1], 0)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                redLike: {
                  subtle: {
                    rest: c(segment, 'd', 'button.destructive', 50, 40),
                    hover: c(segment, 'd', 'button.destructive', 3),
                    focus: c(segment, 'd', 'button.destructive', 5),
                    pressed: c(segment, 'd', 'button.destructive', 8),
                    disabled: c(segment, 'd', 'button.destructive', 5, 20),
                    selected: {
                      rest: c(segment, 'd', 'button.destructive', 50),
                      hover: c(segment, 'd', 'button.destructive', 50, 80),
                      pressed: c(segment, 'd', 'button.destructive', 60)
                    }
                  },
                  vivid: {
                    rest: c(segment, 'd', 'button.destructive', 50),
                    hover: c(segment, 'd', 'button.destructive', 50, 80),
                    pressed: c(segment, 'd', 'button.destructive', 60),
                    disabled: c(segment, 'd', 'button.destructive', 50, 20),
                    focus: c(segment, 'd', 'button.destructive', 50)
                  }
                }
              }
            },
            darker: {
              boxColor: {
                redLike: {
                  subtle: {
                    rest: c(segment, 'd', 'button.destructive', 50, 40),
                    hover: c(segment, 'd', 'button.destructive', 3),
                    focus: c(segment, 'd', 'button.destructive', 5),
                    pressed: c(segment, 'd', 'button.destructive', 8),
                    disabled: c(segment, 'd', 'button.destructive', 5, 20),
                    selected: {
                      rest: c(segment, 'd', 'button.destructive', 50),
                      hover: c(segment, 'd', 'button.destructive', 50, 80),
                      pressed: c(segment, 'd', 'button.destructive', 60)
                    }
                  },
                  vivid: {
                    rest: c(segment, 'd', 'button.destructive', 50),
                    hover: c(segment, 'd', 'button.destructive', 50, 80),
                    pressed: c(segment, 'd', 'button.destructive', 60),
                    disabled: c(segment, 'd', 'button.destructive', 50, 20),
                    focus: c(segment, 'd', 'button.destructive', 50)
                  }
                }
              }
            }
          }))
        },
        e2: {
          name: 'button-text',
          decorations: {
            textWeight: 'medium'
          },
          palettes: bindSegments((segment) => ({
            light: {
              textColor: {
                primary: {
                  subtle: {
                    rest: c(segment, 'l', 'button.primary', 50),
                    hover: { ref: c(segment, 'l', 'button.primary', 50, 80) },
                    pressed: { ref: c(segment, 'l', 'button.primary', 50) },
                    disabled: {
                      ref: c(segment, 'l', 'button.neutral', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: c(segment, 'l', 'button.neutral', 0)
                      }
                    }
                  },
                  vivid: {
                    rest: c(segment, 'l', 'button.neutral', 0),
                    pressed: { ref: c(segment, 'l', 'button.neutral', 0, 50) },
                    disabled: {
                      ref: c(segment, 'l', 'button.neutral', 0, 20)
                    }
                  }
                },
                neutral: {
                  subtle: {
                    rest: c(segment, 'l', 'button.neutral', 50),
                    hover: { ref: c(segment, 'l', 'button.neutral', 50, 80) },
                    pressed: { ref: c(segment, 'l', 'button.neutral', 50) },
                    disabled: {
                      ref: c(segment, 'l', 'button.neutral', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: c(segment, 'l', 'button.neutral', 0)
                      }
                    }
                  }
                },
                redLike: {
                  subtle: {
                    rest: c(segment, 'l', 'button.destructive', 50),
                    hover: { ref: c(segment, 'l', 'button.destructive', 50, 80) },
                    pressed: { ref: c(segment, 'l', 'button.destructive', 50, 70) },
                    disabled: {
                      ref: c(segment, 'l', 'button.destructive', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: c(segment, 'l', 'button.destructive', 0)
                      }
                    }
                  },
                  vivid: {
                    rest: c(segment, 'l', 'button.neutral', 0),
                    pressed: { ref: c(segment, 'l', 'button.neutral', 0, 70) },
                    disabled: {
                      ref: c(segment, 'l', 'button.neutral', 0, 20)
                    }
                  }
                }
              }
            }
          })),
          scales: {
            textSize: {
              's:sm:1': 15,
              's:md:1': 17,
              's:lg:1': 17
            },
            textHeight: {
              's:sm:1': 18,
              's:md:1': 18,
              's:lg:1': 18
            }
          }
        }
      }
    }
  }
};
