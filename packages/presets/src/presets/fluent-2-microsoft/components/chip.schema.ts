import type { ChipIntent, KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ChipComponent = NonNullable<Schema<never>['components']['chip']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type Role = `chip.${ChipIntent}`;

type CreateChipSchemaArgs = {
  c: PresetColorGetter<'default'>;
};

const INTENTS = ['neutral', 'primary'] as const satisfies readonly ChipIntent[];
const EMPHASES = ['high', 'medium', 'low', 'lowest'] as const;
const THEME_TRACK = { light: 'l', dark: 'd', darker: 'd' } as const satisfies Record<
  ThemeName,
  ThemeShortcut
>;

export function createFluent2MicrosoftChipSchema({ c }: CreateChipSchemaArgs): ChipComponent {
  const color = (theme: ThemeName, intent: ChipIntent, tone: KiskadeeTone, alpha?: number) =>
    c('default', THEME_TRACK[theme], `chip.${intent}` as Role, tone, alpha);
  const neutral = (theme: ThemeName, tone: KiskadeeTone, alpha?: number) =>
    c('default', THEME_TRACK[theme], 'neutral', tone, alpha);
  const transparent = (theme: ThemeName) => neutral(theme, 0, 0);

  const createStates = (
    theme: ThemeName,
    intent: ChipIntent,
    emphasis: (typeof EMPHASES)[number],
    property: 'box' | 'border' | 'text'
  ) => {
    const vividForeground = theme === 'light' ? neutral(theme, 0) : neutral(theme, 100);
    const regularForeground = color(theme, intent, theme === 'light' ? 65 : 35);
    const disabledForeground = neutral(theme, theme === 'light' ? 35 : 70);
    const disabledSurface = neutral(theme, theme === 'light' ? 3 : 18);
    const semanticTone = theme === 'light' ? 55 : 45;

    if (property === 'text') {
      const rest = emphasis === 'high' ? vividForeground : regularForeground;
      return {
        rest,
        selected: { rest },
        disabled: disabledForeground
      };
    }

    if (property === 'border') {
      if (emphasis !== 'low') return { rest: transparent(theme) };
      return {
        rest: color(theme, intent, theme === 'light' ? 40 : 60),
        hover: color(theme, intent, theme === 'light' ? 50 : 50),
        pressed: color(theme, intent, semanticTone),
        selected: {
          rest: color(theme, intent, semanticTone),
          hover: color(theme, intent, theme === 'light' ? 60 : 40),
          pressed: color(theme, intent, theme === 'light' ? 70 : 30)
        },
        disabled: neutral(theme, theme === 'light' ? 20 : 75)
      };
    }

    if (emphasis === 'high') {
      return {
        rest: color(theme, intent, semanticTone),
        hover: color(theme, intent, theme === 'light' ? 60 : 40),
        pressed: color(theme, intent, theme === 'light' ? 70 : 30),
        selected: {
          rest: color(theme, intent, theme === 'light' ? 65 : 35),
          hover: color(theme, intent, theme === 'light' ? 70 : 30),
          pressed: color(theme, intent, theme === 'light' ? 75 : 24)
        },
        disabled: disabledSurface
      };
    }

    const baseTone = emphasis === 'medium' ? (theme === 'light' ? 8 : 18) : 0;
    return {
      rest: baseTone === 0 ? transparent(theme) : color(theme, intent, baseTone),
      hover: color(theme, intent, theme === 'light' ? 10 : 22),
      pressed: color(theme, intent, theme === 'light' ? 14 : 26),
      selected: {
        rest: color(theme, intent, theme === 'light' ? 16 : 28),
        hover: color(theme, intent, theme === 'light' ? 20 : 30),
        pressed: color(theme, intent, theme === 'light' ? 24 : 35)
      },
      disabled: emphasis === 'medium' ? disabledSurface : transparent(theme)
    };
  };

  const createIntentMap = (theme: ThemeName, property: 'box' | 'border' | 'text') =>
    Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        Object.fromEntries(
          EMPHASES.map((emphasis) => [emphasis, createStates(theme, intent, emphasis, property)])
        )
      ])
    );

  const createSurfacePalette = (theme: ThemeName) => ({
    onSubtle: {
      boxColor: createIntentMap(theme, 'box'),
      borderColor: createIntentMap(theme, 'border')
    },
    onVivid: {
      boxColor: createIntentMap(theme, 'box'),
      borderColor: createIntentMap(theme, 'border')
    }
  });
  const createTextPalette = (theme: ThemeName) => ({
    onSubtle: { textColor: createIntentMap(theme, 'text') },
    onVivid: { textColor: createIntentMap(theme, 'text') }
  });

  const createContentSurfaceContext = () =>
    Object.fromEntries(
      (['light', 'dark', 'darker'] as const).map((theme) => [
        theme,
        Object.fromEntries(
          (['onSubtle', 'onVivid'] as const).map((input) => [
            input,
            Object.fromEntries(
              INTENTS.map((intent) => [
                intent,
                {
                  high: { rest: 'onVivid', selected: 'onVivid', disabled: 'onSubtle' },
                  medium: { rest: 'inherit' },
                  low: { rest: 'inherit' },
                  lowest: { rest: 'inherit' }
                }
              ])
            )
          ])
        )
      ])
    );

  return {
    contentSurfaceContext: {
      default: createContentSurfaceContext()
    },
    elements: {
      e1: { name: 'chip-container' },
      e2: {
        name: 'chip-primary-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          boxHeight: { 's:sm:1': 24, 's:md:1': 32, 's:lg:1': 40 },
          paddingTop: { 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 6 },
          paddingBottom: { 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 6 },
          paddingLeft: { 's:sm:1': 8, 's:md:1': 10, 's:lg:1': 12 },
          paddingRight: { 's:sm:1': 8, 's:md:1': 10, 's:lg:1': 12 },
          borderWidth: { 's:sm:1': 1, 's:md:1': 1, 's:lg:1': 1 },
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
      e3: {
        name: 'chip-label',
        typography: {
          's:sm:1': 'caption-medium',
          's:md:1': 'body-medium',
          's:lg:1': 'body-large'
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
        name: 'chip-icon',
        iconSize: { 's:sm:1': 's:sm:1', 's:md:1': 's:md:1', 's:lg:1': 's:lg:1' },
        scales: { marginRight: { 's:sm:1': 4, 's:md:1': 6, 's:lg:1': 6 } },
        palettes: {
          default: {
            light: createTextPalette('light'),
            dark: createTextPalette('dark'),
            darker: createTextPalette('darker')
          }
        }
      },
      e5: {
        name: 'chip-remove-control',
        decorations: { borderStyle: 'solid' },
        scales: {
          marginLeft: { 's:sm:1': 0, 's:md:1': 0, 's:lg:1': 0 },
          paddingTop: { 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 6 },
          paddingRight: { 's:sm:1': 4, 's:md:1': 6, 's:lg:1': 8 },
          paddingBottom: { 's:sm:1': 2, 's:md:1': 4, 's:lg:1': 6 },
          paddingLeft: { 's:sm:1': 4, 's:md:1': 6, 's:lg:1': 8 },
          borderWidth: { 's:sm:1': 1, 's:md:1': 1, 's:lg:1': 1 },
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
      e6: {
        name: 'chip-remove-icon',
        iconSize: { 's:sm:1': 's:sm:2', 's:md:1': 's:sm:1', 's:lg:1': 's:md:1' },
        palettes: {
          default: {
            light: createTextPalette('light'),
            dark: createTextPalette('dark'),
            darker: createTextPalette('darker')
          }
        }
      },
      e7: {
        name: 'chip-badge-relation',
        scales: { marginLeft: { 's:sm:1': 4, 's:md:1': 6, 's:lg:1': 6 } }
      }
    }
  };
}
