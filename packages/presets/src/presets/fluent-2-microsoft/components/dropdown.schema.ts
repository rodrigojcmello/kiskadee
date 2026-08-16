import type { KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type DropdownComponent = NonNullable<Schema<never>['components']['dropdown']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';

type CreateFluent2MicrosoftDropdownSchemaArgs = {
  c: PresetColorGetter<'default'>;
};

const THEMES = {
  light: {
    track: 'l',
    surface: 0,
    hover: 3,
    pressed: 7,
    selected: 5,
    text: 85,
    groupLabelText: 75,
    secondaryText: 65,
    endText: 50,
    disabledText: 35
  },
  dark: {
    track: 'd',
    surface: 5,
    hover: 16,
    pressed: 10,
    selected: 12,
    text: 90,
    groupLabelText: 85,
    secondaryText: 70,
    endText: 70,
    disabledText: 45
  },
  darker: {
    track: 'd',
    surface: 3,
    hover: 12,
    pressed: 7,
    selected: 9,
    text: 90,
    groupLabelText: 85,
    secondaryText: 70,
    endText: 70,
    disabledText: 45
  }
} as const satisfies Record<
  ThemeName,
  {
    track: ThemeShortcut;
    surface: KiskadeeTone;
    hover: KiskadeeTone;
    pressed: KiskadeeTone;
    selected: KiskadeeTone;
    text: KiskadeeTone;
    groupLabelText: KiskadeeTone;
    secondaryText: KiskadeeTone;
    endText: KiskadeeTone;
    disabledText: KiskadeeTone;
  }
>;

export function createFluent2MicrosoftDropdownSchema({
  c
}: CreateFluent2MicrosoftDropdownSchemaArgs): DropdownComponent {
  const createTheme = (theme: ThemeName) => {
    const recipe = THEMES[theme];
    const transparent = c('default', recipe.track, 'dropdown.neutral', 0, 0);
    const neutralText = c('default', recipe.track, 'dropdown.neutral', recipe.text);
    const neutralGroupLabelText = c(
      'default',
      recipe.track,
      'dropdown.neutral',
      recipe.groupLabelText
    );
    const neutralEndText = c('default', recipe.track, 'dropdown.neutral', recipe.endText);
    const destructiveText = c.ref('default', recipe.track, 'dropdown.destructive', 'vivid');
    const disabledText = c('default', recipe.track, 'dropdown.neutral', recipe.disabledText);

    const textColor = {
      neutral: {
        medium: {
          rest: neutralText,
          disabled: { ref: disabledText }
        }
      },
      destructive: {
        medium: {
          rest: destructiveText,
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
          }
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
      text: {
        onSubtle: { textColor }
      },
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
                rest: destructiveText,
                disabled: { ref: disabledText }
              }
            }
          }
        }
      },
      endText: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: neutralEndText,
                disabled: { ref: disabledText }
              }
            },
            destructive: {
              medium: {
                rest: neutralEndText,
                disabled: { ref: disabledText }
              }
            }
          }
        }
      },
      groupLabelText: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: neutralGroupLabelText,
                disabled: { ref: disabledText }
              }
            },
            destructive: {
              medium: {
                rest: destructiveText,
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
  const darker = createTheme('darker');

  return {
    effects: {
      presence: {
        profile: 'fade-translate'
      },
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:lg:2' },
          fixedLevels: ['s:lg:2']
        }
      }
    },
    elements: {
      e1: {
        name: 'dropdown-surface',
        scales: {
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          paddingLeft: 4,
          borderRadius: { rounded: 4, pill: 4, square: 0 }
        },
        palettes: {
          default: {
            light: light.surface,
            dark: dark.surface,
            darker: darker.surface
          }
        }
      },
      e2: {
        name: 'dropdown-item',
        scales: {
          paddingTop: 6,
          paddingRight: 2,
          paddingBottom: 6,
          paddingLeft: 6,
          marginBottom: 2,
          borderRadius: { rounded: 4, pill: 4, square: 0 }
        },
        palettes: {
          default: { light: light.item, dark: dark.item, darker: darker.item }
        }
      },
      e3: {
        name: 'dropdown-icon',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 4 },
        palettes: {
          default: { light: light.text, dark: dark.text, darker: darker.text }
        }
      },
      e4: {
        name: 'dropdown-label',
        typography: { 's:all': 'body-medium' },
        scales: { paddingRight: 2, paddingLeft: 2 },
        palettes: {
          default: { light: light.text, dark: dark.text, darker: darker.text }
        }
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'caption-medium' },
        scales: { paddingRight: 2, paddingLeft: 2 },
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
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingLeft: 4 },
        palettes: {
          default: { light: light.text, dark: dark.text, darker: darker.text }
        }
      },
      e7: {
        name: 'dropdown-separator',
        separator: { 's:all': 'subtle' }
      },
      e8: {
        name: 'dropdown-end-text',
        typography: { 's:all': 'caption-medium' },
        scales: { paddingRight: 6, paddingLeft: 10 },
        palettes: {
          default: {
            light: light.endText,
            dark: dark.endText,
            darker: darker.endText
          }
        }
      },
      e9: {
        name: 'dropdown-group-label',
        typography: { 's:all': 'caption-medium-strong' },
        scales: {
          paddingTop: 8,
          paddingRight: 6,
          paddingBottom: 8,
          paddingLeft: 6
        },
        palettes: {
          default: {
            light: light.groupLabelText,
            dark: dark.groupLabelText,
            darker: darker.groupLabelText
          }
        }
      },
      e10: {
        name: 'dropdown-checkmark',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 4 },
        palettes: {
          default: { light: light.text, dark: dark.text, darker: darker.text }
        }
      }
    }
  };
}
