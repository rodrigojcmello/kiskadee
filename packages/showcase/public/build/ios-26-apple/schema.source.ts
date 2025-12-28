import { breakpoints, color, type Schema, withAlpha } from '@kiskadee/core';
import { schemaColors } from './colors.source';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

export type Segment = 'default';

const schemaContext = { colors: schemaColors };

export const schema: Schema<Segment> = {
  name: 'iOS',
  prefix: 'aos', // Apple OS
  version: [26, 0, 0],
  author: 'Apple',
  breakpoints,
  colors: schemaColors,
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
              's:md:1': 25
            }
          },
          palettes: {
            default: {
              light: {
                boxColor: {
                  primary: {
                    subtle: {
                      rest: color(schemaContext, 'default', 'l', 'button.primary', 5),
                      hover: color(schemaContext, 'default', 'l', 'button.primary', 3),
                      focus: color(schemaContext, 'default', 'l', 'button.primary', 5),
                      pressed: color(schemaContext, 'default', 'l', 'button.primary', 8),
                      disabled: color(schemaContext, 'default', 'l', 'button.primary', 5, 20),
                      selected: {
                        rest: color(schemaContext, 'default', 'l', 'button.primary', 10),
                        hover: color(schemaContext, 'default', 'l', 'button.primary', 8),
                        pressed: color(schemaContext, 'default', 'l', 'button.primary', 20)
                      }
                    },
                    vivid: {
                      rest: color(schemaContext, 'default', 'l', 'button.primary', 50),
                      hover: color(schemaContext, 'default', 'l', 'button.primary', 50, 80),
                      pressed: color(schemaContext, 'default', 'l', 'button.primary', 60),
                      disabled: color(schemaContext, 'default', 'l', 'button.primary', 50, 20),
                      focus: color(schemaContext, 'default', 'l', 'button.primary', 50),
                      selected: {
                        rest: color(schemaContext, 'default', 'l', 'button.primary', 10),
                        hover: color(schemaContext, 'default', 'l', 'button.primary', 8),
                        pressed: color(schemaContext, 'default', 'l', 'button.primary', 20)
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
            textWeight: 'medium'
          },
          palettes: {
            default: {
              light: {
                textColor: {
                  primary: {
                    subtle: {
                      rest: color(schemaContext, 'default', 'l', 'button.primary', 50),
                      hover: {
                        ref: color(schemaContext, 'default', 'l', 'button.primary', 50, 80)
                      },
                      pressed: { ref: color(schemaContext, 'default', 'l', 'button.primary', 50) },
                      disabled: {
                        ref: color(schemaContext, 'default', 'l', 'button.neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: color(schemaContext, 'default', 'l', 'button.neutral', 70)
                        }
                      }
                    },
                    vivid: {
                      rest: color(schemaContext, 'default', 'l', 'button.neutral', 0),
                      disabled: {
                        ref: color(schemaContext, 'default', 'l', 'button.neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: color(schemaContext, 'default', 'l', 'button.neutral', 70)
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
