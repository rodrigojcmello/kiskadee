import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Fluent2MicrosoftSegmentName = 'default';
type CardComponent = NonNullable<Schema<never>['components']['card']>;

type CreateFluent2MicrosoftCardSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  segmentNames: readonly Fluent2MicrosoftSegmentName[];
  transparent: readonly [number, number, number, number];
};

export function createFluent2MicrosoftCardSchema({
  c,
  segmentNames,
  transparent
}: CreateFluent2MicrosoftCardSchemaArgs): CardComponent {
  return {
    effects: {
      shadow: {
        targetElement: 'e1',
        states: {
          rest: 's:md:1',
          hover: 's:md:1',
          focus: 's:md:1',
          pressed: false,
          disabled: false
        },
        fixedLevels: ['s:md:1']
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
        palettes: buildBySegment(segmentNames, (s) => ({
          light: {
            boxColor: {
              neutral: {
                medium: {
                  rest: c(s, 'l', 'card.neutral', 0),
                  hover: c(s, 'l', 'card.neutral', 1),
                  pressed: c(s, 'l', 'card.neutral', 2),
                  focus: c(s, 'l', 'card.neutral', 0),
                  disabled: c(s, 'l', 'card.neutral', 0, 12),
                  selected: {
                    rest: c(s, 'l', 'primary', 60),
                    hover: c(s, 'l', 'primary', 70),
                    pressed: c(s, 'l', 'primary', 80),
                    focus: c(s, 'l', 'primary', 60)
                  }
                }
              }
            },
            borderColor: {
              neutral: {
                medium: {
                  rest: c(s, 'l', 'card.neutral', 15),
                  hover: c(s, 'l', 'card.neutral', 20),
                  pressed: c(s, 'l', 'card.neutral', 25),
                  focus: c(s, 'l', 'primary', 60),
                  disabled: transparent,
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
