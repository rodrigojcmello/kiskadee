import { breakpoints, color, type Schema, withAlpha } from '@kiskadee/core';
import { segments } from './fluent-2-kiskadee.colors';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const fluentDefault = segments.default;

type Segments = 'default';

export const schema: Schema<Segments> = {
  name: 'Fluent',
  prefix: 'fk', // Fluent by Kiskadee
  version: [2, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  themeTokens: {
    palettes: {
      default: {
        light: {
          focusColor: color(fluentDefault, 'l', 'neutral', 100)
        },
        dark: {
          focusColor: color(fluentDefault, 'd', 'neutral', 100)
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
            borderStyle: 'none'
          },
          scales: {
            paddingTop: {
              's:sm:1': 2,
              's:md:1': 6,
              's:lg:1': 8
            },
            paddingBottom: {
              's:sm:1': 2,
              's:md:1': 6,
              's:lg:1': 8
            },
            paddingLeft: {
              's:sm:1': 8,
              's:md:1': 12,
              's:lg:1': 16
            },
            paddingRight: {
              's:sm:1': 8,
              's:md:1': 12,
              's:lg:1': 16
            },
            borderRadius: {
              's:sm:1': 4,
              's:md:1': 4,
              's:lg:1': 4
            }
          },
          palettes: {
            default: {
              light: {
                boxColor: {
                  primary: {
                    solid: {
                      rest: color(fluentDefault, 'l', 'primary', 60),
                      hover: color(fluentDefault, 'l', 'primary', 70),
                      focus: color(fluentDefault, 'l', 'primary', 60),
                      pressed: color(fluentDefault, 'l', 'primary', 90),
                      disabled: color(fluentDefault, 'l', 'neutral', 6),
                      selected: {
                        rest: color(fluentDefault, 'l', 'primary', 80),
                        hover: color(fluentDefault, 'l', 'primary', 70),
                        pressed: color(fluentDefault, 'l', 'primary', 90)
                      }
                    }
                  }
                }
              },
              dark: {
                boxColor: {
                  primary: {
                    solid: {
                      rest: color(fluentDefault, 'l', 'primary', 70),
                      hover: color(fluentDefault, 'l', 'primary', 60),
                      focus: color(fluentDefault, 'l', 'primary', 70),
                      pressed: color(fluentDefault, 'l', 'primary', 90),
                      // disabled: color(fluentDefault, 'd', 'neutral', 8),
                      disabled: color(fluentDefault, 'd', 'neutral', 10, 40),
                      selected: {
                        rest: color(fluentDefault, 'l', 'primary', 80),
                        hover: color(fluentDefault, 'l', 'primary', 70),
                        pressed: color(fluentDefault, 'l', 'primary', 90)
                      }
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
            textFont: ['Roboto', 'sans-serif'],
            textWeight: 'medium'
          },
          palettes: {
            default: {
              light: {
                textColor: {
                  primary: {
                    solid: {
                      rest: color(fluentDefault, 'l', 'neutral', 0),
                      disabled: {
                        ref: color(fluentDefault, 'l', 'neutral', 25)
                      }
                    }
                  }
                }
              },
              dark: {
                textColor: {
                  primary: {
                    solid: {
                      rest: color(fluentDefault, 'd', 'neutral', 100),
                      disabled: {
                        ref: color(fluentDefault, 'd', 'neutral', 100, 14)
                      }
                    }
                  }
                }
              }
            }
          },
          scales: {
            textSize: {
              's:sm:1': 12,
              's:md:1': 14,
              's:lg:1': 16
            },
            textHeight: {
              's:sm:1': 16,
              's:md:1': 20,
              's:lg:1': 22
            }
          }
        }
      }
    }
  }
};
