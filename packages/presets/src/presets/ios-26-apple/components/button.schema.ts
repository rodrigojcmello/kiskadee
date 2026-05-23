import { type Schema, withAlpha } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios26AppleSegmentName = 'default';
type ButtonComponent = NonNullable<Schema<Ios26AppleSegmentName>['components']['button']>;

type CreateIos26AppleButtonSchemaArgs = {
  c: PresetColorGetter<Ios26AppleSegmentName>;
};

export function createIos26AppleButtonSchema({
  c
}: CreateIos26AppleButtonSchemaArgs): ButtonComponent {
  return {
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
            rounded: {
              's:md:1': 25
            },
            pill: {
              's:md:1': 25
            },
            square: {
              's:md:1': 0
            }
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                primary: {
                  medium: {
                    rest: c('default', 'l', 'button.primary', 5),
                    hover: c('default', 'l', 'button.primary', 3),
                    focus: c('default', 'l', 'button.primary', 5),
                    pressed: c('default', 'l', 'button.primary', 8),
                    disabled: c('default', 'l', 'button.primary', 5, 20),
                    selected: {
                      rest: c('default', 'l', 'button.primary', 10),
                      hover: c('default', 'l', 'button.primary', 8),
                      pressed: c('default', 'l', 'button.primary', 20)
                    }
                  },
                  high: {
                    rest: c('default', 'l', 'button.primary', 50),
                    hover: c('default', 'l', 'button.primary', 50, 80),
                    pressed: c('default', 'l', 'button.primary', 60),
                    disabled: c('default', 'l', 'button.primary', 50, 20),
                    focus: c('default', 'l', 'button.primary', 50),
                    selected: {
                      rest: c('default', 'l', 'button.primary', 10),
                      hover: c('default', 'l', 'button.primary', 8),
                      pressed: c('default', 'l', 'button.primary', 20)
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
                  medium: {
                    rest: c('default', 'l', 'button.primary', 50),
                    hover: {
                      ref: c('default', 'l', 'button.primary', 50, 80)
                    },
                    pressed: { ref: c('default', 'l', 'button.primary', 50) },
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: c('default', 'l', 'button.neutral', 70)
                      }
                    }
                  },
                  high: {
                    rest: c('default', 'l', 'button.neutral', 0),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: c('default', 'l', 'button.neutral', 70)
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
  };
}
