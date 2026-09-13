import type { Color, Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SliderComponent = NonNullable<NonNullable<Schema<never>['components']>['slider']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';
type SurfaceContext = 'onSubtle' | 'onVivid';
type SliderIntent = 'neutral' | 'primary';

type CreateMaterial3GoogleSliderSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
};

type StateColors = {
  rest: Color;
  hover?: Color;
  focus?: Color;
  pressed?: Color;
  disabled?: Color;
};

function ref(color: Color): { ref: Color } {
  return { ref: color };
}

function states(colors: StateColors) {
  return {
    rest: colors.rest,
    ...(colors.hover === undefined || colors.hover === colors.rest
      ? {}
      : { hover: ref(colors.hover) }),
    ...(colors.focus === undefined || colors.focus === colors.rest
      ? {}
      : { focus: ref(colors.focus) }),
    ...(colors.pressed === undefined || colors.pressed === colors.rest
      ? {}
      : { pressed: ref(colors.pressed) }),
    ...(colors.disabled === undefined ? {} : { disabled: ref(colors.disabled) })
  };
}

function intentMap<T>(factory: (intent: SliderIntent) => T) {
  return {
    neutral: factory('neutral'),
    primary: factory('primary')
  };
}

function createSliderPalettes({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleSliderSchemaArgs) {
  const createColors = (
    segment: Material3GoogleSegmentName,
    theme: ThemeName,
    surface: SurfaceContext,
    intent: SliderIntent
  ) => {
    const track: ThemeShortcut = theme === 'light' ? 'l' : 'd';
    const onVivid = surface === 'onVivid';
    const role = intent === 'neutral' ? 'slider.neutral' : 'slider.primary';

    const physical = (polarity: 'light' | 'dark', alpha?: number) =>
      c(segment, 'l', 'primitive.black.v1', polarity === 'light' ? 0 : 100, alpha);
    const family = (reference: 'subtle' | 'medium' | 'vivid', offset = 0, alpha?: number) =>
      c.ref(segment, onVivid ? 'l' : track, role, reference, offset, alpha);
    const neutral = (reference: 'subtle' | 'medium' | 'vivid', offset = 0, alpha?: number) =>
      c.ref(segment, onVivid ? 'l' : track, 'slider.neutral', reference, offset, alpha);

    // The dark chromatic reference needs a positive offset to keep the active
    // rail readable against the dark subtle rail; neutral vivid is already a
    // light endpoint and must stay on its public grid position.
    const darkActiveOffset = !onVivid && intent === 'primary' ? 6 : 0;
    const darkHoverOffset = !onVivid && intent === 'primary' ? 8 : 0;
    const darkPressedOffset = !onVivid && intent === 'primary' ? 4 : 0;
    const active = family('vivid', theme === 'light' ? 0 : darkActiveOffset);
    const activeHover = family('vivid', theme === 'light' ? 1 : darkHoverOffset);
    const activePressed = family('vivid', theme === 'light' ? 2 : darkPressedOffset);
    const rail = family('subtle');
    const marks = family('medium');
    const disabledPolarity = onVivid || theme === 'dark' ? 'light' : 'dark';
    const disabledInk = physical(disabledPolarity, 38);
    const disabledRail = physical(disabledPolarity, 10);
    const disabledBorder = physical(disabledPolarity, 12);
    const text = onVivid ? physical('light') : neutral('vivid');
    const disabledText = onVivid ? physical('light', 38) : neutral('vivid', 0, 38);
    const indicator = onVivid ? active : theme === 'dark' ? neutral('subtle') : neutral('vivid');
    const indicatorText = physical('light');

    return {
      text: states({
        rest: text,
        disabled: disabledText
      }),
      icon: states({
        rest: onVivid ? physical('light') : marks,
        hover: onVivid ? physical('light') : activeHover,
        pressed: onVivid ? physical('light') : activePressed,
        disabled: disabledText
      }),
      rail: {
        boxColor: states({
          rest: onVivid ? physical('light', 24) : rail,
          hover: onVivid ? physical('light', 32) : rail,
          pressed: onVivid ? physical('light', 40) : rail,
          disabled: disabledRail
        }),
        borderColor: states({
          rest: transparent,
          disabled: disabledBorder
        })
      },
      activeTrack: {
        boxColor: states({
          rest: onVivid ? family('subtle') : active,
          hover: onVivid ? family('subtle', -1) : activeHover,
          pressed: onVivid ? family('subtle', -2) : activePressed,
          disabled: disabledInk
        }),
        borderColor: { rest: transparent }
      },
      thumb: {
        boxColor: states({
          rest: onVivid ? physical('light') : active,
          hover: onVivid ? physical('light') : activeHover,
          pressed: onVivid ? physical('light') : activePressed,
          disabled: onVivid ? physical('light', 38) : disabledInk
        }),
        borderColor: states({
          rest: transparent,
          disabled: disabledBorder
        })
      },
      thumbInner: {
        boxColor: states({
          rest: onVivid ? active : physical('light'),
          hover: onVivid ? activeHover : physical('light'),
          pressed: onVivid ? activePressed : physical('light'),
          disabled: disabledInk
        }),
        borderColor: { rest: transparent }
      },
      thumbIcon: states({
        rest: onVivid ? active : physical('light'),
        hover: onVivid ? activeHover : physical('light'),
        pressed: onVivid ? activePressed : physical('light'),
        disabled: disabledText
      }),
      mark: {
        boxColor: states({ rest: marks, disabled: disabledInk }),
        borderColor: { rest: transparent }
      },
      indicator: {
        boxColor: states({ rest: indicator, disabled: disabledInk }),
        borderColor: { rest: transparent },
        textColor: states({ rest: indicatorText, disabled: disabledText })
      }
    };
  };

  const elementPalettes = (
    element:
      | 'text'
      | 'icon'
      | 'rail'
      | 'activeTrack'
      | 'thumb'
      | 'thumbInner'
      | 'thumbIcon'
      | 'mark'
      | 'indicator'
  ) =>
    buildBySegment(segmentNames, (segment) => {
      const createSurface = (theme: ThemeName, surface: SurfaceContext) => {
        const byIntent = intentMap((intent) => createColors(segment, theme, surface, intent));
        if (
          element === 'rail' ||
          element === 'activeTrack' ||
          element === 'thumb' ||
          element === 'thumbInner' ||
          element === 'mark'
        ) {
          return {
            boxColor: {
              neutral: { medium: byIntent.neutral[element].boxColor },
              primary: { medium: byIntent.primary[element].boxColor }
            },
            borderColor: {
              neutral: { medium: byIntent.neutral[element].borderColor },
              primary: { medium: byIntent.primary[element].borderColor }
            }
          };
        }

        if (element === 'indicator') {
          return {
            boxColor: {
              neutral: { medium: byIntent.neutral.indicator.boxColor },
              primary: { medium: byIntent.primary.indicator.boxColor }
            },
            borderColor: {
              neutral: { medium: byIntent.neutral.indicator.borderColor },
              primary: { medium: byIntent.primary.indicator.borderColor }
            },
            textColor: {
              neutral: { medium: byIntent.neutral.indicator.textColor },
              primary: { medium: byIntent.primary.indicator.textColor }
            }
          };
        }

        const property = element === 'text' ? 'text' : element;
        return {
          textColor: {
            neutral: { medium: byIntent.neutral[property] },
            primary: { medium: byIntent.primary[property] }
          }
        };
      };

      return {
        light: {
          onSubtle: createSurface('light', 'onSubtle'),
          onVivid: createSurface('light', 'onVivid')
        },
        dark: {
          onSubtle: createSurface('dark', 'onSubtle'),
          onVivid: createSurface('dark', 'onVivid')
        }
      };
    });

  return {
    text: elementPalettes('text'),
    icon: elementPalettes('icon'),
    rail: elementPalettes('rail'),
    activeTrack: elementPalettes('activeTrack'),
    thumb: elementPalettes('thumb'),
    thumbInner: elementPalettes('thumbInner'),
    thumbIcon: elementPalettes('thumbIcon'),
    mark: elementPalettes('mark'),
    indicator: elementPalettes('indicator')
  };
}

const sizes = {
  trackHeight: { 's:sm:1': 24, 's:md:1': 40 },
  controlHeight: { 's:sm:1': 44, 's:md:1': 52 },
  thumbWidth: { 's:sm:1': 4, 's:md:1': 4 },
  thumbIcon: { 's:sm:1': 20, 's:md:1': 24 },
  indicatorHeight: { 's:sm:1': 44, 's:md:1': 44 },
  indicatorPadding: { 's:sm:1': 12, 's:md:1': 12 },
  markSize: { 's:sm:1': 4, 's:md:1': 4 }
} as const;

const layout = {
  optionalIndicatorGap: 2,
  headerSummaryGap: 16,
  fieldGap: 12,
  endpointTrackGap: 12,
  endpointContentGap: 8,
  trackMinWidth: 100,
  markLabelOffset: 8,
  markLabelReserve: { 's:sm:1': 24, 's:md:1': 40 },
  tooltipLaneReserve: { 's:sm:1': 44, 's:md:1': 44 }
} as const;

export function createMaterial3GoogleSliderSchema(
  args: CreateMaterial3GoogleSliderSchemaArgs
): SliderComponent {
  const palettes = createSliderPalettes(args);
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
            byEmphasis: { low: 'vivid' }
          }
        },
        profiles: { halo: { size: 8 } }
      }
    },
    options: {
      density: { compact: 's:sm:1', spacious: 's:md:1' },
      variant: 'standard',
      valueDisplay: 'none',
      marks: 'none',
      edgeMarks: 'exclude',
      markPlacement: 'track',
      markLabelPlacement: 'adaptive',
      edgeLabelPlacement: 'adaptive',
      edgeLabelAlignment: 'inside',
      thumbEdge: 'contain',
      fillOrigin: 'min',
      fillOriginMark: 'auto'
    },
    variants: {
      standard: {
        options: { mode: 'base' },
        modes: {
          base: {
            elements: {
              e1: { name: 'slider-root' },
              e2: {
                name: 'slider-field-label',
                typography: { 's:sm:1': 'body-small', 's:md:1': 'body-medium' },
                palettes: palettes.text
              },
              e3: {
                name: 'slider-value-summary',
                typography: { 's:sm:1': 'body-small', 's:md:1': 'body-medium' },
                scales: { marginLeft: layout.headerSummaryGap },
                palettes: palettes.text
              },
              e4: {
                name: 'slider-control-row',
                scales: {
                  boxHeight: sizes.controlHeight,
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
                iconSize: { 's:sm:1': 's:md:1', 's:md:1': 's:lg:1' },
                palettes: palettes.icon
              },
              e7: {
                name: 'slider-endpoint-label',
                typography: { 's:sm:1': 'body-small', 's:md:1': 'body-medium' },
                palettes: palettes.text
              },
              e8: {
                name: 'slider-track',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: layout.trackMinWidth,
                  boxHeight: sizes.trackHeight,
                  borderRadius: {
                    rounded: { 's:sm:1': 12, 's:md:1': 20 },
                    pill: { 's:sm:1': 12, 's:md:1': 20 },
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: palettes.rail
              },
              e9: {
                name: 'slider-active-track',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxHeight: sizes.trackHeight,
                  borderRadius: {
                    rounded: { 's:sm:1': 12, 's:md:1': 20 },
                    pill: { 's:sm:1': 12, 's:md:1': 20 },
                    square: 0
                  },
                  borderWidth: 0
                },
                palettes: palettes.activeTrack
              },
              e10: {
                name: 'slider-thumb',
                decorations: { borderStyle: 'solid' },
                effects: { activationFeedback: true },
                scales: {
                  boxWidth: sizes.thumbWidth,
                  boxHeight: sizes.controlHeight,
                  borderRadius: { rounded: 2, pill: 2, square: 0 },
                  borderWidth: 0
                },
                palettes: palettes.thumb
              },
              e11: { name: 'slider-thumb-inner' },
              e12: {
                name: 'slider-thumb-with-icon',
                scales: {
                  boxWidth: { 's:sm:1': 24, 's:md:1': 40 },
                  boxHeight: sizes.controlHeight
                }
              },
              e13: {
                name: 'slider-thumb-inner-with-icon',
                scales: {
                  boxWidth: { 's:sm:1': 20, 's:md:1': 32 },
                  boxHeight: sizes.controlHeight
                }
              },
              e14: {
                name: 'slider-value-indicator',
                typography: { 's:sm:1': 'body-medium', 's:md:1': 'body-medium' },
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxHeight: sizes.indicatorHeight,
                  borderRadius: { rounded: 1000, pill: 1000, square: 0 },
                  borderWidth: 0,
                  marginTop: layout.tooltipLaneReserve,
                  paddingLeft: sizes.indicatorPadding,
                  paddingRight: sizes.indicatorPadding,
                  paddingTop: 0,
                  paddingBottom: 0
                },
                palettes: palettes.indicator
              },
              e15: {
                name: 'slider-mark',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: sizes.markSize,
                  boxHeight: sizes.markSize,
                  borderRadius: { rounded: 2, pill: 2, square: 0 },
                  borderWidth: 0
                },
                palettes: palettes.mark
              },
              e16: {
                name: 'slider-mark-label',
                typography: { 's:sm:1': 'body-small', 's:md:1': 'body-medium' },
                scales: {
                  marginTop: layout.markLabelOffset,
                  marginBottom: layout.markLabelOffset
                },
                palettes: palettes.text
              },
              e17: {
                name: 'slider-helper-text',
                typography: { 's:sm:1': 'body-small', 's:md:1': 'body-medium' },
                scales: { marginTop: layout.fieldGap },
                palettes: palettes.text
              },
              e18: {
                name: 'slider-origin-mark',
                decorations: { borderStyle: 'solid' },
                scales: {
                  boxWidth: { 's:sm:1': 2, 's:md:1': 2 },
                  boxHeight: sizes.markSize,
                  borderRadius: { rounded: 1, pill: 1, square: 0 },
                  borderWidth: 0
                },
                palettes: palettes.mark
              },
              e19: {
                name: 'slider-thumb-icon',
                iconSize: { 's:sm:1': 's:md:1', 's:md:1': 's:lg:1' },
                palettes: palettes.thumbIcon
              },
              e20: {
                name: 'slider-optional-indicator',
                typography: { 's:sm:1': 'label-medium', 's:md:1': 'label-medium' },
                scales: { marginLeft: layout.optionalIndicatorGap },
                palettes: palettes.text
              }
            }
          }
        }
      }
    }
  } as SliderComponent;
}
