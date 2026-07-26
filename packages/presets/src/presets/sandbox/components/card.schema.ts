import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';

type SandboxSegmentName = 'default';
type CardComponent = NonNullable<Schema<never>['components']['card']>;

type CreateSandboxCardSchemaArgs = {
  segmentNames: readonly SandboxSegmentName[];
  transparent: string;
};

export function createSandboxCardSchema({
  segmentNames,
  transparent
}: CreateSandboxCardSchemaArgs): CardComponent {
  const neutralLow = {
    rest: '#ffffff',
    hover: '#f0f5ff',
    pressed: '#dbe0ec',
    focus: '#ffffff',
    disabled: '#ebf0fc'
  };
  const neutralMedium = {
    rest: '#f5faff',
    hover: '#ebf0fc',
    pressed: '#d6dbe7',
    focus: '#f5faff',
    disabled: '#ebf0fc'
  };
  const neutralLowest = {
    rest: transparent,
    hover: '#f0f5ff',
    pressed: '#dbe0ec',
    focus: transparent,
    disabled: '#ebf0fc'
  };
  const neutralHigh = {
    rest: '#262932',
    hover: '#1c1f28',
    pressed: '#11141c',
    focus: '#262932',
    disabled: '#ffffff1f'
  };
  const neutralHighest = {
    rest: '#000000',
    hover: '#070a11',
    pressed: '#000000',
    focus: '#000000',
    disabled: '#ffffff1f'
  };
  const primaryLow = neutralLow;
  const primaryLowest = {
    rest: transparent,
    hover: '#d9f1ff',
    pressed: '#c7e9ff',
    focus: transparent,
    disabled: '#ebf0fc'
  };
  const primaryMedium = {
    rest: '#d9f1ff',
    hover: '#c7e9ff',
    pressed: '#b3dfff',
    focus: '#d9f1ff',
    disabled: '#ffffff1f'
  };
  const primaryHigh = {
    rest: '#0064b4',
    hover: '#0055a4',
    pressed: '#002b6b',
    focus: '#0064b4',
    disabled: '#ffffff1f'
  };
  const primaryHighest = {
    rest: '#001241',
    hover: '#071a4d',
    pressed: '#000a2e',
    focus: '#001241',
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
  const selectedNeutralLow = {
    rest: '#e6ebf7',
    hover: '#e6ebf7',
    pressed: '#e6ebf7',
    focus: '#e6ebf7'
  };
  const selectedNeutralMedium = {
    rest: '#e1e6f2',
    hover: '#e1e6f2',
    pressed: '#e1e6f2',
    focus: '#e1e6f2'
  };
  const borderLow = {
    rest: '#ccd1dd',
    hover: '#c3c7d3',
    pressed: '#afb3bf',
    focus: '#0064b4',
    disabled: '#dbe0ec'
  };
  const borderlessNeutral = {
    rest: transparent,
    hover: transparent,
    pressed: transparent,
    focus: '#0064b4',
    disabled: transparent
  };
  const selectedBorder = {
    rest: '#b9bdc9',
    hover: '#b9bdc9',
    pressed: '#b9bdc9',
    focus: '#b9bdc9'
  };
  const borderHigh = {
    rest: '#626671',
    hover: '#a9adb9',
    pressed: '#ccd1dd',
    focus: '#3387da',
    disabled: transparent
  };
  const borderHighest = {
    rest: '#000000',
    hover: '#626671',
    pressed: '#000000',
    focus: '#3387da',
    disabled: transparent
  };
  const primaryBorderLow = {
    rest: '#0064b4',
    hover: '#0055a4',
    pressed: '#002b6b',
    focus: '#0064b4',
    disabled: transparent
  };
  const primaryBorderless = {
    rest: transparent,
    hover: transparent,
    pressed: transparent,
    focus: '#3387da',
    disabled: transparent
  };
  const primaryBorderHigh = {
    rest: '#3387da',
    hover: '#0064b4',
    pressed: '#0055a4',
    focus: '#3387da',
    disabled: transparent
  };
  const primaryBorderHighest = {
    rest: '#3387da',
    hover: '#0064b4',
    pressed: '#0055a4',
    focus: '#3387da',
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
            onSubtle: {
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
          }
        }))
      }
    }
  };
}
