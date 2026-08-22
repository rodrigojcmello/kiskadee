import { breakpoints, color, type Schema, withAlpha } from '@kiskadee/core';
import { schemaColors } from './carbon-ibm.colors.ts';
import { carbonIbmTypography } from './carbon-ibm.typography.ts';
import { createCarbonIbmCardSchema } from './components/card.schema.ts';
import { createCarbonIbmSwitchSchema } from './components/switch.schema.ts';

// Reference: IBM Carbon Design System Community
// https://www.figma.com/design/52HHpBaYAUdDKqAdH5vw8Y/IBM-Carbon-Design-System--Community-

const schemaContext = { colors: schemaColors };

type Segments = 'default';

export const schema: Schema<Segments> = {
  name: 'Carbon',
  prefix: 'ci', // Carbon by IBM
  version: [1, 0, 0],
  author: 'IBM',
  breakpoints,
  colors: schemaColors,
  global: {
    typography: carbonIbmTypography,
    iconSizes: {
      's:sm:5': 6,
      's:sm:4': 14,
      's:sm:2': 12,
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24,
      's:lg:2': 28,
      's:lg:3': 32
    },
    icons: {
      family: 'carbon',
      variant: 'regular'
    },
    fonts: {
      families: {
        'ibm-plex-sans': {
          stack: ['IBM Plex Sans', 'sans-serif']
        }
      },
      roles: {
        body: 'ibm-plex-sans'
      }
    },
    focus: {
      width: 2,
      offset: 1
    },
    effects: {
      activationFeedback: {
        profile: 'ripple',
        origin: 'pointer',
        visual: {
          layer: 'overlay',
          paint: 'field',
          tone: {
            default: 'subtle'
          }
        },
        profiles: {
          halo: {
            animateSize: false,
            size: 80,
            durationToken: 'interaction.instant',
            fade: {
              delayToken: 'interaction.hold.short',
              durationToken: 'interaction.fade.long',
              curveToken: 'motion.standard.out'
            }
          }
        }
      }
    },
    radius: 'square'
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          // Global theme tokens can reference primitive colors directly.
          background: color(schemaContext, 'default', 'l', 'primitive.black.v1', 4),
          focusColor: '#0f62fe',
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: '#161616',
                  opacity: 0.12
                },
                vivid: {
                  color: '#ffffff',
                  opacity: 0.2
                }
              }
            }
          }
        },
        dark: {
          background: '#161616',
          focusColor: '#0f62fe',
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: '#f4f4f4',
                  opacity: 0.16
                },
                vivid: {
                  color: '#ffffff',
                  opacity: 0.2
                }
              }
            }
          }
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
                onSubtle: {
                  boxColor: {
                    primary: {
                      high: {
                        rest: color(schemaContext, 'default', 'l', 'button.primary', 50),
                        hover: color(schemaContext, 'default', 'l', 'button.primary', 45),
                        focus: color(schemaContext, 'default', 'l', 'button.primary', 50),
                        pressed: color(schemaContext, 'default', 'l', 'button.primary', 70),
                        disabled: color(schemaContext, 'default', 'l', 'button.neutral', 20)
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
                rest: withAlpha('#000000', 28),
                hover: withAlpha('#000000', 35),
                pressed: withAlpha('#000000', 32),
                focus: withAlpha('#000000', 35),
                disabled: withAlpha('#000000', 0)
              }
            }
          }
        },
        e2: {
          name: 'button-text',
          typography: { 's:all': 'body-medium-strong' },
          palettes: {
            default: {
              light: {
                onSubtle: {
                  textColor: {
                    primary: {
                      high: {
                        rest: color(schemaContext, 'default', 'l', 'button.neutral', 0),
                        disabled: {
                          ref: color(schemaContext, 'default', 'l', 'button.neutral', 45)
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        e3: {
          name: 'button-icon',
          iconSize: {
            's:sm:2': 's:sm:2',
            's:sm:1': 's:sm:1',
            's:md:1': 's:md:1',
            's:lg:1': 's:lg:1',
            's:lg:2': 's:lg:2',
            's:lg:3': 's:lg:3'
          }
        }
      }
    },
    card: createCarbonIbmCardSchema({
      segmentNames: ['default'],
      transparent: '#00000000'
    }),
    switch: createCarbonIbmSwitchSchema()
  }
};
