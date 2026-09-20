import type { Schema, ThemeMode } from '@kiskadee/core';
import type { CarbonIbmColorResolver } from '../carbon-ibm.color.ts';
import { tokenColor } from '../carbon-ibm.tokens.ts';

type IconComponent = NonNullable<Schema<never>['components']['icon']>;

function createIconPalette(c: CarbonIbmColorResolver, theme: ThemeMode) {
  return {
    onSubtle: {
      textColor: {
        neutral: { medium: { rest: tokenColor(c, theme, 'icon-primary', 'icon.neutral') } },
        primary: { medium: { rest: tokenColor(c, theme, 'icon-interactive', 'icon.primary') } }
      }
    },
    onVivid: {
      textColor: {
        neutral: { medium: { rest: tokenColor(c, theme, 'icon-on-color') } },
        primary: { medium: { rest: tokenColor(c, theme, 'icon-on-color') } }
      }
    }
  };
}

export function createCarbonIbmIconSchema({ c }: { c: CarbonIbmColorResolver }): IconComponent {
  return {
    elements: {
      e1: {
        name: 'glyph',
        iconSize: {
          's:sm:2': 's:sm:2',
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2',
          's:lg:3': 's:lg:3',
          's:lg:4': 's:lg:4'
        },
        palettes: {
          default: {
            light: createIconPalette(c, 'light'),
            dark: createIconPalette(c, 'dark'),
            darker: createIconPalette(c, 'darker')
          }
        }
      }
    }
  };
}
