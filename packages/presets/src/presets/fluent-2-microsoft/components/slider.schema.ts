import { type Color, primitive, type Schema } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

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

function withVivid<T extends { default: { light: object } }, V>(palette: T, onVivid: V) {
  return {
    ...palette,
    default: {
      ...palette.default,
      light: { ...palette.default.light, onVivid }
    }
  };
}

function createFluentSliderColors(c: Fluent2MicrosoftColorResolver) {
  const resolve = (locator: Parameters<Fluent2MicrosoftColorResolver['resolve']>[2]) =>
    c.resolve('default', 'l', locator);

  return {
    optionalIndicator: resolve(absoluteCap(primitive('black', 'v1'), 'dark', 30)),
    optionalIndicatorDisabled: resolve(absoluteCap(primitive('black', 'v1'), 'dark', 18)),
    transparent: resolve(absoluteCap(primitive('black', 'v1'), 'light', 0)),
    neutralForeground1: resolve(referenceColor('slider.neutral', 'vivid')),
    neutralStrokeAccessible: resolve(exactColor('slider.neutral', 50, 'component.slider')),
    inactiveRail: resolve(exactColor('slider.neutral', 26, 'component.slider')),
    inactiveRailPressed: resolve(exactColor('slider.neutral', 14, 'component.slider')),
    neutralBackground1: resolve(absoluteCap(primitive('black', 'v1'), 'light')),
    neutralStroke1: resolve(exactColor('slider.neutral', 10, 'component.slider')),
    neutralForegroundDisabled: resolve(exactColor('slider.neutral', 16, 'component.slider')),
    neutralStrokeDisabled: resolve(exactColor('slider.neutral', 7, 'component.slider')),
    compoundBrandRest: resolve(referenceColor('slider.primary', 'vivid')),
    compoundBrandHover: resolve(referenceColor('slider.primary', 'vivid', 1)),
    compoundBrandPressed: resolve(referenceColor('slider.primary', 'vivid', 2)),
    vividBrandRest: resolve(referenceColor('slider.primary', 'subtle', 10)),
    vividBrandHover: resolve(referenceColor('slider.primary', 'subtle', 12)),
    vividBrandPressed: resolve(referenceColor('slider.primary', 'subtle', 14)),
    subtleCardLowSurface: resolve(exactColor('card.neutral', 1, 'component.card')),
    vividPrimaryCardSurface: resolve(exactColor('slider.primary', 50, 'component.slider')),
    physicalBlack: resolve(absoluteCap(primitive('black', 'v1'), 'dark')),
    vividWhite: resolve(absoluteCap(primitive('black', 'v1'), 'light')),
    vividWhite35: resolve(absoluteCap(primitive('black', 'v1'), 'light', 35)),
    vividWhite38: resolve(absoluteCap(primitive('black', 'v1'), 'light', 38)),
    vividWhite20: resolve(absoluteCap(primitive('black', 'v1'), 'light', 20)),
    vividDark80: resolve(absoluteCap(primitive('black', 'v1'), 'dark', 80))
  } as const satisfies Record<string, Color>;
}

const sizes = {
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

function createSliderPalettes(fluent: ReturnType<typeof createFluentSliderColors>) {
  const textPalettes = {
    default: {
      light: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: states({
                rest: fluent.neutralForeground1,
                disabled: fluent.neutralForegroundDisabled
              })
            },
            primary: {
              medium: states({
                rest: fluent.neutralForeground1,
                disabled: fluent.neutralForegroundDisabled
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
                rest: fluent.optionalIndicator,
                disabled: fluent.optionalIndicatorDisabled
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
                rest: fluent.neutralStrokeAccessible,
                disabled: fluent.neutralForegroundDisabled
              })
            },
            primary: {
              medium: states({
                rest: fluent.neutralStrokeAccessible,
                disabled: fluent.neutralForegroundDisabled
              })
            }
          }
        }
      }
    }
  } as const;

  const railPalettes = {
    default: {
      light: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: states({
                rest: fluent.inactiveRail,
                hover: fluent.inactiveRail,
                focus: fluent.inactiveRail,
                pressed: fluent.inactiveRailPressed,
                disabled: fluent.transparent
              })
            },
            primary: {
              medium: states({
                rest: fluent.inactiveRail,
                hover: fluent.inactiveRail,
                focus: fluent.inactiveRail,
                pressed: fluent.inactiveRailPressed,
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
    }
  } as const;

  const activeTrackPalettes = {
    default: {
      light: {
        onSubtle: {
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
    }
  } as const;

  const thumbPalettes = {
    default: {
      light: {
        onSubtle: {
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
                rest: fluent.compoundBrandRest,
                hover: fluent.compoundBrandHover,
                focus: fluent.compoundBrandRest,
                pressed: fluent.compoundBrandPressed,
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
                rest: fluent.compoundBrandRest,
                hover: fluent.compoundBrandHover,
                focus: fluent.compoundBrandRest,
                pressed: fluent.compoundBrandPressed,
                disabled: fluent.neutralStrokeDisabled
              })
            }
          }
        }
      }
    }
  } as const;

  const thumbInnerPalettes = {
    default: {
      light: {
        onSubtle: {
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
                rest: fluent.subtleCardLowSurface,
                hover: fluent.subtleCardLowSurface,
                focus: fluent.subtleCardLowSurface,
                pressed: fluent.subtleCardLowSurface,
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
    }
  } as const;

  const thumbIconPalettes = {
    default: {
      light: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: states({
                rest: fluent.neutralBackground1,
                disabled: fluent.neutralBackground1
              })
            },
            primary: {
              medium: states({
                rest: fluent.compoundBrandRest,
                hover: fluent.compoundBrandHover,
                focus: fluent.compoundBrandRest,
                pressed: fluent.compoundBrandPressed,
                disabled: fluent.neutralBackground1
              })
            }
          }
        }
      }
    }
  } as const;

  const markPalettes = {
    default: {
      light: {
        onSubtle: {
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
    }
  } as const;

  const valueIndicatorPalettes = {
    default: {
      light: {
        onSubtle: {
          boxColor: {
            neutral: { medium: states({ rest: fluent.neutralForeground1 }) },
            primary: { medium: states({ rest: fluent.neutralForeground1 }) }
          },
          borderColor: activeTrackPalettes.default.light.onSubtle.borderColor,
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
    }
  } as const;

  const vivid = (neutral: Color, primary: Color, disabled: Color) => ({
    neutral: { medium: { rest: neutral, disabled: ref(disabled) } },
    primary: { medium: { rest: primary, disabled: ref(disabled) } }
  });
  const vividBrand = {
    rest: fluent.vividBrandRest,
    hover: ref(fluent.vividBrandHover),
    pressed: ref(fluent.vividBrandPressed),
    disabled: ref(fluent.vividWhite38)
  };
  const vividLight = {
    rest: fluent.vividWhite,
    disabled: ref(fluent.vividWhite38)
  };
  const vividPrimaryThumb = {
    rest: fluent.vividPrimaryCardSurface,
    disabled: ref(fluent.vividWhite38)
  };
  const vividRail = {
    rest: fluent.vividWhite35,
    disabled: ref(fluent.vividWhite20)
  };
  const vividTransparent = {
    rest: fluent.transparent,
    disabled: ref(fluent.transparent)
  };
  const vividThumb = {
    rest: fluent.neutralForeground1,
    disabled: ref(fluent.vividWhite20)
  };
  const vividThumbBorder = {
    rest: fluent.neutralForeground1,
    disabled: ref(fluent.vividWhite20)
  };
  return {
    textPalettes: withVivid(textPalettes, {
      textColor: vivid(fluent.vividWhite, fluent.vividWhite, fluent.vividWhite38)
    }),
    optionalIndicatorPalettes: withVivid(optionalIndicatorPalettes, {
      textColor: { neutral: { medium: vividLight } }
    }),
    iconPalettes: withVivid(iconPalettes, {
      textColor: vivid(fluent.vividWhite, fluent.vividWhite, fluent.vividWhite38)
    }),
    railPalettes: withVivid(railPalettes, {
      boxColor: { neutral: { medium: vividRail }, primary: { medium: vividRail } },
      borderColor: {
        neutral: { medium: vividTransparent },
        primary: { medium: vividTransparent }
      }
    }),
    activeTrackPalettes: withVivid(activeTrackPalettes, {
      boxColor: {
        neutral: { medium: vividBrand },
        primary: { medium: vividLight }
      },
      borderColor: {
        neutral: { medium: vividTransparent },
        primary: { medium: vividTransparent }
      }
    }),
    thumbPalettes: withVivid(thumbPalettes, {
      boxColor: {
        neutral: { medium: vividThumb },
        primary: { medium: vividLight }
      },
      borderColor: {
        neutral: { medium: vividThumbBorder },
        primary: { medium: vividTransparent }
      }
    }),
    thumbInnerPalettes: withVivid(thumbInnerPalettes, {
      boxColor: {
        neutral: { medium: vividBrand },
        primary: { medium: vividPrimaryThumb }
      },
      borderColor: {
        neutral: { medium: vividTransparent },
        primary: { medium: vividTransparent }
      }
    }),
    thumbIconPalettes: withVivid(thumbIconPalettes, {
      textColor: vivid(fluent.physicalBlack, fluent.vividWhite, fluent.vividWhite38)
    }),
    markPalettes: withVivid(markPalettes, {
      boxColor: vivid(fluent.vividWhite, fluent.vividDark80, fluent.vividWhite38),
      borderColor: {
        neutral: { medium: vividTransparent },
        primary: { medium: vividTransparent }
      }
    }),
    valueIndicatorPalettes: withVivid(valueIndicatorPalettes, {
      boxColor: {
        neutral: { medium: vividLight },
        primary: { medium: vividLight }
      },
      borderColor: {
        neutral: { medium: vividTransparent },
        primary: { medium: vividTransparent }
      },
      textColor: vivid(fluent.neutralForeground1, fluent.neutralForeground1, fluent.vividWhite38)
    })
  };
}

export function createFluent2MicrosoftSliderSchema({
  c
}: {
  c: Fluent2MicrosoftColorResolver;
}): SliderComponent {
  const palettes = createSliderPalettes(createFluentSliderColors(c));
  const {
    textPalettes,
    optionalIndicatorPalettes,
    iconPalettes,
    railPalettes,
    activeTrackPalettes,
    thumbPalettes,
    thumbInnerPalettes,
    thumbIconPalettes,
    markPalettes,
    valueIndicatorPalettes
  } = palettes;

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
      density: { regular: 's:md:1' },
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
                typography: {
                  's:sm:1': 'caption-medium',
                  's:md:1': 'body-medium'
                },
                palettes: textPalettes
              },
              e3: {
                name: 'slider-value-summary',
                typography: {
                  's:sm:1': 'caption-medium',
                  's:md:1': 'body-medium'
                },
                scales: {
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
                iconSize: {
                  's:sm:1': 's:sm:1',
                  's:md:1': 's:md:1'
                },
                palettes: iconPalettes
              },
              e7: {
                name: 'slider-endpoint-label',
                typography: {
                  's:sm:1': 'caption-medium',
                  's:md:1': 'body-medium'
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
              e12: {
                name: 'slider-thumb-with-icon',
                scales: {
                  boxWidth: { 's:sm:1': 14, 's:md:1': 30 },
                  boxHeight: { 's:sm:1': 14, 's:md:1': 30 }
                }
              },
              e13: {
                name: 'slider-thumb-inner-with-icon',
                scales: {
                  boxWidth: { 's:sm:1': 10, 's:md:1': 24 },
                  boxHeight: { 's:sm:1': 10, 's:md:1': 24 }
                }
              },
              e14: {
                name: 'slider-value-indicator',
                typography: {
                  's:sm:1': 'caption-medium',
                  's:md:1': 'body-medium'
                },
                decorations: { borderStyle: 'solid' },
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
                  paddingBottom: 0
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
                typography: {
                  's:sm:1': 'caption-medium',
                  's:md:1': 'body-medium'
                },
                scales: {
                  marginTop: layout.markLabelOffset,
                  marginBottom: layout.markLabelOffset
                },
                palettes: textPalettes
              },
              e17: {
                name: 'slider-helper-text',
                typography: {
                  's:sm:1': 'caption-medium',
                  's:md:1': 'body-medium'
                },
                scales: {
                  marginTop: layout.fieldGap
                },
                palettes: textPalettes
              },
              e19: {
                name: 'slider-thumb-icon',
                iconSize: {
                  's:sm:1': 's:sm:4',
                  's:md:1': 's:sm:1'
                },
                palettes: thumbIconPalettes
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
