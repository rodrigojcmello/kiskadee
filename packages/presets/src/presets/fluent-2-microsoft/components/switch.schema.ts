import type { Color, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Fluent2MicrosoftSegmentName = 'default';

type CreateFluent2MicrosoftSwitchSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  transparent: readonly [number, number, number, number];
  white: readonly [number, number, number, number];
};

function switchStateRef(color: Color): { ref: Color } {
  return { ref: color };
}

export function createFluent2MicrosoftSwitchSchema({
  c,
  transparent,
  white
}: CreateFluent2MicrosoftSwitchSchemaArgs): SwitchComponent {
  const neutralBackgroundDisabled = c('default', 'l', 'neutral.v1', 6);
  const neutralForegroundDisabled = c('default', 'l', 'neutral.v1', 25);
  const neutralStrokeAccessiblePressed = c('default', 'l', 'neutral.v1', 70);
  const brandBackground = c('default', 'l', 'switch.neutral', 60);
  const brandBackgroundHover = c('default', 'l', 'switch.neutral', 70);
  const brandBackgroundPressed = c('default', 'l', 'switch.neutral', 80);

  return {
    options: {
      variant: 'standard'
    },
    variants: {
      standard: {
        options: {
          mode: 'base'
        },
        modes: {
          base: {
            elements: {
              e3: {
                decorations: {
                  borderStyle: 'solid'
                },
                scales: {
                  boxWidth: {
                    's:sm:1': 32,
                    's:md:1': 40
                  },
                  boxHeight: {
                    's:sm:1': 16,
                    's:md:1': 20
                  },
                  borderWidth: {
                    's:sm:1': 1,
                    's:md:1': 1
                  },
                  borderRadius: {
                    rounded: {
                      's:sm:1': 8,
                      's:md:1': 10
                    },
                    pill: {
                      's:sm:1': 8,
                      's:md:1': 10
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  },
                  paddingTop: {
                    's:sm:1': 1,
                    's:md:1': 1
                  },
                  paddingRight: {
                    's:sm:1': 1,
                    's:md:1': 1
                  },
                  paddingBottom: {
                    's:sm:1': 1,
                    's:md:1': 1
                  },
                  paddingLeft: {
                    's:sm:1': 1,
                    's:md:1': 1
                  }
                },
                palettes: {
                  default: {
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: white,
                            hover: switchStateRef(white),
                            focus: switchStateRef(white),
                            pressed: switchStateRef(white),
                            selected: {
                              rest: switchStateRef(brandBackground),
                              hover: switchStateRef(brandBackgroundHover),
                              focus: switchStateRef(brandBackground),
                              pressed: switchStateRef(brandBackgroundPressed)
                            },
                            disabled: switchStateRef(neutralBackgroundDisabled)
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: '#616161',
                            hover: switchStateRef('#575757'),
                            focus: switchStateRef('#616161'),
                            pressed: switchStateRef(neutralStrokeAccessiblePressed),
                            selected: {
                              rest: switchStateRef(transparent),
                              hover: switchStateRef(transparent),
                              focus: switchStateRef(transparent),
                              pressed: switchStateRef(transparent)
                            },
                            disabled: switchStateRef('#D1D1D1')
                          }
                        }
                      }
                    }
                  }
                }
              },
              e4: {
                scales: {
                  boxWidth: {
                    's:sm:1': 14,
                    's:md:1': 18
                  },
                  boxHeight: {
                    's:sm:1': 14,
                    's:md:1': 18
                  },
                  borderRadius: {
                    rounded: {
                      's:sm:1': 7,
                      's:md:1': 9
                    },
                    pill: {
                      's:sm:1': 7,
                      's:md:1': 9
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  }
                },
                palettes: {
                  default: {
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: '#616161',
                            hover: switchStateRef('#424242'),
                            focus: switchStateRef('#616161'),
                            pressed: switchStateRef('#424242'),
                            selected: {
                              rest: switchStateRef(white),
                              hover: switchStateRef(white),
                              focus: switchStateRef(white),
                              pressed: switchStateRef(white)
                            },
                            disabled: switchStateRef(neutralForegroundDisabled)
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: transparent,
                            selected: {
                              rest: switchStateRef(transparent)
                            },
                            disabled: switchStateRef(transparent)
                          }
                        }
                      }
                    }
                  }
                }
              },
              e5: {
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: {
                    's:sm:1': 12,
                    's:md:1': 14
                  },
                  textHeight: {
                    's:sm:1': 16,
                    's:md:1': 20
                  },
                  marginLeft: {
                    's:sm:1': 8,
                    's:md:1': 8
                  },
                  marginRight: {
                    's:sm:1': 8,
                    's:md:1': 8
                  }
                },
                palettes: {
                  default: {
                    light: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: '#242424',
                            disabled: switchStateRef(neutralForegroundDisabled)
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
