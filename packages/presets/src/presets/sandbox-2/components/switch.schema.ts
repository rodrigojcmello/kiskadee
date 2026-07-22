import type { Color, Schema } from '@kiskadee/core';
import type { Sandbox2Segment } from '../sandbox-2.schema.ts';

type SwitchComponent = NonNullable<Schema<Sandbox2Segment>['components']['switch']>;
type SwitchElementPalettes = NonNullable<
  NonNullable<
    SwitchComponent['variants']['standard']['modes']['base']['elements']['e2']
  >['palettes']
>;
type SwitchTextElementPalettes = NonNullable<
  NonNullable<
    SwitchComponent['variants']['standard']['modes']['base']['elements']['e4']
  >['palettes']
>;
type SwitchIconElementPalettes = NonNullable<
  NonNullable<
    SwitchComponent['variants']['standard']['modes']['base']['elements']['e6']
  >['palettes']
>;
type InteractionColors = {
  rest: Color;
  hover: Color;
  focus: Color;
  pressed: Color;
  disabled: Color;
  selectedRest: Color;
  selectedHover: Color;
  selectedFocus: Color;
  selectedPressed: Color;
};
type ThumbInteractionColors = Omit<InteractionColors, 'pressed' | 'selectedPressed'>;

function ref<T>(value: T): { ref: T } {
  return { ref: value };
}

function states(colors: InteractionColors) {
  return {
    rest: colors.rest,
    hover: ref(colors.hover),
    focus: ref(colors.focus),
    pressed: ref(colors.pressed),
    disabled: ref(colors.disabled),
    selected: {
      rest: ref(colors.selectedRest),
      hover: ref(colors.selectedHover),
      focus: ref(colors.selectedFocus),
      pressed: ref(colors.selectedPressed)
    }
  };
}

function thumbStates(colors: ThumbInteractionColors) {
  return {
    rest: colors.rest,
    hover: ref(colors.hover),
    focus: ref(colors.focus),
    disabled: ref(colors.disabled),
    selected: {
      rest: ref(colors.selectedRest),
      hover: ref(colors.selectedHover),
      focus: ref(colors.selectedFocus)
    }
  };
}

const transparent = '#00000000' as const;

const c = {
  canvasInk: '#0c0d13',
  inkMuted: '#70778f',
  inkDisabled: '#afb3c0',
  white: '#ffffff',

  neutralTrack: '#e7e9ee',
  neutralTrackHover: '#dbdfe6',
  neutralTrackPressed: '#c9ced9',
  neutralTrackDisabled: '#e2e4e99e',
  neutralTrackOn: '#ab7af5',
  neutralTrackOnHover: '#9f66f5',
  neutralTrackOnPressed: '#8d47f5',

  primaryTrack: '#2856e2',
  primaryTrackHover: '#547ce8',
  primaryTrackPressed: '#1131a7',
  primaryTrackDisabled: '#c2c7d68a',
  primaryTrackOn: '#6124db',
  primaryTrackOnHover: '#7945e3',
  primaryTrackOnPressed: '#4b16b6',

  polarityOff: '#da1b3b',
  polarityOffHover: '#e7405c',
  polarityOffPressed: '#980b23',
  polarityDisabled: '#d2bcbf8a',
  polarityOn: '#26ba7a',
  polarityOnHover: '#43d093',
  polarityOnPressed: '#0f7b4c',

  thumbOff: '#ffffff',
  thumbDisabled: '#d0d4dc',
  thumbOn: '#6200f5',
  iconOff: '#70778f',
  iconOn: '#ffffff'
} as const;

const sizes = {
  trackWidth: {
    's:sm:3': 28,
    's:sm:2': 32,
    's:sm:1': 34,
    's:md:1': 34,
    's:lg:1': 42
  },
  trackHeight: {
    's:sm:3': 10,
    's:sm:2': 12,
    's:sm:1': 14,
    's:md:1': 14,
    's:lg:1': 16
  },
  trackPadding: {
    's:sm:3': 0,
    's:sm:2': 0,
    's:sm:1': 0,
    's:md:1': 0,
    's:lg:1': 0
  },
  thumb: {
    's:sm:3': 16,
    's:sm:2': 18,
    's:sm:1': 20,
    's:md:1': 20,
    's:lg:1': 24
  },
  icon: {
    's:sm:3': 10,
    's:sm:2': 10,
    's:sm:1': 12,
    's:md:1': 12,
    's:lg:1': 14
  },
  labelText: {
    's:sm:3': 12,
    's:sm:2': 12,
    's:sm:1': 13,
    's:md:1': 14,
    's:lg:1': 16
  },
  labelLine: {
    's:sm:3': 16,
    's:sm:2': 16,
    's:sm:1': 18,
    's:md:1': 20,
    's:lg:1': 24
  },
  controlTextWidth: {
    's:sm:3': 18,
    's:sm:2': 22,
    's:sm:1': 26,
    's:md:1': 30,
    's:lg:1': 36
  }
} as const;

const trackPalettes = {
  default: {
    light: {
      default: {
        boxColor: {
          neutral: {
            high: states({
              rest: c.canvasInk,
              hover: '#171926',
              focus: c.canvasInk,
              pressed: '#232639',
              disabled: c.neutralTrackDisabled,
              selectedRest: c.neutralTrackOn,
              selectedHover: c.neutralTrackOnHover,
              selectedFocus: c.neutralTrackOn,
              selectedPressed: c.neutralTrackOnPressed
            }),
            medium: states({
              rest: c.neutralTrack,
              hover: c.neutralTrackHover,
              focus: c.neutralTrack,
              pressed: c.neutralTrackPressed,
              disabled: c.neutralTrackDisabled,
              selectedRest: c.neutralTrackOn,
              selectedHover: c.neutralTrackOnHover,
              selectedFocus: c.neutralTrackOn,
              selectedPressed: c.neutralTrackOnPressed
            }),
            low: states({
              rest: '#f3f4f76b',
              hover: '#edeff28f',
              focus: '#f3f4f76b',
              pressed: '#e1e4eaa3',
              disabled: '#e2e4e947',
              selectedRest: '#2856e247',
              selectedHover: '#2856e25c',
              selectedFocus: '#2856e247',
              selectedPressed: '#2856e270'
            }),
            lowest: states({
              rest: transparent,
              hover: '#e7e9ee38',
              focus: transparent,
              pressed: '#cfd4de52',
              disabled: '#e2e4e92e',
              selectedRest: '#2856e229',
              selectedHover: '#2856e23d',
              selectedFocus: '#2856e229',
              selectedPressed: '#2856e252'
            })
          },
          primary: {
            high: states({
              rest: c.primaryTrackPressed,
              hover: c.primaryTrack,
              focus: c.primaryTrackPressed,
              pressed: '#0a2385',
              disabled: c.primaryTrackDisabled,
              selectedRest: c.primaryTrackOn,
              selectedHover: c.primaryTrackOnHover,
              selectedFocus: c.primaryTrackOn,
              selectedPressed: c.primaryTrackOnPressed
            }),
            medium: states({
              rest: c.primaryTrack,
              hover: c.primaryTrackHover,
              focus: c.primaryTrack,
              pressed: c.primaryTrackPressed,
              disabled: c.primaryTrackDisabled,
              selectedRest: c.primaryTrackOn,
              selectedHover: c.primaryTrackOnHover,
              selectedFocus: c.primaryTrackOn,
              selectedPressed: c.primaryTrackOnPressed
            }),
            low: states({
              rest: '#2856e242',
              hover: '#2856e25c',
              focus: '#2856e242',
              pressed: '#2856e275',
              disabled: '#c2c7d647',
              selectedRest: '#6124db52',
              selectedHover: '#6124db6b',
              selectedFocus: '#6124db52',
              selectedPressed: '#6124db85'
            }),
            lowest: states({
              rest: transparent,
              hover: '#2856e22e',
              focus: transparent,
              pressed: '#2856e24d',
              disabled: '#c2c7d629',
              selectedRest: '#6124db2e',
              selectedHover: '#6124db47',
              selectedFocus: '#6124db2e',
              selectedPressed: '#6124db61'
            })
          },
          polarity: {
            high: states({
              rest: c.polarityOffPressed,
              hover: c.polarityOff,
              focus: c.polarityOffPressed,
              pressed: '#740618',
              disabled: c.polarityDisabled,
              selectedRest: c.polarityOn,
              selectedHover: c.polarityOnHover,
              selectedFocus: c.polarityOn,
              selectedPressed: c.polarityOnPressed
            }),
            medium: states({
              rest: c.polarityOff,
              hover: c.polarityOffHover,
              focus: c.polarityOff,
              pressed: c.polarityOffPressed,
              disabled: c.polarityDisabled,
              selectedRest: c.polarityOn,
              selectedHover: c.polarityOnHover,
              selectedFocus: c.polarityOn,
              selectedPressed: c.polarityOnPressed
            }),
            low: states({
              rest: '#da1b3b47',
              hover: '#da1b3b61',
              focus: '#da1b3b47',
              pressed: '#da1b3b7a',
              disabled: '#d2bcbf47',
              selectedRest: '#26ba7a52',
              selectedHover: '#26ba7a6b',
              selectedFocus: '#26ba7a52',
              selectedPressed: '#26ba7a85'
            }),
            lowest: states({
              rest: transparent,
              hover: '#da1b3b2e',
              focus: transparent,
              pressed: '#da1b3b4d',
              disabled: '#d2bcbf29',
              selectedRest: '#26ba7a2e',
              selectedHover: '#26ba7a47',
              selectedFocus: '#26ba7a2e',
              selectedPressed: '#26ba7a61'
            })
          }
        },
        borderColor: {
          neutral: {
            high: states({
              rest: c.canvasInk,
              hover: '#171926',
              focus: c.canvasInk,
              pressed: '#232639',
              disabled: c.neutralTrackDisabled,
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            medium: states({
              rest: '#a9aebc',
              hover: '#8d92a5',
              focus: '#a9aebc',
              pressed: '#70778f',
              disabled: c.neutralTrackDisabled,
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            low: states({
              rest: '#afb3c085',
              hover: '#9298aa9e',
              focus: '#afb3c085',
              pressed: '#70778fb8',
              disabled: '#e2e4e947',
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            lowest: states({
              rest: '#afb3c03d',
              hover: '#9298aa5c',
              focus: '#afb3c03d',
              pressed: '#70778f7a',
              disabled: '#e2e4e92e',
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            })
          },
          primary: {
            high: states({
              rest: c.primaryTrackPressed,
              hover: c.primaryTrack,
              focus: c.primaryTrackPressed,
              pressed: '#0a2385',
              disabled: c.primaryTrackDisabled,
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            medium: states({
              rest: c.primaryTrack,
              hover: c.primaryTrackHover,
              focus: c.primaryTrack,
              pressed: c.primaryTrackPressed,
              disabled: c.primaryTrackDisabled,
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            low: states({
              rest: '#2856e270',
              hover: '#2856e28f',
              focus: '#2856e270',
              pressed: '#2856e2ad',
              disabled: '#c2c7d647',
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            lowest: states({
              rest: '#2856e242',
              hover: '#2856e261',
              focus: '#2856e242',
              pressed: '#2856e280',
              disabled: '#c2c7d629',
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            })
          },
          polarity: {
            high: states({
              rest: c.polarityOffPressed,
              hover: c.polarityOff,
              focus: c.polarityOffPressed,
              pressed: '#740618',
              disabled: c.polarityDisabled,
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            medium: states({
              rest: c.polarityOff,
              hover: c.polarityOffHover,
              focus: c.polarityOff,
              pressed: c.polarityOffPressed,
              disabled: c.polarityDisabled,
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            low: states({
              rest: '#da1b3b70',
              hover: '#da1b3b8f',
              focus: '#da1b3b70',
              pressed: '#da1b3bad',
              disabled: '#d2bcbf47',
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            }),
            lowest: states({
              rest: '#da1b3b42',
              hover: '#da1b3b61',
              focus: '#da1b3b42',
              pressed: '#da1b3b80',
              disabled: '#d2bcbf29',
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent,
              selectedPressed: transparent
            })
          }
        }
      }
    }
  }
} satisfies SwitchElementPalettes;

const thumbPalettes = {
  default: {
    light: {
      default: {
        boxColor: {
          neutral: {
            high: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.thumbOn,
              selectedHover: c.thumbOn,
              selectedFocus: c.thumbOn
            }),
            medium: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.thumbOn,
              selectedHover: c.thumbOn,
              selectedFocus: c.thumbOn
            }),
            low: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            }),
            lowest: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            })
          },
          primary: {
            high: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            }),
            medium: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            }),
            low: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            }),
            lowest: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            })
          },
          polarity: {
            high: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            }),
            medium: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            }),
            low: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            }),
            lowest: thumbStates({
              rest: c.white,
              hover: c.white,
              focus: c.white,
              disabled: c.thumbDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white
            })
          }
        },
        borderColor: {
          neutral: {
            high: thumbStates({
              rest: transparent,
              hover: transparent,
              focus: transparent,
              disabled: transparent,
              selectedRest: transparent,
              selectedHover: transparent,
              selectedFocus: transparent
            })
          }
        }
      }
    }
  }
} satisfies SwitchElementPalettes;

const textPalettes = {
  default: {
    light: {
      default: {
        textColor: {
          neutral: {
            high: {
              rest: c.canvasInk,
              disabled: ref(c.inkDisabled)
            },
            medium: {
              rest: c.inkMuted,
              disabled: ref(c.inkDisabled)
            },
            low: {
              rest: '#70778fc7',
              disabled: ref(c.inkDisabled)
            },
            lowest: {
              rest: '#70778f9e',
              disabled: ref(c.inkDisabled)
            }
          },
          primary: {
            high: {
              rest: c.primaryTrackPressed,
              disabled: ref(c.inkDisabled)
            },
            medium: {
              rest: c.primaryTrack,
              disabled: ref(c.inkDisabled)
            },
            low: {
              rest: '#2856e2c7',
              disabled: ref(c.inkDisabled)
            },
            lowest: {
              rest: '#2856e29e',
              disabled: ref(c.inkDisabled)
            }
          },
          polarity: {
            high: {
              rest: c.polarityOffPressed,
              selected: {
                rest: ref(c.polarityOnPressed)
              },
              disabled: ref(c.inkDisabled)
            },
            medium: {
              rest: c.polarityOff,
              selected: {
                rest: ref(c.polarityOn)
              },
              disabled: ref(c.inkDisabled)
            },
            low: {
              rest: '#da1b3bc7',
              selected: {
                rest: ref('#26ba7ac7' as const)
              },
              disabled: ref(c.inkDisabled)
            },
            lowest: {
              rest: '#da1b3b9e',
              selected: {
                rest: ref('#26ba7a9e' as const)
              },
              disabled: ref(c.inkDisabled)
            }
          }
        }
      }
    }
  }
} satisfies SwitchTextElementPalettes;

const iconPalettes = {
  default: {
    light: {
      default: {
        textColor: {
          neutral: {
            high: states({
              rest: c.iconOff,
              hover: c.iconOff,
              focus: c.iconOff,
              pressed: c.iconOff,
              disabled: c.inkDisabled,
              selectedRest: c.iconOn,
              selectedHover: c.iconOn,
              selectedFocus: c.iconOn,
              selectedPressed: c.iconOn
            }),
            medium: states({
              rest: c.iconOff,
              hover: c.iconOff,
              focus: c.iconOff,
              pressed: c.iconOff,
              disabled: c.inkDisabled,
              selectedRest: c.iconOn,
              selectedHover: c.iconOn,
              selectedFocus: c.iconOn,
              selectedPressed: c.iconOn
            }),
            low: states({
              rest: '#70778fc7',
              hover: '#70778fc7',
              focus: '#70778fc7',
              pressed: '#70778fc7',
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            }),
            lowest: states({
              rest: '#70778f9e',
              hover: '#70778f9e',
              focus: '#70778f9e',
              pressed: '#70778f9e',
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            })
          },
          primary: {
            high: states({
              rest: c.primaryTrackPressed,
              hover: c.primaryTrackPressed,
              focus: c.primaryTrackPressed,
              pressed: c.primaryTrackPressed,
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            }),
            medium: states({
              rest: c.primaryTrack,
              hover: c.primaryTrack,
              focus: c.primaryTrack,
              pressed: c.primaryTrack,
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            }),
            low: states({
              rest: '#2856e2c7',
              hover: '#2856e2c7',
              focus: '#2856e2c7',
              pressed: '#2856e2c7',
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            }),
            lowest: states({
              rest: '#2856e29e',
              hover: '#2856e29e',
              focus: '#2856e29e',
              pressed: '#2856e29e',
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            })
          },
          polarity: {
            high: states({
              rest: c.polarityOffPressed,
              hover: c.polarityOffPressed,
              focus: c.polarityOffPressed,
              pressed: c.polarityOffPressed,
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            }),
            medium: states({
              rest: c.polarityOff,
              hover: c.polarityOff,
              focus: c.polarityOff,
              pressed: c.polarityOff,
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            }),
            low: states({
              rest: '#da1b3bc7',
              hover: '#da1b3bc7',
              focus: '#da1b3bc7',
              pressed: '#da1b3bc7',
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            }),
            lowest: states({
              rest: '#da1b3b9e',
              hover: '#da1b3b9e',
              focus: '#da1b3b9e',
              pressed: '#da1b3b9e',
              disabled: c.inkDisabled,
              selectedRest: c.white,
              selectedHover: c.white,
              selectedFocus: c.white,
              selectedPressed: c.white
            })
          }
        }
      }
    }
  }
} satisfies SwitchIconElementPalettes;

export function createSandbox2SwitchSchema(): SwitchComponent {
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
              low: 'vivid',
              lowest: 'vivid'
            }
          }
        },
        profiles: {
          halo: {
            size: 8
          }
        }
      },
      shadow: {
        e2: {
          kind: 'inner',
          states: {
            rest: 's:sm:1',
            disabled: false
          }
        },
        e3: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            disabled: false
          }
        }
      }
    },
    options: {
      variant: 'standard',
      radius: 'pill',
      activationMotion: 'slow',
      controlTextVisibility: 'none'
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
                  boxWidth: sizes.trackWidth,
                  boxHeight: sizes.trackHeight,
                  borderWidth: 0,
                  borderRadius: {
                    rounded: {
                      's:sm:3': 5,
                      's:sm:2': 6,
                      's:sm:1': 7,
                      's:md:1': 7,
                      's:lg:1': 8
                    },
                    pill: {
                      's:sm:3': 5,
                      's:sm:2': 6,
                      's:sm:1': 7,
                      's:md:1': 7,
                      's:lg:1': 8
                    },
                    square: 0
                  },
                  paddingTop: sizes.trackPadding,
                  paddingRight: sizes.trackPadding,
                  paddingBottom: sizes.trackPadding,
                  paddingLeft: sizes.trackPadding
                },
                palettes: trackPalettes
              },
              e3: {
                name: 'thumb',
                decorations: {
                  borderStyle: 'solid'
                },
                scales: {
                  boxWidth: sizes.thumb,
                  boxHeight: sizes.thumb,
                  borderWidth: 0,
                  borderRadius: {
                    rounded: {
                      's:sm:3': 4,
                      's:sm:2': 5,
                      's:sm:1': 6,
                      's:md:1': 7,
                      's:lg:1': 9
                    },
                    pill: {
                      's:sm:3': 8,
                      's:sm:2': 9,
                      's:sm:1': 10,
                      's:md:1': 10,
                      's:lg:1': 12
                    },
                    square: 0
                  }
                },
                palettes: thumbPalettes
              },
              e4: {
                name: 'label',
                decorations: {
                  textFont: 'body',
                  textWeight: 'medium'
                },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine,
                  marginLeft: 10,
                  marginRight: 10
                },
                palettes: textPalettes
              },
              e5: {
                name: 'control text',
                decorations: {
                  textFont: 'body',
                  textWeight: 'medium'
                },
                scales: {
                  boxWidth: sizes.controlTextWidth,
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine,
                  marginLeft: 8,
                  marginRight: 8
                },
                palettes: textPalettes
              },
              e6: {
                name: 'icon',
                scales: {
                  boxWidth: sizes.icon,
                  boxHeight: sizes.icon
                },
                palettes: iconPalettes
              }
            }
          }
        }
      }
    }
  };
}
