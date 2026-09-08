import {
  type InteractionStateColorMap,
  type Schema,
  type SolidColor,
  withAlpha
} from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios27AppleSegmentName = 'default';
type SliderComponent = NonNullable<Schema<Ios27AppleSegmentName>['components']['slider']>;

type CreateIos27AppleSliderSchemaArgs = {
  c: PresetColorGetter<Ios27AppleSegmentName>;
  segmentNames: readonly Ios27AppleSegmentName[];
  transparent: string;
};

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
  type Theme = 'light' | 'dark' | 'darker';
  type Slot =
    | 'text'
    | 'secondary'
    | 'optional'
    | 'track'
    | 'fill'
    | 'thumb'
    | 'empty'
    | 'tooltip'
    | 'mark'
    | 'origin'
    | 'thumbIcon';
  type IntentColors = Record<'neutral' | 'primary', { medium: InteractionStateColorMap }>;
  const createContext = (
    segment: Ios27AppleSegmentName,
    theme: Theme,
    vivid: boolean,
    slot: Slot
  ): { textColor?: IntentColors; boxColor?: IntentColors; borderColor?: IntentColors } => {
    const scale = theme === 'light' ? 'l' : 'd';
    const white = c(segment, 'l', 'neutral', 0);
    const primaryLabel = vivid ? white : c(segment, scale, 'neutral', 100);
    const secondaryLabel = vivid
      ? withAlpha(white, 85)
      : c(segment, scale, 'neutral', theme === 'light' ? 70 : 95, theme === 'light' ? 60 : 70);
    const tertiaryLabel = vivid
      ? withAlpha(white, 50)
      : c(segment, scale, 'neutral', theme === 'light' ? 70 : 95, 30);
    const state = (rest: SolidColor, disabled?: SolidColor) => ({
      rest,
      ...(disabled === undefined || disabled === rest ? {} : { disabled: { ref: disabled } })
    });
    const both = <T>(value: T) => ({ neutral: { medium: value }, primary: { medium: value } });
    const borderColor = both({ rest: transparent });
    const text = (rest: SolidColor, disabled: SolidColor) => ({
      textColor: both(state(rest, disabled))
    });
    if (slot === 'text') return text(primaryLabel, tertiaryLabel);
    if (slot === 'secondary') return text(secondaryLabel, tertiaryLabel);
    if (slot === 'optional')
      return text(
        tertiaryLabel,
        vivid ? withAlpha(white, 30) : c(segment, scale, 'neutral', theme === 'light' ? 70 : 95, 15)
      );
    if (slot === 'thumbIcon')
      return text(c(segment, 'l', 'neutral', 70), c(segment, 'l', 'neutral', 70, 50));
    if (slot === 'tooltip')
      return {
        boxColor: both(state(white, withAlpha(white, 50))),
        borderColor,
        ...text(c(segment, 'l', 'neutral', 100), c(segment, 'l', 'neutral', 100, 30))
      };
    let rest: SolidColor;
    let disabled: SolidColor | undefined;
    if (slot === 'track') {
      rest = vivid
        ? withAlpha(white, 30)
        : c(segment, scale, 'neutral', theme === 'light' ? 35 : 55, theme === 'light' ? 20 : 36);
      disabled = vivid
        ? withAlpha(white, 15)
        : c(segment, scale, 'neutral', theme === 'light' ? 35 : 55, theme === 'light' ? 10 : 18);
    } else if (slot === 'fill') {
      rest = vivid ? white : c.ref(segment, scale, 'slider.primary', 'vivid');
      disabled = withAlpha(rest, 50);
    } else if (slot === 'thumb') {
      rest = white;
      disabled = withAlpha(white, 50);
    } else if (slot === 'mark') {
      rest = vivid
        ? withAlpha(white, 60)
        : c(segment, scale, 'neutral', theme === 'light' ? 70 : 95, theme === 'light' ? 18 : 16);
      disabled = vivid
        ? withAlpha(white, 30)
        : c(segment, scale, 'neutral', theme === 'light' ? 70 : 95, theme === 'light' ? 9 : 8);
    } else if (slot === 'origin') {
      rest = primaryLabel;
      disabled = tertiaryLabel;
    } else {
      rest = transparent;
    }
    return { boxColor: both(state(rest, disabled)), borderColor };
  };
  const palettes = (slot: Slot) =>
    buildBySegment(segmentNames, (segment) => ({
      light: {
        onSubtle: createContext(segment, 'light', false, slot),
        onVivid: createContext(segment, 'light', true, slot)
      },
      dark: {
        onSubtle: createContext(segment, 'dark', false, slot),
        onVivid: createContext(segment, 'dark', true, slot)
      },
      darker: {
        onSubtle: createContext(segment, 'darker', false, slot),
        onVivid: createContext(segment, 'darker', true, slot)
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
                palettes: palettes('text')
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
                palettes: palettes('text')
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
                iconSize: {
                  's:sm:1': 's:md:1',
                  's:md:1': 's:lg:2'
                },
                palettes: palettes('secondary')
              },
              e7: {
                name: 'slider-endpoint-label',
                typography: {
                  's:sm:1': 'label-small-strong',
                  's:md:1': 'label-medium'
                },
                palettes: palettes('secondary')
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
                palettes: palettes('track')
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
                palettes: palettes('fill')
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
                  borderWidth: 0
                },
                palettes: palettes('thumb')
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
                palettes: palettes('empty')
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
                palettes: palettes('tooltip')
              },
              e15: {
                name: 'slider-mark',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: 4,
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
                palettes: palettes('mark')
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
                palettes: palettes('text')
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
                palettes: palettes('secondary')
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
                palettes: palettes('origin')
              },
              e19: {
                name: 'slider-thumb-icon',
                iconSize: {
                  's:sm:1': 's:sm:4',
                  's:md:1': 's:sm:2'
                },
                palettes: palettes('thumbIcon')
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
                palettes: palettes('optional')
              }
            }
          }
        }
      }
    }
  };
}
