import type { BadgeIntent, KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type BadgeComponent = NonNullable<Schema<never>['components']['badge']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type Role = `badge.${BadgeIntent}`;

type CreateBadgeSchemaArgs = {
  c: PresetColorGetter<'default'>;
};

const INTENTS = [
  'neutral',
  'primary',
  'informative',
  'positive',
  'warning',
  'severe',
  'destructive',
  'important'
] as const satisfies readonly BadgeIntent[];

const THEME_TRACK = {
  light: 'l',
  dark: 'd',
  darker: 'd'
} as const satisfies Record<ThemeName, ThemeShortcut>;

const TRANSPARENT_TONE = 0;

export function createFluent2MicrosoftBadgeSchema({ c }: CreateBadgeSchemaArgs): BadgeComponent {
  const color = (theme: ThemeName, intent: BadgeIntent, tone: KiskadeeTone, alpha?: number) =>
    c('default', THEME_TRACK[theme], `badge.${intent}` as Role, tone, alpha);
  const neutral = (theme: ThemeName, tone: KiskadeeTone, alpha?: number) =>
    c('default', THEME_TRACK[theme], 'neutral', tone, alpha);
  const transparent = (theme: ThemeName) => neutral(theme, TRANSPARENT_TONE, 0);

  const createIntentStates = (theme: ThemeName, colorProperty: 'box' | 'border' | 'text') =>
    Object.fromEntries(
      INTENTS.map((intent) => {
        const foreground = theme === 'light' ? 65 : 35;
        const contrast = theme === 'light' ? neutral(theme, 0) : neutral(theme, 100);
        const values =
          colorProperty === 'box'
            ? {
                high: { rest: color(theme, intent, theme === 'light' ? 55 : 45) },
                medium: { rest: color(theme, intent, theme === 'light' ? 8 : 18) },
                low: { rest: transparent(theme) },
                lowest: { rest: transparent(theme) }
              }
            : colorProperty === 'border'
              ? {
                  high: { rest: transparent(theme) },
                  medium: { rest: transparent(theme) },
                  low: { rest: color(theme, intent, theme === 'light' ? 45 : 55) },
                  lowest: { rest: transparent(theme) }
                }
              : {
                  high: { rest: contrast },
                  medium: { rest: color(theme, intent, foreground) },
                  low: { rest: color(theme, intent, foreground) },
                  lowest: { rest: color(theme, intent, foreground) }
                };
        return [intent, values];
      })
    );

  const createSurfacePalette = (theme: ThemeName) => ({
    onSubtle: {
      boxColor: createIntentStates(theme, 'box'),
      borderColor: createIntentStates(theme, 'border')
    },
    onVivid: {
      boxColor: createIntentStates(theme, 'box'),
      borderColor: createIntentStates(theme, 'border')
    }
  });

  const createTextPalette = (theme: ThemeName) => ({
    onSubtle: { textColor: createIntentStates(theme, 'text') },
    onVivid: { textColor: createIntentStates(theme, 'text') }
  });

  return {
    elements: {
      e1: {
        name: 'badge-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          boxHeight: {
            's:sm:3': 6,
            's:sm:2': 10,
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 24,
            's:lg:2': 32
          },
          paddingTop: { 's:sm:3': 0, 's:sm:2': 0, 's:sm:1': 1, 's:md:1': 2, 's:lg:1': 2, 's:lg:2': 4 },
          paddingBottom: { 's:sm:3': 0, 's:sm:2': 0, 's:sm:1': 1, 's:md:1': 2, 's:lg:1': 2, 's:lg:2': 4 },
          paddingLeft: { 's:sm:3': 0, 's:sm:2': 0, 's:sm:1': 4, 's:md:1': 6, 's:lg:1': 8, 's:lg:2': 10 },
          paddingRight: { 's:sm:3': 0, 's:sm:2': 0, 's:sm:1': 4, 's:md:1': 6, 's:lg:1': 8, 's:lg:2': 10 },
          borderWidth: { 's:sm:3': 0, 's:sm:2': 0, 's:sm:1': 1, 's:md:1': 1, 's:lg:1': 1, 's:lg:2': 1 },
          borderRadius: { rounded: 4, pill: 999 }
        },
        palettes: {
          default: {
            light: createSurfacePalette('light'),
            dark: createSurfacePalette('dark'),
            darker: createSurfacePalette('darker')
          }
        }
      },
      e2: {
        name: 'badge-label',
        typography: {
          's:sm:3': 'caption-small',
          's:sm:2': 'caption-small',
          's:sm:1': 'caption-small',
          's:md:1': 'caption-medium',
          's:lg:1': 'caption-medium-strong',
          's:lg:2': 'body-medium-strong'
        },
        palettes: {
          default: {
            light: createTextPalette('light'),
            dark: createTextPalette('dark'),
            darker: createTextPalette('darker')
          }
        }
      },
      e3: {
        name: 'badge-icon',
        iconSize: {
          's:sm:3': 's:sm:4',
          's:sm:2': 's:sm:3',
          's:sm:1': 's:sm:2',
          's:md:1': 's:sm:1',
          's:lg:1': 's:md:1',
          's:lg:2': 's:lg:1'
        },
        scales: {
          marginRight: { 's:sm:3': 0, 's:sm:2': 0, 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 4, 's:lg:2': 6 }
        },
        palettes: {
          default: {
            light: createTextPalette('light'),
            dark: createTextPalette('dark'),
            darker: createTextPalette('darker')
          }
        }
      },
      e4: {
        name: 'badge-count',
        typography: {
          's:sm:3': 'caption-small',
          's:sm:2': 'caption-small',
          's:sm:1': 'caption-small',
          's:md:1': 'caption-medium-strong',
          's:lg:1': 'caption-medium-strong',
          's:lg:2': 'body-medium-strong'
        },
        scales: {
          marginLeft: { 's:sm:3': 0, 's:sm:2': 0, 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 4, 's:lg:2': 6 }
        },
        palettes: {
          default: {
            light: createTextPalette('light'),
            dark: createTextPalette('dark'),
            darker: createTextPalette('darker')
          }
        }
      },
      e5: {
        name: 'badge-dot',
        scales: {
          boxHeight: { 's:sm:3': 6, 's:sm:2': 10, 's:sm:1': 16, 's:md:1': 20, 's:lg:1': 24, 's:lg:2': 32 },
          boxWidth: { 's:sm:3': 6, 's:sm:2': 10, 's:sm:1': 16, 's:md:1': 20, 's:lg:1': 24, 's:lg:2': 32 },
          borderRadius: { pill: 999 }
        },
        palettes: {
          default: {
            light: createSurfacePalette('light'),
            dark: createSurfacePalette('dark'),
            darker: createSurfacePalette('darker')
          }
        }
      }
    }
  };
}
