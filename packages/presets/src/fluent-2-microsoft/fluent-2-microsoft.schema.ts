import { breakpoints, color, type Schema, withAlpha } from '@kiskadee/core';
import { segments } from './fluent-2-microsoft.colors';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const ios = segments.ios;

export const schema: Schema = {
  name: 'Fluent',
  prefix: 'fms', // Fluent by MicroSoft
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
              's:md:1': 16
            },
            paddingBottom: {
              's:md:1': 16
            },
            paddingLeft: {
              's:md:1': 20
            },
            paddingRight: {
              's:md:1': 20
            },
            borderRadius: {
              's:md:1': 4
            }
          },
          palettes: {
            ios: {
              light: {
                boxColor: {
                  primary: {
                    soft: {
                      rest: color(ios, 'l', 'primary', 5),
                      hover: color(ios, 'l', 'primary', 3),
                      focus: color(ios, 'l', 'primary', 5),
                      pressed: color(ios, 'l', 'primary', 8),
                      disabled: color(ios, 'l', 'primary', 5, 20),
                      selected: {
                        rest: color(ios, 'l', 'primary', 10),
                        hover: color(ios, 'l', 'primary', 8),
                        pressed: color(ios, 'l', 'primary', 20)
                      }
                    },
                    solid: {
                      rest: color(ios, 'l', 'primary', 50),
                      hover: color(ios, 'l', 'primary', 50, 80),
                      pressed: color(ios, 'l', 'primary', 60),
                      disabled: color(ios, 'l', 'primary', 50, 20),
                      focus: color(ios, 'l', 'primary', 50),
                      selected: {
                        rest: color(ios, 'l', 'primary', 10),
                        hover: color(ios, 'l', 'primary', 8),
                        pressed: color(ios, 'l', 'primary', 20)
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
            ios: {
              light: {
                textColor: {
                  primary: {
                    soft: {
                      rest: color(ios, 'l', 'primary', 50),
                      hover: { ref: color(ios, 'l', 'primary', 50, 80) },
                      pressed: { ref: color(ios, 'l', 'primary', 50) },
                      disabled: {
                        ref: color(ios, 'l', 'neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: color(ios, 'l', 'neutral', 70)
                        }
                      }
                    },
                    solid: {
                      rest: color(ios, 'l', 'neutral', 0),
                      disabled: {
                        ref: color(ios, 'l', 'neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: color(ios, 'l', 'neutral', 70)
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
              's:md:1': 17
            },
            textHeight: {
              's:md:1': 18
            }
          }
        }
      }
    }
  }
};
