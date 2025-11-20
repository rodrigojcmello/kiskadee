import { breakpoints, color, type Schema, withAlpha } from '@kiskadee/core';
import { segments } from './fluent-2-microsoft.colors';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const iosDefault = segments.default;

type Segments = 'default';

export const schema: Schema<Segments> = {
  name: 'Fluent',
  prefix: 'f', // Fluent by MicroSoft
  version: [2, 0, 0],
  author: 'Microsoft',
  breakpoints,
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
                    soft: {
                      rest: color(iosDefault, 'l', 'primary', 5),
                      hover: color(iosDefault, 'l', 'primary', 3),
                      focus: color(iosDefault, 'l', 'primary', 5),
                      pressed: color(iosDefault, 'l', 'primary', 8),
                      disabled: color(iosDefault, 'l', 'primary', 5, 20),
                      selected: {
                        rest: color(iosDefault, 'l', 'primary', 10),
                        hover: color(iosDefault, 'l', 'primary', 8),
                        pressed: color(iosDefault, 'l', 'primary', 20)
                      }
                    },
                    solid: {
                      rest: color(iosDefault, 'l', 'primary', 60),
                      hover: color(iosDefault, 'l', 'primary', 70),
                      pressed: color(iosDefault, 'l', 'primary', 80),
                      disabled: color(iosDefault, 'l', 'neutral', 10),
                      focus: color(iosDefault, 'l', 'primary', 70),
                      selected: {
                        rest: color(iosDefault, 'l', 'primary', 10),
                        hover: color(iosDefault, 'l', 'primary', 8),
                        pressed: color(iosDefault, 'l', 'primary', 20)
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
                    soft: {
                      rest: color(iosDefault, 'l', 'primary', 50),
                      hover: { ref: color(iosDefault, 'l', 'primary', 50, 80) },
                      pressed: { ref: color(iosDefault, 'l', 'primary', 50) },
                      disabled: {
                        ref: color(iosDefault, 'l', 'neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: color(iosDefault, 'l', 'neutral', 70)
                        }
                      }
                    },
                    solid: {
                      rest: color(iosDefault, 'l', 'neutral', 0),
                      disabled: {
                        ref: color(iosDefault, 'l', 'neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: color(iosDefault, 'l', 'neutral', 70)
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
