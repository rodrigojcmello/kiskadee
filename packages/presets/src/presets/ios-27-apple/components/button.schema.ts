import type { KiskadeeTone, Schema, TonalFunctionalReferenceName } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios27AppleSegmentName = 'default';
type ButtonComponent = NonNullable<Schema<Ios27AppleSegmentName>['components']['button']>;
type ThemeShortcut = 'l' | 'd';
type ButtonRecipeTheme = 'light' | 'dark';
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
  high: StatefulFunctionalTones;
  medium: StatefulFunctionalTones;
  lowerEmphasis: Omit<StatefulFunctionalTones, 'rest'>;
  transparentTone: KiskadeeTone;
  tertiaryFill: {
    tone: KiskadeeTone;
    alpha: number;
  };
  tertiaryLabel: {
    tone: KiskadeeTone;
    alpha: number;
  };
  highForeground: Record<ButtonColorRole, KiskadeeTone>;
};

type CreateIos27AppleButtonSchemaArgs = {
  c: PresetColorGetter<Ios27AppleSegmentName>;
};

/**
 * Canonical Kiskadee Button recipe for iOS 27 Apple.
 *
 * The recipe is role-agnostic: intents select a color family while every
 * intent keeps the same functional-reference offsets. Official iOS styles map
 * to High (Bordered - Prominent), Low (Bordered), and Lowest (Borderless).
 * Medium is the documented Kiskadee extension built from the subtle reference.
 */
const BUTTON_TONAL_RECIPE = {
  light: {
    scale: 'l',
    high: {
      rest: { reference: 'vivid', offset: 0 },
      hover: { reference: 'vivid', offset: 1 },
      pressed: { reference: 'vivid', offset: 2 },
      selected: { reference: 'vivid', offset: 1 }
    },
    medium: {
      rest: { reference: 'subtle', offset: 0 },
      hover: { reference: 'subtle', offset: 1 },
      pressed: { reference: 'subtle', offset: 2 },
      selected: { reference: 'subtle', offset: 1 }
    },
    lowerEmphasis: {
      hover: { reference: 'subtle', offset: 0 },
      pressed: { reference: 'subtle', offset: 2 },
      selected: { reference: 'subtle', offset: 1 }
    },
    transparentTone: 0,
    tertiaryFill: {
      tone: 40,
      alpha: 12
    },
    tertiaryLabel: {
      tone: 70,
      alpha: 30
    },
    highForeground: {
      'button.primary': 0,
      'button.neutral': 0,
      'button.destructive': 0,
      'button.positive': 0
    }
  },
  dark: {
    scale: 'd',
    high: {
      rest: { reference: 'vivid', offset: 0 },
      hover: { reference: 'vivid', offset: 1 },
      pressed: { reference: 'vivid', offset: 2 },
      selected: { reference: 'vivid', offset: 1 }
    },
    medium: {
      rest: { reference: 'subtle', offset: 0 },
      hover: { reference: 'subtle', offset: 1 },
      pressed: { reference: 'subtle', offset: 2 },
      selected: { reference: 'subtle', offset: 1 }
    },
    lowerEmphasis: {
      hover: { reference: 'subtle', offset: 0 },
      pressed: { reference: 'subtle', offset: 2 },
      selected: { reference: 'subtle', offset: 1 }
    },
    transparentTone: 0,
    tertiaryFill: {
      tone: 55,
      alpha: 24
    },
    tertiaryLabel: {
      tone: 95,
      alpha: 30
    },
    highForeground: {
      'button.primary': 100,
      'button.neutral': 0,
      'button.destructive': 100,
      'button.positive': 100
    }
  }
} as const satisfies Record<ButtonRecipeTheme, ButtonThemeRecipe>;

export function createIos27AppleButtonSchema({
  c
}: CreateIos27AppleButtonSchemaArgs): ButtonComponent {
  const createButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) => {
    const recipe = BUTTON_TONAL_RECIPE[theme];
    const roleReferenceColor = (locator: FunctionalToneLocator, alpha?: number) =>
      c.ref('default', recipe.scale, role, locator.reference, locator.offset, alpha);
    const neutralColor = (tone: KiskadeeTone, alpha?: number) =>
      c('default', recipe.scale, 'neutral', tone, alpha);
    const transparent = neutralColor(recipe.transparentTone, 0);
    const tertiaryFill = neutralColor(recipe.tertiaryFill.tone, recipe.tertiaryFill.alpha);
    const tertiaryLabel = neutralColor(recipe.tertiaryLabel.tone, recipe.tertiaryLabel.alpha);
    const roleForeground = roleReferenceColor(recipe.high.rest);

    return {
      boxColor: {
        high: {
          rest: roleReferenceColor(recipe.high.rest),
          hover: roleReferenceColor(recipe.high.hover),
          pressed: roleReferenceColor(recipe.high.pressed),
          disabled: tertiaryFill,
          selected: {
            rest: roleReferenceColor(recipe.high.selected)
          }
        },
        medium: {
          rest: roleReferenceColor(recipe.medium.rest),
          hover: roleReferenceColor(recipe.medium.hover),
          pressed: roleReferenceColor(recipe.medium.pressed),
          disabled: tertiaryFill,
          selected: {
            rest: roleReferenceColor(recipe.medium.selected)
          }
        },
        low: {
          rest: tertiaryFill,
          hover: roleReferenceColor(recipe.lowerEmphasis.hover),
          pressed: roleReferenceColor(recipe.lowerEmphasis.pressed),
          selected: {
            rest: roleReferenceColor(recipe.lowerEmphasis.selected)
          }
        },
        lowest: {
          rest: transparent,
          hover: roleReferenceColor(recipe.lowerEmphasis.hover),
          pressed: roleReferenceColor(recipe.lowerEmphasis.pressed),
          selected: {
            rest: roleReferenceColor(recipe.lowerEmphasis.selected)
          }
        }
      },
      textColor: {
        high: {
          rest: neutralColor(recipe.highForeground[role]),
          disabled: {
            ref: tertiaryLabel
          }
        },
        medium: {
          rest: roleForeground,
          disabled: {
            ref: tertiaryLabel
          }
        },
        low: {
          rest: roleForeground,
          disabled: {
            ref: tertiaryLabel
          }
        },
        lowest: {
          rest: roleForeground,
          disabled: {
            ref: tertiaryLabel
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
    }
  };

  return {
    elements: {
      e1: {
        name: 'button',
        decorations: {
          borderStyle: 'none'
        },
        scales: {
          paddingTop: {
            's:sm:1': 4,
            's:md:1': 7,
            's:lg:1': 14
          },
          paddingBottom: {
            's:sm:1': 4,
            's:md:1': 7,
            's:lg:1': 14
          },
          paddingLeft: {
            's:sm:1': 10,
            's:md:1': 14,
            's:lg:1': 20
          },
          paddingRight: {
            's:sm:1': 10,
            's:md:1': 14,
            's:lg:1': 20
          },
          borderRadius: {
            rounded: 25,
            pill: 25,
            square: 0
          }
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
                boxColor: {
                  primary: buttonIntentPalettes.light.primary.boxColor,
                  neutral: buttonIntentPalettes.light.neutral.boxColor,
                  destructive: buttonIntentPalettes.light.destructive.boxColor,
                  positive: buttonIntentPalettes.light.positive.boxColor
                }
              }
            },
            dark: {
              onSubtle: {
                boxColor: {
                  primary: buttonIntentPalettes.dark.primary.boxColor,
                  neutral: buttonIntentPalettes.dark.neutral.boxColor,
                  destructive: buttonIntentPalettes.dark.destructive.boxColor,
                  positive: buttonIntentPalettes.dark.positive.boxColor
                }
              }
            }
          }
        }
      },
      e2: {
        name: 'button-text',
        typography: {
          's:sm:1': 'subheadline',
          's:md:1': 'subheadline',
          's:lg:1': 'body'
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
                textColor: {
                  primary: buttonIntentPalettes.light.primary.textColor,
                  neutral: buttonIntentPalettes.light.neutral.textColor,
                  destructive: buttonIntentPalettes.light.destructive.textColor,
                  positive: buttonIntentPalettes.light.positive.textColor
                }
              }
            },
            dark: {
              onSubtle: {
                textColor: {
                  primary: buttonIntentPalettes.dark.primary.textColor,
                  neutral: buttonIntentPalettes.dark.neutral.textColor,
                  destructive: buttonIntentPalettes.dark.destructive.textColor,
                  positive: buttonIntentPalettes.dark.positive.textColor
                }
              }
            }
          }
        }
      }
    }
  };
}
