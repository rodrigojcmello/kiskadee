import { primitive, type Schema } from '@kiskadee/core';
import {
  absoluteCap,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

type IconComponent = NonNullable<Schema<never>['components']['icon']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';

type CreateFluent2MicrosoftIconSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
};

const ICON_THEME_TRACK = {
  light: 'l',
  dark: 'd',
  darker: 'd'
} as const satisfies Record<ThemeName, ThemeShortcut>;

/**
 * What
 *     Creates the Fluent Icon color matrix for one theme.
 * Why
 *     Monochrome artwork must resolve through the preset while brand artwork keeps its own paint.
 */
function createIconPalette(c: Fluent2MicrosoftColorResolver, theme: ThemeName) {
  const track = ICON_THEME_TRACK[theme];

  return {
    onSubtle: {
      textColor: {
        neutral: {
          medium: {
            rest: c.resolve('default', track, referenceColor('icon.neutral', 'vivid'))
          }
        },
        primary: {
          medium: {
            rest: c.resolve('default', track, referenceColor('icon.primary', 'vivid'))
          }
        }
      }
    },
    onVivid: {
      textColor: {
        neutral: {
          medium: {
            rest: c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'light'))
          }
        },
        primary: {
          medium: {
            rest: c.resolve('default', 'l', referenceColor('icon.primary', 'subtle', 4))
          }
        }
      }
    }
  };
}

export function createFluent2MicrosoftIconSchema({
  c
}: CreateFluent2MicrosoftIconSchemaArgs): IconComponent {
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
