import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../elegant.schema.ts';

type CardComponent = NonNullable<Schema<Segment>['components']['card']>;

type CreateElegantCardSchemaArgs = {
  c: PresetColorGetter<Segment>;
  segmentNames: readonly Segment[];
  transparent: readonly [number, number, number, number];
};

export function createElegantCardSchema({
  c,
  segmentNames,
  transparent
}: CreateElegantCardSchemaArgs): CardComponent {
  return {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            focus: 's:sm:1',
            pressed: false,
            disabled: false
          },
          fixedLevels: ['s:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3']
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
              's:md:1': 28
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
                    rest: c(s, 'l', 'primary', 50),
                    hover: c(s, 'l', 'primary', 60),
                    pressed: c(s, 'l', 'primary', 70),
                    focus: c(s, 'l', 'primary', 50)
                  }
                }
              }
            },
            borderColor: {
              neutral: {
                medium: {
                  rest: c(s, 'l', 'card.neutral', 10),
                  hover: c(s, 'l', 'card.neutral', 15),
                  pressed: c(s, 'l', 'card.neutral', 20),
                  focus: c(s, 'l', 'primary', 50),
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
