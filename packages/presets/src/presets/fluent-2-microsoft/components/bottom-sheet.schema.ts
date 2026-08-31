import { primitive, type Schema } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorLocator,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

type BottomSheetComponent = NonNullable<Schema<never>['components']['bottomSheet']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';

type CreateFluent2MicrosoftBottomSheetSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
};

const neutralReference = (reference: 'subtle' | 'vivid', offset = 0) =>
  referenceColor('bottomSheet.neutral', reference, offset);
const neutralExact = (tone: 45 | 50 | 55) =>
  exactColor('bottomSheet.neutral', tone, 'component.bottom-sheet');
const destructiveExact = (tone: 5 | 7 | 9) =>
  exactColor('bottomSheet.destructive', tone, 'component.bottom-sheet');

const THEMES = {
  light: {
    track: 'l',
    transparent: absoluteCap(primitive('black', 'v1'), 'light', 0),
    surface: absoluteCap(primitive('black', 'v1'), 'light'),
    handle: neutralExact(45),
    hover: referenceColor(primitive('black', 'v1'), 'subtle', -2),
    pressed: neutralReference('subtle', 3),
    selected: neutralReference('subtle', 1),
    text: neutralReference('vivid'),
    groupLabelText: neutralReference('vivid', -2),
    secondaryText: neutralReference('vivid', -4),
    endText: neutralReference('vivid', -7),
    disabledText: neutralReference('vivid', -10),
    destructiveHover: destructiveExact(5),
    destructivePressed: destructiveExact(9),
    destructiveSelected: destructiveExact(7)
  },
  dark: {
    track: 'd',
    transparent: absoluteCap(primitive('black', 'v1'), 'dark', 0),
    surface: neutralReference('subtle', 1),
    handle: neutralExact(55),
    hover: referenceColor(primitive('black', 'v1'), 'subtle', 10),
    pressed: neutralReference('subtle', 6),
    selected: neutralReference('subtle', 7),
    text: neutralReference('vivid'),
    groupLabelText: neutralReference('vivid', -1),
    secondaryText: neutralReference('vivid', -4),
    endText: neutralReference('vivid', -4),
    disabledText: neutralReference('vivid', -9),
    destructiveHover: destructiveExact(5),
    destructivePressed: destructiveExact(9),
    destructiveSelected: destructiveExact(7)
  },
  darker: {
    track: 'd',
    transparent: absoluteCap(primitive('black', 'v1'), 'dark', 0),
    surface: neutralReference('subtle', -1),
    handle: neutralExact(50),
    hover: referenceColor(primitive('black', 'v1'), 'subtle', 7),
    pressed: neutralReference('subtle', 3),
    selected: neutralReference('subtle', 5),
    text: neutralReference('vivid'),
    groupLabelText: neutralReference('vivid', -1),
    secondaryText: neutralReference('vivid', -4),
    endText: neutralReference('vivid', -4),
    disabledText: neutralReference('vivid', -9),
    destructiveHover: destructiveExact(5),
    destructivePressed: destructiveExact(9),
    destructiveSelected: destructiveExact(7)
  }
} as const satisfies Record<
  ThemeName,
  {
    track: ThemeShortcut;
    transparent: Fluent2MicrosoftColorLocator;
    surface: Fluent2MicrosoftColorLocator;
    handle: Fluent2MicrosoftColorLocator;
    hover: Fluent2MicrosoftColorLocator;
    pressed: Fluent2MicrosoftColorLocator;
    selected: Fluent2MicrosoftColorLocator;
    text: Fluent2MicrosoftColorLocator;
    groupLabelText: Fluent2MicrosoftColorLocator;
    secondaryText: Fluent2MicrosoftColorLocator;
    endText: Fluent2MicrosoftColorLocator;
    disabledText: Fluent2MicrosoftColorLocator;
    destructiveHover: Fluent2MicrosoftColorLocator;
    destructivePressed: Fluent2MicrosoftColorLocator;
    destructiveSelected: Fluent2MicrosoftColorLocator;
  }
>;

export function createFluent2MicrosoftBottomSheetSchema({
  c
}: CreateFluent2MicrosoftBottomSheetSchemaArgs): BottomSheetComponent {
  const scrim = {
    onSubtle: {
      boxColor: {
        neutral: {
          medium: {
            rest: c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'dark', 32))
          }
        }
      }
    }
  };
  const createTheme = (theme: ThemeName) => {
    const recipe = THEMES[theme];
    const resolve = (locator: Fluent2MicrosoftColorLocator) =>
      c.resolve('default', recipe.track, locator);
    const transparent = resolve(recipe.transparent);
    const disabledText = resolve(recipe.disabledText);
    const neutralText = resolve(recipe.text);
    const destructiveText = resolve(referenceColor('bottomSheet.destructive', 'vivid'));
    const textColor = {
      neutral: {
        medium: { rest: neutralText, disabled: { ref: disabledText } }
      },
      destructive: {
        medium: { rest: destructiveText, disabled: { ref: disabledText } }
      }
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
      handle: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: resolve(recipe.handle)
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
                hover: resolve(recipe.hover),
                pressed: resolve(recipe.pressed),
                selected: {
                  rest: resolve(recipe.selected)
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
                  rest: resolve(recipe.destructiveSelected)
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
                rest: resolve(recipe.secondaryText),
                disabled: { ref: disabledText }
              }
            },
            destructive: {
              medium: { rest: destructiveText, disabled: { ref: disabledText } }
            }
          }
        }
      },
      endText: {
        onSubtle: {
          textColor: {
            neutral: {
              medium: {
                rest: resolve(recipe.endText),
                disabled: { ref: disabledText }
              }
            },
            destructive: {
              medium: {
                rest: resolve(recipe.endText),
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
                rest: resolve(recipe.groupLabelText),
                disabled: { ref: disabledText }
              }
            },
            destructive: {
              medium: { rest: destructiveText, disabled: { ref: disabledText } }
            }
          }
        }
      }
    };
  };

  const light = createTheme('light');
  const dark = createTheme('dark');
  const darker = createTheme('darker');
  const themes = <T>(lightValue: T, darkValue: T, darkerValue: T) => ({
    default: { light: lightValue, dark: darkValue, darker: darkerValue }
  });

  return {
    options: {
      initialHeight: 'standard',
      swipeBehavior: 'expand-dismiss',
      pageTransition: 'slide',
      itemLayout: 'centered',
      centeredIcons: 'hide',
      groupSeparators: true
    },
    effects: {
      shadow: {
        e2: {
          kind: 'outer',
          states: { rest: 's:lg:2' },
          fixedLevels: ['s:lg:2']
        }
      }
    },
    elements: {
      e1: {
        name: 'bottom-sheet-scrim',
        palettes: { default: { light: scrim, dark: scrim, darker: scrim } }
      },
      e2: {
        name: 'bottom-sheet-surface',
        scales: { borderRadius: { rounded: 8, pill: 8, square: 0 } },
        palettes: themes(light.surface, dark.surface, darker.surface)
      },
      e3: {
        name: 'bottom-sheet-handle',
        scales: {
          boxWidth: 36,
          boxHeight: 4,
          marginTop: 8,
          marginBottom: 4,
          borderRadius: { rounded: 999, pill: 999, square: 0 }
        },
        palettes: themes(light.handle, dark.handle, darker.handle)
      },
      e4: {
        name: 'bottom-sheet-header',
        scales: { paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16 }
      },
      e5: {
        name: 'bottom-sheet-title',
        typography: { 's:all': 'subtitle-small' },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e6: {
        name: 'bottom-sheet-body',
        scales: { paddingTop: 4, paddingRight: 8, paddingBottom: 16, paddingLeft: 8 }
      },
      e7: {
        name: 'bottom-sheet-item',
        scales: {
          paddingTop: 10,
          paddingRight: 12,
          paddingBottom: 10,
          paddingLeft: 12,
          marginBottom: 2,
          borderRadius: { rounded: 4, pill: 4, square: 0 }
        },
        palettes: themes(light.item, dark.item, darker.item)
      },
      e8: {
        name: 'bottom-sheet-icon',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 8 },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e9: {
        name: 'bottom-sheet-label',
        typography: { 's:all': 'body-medium' },
        scales: { paddingRight: 2, paddingLeft: 2 },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e10: {
        name: 'bottom-sheet-description',
        typography: { 's:all': 'caption-medium' },
        scales: { paddingRight: 2, paddingLeft: 2 },
        palettes: themes(light.auxiliaryText, dark.auxiliaryText, darker.auxiliaryText)
      },
      e11: {
        name: 'bottom-sheet-trailing-icon',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingLeft: 8 },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e12: {
        name: 'bottom-sheet-separator',
        separator: { 's:all': 'subtle' }
      },
      e13: {
        name: 'bottom-sheet-end-text',
        typography: { 's:all': 'caption-medium' },
        scales: { paddingRight: 6, paddingLeft: 10 },
        palettes: themes(light.endText, dark.endText, darker.endText)
      },
      e14: {
        name: 'bottom-sheet-group-label',
        typography: { 's:all': 'caption-medium-strong' },
        scales: {
          paddingTop: 12,
          paddingRight: 12,
          paddingBottom: 8,
          paddingLeft: 12
        },
        palettes: themes(light.groupLabelText, dark.groupLabelText, darker.groupLabelText)
      },
      e15: {
        name: 'bottom-sheet-checkmark',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 8 },
        palettes: themes(light.text, dark.text, darker.text)
      }
    }
  };
}
