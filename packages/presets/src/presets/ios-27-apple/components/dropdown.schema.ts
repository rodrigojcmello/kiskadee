import { contour, fg, type Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../ios-27-apple.schema.ts';

type DropdownComponent = NonNullable<Schema<Segment>['components']['dropdown']>;
type ThemeName = 'light' | 'dark' | 'darker';

type CreateIos27AppleDropdownSchemaArgs = {
  c: PresetColorGetter<Segment>;
};

export function createIos27AppleDropdownSchema({
  c
}: CreateIos27AppleDropdownSchemaArgs): DropdownComponent {
  const createTheme = (theme: ThemeName) => {
    const track = theme === 'light' ? 'l' : 'd';
    const transparent = c('default', 'l', 'dropdown.neutral', 100, 0);
    const disabledText = fg.parentState(`neutral.standard.${theme}.onSubtle.lowest`);
    const neutralText = fg(`neutral.standard.${theme}.onSubtle.medium`);
    const secondaryText = fg(`neutral.standard.${theme}.onSubtle.low`);
    const textColor = {
      neutral: { medium: { rest: neutralText, disabled: disabledText } },
      destructive: {
        medium: {
          rest: c.ref('default', track, 'dropdown.destructive', 'vivid'),
          disabled: disabledText
        }
      }
    };
    // Opaque presentation uses normal Apple labels and fills, not glass vibrancy.
    const hover = c(
      'default',
      track,
      'dropdown.neutral',
      track === 'l' ? 40 : 55,
      track === 'l' ? 12 : 24
    );
    const pressed = c(
      'default',
      track,
      'dropdown.neutral',
      track === 'l' ? 35 : 55,
      track === 'l' ? 16 : 32
    );
    const surface = c('default', track, 'dropdown.neutral', track === 'l' ? 0 : 5);
    const itemColors = {
      rest: transparent,
      hover,
      pressed,
      selected: { rest: hover },
      // Terminal reset prevents selected or pointer paint leaking into disabled rows.
      disabled: transparent
    };
    const auxiliaryText = {
      neutral: { medium: { rest: secondaryText, disabled: disabledText } },
      destructive: { medium: { rest: secondaryText, disabled: disabledText } }
    };

    return {
      surface: {
        onSubtle: {
          boxColor: { neutral: { medium: { rest: surface } } },
          borderColor: {
            neutral: { medium: { rest: contour(`neutral.standard.${theme}.onSubtle.low`) } }
          }
        }
      },
      scrollAffordance: {
        onSubtle: {
          boxColor: { neutral: { medium: { rest: surface } } },
          textColor
        }
      },
      item: {
        onSubtle: {
          boxColor: {
            neutral: { medium: itemColors },
            destructive: { medium: itemColors }
          }
        }
      },
      text: { onSubtle: { textColor } },
      auxiliaryText: { onSubtle: { textColor: auxiliaryText } }
    };
  };

  const light = createTheme('light');
  const dark = createTheme('dark');
  const darker = createTheme('darker');

  return {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:lg:4' },
          fixedLevels: ['s:lg:4']
        }
      }
    },
    options: {
      leadingIconComposition: 'item-and-selection',
      selectedItemBackground: false
    },
    elements: {
      e1: {
        name: 'dropdown-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          paddingTop: 10,
          paddingRight: 10,
          paddingBottom: 10,
          paddingLeft: 10,
          borderWidth: 0.5,
          borderRadius: { rounded: 34, pill: 34, square: 0 }
        },
        palettes: { default: { light: light.surface, dark: dark.surface, darker: darker.surface } }
      },
      e2: {
        name: 'dropdown-item',
        scales: {
          paddingTop: 10,
          paddingRight: 12,
          paddingBottom: 10,
          paddingLeft: 12,
          borderRadius: { rounded: 24, pill: 24, square: 0 }
        },
        palettes: { default: { light: light.item, dark: dark.item, darker: darker.item } }
      },
      e3: {
        name: 'dropdown-icon',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 8 },
        palettes: { default: { light: light.text, dark: dark.text, darker: darker.text } }
      },
      e4: {
        name: 'dropdown-label',
        typography: { 's:all': 'body-medium' },
        palettes: { default: { light: light.text, dark: dark.text, darker: darker.text } }
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'label-small' },
        palettes: {
          default: {
            light: light.auxiliaryText,
            dark: dark.auxiliaryText,
            darker: darker.auxiliaryText
          }
        }
      },
      e6: {
        name: 'dropdown-trailing-icon',
        iconSize: { 's:all': 's:sm:1' },
        palettes: { default: { light: light.text, dark: dark.text, darker: darker.text } }
      },
      e7: {
        name: 'dropdown-separator',
        separator: { 's:all': 'subtle' }
      },
      e8: {
        name: 'dropdown-end-text',
        typography: { 's:all': 'body-small' },
        palettes: {
          default: {
            light: light.auxiliaryText,
            dark: dark.auxiliaryText,
            darker: darker.auxiliaryText
          }
        }
      },
      e9: {
        name: 'dropdown-group-label',
        typography: { 's:all': 'label-small-strong' },
        scales: {
          paddingTop: 4,
          paddingRight: 12,
          paddingBottom: 10,
          paddingLeft: 12
        },
        palettes: {
          default: {
            light: light.auxiliaryText,
            dark: dark.auxiliaryText,
            darker: darker.auxiliaryText
          }
        }
      },
      e10: {
        name: 'dropdown-checkmark',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 8 },
        palettes: { default: { light: light.text, dark: dark.text, darker: darker.text } }
      },
      e11: {
        name: 'dropdown-scroll-affordance',
        iconSize: { 's:all': 's:sm:1' },
        palettes: {
          default: {
            light: light.scrollAffordance,
            dark: dark.scrollAffordance,
            darker: darker.scrollAffordance
          }
        }
      }
    }
  };
}
