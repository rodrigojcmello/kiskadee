import type { BadgeIntent, KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type BadgeComponent = NonNullable<Schema<never>['components']['badge']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type Role = `badge.${BadgeIntent}` | 'badge.warning.v2';

type CreateBadgeSchemaArgs = {
  c: PresetColorGetter<'default'>;
};

const INTENTS = [
  'neutral',
  'primary',
  'novelty',
  'positive',
  'warning',
  'attention'
] as const satisfies readonly BadgeIntent[];

const THEME_TRACK = {
  light: 'l',
  dark: 'd',
  darker: 'd'
} as const satisfies Record<ThemeName, ThemeShortcut>;

const TRANSPARENT_TONE = 0;

export function createFluent2MicrosoftBadgeSchema({ c }: CreateBadgeSchemaArgs): BadgeComponent {
  const role = (intent: BadgeIntent): Role =>
    intent === 'warning' ? 'badge.warning.v2' : (`badge.${intent}` as Role);
  const color = (theme: ThemeName, intent: BadgeIntent, tone: KiskadeeTone, alpha?: number) =>
    c('default', THEME_TRACK[theme], role(intent), tone, alpha);
  const absolute = (theme: ThemeName, tone: KiskadeeTone, alpha?: number) =>
    c('default', THEME_TRACK[theme], 'primitive.black.v1', tone, alpha);
  const transparent = (theme: ThemeName) => absolute(theme, TRANSPARENT_TONE, 0);
  const white = (theme: ThemeName) => absolute(theme, theme === 'light' ? 0 : 100);
  const black = (theme: ThemeName) => absolute(theme, theme === 'light' ? 100 : 0);
  const vivid = (theme: ThemeName, intent: BadgeIntent) =>
    intent === 'warning' && theme !== 'light'
      ? color(theme, intent, 75)
      : c.ref('default', THEME_TRACK[theme], role(intent), 'vivid');
  const highForeground = (theme: ThemeName, intent: BadgeIntent) =>
    intent === 'warning' || (intent === 'neutral' && theme !== 'light')
      ? black(theme)
      : white(theme);

  const createIntentStates = (
    theme: ThemeName,
    colorProperty: 'box' | 'border' | 'text' | 'fullBleedText'
  ) =>
    Object.fromEntries(
      INTENTS.map((intent) => {
        const subtleForeground = theme === 'light' ? 65 : 80;
        const absoluteWhiteForeground = theme === 'light' ? 65 : 35;
        const values =
          colorProperty === 'box'
            ? {
                high: { rest: vivid(theme, intent) },
                medium: { rest: color(theme, intent, theme === 'light' ? 8 : 18) },
                low: { rest: white(theme) },
                lowest: { rest: transparent(theme) }
              }
            : colorProperty === 'border'
              ? {
                  high: { rest: transparent(theme) },
                  medium: { rest: transparent(theme) },
                  low: { rest: color(theme, intent, theme === 'light' ? 45 : 55) },
                  lowest: { rest: transparent(theme) }
                }
              : colorProperty === 'fullBleedText'
                ? {
                    high: { rest: vivid(theme, intent) },
                    medium: { rest: vivid(theme, intent) },
                    low: { rest: vivid(theme, intent) },
                    lowest: { rest: vivid(theme, intent) }
                  }
                : {
                    high: { rest: highForeground(theme, intent) },
                    medium: { rest: color(theme, intent, subtleForeground) },
                    low: { rest: color(theme, intent, absoluteWhiteForeground) },
                    lowest: { rest: color(theme, intent, subtleForeground) }
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

  const createTextPalette = (theme: ThemeName, fullBleed = false) => ({
    onSubtle: { textColor: createIntentStates(theme, fullBleed ? 'fullBleedText' : 'text') },
    onVivid: { textColor: createIntentStates(theme, fullBleed ? 'fullBleedText' : 'text') }
  });

  const createRingPalette = (theme: ThemeName) => {
    const intents = Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        Object.fromEntries(
          ['high', 'medium', 'low', 'lowest'].map((emphasis) => [emphasis, { rest: white(theme) }])
        )
      ])
    );
    return {
      onSubtle: { borderColor: intents },
      onVivid: { borderColor: intents }
    };
  };

  const themes = <T>(factory: (theme: ThemeName) => T) => ({
    light: factory('light'),
    dark: factory('dark'),
    darker: factory('darker')
  });

  return {
    effects: {
      shadow: {
        e1: { kind: 'outer', states: { rest: 's:sm:1' } },
        e3: { kind: 'outer', states: { rest: 's:sm:1' } },
        e5: { kind: 'outer', states: { rest: 's:sm:1' } }
      }
    },
    elements: {
      e1: {
        name: 'badge-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          boxHeight: {
            's:sm:3': 8,
            's:sm:2': 12,
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 24,
            's:lg:2': 32
          },
          paddingTop: {
            's:sm:3': 0,
            's:sm:2': 0,
            's:sm:1': 0,
            's:md:1': 1,
            's:lg:1': 2,
            's:lg:2': 4
          },
          paddingBottom: {
            's:sm:3': 0,
            's:sm:2': 0,
            's:sm:1': 0,
            's:md:1': 1,
            's:lg:1': 2,
            's:lg:2': 4
          },
          paddingLeft: {
            's:sm:3': 2,
            's:sm:2': 3,
            's:sm:1': 4,
            's:md:1': 5,
            's:lg:1': 7,
            's:lg:2': 10
          },
          paddingRight: {
            's:sm:3': 2,
            's:sm:2': 3,
            's:sm:1': 4,
            's:md:1': 5,
            's:lg:1': 7,
            's:lg:2': 10
          },
          borderWidth: {
            's:sm:3': 0,
            's:sm:2': 0,
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1,
            's:lg:2': 1
          },
          borderRadius: { square: 0, rounded: 4, pill: 999 }
        },
        palettes: { default: themes(createSurfacePalette) }
      },
      e2: {
        name: 'badge-content',
        typography: {
          's:sm:3': 'caption-tiny-strong',
          's:sm:2': 'caption-extra-small-strong',
          's:sm:1': 'caption-small-strong',
          's:md:1': 'caption-medium-strong',
          's:lg:1': 'caption-medium-strong',
          's:lg:2': 'caption-medium-strong'
        },
        palettes: { default: themes((theme) => createTextPalette(theme)) }
      },
      e3: {
        name: 'badge-full-bleed-mark',
        iconSize: {
          's:sm:3': 's:sm:5',
          's:sm:2': 's:sm:3',
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:3'
        },
        scales: { borderRadius: { pill: 999 } },
        palettes: { default: themes((theme) => createTextPalette(theme, true)) }
      },
      e4: {
        name: 'badge-contained-mark-icon',
        iconSize: {
          's:sm:3': 's:sm:5',
          's:sm:2': 's:sm:4',
          's:sm:1': 's:sm:2',
          's:md:1': 's:sm:1',
          's:lg:1': 's:md:1',
          's:lg:2': 's:lg:1'
        },
        palettes: { default: themes((theme) => createTextPalette(theme)) }
      },
      e5: {
        name: 'badge-dot-surface',
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
          boxWidth: {
            's:sm:3': 6,
            's:sm:2': 10,
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 24,
            's:lg:2': 32
          },
          borderWidth: {
            's:sm:3': 0,
            's:sm:2': 0,
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1,
            's:lg:2': 1
          },
          borderRadius: { pill: 999 }
        },
        palettes: { default: themes(createSurfacePalette) }
      },
      e6: {
        name: 'badge-separation-ring',
        decorations: { borderStyle: 'solid' },
        scales: {
          borderWidth: {
            's:sm:3': 1,
            's:sm:2': 1,
            's:sm:1': 1,
            's:md:1': 2,
            's:lg:1': 2,
            's:lg:2': 2
          },
          borderRadius: { square: 0, rounded: 4, pill: 999 }
        },
        palettes: { default: themes(createRingPalette) }
      }
    }
  };
}
