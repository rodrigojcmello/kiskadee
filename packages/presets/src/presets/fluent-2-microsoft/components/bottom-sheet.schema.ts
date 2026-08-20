import type { KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type BottomSheetComponent = NonNullable<Schema<never>['components']['bottomSheet']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';

type CreateFluent2MicrosoftBottomSheetSchemaArgs = {
  c: PresetColorGetter<'default'>;
};

const THEMES = {
  light: {
    track: 'l',
    surface: 0,
    handle: 45,
    hover: 2,
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
    handle: 55,
    hover: 18,
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
    handle: 50,
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
    handle: KiskadeeTone;
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

export function createFluent2MicrosoftBottomSheetSchema({
  c
}: CreateFluent2MicrosoftBottomSheetSchemaArgs): BottomSheetComponent {
  const scrim = {
    onSubtle: {
      boxColor: {
        neutral: {
          medium: { rest: c('default', 'l', 'primitive.black.v1', 100, 32) }
        }
      }
    }
  };
  const createTheme = (theme: ThemeName) => {
    const recipe = THEMES[theme];
    const transparent = c('default', recipe.track, 'bottomSheet.neutral', 0, 0);
    const disabledText = c('default', recipe.track, 'bottomSheet.neutral', recipe.disabledText);
    const neutralText = c('default', recipe.track, 'bottomSheet.neutral', recipe.text);
    const destructiveText = c.ref('default', recipe.track, 'bottomSheet.destructive', 'vivid');
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
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.surface)
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
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.handle)
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
                hover: c('default', recipe.track, 'primitive.black.v1', recipe.hover),
                pressed: c('default', recipe.track, 'bottomSheet.neutral', recipe.pressed),
                selected: {
                  rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.selected)
                },
                disabled: transparent
              }
            },
            destructive: {
              medium: {
                rest: transparent,
                hover: c('default', recipe.track, 'bottomSheet.destructive', 5),
                pressed: c('default', recipe.track, 'bottomSheet.destructive', 9),
                selected: {
                  rest: c('default', recipe.track, 'bottomSheet.destructive', 7)
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
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.secondaryText),
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
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.endText),
                disabled: { ref: disabledText }
              }
            },
            destructive: {
              medium: {
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.endText),
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
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.groupLabelText),
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
      centeredIcons: 'hide'
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
