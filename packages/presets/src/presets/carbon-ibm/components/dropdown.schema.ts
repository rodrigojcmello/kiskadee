import { primitive, type Schema } from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';

type DropdownComponent = NonNullable<Schema<never>['components']['dropdown']>;
type Theme = 'light' | 'dark' | 'darker';

// Both overlay presenters establish their own Carbon layer regardless of the trigger surface.
export function createCarbonMenuPalettes(
  c: CarbonIbmColorResolver,
  theme: Theme,
  component: 'dropdown' | 'bottomSheet'
) {
  const token = (
    name: Parameters<typeof tokenColor>[2],
    intent: 'neutral' | 'destructive' = 'neutral'
  ) => tokenColor(c, theme, name, `${component}.${intent}`);
  const transparent = c.resolve(
    'default',
    theme === 'light' ? 'l' : 'd',
    absoluteCap(primitive('black', 'v1'), 'dark', 0)
  );
  const both = <T>(palette: T) => ({ onSubtle: palette, onVivid: palette });
  const surface = both({ boxColor: { neutral: { medium: { rest: token('layer-01') } } } });
  const text = (secondary = false, icons = false) =>
    both({
      textColor: {
        neutral: {
          medium: {
            rest: token(secondary ? 'text-helper' : icons ? 'icon-secondary' : 'text-secondary'),
            ...(!secondary && { hover: { ref: token(icons ? 'icon-primary' : 'text-primary') } }),
            disabled: { ref: token(icons ? 'icon-disabled' : 'text-disabled') }
          }
        },
        destructive: {
          medium: {
            rest: token('text-error', 'destructive'),
            hover: { ref: token(icons ? 'icon-on-color' : 'text-on-color', 'destructive') },
            pressed: { ref: token(icons ? 'icon-on-color' : 'text-on-color', 'destructive') },
            disabled: { ref: token(icons ? 'icon-disabled' : 'text-disabled') }
          }
        }
      }
    });
  return {
    surface,
    item: both({
      boxColor: {
        neutral: {
          medium: {
            rest: transparent,
            hover: token('layer-hover-01'),
            pressed: token('layer-active-01'),
            selected: { rest: token('layer-selected-01'), hover: token('layer-selected-hover-01') },
            // Terminal reset prevents a controlled selection from painting an unavailable item.
            disabled: transparent
          }
        },
        destructive: {
          medium: {
            rest: transparent,
            hover: token('button-danger-primary', 'destructive'),
            pressed: token('button-danger-active', 'destructive'),
            selected: {
              rest: token('layer-selected-01'),
              hover: token('button-danger-primary', 'destructive'),
              pressed: token('button-danger-active', 'destructive')
            },
            disabled: transparent
          }
        }
      }
    }),
    text: text(),
    icon: text(false, true),
    auxiliary: text(true),
    scroll: both({ ...surface.onSubtle, ...text().onSubtle })
  };
}

export function createCarbonIbmDropdownSchema({
  c
}: {
  c: CarbonIbmColorResolver;
}): DropdownComponent {
  const values = {
    light: createCarbonMenuPalettes(c, 'light', 'dropdown'),
    dark: createCarbonMenuPalettes(c, 'dark', 'dropdown'),
    darker: createCarbonMenuPalettes(c, 'darker', 'dropdown')
  };
  const palettes = <K extends keyof typeof values.light>(key: K) => ({
    default: { light: values.light[key], dark: values.dark[key], darker: values.darker[key] }
  });
  return {
    effects: {
      presence: { profile: 'fade-translate' },
      shadow: { e1: { kind: 'outer', states: { rest: 's:md:1' }, fixedLevels: ['s:md:1'] } }
    },
    options: {
      density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' },
      leadingIconComposition: 'item-and-selection',
      selectedItemBackground: true
    },
    elements: {
      e1: {
        name: 'dropdown-surface',
        scales: {
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 0,
          paddingRight: 0,
          borderRadius: { rounded: 0, square: 0, pill: 0 }
        },
        palettes: palettes('surface')
      },
      e2: {
        name: 'dropdown-item',
        scales: {
          paddingTop: { 's:sm:1': 7, 's:md:1': 11, 's:lg:1': 15 },
          paddingBottom: { 's:sm:1': 7, 's:md:1': 11, 's:lg:1': 15 },
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 0,
          borderRadius: { rounded: 0, square: 0, pill: 0 }
        },
        palettes: palettes('item')
      },
      e3: {
        name: 'dropdown-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 8 },
        palettes: palettes('icon')
      },
      e4: {
        name: 'dropdown-label',
        typography: { 's:all': 'body-medium' },
        scales: { paddingLeft: 0, paddingRight: 8 },
        palettes: palettes('text')
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'label-small' },
        scales: { paddingLeft: 0, paddingRight: 8 },
        palettes: palettes('auxiliary')
      },
      e6: {
        name: 'dropdown-trailing-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingLeft: 8 },
        palettes: palettes('icon')
      },
      e7: { name: 'dropdown-separator', separator: { 's:all': 'subtle' } },
      e8: {
        name: 'dropdown-end-text',
        typography: { 's:all': 'label-small' },
        scales: { paddingLeft: 16, paddingRight: 0 },
        palettes: palettes('auxiliary')
      },
      e9: {
        name: 'dropdown-group-label',
        typography: { 's:all': 'label-small' },
        scales: {
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
          marginLeft: 0
        },
        palettes: palettes('auxiliary')
      },
      e10: {
        name: 'dropdown-selection-indicator',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 8 },
        palettes: palettes('icon')
      },
      e11: {
        name: 'dropdown-scroll-affordance',
        iconSize: { 's:all': 's:sm:1' },
        palettes: palettes('scroll')
      }
    }
  };
}
