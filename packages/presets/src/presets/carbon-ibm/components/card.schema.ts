import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';

type CarbonIbmSegmentName = 'default';
type CardComponent = NonNullable<Schema<never>['components']['card']>;

type CreateCarbonIbmCardSchemaArgs = {
  segmentNames: readonly CarbonIbmSegmentName[];
  transparent: string;
};

export function createCarbonIbmCardSchema({
  segmentNames,
  transparent
}: CreateCarbonIbmCardSchemaArgs): CardComponent {
  const neutralLow = {
    rest: '#ffffff',
    hover: '#f4f4f4',
    pressed: '#c6c6c6',
    focus: '#ffffff',
    disabled: '#ffffff1f'
  };
  const neutralMedium = {
    rest: '#f4f4f4',
    hover: '#e8e8e8',
    pressed: '#c6c6c6',
    focus: '#f4f4f4',
    disabled: '#ffffff1f'
  };
  const neutralMediumDark = {
    rest: '#161616',
    hover: '#262626',
    pressed: '#393939',
    focus: '#161616',
    disabled: '#ffffff1f'
  };
  const neutralHigh = {
    rest: '#393939',
    hover: '#4c4c4c',
    pressed: '#262626',
    focus: '#393939',
    disabled: '#ffffff1f'
  };
  const neutralHighest = {
    rest: '#000000',
    hover: '#393939',
    pressed: '#000000',
    focus: '#000000',
    disabled: '#ffffff1f'
  };
  const primaryLow = neutralLow;
  const primaryMedium = {
    rest: '#d0e2ff',
    hover: '#a6c8ff',
    pressed: '#78a9ff',
    focus: '#d0e2ff',
    disabled: '#ffffff1f'
  };
  const primaryHigh = {
    rest: '#0f62fe',
    hover: '#0050e6',
    pressed: '#002d9c',
    focus: '#0f62fe',
    disabled: '#ffffff1f'
  };
  const primaryHighest = {
    rest: '#001d6c',
    hover: '#002d9c',
    pressed: '#001141',
    focus: '#001d6c',
    disabled: '#ffffff1f'
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
    rest: '#e0e0e0',
    hover: '#c6c6c6',
    pressed: '#8d8d8d',
    focus: '#0f62fe',
    disabled: transparent
  };
  const borderHigh = {
    rest: '#6f6f6f',
    hover: '#a8a8a8',
    pressed: '#e0e0e0',
    focus: '#78a9ff',
    disabled: transparent
  };
  const borderHighest = {
    rest: '#000000',
    hover: '#6f6f6f',
    pressed: '#000000',
    focus: '#78a9ff',
    disabled: transparent
  };
  const primaryBorderLow = {
    rest: '#0f62fe',
    hover: '#0050e6',
    pressed: '#002d9c',
    focus: '#0f62fe',
    disabled: transparent
  };
  const primaryBorderHigh = {
    rest: '#78a9ff',
    hover: '#0f62fe',
    pressed: '#0050e6',
    focus: '#78a9ff',
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
          const createPalette = (neutralMediumPalette: typeof neutralMedium) => ({
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
            light: {
              onSubtle: createPalette(neutralMedium)
            },
            dark: {
              onSubtle: createPalette(neutralMediumDark)
            }
          };
        })
      }
    }
  };
}
