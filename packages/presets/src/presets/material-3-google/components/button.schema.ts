import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import { createMaterialButtonIntent, MATERIAL_BUTTON_INTENTS } from './button-color-formula.ts';
import { createMaterialButtonIndicatorPalettes } from './button-indicator-palettes.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic' | 'purple';
type ButtonComponent = NonNullable<Schema<'purple'>['components']['button']>;

const BUTTON_BORDER_WIDTH = {
  's:sm:1': 1,
  's:md:1': 1,
  's:lg:1': 1,
  's:lg:2': 2,
  's:lg:3': 3
} as const;
const BUTTON_SHARED_RADII = {
  rounded: { 's:sm:1': 16, 's:md:1': 20, 's:lg:1': 28, 's:lg:2': 48, 's:lg:3': 68 },
  square: { 's:sm:1': 0, 's:md:1': 0, 's:lg:1': 0, 's:lg:2': 0, 's:lg:3': 0 }
} as const;
const BUTTON_ICON_SIZES = {
  's:sm:1': 's:md:1',
  's:md:1': 's:md:1',
  's:lg:1': 's:lg:1',
  's:lg:2': 's:lg:3',
  's:lg:3': 's:lg:4'
} as const;
const BUTTON_ICON_GAP = {
  's:sm:1': 4,
  's:md:1': 8,
  's:lg:1': 8,
  's:lg:2': 12,
  's:lg:3': 16
} as const;
const BUTTON_INDICATOR_SCALES = {
  boxWidth: { 's:sm:1': 30, 's:md:1': 30, 's:lg:1': 36, 's:lg:2': 48, 's:lg:3': 60 },
  boxHeight: 3,
  marginTop: 2,
  marginBottom: 2,
  marginLeft: 2,
  marginRight: 2,
  borderRadius: { rounded: 3, pill: 3, square: 0 }
} as const;

type CreateMaterial3GoogleButtonSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
};

export function createMaterial3GoogleButtonSchema({
  c,
  segmentNames
}: CreateMaterial3GoogleButtonSchemaArgs): ButtonComponent {
  const createPalettes = (segment: Material3GoogleSegmentName, slot: 'box' | 'text' | 'icon') => {
    const context = (theme: 'light' | 'dark', surface: 'onSubtle' | 'onVivid') => {
      const recipes = {
        support: createMaterialButtonIntent({ c, segment, theme, surface, intent: 'support' }),
        primary: createMaterialButtonIntent({ c, segment, theme, surface, intent: 'primary' }),
        neutral: createMaterialButtonIntent({ c, segment, theme, surface, intent: 'neutral' }),
        destructive: createMaterialButtonIntent({
          c,
          segment,
          theme,
          surface,
          intent: 'destructive'
        }),
        positive: createMaterialButtonIntent({ c, segment, theme, surface, intent: 'positive' })
      };
      const property = <T extends 'boxColor' | 'borderColor' | 'textColor'>(key: T) => ({
        support: recipes.support[key],
        primary: recipes.primary[key],
        neutral: recipes.neutral[key],
        destructive: recipes.destructive[key],
        positive: recipes.positive[key]
      });
      if (slot === 'icon') {
        for (const recipe of Object.values(recipes)) {
          for (const colors of Object.values(recipe.textColor)) delete colors.pending;
        }
      }
      return slot === 'box'
        ? { boxColor: property('boxColor'), borderColor: property('borderColor') }
        : { textColor: property('textColor') };
    };
    return {
      light: { onSubtle: context('light', 'onSubtle'), onVivid: context('light', 'onVivid') },
      dark: { onSubtle: context('dark', 'onSubtle'), onVivid: context('dark', 'onVivid') }
    };
  };
  const contentContext = (surface: 'onSubtle' | 'onVivid', theme: 'light' | 'dark') => {
    const filled = surface === 'onVivid' || theme === 'dark' ? 'onSubtle' : 'onVivid';
    return Object.fromEntries(
      MATERIAL_BUTTON_INTENTS.map((intent) => [
        intent,
        {
          high: { rest: filled, selected: filled, disabled: 'inherit' },
          medium: { rest: surface, selected: surface, disabled: 'inherit' },
          low: { rest: 'inherit', selected: 'inherit', disabled: 'inherit' },
          lowest: { rest: 'inherit', selected: 'inherit', disabled: 'inherit' }
        }
      ])
    );
  };
  return {
    options: {
      iconLayout: 'inline',
      indicatorPlacement: 'inside',
      selectionEmphasis: 'lowest'
    },
    contentSurfaceContext: buildBySegment(segmentNames, () => ({
      light: {
        onSubtle: contentContext('onSubtle', 'light'),
        onVivid: contentContext('onVivid', 'light')
      },
      dark: {
        onSubtle: contentContext('onSubtle', 'dark'),
        onVivid: contentContext('onVivid', 'dark')
      }
    })),
    effects: {
      activationFeedback: {
        profile: 'ripple',
        origin: 'pointer',
        visual: {
          layer: 'overlay',
          paint: 'field',
          tone: {
            default: 'subtle'
          }
        },
        profiles: {
          halo: {
            size: 80
          }
        }
      },
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            // Pressed restores the resting elevation when Hover is also active.
            pressed: 's:sm:1',
            pending: false,
            disabled: false
          }
        }
      }
    },
    elements: {
      e1: {
        name: 'button',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          _boxHeight: {
            's:sm:1': 32,
            's:md:1': 40,
            's:lg:1': 56,
            's:lg:2': 96,
            's:lg:3': 136
          },
          paddingTop: {
            's:sm:1': 6,
            's:md:1': 10,
            's:lg:1': 16,
            's:lg:2': 32,
            's:lg:3': 48
          },
          paddingBottom: {
            's:sm:1': 6,
            's:md:1': 10,
            's:lg:1': 16,
            's:lg:2': 32,
            's:lg:3': 48
          },
          paddingLeft: {
            's:sm:1': 12,
            's:md:1': 16,
            's:lg:1': 24,
            's:lg:2': 48,
            's:lg:3': 64
          },
          paddingRight: {
            's:sm:1': 12,
            's:md:1': 16,
            's:lg:1': 24,
            's:lg:2': 48,
            's:lg:3': 64
          },
          borderWidth: BUTTON_BORDER_WIDTH,
          borderRadius: {
            ...BUTTON_SHARED_RADII,
            pill: BUTTON_SHARED_RADII.rounded
          }
        },
        palettes: buildBySegment(segmentNames, (segment) => createPalettes(segment, 'box')),
        effects: {
          // Material Design 3 interaction-driven shape. Border radius decreases as interaction intensifies
          // (rest > hover/focus > pressed), emulating MD3 "animated corners". This enables Kiskadee to
          // generate stateful CSS for rounded corners.
          borderRadius: {
            rounded: {
              rest: 20,
              hover: 14,
              pressed: 10,
              focus: 14,
              selected: {
                rest: 16,
                hover: 14,
                pressed: 10,
                focus: 14
              }
            },
            pill: {
              rest: 20,
              hover: 14,
              pressed: 10,
              focus: 14,
              selected: {
                rest: 16,
                hover: 14,
                pressed: 10,
                focus: 14
              }
            },
            square: {
              rest: 20,
              hover: 14,
              pressed: 10,
              focus: 14,
              selected: {
                rest: 16,
                hover: 14,
                pressed: 10,
                focus: 14
              }
            }
          }
        }
      },
      e2: {
        name: 'button-text',
        typography: {
          's:sm:1': 'label-large',
          's:md:1': 'label-large',
          's:lg:1': 'label-extra-large',
          's:lg:2': 'label-display-small',
          's:lg:3': 'label-display-large'
        },
        palettes: buildBySegment(segmentNames, (segment) => createPalettes(segment, 'text'))
      },
      e3: {
        name: 'button-icon',
        palettes: buildBySegment(segmentNames, (segment) => createPalettes(segment, 'icon')),
        iconSize: BUTTON_ICON_SIZES,
        scales: {
          paddingRight: BUTTON_ICON_GAP
        }
      },
      e5: {
        name: 'button-disclosure',
        palettes: buildBySegment(segmentNames, (segment) => createPalettes(segment, 'icon')),
        iconSize: BUTTON_ICON_SIZES,
        scales: {
          paddingRight: BUTTON_ICON_GAP
        }
      },
      e8: {
        name: 'button-stacked',
        scales: {
          _boxHeight: { 's:sm:1': 52, 's:md:1': 64, 's:lg:1': 84, 's:lg:2': 108, 's:lg:3': 136 },
          paddingTop: { 's:sm:1': 4, 's:md:1': 8, 's:lg:1': 12, 's:lg:2': 16, 's:lg:3': 24 },
          paddingBottom: { 's:sm:1': 4, 's:md:1': 8, 's:lg:1': 12, 's:lg:2': 16, 's:lg:3': 24 },
          paddingLeft: { 's:sm:1': 12, 's:md:1': 16, 's:lg:1': 24, 's:lg:2': 32, 's:lg:3': 48 },
          paddingRight: { 's:sm:1': 12, 's:md:1': 16, 's:lg:1': 24, 's:lg:2': 32, 's:lg:3': 48 },
          borderWidth: BUTTON_BORDER_WIDTH,
          borderRadius: BUTTON_SHARED_RADII
        }
      },
      e9: {
        name: 'button-stacked-text',
        typography: {
          's:sm:1': 'label-medium',
          's:md:1': 'label-medium',
          's:lg:1': 'label-large',
          's:lg:2': 'label-extra-large',
          's:lg:3': 'label-extra-large'
        },
        scales: {
          marginTop: BUTTON_ICON_GAP
        }
      },
      e10: {
        name: 'button-stacked-icon',
        iconSize: {
          's:sm:1': 's:lg:1',
          's:md:1': 's:lg:1',
          's:lg:1': 's:lg:3',
          's:lg:2': 's:lg:4',
          's:lg:3': 's:lg:5'
        }
      },
      e11: {
        name: 'button-indicator',
        scales: BUTTON_INDICATOR_SCALES,
        palettes: createMaterialButtonIndicatorPalettes({ c, segmentNames, placement: 'inside' })
      },
      e12: {
        name: 'button-indicator-outside',
        scales: BUTTON_INDICATOR_SCALES,
        palettes: createMaterialButtonIndicatorPalettes({ c, segmentNames, placement: 'outside' })
      }
    }
  };
}
