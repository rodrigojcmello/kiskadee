import { type Color, type Schema, type SolidColor, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleSwitchSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
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
  offTrack: '#e6e1e9',
  offTrackDisabled: switchColorWithAlpha('#e7e0ec', 10),
  offTrackOutline: '#c9c4cf',
  offTrackOutlineDisabled: switchColorWithAlpha('#1d1b20', 10),
  offThumb: '#79757f',
  offThumbInteractive: '#48454e',
  offThumbDisabled: switchColorWithAlpha('#1c1b20', 38),
  onTrack: '#615690',
  onThumb: '#ffffff',
  onThumbInteractive: '#e7deff',
  offIcon: '#e6e1e9',
  onIcon: '#493e76'
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
            },
            low: {
              rest: switchColorWithAlpha('#ffffff', 24),
              hover: switchStateRef(switchColorWithAlpha('#ffffff', 32)),
              focus: switchStateRef(switchColorWithAlpha('#ffffff', 24)),
              pressed: switchStateRef(switchColorWithAlpha('#ffffff', 40)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 12)),
              selected: {
                rest: switchStateRef(c(s, 'l', 'primary', 5)),
                hover: switchStateRef(c(s, 'l', 'primary', 10)),
                focus: switchStateRef(c(s, 'l', 'primary', 5)),
                pressed: switchStateRef(c(s, 'l', 'primary', 16))
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
            },
            low: {
              rest: switchColorWithAlpha('#ffffff', 64),
              hover: switchStateRef(switchColorWithAlpha('#ffffff', 80)),
              focus: switchStateRef(switchColorWithAlpha('#ffffff', 64)),
              pressed: switchStateRef(switchColorWithAlpha('#ffffff', 88)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 20)),
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
            },
            low: {
              rest: switchColorWithAlpha('#ffffff', 24),
              hover: switchStateRef(switchColorWithAlpha('#ffffff', 32)),
              focus: switchStateRef(switchColorWithAlpha('#ffffff', 24)),
              pressed: switchStateRef(switchColorWithAlpha('#ffffff', 40)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 12)),
              selected: {
                rest: switchStateRef(c(s, 'd', 'primary', 90)),
                hover: switchStateRef(c(s, 'd', 'primary', 85)),
                focus: switchStateRef(c(s, 'd', 'primary', 90)),
                pressed: switchStateRef(c(s, 'd', 'primary', 80))
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
            },
            low: {
              rest: switchColorWithAlpha('#ffffff', 64),
              hover: switchStateRef(switchColorWithAlpha('#ffffff', 80)),
              focus: switchStateRef(switchColorWithAlpha('#ffffff', 64)),
              pressed: switchStateRef(switchColorWithAlpha('#ffffff', 88)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 20)),
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
            },
            low: {
              rest: figmaSwitchColor.onThumb,
              hover: switchStateRef(c(s, 'l', 'primary', 5)),
              focus: switchStateRef(c(s, 'l', 'primary', 5)),
              pressed: switchStateRef(c(s, 'l', 'primary', 10)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 38)),
              selected: {
                rest: switchStateRef(c(s, 'l', 'primary', 70)),
                hover: switchStateRef(c(s, 'l', 'primary', 75)),
                focus: switchStateRef(c(s, 'l', 'primary', 70)),
                pressed: switchStateRef(c(s, 'l', 'primary', 80))
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
            },
            low: {
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
                hover: switchStateRef(c(s, 'd', 'switch.neutral', 16)),
                focus: switchStateRef(c(s, 'd', 'switch.neutral', 20)),
                pressed: switchStateRef(c(s, 'd', 'switch.neutral', 10))
              }
            },
            low: {
              rest: figmaSwitchColor.onThumb,
              hover: switchStateRef(c(s, 'd', 'primary', 90)),
              focus: switchStateRef(c(s, 'd', 'primary', 90)),
              pressed: switchStateRef(c(s, 'd', 'primary', 80)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 38)),
              selected: {
                rest: switchStateRef(c(s, 'd', 'primary', 30)),
                hover: switchStateRef(c(s, 'd', 'primary', 26)),
                focus: switchStateRef(c(s, 'd', 'primary', 30)),
                pressed: switchStateRef(c(s, 'd', 'primary', 20))
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
            },
            low: {
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
            },
            low: {
              rest: c(s, 'l', 'neutral', 0),
              disabled: switchStateRef(c(s, 'l', 'neutral', 0, 38))
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
            },
            low: {
              rest: c(s, 'd', 'neutral', 0),
              disabled: switchStateRef(c(s, 'd', 'neutral', 0, 38))
            }
          }
        }
      }
    })),
    icon: buildBySegment(segmentNames, (s) => ({
      light: {
        textColor: {
          neutral: {
            medium: {
              rest: figmaSwitchColor.offIcon,
              hover: switchStateRef(figmaSwitchColor.offIcon),
              focus: switchStateRef(figmaSwitchColor.offIcon),
              pressed: switchStateRef(figmaSwitchColor.offIcon),
              disabled: switchStateRef(figmaSwitchColor.offThumbDisabled),
              selected: {
                rest: switchStateRef(figmaSwitchColor.onIcon),
                hover: switchStateRef(figmaSwitchColor.onIcon),
                focus: switchStateRef(figmaSwitchColor.onIcon),
                pressed: switchStateRef(figmaSwitchColor.onIcon)
              }
            },
            low: {
              rest: c(s, 'l', 'primary', 70),
              hover: switchStateRef(c(s, 'l', 'primary', 75)),
              focus: switchStateRef(c(s, 'l', 'primary', 70)),
              pressed: switchStateRef(c(s, 'l', 'primary', 80)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 38)),
              selected: {
                rest: switchStateRef(figmaSwitchColor.onThumb),
                hover: switchStateRef(figmaSwitchColor.onThumb),
                focus: switchStateRef(figmaSwitchColor.onThumb),
                pressed: switchStateRef(figmaSwitchColor.onThumb)
              }
            }
          }
        }
      },
      dark: {
        textColor: {
          neutral: {
            medium: {
              rest: c(s, 'd', 'neutral.v2', 20),
              hover: switchStateRef(c(s, 'd', 'neutral.v2', 10)),
              focus: switchStateRef(c(s, 'd', 'neutral.v2', 20)),
              pressed: switchStateRef(c(s, 'd', 'neutral.v2', 5)),
              disabled: switchStateRef(c(s, 'd', 'neutral', 90, 38)),
              selected: {
                rest: switchStateRef(c(s, 'd', 'switch.neutral', 80)),
                hover: switchStateRef(c(s, 'd', 'switch.neutral', 85)),
                focus: switchStateRef(c(s, 'd', 'switch.neutral', 80)),
                pressed: switchStateRef(c(s, 'd', 'switch.neutral', 90))
              }
            },
            low: {
              rest: c(s, 'd', 'primary', 30),
              hover: switchStateRef(c(s, 'd', 'primary', 26)),
              focus: switchStateRef(c(s, 'd', 'primary', 30)),
              pressed: switchStateRef(c(s, 'd', 'primary', 20)),
              disabled: switchStateRef(switchColorWithAlpha('#ffffff', 38)),
              selected: {
                rest: switchStateRef(figmaSwitchColor.onThumb),
                hover: switchStateRef(figmaSwitchColor.onThumb),
                focus: switchStateRef(figmaSwitchColor.onThumb),
                pressed: switchStateRef(figmaSwitchColor.onThumb)
              }
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
    effects: {
      activationFeedback: {
        profile: 'halo',
        origin: 'center',
        visual: {
          layer: 'underlay',
          paint: 'outline',
          tone: {
            default: 'subtle',
            byEmphasis: {
              low: 'vivid'
            }
          }
        },
        profiles: {
          halo: {
            size: 8
          }
        }
      }
    },
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
                  thumbShrink: {
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
              },
              e6: {
                name: 'icon',
                scales: {
                  boxWidth: {
                    's:md:1': 16
                  },
                  boxHeight: {
                    's:md:1': 16
                  }
                },
                palettes: palettes.icon
              }
            }
          }
        }
      }
    }
  };
}
