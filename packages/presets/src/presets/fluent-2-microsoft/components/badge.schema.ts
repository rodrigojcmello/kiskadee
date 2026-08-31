import { type BadgeIntent, type KiskadeeTone, primitive, type Schema } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

type BadgeComponent = NonNullable<Schema<never>['components']['badge']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type Role = `badge.${BadgeIntent}` | 'badge.warning.v2';

type CreateBadgeSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
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

const MEDIUM_SURFACE_OFFSET = {
  light: 4,
  dark: 14,
  darker: 14
} as const satisfies Record<ThemeName, number>;

const LOW_SURFACE_ALPHA = 8;

const LOW_FOREGROUND_VIVID_OFFSET = {
  light: {
    neutral: 0,
    primary: 0,
    novelty: 2,
    positive: 1,
    warning: 6,
    attention: 0
  },
  dark: {
    neutral: 0,
    primary: 8,
    novelty: 8,
    positive: 8,
    warning: 0,
    attention: 8
  },
  darker: {
    neutral: 0,
    primary: 8,
    novelty: 8,
    positive: 8,
    warning: 0,
    attention: 8
  }
} as const satisfies Record<ThemeName, Record<BadgeIntent, number>>;

const DARK_WARNING_LOW_FOREGROUND_TONE: KiskadeeTone = 80;
const ON_VIVID_HIGH_SURFACE_OFFSET = 7;
const ON_VIVID_INDICATOR_HIGH_SURFACE_OFFSET = 8;
const ON_VIVID_MEDIUM_SURFACE_OFFSET = 1;
const ON_VIVID_LOW_SURFACE_ALPHA = 12;
const ON_VIVID_LOW_FOREGROUND_OFFSET = 2;

export function createFluent2MicrosoftBadgeSchema({ c }: CreateBadgeSchemaArgs): BadgeComponent {
  const role = (intent: BadgeIntent): Role =>
    intent === 'warning' ? 'badge.warning.v2' : (`badge.${intent}` as Role);
  const color = (theme: ThemeName, intent: BadgeIntent, tone: KiskadeeTone, alpha?: number) =>
    c.resolve(
      'default',
      THEME_TRACK[theme],
      exactColor(role(intent), tone, 'component.badge', alpha)
    );
  const white = (theme: ThemeName) =>
    c.resolve('default', THEME_TRACK[theme], absoluteCap(primitive('black', 'v1'), 'light'));
  const black = (theme: ThemeName, alpha?: number) =>
    c.resolve('default', THEME_TRACK[theme], absoluteCap(primitive('black', 'v1'), 'dark', alpha));
  const vivid = (theme: ThemeName, intent: BadgeIntent) =>
    intent === 'warning' && theme !== 'light'
      ? color(theme, intent, 75)
      : c.resolve('default', THEME_TRACK[theme], referenceColor(role(intent), 'vivid'));
  const mediumSurface = (theme: ThemeName, intent: BadgeIntent) =>
    c.resolve(
      'default',
      THEME_TRACK[theme],
      referenceColor(role(intent), 'subtle', MEDIUM_SURFACE_OFFSET[theme])
    );
  const lowSurface = (theme: ThemeName) => black(theme, LOW_SURFACE_ALPHA);
  const lowForeground = (theme: ThemeName, intent: BadgeIntent) =>
    intent === 'warning' && theme !== 'light'
      ? color(theme, intent, DARK_WARNING_LOW_FOREGROUND_TONE)
      : c.resolve(
          'default',
          THEME_TRACK[theme],
          referenceColor(role(intent), 'vivid', LOW_FOREGROUND_VIVID_OFFSET[theme][intent])
        );
  const highForeground = (theme: ThemeName, intent: BadgeIntent) =>
    intent === 'warning' || (intent === 'neutral' && theme !== 'light')
      ? black(theme)
      : white(theme);

  const onVividHighSurface = (intent: BadgeIntent) =>
    c.resolve('default', 'l', referenceColor(role(intent), 'subtle', ON_VIVID_HIGH_SURFACE_OFFSET));
  const onVividIndicatorHighSurface = (intent: BadgeIntent) =>
    c.resolve(
      'default',
      'l',
      referenceColor(role(intent), 'subtle', ON_VIVID_INDICATOR_HIGH_SURFACE_OFFSET)
    );
  const onVividMediumSurface = (intent: BadgeIntent) =>
    c.resolve(
      'default',
      'l',
      referenceColor(role(intent), 'subtle', ON_VIVID_MEDIUM_SURFACE_OFFSET)
    );
  const onVividLowSurface = (theme: ThemeName) => black(theme, ON_VIVID_LOW_SURFACE_ALPHA);
  const onVividForeground = (intent: BadgeIntent) =>
    c.resolve('default', 'l', exactColor(role(intent), 65, 'component.badge'));
  const onVividLowForeground = (intent: BadgeIntent) =>
    c.resolve(
      'default',
      'l',
      referenceColor(role(intent), 'subtle', ON_VIVID_LOW_FOREGROUND_OFFSET)
    );

  const createSurfaceIntentStates = (theme: ThemeName) =>
    Object.fromEntries(
      INTENTS.map((intent) => {
        return [
          intent,
          {
            high: { rest: vivid(theme, intent) },
            medium: { rest: mediumSurface(theme, intent) },
            low: { rest: lowSurface(theme) }
          }
        ];
      })
    );

  const createOnVividSurfaceIntentStates = (theme: ThemeName, indicator = false) =>
    Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        {
          high: {
            rest: indicator ? onVividIndicatorHighSurface(intent) : onVividHighSurface(intent)
          },
          medium: { rest: onVividMediumSurface(intent) },
          low: { rest: onVividLowSurface(theme) }
        }
      ])
    );

  const createTextIntentStates = (theme: ThemeName, fullBleed = false) =>
    Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        fullBleed
          ? { high: { rest: vivid(theme, intent) } }
          : {
              high: { rest: highForeground(theme, intent) },
              medium: { rest: color(theme, intent, theme === 'light' ? 65 : 80) },
              low: { rest: lowForeground(theme, intent) }
            }
      ])
    );

  const createOnVividTextIntentStates = (theme: ThemeName, fullBleed = false) =>
    Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        fullBleed
          ? { high: { rest: vivid(theme, intent) } }
          : {
              high: { rest: onVividForeground(intent) },
              medium: { rest: onVividForeground(intent) },
              low: { rest: onVividLowForeground(intent) }
            }
      ])
    );

  const createSurfacePalette = (theme: ThemeName, indicator = false) => ({
    onSubtle: {
      boxColor: createSurfaceIntentStates(theme)
    },
    onVivid: {
      boxColor: createOnVividSurfaceIntentStates(theme, indicator)
    }
  });

  const createTextPalette = (theme: ThemeName, fullBleed = false) => ({
    onSubtle: { textColor: createTextIntentStates(theme, fullBleed) },
    onVivid: { textColor: createOnVividTextIntentStates(theme, fullBleed) }
  });

  const createSeparationPalette = (theme: ThemeName) => {
    const intents = Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        Object.fromEntries(
          ['high', 'medium', 'low'].map((emphasis) => [emphasis, { rest: white(theme) }])
        )
      ])
    );
    return {
      onSubtle: { boxColor: intents, borderColor: intents },
      onVivid: { boxColor: intents, borderColor: intents }
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
        e5: { kind: 'outer', states: { rest: 's:sm:1' } }
      }
    },
    elements: {
      e1: {
        name: 'badge-surface',
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
          's:sm:2': 's:sm:5',
          's:sm:1': 's:sm:3',
          's:md:1': 's:sm:2',
          's:lg:1': 's:sm:1',
          's:lg:2': 's:md:1'
        },
        palettes: { default: themes((theme) => createTextPalette(theme)) }
      },
      e5: {
        name: 'badge-dot-surface',
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
          borderRadius: { pill: 999 }
        },
        palettes: { default: themes((theme) => createSurfacePalette(theme, true)) }
      },
      e6: {
        name: 'badge-separation-ring',
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
        palettes: { default: themes(createSeparationPalette) }
      }
    }
  };
}
