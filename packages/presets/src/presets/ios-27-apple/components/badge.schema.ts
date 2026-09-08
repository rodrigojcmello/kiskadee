import type { BadgeIntent, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type BadgeComponent = NonNullable<Schema<'default'>['components']['badge']>;
type ThemeName = 'light' | 'dark' | 'darker';

const INTENTS = [
  'neutral',
  'primary',
  'novelty',
  'positive',
  'warning',
  'attention'
] as const satisfies readonly BadgeIntent[];

export function createIos27AppleBadgeSchema({
  c
}: {
  c: PresetColorGetter<'default'>;
}): BadgeComponent {
  const white = (alpha?: number) => c('default', 'l', 'neutral', 0, alpha);
  const black = (alpha?: number) => c('default', 'l', 'neutral', 100, alpha);
  const role = (intent: BadgeIntent) => `badge.${intent}` as const;
  const track = (theme: ThemeName) => (theme === 'light' ? 'l' : 'd');
  const vivid = (theme: ThemeName, intent: BadgeIntent) =>
    c.ref('default', track(theme), role(intent), 'vivid');
  const highForeground = (theme: ThemeName, intent: BadgeIntent) => {
    // Attention preserves Apple's white-on-red badge; other intents are documented extensions.
    const lightForeground =
      intent === 'attention' ||
      (theme === 'light' && (intent === 'neutral' || intent === 'novelty'));
    return lightForeground ? white() : black();
  };
  const readableForeground = (theme: ThemeName, intent: BadgeIntent) =>
    c.ref(
      'default',
      track(theme),
      role(intent),
      'vivid',
      intent === 'neutral' ? 0 : theme === 'light' ? 14 : 5
    );
  const themes = <T>(factory: (theme: ThemeName) => T) => ({
    light: factory('light'),
    dark: factory('dark'),
    darker: factory('darker')
  });
  const surfaces = (theme: ThemeName, onVivid: boolean) =>
    Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        {
          high: { rest: vivid(theme, intent) },
          medium: {
            rest: c.ref('default', onVivid ? 'l' : track(theme), role(intent), 'subtle')
          },
          low: {
            rest: onVivid ? black(12) : c.ref('default', track(theme), role(intent), 'vivid', 0, 10)
          }
        }
      ])
    );
  const foregrounds = (theme: ThemeName, onVivid: boolean) =>
    Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        {
          high: { rest: highForeground(theme, intent) },
          medium: { rest: readableForeground(onVivid ? 'light' : theme, intent) },
          low: { rest: onVivid ? white() : readableForeground(theme, intent) }
        }
      ])
    );
  const surfacePalettes = () =>
    themes((theme) => ({
      onSubtle: { boxColor: surfaces(theme, false) },
      onVivid: { boxColor: surfaces(theme, true) }
    }));
  const foregroundPalettes = () =>
    themes((theme) => ({
      onSubtle: { textColor: foregrounds(theme, false) },
      onVivid: { textColor: foregrounds(theme, true) }
    }));

  return {
    elements: {
      e1: {
        name: 'badge-surface',
        scales: {
          boxHeight: {
            's:sm:3': 14,
            's:sm:2': 16,
            's:sm:1': 18,
            's:md:1': 20,
            's:lg:1': 24,
            's:lg:2': 28
          },
          paddingTop: {
            's:sm:3': 0,
            's:sm:2': 1,
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 2,
            's:lg:2': 3
          },
          paddingBottom: {
            's:sm:3': 0,
            's:sm:2': 1,
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 2,
            's:lg:2': 3
          },
          paddingLeft: {
            's:sm:3': 3,
            's:sm:2': 4,
            's:sm:1': 5,
            's:md:1': 6,
            's:lg:1': 7,
            's:lg:2': 8
          },
          paddingRight: {
            's:sm:3': 3,
            's:sm:2': 4,
            's:sm:1': 5,
            's:md:1': 6,
            's:lg:1': 7,
            's:lg:2': 8
          },
          borderRadius: { square: 0, rounded: 5, pill: 100 }
        },
        palettes: { default: surfacePalettes() }
      },
      e2: {
        name: 'badge-content',
        typography: {
          's:sm:3': 'caption-small',
          's:sm:2': 'caption-small',
          's:sm:1': 'caption-medium',
          's:md:1': 'label-small',
          's:lg:1': 'body-small',
          's:lg:2': 'body-medium'
        },
        palettes: { default: foregroundPalettes() }
      },
      e3: {
        name: 'badge-full-bleed-mark',
        iconSize: {
          's:sm:3': 's:sm:5',
          's:sm:2': 's:sm:4',
          's:sm:1': 's:sm:3',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2'
        },
        scales: { borderRadius: { pill: 100 } },
        palettes: {
          default: themes((theme) => {
            const color = Object.fromEntries(
              INTENTS.map((intent) => [intent, { high: { rest: vivid(theme, intent) } }])
            );
            return {
              onSubtle: { textColor: color },
              onVivid: { textColor: color }
            };
          })
        }
      },
      e4: {
        name: 'badge-contained-mark-icon',
        iconSize: {
          's:sm:3': 's:sm:5',
          's:sm:2': 's:sm:5',
          's:sm:1': 's:sm:4',
          's:md:1': 's:sm:3',
          's:lg:1': 's:sm:1',
          's:lg:2': 's:md:1'
        },
        palettes: { default: foregroundPalettes() }
      },
      e5: {
        name: 'badge-dot-surface',
        scales: {
          boxHeight: {
            's:sm:3': 8,
            's:sm:2': 12,
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 24,
            's:lg:2': 32
          },
          boxWidth: {
            's:sm:3': 8,
            's:sm:2': 12,
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 24,
            's:lg:2': 32
          },
          borderRadius: { pill: 100 }
        },
        palettes: { default: surfacePalettes() }
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
          borderRadius: { square: 0, rounded: 5, pill: 100 }
        },
        palettes: {
          default: themes(() => {
            const color = Object.fromEntries(
              INTENTS.map((intent) => [
                intent,
                { high: { rest: white() }, medium: { rest: white() }, low: { rest: white() } }
              ])
            );
            return {
              onSubtle: { boxColor: color, borderColor: color },
              onVivid: { boxColor: color, borderColor: color }
            };
          })
        }
      }
    }
  };
}
