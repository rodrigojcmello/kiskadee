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
    hover: 2,
    pressed: 7,
    selected: 5,
    text: 85,
    groupLabelText: 75,
    secondaryText: 65,
    endText: 50,
    disabledText: 35,
    brandSelected: 50,
    brandHover: 55,
    brandPressed: 60,
    destructiveHover: 2
  },
  dark: {
    track: 'd',
    surface: 5,
    hover: 18,
    pressed: 10,
    selected: 12,
    text: 90,
    groupLabelText: 85,
    secondaryText: 70,
    endText: 70,
    disabledText: 45,
    brandSelected: 40,
    brandHover: 35,
    brandPressed: 28,
    destructiveHover: 14
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
    disabledText: 45,
    brandSelected: 40,
    brandHover: 35,
    brandPressed: 28,
    destructiveHover: 14
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
    brandSelected: KiskadeeTone;
    brandHover: KiskadeeTone;
    brandPressed: KiskadeeTone;
    destructiveHover: KiskadeeTone;
  }
>;

export function createFluent2MicrosoftDropdownSchema({
  c
}: CreateFluent2MicrosoftDropdownSchemaArgs): DropdownComponent {
  const createTheme = (theme: ThemeName) => {
    const recipe = THEMES[theme];
    const transparent = c('default', recipe.track, 'dropdown.neutral', 0, 0);
    const neutralHover = c('default', recipe.track, 'primitive.black.v1', recipe.hover);
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
    const brandSelected = c('default', recipe.track, 'icon.primary', recipe.brandSelected);
    const brandHover = c('default', recipe.track, 'icon.primary', recipe.brandHover);
    const brandPressed = c('default', recipe.track, 'icon.primary', recipe.brandPressed);

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
    const iconTextColor = {
      neutral: {
        medium: {
          rest: neutralText,
          hover: { ref: brandHover },
          pressed: { ref: brandPressed },
          selected: {
            rest: { ref: brandSelected },
            hover: { ref: brandHover },
            pressed: { ref: brandPressed }
          },
          disabled: { ref: disabledText }
        }
      },
      destructive: textColor.destructive
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
                hover: neutralHover,
                pressed: c('default', recipe.track, 'dropdown.neutral', recipe.pressed),
                selected: {
                  rest: c('default', recipe.track, 'dropdown.neutral', recipe.selected),
                  hover: c('default', recipe.track, 'dropdown.neutral', recipe.selected),
                  pressed: c('default', recipe.track, 'dropdown.neutral', recipe.selected)
                },
                disabled: transparent
              }
            },
            destructive: {
              medium: {
                rest: transparent,
                hover: c('default', recipe.track, 'dropdown.destructive', recipe.destructiveHover),
                pressed: c('default', recipe.track, 'dropdown.destructive', 9),
                selected: {
                  rest: c('default', recipe.track, 'dropdown.destructive', 7),
                  hover: c('default', recipe.track, 'dropdown.destructive', 7),
                  pressed: c('default', recipe.track, 'dropdown.destructive', 7)
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
      iconText: {
        onSubtle: { textColor: iconTextColor }
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
          paddingTop: {
            's:md:1': { 'bp:all': 9, 'bp:lg:1': 6 },
            's:lg:1': 9
          },
          paddingRight: 2,
          paddingBottom: {
            's:md:1': { 'bp:all': 9, 'bp:lg:1': 6 },
            's:lg:1': 9
          },
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
        iconSize: {
          's:md:1': { 'bp:all': 's:lg:1', 'bp:lg:1': 's:md:1' },
          's:lg:1': 's:lg:1'
        },
        scales: { paddingRight: 6 },
        palettes: {
          default: { light: light.iconText, dark: dark.iconText, darker: darker.iconText }
        }
      },
      e4: {
        name: 'dropdown-label',
        typography: {
          's:md:1': { 'bp:all': 'body-large', 'bp:lg:1': 'body-medium' },
          's:lg:1': 'body-large'
        },
        scales: { paddingRight: 10, paddingLeft: 6 },
        palettes: {
          default: { light: light.text, dark: dark.text, darker: darker.text }
        }
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'caption-medium' },
        scales: { paddingRight: 10, paddingLeft: 6 },
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
        iconSize: {
          's:md:1': { 'bp:all': 's:lg:1', 'bp:lg:1': 's:md:1' },
          's:lg:1': 's:lg:1'
        },
        scales: { paddingLeft: 6 },
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
        scales: { paddingRight: 6, paddingLeft: 12 },
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
          paddingLeft: 6,
          marginLeft: 6
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
        name: 'dropdown-selection-indicator',
        iconSize: {
          's:md:1': { 'bp:all': 's:lg:1', 'bp:lg:1': 's:md:1' },
          's:lg:1': 's:lg:1'
        },
        scales: { paddingRight: 6 },
        palettes: {
          default: { light: light.text, dark: dark.text, darker: darker.text }
        }
      },
      e11: {
        name: 'dropdown-scroll-affordance',
        iconSize: {
          's:md:1': { 'bp:all': 's:lg:1', 'bp:lg:1': 's:md:1' },
          's:lg:1': 's:lg:1'
        },
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
