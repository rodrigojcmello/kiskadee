import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';

type Fluent2MicrosoftSegmentName = 'default';
type CardComponent = NonNullable<Schema<never>['components']['card']>;

type CreateFluent2MicrosoftCardSchemaArgs = {
  segmentNames: readonly Fluent2MicrosoftSegmentName[];
  transparent: readonly [number, number, number, number];
};

export function createFluent2MicrosoftCardSchema({
  segmentNames,
  transparent
}: CreateFluent2MicrosoftCardSchemaArgs): CardComponent {
  const neutralLow = {
    rest: '#FFFFFF',
    hover: '#F0F5FF',
    pressed: '#DBE0EC',
    focus: '#FFFFFF',
    disabled: '#EBF0FC'
  };
  const neutralMedium = {
    rest: '#F5FAFF',
    hover: '#EBF0FC',
    pressed: '#D6DBE7',
    focus: '#F5FAFF',
    disabled: '#EBF0FC'
  };
  const neutralLowest = {
    rest: transparent,
    hover: '#F0F5FF',
    pressed: '#DBE0EC',
    focus: transparent,
    disabled: '#EBF0FC'
  };
  const neutralHigh = {
    rest: '#262932',
    hover: '#1C1F28',
    pressed: '#11141C',
    focus: '#262932',
    disabled: '#FFFFFF1F'
  };
  const neutralHighest = {
    rest: '#000000',
    hover: '#070A11',
    pressed: '#000000',
    focus: '#000000',
    disabled: '#FFFFFF1F'
  };
  const primaryLow = neutralLow;
  const primaryLowest = {
    rest: transparent,
    hover: '#D9F1FF',
    pressed: '#C7E9FF',
    focus: transparent,
    disabled: '#EBF0FC'
  };
  const primaryMedium = {
    rest: '#D9F1FF',
    hover: '#C7E9FF',
    pressed: '#B3DFFF',
    focus: '#D9F1FF',
    disabled: '#FFFFFF1F'
  };
  const primaryHigh = {
    rest: '#0064B4',
    hover: '#0055A4',
    pressed: '#002B6B',
    focus: '#0064B4',
    disabled: '#FFFFFF1F'
  };
  const primaryHighest = {
    rest: '#001241',
    hover: '#071A4D',
    pressed: '#000A2E',
    focus: '#001241',
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
  const selectedNeutralLow = {
    rest: '#E6EBF7',
    hover: '#E6EBF7',
    pressed: '#E6EBF7',
    focus: '#E6EBF7'
  };
  const selectedNeutralMedium = {
    rest: '#E1E6F2',
    hover: '#E1E6F2',
    pressed: '#E1E6F2',
    focus: '#E1E6F2'
  };
  const borderLow = {
    rest: '#CCD1DD',
    hover: '#C3C7D3',
    pressed: '#AFB3BF',
    focus: '#0064B4',
    disabled: '#DBE0EC'
  };
  const borderlessNeutral = {
    rest: transparent,
    hover: transparent,
    pressed: transparent,
    focus: '#0064B4',
    disabled: transparent
  };
  const selectedBorder = {
    rest: '#B9BDC9',
    hover: '#B9BDC9',
    pressed: '#B9BDC9',
    focus: '#B9BDC9'
  };
  const borderHigh = {
    rest: '#626671',
    hover: '#A9ADB9',
    pressed: '#CCD1DD',
    focus: '#3387DA',
    disabled: transparent
  };
  const borderHighest = {
    rest: '#000000',
    hover: '#626671',
    pressed: '#000000',
    focus: '#3387DA',
    disabled: transparent
  };
  const primaryBorderLow = {
    rest: '#0064B4',
    hover: '#0055A4',
    pressed: '#002B6B',
    focus: '#0064B4',
    disabled: transparent
  };
  const primaryBorderless = {
    rest: transparent,
    hover: transparent,
    pressed: transparent,
    focus: '#3387DA',
    disabled: transparent
  };
  const primaryBorderHigh = {
    rest: '#3387DA',
    hover: '#0064B4',
    pressed: '#0055A4',
    focus: '#3387DA',
    disabled: transparent
  };
  const primaryBorderHighest = {
    rest: '#3387DA',
    hover: '#0064B4',
    pressed: '#0055A4',
    focus: '#3387DA',
    disabled: transparent
  };

  return {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:md:1',
            hover: 's:lg:1',
            focus: 's:md:1',
            pressed: 's:md:1',
            disabled: 's:md:1'
          },
          fixedLevels: ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3', 's:lg:4']
        }
      }
    },
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
            rounded: {
              's:md:1': 4
            },
            square: {
              's:md:1': 0
            }
          }
        },
        palettes: buildBySegment(segmentNames, () => ({
          light: {
            boxColor: {
              neutral: {
                lowest: {
                  ...neutralLowest,
                  selected: selectedNeutralLow
                },
                low: {
                  ...neutralLow,
                  selected: selectedNeutralLow
                },
                medium: {
                  ...neutralMedium,
                  selected: selectedNeutralMedium
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
                lowest: {
                  ...primaryLowest,
                  selected: selectedPrimaryHigh
                },
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
                lowest: {
                  ...borderlessNeutral,
                  selected: selectedBorder
                },
                low: {
                  ...borderLow,
                  selected: selectedBorder
                },
                medium: {
                  ...borderlessNeutral,
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
                lowest: {
                  ...primaryBorderless,
                  selected: selectedBorder
                },
                low: {
                  ...primaryBorderLow,
                  selected: selectedBorder
                },
                medium: {
                  ...primaryBorderless,
                  selected: selectedBorder
                },
                high: {
                  ...primaryBorderHigh,
                  selected: selectedBorder
                },
                highest: {
                  ...primaryBorderHighest,
                  selected: selectedBorder
                }
              }
            }
          }
        }))
      }
    }
  };
}
