import type { Color, Schema } from '@kiskadee/core';
import type { SandboxSegment } from '../sandbox.schema.ts';

type SliderComponent = NonNullable<NonNullable<Schema<SandboxSegment>['components']>['slider']>;

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

const transparent = '#00000000' as const;

const c = {
  optionalIndicator: '#0000004d',
  optionalIndicatorDisabled: '#0000002e',
  ink: '#0c0d13',
  inkSoft: '#70778f',
  inkMuted: '#878da1',
  inkDisabled: '#afb3c0',
  white: '#ffffff',
  surface: '#ffffff',
  track: '#e4e7ec',
  trackHover: '#dbdfe6',
  trackPressed: '#c9ced9',
  trackDisabled: '#e2e4e980',
  primary: '#2856e2',
  primaryHover: '#547ce8',
  primaryPressed: '#1131a7',
  primaryDisabled: '#c2c7d68a',
  violet: '#6124db',
  violetHover: '#7945e3',
  violetPressed: '#4b16b6'
} as const;

const sizes = {
  optionalIndicatorText: {
    's:sm:3': 12,
    's:sm:2': 12,
    's:sm:1': 12,
    's:md:1': 12,
    's:lg:1': 12
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
  thumbIcon: {
    's:sm:3': 10,
    's:sm:2': 11,
    's:sm:1': 12,
    's:md:1': 14,
    's:lg:1': 16
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
  mark: {
    's:sm:3': 6,
    's:sm:2': 7,
    's:sm:1': 8,
    's:md:1': 8,
    's:lg:1': 10
  }
} as const;

const layout = {
  optionalIndicatorGap: 2,
  headerSummaryGap: 16,
  fieldGap: 10,
  endpointTrackGap: 12,
  endpointContentGap: 8,
  trackMinWidth: 96,
  markLabelOffset: 8,
  markLabelReserve: {
    's:sm:3': 24,
    's:sm:2': 24,
    's:sm:1': 26,
    's:md:1': 28,
    's:lg:1': 32
  },
  tooltipLaneReserve: {
    's:sm:3': 18,
    's:sm:2': 20,
    's:sm:1': 22,
    's:md:1': 24,
    's:lg:1': 26
  }
} as const;

const textPalettes = {
  default: {
    light: {
      onSubtle: {
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
              rest: '#634899',
              hover: c.violet,
              focus: '#634899',
              pressed: c.violetPressed,
              disabled: c.primaryDisabled
            })
          }
        }
      }
    }
  }
} as const;

const optionalIndicatorPalettes = {
  default: {
    light: {
      onSubtle: {
        textColor: {
          neutral: {
            medium: states({
              rest: c.optionalIndicator,
              hover: c.optionalIndicator,
              focus: c.optionalIndicator,
              pressed: c.optionalIndicator,
              disabled: c.optionalIndicatorDisabled
            })
          }
        }
      }
    }
  }
} as const;

const iconPalettes = {
  default: {
    light: {
      onSubtle: {
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
  }
} as const;

const trackPalettes = {
  default: {
    light: {
      onSubtle: {
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
              rest: '#2856e23d',
              hover: '#2856e252',
              focus: '#2856e23d',
              pressed: '#2856e266',
              disabled: '#c2c7d638'
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
  }
} as const;

const activeTrackPalettes = {
  default: {
    light: {
      onSubtle: {
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
  }
} as const;

const thumbPalettes = {
  default: {
    light: {
      onSubtle: {
        boxColor: {
          neutral: {
            medium: states({
              rest: c.surface,
              hover: c.white,
              focus: c.white,
              pressed: '#edf1fd',
              disabled: '#d6dae0'
            })
          },
          primary: {
            medium: states({
              rest: c.surface,
              hover: c.white,
              focus: c.white,
              pressed: '#efe9fb',
              disabled: '#d4d8e2'
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
  }
} as const;

const valueIndicatorPalettes = {
  default: {
    light: {
      onSubtle: {
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
  }
} as const;

export function createSandboxSliderSchema(): SliderComponent {
  return {
    options: {
      variant: 'standard',
      valueDisplay: 'tooltip',
      marks: 'none',
      markLabelPlacement: 'adaptive',
      edgeLabelPlacement: 'adaptive'
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
                  textHeight: sizes.labelLine,
                  marginLeft: layout.headerSummaryGap
                },
                palettes: textPalettes
              },
              e4: {
                name: 'slider-control-row',
                scales: {
                  boxHeight: sizes.thumb,
                  marginTop: layout.fieldGap,
                  paddingTop: layout.markLabelReserve,
                  paddingBottom: layout.markLabelReserve
                }
              },
              e5: {
                name: 'slider-endpoint',
                scales: {
                  marginRight: layout.endpointTrackGap,
                  marginLeft: layout.endpointTrackGap,
                  paddingLeft: layout.endpointContentGap
                }
              },
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
                  boxWidth: layout.trackMinWidth,
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
                scales: {
                  boxWidth: sizes.thumb,
                  boxHeight: sizes.thumb,
                  borderRadius: {
                    rounded: sizes.thumb,
                    pill: sizes.thumb,
                    square: 0
                  }
                }
              },
              e11: {
                name: 'slider-thumb-inner',
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
              e14: {
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
                  marginTop: layout.tooltipLaneReserve,
                  paddingLeft: sizes.indicatorPadding,
                  paddingRight: sizes.indicatorPadding,
                  paddingTop: 0,
                  paddingBottom: 0,
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: valueIndicatorPalettes
              },
              e15: {
                name: 'slider-mark',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: sizes.mark,
                  boxHeight: sizes.mark,
                  borderRadius: {
                    rounded: sizes.mark,
                    pill: sizes.mark,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: activeTrackPalettes
              },
              e16: {
                name: 'slider-mark-label',
                decorations: { textFont: 'body', textWeight: 'medium' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine,
                  marginTop: layout.markLabelOffset,
                  marginBottom: layout.markLabelOffset
                },
                palettes: textPalettes
              },
              e17: {
                name: 'slider-helper-text',
                decorations: { textFont: 'body', textWeight: 'normal' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine,
                  marginTop: layout.fieldGap
                },
                palettes: textPalettes
              },
              e19: {
                name: 'slider-thumb-icon',
                scales: {
                  boxWidth: sizes.thumbIcon,
                  boxHeight: sizes.thumbIcon
                },
                palettes: iconPalettes
              },
              e20: {
                name: 'slider-optional-indicator',
                scales: {
                  textSize: sizes.optionalIndicatorText,
                  marginLeft: layout.optionalIndicatorGap
                },
                palettes: optionalIndicatorPalettes
              }
            }
          }
        }
      }
    }
  };
}
