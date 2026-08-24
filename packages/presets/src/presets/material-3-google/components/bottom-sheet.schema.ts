import type { KiskadeeTone, Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SegmentName = 'default' | 'dynamic';
type BottomSheetComponent = NonNullable<Schema<never>['components']['bottomSheet']>;
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';

type CreateMaterial3GoogleBottomSheetSchemaArgs = {
  c: PresetColorGetter<SegmentName>;
  segmentNames: readonly SegmentName[];
};

const THEMES = {
  light: {
    track: 'l',
    surface: 0,
    border: 20,
    handle: 60,
    hover: 90,
    pressed: 90,
    selected: 90,
    text: 90,
    destructiveText: 60,
    auxiliaryText: 60,
    disabledText: 90
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
    destructiveText: 30,
    auxiliaryText: 65,
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
    destructiveText: KiskadeeTone;
    auxiliaryText: KiskadeeTone;
    disabledText: KiskadeeTone;
  }
>;

export function createMaterial3GoogleBottomSheetSchema({
  c,
  segmentNames
}: CreateMaterial3GoogleBottomSheetSchemaArgs): BottomSheetComponent {
  const scrim = (segment: SegmentName) => ({
    onSubtle: {
      boxColor: {
        neutral: { medium: { rest: c(segment, 'l', 'bottomSheet.neutral', 100, 32) } }
      }
    }
  });
  const createTheme = (segment: SegmentName, theme: ThemeName) => {
    const recipe = THEMES[theme];
    const transparent = c(segment, recipe.track, 'bottomSheet.neutral', 0, 0);
    const disabledText = c(
      segment,
      recipe.track,
      'bottomSheet.neutral',
      recipe.disabledText,
      theme === 'light' ? 38 : undefined
    );
    const destructiveText = c(
      segment,
      recipe.track,
      'bottomSheet.destructive',
      recipe.destructiveText
    );
    const textColor = {
      neutral: {
        medium: {
          rest: c(segment, recipe.track, 'bottomSheet.neutral', recipe.text),
          disabled: { ref: disabledText }
        }
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
                rest: c(segment, recipe.track, 'bottomSheet.neutral', recipe.surface)
              }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest: c(segment, recipe.track, 'bottomSheet.neutral', recipe.border, 12)
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
                rest: c(segment, recipe.track, 'bottomSheet.neutral', recipe.handle)
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
                hover: c(segment, recipe.track, 'bottomSheet.neutral', recipe.hover, 8),
                pressed: c(segment, recipe.track, 'bottomSheet.neutral', recipe.pressed, 12),
                selected: {
                  rest: c(segment, recipe.track, 'bottomSheet.neutral', recipe.selected, 12)
                },
                disabled: transparent
              }
            },
            destructive: {
              medium: {
                rest: transparent,
                hover: c(
                  segment,
                  recipe.track,
                  'bottomSheet.destructive',
                  recipe.destructiveText,
                  8
                ),
                pressed: c(
                  segment,
                  recipe.track,
                  'bottomSheet.destructive',
                  recipe.destructiveText,
                  12
                ),
                selected: {
                  rest: c(
                    segment,
                    recipe.track,
                    'bottomSheet.destructive',
                    recipe.destructiveText,
                    12
                  )
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
                rest: c(segment, recipe.track, 'bottomSheet.neutral', recipe.auxiliaryText),
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
  const palettes = <T>(select: (theme: ReturnType<typeof createTheme>) => T) =>
    buildBySegment(segmentNames, (segment) => ({
      light: select(createTheme(segment, 'light')),
      dark: select(createTheme(segment, 'dark'))
    }));
  const scrimPalettes = buildBySegment(segmentNames, (segment) => ({
    light: scrim(segment),
    dark: scrim(segment)
  }));
  const surfacePalettes = palettes((theme) => theme.surface);
  const handlePalettes = palettes((theme) => theme.handle);
  const itemPalettes = palettes((theme) => theme.item);
  const textPalettes = palettes((theme) => theme.text);
  const auxiliaryTextPalettes = palettes((theme) => theme.auxiliaryText);

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
          states: { rest: 's:lg:1' },
          fixedLevels: ['s:lg:1']
        }
      }
    },
    elements: {
      e1: { name: 'bottom-sheet-scrim', palettes: scrimPalettes },
      e2: {
        name: 'bottom-sheet-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          borderWidth: 1,
          borderRadius: { rounded: 28, pill: 28, square: 0 }
        },
        palettes: surfacePalettes
      },
      e3: {
        name: 'bottom-sheet-handle',
        scales: {
          boxWidth: 32,
          boxHeight: 4,
          marginTop: 16,
          marginBottom: 8,
          borderRadius: { rounded: 999, pill: 999, square: 0 }
        },
        palettes: handlePalettes
      },
      e4: {
        name: 'bottom-sheet-header',
        scales: { paddingTop: 8, paddingRight: 16, paddingBottom: 12, paddingLeft: 16 }
      },
      e5: {
        name: 'bottom-sheet-title',
        typography: { 's:all': 'label-extra-large' },
        palettes: textPalettes
      },
      e6: {
        name: 'bottom-sheet-body',
        scales: { paddingTop: 8, paddingRight: 8, paddingBottom: 16, paddingLeft: 8 }
      },
      e7: {
        name: 'bottom-sheet-item',
        scales: {
          paddingTop: 14,
          paddingRight: 16,
          paddingBottom: 14,
          paddingLeft: 16,
          borderRadius: { rounded: 0, pill: 0, square: 0 }
        },
        palettes: itemPalettes
      },
      e8: {
        name: 'bottom-sheet-icon',
        iconSize: { 's:all': 's:lg:1' },
        scales: { paddingRight: 12 },
        palettes: textPalettes
      },
      e9: {
        name: 'bottom-sheet-label',
        typography: { 's:all': 'label-large' },
        palettes: textPalettes
      },
      e10: {
        name: 'bottom-sheet-description',
        typography: { 's:all': 'body-small' },
        palettes: auxiliaryTextPalettes
      },
      e11: {
        name: 'bottom-sheet-trailing-icon',
        iconSize: { 's:all': 's:lg:1' },
        scales: { paddingLeft: 12 },
        palettes: textPalettes
      },
      e12: {
        name: 'bottom-sheet-separator',
        separator: { 's:all': 'subtle' }
      },
      e13: {
        name: 'bottom-sheet-end-text',
        typography: { 's:all': 'body-small' },
        scales: { paddingLeft: 12 },
        palettes: auxiliaryTextPalettes
      },
      e14: {
        name: 'bottom-sheet-group-label',
        typography: { 's:all': 'label-medium' },
        scales: {
          paddingTop: 14,
          paddingRight: 16,
          paddingBottom: 10,
          paddingLeft: 16
        },
        palettes: auxiliaryTextPalettes
      },
      e15: {
        name: 'bottom-sheet-checkmark',
        iconSize: { 's:all': 's:lg:1' },
        scales: { paddingRight: 12 },
        palettes: textPalettes
      }
    }
  };
}
