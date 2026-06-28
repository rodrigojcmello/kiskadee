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
    hover: '#F5FAFF',
    pressed: '#F0F5FF',
    focus: '#FFFFFF',
    disabled: '#FFFFFF1F'
  };
  const neutralMedium = {
    rest: '#EBF0FC',
    hover: '#E1E6F2',
    pressed: '#D8DEEA',
    focus: '#EBF0FC',
    disabled: '#FFFFFF1F'
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
  const borderLow = {
    rest: '#CCD1DD',
    hover: '#A9ADB9',
    pressed: '#5D616B',
    focus: '#0064B4',
    disabled: transparent
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
            hover: 's:md:1',
            focus: 's:md:1',
            pressed: false,
            disabled: false
          },
          fixedLevels: ['s:md:1']
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
                low: {
                  ...neutralLow,
                  selected: selectedPrimaryHigh
                },
                medium: {
                  ...neutralMedium,
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
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                },
                medium: {
                  ...borderLow,
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                },
                high: {
                  ...borderHigh,
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                },
                highest: {
                  ...borderHighest,
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                }
              },
              primary: {
                low: {
                  ...primaryBorderLow,
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                },
                medium: {
                  ...primaryBorderLow,
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                },
                high: {
                  ...primaryBorderHigh,
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                },
                highest: {
                  ...primaryBorderHighest,
                  selected: {
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent,
                    focus: transparent
                  }
                }
              }
            }
          }
        }))
      }
    }
  };
}
