import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic';
type CardComponent = NonNullable<Schema<never>['components']['card']>;

type CreateMaterial3GoogleCardSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: readonly [number, number, number, number];
};

export function createMaterial3GoogleCardSchema({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleCardSchemaArgs): CardComponent {
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
              's:md:1': 12
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
                  hover: c(s, 'l', 'card.neutral', 2),
                  pressed: c(s, 'l', 'card.neutral', 4),
                  focus: c(s, 'l', 'card.neutral', 0),
                  disabled: c(s, 'l', 'card.neutral', 90, 12),
                  selected: {
                    rest: c(s, 'l', 'primary.v2', 50),
                    hover: c(s, 'l', 'primary.v2', 45),
                    pressed: c(s, 'l', 'primary.v2', 40),
                    focus: c(s, 'l', 'primary.v2', 50)
                  }
                }
              }
            },
            borderColor: {
              neutral: {
                medium: {
                  rest: c(s, 'l', 'card.neutral.v2', 15),
                  hover: c(s, 'l', 'card.neutral.v2', 20),
                  pressed: c(s, 'l', 'card.neutral.v2', 25),
                  focus: c(s, 'l', 'primary.v2', 50),
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
