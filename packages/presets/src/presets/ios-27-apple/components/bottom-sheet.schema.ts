import type { KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../ios-27-apple.schema.ts';

type BottomSheetComponent = NonNullable<Schema<Segment>['components']['bottomSheet']>;
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';

type CreateIos27AppleBottomSheetSchemaArgs = {
  c: PresetColorGetter<Segment>;
};

const THEMES = {
  light: {
    track: 'l',
    surface: 0,
    border: 10,
    handle: 50,
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
    handle: 55,
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
    handle: KiskadeeTone;
    hover: KiskadeeTone;
    pressed: KiskadeeTone;
    selected: KiskadeeTone;
    text: KiskadeeTone;
    secondaryText: KiskadeeTone;
    disabledText: KiskadeeTone;
  }
>;

export function createIos27AppleBottomSheetSchema({
  c
}: CreateIos27AppleBottomSheetSchemaArgs): BottomSheetComponent {
  const scrim = {
    onSubtle: {
      boxColor: {
        neutral: { medium: { rest: c('default', 'l', 'bottomSheet.neutral', 100, 32) } }
      }
    }
  };
  const createTheme = (theme: ThemeName) => {
    const recipe = THEMES[theme];
    const transparent = c('default', recipe.track, 'bottomSheet.neutral', 0, 0);
    const disabledText = c('default', recipe.track, 'bottomSheet.neutral', recipe.disabledText);
    const textColor = {
      neutral: {
        medium: {
          rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.text),
          disabled: { ref: disabledText }
        }
      },
      destructive: {
        medium: {
          rest: c.ref('default', recipe.track, 'bottomSheet.destructive', 'vivid'),
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
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.surface)
              }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest: c('default', recipe.track, 'bottomSheet.neutral', recipe.border)
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
                hover: c('default', recipe.track, 'bottomSheet.neutral', recipe.hover),
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
              medium: {
                rest: c.ref('default', recipe.track, 'bottomSheet.destructive', 'vivid'),
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
  const themes = <T>(lightValue: T, darkValue: T) => ({
    default: { light: lightValue, dark: darkValue }
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
          states: { rest: 's:sm:1' },
          fixedLevels: ['s:sm:1']
        }
      }
    },
    elements: {
      e1: {
        name: 'bottom-sheet-scrim',
        palettes: { default: { light: scrim, dark: scrim } }
      },
      e2: {
        name: 'bottom-sheet-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          borderWidth: 1,
          borderRadius: { rounded: 16, pill: 16, square: 0 }
        },
        palettes: themes(light.surface, dark.surface)
      },
      e3: {
        name: 'bottom-sheet-handle',
        scales: {
          boxWidth: 36,
          boxHeight: 5,
          marginTop: 8,
          marginBottom: 4,
          borderRadius: { rounded: 999, pill: 999, square: 0 }
        },
        palettes: themes(light.handle, dark.handle)
      },
      e4: {
        name: 'bottom-sheet-header',
        scales: { paddingTop: 8, paddingRight: 16, paddingBottom: 12, paddingLeft: 16 }
      },
      e5: {
        name: 'bottom-sheet-title',
        typography: { 's:all': 'label-medium' },
        palettes: themes(light.text, dark.text)
      },
      e6: {
        name: 'bottom-sheet-body',
        scales: { paddingTop: 4, paddingRight: 8, paddingBottom: 16, paddingLeft: 8 }
      },
      e7: {
        name: 'bottom-sheet-item',
        scales: {
          paddingTop: 12,
          paddingRight: 16,
          paddingBottom: 12,
          paddingLeft: 16,
          borderRadius: { rounded: 10, pill: 10, square: 0 }
        },
        palettes: themes(light.item, dark.item)
      },
      e8: {
        name: 'bottom-sheet-icon',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 10 },
        palettes: themes(light.text, dark.text)
      },
      e9: {
        name: 'bottom-sheet-label',
        typography: { 's:all': 'body-medium' },
        palettes: themes(light.text, dark.text)
      },
      e10: {
        name: 'bottom-sheet-description',
        typography: { 's:all': 'label-small' },
        palettes: themes(light.auxiliaryText, dark.auxiliaryText)
      },
      e11: {
        name: 'bottom-sheet-trailing-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingLeft: 10 },
        palettes: themes(light.text, dark.text)
      },
      e12: {
        name: 'bottom-sheet-separator',
        separator: { 's:all': 'subtle' }
      },
      e13: {
        name: 'bottom-sheet-end-text',
        typography: { 's:all': 'label-small' },
        scales: { paddingLeft: 10 },
        palettes: themes(light.auxiliaryText, dark.auxiliaryText)
      },
      e14: {
        name: 'bottom-sheet-group-label',
        typography: { 's:all': 'label-small-strong' },
        scales: {
          paddingTop: 12,
          paddingRight: 16,
          paddingBottom: 8,
          paddingLeft: 16
        },
        palettes: themes(light.auxiliaryText, dark.auxiliaryText)
      },
      e15: {
        name: 'bottom-sheet-checkmark',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 10 },
        palettes: themes(light.text, dark.text)
      }
    }
  };
}
