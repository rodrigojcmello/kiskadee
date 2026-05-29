import { type Color, type Schema, type SolidColor, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleSwitchSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: readonly [number, number, number, number];
};

function switchStateRef(color: Color): { ref: Color } {
  return { ref: color };
}

function switchColorWithAlpha(color: SolidColor, visibility: number): SolidColor {
  const alphaColor = withAlpha(color, visibility);
  if (alphaColor === undefined) {
    throw new Error('Expected Material switch color before applying alpha.');
  }
  return alphaColor;
}

const figmaSwitchColor = {
  offTrack: '#E6E1E9',
  offTrackDisabled: switchColorWithAlpha([275, 24, 90.2, 1], 10),
  offTrackOutline: '#C9C4CF',
  offTrackOutlineDisabled: switchColorWithAlpha([264, 8.47, 11.57, 1], 10),
  offThumb: '#79757F',
  offThumbInteractive: '#48454E',
  offThumbDisabled: switchColorWithAlpha([252, 8.47, 11.57, 1], 38),
  onTrack: '#615690',
  onThumb: '#FFFFFF',
  onThumbInteractive: '#E7DEFF'
} as const;

function createSwitchElementPalettes({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleSwitchSchemaArgs) {
  return {
    track: buildBySegment(segmentNames, (s) => ({
      light: {
        boxColor: {
          neutral: {
            medium: {
              rest: figmaSwitchColor.offTrack,
              hover: switchStateRef(figmaSwitchColor.offTrack),
              focus: switchStateRef(figmaSwitchColor.offTrack),
              pressed: switchStateRef(figmaSwitchColor.offTrack),
              disabled: switchStateRef(figmaSwitchColor.offTrackDisabled),
              selected: {
                rest: switchStateRef(figmaSwitchColor.onTrack),
                hover: switchStateRef(figmaSwitchColor.onTrack),
                focus: switchStateRef(figmaSwitchColor.onTrack),
                pressed: switchStateRef(figmaSwitchColor.onTrack)
              }
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: figmaSwitchColor.offTrackOutline,
              hover: switchStateRef(figmaSwitchColor.offTrackOutline),
              focus: switchStateRef(figmaSwitchColor.offTrackOutline),
              pressed: switchStateRef(figmaSwitchColor.offTrackOutline),
              disabled: switchStateRef(figmaSwitchColor.offTrackOutlineDisabled),
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
              rest: figmaSwitchColor.offThumb,
              hover: switchStateRef(figmaSwitchColor.offThumbInteractive),
              focus: switchStateRef(figmaSwitchColor.offThumbInteractive),
              pressed: switchStateRef(figmaSwitchColor.offThumbInteractive),
              disabled: switchStateRef(figmaSwitchColor.offThumbDisabled),
              selected: {
                rest: switchStateRef(figmaSwitchColor.onThumb),
                hover: switchStateRef(figmaSwitchColor.onThumbInteractive),
                focus: switchStateRef(figmaSwitchColor.onThumbInteractive),
                pressed: switchStateRef(figmaSwitchColor.onThumbInteractive)
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
              e2: {
                name: 'track',
                decorations: {
                  borderStyle: 'solid'
                },
                scales: {
                  boxWidth: {
                    's:md:1': 52
                  },
                  boxHeight: {
                    's:md:1': 32
                  },
                  borderWidth: 2,
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:md:1': 16
                    },
                    square: 0
                  },
                  paddingTop: {
                    's:md:1': 4
                  },
                  paddingRight: {
                    's:md:1': 4
                  },
                  paddingBottom: {
                    's:md:1': 4
                  },
                  paddingLeft: {
                    's:md:1': 4
                  }
                },
                palettes: palettes.track
              },
              e3: {
                name: 'thumb',
                scales: {
                  boxWidth: {
                    's:md:1': 24
                  },
                  boxHeight: {
                    's:md:1': 24
                  },
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:md:1': 12
                    },
                    square: 0
                  }
                },
                effects: {
                  activationFeedback: true,
                  thumbSize: {
                    rest: {
                      boxWidth: {
                        's:md:1': 16
                      },
                      boxHeight: {
                        's:md:1': 16
                      }
                    }
                  }
                },
                palettes: palettes.thumb
              },
              e4: {
                name: 'label',
                decorations: {
                  textFont: 'body',
                  textWeight: 'normal'
                },
                scales: {
                  textSize: {
                    's:md:1': 14
                  },
                  textHeight: {
                    's:md:1': 20
                  },
                  marginLeft: {
                    's:md:1': 12
                  },
                  marginRight: {
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
