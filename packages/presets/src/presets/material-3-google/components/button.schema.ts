import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import { createMaterialButtonIntent, MATERIAL_BUTTON_INTENTS } from './button-color-formula.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic' | 'purple';
type ButtonComponent = NonNullable<Schema<'purple'>['components']['button']>;

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
          medium: { rest: surface, selected: filled, disabled: 'inherit' },
          low: { rest: 'inherit', selected: filled, disabled: 'inherit' },
          lowest: { rest: 'inherit', selected: filled, disabled: 'inherit' }
        }
      ])
    );
  };
  return {
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
            focus: 's:sm:1',
            pressed: false,
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
          paddingTop: {
            's:sm:1': 8,
            's:md:1': 10,
            's:lg:1': 16,
            's:lg:2': 32,
            's:lg:3': 48
          },
          paddingBottom: {
            's:sm:1': 8,
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
          borderWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1,
            's:lg:2': 1,
            's:lg:3': 1
          },
          borderRadius: {
            rounded: {
              's:sm:1': 18,
              's:md:1': 20,
              's:lg:1': 28,
              's:lg:2': 48,
              's:lg:3': 68
            },
            pill: {
              's:sm:1': 18,
              's:md:1': 20,
              's:lg:1': 28,
              's:lg:2': 48,
              's:lg:3': 68
            },
            square: {
              's:sm:1': 0,
              's:md:1': 0,
              's:lg:1': 0,
              's:lg:2': 0,
              's:lg:3': 0
            }
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
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2',
          's:lg:3': 's:lg:3'
        }
      },
      e5: {
        name: 'button-disclosure',
        palettes: buildBySegment(segmentNames, (segment) => createPalettes(segment, 'icon')),
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:md:1',
          's:lg:2': 's:md:1',
          's:lg:3': 's:md:1'
        },
        scales: {
          paddingRight: 4
        }
      }
    }
  };
}
