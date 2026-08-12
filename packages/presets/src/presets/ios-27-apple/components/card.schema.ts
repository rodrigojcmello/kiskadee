import type { Schema, SolidColor } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../ios-27-apple.schema.ts';

type CardComponent = NonNullable<Schema<Segment>['components']['card']>;
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';

type CreateIos27AppleCardSchemaArgs = {
  c: PresetColorGetter<Segment>;
  segmentNames: readonly Segment[];
  transparent: SolidColor;
};

const CANONICAL_CARD_SURFACES = {
  default: {
    light: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'high', contentSurfaceContext: 'onVivid' }
    ],
    dark: [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle' },
      { intent: 'primary', emphasis: 'high', contentSurfaceContext: 'onVivid' }
    ]
  }
} as const satisfies NonNullable<CardComponent['options']>['canonicalSurfaces'];

const CARD_SURFACE_TONES = {
  light: {
    track: 'l',
    neutralLow: 0,
    neutralMedium: 3,
    primaryHigh: 28
  },
  dark: {
    track: 'd',
    neutralLow: 5,
    neutralMedium: 10,
    primaryHigh: 70
  }
} as const satisfies Record<
  ThemeName,
  {
    track: ThemeShortcut;
    neutralLow: 0 | 5;
    neutralMedium: 3 | 10;
    primaryHigh: 28 | 70;
  }
>;

function createCardPalette(
  c: PresetColorGetter<Segment>,
  segmentName: Segment,
  themeName: ThemeName,
  transparent: SolidColor
) {
  const tones = CARD_SURFACE_TONES[themeName];
  const primaryHigh = c(segmentName, tones.track, 'card.primary', tones.primaryHigh);

  return {
    boxColor: {
      neutral: {
        low: {
          rest: c(segmentName, tones.track, 'card.neutral', tones.neutralLow),
          selected: { rest: primaryHigh }
        },
        medium: {
          rest: c(segmentName, tones.track, 'card.neutral', tones.neutralMedium),
          selected: { rest: primaryHigh }
        }
      },
      primary: {
        high: {
          rest: primaryHigh
        }
      }
    },
    borderColor: {
      neutral: {
        low: { rest: transparent },
        medium: { rest: transparent }
      },
      primary: {
        high: { rest: transparent }
      }
    }
  };
}

export function createIos27AppleCardSchema({
  c,
  segmentNames,
  transparent
}: CreateIos27AppleCardSchemaArgs): CardComponent {
  return {
    options: {
      canonicalSurfaces: CANONICAL_CARD_SURFACES
    },
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
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
        palettes: buildBySegment(segmentNames, (segmentName) => ({
          light: {
            onSubtle: createCardPalette(c, segmentName, 'light', transparent)
          },
          dark: {
            onSubtle: createCardPalette(c, segmentName, 'dark', transparent)
          }
        }))
      }
    }
  };
}
