import type { KiskadeeTone, Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type DropdownComponent = NonNullable<Schema<'purple'>['components']['dropdown']>;
type SegmentName = 'default' | 'dynamic' | 'purple';
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';

type CreateMaterial3GoogleDropdownSchemaArgs = {
  c: PresetColorGetter<SegmentName>;
  segmentNames: readonly SegmentName[];
};

const THEMES = {
  light: {
    track: 'l',
    surface: 0,
    border: 20,
    hover: 90,
    pressed: 90,
    selected: 90,
    text: 90,
    auxiliaryText: 60,
    disabledText: 90,
    destructiveText: 60,
    destructiveHover: 60,
    destructivePressed: 60,
    destructiveSelected: 60,
    selectedPrimary: 50,
    selectedPrimaryHover: 45,
    selectedPrimaryPressed: 40
  },
  dark: {
    track: 'd',
    surface: 5,
    border: 16,
    hover: 16,
    pressed: 10,
    selected: 12,
    text: 90,
    auxiliaryText: 65,
    disabledText: 90,
    destructiveText: 30,
    destructiveHover: 30,
    destructivePressed: 30,
    destructiveSelected: 30,
    selectedPrimary: 80,
    selectedPrimaryHover: 85,
    selectedPrimaryPressed: 90
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
    auxiliaryText: KiskadeeTone;
    disabledText: KiskadeeTone;
    destructiveText: KiskadeeTone;
    destructiveHover: KiskadeeTone;
    destructivePressed: KiskadeeTone;
    destructiveSelected: KiskadeeTone;
    selectedPrimary: KiskadeeTone;
    selectedPrimaryHover: KiskadeeTone;
    selectedPrimaryPressed: KiskadeeTone;
  }
>;

const withSurfaceContexts = <T>(palette: T) => ({
  onSubtle: palette,
  onVivid: palette
});

export function createMaterial3GoogleDropdownSchema({
  c,
  segmentNames
}: CreateMaterial3GoogleDropdownSchemaArgs): DropdownComponent {
  const createTheme = (segment: SegmentName, themeName: ThemeName) => {
    const recipe = THEMES[themeName];
    const transparent = c(segment, recipe.track, 'dropdown.neutral', 0, 0);
    const disabledText = c(segment, recipe.track, 'dropdown.neutral', recipe.disabledText, 38);
    const neutralText = c(segment, recipe.track, 'dropdown.neutral', recipe.text);
    const auxiliaryText = c(segment, recipe.track, 'dropdown.neutral', recipe.auxiliaryText);
    const destructiveText = c(
      segment,
      recipe.track,
      'dropdown.destructive',
      recipe.destructiveText
    );
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
          selected: {
            rest: { ref: c(segment, recipe.track, 'primary', recipe.selectedPrimary) },
            hover: {
              ref: c(segment, recipe.track, 'primary', recipe.selectedPrimaryHover)
            },
            pressed: {
              ref: c(segment, recipe.track, 'primary', recipe.selectedPrimaryPressed)
            }
          },
          disabled: { ref: disabledText }
        }
      },
      destructive: textColor.destructive
    };
    const selected = c(segment, recipe.track, 'dropdown.neutral', recipe.selected, 12);
    const destructiveSelected = c(
      segment,
      recipe.track,
      'dropdown.destructive',
      recipe.destructiveSelected,
      12
    );

    return {
      surface: {
        boxColor: {
          neutral: {
            medium: {
              rest: c(segment, recipe.track, 'dropdown.neutral', recipe.surface)
            }
          }
        },
        borderColor: {
          neutral: {
            medium: {
              rest: c(segment, recipe.track, 'dropdown.neutral', recipe.border, 12)
            }
          }
        }
      },
      item: {
        boxColor: {
          neutral: {
            medium: {
              rest: transparent,
              hover: c(segment, recipe.track, 'dropdown.neutral', recipe.hover, 8),
              pressed: c(segment, recipe.track, 'dropdown.neutral', recipe.pressed, 12),
              selected: {
                // Selected item background owns its compound state reset.
                rest: selected,
                hover: selected,
                pressed: selected
              },
              // Transparent is the terminal reset for disabled rows.
              disabled: transparent
            }
          },
          destructive: {
            medium: {
              rest: transparent,
              hover: c(segment, recipe.track, 'dropdown.destructive', recipe.destructiveHover, 8),
              pressed: c(
                segment,
                recipe.track,
                'dropdown.destructive',
                recipe.destructivePressed,
                12
              ),
              selected: {
                // Keep compound selected states stable across pointer transitions.
                rest: destructiveSelected,
                hover: destructiveSelected,
                pressed: destructiveSelected
              },
              disabled: transparent
            }
          }
        }
      },
      text: { textColor },
      iconText: { textColor: iconTextColor },
      auxiliaryText: {
        textColor: {
          neutral: {
            medium: {
              rest: auxiliaryText,
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
      },
      endText: {
        textColor: {
          neutral: {
            medium: {
              rest: auxiliaryText,
              disabled: { ref: disabledText }
            }
          },
          destructive: {
            medium: {
              rest: auxiliaryText,
              disabled: { ref: disabledText }
            }
          }
        }
      },
      groupLabelText: {
        textColor: {
          neutral: {
            medium: {
              rest: auxiliaryText,
              disabled: { ref: disabledText }
            }
          },
          destructive: {
            medium: {
              rest: auxiliaryText,
              disabled: { ref: disabledText }
            }
          }
        }
      },
      scrollAffordance: {
        boxColor: {
          neutral: {
            medium: { rest: c(segment, recipe.track, 'dropdown.neutral', recipe.surface) }
          }
        },
        textColor
      }
    };
  };

  const palettes = <T>(select: (theme: ReturnType<typeof createTheme>) => T) =>
    buildBySegment(segmentNames, (segment) => ({
      light: withSurfaceContexts(select(createTheme(segment, 'light'))),
      dark: withSurfaceContexts(select(createTheme(segment, 'dark')))
    }));

  return {
    options: {
      density: { regular: 's:md:1' },
      leadingIconComposition: 'item-and-selection',
      selectedItemBackground: true
    },
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:md:1' },
          fixedLevels: ['s:md:1']
        }
      }
    },
    elements: {
      e1: {
        name: 'dropdown-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          paddingTop: 8,
          paddingRight: 8,
          paddingBottom: 8,
          paddingLeft: 8,
          borderWidth: 1,
          borderRadius: { rounded: 4, pill: 4, square: 0 }
        },
        palettes: palettes((theme) => theme.surface)
      },
      e2: {
        name: 'dropdown-item',
        scales: {
          paddingTop: 14,
          paddingRight: 12,
          paddingBottom: 14,
          paddingLeft: 12,
          borderRadius: { rounded: 0, pill: 0, square: 0 }
        },
        palettes: palettes((theme) => theme.item)
      },
      e3: {
        name: 'dropdown-icon',
        iconSize: { 's:all': 's:lg:1' },
        scales: { paddingRight: 12 },
        palettes: palettes((theme) => theme.iconText)
      },
      e4: {
        name: 'dropdown-label',
        typography: { 's:all': 'label-large' },
        palettes: palettes((theme) => theme.text)
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'body-small' },
        palettes: palettes((theme) => theme.auxiliaryText)
      },
      e6: {
        name: 'dropdown-trailing-icon',
        iconSize: { 's:all': 's:lg:1' },
        palettes: palettes((theme) => theme.text)
      },
      e7: {
        name: 'dropdown-separator',
        separator: { 's:all': 'subtle' }
      },
      e8: {
        name: 'dropdown-end-text',
        typography: { 's:all': 'body-small' },
        palettes: palettes((theme) => theme.endText)
      },
      e9: {
        name: 'dropdown-group-label',
        typography: { 's:all': 'label-medium' },
        scales: {
          paddingTop: 14,
          paddingRight: 12,
          paddingBottom: 14,
          paddingLeft: 12
        },
        palettes: palettes((theme) => theme.groupLabelText)
      },
      e10: {
        name: 'dropdown-checkmark',
        iconSize: { 's:all': 's:lg:1' },
        scales: { paddingRight: 12 },
        palettes: palettes((theme) => theme.text)
      },
      e11: {
        name: 'dropdown-scroll-affordance',
        iconSize: { 's:all': 's:lg:1' },
        palettes: palettes((theme) => theme.scrollAffordance)
      }
    }
  };
}
