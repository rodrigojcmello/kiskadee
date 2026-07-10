import type { Color, Schema } from '@kiskadee/core';

type SliderComponent = NonNullable<NonNullable<Schema<never>['components']>['slider']>;

function ref<T>(value: T): { ref: T } {
  return { ref: value };
}

function states(colors: {
  rest: Color;
  hover?: Color;
  focus?: Color;
  pressed?: Color;
  disabled?: Color;
}) {
  return {
    rest: colors.rest,
    hover: ref(colors.hover ?? colors.rest),
    focus: ref(colors.focus ?? colors.rest),
    pressed: ref(colors.pressed ?? colors.rest),
    disabled: ref(colors.disabled ?? colors.rest)
  };
}

const fluent = {
  optionalIndicator: '#0000004D',
  optionalIndicatorDisabled: '#0000002E',
  transparent: '#FFFFFF00',
  neutralForeground1: '#242424',
  neutralStrokeAccessible: '#5D616B',
  neutralBackground1: '#FFFFFF',
  neutralStroke1: '#CCD1DD',
  neutralForegroundDisabled: '#B9BDC9',
  neutralStrokeDisabled: '#DBE0EC',
  compoundBrandRest: '#0064B4',
  compoundBrandHover: '#0055A4',
  compoundBrandPressed: '#004694'
} as const satisfies Record<string, Color>;

const sizes = {
  optionalIndicatorText: {
    's:sm:1': 12,
    's:md:1': 12
  },
  labelText: {
    's:sm:1': 12,
    's:md:1': 14
  },
  labelLine: {
    's:sm:1': 16,
    's:md:1': 20
  },
  trackHeight: {
    's:sm:1': 2,
    's:md:1': 4
  },
  thumb: {
    's:sm:1': 14,
    's:md:1': 18
  },
  thumbInner: {
    's:sm:1': 10,
    's:md:1': 12
  },
  thumbIcon: {
    's:sm:1': 8,
    's:md:1': 10
  },
  thumbBorder: {
    's:sm:1': 1,
    's:md:1': 1
  },
  endpointIcon: {
    's:sm:1': 16,
    's:md:1': 20
  },
  indicatorHeight: {
    's:sm:1': 24,
    's:md:1': 28
  },
  indicatorPadding: {
    's:sm:1': 8,
    's:md:1': 10
  },
  markWidth: {
    's:sm:1': 1,
    's:md:1': 1
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
    's:sm:1': 24,
    's:md:1': 28
  },
  tooltipLaneReserve: {
    's:sm:1': 18,
    's:md:1': 20
  }
} as const;

const textPalettes = {
  default: {
    light: {
      textColor: {
        neutral: {
          medium: states({
            rest: fluent.neutralForeground1,
            disabled: fluent.neutralForegroundDisabled
          })
        },
        primary: {
          medium: states({
            rest: fluent.compoundBrandRest,
            hover: fluent.compoundBrandHover,
            focus: fluent.compoundBrandRest,
            pressed: fluent.compoundBrandPressed,
            disabled: fluent.neutralForegroundDisabled
          })
        }
      }
    }
  }
} as const;

const optionalIndicatorPalettes = {
  default: {
    light: {
      textColor: {
        neutral: {
          medium: states({
            rest: fluent.optionalIndicator,
            disabled: fluent.optionalIndicatorDisabled
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
            rest: fluent.neutralStrokeAccessible,
            disabled: fluent.neutralForegroundDisabled
          })
        },
        primary: {
          medium: states({
            rest: fluent.compoundBrandRest,
            hover: fluent.compoundBrandHover,
            focus: fluent.compoundBrandRest,
            pressed: fluent.compoundBrandPressed,
            disabled: fluent.neutralForegroundDisabled
          })
        }
      }
    }
  }
} as const;

const railPalettes = {
  default: {
    light: {
      boxColor: {
        neutral: {
          medium: states({
            rest: fluent.neutralStrokeAccessible,
            hover: fluent.neutralStrokeAccessible,
            focus: fluent.neutralStrokeAccessible,
            pressed: fluent.neutralStrokeAccessible,
            disabled: fluent.transparent
          })
        },
        primary: {
          medium: states({
            rest: fluent.neutralStrokeAccessible,
            hover: fluent.neutralStrokeAccessible,
            focus: fluent.neutralStrokeAccessible,
            pressed: fluent.neutralStrokeAccessible,
            disabled: fluent.transparent
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
          })
        },
        primary: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
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
            rest: fluent.compoundBrandRest,
            hover: fluent.compoundBrandHover,
            focus: fluent.compoundBrandRest,
            pressed: fluent.compoundBrandPressed,
            disabled: fluent.neutralForegroundDisabled
          })
        },
        primary: {
          medium: states({
            rest: fluent.compoundBrandRest,
            hover: fluent.compoundBrandHover,
            focus: fluent.compoundBrandRest,
            pressed: fluent.compoundBrandPressed,
            disabled: fluent.neutralForegroundDisabled
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
          })
        },
        primary: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
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
            rest: fluent.neutralBackground1,
            hover: fluent.neutralBackground1,
            focus: fluent.neutralBackground1,
            pressed: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        },
        primary: {
          medium: states({
            rest: fluent.neutralBackground1,
            hover: fluent.neutralBackground1,
            focus: fluent.neutralBackground1,
            pressed: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: fluent.neutralStroke1,
            disabled: fluent.neutralStrokeDisabled
          })
        },
        primary: {
          medium: states({
            rest: fluent.neutralStroke1,
            disabled: fluent.neutralStrokeDisabled
          })
        }
      }
    }
  }
} as const;

const thumbInnerPalettes = {
  default: {
    light: {
      boxColor: {
        neutral: {
          medium: states({
            rest: fluent.compoundBrandRest,
            hover: fluent.compoundBrandHover,
            focus: fluent.compoundBrandRest,
            pressed: fluent.compoundBrandPressed,
            disabled: fluent.neutralForegroundDisabled
          })
        },
        primary: {
          medium: states({
            rest: fluent.compoundBrandRest,
            hover: fluent.compoundBrandHover,
            focus: fluent.compoundBrandRest,
            pressed: fluent.compoundBrandPressed,
            disabled: fluent.neutralForegroundDisabled
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
          })
        },
        primary: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
          })
        }
      }
    }
  }
} as const;

const thumbIconPalettes = {
  default: {
    light: {
      textColor: {
        neutral: {
          medium: states({
            rest: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        },
        primary: {
          medium: states({
            rest: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        }
      }
    }
  }
} as const;

const markPalettes = {
  default: {
    light: {
      boxColor: {
        neutral: {
          medium: states({
            rest: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        },
        primary: {
          medium: states({
            rest: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        }
      },
      borderColor: {
        neutral: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
          })
        },
        primary: {
          medium: states({
            rest: fluent.transparent,
            disabled: fluent.transparent
          })
        }
      }
    }
  }
} as const;

const valueIndicatorPalettes = {
  default: {
    light: {
      boxColor: activeTrackPalettes.default.light.boxColor,
      borderColor: activeTrackPalettes.default.light.borderColor,
      textColor: {
        neutral: {
          medium: states({
            rest: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        },
        primary: {
          medium: states({
            rest: fluent.neutralBackground1,
            disabled: fluent.neutralBackground1
          })
        }
      }
    }
  }
} as const;

export function createFluent2MicrosoftSliderSchema(): SliderComponent {
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
      variant: 'standard',
      valueDisplay: 'none',
      marks: 'none',
      edgeMarks: 'exclude',
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
                decorations: { textFont: 'body', textWeight: 'normal' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine
                },
                palettes: textPalettes
              },
              e3: {
                name: 'slider-value-summary',
                decorations: { textFont: 'body', textWeight: 'normal' },
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
                decorations: { textFont: 'body', textWeight: 'normal' },
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
                    rounded: 2,
                    pill: 2,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: railPalettes
              },
              e9: {
                name: 'slider-active-track',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxHeight: sizes.trackHeight,
                  borderRadius: {
                    rounded: 2,
                    pill: 2,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: activeTrackPalettes
              },
              e10: {
                name: 'slider-thumb',
                decorations: { borderStyle: 'solid' },
                effects: {
                  activationFeedback: true
                },
                scales: {
                  boxWidth: sizes.thumb,
                  boxHeight: sizes.thumb,
                  borderRadius: {
                    rounded: sizes.thumb,
                    pill: sizes.thumb,
                    square: 0
                  },
                  borderWidth: sizes.thumbBorder
                },
                palettes: thumbPalettes
              },
              e11: {
                name: 'slider-thumb-inner',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: sizes.thumbInner,
                  boxHeight: sizes.thumbInner,
                  borderRadius: {
                    rounded: sizes.thumbInner,
                    pill: sizes.thumbInner,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: thumbInnerPalettes
              },
              e14: {
                name: 'slider-value-indicator',
                decorations: { borderStyle: 'solid', textFont: 'body', textWeight: 'normal' },
                scales: {
                  boxHeight: sizes.indicatorHeight,
                  borderRadius: {
                    rounded: 4,
                    pill: 4,
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
                  boxWidth: sizes.markWidth,
                  boxHeight: sizes.trackHeight,
                  borderRadius: {
                    rounded: 0,
                    pill: 0,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: markPalettes
              },
              e16: {
                name: 'slider-mark-label',
                decorations: { textFont: 'body', textWeight: 'normal' },
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
                palettes: thumbIconPalettes
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
