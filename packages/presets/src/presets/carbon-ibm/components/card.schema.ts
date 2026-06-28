import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';

type CarbonIbmSegmentName = 'default';
type CardComponent = NonNullable<Schema<never>['components']['card']>;

type CreateCarbonIbmCardSchemaArgs = {
  segmentNames: readonly CarbonIbmSegmentName[];
  transparent: readonly [number, number, number, number];
};

export function createCarbonIbmCardSchema({
  segmentNames,
  transparent
}: CreateCarbonIbmCardSchemaArgs): CardComponent {
  const neutralLow = {
    rest: '#FFFFFF',
    hover: '#F4F4F4',
    pressed: '#C6C6C6',
    focus: '#FFFFFF',
    disabled: '#FFFFFF1F'
  };
  const neutralMedium = {
    rest: '#F4F4F4',
    hover: '#E8E8E8',
    pressed: '#C6C6C6',
    focus: '#F4F4F4',
    disabled: '#FFFFFF1F'
  };
  const neutralMediumDark = {
    rest: '#161616',
    hover: '#262626',
    pressed: '#393939',
    focus: '#161616',
    disabled: '#FFFFFF1F'
  };
  const neutralHigh = {
    rest: '#393939',
    hover: '#4C4C4C',
    pressed: '#262626',
    focus: '#393939',
    disabled: '#FFFFFF1F'
  };
  const neutralHighest = {
    rest: '#000000',
    hover: '#393939',
    pressed: '#000000',
    focus: '#000000',
    disabled: '#FFFFFF1F'
  };
  const primaryLow = neutralLow;
  const primaryMedium = {
    rest: '#D0E2FF',
    hover: '#A6C8FF',
    pressed: '#78A9FF',
    focus: '#D0E2FF',
    disabled: '#FFFFFF1F'
  };
  const primaryHigh = {
    rest: '#0F62FE',
    hover: '#0050E6',
    pressed: '#002D9C',
    focus: '#0F62FE',
    disabled: '#FFFFFF1F'
  };
  const primaryHighest = {
    rest: '#001D6C',
    hover: '#002D9C',
    pressed: '#001141',
    focus: '#001D6C',
    disabled: '#FFFFFF1F'
  };
  const selectedPrimaryMedium = {
    rest: primaryMedium.rest,
    hover: primaryMedium.hover,
    pressed: primaryMedium.pressed,
    focus: primaryMedium.focus
  };
  const selectedPrimaryHigh = {
    rest: primaryHigh.rest,
    hover: primaryHigh.hover,
    pressed: primaryHigh.pressed,
    focus: primaryHigh.focus
  };
  const selectedPrimaryHighest = {
    rest: primaryHighest.rest,
    hover: primaryHighest.hover,
    pressed: primaryHighest.pressed,
    focus: primaryHighest.focus
  };
  const borderLow = {
    rest: '#E0E0E0',
    hover: '#C6C6C6',
    pressed: '#8D8D8D',
    focus: '#0F62FE',
    disabled: transparent
  };
  const borderHigh = {
    rest: '#6F6F6F',
    hover: '#A8A8A8',
    pressed: '#E0E0E0',
    focus: '#78A9FF',
    disabled: transparent
  };
  const borderHighest = {
    rest: '#000000',
    hover: '#6F6F6F',
    pressed: '#000000',
    focus: '#78A9FF',
    disabled: transparent
  };
  const primaryBorderLow = {
    rest: '#0F62FE',
    hover: '#0050E6',
    pressed: '#002D9C',
    focus: '#0F62FE',
    disabled: transparent
  };
  const primaryBorderHigh = {
    rest: '#78A9FF',
    hover: '#0F62FE',
    pressed: '#0050E6',
    focus: '#78A9FF',
    disabled: transparent
  };
  const selectedBorder = {
    rest: transparent,
    hover: transparent,
    pressed: transparent,
    focus: transparent
  };

  return {
    elements: {
      e1: {
        name: 'card',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          paddingTop: {
            's:md:1': 16
          },
          paddingBottom: {
            's:md:1': 16
          },
          paddingLeft: {
            's:md:1': 16
          },
          paddingRight: {
            's:md:1': 16
          },
          borderWidth: {
            's:md:1': 1
          },
          borderRadius: {
            square: {
              's:md:1': 0
            }
          }
        },
        palettes: buildBySegment(segmentNames, () => {
          const createPalette = (
            neutralMediumPalette: typeof neutralMedium
          ) => ({
            boxColor: {
              neutral: {
                low: {
                  ...neutralLow,
                  selected: selectedPrimaryHigh
                },
                medium: {
                  ...neutralMediumPalette,
                  selected: selectedPrimaryHigh
                },
                high: {
                  ...neutralHigh,
                  selected: selectedPrimaryMedium
                },
                highest: {
                  ...neutralHighest,
                  selected: selectedPrimaryMedium
                }
              },
              primary: {
                low: {
                  ...primaryLow,
                  selected: selectedPrimaryHigh
                },
                medium: {
                  ...primaryMedium,
                  selected: selectedPrimaryHigh
                },
                high: {
                  ...primaryHigh,
                  selected: selectedPrimaryHighest
                },
                highest: {
                  ...primaryHighest,
                  selected: selectedPrimaryMedium
                }
              }
            },
            borderColor: {
              neutral: {
                low: {
                  ...borderLow,
                  selected: selectedBorder
                },
                medium: {
                  ...borderLow,
                  selected: selectedBorder
                },
                high: {
                  ...borderHigh,
                  selected: selectedBorder
                },
                highest: {
                  ...borderHighest,
                  selected: selectedBorder
                }
              },
              primary: {
                low: {
                  ...primaryBorderLow,
                  selected: selectedBorder
                },
                medium: {
                  ...primaryBorderLow,
                  selected: selectedBorder
                },
                high: {
                  ...primaryBorderHigh,
                  selected: selectedBorder
                },
                highest: {
                  ...primaryBorderHigh,
                  selected: selectedBorder
                }
              }
            }
          });

          return {
            light: createPalette(neutralMedium),
            dark: createPalette(neutralMediumDark)
          };
        })
      }
    }
  };
}
