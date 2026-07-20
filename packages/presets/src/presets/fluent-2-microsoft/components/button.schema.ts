import type {
  KiskadeeTone,
  Schema,
  SolidColor,
  TonalFunctionalReferenceName
} from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import { createBalancedLowBorder } from './button-low-border.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type Fluent2MicrosoftSegmentName = 'default';
type ThemeShortcut = 'l' | 'd';
type ButtonRecipeTheme = 'light' | 'dark' | 'darker';
type ButtonColorRole =
  | 'button.primary'
  | 'button.neutral'
  | 'button.destructive'
  | 'button.positive';

type FunctionalToneLocator = {
  reference: TonalFunctionalReferenceName;
  offset: number;
};

type StatefulFunctionalTones = {
  rest: FunctionalToneLocator;
  hover: FunctionalToneLocator;
  pressed: FunctionalToneLocator;
  selected: FunctionalToneLocator;
};

type ButtonThemeRecipe = {
  scale: ThemeShortcut;
  medium: StatefulFunctionalTones;
  high: StatefulFunctionalTones;
  low: {
    hover: KiskadeeTone;
    pressed: KiskadeeTone;
    selected: KiskadeeTone;
    border: FunctionalToneLocator & {
      surfaceTone: KiskadeeTone;
      targetDeltaE: number;
    };
  };
  foreground: KiskadeeTone;
  highForeground: Record<ButtonColorRole, KiskadeeTone>;
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
    medium: {
      rest: { reference: 'subtle', offset: 0 },
      hover: { reference: 'subtle', offset: 2 },
      pressed: { reference: 'subtle', offset: 4 },
      selected: { reference: 'subtle', offset: 0 }
    },
    high: {
      rest: { reference: 'vivid', offset: 0 },
      hover: { reference: 'vivid', offset: 1 },
      pressed: { reference: 'vivid', offset: 3 },
      selected: { reference: 'vivid', offset: 2 }
    },
    low: {
      hover: 2,
      pressed: 4,
      selected: 1,
      border: { reference: 'vivid', offset: 0, surfaceTone: 0, targetDeltaE: 0.3 }
    },
    foreground: 65,
    highForeground: {
      'button.primary': 0,
      'button.neutral': 0,
      'button.destructive': 0,
      'button.positive': 0
    },
    lowestDisabledForeground: 16
  },
  dark: {
    scale: 'd',
    medium: {
      rest: { reference: 'subtle', offset: 0 },
      hover: { reference: 'subtle', offset: 2 },
      pressed: { reference: 'subtle', offset: 4 },
      selected: { reference: 'subtle', offset: 0 }
    },
    high: {
      rest: { reference: 'vivid', offset: 0 },
      hover: { reference: 'vivid', offset: 1 },
      pressed: { reference: 'vivid', offset: -2 },
      selected: { reference: 'vivid', offset: -1 }
    },
    low: {
      hover: 14,
      pressed: 22,
      selected: 18,
      border: { reference: 'vivid', offset: 0, surfaceTone: 5, targetDeltaE: 0.18 }
    },
    foreground: 75,
    highForeground: {
      'button.primary': 100,
      'button.neutral': 0,
      'button.destructive': 100,
      'button.positive': 100
    },
    lowestDisabledForeground: 35
  },
  darker: {
    scale: 'd',
    medium: {
      rest: { reference: 'subtle', offset: 0 },
      hover: { reference: 'subtle', offset: 2 },
      pressed: { reference: 'subtle', offset: 4 },
      selected: { reference: 'subtle', offset: 0 }
    },
    high: {
      rest: { reference: 'vivid', offset: -1 },
      hover: { reference: 'vivid', offset: 0 },
      pressed: { reference: 'vivid', offset: -3 },
      selected: { reference: 'vivid', offset: -2 }
    },
    low: {
      hover: 14,
      pressed: 22,
      selected: 18,
      border: { reference: 'vivid', offset: -1, surfaceTone: 0, targetDeltaE: 0.18 }
    },
    foreground: 75,
    highForeground: {
      'button.primary': 100,
      'button.neutral': 0,
      'button.destructive': 100,
      'button.positive': 100
    },
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
    const roleReferenceColor = (locator: FunctionalToneLocator, alpha?: number) =>
      c.ref('default', recipe.scale, role, locator.reference, locator.offset, alpha);
    const lowBorder = createBalancedLowBorder({
      color: roleReferenceColor(recipe.low.border),
      surface: c('default', recipe.scale, 'neutral', recipe.low.border.surfaceTone),
      targetDeltaE: recipe.low.border.targetDeltaE
    });

    return {
      boxColor: {
        medium: {
          rest: roleReferenceColor(recipe.medium.rest),
          hover: roleReferenceColor(recipe.medium.hover),
          pressed: roleReferenceColor(recipe.medium.pressed),
          disabled: adaptiveDisabled,
          selected: {
            // Explicitly declares Selected support even when it reuses Rest.
            rest: roleReferenceColor(recipe.medium.selected)
          }
        },
        high: {
          rest: roleReferenceColor(recipe.high.rest),
          hover: roleReferenceColor(recipe.high.hover),
          pressed: roleReferenceColor(recipe.high.pressed),
          disabled: adaptiveDisabled,
          selected: {
            rest: roleReferenceColor(recipe.high.selected)
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
          rest: lowBorder,
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
          rest: c('default', recipe.scale, 'button.neutral', recipe.highForeground[role]),
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
