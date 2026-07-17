import type { KiskadeeTone, Schema, SolidColor } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type Fluent2MicrosoftSegmentName = 'default';
type ThemeShortcut = 'l' | 'd';
type ButtonRecipeTheme = 'light' | 'dark' | 'darker';
type ButtonColorRole =
  | 'button.primary'
  | 'button.neutral'
  | 'button.destructive'
  | 'button.positive';

type StatefulTones = {
  rest: KiskadeeTone;
  hover: KiskadeeTone;
  pressed: KiskadeeTone;
  selected: KiskadeeTone;
};

type ButtonThemeRecipe = {
  scale: ThemeShortcut;
  medium: StatefulTones;
  high: StatefulTones;
  low: {
    hover: KiskadeeTone;
    pressed: KiskadeeTone;
    selected: KiskadeeTone;
    border: KiskadeeTone;
  };
  foreground: KiskadeeTone;
  highForeground: KiskadeeTone;
  lowestDisabledForeground: KiskadeeTone;
};

type CreateFluent2MicrosoftButtonSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  shadowBlack: (alpha: number) => SolidColor;
};

/**
 * Canonical Kiskadee Button recipe for Fluent 2 Microsoft.
 *
 * The recipe is intentionally role-agnostic: intents change only the color
 * family. Keeping the tonal positions identical makes recipe and palette gaps
 * visible when the preset is exercised with other segments.
 */
const BUTTON_TONAL_RECIPE = {
  light: {
    scale: 'l',
    medium: { rest: 4, hover: 6, pressed: 8, selected: 4 },
    high: { rest: 50, hover: 55, pressed: 75, selected: 60 },
    low: { hover: 2, pressed: 4, selected: 1, border: 50 },
    foreground: 65,
    highForeground: 0,
    lowestDisabledForeground: 16
  },
  dark: {
    scale: 'd',
    medium: { rest: 10, hover: 8, pressed: 14, selected: 10 },
    high: { rest: 35, hover: 40, pressed: 14, selected: 28 },
    low: { hover: 14, pressed: 22, selected: 18, border: 35 },
    foreground: 75,
    highForeground: 100,
    lowestDisabledForeground: 35
  },
  darker: {
    scale: 'd',
    medium: { rest: 10, hover: 8, pressed: 14, selected: 10 },
    high: { rest: 30, hover: 35, pressed: 12, selected: 26 },
    low: { hover: 14, pressed: 22, selected: 18, border: 35 },
    foreground: 75,
    highForeground: 100,
    lowestDisabledForeground: 35
  }
} as const satisfies Record<ButtonRecipeTheme, ButtonThemeRecipe>;

export function createFluent2MicrosoftButtonSchema({
  c,
  shadowBlack
}: CreateFluent2MicrosoftButtonSchemaArgs): ButtonComponent {
  const lightTransparent = c('default', 'l', 'button.neutral', 0, 0);
  const lightAdaptiveDisabled = c('default', 'l', 'button.neutral', 100, 5);
  const lightAdaptiveDisabledText = c('default', 'l', 'button.neutral', 20, 82);
  const darkTransparent = c('default', 'd', 'button.neutral', 0, 0);
  const darkAdaptiveDisabled = c('default', 'd', 'button.neutral', 100, 5);

  const createButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) => {
    const recipe = BUTTON_TONAL_RECIPE[theme];
    const isLight = recipe.scale === 'l';
    const transparent = isLight ? lightTransparent : darkTransparent;
    const adaptiveDisabled = isLight ? lightAdaptiveDisabled : darkAdaptiveDisabled;
    const disabledForeground = c(
      'default',
      recipe.scale,
      'button.neutral',
      recipe.lowestDisabledForeground
    );
    const filledDisabledForeground = isLight ? lightAdaptiveDisabledText : disabledForeground;
    const roleColor = (tone: KiskadeeTone, alpha?: number) =>
      c('default', recipe.scale, role, tone, alpha);

    return {
      boxColor: {
        medium: {
          rest: roleColor(recipe.medium.rest),
          hover: roleColor(recipe.medium.hover),
          pressed: roleColor(recipe.medium.pressed),
          disabled: adaptiveDisabled,
          selected: {
            // Explicitly declares Selected support even when it reuses Rest.
            rest: roleColor(recipe.medium.selected)
          }
        },
        high: {
          rest: roleColor(recipe.high.rest),
          hover: roleColor(recipe.high.hover),
          pressed: roleColor(recipe.high.pressed),
          disabled: adaptiveDisabled,
          selected: {
            rest: roleColor(recipe.high.selected)
          }
        },
        low: {
          rest: transparent,
          hover: roleColor(recipe.low.hover),
          pressed: roleColor(recipe.low.pressed),
          disabled: adaptiveDisabled,
          selected: {
            rest: roleColor(recipe.low.selected)
          }
        },
        lowest: {
          rest: transparent,
          hover: roleColor(recipe.low.hover),
          pressed: roleColor(recipe.low.pressed),
          selected: {
            rest: roleColor(recipe.low.selected)
          }
        }
      },
      borderColor: {
        medium: {
          rest: transparent
        },
        high: {
          rest: transparent
        },
        low: {
          rest: roleColor(recipe.low.border, 50),
          disabled: transparent
        },
        lowest: {
          rest: transparent
        }
      },
      textColor: {
        medium: {
          rest: roleColor(recipe.foreground),
          disabled: {
            ref: filledDisabledForeground
          }
        },
        high: {
          rest: c('default', recipe.scale, 'button.neutral', recipe.highForeground),
          disabled: {
            ref: filledDisabledForeground
          }
        },
        low: {
          rest: roleColor(recipe.foreground),
          disabled: {
            ref: filledDisabledForeground
          }
        },
        lowest: {
          rest: roleColor(recipe.foreground),
          disabled: {
            ref: disabledForeground
          }
        }
      }
    };
  };

  const buttonIntentPalettes = {
    light: {
      primary: createButtonIntent('light', 'button.primary'),
      neutral: createButtonIntent('light', 'button.neutral'),
      destructive: createButtonIntent('light', 'button.destructive'),
      positive: createButtonIntent('light', 'button.positive')
    },
    dark: {
      primary: createButtonIntent('dark', 'button.primary'),
      neutral: createButtonIntent('dark', 'button.neutral'),
      destructive: createButtonIntent('dark', 'button.destructive'),
      positive: createButtonIntent('dark', 'button.positive')
    },
    darker: {
      primary: createButtonIntent('darker', 'button.primary'),
      neutral: createButtonIntent('darker', 'button.neutral'),
      destructive: createButtonIntent('darker', 'button.destructive'),
      positive: createButtonIntent('darker', 'button.positive')
    }
  };

  return {
    elements: {
      e1: {
        name: 'button',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          paddingTop: {
            's:sm:1': 1,
            's:md:1': 6,
            's:lg:1': 7
          },
          paddingBottom: {
            's:sm:1': 1,
            's:md:1': 6,
            's:lg:1': 7
          },
          paddingLeft: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16
          },
          borderWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1
          },
          borderRadius: {
            rounded: 4,
            pill: 4,
            square: 0
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                primary: buttonIntentPalettes.light.primary.boxColor,
                neutral: buttonIntentPalettes.light.neutral.boxColor,
                destructive: buttonIntentPalettes.light.destructive.boxColor,
                positive: buttonIntentPalettes.light.positive.boxColor
              },
              borderColor: {
                primary: buttonIntentPalettes.light.primary.borderColor,
                neutral: buttonIntentPalettes.light.neutral.borderColor,
                destructive: buttonIntentPalettes.light.destructive.borderColor,
                positive: buttonIntentPalettes.light.positive.borderColor
              }
            },
            dark: {
              boxColor: {
                primary: buttonIntentPalettes.dark.primary.boxColor,
                neutral: buttonIntentPalettes.dark.neutral.boxColor,
                destructive: buttonIntentPalettes.dark.destructive.boxColor,
                positive: buttonIntentPalettes.dark.positive.boxColor
              },
              borderColor: {
                primary: buttonIntentPalettes.dark.primary.borderColor,
                neutral: buttonIntentPalettes.dark.neutral.borderColor,
                destructive: buttonIntentPalettes.dark.destructive.borderColor,
                positive: buttonIntentPalettes.dark.positive.borderColor
              }
            },
            darker: {
              boxColor: {
                primary: buttonIntentPalettes.darker.primary.boxColor,
                neutral: buttonIntentPalettes.darker.neutral.boxColor,
                destructive: buttonIntentPalettes.darker.destructive.boxColor,
                positive: buttonIntentPalettes.darker.positive.boxColor
              },
              borderColor: {
                primary: buttonIntentPalettes.darker.primary.borderColor,
                neutral: buttonIntentPalettes.darker.neutral.borderColor,
                destructive: buttonIntentPalettes.darker.destructive.borderColor,
                positive: buttonIntentPalettes.darker.positive.borderColor
              }
            }
          }
        },
        effects: {
          shadow: {
            x: { rest: 0, hover: 0, pressed: 0, focus: 0, disabled: 0 },
            y: { rest: 2, hover: 4, pressed: 0, focus: 4, disabled: 0 },
            blur: { rest: 6, hover: 10, pressed: 0, focus: 10, disabled: 0 },
            color: {
              rest: shadowBlack(0.28),
              hover: shadowBlack(0.35),
              pressed: shadowBlack(0.32),
              focus: shadowBlack(0.35),
              disabled: shadowBlack(0)
            }
          }
        }
      },
      e2: {
        name: 'button-text',
        decorations: {
          textWeight: 'medium'
        },
        palettes: {
          default: {
            light: {
              textColor: {
                primary: buttonIntentPalettes.light.primary.textColor,
                neutral: buttonIntentPalettes.light.neutral.textColor,
                destructive: buttonIntentPalettes.light.destructive.textColor,
                positive: buttonIntentPalettes.light.positive.textColor
              }
            },
            dark: {
              textColor: {
                primary: buttonIntentPalettes.dark.primary.textColor,
                neutral: buttonIntentPalettes.dark.neutral.textColor,
                destructive: buttonIntentPalettes.dark.destructive.textColor,
                positive: buttonIntentPalettes.dark.positive.textColor
              }
            },
            darker: {
              textColor: {
                primary: buttonIntentPalettes.darker.primary.textColor,
                neutral: buttonIntentPalettes.darker.neutral.textColor,
                destructive: buttonIntentPalettes.darker.destructive.textColor,
                positive: buttonIntentPalettes.darker.positive.textColor
              }
            }
          }
        },
        scales: {
          textSize: {
            's:sm:1': 12,
            's:md:1': 14,
            's:lg:1': 16
          },
          textHeight: {
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 22
          }
        }
      }
    }
  };
}
