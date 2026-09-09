import { contour, fg, type Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../ios-27-apple.schema.ts';

type BottomSheetComponent = NonNullable<Schema<Segment>['components']['bottomSheet']>;
type ThemeName = 'light' | 'dark' | 'darker';

type CreateIos27AppleBottomSheetSchemaArgs = {
  c: PresetColorGetter<Segment>;
};

export function createIos27AppleBottomSheetSchema({
  c
}: CreateIos27AppleBottomSheetSchemaArgs): BottomSheetComponent {
  const scrimColor = {
    boxColor: {
      neutral: { medium: { rest: c('default', 'l', 'bottomSheet.neutral', 100, 32) } }
    }
  };
  const scrim = { onSubtle: scrimColor, onVivid: scrimColor };
  const createTheme = (theme: ThemeName) => {
    const track = theme === 'light' ? 'l' : 'd';
    const neutralText = fg(`neutral.standard.${theme}.onSubtle.medium`);
    const secondaryText = fg(`neutral.standard.${theme}.onSubtle.low`);
    const disabledText = fg.parentState(`neutral.standard.${theme}.onSubtle.lowest`);
    const textColor = {
      neutral: { medium: { rest: neutralText, disabled: disabledText } },
      destructive: {
        medium: {
          rest: c.ref('default', track, 'bottomSheet.destructive', 'vivid'),
          disabled: disabledText
        }
      }
    };
    const fillTone = track === 'l' ? 35 : 55;
    const rest = c('default', track, 'bottomSheet.neutral', fillTone, track === 'l' ? 16 : 32);
    const itemColors = {
      rest,
      hover: c('default', track, 'bottomSheet.neutral', fillTone, track === 'l' ? 20 : 36),
      pressed: c('default', track, 'bottomSheet.neutral', fillTone, track === 'l' ? 24 : 40),
      // Terminal reset clears transient paint; selection remains a checkmark.
      disabled: rest
    };
    const surfaceColors = {
      boxColor: {
        neutral: {
          medium: { rest: c('default', track, 'bottomSheet.neutral', track === 'l' ? 0 : 5) }
        }
      },
      borderColor: {
        neutral: { medium: { rest: contour(`neutral.standard.${theme}.onSubtle.low`) } }
      }
    };
    const auxiliaryText = {
      neutral: { medium: { rest: secondaryText, disabled: disabledText } },
      destructive: { medium: { rest: secondaryText, disabled: disabledText } }
    };

    return {
      // The surface and scrim resolve outside the descendant SurfaceContext reset.
      surface: { onSubtle: surfaceColors, onVivid: surfaceColors },
      handle: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: c('default', track, 'bottomSheet.neutral', track === 'l' ? 70 : 95, 30)
              }
            }
          }
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
  const themes = <T>(lightValue: T, darkValue: T, darkerValue: T) => ({
    default: { light: lightValue, dark: darkValue, darker: darkerValue }
  });

  return {
    options: {
      density: { spacious: 's:md:1' },
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
          states: { rest: 's:lg:4' },
          fixedLevels: ['s:lg:4']
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
        decorations: { borderStyle: 'solid' },
        scales: {
          borderWidth: 0.5,
          borderRadius: { rounded: 34, pill: 34, square: 0 }
        },
        palettes: themes(light.surface, dark.surface, darker.surface)
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
        palettes: themes(light.handle, dark.handle, darker.handle)
      },
      e4: {
        name: 'bottom-sheet-header',
        scales: { paddingTop: 8, paddingRight: 22, paddingBottom: 24, paddingLeft: 22 }
      },
      e5: {
        name: 'bottom-sheet-title',
        typography: { 's:all': 'label-medium' },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e6: {
        name: 'bottom-sheet-body',
        scales: { paddingTop: 0, paddingRight: 14, paddingBottom: 14, paddingLeft: 14 }
      },
      e7: {
        name: 'bottom-sheet-item',
        scales: {
          paddingTop: 13,
          paddingRight: 16,
          paddingBottom: 13,
          paddingLeft: 16,
          marginBottom: 8,
          borderRadius: { rounded: 100, pill: 100, square: 0 }
        },
        palettes: themes(light.item, dark.item, darker.item)
      },
      e8: {
        name: 'bottom-sheet-icon',
        iconSize: { 's:all': 's:md:1' },
        scales: { paddingRight: 10 },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e9: {
        name: 'bottom-sheet-label',
        typography: { 's:all': 'label-medium' },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e10: {
        name: 'bottom-sheet-description',
        typography: { 's:all': 'label-small' },
        palettes: themes(light.auxiliaryText, dark.auxiliaryText, darker.auxiliaryText)
      },
      e11: {
        name: 'bottom-sheet-trailing-icon',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingLeft: 10 },
        palettes: themes(light.text, dark.text, darker.text)
      },
      e12: {
        name: 'bottom-sheet-separator',
        separator: { 's:all': 'subtle' }
      },
      e13: {
        name: 'bottom-sheet-end-text',
        typography: { 's:all': 'label-small' },
        scales: { paddingLeft: 10 },
        palettes: themes(light.auxiliaryText, dark.auxiliaryText, darker.auxiliaryText)
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
        palettes: themes(light.auxiliaryText, dark.auxiliaryText, darker.auxiliaryText)
      },
      e15: {
        name: 'bottom-sheet-checkmark',
        iconSize: { 's:all': 's:sm:1' },
        scales: { paddingRight: 10 },
        palettes: themes(light.text, dark.text, darker.text)
      }
    }
  };
}
