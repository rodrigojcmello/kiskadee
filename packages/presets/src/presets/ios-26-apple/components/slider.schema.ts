import { type Schema, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios26AppleSegmentName = 'default';
type SliderComponent = NonNullable<Schema<Ios26AppleSegmentName>['components']['slider']>;

type CreateIos26AppleSliderSchemaArgs = {
  c: PresetColorGetter<Ios26AppleSegmentName>;
  segmentNames: readonly Ios26AppleSegmentName[];
  transparent: readonly [number, number, number, number];
};

const iosSliderTrack = [0, 0, 0, 0.05] as const;
const iosSliderTrackDisabled = [0, 0, 0, 0.03] as const;
const iosSliderTick = [0, 0, 0, 0.25] as const;
const iosSliderOriginTick = [0, 0, 0, 1] as const;
const iosSliderThumb = [0, 0, 100, 0.96] as const;
const iosSliderThumbBorder = [0, 0, 100, 1] as const;
const iosSliderText = [0, 0, 0, 0.6] as const;
const iosSliderTooltipText = [0, 0, 100, 1] as const;
const iosSliderTooltipTextDisabled = [0, 0, 100, 0.6] as const;

const sizes = {
  labelText: {
    's:sm:1': 13,
    's:md:1': 17
  },
  labelLine: {
    's:sm:1': 16,
    's:md:1': 22
  },
  trackHeight: {
    's:sm:1': 6,
    's:md:1': 6
  },
  thumbWidth: {
    's:sm:1': 20,
    's:md:1': 38
  },
  thumbHeight: {
    's:sm:1': 16,
    's:md:1': 24
  },
  endpointIcon: {
    's:sm:1': 20,
    's:md:1': 32
  }
} as const;

const layout = {
  fieldGap: 12,
  endpointTrackGap: 12,
  endpointContentGap: 8,
  trackMinWidth: 100,
  markOffset: 7,
  helperOffset: 8
} as const;

export function createIos26AppleSliderSchema({
  c,
  segmentNames,
  transparent
}: CreateIos26AppleSliderSchemaArgs): SliderComponent {
  const tint = c('default', 'l', 'primary', 50);
  const tintHover = c('default', 'l', 'primary', 50, 84);
  const tintPressed = c('default', 'l', 'primary', 60);
  const disabledTint = c('default', 'l', 'primary', 50, 20);

  const textPalettes = buildBySegment(segmentNames, () => ({
    light: {
      textColor: {
        neutral: {
          medium: {
            rest: iosSliderText,
            disabled: withAlpha(iosSliderText, 30)
          }
        },
        primary: {
          medium: {
            rest: tint,
            hover: tintHover,
            focus: tint,
            pressed: tint,
            disabled: disabledTint
          }
        }
      }
    }
  }));

  const transparentBorder = buildBySegment(segmentNames, () => ({
    light: {
      borderColor: {
        neutral: { medium: { rest: transparent, disabled: transparent } },
        primary: { medium: { rest: transparent, disabled: transparent } }
      }
    }
  }));

  return {
    effects: {
      shadow: {
        e10: {
          kind: 'outer',
          states: {
            rest: 's:sm:1'
          }
        }
      }
    },
    options: {
      variant: 'standard',
      valueDisplay: 'none',
      marks: 'none',
      edgeMarks: 'include',
      markPlacement: 'below',
      markLabelPlacement: 'below',
      edgeMarkLabelPlacement: 'endpoints',
      edgeMarkLabelAlignment: 'inside',
      thumbEdgeBehavior: 'contain',
      activeTrackOrigin: 'min',
      originMark: 'auto'
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
                  marginLeft: 16
                },
                palettes: textPalettes
              },
              e4: {
                name: 'slider-control-row',
                scales: {
                  marginTop: layout.fieldGap
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
                palettes: textPalettes
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
                    rounded: 100,
                    pill: 100,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: iosSliderTrack,
                          disabled: iosSliderTrackDisabled
                        }
                      },
                      primary: {
                        medium: {
                          rest: iosSliderTrack,
                          disabled: iosSliderTrackDisabled
                        }
                      }
                    },
                    ...transparentBorder.default.light
                  }
                }))
              },
              e9: {
                name: 'slider-active-track',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxHeight: sizes.trackHeight,
                  borderRadius: {
                    rounded: 100,
                    pill: 100,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: tint,
                          hover: tintHover,
                          focus: tint,
                          pressed: tintPressed,
                          disabled: disabledTint
                        }
                      },
                      primary: {
                        medium: {
                          rest: tint,
                          hover: tintHover,
                          focus: tint,
                          pressed: tintPressed,
                          disabled: disabledTint
                        }
                      }
                    },
                    ...transparentBorder.default.light
                  }
                }))
              },
              e10: {
                name: 'slider-thumb',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: sizes.thumbWidth,
                  boxHeight: sizes.thumbHeight,
                  borderRadius: {
                    rounded: 100,
                    pill: 100,
                    square: 0
                  },
                  borderWidth: 1
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: { medium: { rest: iosSliderThumb, disabled: iosSliderThumb } },
                      primary: { medium: { rest: iosSliderThumb, disabled: iosSliderThumb } }
                    },
                    borderColor: {
                      neutral: {
                        medium: { rest: iosSliderThumbBorder, disabled: iosSliderThumbBorder }
                      },
                      primary: {
                        medium: { rest: iosSliderThumbBorder, disabled: iosSliderThumbBorder }
                      }
                    }
                  }
                }))
              },
              e11: {
                name: 'slider-thumb-inner',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: 0,
                  boxHeight: 0,
                  borderRadius: {
                    rounded: 0,
                    pill: 0,
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: { medium: { rest: transparent, disabled: transparent } },
                      primary: { medium: { rest: transparent, disabled: transparent } }
                    },
                    ...transparentBorder.default.light
                  }
                }))
              },
              e12: {
                name: 'slider-value-indicator',
                decorations: { borderStyle: 'solid', textFont: 'body', textWeight: 'medium' },
                scales: {
                  boxHeight: 28,
                  borderRadius: {
                    rounded: 14,
                    pill: 14,
                    square: 0
                  },
                  borderWidth: 0,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 0,
                  paddingBottom: 0,
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine,
                  marginBottom: 8
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: { medium: { rest: tint, disabled: disabledTint } },
                      primary: { medium: { rest: tint, disabled: disabledTint } }
                    },
                    borderColor: {
                      neutral: { medium: { rest: transparent, disabled: transparent } },
                      primary: { medium: { rest: transparent, disabled: transparent } }
                    },
                    textColor: {
                      neutral: {
                        medium: {
                          rest: iosSliderTooltipText,
                          disabled: iosSliderTooltipTextDisabled
                        }
                      },
                      primary: {
                        medium: {
                          rest: iosSliderTooltipText,
                          disabled: iosSliderTooltipTextDisabled
                        }
                      }
                    }
                  }
                }))
              },
              e13: {
                name: 'slider-mark',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: 2,
                  boxHeight: 2,
                  borderRadius: {
                    rounded: 10,
                    pill: 10,
                    square: 0
                  },
                  borderWidth: 0,
                  marginTop: layout.markOffset,
                  marginBottom: layout.markOffset
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: { rest: iosSliderTick, disabled: withAlpha(iosSliderTick, 30) }
                      },
                      primary: {
                        medium: { rest: iosSliderTick, disabled: withAlpha(iosSliderTick, 30) }
                      }
                    },
                    ...transparentBorder.default.light
                  }
                }))
              },
              e14: {
                name: 'slider-mark-label',
                decorations: { textFont: 'body', textWeight: 'medium' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine,
                  marginTop: layout.markOffset,
                  marginBottom: layout.markOffset
                },
                palettes: textPalettes
              },
              e15: {
                name: 'slider-helper-text',
                decorations: { textFont: 'body', textWeight: 'normal' },
                scales: {
                  textSize: sizes.labelText,
                  textHeight: sizes.labelLine,
                  marginTop: layout.helperOffset
                },
                palettes: textPalettes
              },
              e16: {
                name: 'slider-origin-mark',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: 2,
                  boxHeight: 4,
                  borderRadius: {
                    rounded: 10,
                    pill: 10,
                    square: 0
                  },
                  borderWidth: 0,
                  marginTop: layout.markOffset,
                  marginBottom: layout.markOffset
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: iosSliderOriginTick,
                          disabled: withAlpha(iosSliderOriginTick, 30)
                        }
                      },
                      primary: {
                        medium: {
                          rest: iosSliderOriginTick,
                          disabled: withAlpha(iosSliderOriginTick, 30)
                        }
                      }
                    },
                    ...transparentBorder.default.light
                  }
                }))
              }
            }
          }
        }
      }
    }
  };
}
