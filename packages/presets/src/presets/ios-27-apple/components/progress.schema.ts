import type { ProgressIntent, ProgressIntentColorMap, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ProgressComponent = NonNullable<Schema<'default'>['components']['progress']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ProgressRole = `progress.${ProgressIntent}` | 'progress.warning.v2';

const DARK_INDICATOR_OFFSETS = {
  neutral: 0,
  primary: 1,
  positive: 3,
  warning: 3,
  destructive: 0
} as const satisfies Record<ProgressIntent, number>;

export function createIos27AppleProgressSchema({
  c
}: {
  c: PresetColorGetter<'default'>;
}): ProgressComponent {
  const role = (intent: ProgressIntent): ProgressRole =>
    intent === 'warning' ? 'progress.warning.v2' : `progress.${intent}`;
  const themes = <T>(factory: (theme: ThemeName) => T) => ({
    light: factory('light'),
    dark: factory('dark'),
    darker: factory('darker')
  });
  const indicator = (theme: ThemeName, onVivid: boolean): ProgressIntentColorMap => {
    const medium = (intent: ProgressIntent) => ({
      medium: {
        rest: onVivid
          ? c.ref('default', 'l', role(intent), 'subtle')
          : c.ref(
              'default',
              theme === 'light' ? 'l' : 'd',
              role(intent),
              'vivid',
              theme === 'light' ? 0 : DARK_INDICATOR_OFFSETS[intent]
            )
      }
    });
    return {
      neutral: medium('neutral'),
      primary: medium('primary'),
      positive: medium('positive'),
      warning: medium('warning'),
      destructive: medium('destructive')
    };
  };

  return {
    options: { density: { compact: 's:md:1', spacious: 's:lg:1' } },
    elements: {
      e1: { name: 'progress-root' },
      e2: {
        name: 'progress-track',
        scales: {
          boxHeight: { 's:md:1': 2, 's:lg:1': 4 },
          borderRadius: { pill: 100 }
        },
        palettes: {
          default: themes((theme) => ({
            onSubtle: {
              boxColor: {
                neutral: {
                  medium: {
                    // Figma Fills/Primary, mapped independently through the approved de-para.
                    rest:
                      theme === 'light'
                        ? c('default', 'l', 'neutral', 35, 20)
                        : c('default', 'd', 'neutral', 55, 36)
                  }
                }
              }
            },
            onVivid: {
              boxColor: {
                neutral: { medium: { rest: c('default', 'l', 'neutral', 0, 24) } }
              }
            }
          }))
        }
      },
      e3: {
        name: 'progress-indicator',
        scales: { borderRadius: { pill: 100 } },
        palettes: {
          default: themes((theme) => ({
            onSubtle: { boxColor: indicator(theme, false) },
            onVivid: { boxColor: indicator(theme, true) }
          }))
        }
      }
    }
  };
}
