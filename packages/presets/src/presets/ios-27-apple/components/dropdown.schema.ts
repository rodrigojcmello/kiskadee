import type { KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../ios-27-apple.schema.ts';

type DropdownComponent = NonNullable<Schema<Segment>['components']['dropdown']>;
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';

type CreateIos27AppleDropdownSchemaArgs = {
  c: PresetColorGetter<Segment>;
};

const THEMES = {
  light: {
    track: 'l',
    surface: 0,
    border: 10,
    hover: 3,
    pressed: 7,
    selected: 5,
    text: 85,
    secondaryText: 60,
    disabledText: 35
  },
  dark: {
    track: 'd',
    surface: 5,
    border: 16,
    hover: 16,
    pressed: 10,
    selected: 12,
    text: 90,
    secondaryText: 65,
    disabledText: 45
  }
} as const satisfies Record<
  ThemeName,
  {
    track: ThemeShortcut;
    surface: KiskadeeTone;
    border: KiskadeeTone;
    hover: KiskadeeTone;
    pressed: KiskadeeTone;
    selected: KiskadeeTone;
    text: KiskadeeTone;
    secondaryText: KiskadeeTone;
    disabledText: KiskadeeTone;
  }
>;

export function createIos27AppleDropdownSchema({
  c
}: CreateIos27AppleDropdownSchemaArgs): DropdownComponent {
  const createTheme = (theme: ThemeName) => {
    const recipe = THEMES[theme];
    const transparent = c('default', recipe.track, 'dropdown.neutral', 0, 0);
    const disabledText = c('default', recipe.track, 'dropdown.neutral', recipe.disabledText);
    const textColor = {
      neutral: {
        medium: {
          rest: c('default', recipe.track, 'dropdown.neutral', recipe.text),
          disabled: { ref: disabledText }
        }
      },
      destructive: {
        medium: {
          rest: c.ref('default', recipe.track, 'dropdown.destructive', 'vivid'),
          disabled: { ref: disabledText }
        }
      }
    };

    return {
      surface: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: c('default', recipe.track, 'dropdown.neutral', recipe.surface)
              }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest: c('default', recipe.track, 'dropdown.neutral', recipe.border)
              }
            }
          }
        }
      },
      scrollAffordance: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: c('default', recipe.track, 'dropdown.neutral', recipe.surface)
              }
            }
          },
          textColor
        }
      },
      item: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: transparent,
                hover: c('default', recipe.track, 'dropdown.neutral', recipe.hover),
                pressed: c('default', recipe.track, 'dropdown.neutral', recipe.pressed),
                selected: {
                  rest: c('default', recipe.track, 'dropdown.neutral', recipe.selected)
                },
                disabled: transparent
              }
            },
            destructive: {
              medium: {
                rest: transparent,
                hover: c('default', recipe.track, 'dropdown.destructive', 5),
                pressed: c('default', recipe.track, 'dropdown.destructive', 9),
                selected: {
                  rest: c('default', recipe.track, 'dropdown.destructive', 7)
                },
                disabled: transparent
              }
            }
          }
        }
      },
      text: { onSubtle: { textColor } },
      auxiliaryText: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: c('default', recipe.track, 'dropdown.neutral', recipe.secondaryText),
                disabled: { ref: disabledText }
              }
            },
            destructive: {
              medium: {
                rest: c.ref('default', recipe.track, 'dropdown.destructive', 'vivid'),
                disabled: { ref: disabledText }
              }
            }
          }
        }
      }
    };
  };

  const light = createTheme('light');
  const dark = createTheme('dark');

  return {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:sm:1' },
          fixedLevels: ['s:sm:1']
        }
      }
    },
    elements: {
      e1: {
        name: 'dropdown-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          paddingLeft: 4,
          borderWidth: 1,
          borderRadius: { rounded: 14, pill: 14, square: 0 }
        },
        palettes: { default: { light: light.surface, dark: dark.surface } }
      },
      e2: {
        name: 'dropdown-item',
        scales: {
          paddingTop: 10,
          paddingRight: 12,
          paddingBottom: 10,
          paddingLeft: 12,
          borderRadius: { rounded: 10, pill: 10, square: 0 }
        },
        palettes: { default: { light: light.item, dark: dark.item } }
      },
      e3: {
        name: 'dropdown-icon',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 10 },
        palettes: { default: { light: light.text, dark: dark.text } }
      },
      e4: {
        name: 'dropdown-label',
        typography: { 's:all': 'body-small' },
        palettes: { default: { light: light.text, dark: dark.text } }
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'label-small' },
        palettes: {
          default: { light: light.auxiliaryText, dark: dark.auxiliaryText }
        }
      },
      e6: {
        name: 'dropdown-trailing-icon',
        iconSize: { 's:all': 's:sm:1' },
        palettes: { default: { light: light.text, dark: dark.text } }
      },
      e7: {
        name: 'dropdown-separator',
        separator: { 's:all': 'subtle' }
      },
      e8: {
        name: 'dropdown-end-text',
        typography: { 's:all': 'label-small' },
        palettes: {
          default: { light: light.auxiliaryText, dark: dark.auxiliaryText }
        }
      },
      e9: {
        name: 'dropdown-group-label',
        typography: { 's:all': 'label-small-strong' },
        scales: {
          paddingTop: 10,
          paddingRight: 12,
          paddingBottom: 10,
          paddingLeft: 12
        },
        palettes: {
          default: { light: light.auxiliaryText, dark: dark.auxiliaryText }
        }
      },
      e10: {
        name: 'dropdown-checkmark',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 10 },
        palettes: { default: { light: light.text, dark: dark.text } }
      },
      e11: {
        name: 'dropdown-scroll-affordance',
        iconSize: { 's:all': 's:sm:1' },
        palettes: {
          default: { light: light.scrollAffordance, dark: dark.scrollAffordance }
        }
      }
    }
  };
}
