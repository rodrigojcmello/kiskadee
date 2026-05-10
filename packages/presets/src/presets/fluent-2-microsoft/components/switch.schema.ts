import { type Schema, withAlpha } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Fluent2MicrosoftSegmentName = 'default';

type CreateFluent2MicrosoftSwitchSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
};

export function createFluent2MicrosoftSwitchSchema({
  c
}: CreateFluent2MicrosoftSwitchSchemaArgs): SwitchComponent {
  const white = c('default', 'l', 'switch.neutral', 0);
  const transparent = withAlpha(c('default', 'l', 'switch.neutral', 100), 0);
  const neutral6 = c('default', 'l', 'switch.neutral', 6);
  const neutral25 = c('default', 'l', 'switch.neutral', 25);
  const neutral70 = c('default', 'l', 'switch.neutral', 70);
  const primary60 = c('default', 'l', 'primary', 60);
  const primary70 = c('default', 'l', 'primary', 70);
  const primary80 = c('default', 'l', 'primary', 80);

  if (transparent === undefined) {
    throw new Error('Expected Fluent switch.neutral tone 100 before applying transparent alpha.');
  }

  return {
    options: {
      variant: 'standard',
      radius: 'pill'
    },
    variants: {
      standard: {
        options: {
          mode: 'base'
        },
        modes: {
          base: {
            elements: {
              e2: {
                name: 'track',
                decorations: {
                  borderStyle: 'solid'
                },
                scales: {
                  boxWidth: { 's:md:1': 40 },
                  boxHeight: { 's:md:1': 20 },
                  borderWidth: { 's:md:1': 1 },
                  borderRadius: {
                    rounded: { 's:md:1': 10 },
                    pill: { 's:md:1': 10 },
                    square: { 's:md:1': 0 }
                  },
                  paddingTop: { 's:md:1': 1 },
                  paddingRight: { 's:md:1': 3 },
                  paddingBottom: { 's:md:1': 1 },
                  paddingLeft: { 's:md:1': 3 }
                },
                palettes: {
                  default: {
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: white,
                            hover: { ref: white },
                            focus: { ref: white },
                            pressed: { ref: white },
                            selected: {
                              rest: { ref: primary60 },
                              hover: { ref: primary70 },
                              focus: { ref: primary60 },
                              pressed: { ref: primary80 }
                            },
                            disabled: { ref: neutral6 }
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: '#616161',
                            hover: { ref: '#575757' },
                            focus: { ref: '#616161' },
                            pressed: { ref: neutral70 },
                            selected: {
                              rest: { ref: transparent },
                              hover: { ref: transparent },
                              focus: { ref: transparent },
                              pressed: { ref: transparent }
                            },
                            disabled: { ref: '#D1D1D1' }
                          }
                        }
                      }
                    }
                  }
                }
              },
              e3: {
                name: 'thumb',
                scales: {
                  boxWidth: { 's:md:1': 14 },
                  boxHeight: { 's:md:1': 14 },
                  borderRadius: {
                    rounded: { 's:md:1': 4 },
                    pill: { 's:md:1': 7 },
                    square: { 's:md:1': 0 }
                  }
                },
                palettes: {
                  default: {
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: '#616161',
                            hover: { ref: '#424242' },
                            focus: { ref: '#616161' },
                            pressed: { ref: '#424242' },
                            selected: {
                              rest: { ref: white },
                              hover: { ref: white },
                              focus: { ref: white },
                              pressed: { ref: white }
                            },
                            disabled: { ref: neutral25 }
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: transparent,
                            selected: {
                              rest: { ref: transparent }
                            },
                            disabled: { ref: transparent }
                          }
                        }
                      }
                    }
                  }
                }
              },
              e4: {
                name: 'label',
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: { 's:md:1': 14 },
                  textHeight: { 's:md:1': 20 },
                  marginLeft: { 's:md:1': 8 },
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: {
                    light: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: '#242424',
                            disabled: { ref: neutral25 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}
