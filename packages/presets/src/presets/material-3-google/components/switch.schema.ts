import type { Color, Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleSwitchSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: readonly [number, number, number, number];
  white: readonly [number, number, number, number];
};

function switchStateRef(color: Color): { ref: Color } {
  return { ref: color };
}

function createSwitchElementPalettes({
  c,
  segmentNames,
  transparent,
  white
}: CreateMaterial3GoogleSwitchSchemaArgs) {
  return {
    track: buildBySegment(segmentNames, (s) => ({
      light: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral.v2', 90),
              hover: switchStateRef(c(s, 'l', 'neutral.v2', 85)),
              focus: switchStateRef(c(s, 'l', 'neutral.v2', 90)),
              pressed: switchStateRef(c(s, 'l', 'neutral.v2', 80)),
              disabled: switchStateRef(c(s, 'l', 'neutral', 90, 12)),
              selected: {
                rest: switchStateRef(c(s, 'l', 'switch.neutral', 60)),
                hover: switchStateRef(c(s, 'l', 'switch.neutral', 55)),
                focus: switchStateRef(c(s, 'l', 'switch.neutral', 60)),
                pressed: switchStateRef(c(s, 'l', 'switch.neutral', 50))
              }
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral.v2', 45),
              hover: switchStateRef(c(s, 'l', 'neutral.v2', 35)),
              focus: switchStateRef(c(s, 'l', 'neutral.v2', 45)),
              pressed: switchStateRef(c(s, 'l', 'neutral.v2', 30)),
              disabled: switchStateRef(c(s, 'l', 'neutral', 90, 12)),
              selected: {
                rest: switchStateRef(transparent),
                hover: switchStateRef(transparent),
                focus: switchStateRef(transparent),
                pressed: switchStateRef(transparent)
              }
            }
          }
        }
      },
      dark: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral.v2', 35),
              hover: switchStateRef(c(s, 'd', 'neutral.v2', 40)),
              focus: switchStateRef(c(s, 'd', 'neutral.v2', 35)),
              pressed: switchStateRef(c(s, 'd', 'neutral.v2', 45)),
              disabled: switchStateRef(c(s, 'd', 'neutral', 30, 12)),
              selected: {
                rest: switchStateRef(c(s, 'd', 'switch.neutral', 80)),
                hover: switchStateRef(c(s, 'd', 'switch.neutral', 85)),
                focus: switchStateRef(c(s, 'd', 'switch.neutral', 80)),
                pressed: switchStateRef(c(s, 'd', 'switch.neutral', 90))
              }
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral.v2', 70),
              hover: switchStateRef(c(s, 'd', 'neutral.v2', 80)),
              focus: switchStateRef(c(s, 'd', 'neutral.v2', 70)),
              pressed: switchStateRef(c(s, 'd', 'neutral.v2', 85)),
              disabled: switchStateRef(c(s, 'd', 'neutral', 30, 12)),
              selected: {
                rest: switchStateRef(transparent),
                hover: switchStateRef(transparent),
                focus: switchStateRef(transparent),
                pressed: switchStateRef(transparent)
              }
            }
          }
        }
      }
    })),
    thumb: buildBySegment(segmentNames, (s) => ({
      light: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral.v2', 45),
              hover: switchStateRef(c(s, 'l', 'neutral.v2', 35)),
              focus: switchStateRef(c(s, 'l', 'neutral.v2', 45)),
              pressed: switchStateRef(c(s, 'l', 'neutral.v2', 30)),
              disabled: switchStateRef(c(s, 'l', 'neutral', 90, 38)),
              selected: {
                rest: switchStateRef(white),
                hover: switchStateRef(white),
                focus: switchStateRef(white),
                pressed: switchStateRef(white)
              }
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: transparent,
              disabled: switchStateRef(transparent),
              selected: {
                rest: switchStateRef(transparent)
              }
            }
          }
        }
      },
      dark: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral.v2', 80),
              hover: switchStateRef(c(s, 'd', 'neutral.v2', 90)),
              focus: switchStateRef(c(s, 'd', 'neutral.v2', 80)),
              pressed: switchStateRef(c(s, 'd', 'neutral.v2', 95)),
              disabled: switchStateRef(c(s, 'd', 'neutral', 30, 38)),
              selected: {
                rest: switchStateRef(c(s, 'd', 'switch.neutral', 20)),
                hover: switchStateRef(c(s, 'd', 'switch.neutral', 15)),
                focus: switchStateRef(c(s, 'd', 'switch.neutral', 20)),
                pressed: switchStateRef(c(s, 'd', 'switch.neutral', 10))
              }
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: transparent,
              disabled: switchStateRef(transparent),
              selected: {
                rest: switchStateRef(transparent)
              }
            }
          }
        }
      }
    })),
    label: buildBySegment(segmentNames, (s) => ({
      light: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'l', 'neutral', 90),
              disabled: switchStateRef(c(s, 'l', 'neutral', 90, 38))
            }
          }
        }
      },
      dark: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral', 90),
              disabled: switchStateRef(c(s, 'd', 'neutral', 90, 38))
            }
          }
        }
      }
    }))
  };
}

export function createMaterial3GoogleSwitchSchema(
  args: CreateMaterial3GoogleSwitchSchemaArgs
): SwitchComponent {
  const palettes = createSwitchElementPalettes(args);

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
                    's:sm:1': 44,
                    's:md:1': 52
                  },
                  boxHeight: {
                    's:sm:1': 28,
                    's:md:1': 32
                  },
                  borderWidth: {
                    's:sm:1': 2,
                    's:md:1': 2
                  },
                  borderRadius: {
                    rounded: {
                      's:sm:1': 14,
                      's:md:1': 16
                    },
                    pill: {
                      's:sm:1': 14,
                      's:md:1': 16
                    },
                    square: {
                      's:sm:1': 0,
                      's:md:1': 0
                    }
                  },
                  paddingTop: {
                    's:sm:1': 2,
                    's:md:1': 2
                  },
                  paddingRight: {
                    's:sm:1': 2,
                    's:md:1': 2
                  },
                  paddingBottom: {
                    's:sm:1': 2,
                    's:md:1': 2
                  },
                  paddingLeft: {
                    's:sm:1': 2,
                    's:md:1': 2
                  }
                },
                palettes: palettes.track
              },
              e4: {
                scales: {
                  boxWidth: {
                    's:sm:1': 16,
                    's:md:1': 20
                  },
                  boxHeight: {
                    's:sm:1': 16,
                    's:md:1': 20
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
                  }
                },
                palettes: palettes.thumb
              },
              e5: {
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: {
                    's:sm:1': 14,
                    's:md:1': 14
                  },
                  textHeight: {
                    's:sm:1': 20,
                    's:md:1': 20
                  },
                  marginLeft: {
                    's:sm:1': 8,
                    's:md:1': 12
                  },
                  marginRight: {
                    's:sm:1': 8,
                    's:md:1': 12
                  }
                },
                palettes: palettes.label
              }
            }
          }
        }
      }
    }
  };
}
