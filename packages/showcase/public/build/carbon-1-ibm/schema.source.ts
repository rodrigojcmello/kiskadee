import { breakpoints, color, type Schema, withAlpha } from '@kiskadee/core';
import { segments } from './colors.source';

// Reference: https://www.figma.com/community/file/1157761560874207208 copied to "ds-refs/(v11) Carbon Design System (Community).fig"

const carbonDefault = segments.default;

type Segments = 'default';

export const schema: Schema<Segments> = {
  name: 'Carbon',
  prefix: 'ci', // Carbon by IBM
  version: [1, 0, 0],
  author: 'IBM',
  breakpoints,
  themeTokens: {
    palettes: {
      default: {
        light: {
          focusColor: color(carbonDefault, 'l', 'primary', 50)
        }
      }
    }
  },
  components: {
    button: {
      elements: {
        e1: {
          name: 'button',
          decorations: {
            borderStyle: 'none',
            textAlign: 'left'
          },
          scales: {
            paddingTop: {
              's:sm:2': 4,
              's:sm:1': 8,
              's:md:1': 12,
              's:lg:1': 17,
              's:lg:2': 17,
              's:lg:3': 17
            },
            paddingBottom: {
              's:sm:2': 4,
              's:sm:1': 8,
              's:md:1': 12,
              's:lg:1': 17,
              's:lg:2': 31,
              's:lg:3': 47
            },
            paddingLeft: {
              's:sm:2': 17,
              's:sm:1': 17,
              's:md:1': 17,
              's:lg:1': 17,
              's:lg:2': 17,
              's:lg:3': 17
            },
            paddingRight: {
              's:sm:2': 17,
              's:sm:1': 17,
              's:md:1': 17,
              's:lg:1': 17,
              's:lg:2': 17,
              's:lg:3': 17
            }
          },
          palettes: {
            default: {
              light: {
                boxColor: {
                  primary: {
                    solid: {
                      rest: color(carbonDefault, 'l', 'primary', 50),
                      hover: color(carbonDefault, 'l', 'primary', 45),
                      focus: color(carbonDefault, 'l', 'primary', 50),
                      pressed: color(carbonDefault, 'l', 'primary', 70),
                      disabled: color(carbonDefault, 'l', 'neutral', 20)
                    }
                  }
                }
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
        e2: {
          name: 'button-text',
          decorations: {
            textWeight: 'medium'
          },
          palettes: {
            default: {
              light: {
                textColor: {
                  primary: {
                    solid: {
                      rest: color(carbonDefault, 'l', 'neutral', 0),
                      disabled: {
                        ref: color(carbonDefault, 'l', 'neutral', 45)
                      }
                    }
                  }
                }
              }
            }
          },
          scales: {
            textSize: {
              's:sm:2': 14,
              's:sm:1': 14,
              's:md:1': 14,
              's:lg:1': 14,
              's:lg:2': 14,
              's:lg:3': 14
            },
            textHeight: {
              's:sm:2': 18,
              's:sm:1': 18,
              's:md:1': 18,
              's:lg:1': 18,
              's:lg:2': 18,
              's:lg:3': 18
            }
          }
        }
      }
    }
  }
};
