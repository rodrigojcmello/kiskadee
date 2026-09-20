import { type ProgressIntent, primitive, type Schema, type SolidColor } from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver, referenceColor } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';

type ProgressComponent = NonNullable<Schema<never>['components']['progress']>;
type Theme = 'light' | 'dark' | 'darker';
const profiles = (resolve: (intent: ProgressIntent) => SolidColor) => ({
  neutral: { medium: { rest: resolve('neutral') } },
  primary: { medium: { rest: resolve('primary') } },
  positive: { medium: { rest: resolve('positive') } },
  warning: { medium: { rest: resolve('warning') } },
  destructive: { medium: { rest: resolve('destructive') } }
});

export function createCarbonIbmProgressSchema({
  c
}: {
  c: CarbonIbmColorResolver;
}): ProgressComponent {
  const palette = (theme: Theme) => {
    const resolveIndicator = (intent: ProgressIntent) => {
      const token = {
        neutral: 'border-inverse',
        primary: 'border-interactive',
        positive: 'support-success',
        warning: 'support-warning',
        destructive: 'support-error'
      } as const;
      return tokenColor(c, theme, token[intent], `progress.${intent}`);
    };
    return {
      onSubtle: {
        boxColor: profiles(resolveIndicator)
      },
      onVivid: {
        boxColor: profiles((intent) =>
          c.resolve('default', 'l', referenceColor(`progress.${intent}`, 'subtle'))
        )
      }
    };
  };
  const trackPalette = (theme: Theme) => ({
    onSubtle: {
      boxColor: {
        neutral: { medium: { rest: tokenColor(c, theme, 'border-subtle-01', 'progress.neutral') } }
      }
    },
    onVivid: {
      boxColor: {
        neutral: {
          medium: {
            rest: c.resolve(
              'default',
              theme === 'light' ? 'l' : 'd',
              absoluteCap(primitive('black', 'v1'), 'light', 24)
            )
          }
        }
      }
    }
  });
  return {
    options: { density: { compact: 's:md:1', regular: 's:lg:1', spacious: 's:lg:1' } },
    elements: {
      e1: { name: 'progress-root' },
      e2: {
        name: 'progress-track',
        scales: { boxHeight: { 's:md:1': 2, 's:lg:1': 4 }, borderRadius: { pill: 0 } },
        palettes: {
          default: {
            light: trackPalette('light'),
            dark: trackPalette('dark'),
            darker: trackPalette('darker')
          }
        }
      },
      e3: {
        name: 'progress-indicator',
        scales: { borderRadius: { pill: 0 } },
        palettes: {
          default: { light: palette('light'), dark: palette('dark'), darker: palette('darker') }
        }
      }
    }
  };
}
