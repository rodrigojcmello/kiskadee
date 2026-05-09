import { breakpoints, color, primitive, type Schema, withAlpha } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createFluent2MicrosoftSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './fluent-2-microsoft.colors.ts';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;
const c = createPresetColorGetter<'default'>(schemaContext);
const transparent = [0, 0, 0, 0] as const;
const white = [0, 0, 100, 1] as const;

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = never;

export const schema: Schema<Segments> = {
  name: 'Fluent',
  prefix: 'fm', // Fluent by MicroSoft
  version: [2, 0, 0],
  author: 'Microsoft',
  breakpoints,
  colors: schemaColors,
  global: {
    radius: 'rounded'
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          focusColor: color(schemaContext, 'default', 'l', primitive('black', 'v1'), 100)
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
              rounded: {
                's:sm:1': 4,
                's:md:1': 4,
                's:lg:1': 4
              },
              pill: {
                's:sm:1': 4,
                's:md:1': 4,
                's:lg:1': 4
              },
              square: {
                's:sm:1': 0,
                's:md:1': 0,
                's:lg:1': 0
              }
            }
          },
          palettes: {
            default: {
              light: {
                boxColor: {
                  primary: {
                    high: {
                      rest: color(schemaContext, 'default', 'l', 'button.primary', 60),
                      hover: color(schemaContext, 'default', 'l', 'button.primary', 70),
                      focus: color(schemaContext, 'default', 'l', 'button.primary', 60),
                      pressed: color(schemaContext, 'default', 'l', 'button.primary', 90),
                      disabled: color(schemaContext, 'default', 'l', 'button.neutral', 6),
                      selected: {
                        rest: color(schemaContext, 'default', 'l', 'button.primary', 80),
                        hover: color(schemaContext, 'default', 'l', 'button.primary', 70),
                        pressed: color(schemaContext, 'default', 'l', 'button.primary', 90)
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
                    high: {
                      rest: color(schemaContext, 'default', 'l', 'button.neutral', 0),
                      disabled: {
                        ref: color(schemaContext, 'default', 'l', 'button.neutral', 25)
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
    },
    switch: createFluent2MicrosoftSwitchSchema({
      c,
      transparent,
      white
    })
  }
};
