import { primitive, type Schema } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorLocator,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

type DropdownComponent = NonNullable<Schema<never>['components']['dropdown']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';

type CreateFluent2MicrosoftDropdownSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
};

const neutralReference = (reference: 'subtle' | 'vivid', offset = 0) =>
  referenceColor('dropdown.neutral', reference, offset);
const destructiveExact = (tone: 2 | 7 | 9 | 14) =>
  exactColor('dropdown.destructive', tone, 'component.dropdown');

const THEMES = {
  light: {
    track: 'l',
    transparent: absoluteCap(primitive('black', 'v1'), 'light', 0),
    surface: absoluteCap(primitive('black', 'v1'), 'light'),
    hover: referenceColor(primitive('black', 'v1'), 'subtle', -2),
    pressed: neutralReference('subtle', 3),
    selected: neutralReference('subtle', -1),
    text: neutralReference('vivid'),
    groupLabelText: neutralReference('vivid', -2),
    secondaryText: neutralReference('vivid', -4),
    endText: neutralReference('vivid', -7),
    disabledText: neutralReference('vivid', -10),
    brandSelected: referenceColor('icon.primary', 'vivid'),
    brandHover: referenceColor('icon.primary', 'vivid', 1),
    brandPressed: referenceColor('icon.primary', 'vivid', 2),
    destructiveHover: destructiveExact(2),
    destructivePressed: destructiveExact(9),
    destructiveSelected: destructiveExact(7)
  },
  dark: {
    track: 'd',
    transparent: absoluteCap(primitive('black', 'v1'), 'dark', 0),
    surface: neutralReference('subtle', 1),
    hover: referenceColor(primitive('black', 'v1'), 'subtle', 10),
    pressed: neutralReference('subtle', 6),
    selected: neutralReference('subtle', 7),
    text: neutralReference('vivid'),
    groupLabelText: neutralReference('vivid', -1),
    secondaryText: neutralReference('vivid', -4),
    endText: neutralReference('vivid', -4),
    disabledText: neutralReference('vivid', -9),
    brandSelected: referenceColor('icon.primary', 'vivid'),
    brandHover: referenceColor('icon.primary', 'vivid', -1),
    brandPressed: referenceColor('icon.primary', 'vivid', -3),
    destructiveHover: destructiveExact(14),
    destructivePressed: destructiveExact(9),
    destructiveSelected: destructiveExact(7)
  },
  darker: {
    track: 'd',
    transparent: absoluteCap(primitive('black', 'v1'), 'dark', 0),
    surface: neutralReference('subtle', -1),
    hover: referenceColor(primitive('black', 'v1'), 'subtle', 7),
    pressed: neutralReference('subtle', 3),
    selected: neutralReference('subtle', 5),
    text: neutralReference('vivid'),
    groupLabelText: neutralReference('vivid', -1),
    secondaryText: neutralReference('vivid', -4),
    endText: neutralReference('vivid', -4),
    disabledText: neutralReference('vivid', -9),
    brandSelected: referenceColor('icon.primary', 'vivid'),
    brandHover: referenceColor('icon.primary', 'vivid', -1),
    brandPressed: referenceColor('icon.primary', 'vivid', -3),
    destructiveHover: destructiveExact(14),
    destructivePressed: destructiveExact(9),
    destructiveSelected: destructiveExact(7)
  }
} as const satisfies Record<
  ThemeName,
  {
    track: ThemeShortcut;
    transparent: Fluent2MicrosoftColorLocator;
    surface: Fluent2MicrosoftColorLocator;
    hover: Fluent2MicrosoftColorLocator;
    pressed: Fluent2MicrosoftColorLocator;
    selected: Fluent2MicrosoftColorLocator;
    text: Fluent2MicrosoftColorLocator;
    groupLabelText: Fluent2MicrosoftColorLocator;
    secondaryText: Fluent2MicrosoftColorLocator;
    endText: Fluent2MicrosoftColorLocator;
    disabledText: Fluent2MicrosoftColorLocator;
    brandSelected: Fluent2MicrosoftColorLocator;
    brandHover: Fluent2MicrosoftColorLocator;
    brandPressed: Fluent2MicrosoftColorLocator;
    destructiveHover: Fluent2MicrosoftColorLocator;
    destructivePressed: Fluent2MicrosoftColorLocator;
    destructiveSelected: Fluent2MicrosoftColorLocator;
  }
>;

export function createFluent2MicrosoftDropdownSchema({
  c
}: CreateFluent2MicrosoftDropdownSchemaArgs): DropdownComponent {
  const createTheme = (theme: ThemeName) => {
    const recipe = THEMES[theme];
    const resolve = (locator: Fluent2MicrosoftColorLocator) =>
      c.resolve('default', recipe.track, locator);
    const transparent = resolve(recipe.transparent);
    const neutralHover = resolve(recipe.hover);
    const neutralText = resolve(recipe.text);
    const neutralGroupLabelText = resolve(recipe.groupLabelText);
    const neutralEndText = resolve(recipe.endText);
    const destructiveText = resolve(referenceColor('dropdown.destructive', 'vivid'));
    const disabledText = resolve(recipe.disabledText);
    const brandSelected = resolve(recipe.brandSelected);
    const brandHover = resolve(recipe.brandHover);
    const brandPressed = resolve(recipe.brandPressed);

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
                rest: resolve(recipe.surface)
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
                rest: resolve(recipe.surface)
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
                pressed: resolve(recipe.pressed),
                selected: {
                  rest: resolve(recipe.selected),
                  hover: resolve(recipe.selected),
                  pressed: resolve(recipe.selected)
                },
                disabled: transparent
              }
            },
            destructive: {
              medium: {
                rest: transparent,
                hover: resolve(recipe.destructiveHover),
                pressed: resolve(recipe.destructivePressed),
                selected: {
                  rest: resolve(recipe.destructiveSelected),
                  hover: resolve(recipe.destructiveSelected),
                  pressed: resolve(recipe.destructiveSelected)
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
                rest: resolve(recipe.secondaryText),
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
    options: {
      leadingIconComposition: 'item-and-selection',
      selectedItemBackground: true
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
