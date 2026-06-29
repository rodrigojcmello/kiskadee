import type { Color, Schema } from '@kiskadee/core';
import type { Sandbox2Segment } from '../sandbox-2.schema.ts';

type SliderComponent = NonNullable<NonNullable<Schema<Sandbox2Segment>['components']>['slider']>;

function ref<T>(value: T): { ref: T } {
  return { ref: value };
}

function states(colors: {
  rest: Color;
  hover: Color;
  focus: Color;
  pressed: Color;
  disabled: Color;
}) {
  return {
    rest: colors.rest,
    hover: ref(colors.hover),
    focus: ref(colors.focus),
    pressed: ref(colors.pressed),
    disabled: ref(colors.disabled)
  };
}

const transparent = [0, 0, 0, 0] as const;

const c = {
  ink: [231, 24, 6, 1],
  inkSoft: [226, 12, 50, 1],
  inkMuted: [226, 12, 58, 1],
  inkDisabled: [226, 12, 72, 1],
  white: [0, 0, 100, 1],
  surface: [0, 0, 100, 1],
  track: [220, 18, 91, 1],
  trackHover: [220, 18, 88, 1],
  trackPressed: [220, 18, 82, 1],
  trackDisabled: [220, 14, 90, 0.5],
  primary: [225, 76, 52, 1],
  primaryHover: [224, 76, 62, 1],
  primaryPressed: [227, 82, 36, 1],
  primaryDisabled: [224, 20, 80, 0.54],
  violet: [260, 72, 50, 1],
  violetHover: [260, 74, 58, 1],
  violetPressed: [260, 78, 40, 1]
} as const;

const sizes = {
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
  trackHeight: {
    's:sm:3': 4,
    's:sm:2': 5,
    's:sm:1': 6,
    's:md:1': 6,
    's:lg:1': 8
  },
  thumb: {
    's:sm:3': 18,
    's:sm:2': 20,
    's:sm:1': 22,
    's:md:1': 24,
    's:lg:1': 28
  },
  endpointIcon: {
    's:sm:3': 16,
    's:sm:2': 18,
    's:sm:1': 20,
    's:md:1': 22,
    's:lg:1': 24
  },
  indicatorHeight: {
    's:sm:3': 24,
    's:sm:2': 26,
    's:sm:1': 28,
    's:md:1': 30,
    's:lg:1': 34
  },
  indicatorPadding: {
    's:sm:3': 8,
    's:sm:2': 10,
    's:sm:1': 12,
    's:md:1': 12,
    's:lg:1': 14
  },
  markWidth: {
    's:sm:3': 2,
    's:sm:2': 2,
    's:sm:1': 2,
    's:md:1': 2,
    's:lg:1': 3
  },
  markHeight: {
    's:sm:3': 10,
    's:sm:2': 10,
    's:sm:1': 11,
    's:md:1': 12,
    's:lg:1': 14
  }
} as const;

const textPalettes = {
  default: {
    light: {
      textColor: {
        neutral: {
          medium: states({
            rest: c.ink,
            hover: c.ink,
            focus: c.ink,
            pressed: c.ink,
            disabled: c.inkDisabled
          }),
          low: states({
            rest: c.inkMuted,
            hover: c.inkSoft,
            focus: c.inkMuted,
            pressed: c.inkSoft,
            disabled: c.inkDisabled
          })
        },
        primary: {
          medium: states({
            rest: c.violet,
            hover: c.violetHover,
            focus: c.violet,
            pressed: c.violetPressed,
            disabled: c.primaryDisabled
          }),
          low: states({
            rest: [260, 36, 44, 1],
            hover: c.violet,
            focus: [260, 36, 44, 1],
            pressed: c.violetPressed,
            disabled: c.primaryDisabled
          })
        }
      }
    }
  }
} as const;

const iconPalettes = {
  default: {
    light: {
      textColor: {
        neutral: {
          medium: states({
            rest: c.inkMuted,
            hover: c.inkSoft,
            focus: c.inkMuted,
            pressed: c.ink,
            disabled: c.inkDisabled
          })
        },
        primary: {
          medium: states({
            rest: c.violet,
            hover: c.violetHover,
            focus: c.violet,
            pressed: c.violetPressed,
            disabled: c.primaryDisabled
          })
        }
      }
    }
  }
} as const;

const trackPalettes = {
  default: {
    light: {
      boxColor: {
        neutral: {
          medium: states({
            rest: c.track,
            hover: c.trackHover,
            focus: c.track,
            pressed: c.trackPressed,
            disabled: c.trackDisabled
          })
        },
        primary: {
          medium: states({
            rest: [225, 76, 52, 0.24],
            hover: [225, 76, 52, 0.32],
            focus: [225, 76, 52, 0.24],
            pressed: [225, 76, 52, 0.4],
            disabled: [224, 20, 80, 0.22]
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: transparent,
            hover: transparent,
            focus: transparent,
            pressed: transparent,
            disabled: transparent
          })
        },
        primary: {
          medium: states({
            rest: transparent,
            hover: transparent,
            focus: transparent,
            pressed: transparent,
            disabled: transparent
          })
        }
      }
    }
  }
} as const;

const activeTrackPalettes = {
  default: {
    light: {
      boxColor: {
        neutral: {
          medium: states({
            rest: c.primary,
            hover: c.primaryHover,
            focus: c.primary,
            pressed: c.primaryPressed,
            disabled: c.primaryDisabled
          })
        },
        primary: {
          medium: states({
            rest: c.violet,
            hover: c.violetHover,
            focus: c.violet,
            pressed: c.violetPressed,
            disabled: c.primaryDisabled
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: transparent,
            hover: transparent,
            focus: transparent,
            pressed: transparent,
            disabled: transparent
          })
        },
        primary: {
          medium: states({
            rest: transparent,
            hover: transparent,
            focus: transparent,
            pressed: transparent,
            disabled: transparent
          })
        }
      }
    }
  }
} as const;

const thumbPalettes = {
  default: {
    light: {
      boxColor: {
        neutral: {
          medium: states({
            rest: c.surface,
            hover: c.white,
            focus: c.white,
            pressed: [225, 76, 96, 1],
            disabled: [220, 14, 86, 1]
          })
        },
        primary: {
          medium: states({
            rest: c.surface,
            hover: c.white,
            focus: c.white,
            pressed: [260, 72, 95, 1],
            disabled: [224, 20, 86, 1]
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: c.primary,
            hover: c.primaryHover,
            focus: c.primary,
            pressed: c.primaryPressed,
            disabled: c.primaryDisabled
          })
        },
        primary: {
          medium: states({
            rest: c.violet,
            hover: c.violetHover,
            focus: c.violet,
            pressed: c.violetPressed,
            disabled: c.primaryDisabled
          })
        }
      }
    }
  }
} as const;

const valueIndicatorPalettes = {
  default: {
    light: {
      boxColor: {
        neutral: {
          medium: states({
            rest: c.primary,
            hover: c.primaryHover,
            focus: c.primary,
            pressed: c.primaryPressed,
            disabled: c.primaryDisabled
          })
        },
        primary: {
          medium: states({
            rest: c.violet,
            hover: c.violetHover,
            focus: c.violet,
            pressed: c.violetPressed,
            disabled: c.primaryDisabled
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: transparent,
            hover: transparent,
            focus: transparent,
            pressed: transparent,
            disabled: transparent
          })
        },
        primary: {
          medium: states({
            rest: transparent,
            hover: transparent,
            focus: transparent,
            pressed: transparent,
            disabled: transparent
          })
        }
      },
      textColor: {
        neutral: {
          medium: states({
            rest: c.white,
            hover: c.white,
            focus: c.white,
            pressed: c.white,
            disabled: c.white
          })
        },
        primary: {
          medium: states({
            rest: c.white,
            hover: c.white,
            focus: c.white,
            pressed: c.white,
            disabled: c.white
          })
        }
      }
    }
  }
} as const;

export function createSandbox2SliderSchema(): SliderComponent {
  return {
    options: {
      variant: 'standard',
      valueDisplay: 'tooltip',
      marks: 'none'
    },
    variants: {
      standard: {
        options: {
          mode: 'base'
        },
        modes: {
          base: {
            elements: {
              e1: { name: 'slider-root' },
              e2: {
                name: 'slider-field-label',
                decorations: { textFont: 'body', textWeight: 'medium' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: textPalettes
              },
              e3: {
                name: 'slider-value-summary',
                decorations: { textFont: 'body', textWeight: 'medium' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: textPalettes
              },
              e4: { name: 'slider-control-row' },
              e5: { name: 'slider-endpoint' },
              e6: {
                name: 'slider-endpoint-icon',
                scales: {
                  boxWidth: sizes.endpointIcon,
                  boxHeight: sizes.endpointIcon
                },
                palettes: iconPalettes
              },
              e7: {
                name: 'slider-endpoint-label',
                decorations: { textFont: 'body', textWeight: 'medium' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: textPalettes
              },
              e8: {
                name: 'slider-track',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxHeight: sizes.trackHeight,
                  borderRadius: {
                    rounded: sizes.trackHeight,
                    pill: sizes.trackHeight,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: trackPalettes
              },
              e9: {
                name: 'slider-active-track',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxHeight: sizes.trackHeight,
                  borderRadius: {
                    rounded: sizes.trackHeight,
                    pill: sizes.trackHeight,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: activeTrackPalettes
              },
              e10: {
                name: 'slider-thumb',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: sizes.thumb,
                  boxHeight: sizes.thumb,
                  borderRadius: {
                    rounded: sizes.thumb,
                    pill: sizes.thumb,
                    square: 0
                  },
                  borderWidth: 2
                },
                palettes: thumbPalettes
              },
              e11: {
                name: 'slider-value-indicator',
                decorations: { borderStyle: 'solid', textFont: 'body', textWeight: 'medium' },
                scales: {
                  boxHeight: sizes.indicatorHeight,
                  borderRadius: {
                    rounded: 6,
                    pill: 6,
                    square: 0
                  },
                  borderWidth: 0,
                  paddingLeft: sizes.indicatorPadding,
                  paddingRight: sizes.indicatorPadding,
                  paddingTop: 0,
                  paddingBottom: 0,
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: valueIndicatorPalettes
              },
              e12: {
                name: 'slider-mark',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: sizes.markWidth,
                  boxHeight: sizes.markHeight,
                  borderRadius: {
                    rounded: sizes.markWidth,
                    pill: sizes.markWidth,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: activeTrackPalettes
              },
              e13: {
                name: 'slider-mark-label',
                decorations: { textFont: 'body', textWeight: 'medium' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: textPalettes
              },
              e14: {
                name: 'slider-helper-text',
                decorations: { textFont: 'body', textWeight: 'normal' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: textPalettes
              }
            }
          }
        }
      }
    }
  };
}
