import type {
  KiskadeeTone,
  Schema,
  SolidColor,
  TonalFunctionalReferenceName
} from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import {
  createBalancedLowBorder,
  createPerceptuallyBalancedAlpha
} from './button-perceptual-alpha.ts';

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
};

type ButtonDefaultThemeRecipe = {
  scale: ThemeShortcut;
  medium: StatefulFunctionalTones;
  high: StatefulFunctionalTones;
  low: {
    hover: KiskadeeTone;
    pressed: KiskadeeTone;
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
const BUTTON_DEFAULT_TONAL_RECIPE = {
  light: {
    scale: 'l',
    medium: {
      rest: { reference: 'subtle', offset: 0 },
      hover: { reference: 'subtle', offset: 2 },
      pressed: { reference: 'subtle', offset: 4 }
    },
    high: {
      rest: { reference: 'vivid', offset: 0 },
      hover: { reference: 'vivid', offset: 1 },
      pressed: { reference: 'vivid', offset: 3 }
    },
    low: {
      hover: 2,
      pressed: 4,
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
      pressed: { reference: 'subtle', offset: 4 }
    },
    high: {
      rest: { reference: 'vivid', offset: 0 },
      hover: { reference: 'vivid', offset: 1 },
      pressed: { reference: 'vivid', offset: -2 }
    },
    low: {
      hover: 14,
      pressed: 22,
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
      pressed: { reference: 'subtle', offset: 4 }
    },
    high: {
      rest: { reference: 'vivid', offset: -1 },
      hover: { reference: 'vivid', offset: 0 },
      pressed: { reference: 'vivid', offset: -3 }
    },
    low: {
      hover: 14,
      pressed: 22,
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
} as const satisfies Record<ButtonRecipeTheme, ButtonDefaultThemeRecipe>;

const BUTTON_ON_VIVID_RECIPE = {
  high: {
    hover: 4,
    pressed: 12,
    foreground: {
      rest: { reference: 'vivid', offset: 0 },
      hover: { reference: 'vivid', offset: 1 },
      pressed: { reference: 'vivid', offset: 3 }
    }
  },
  medium: {
    lightSurfaceAlpha: {
      rest: 14,
      hover: 10,
      pressed: 7
    },
    roleSurface: {
      rest: { reference: 'subtle', offset: 8, targetDeltaE: 0.04 },
      hover: { reference: 'subtle', offset: 6, targetDeltaE: 0.032 },
      pressed: { reference: 'subtle', offset: 4, targetDeltaE: 0.024 }
    },
    roleForeground: { reference: 'subtle', offset: -2 }
  },
  low: {
    content: { reference: 'subtle', offset: 4 },
    borderAlpha: {
      light: 30,
      dark: 100,
      darker: 100
    },
    hoverAlpha: 10,
    pressedAlpha: 30
  },
  disabled: {
    backgroundAlpha: {
      light: 4,
      dark: 10,
      darker: 10
    },
    foregroundAlpha: 40
  }
} as const;

export function createFluent2MicrosoftButtonSchema({
  c,
  shadowBlack
}: CreateFluent2MicrosoftButtonSchemaArgs): ButtonComponent {
  const lightTransparent = c('default', 'l', 'button.neutral', 0, 0);
  const lightAdaptiveDisabled = c('default', 'l', 'button.neutral', 100, 5);
  const lightAdaptiveDisabledText = c('default', 'l', 'button.neutral', 20, 82);
  const darkTransparent = c('default', 'd', 'button.neutral', 0, 0);
  const darkAdaptiveDisabled = c('default', 'd', 'button.neutral', 100, 5);

  const onVividWhite = c('default', 'l', 'button.neutral', 0);
  const onVividTransparent = c('default', 'l', 'button.neutral', 0, 0);
  const onVividDisabledForeground = c(
    'default',
    'l',
    'button.neutral',
    0,
    BUTTON_ON_VIVID_RECIPE.disabled.foregroundAlpha
  );
  const onVividInteractionBackground = (alpha: number) =>
    c('default', 'l', 'button.neutral', 100, alpha);
  const onVividMediumBackground = (alpha: number) => c('default', 'l', 'button.neutral', 0, alpha);
  const onVividCanonicalSurface = c.ref('default', 'l', 'button.primary', 'vivid', 0);

  const createButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) => {
    const recipe = BUTTON_DEFAULT_TONAL_RECIPE[theme];
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
            // Selected remains explicit while intentionally sharing Pressed.
            rest: roleReferenceColor(recipe.medium.pressed)
          }
        },
        high: {
          rest: roleReferenceColor(recipe.high.rest),
          hover: roleReferenceColor(recipe.high.hover),
          pressed: roleReferenceColor(recipe.high.pressed),
          disabled: adaptiveDisabled,
          selected: {
            rest: roleReferenceColor(recipe.high.pressed)
          }
        },
        low: {
          rest: transparent,
          hover: roleColor(recipe.low.hover),
          pressed: roleColor(recipe.low.pressed),
          disabled: adaptiveDisabled,
          selected: {
            rest: roleColor(recipe.low.pressed)
          }
        },
        lowest: {
          rest: transparent,
          hover: roleColor(recipe.low.hover),
          pressed: roleColor(recipe.low.pressed),
          selected: {
            rest: roleColor(recipe.low.pressed)
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

  const createOnVividButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) => {
    const usesSharedLightMedium = theme === 'light';
    const onVividDisabledBackground = c(
      'default',
      'l',
      'button.neutral',
      0,
      BUTTON_ON_VIVID_RECIPE.disabled.backgroundAlpha[theme]
    );
    const onVividLowBorder = c(
      'default',
      'l',
      'button.neutral',
      0,
      BUTTON_ON_VIVID_RECIPE.low.borderAlpha[theme]
    );
    const roleColor = (tone: KiskadeeTone) => c('default', 'l', role, tone);
    const roleReferenceColor = (locator: FunctionalToneLocator) =>
      c.ref('default', 'l', role, locator.reference, locator.offset);
    const mediumSurfaceColor = (locator: FunctionalToneLocator & { targetDeltaE: number }) =>
      createPerceptuallyBalancedAlpha({
        color: roleReferenceColor(locator),
        surface: onVividCanonicalSurface,
        targetDeltaE: locator.targetDeltaE,
        usage: 'On-vivid Medium surface'
      });
    const mediumRest = usesSharedLightMedium
      ? onVividMediumBackground(BUTTON_ON_VIVID_RECIPE.medium.lightSurfaceAlpha.rest)
      : mediumSurfaceColor(BUTTON_ON_VIVID_RECIPE.medium.roleSurface.rest);
    const mediumHover = usesSharedLightMedium
      ? onVividMediumBackground(BUTTON_ON_VIVID_RECIPE.medium.lightSurfaceAlpha.hover)
      : mediumSurfaceColor(BUTTON_ON_VIVID_RECIPE.medium.roleSurface.hover);
    const mediumPressed = usesSharedLightMedium
      ? onVividMediumBackground(BUTTON_ON_VIVID_RECIPE.medium.lightSurfaceAlpha.pressed)
      : mediumSurfaceColor(BUTTON_ON_VIVID_RECIPE.medium.roleSurface.pressed);
    const mediumForeground = usesSharedLightMedium
      ? BUTTON_ON_VIVID_RECIPE.low.content
      : BUTTON_ON_VIVID_RECIPE.medium.roleForeground;

    return {
      boxColor: {
        medium: {
          rest: mediumRest,
          hover: mediumHover,
          pressed: mediumPressed,
          disabled: onVividDisabledBackground,
          selected: {
            rest: mediumPressed
          }
        },
        high: {
          rest: onVividWhite,
          hover: roleColor(BUTTON_ON_VIVID_RECIPE.high.hover),
          pressed: roleColor(BUTTON_ON_VIVID_RECIPE.high.pressed),
          disabled: onVividDisabledBackground,
          selected: {
            rest: roleColor(BUTTON_ON_VIVID_RECIPE.high.pressed)
          }
        },
        low: {
          rest: onVividTransparent,
          hover: onVividInteractionBackground(BUTTON_ON_VIVID_RECIPE.low.hoverAlpha),
          pressed: onVividInteractionBackground(BUTTON_ON_VIVID_RECIPE.low.pressedAlpha),
          disabled: onVividDisabledBackground,
          selected: {
            rest: onVividInteractionBackground(BUTTON_ON_VIVID_RECIPE.low.pressedAlpha)
          }
        },
        lowest: {
          rest: onVividTransparent,
          hover: onVividInteractionBackground(BUTTON_ON_VIVID_RECIPE.low.hoverAlpha),
          pressed: onVividInteractionBackground(BUTTON_ON_VIVID_RECIPE.low.pressedAlpha),
          selected: {
            rest: onVividInteractionBackground(BUTTON_ON_VIVID_RECIPE.low.pressedAlpha)
          }
        }
      },
      borderColor: {
        medium: {
          rest: onVividTransparent
        },
        high: {
          rest: onVividTransparent
        },
        low: {
          rest: onVividLowBorder,
          disabled: onVividTransparent
        },
        lowest: {
          rest: onVividTransparent
        }
      },
      textColor: {
        medium: {
          rest: roleReferenceColor(mediumForeground),
          disabled: {
            ref: onVividDisabledForeground
          }
        },
        high: {
          rest: roleReferenceColor(BUTTON_ON_VIVID_RECIPE.high.foreground.rest),
          hover: {
            ref: roleReferenceColor(BUTTON_ON_VIVID_RECIPE.high.foreground.hover)
          },
          pressed: {
            ref: roleReferenceColor(BUTTON_ON_VIVID_RECIPE.high.foreground.pressed)
          },
          disabled: {
            ref: onVividDisabledForeground
          },
          selected: {
            rest: {
              ref: roleReferenceColor(BUTTON_ON_VIVID_RECIPE.high.foreground.pressed)
            }
          }
        },
        low: {
          rest: roleReferenceColor(BUTTON_ON_VIVID_RECIPE.low.content),
          disabled: {
            ref: onVividDisabledForeground
          }
        },
        lowest: {
          rest: roleReferenceColor(BUTTON_ON_VIVID_RECIPE.low.content),
          disabled: {
            ref: onVividDisabledForeground
          }
        }
      }
    };
  };

  const onSubtleButtonIntentPalettes = {
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

  const createOnVividThemeIntentPalettes = (theme: ButtonRecipeTheme) => ({
    primary: createOnVividButtonIntent(theme, 'button.primary'),
    neutral: createOnVividButtonIntent(theme, 'button.neutral'),
    destructive: createOnVividButtonIntent(theme, 'button.destructive'),
    positive: createOnVividButtonIntent(theme, 'button.positive')
  });

  const onVividButtonIntentPalettes = {
    light: createOnVividThemeIntentPalettes('light'),
    dark: createOnVividThemeIntentPalettes('dark'),
    darker: createOnVividThemeIntentPalettes('darker')
  };

  const createBoxAndBorderContextPalettes = (theme: ButtonRecipeTheme) => ({
    onSubtle: {
      boxColor: {
        primary: onSubtleButtonIntentPalettes[theme].primary.boxColor,
        neutral: onSubtleButtonIntentPalettes[theme].neutral.boxColor,
        destructive: onSubtleButtonIntentPalettes[theme].destructive.boxColor,
        positive: onSubtleButtonIntentPalettes[theme].positive.boxColor
      },
      borderColor: {
        primary: onSubtleButtonIntentPalettes[theme].primary.borderColor,
        neutral: onSubtleButtonIntentPalettes[theme].neutral.borderColor,
        destructive: onSubtleButtonIntentPalettes[theme].destructive.borderColor,
        positive: onSubtleButtonIntentPalettes[theme].positive.borderColor
      }
    },
    onVivid: {
      boxColor: {
        primary: onVividButtonIntentPalettes[theme].primary.boxColor,
        neutral: onVividButtonIntentPalettes[theme].neutral.boxColor,
        destructive: onVividButtonIntentPalettes[theme].destructive.boxColor,
        positive: onVividButtonIntentPalettes[theme].positive.boxColor
      },
      borderColor: {
        primary: onVividButtonIntentPalettes[theme].primary.borderColor,
        neutral: onVividButtonIntentPalettes[theme].neutral.borderColor,
        destructive: onVividButtonIntentPalettes[theme].destructive.borderColor,
        positive: onVividButtonIntentPalettes[theme].positive.borderColor
      }
    }
  });

  const createTextContextPalettes = (theme: ButtonRecipeTheme) => ({
    onSubtle: {
      textColor: {
        primary: onSubtleButtonIntentPalettes[theme].primary.textColor,
        neutral: onSubtleButtonIntentPalettes[theme].neutral.textColor,
        destructive: onSubtleButtonIntentPalettes[theme].destructive.textColor,
        positive: onSubtleButtonIntentPalettes[theme].positive.textColor
      }
    },
    onVivid: {
      textColor: {
        primary: onVividButtonIntentPalettes[theme].primary.textColor,
        neutral: onVividButtonIntentPalettes[theme].neutral.textColor,
        destructive: onVividButtonIntentPalettes[theme].destructive.textColor,
        positive: onVividButtonIntentPalettes[theme].positive.textColor
      }
    }
  });

  return {
    elements: {
      e1: {
        name: 'button',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          paddingTop: {
            's:sm:1': 4,
            's:md:1': { 'bp:all': 9, 'bp:lg:1': 6 },
            's:lg:1': 9
          },
          paddingBottom: {
            's:sm:1': 4,
            's:md:1': { 'bp:all': 9, 'bp:lg:1': 6 },
            's:lg:1': 9
          },
          paddingLeft: {
            's:sm:1': 8,
            's:md:1': { 'bp:all': 16, 'bp:lg:1': 12 },
            's:lg:1': 16
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': { 'bp:all': 16, 'bp:lg:1': 12 },
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
            light: createBoxAndBorderContextPalettes('light'),
            dark: createBoxAndBorderContextPalettes('dark'),
            darker: createBoxAndBorderContextPalettes('darker')
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
            light: createTextContextPalettes('light'),
            dark: createTextContextPalettes('dark'),
            darker: createTextContextPalettes('darker')
          }
        },
        scales: {
          textSize: {
            's:sm:1': 12,
            's:md:1': { 'bp:all': 16, 'bp:lg:1': 14 },
            's:lg:1': 16
          },
          textHeight: {
            's:sm:1': 16,
            's:md:1': { 'bp:all': 22, 'bp:lg:1': 20 },
            's:lg:1': 22
          }
        }
      }
    }
  };
}
