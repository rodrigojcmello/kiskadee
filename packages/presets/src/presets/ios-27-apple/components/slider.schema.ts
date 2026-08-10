import { type Schema, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios27AppleSegmentName = 'default';
type SliderComponent = NonNullable<Schema<Ios27AppleSegmentName>['components']['slider']>;

type CreateIos27AppleSliderSchemaArgs = {
  c: PresetColorGetter<Ios27AppleSegmentName>;
  segmentNames: readonly Ios27AppleSegmentName[];
  transparent: string;
};

const iosSliderTrack = '#0000000d' as const;
const iosSliderTrackDisabled = '#00000008' as const;
const iosSliderTick = '#00000040' as const;
const iosSliderOriginTick = '#000000' as const;
const iosSliderThumb = '#fffffff5' as const;
const iosSliderThumbBorder = '#ffffff' as const;
const iosSliderText = '#00000099' as const;
const iosSliderOptionalIndicator = '#0000004d' as const;
const iosSliderOptionalIndicatorDisabled = '#0000002e' as const;
const iosSliderTooltip = '#ffffff' as const;
const iosSliderTooltipDisabled = '#ffffff99' as const;
const iosSliderTooltipText = '#000000' as const;
const iosSliderTooltipTextDisabled = '#0000004d' as const;

const sizes = {
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
  thumbIcon: {
    's:sm:1': 10,
    's:md:1': 14
  },
  endpointIcon: {
    's:sm:1': 20,
    's:md:1': 32
  }
} as const;

const layout = {
  optionalIndicatorGap: 2,
  fieldGap: 12,
  endpointTrackGap: 12,
  endpointContentGap: 8,
  trackMinWidth: 100,
  markOffset: 7,
  markLabelReserve: {
    's:sm:1': 23,
    's:md:1': 29
  },
  tooltipLaneReserve: {
    's:sm:1': 16,
    's:md:1': 20
  },
  helperOffset: 8
} as const;

export function createIos27AppleSliderSchema({
  c,
  segmentNames,
  transparent
}: CreateIos27AppleSliderSchemaArgs): SliderComponent {
  const tint = c('default', 'l', 'primary', 50);
  const tintHover = c('default', 'l', 'primary', 50, 84);
  const tintPressed = c('default', 'l', 'primary', 60);
  const disabledTint = c('default', 'l', 'primary', 50, 20);

  const textPalettes = buildBySegment(segmentNames, () => ({
    light: {
      onSubtle: {
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
    }
  }));

  const optionalIndicatorPalettes = buildBySegment(segmentNames, () => ({
    light: {
      onSubtle: {
        textColor: {
          neutral: {
            medium: {
              rest: iosSliderOptionalIndicator,
              disabled: iosSliderOptionalIndicatorDisabled
            }
          }
        }
      }
    }
  }));

  const transparentBorder = buildBySegment(segmentNames, () => ({
    light: {
      onSubtle: {
        borderColor: {
          neutral: { medium: { rest: transparent, disabled: transparent } },
          primary: { medium: { rest: transparent, disabled: transparent } }
        }
      }
    }
  }));

  return {
    effects: {
      shadow: {
        e10: {
          kind: 'outer',
          states: {
            rest: 's:sm:2'
          }
        },
        e14: {
          kind: 'outer',
          states: {
            rest: 's:sm:3'
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
      edgeLabelPlacement: 'endpoints',
      edgeLabelAlignment: 'inside',
      thumbEdge: 'contain',
      fillOrigin: 'min',
      fillOriginMark: 'auto'
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
                typography: {
                  's:sm:1': 'label-small-strong',
                  's:md:1': 'label-medium'
                },
                palettes: textPalettes
              },
              e3: {
                name: 'slider-value-summary',
                typography: {
                  's:sm:1': 'label-small-strong',
                  's:md:1': 'label-medium'
                },
                scales: {
                  marginLeft: 16
                },
                palettes: textPalettes
              },
              e4: {
                name: 'slider-control-row',
                scales: {
                  boxHeight: sizes.thumbHeight,
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
                palettes: textPalettes
              },
              e7: {
                name: 'slider-endpoint-label',
                typography: {
                  's:sm:1': 'label-small-strong',
                  's:md:1': 'label-medium'
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
                    onSubtle: {
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
                      ...transparentBorder.default.light.onSubtle
                    }
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
                    onSubtle: {
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
                      ...transparentBorder.default.light.onSubtle
                    }
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
                    onSubtle: {
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
                    onSubtle: {
                      boxColor: {
                        neutral: { medium: { rest: transparent, disabled: transparent } },
                        primary: { medium: { rest: transparent, disabled: transparent } }
                      },
                      ...transparentBorder.default.light.onSubtle
                    }
                  }
                }))
              },
              e14: {
                name: 'slider-value-indicator',
                typography: {
                  's:sm:1': 'tooltip-small',
                  's:md:1': 'tooltip-medium'
                },
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxHeight: 28,
                  borderRadius: {
                    rounded: 14,
                    pill: 14,
                    square: 0
                  },
                  borderWidth: 0,
                  marginTop: layout.tooltipLaneReserve,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 0,
                  paddingBottom: 0
                },
                palettes: buildBySegment(segmentNames, () => ({
                  light: {
                    onSubtle: {
                      boxColor: {
                        neutral: {
                          medium: { rest: iosSliderTooltip, disabled: iosSliderTooltipDisabled }
                        },
                        primary: {
                          medium: { rest: iosSliderTooltip, disabled: iosSliderTooltipDisabled }
                        }
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
                  }
                }))
              },
              e15: {
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
                    onSubtle: {
                      boxColor: {
                        neutral: {
                          medium: { rest: iosSliderTick, disabled: withAlpha(iosSliderTick, 30) }
                        },
                        primary: {
                          medium: { rest: iosSliderTick, disabled: withAlpha(iosSliderTick, 30) }
                        }
                      },
                      ...transparentBorder.default.light.onSubtle
                    }
                  }
                }))
              },
              e16: {
                name: 'slider-mark-label',
                typography: {
                  's:sm:1': 'label-small-strong',
                  's:md:1': 'label-medium'
                },
                scales: {
                  marginTop: layout.markOffset,
                  marginBottom: layout.markOffset
                },
                palettes: textPalettes
              },
              e17: {
                name: 'slider-helper-text',
                typography: {
                  's:sm:1': 'label-small',
                  's:md:1': 'body-medium'
                },
                scales: {
                  marginTop: layout.helperOffset
                },
                palettes: textPalettes
              },
              e18: {
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
                    onSubtle: {
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
                      ...transparentBorder.default.light.onSubtle
                    }
                  }
                }))
              },
              e19: {
                name: 'slider-thumb-icon',
                scales: {
                  boxWidth: sizes.thumbIcon,
                  boxHeight: sizes.thumbIcon
                },
                palettes: textPalettes
              },
              e20: {
                name: 'slider-optional-indicator',
                typography: {
                  's:sm:1': 'caption-medium',
                  's:md:1': 'caption-medium'
                },
                scales: {
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
