import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ElegantSegmentName = 'default';
type ButtonComponent = NonNullable<Schema<ElegantSegmentName>['components']['button']>;

type CreateElegantButtonSchemaArgs = {
  c: PresetColorGetter<ElegantSegmentName>;
};

export function createElegantButtonSchema({ c }: CreateElegantButtonSchemaArgs): ButtonComponent {
  return {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            pressed: false,
            pending: false,
            disabled: false
          }
        }
      }
    },
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
              onSubtle: {
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
          }
        }
      },
      e2: {
        name: 'button-text',
        typography: { 's:md:1': 'label-medium' },
        palettes: {
          default: {
            light: {
              onSubtle: {
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
          }
        }
      },
      e3: {
        name: 'button-icon',
        iconSize: {
          's:md:1': 's:md:1'
        }
      }
    }
  };
}
