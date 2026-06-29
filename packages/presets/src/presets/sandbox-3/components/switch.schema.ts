import type { Color, Schema } from '@kiskadee/core';
import type { Sandbox3Segment } from '../sandbox-3.schema.ts';

type SwitchComponent = NonNullable<Schema<Sandbox3Segment>['components']['switch']>;
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

const transparent = [0, 0, 0, 0] as const;

const c = {
  canvasInk: [231, 24, 6, 1],
  inkMuted: [226, 12, 50, 1],
  inkDisabled: [226, 12, 72, 1],
  white: [0, 0, 100, 1],

  neutralTrack: [220, 18, 92, 1],
  neutralTrackHover: [220, 18, 88, 1],
  neutralTrackPressed: [220, 18, 82, 1],
  neutralTrackDisabled: [220, 14, 90, 0.62],
  neutralTrackOn: [264, 86, 72, 1],
  neutralTrackOnHover: [264, 88, 68, 1],
  neutralTrackOnPressed: [264, 90, 62, 1],

  primaryTrack: [225, 76, 52, 1],
  primaryTrackHover: [224, 76, 62, 1],
  primaryTrackPressed: [227, 82, 36, 1],
  primaryTrackDisabled: [224, 20, 80, 0.54],
  primaryTrackOn: [260, 72, 50, 1],
  primaryTrackOnHover: [260, 74, 58, 1],
  primaryTrackOnPressed: [260, 78, 40, 1],

  polarityOff: [350, 78, 48, 1],
  polarityOffHover: [350, 78, 58, 1],
  polarityOffPressed: [350, 86, 32, 1],
  polarityDisabled: [350, 20, 78, 0.54],
  polarityOn: [154, 66, 44, 1],
  polarityOnHover: [154, 60, 54, 1],
  polarityOnPressed: [154, 78, 27, 1],

  thumbOff: [0, 0, 100, 1],
  thumbDisabled: [220, 14, 84, 1],
  thumbOn: [264, 100, 48, 1],
  iconOff: [226, 12, 50, 1],
  iconOn: [0, 0, 100, 1]
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
      boxColor: {
        neutral: {
          high: states({
            rest: c.canvasInk,
            hover: [231, 24, 12, 1],
            focus: c.canvasInk,
            pressed: [231, 24, 18, 1],
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
            rest: [220, 18, 96, 0.42],
            hover: [220, 18, 94, 0.56],
            focus: [220, 18, 96, 0.42],
            pressed: [220, 18, 90, 0.64],
            disabled: [220, 14, 90, 0.28],
            selectedRest: [225, 76, 52, 0.28],
            selectedHover: [225, 76, 52, 0.36],
            selectedFocus: [225, 76, 52, 0.28],
            selectedPressed: [225, 76, 52, 0.44]
          }),
          lowest: states({
            rest: transparent,
            hover: [220, 18, 92, 0.22],
            focus: transparent,
            pressed: [220, 18, 84, 0.32],
            disabled: [220, 14, 90, 0.18],
            selectedRest: [225, 76, 52, 0.16],
            selectedHover: [225, 76, 52, 0.24],
            selectedFocus: [225, 76, 52, 0.16],
            selectedPressed: [225, 76, 52, 0.32]
          })
        },
        primary: {
          high: states({
            rest: c.primaryTrackPressed,
            hover: c.primaryTrack,
            focus: c.primaryTrackPressed,
            pressed: [228, 86, 28, 1],
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
            rest: [225, 76, 52, 0.26],
            hover: [225, 76, 52, 0.36],
            focus: [225, 76, 52, 0.26],
            pressed: [225, 76, 52, 0.46],
            disabled: [224, 20, 80, 0.28],
            selectedRest: [260, 72, 50, 0.32],
            selectedHover: [260, 72, 50, 0.42],
            selectedFocus: [260, 72, 50, 0.32],
            selectedPressed: [260, 72, 50, 0.52]
          }),
          lowest: states({
            rest: transparent,
            hover: [225, 76, 52, 0.18],
            focus: transparent,
            pressed: [225, 76, 52, 0.3],
            disabled: [224, 20, 80, 0.16],
            selectedRest: [260, 72, 50, 0.18],
            selectedHover: [260, 72, 50, 0.28],
            selectedFocus: [260, 72, 50, 0.18],
            selectedPressed: [260, 72, 50, 0.38]
          })
        },
        polarity: {
          high: states({
            rest: c.polarityOffPressed,
            hover: c.polarityOff,
            focus: c.polarityOffPressed,
            pressed: [350, 90, 24, 1],
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
            rest: [350, 78, 48, 0.28],
            hover: [350, 78, 48, 0.38],
            focus: [350, 78, 48, 0.28],
            pressed: [350, 78, 48, 0.48],
            disabled: [350, 20, 78, 0.28],
            selectedRest: [154, 66, 44, 0.32],
            selectedHover: [154, 66, 44, 0.42],
            selectedFocus: [154, 66, 44, 0.32],
            selectedPressed: [154, 66, 44, 0.52]
          }),
          lowest: states({
            rest: transparent,
            hover: [350, 78, 48, 0.18],
            focus: transparent,
            pressed: [350, 78, 48, 0.3],
            disabled: [350, 20, 78, 0.16],
            selectedRest: [154, 66, 44, 0.18],
            selectedHover: [154, 66, 44, 0.28],
            selectedFocus: [154, 66, 44, 0.18],
            selectedPressed: [154, 66, 44, 0.38]
          })
        }
      },
      borderColor: {
        neutral: {
          high: states({
            rest: c.canvasInk,
            hover: [231, 24, 12, 1],
            focus: c.canvasInk,
            pressed: [231, 24, 18, 1],
            disabled: c.neutralTrackDisabled,
            selectedRest: transparent,
            selectedHover: transparent,
            selectedFocus: transparent,
            selectedPressed: transparent
          }),
          medium: states({
            rest: [226, 12, 70, 1],
            hover: [226, 12, 60, 1],
            focus: [226, 12, 70, 1],
            pressed: [226, 12, 50, 1],
            disabled: c.neutralTrackDisabled,
            selectedRest: transparent,
            selectedHover: transparent,
            selectedFocus: transparent,
            selectedPressed: transparent
          }),
          low: states({
            rest: [226, 12, 72, 0.52],
            hover: [226, 12, 62, 0.62],
            focus: [226, 12, 72, 0.52],
            pressed: [226, 12, 50, 0.72],
            disabled: [220, 14, 90, 0.28],
            selectedRest: transparent,
            selectedHover: transparent,
            selectedFocus: transparent,
            selectedPressed: transparent
          }),
          lowest: states({
            rest: [226, 12, 72, 0.24],
            hover: [226, 12, 62, 0.36],
            focus: [226, 12, 72, 0.24],
            pressed: [226, 12, 50, 0.48],
            disabled: [220, 14, 90, 0.18],
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
            pressed: [228, 86, 28, 1],
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
            rest: [225, 76, 52, 0.44],
            hover: [225, 76, 52, 0.56],
            focus: [225, 76, 52, 0.44],
            pressed: [225, 76, 52, 0.68],
            disabled: [224, 20, 80, 0.28],
            selectedRest: transparent,
            selectedHover: transparent,
            selectedFocus: transparent,
            selectedPressed: transparent
          }),
          lowest: states({
            rest: [225, 76, 52, 0.26],
            hover: [225, 76, 52, 0.38],
            focus: [225, 76, 52, 0.26],
            pressed: [225, 76, 52, 0.5],
            disabled: [224, 20, 80, 0.16],
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
            pressed: [350, 90, 24, 1],
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
            rest: [350, 78, 48, 0.44],
            hover: [350, 78, 48, 0.56],
            focus: [350, 78, 48, 0.44],
            pressed: [350, 78, 48, 0.68],
            disabled: [350, 20, 78, 0.28],
            selectedRest: transparent,
            selectedHover: transparent,
            selectedFocus: transparent,
            selectedPressed: transparent
          }),
          lowest: states({
            rest: [350, 78, 48, 0.26],
            hover: [350, 78, 48, 0.38],
            focus: [350, 78, 48, 0.26],
            pressed: [350, 78, 48, 0.5],
            disabled: [350, 20, 78, 0.16],
            selectedRest: transparent,
            selectedHover: transparent,
            selectedFocus: transparent,
            selectedPressed: transparent
          })
        }
      }
    }
  }
} satisfies SwitchElementPalettes;

const thumbPalettes = {
  default: {
    light: {
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
} satisfies SwitchElementPalettes;

const textPalettes = {
  default: {
    light: {
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
            rest: [226, 12, 50, 0.78],
            disabled: ref(c.inkDisabled)
          },
          lowest: {
            rest: [226, 12, 50, 0.62],
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
            rest: [225, 76, 52, 0.78],
            disabled: ref(c.inkDisabled)
          },
          lowest: {
            rest: [225, 76, 52, 0.62],
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
            rest: [350, 78, 48, 0.78],
            selected: {
              rest: ref([154, 66, 44, 0.78] as const)
            },
            disabled: ref(c.inkDisabled)
          },
          lowest: {
            rest: [350, 78, 48, 0.62],
            selected: {
              rest: ref([154, 66, 44, 0.62] as const)
            },
            disabled: ref(c.inkDisabled)
          }
        }
      }
    }
  }
} satisfies SwitchTextElementPalettes;

const iconPalettes = {
  default: {
    light: {
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
            rest: [226, 12, 50, 0.78],
            hover: [226, 12, 50, 0.78],
            focus: [226, 12, 50, 0.78],
            pressed: [226, 12, 50, 0.78],
            disabled: c.inkDisabled,
            selectedRest: c.white,
            selectedHover: c.white,
            selectedFocus: c.white,
            selectedPressed: c.white
          }),
          lowest: states({
            rest: [226, 12, 50, 0.62],
            hover: [226, 12, 50, 0.62],
            focus: [226, 12, 50, 0.62],
            pressed: [226, 12, 50, 0.62],
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
            rest: [225, 76, 52, 0.78],
            hover: [225, 76, 52, 0.78],
            focus: [225, 76, 52, 0.78],
            pressed: [225, 76, 52, 0.78],
            disabled: c.inkDisabled,
            selectedRest: c.white,
            selectedHover: c.white,
            selectedFocus: c.white,
            selectedPressed: c.white
          }),
          lowest: states({
            rest: [225, 76, 52, 0.62],
            hover: [225, 76, 52, 0.62],
            focus: [225, 76, 52, 0.62],
            pressed: [225, 76, 52, 0.62],
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
            rest: [350, 78, 48, 0.78],
            hover: [350, 78, 48, 0.78],
            focus: [350, 78, 48, 0.78],
            pressed: [350, 78, 48, 0.78],
            disabled: c.inkDisabled,
            selectedRest: c.white,
            selectedHover: c.white,
            selectedFocus: c.white,
            selectedPressed: c.white
          }),
          lowest: states({
            rest: [350, 78, 48, 0.62],
            hover: [350, 78, 48, 0.62],
            focus: [350, 78, 48, 0.62],
            pressed: [350, 78, 48, 0.62],
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
} satisfies SwitchIconElementPalettes;

export function createSandbox3SwitchSchema(): SwitchComponent {
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
