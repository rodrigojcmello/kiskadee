import type { Schema, SolidColor } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type Fluent2MicrosoftSegmentName = 'default';

type CreateFluent2MicrosoftButtonSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  shadowBlack: (alpha: number) => SolidColor;
};

export function createFluent2MicrosoftButtonSchema({
  c,
  shadowBlack
}: CreateFluent2MicrosoftButtonSchemaArgs): ButtonComponent {
  return {
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
            rounded: 4,
            pill: 4,
            square: 0
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                primary: {
                  high: {
                    rest: c('default', 'l', 'button.primary', 50),
                    hover: c('default', 'l', 'button.primary', 55),
                    focus: c('default', 'l', 'button.primary', 50),
                    pressed: c('default', 'l', 'button.primary', 75),
                    disabled: c('default', 'l', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'l', 'button.primary', 60)
                    }
                  }
                }
              }
            },
            dark: {
              boxColor: {
                primary: {
                  high: {
                    rest: c('default', 'd', 'button.primary', 35),
                    hover: c('default', 'd', 'button.primary', 40),
                    focus: c('default', 'd', 'button.primary', 35),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: c('default', 'd', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'd', 'button.primary', 28)
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
              rest: shadowBlack(0.28),
              hover: shadowBlack(0.35),
              pressed: shadowBlack(0.32),
              focus: shadowBlack(0.35),
              disabled: shadowBlack(0)
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
                    rest: c('default', 'l', 'button.neutral', 0),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                primary: {
                  high: {
                    rest: c('default', 'd', 'button.neutral', 100),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
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
  };
}
