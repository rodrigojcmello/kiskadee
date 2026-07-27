import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Fluent2MicrosoftSegmentName = 'default';
type IconComponent = NonNullable<Schema<never>['components']['icon']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';

type CreateFluent2MicrosoftIconSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
};

const ICON_SIZES = {
  's:sm:2': 12,
  's:sm:1': 16,
  's:md:1': 20,
  's:lg:1': 24,
  's:lg:2': 28,
  's:lg:3': 32,
  's:lg:4': 48
} as const;

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
function createIconPalette(c: PresetColorGetter<Fluent2MicrosoftSegmentName>, theme: ThemeName) {
  const track = ICON_THEME_TRACK[theme];

  return {
    onSubtle: {
      textColor: {
        neutral: {
          medium: {
            rest: c.ref('default', track, 'icon.neutral', 'vivid')
          }
        },
        primary: {
          medium: {
            rest: c.ref('default', track, 'icon.primary', 'vivid')
          }
        }
      }
    },
    onVivid: {
      textColor: {
        neutral: {
          medium: {
            rest: c('default', 'l', 'icon.neutral', 0)
          }
        },
        primary: {
          medium: {
            rest: c.ref('default', 'l', 'icon.primary', 'subtle', 4)
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
        scales: {
          boxWidth: ICON_SIZES,
          boxHeight: ICON_SIZES
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
