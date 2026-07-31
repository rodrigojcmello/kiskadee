import type { KiskadeeTone, SolidColor, TonalFunctionalReferenceName } from '@kiskadee/core';
import {
  createBalancedLowBorder,
  createPerceptuallyBalancedAlpha
} from './button-perceptual-alpha.ts';

export type FluentButtonFormulaTheme = 'light' | 'dark' | 'darker';
export type FluentButtonFormulaScale = 'light' | 'dark';

export type FluentButtonTonalFamily = {
  color: (theme: FluentButtonFormulaScale, tone: KiskadeeTone, alpha?: number) => SolidColor;
  reference: (
    theme: FluentButtonFormulaScale,
    reference: TonalFunctionalReferenceName,
    offset?: number,
    alpha?: number
  ) => SolidColor;
};

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
  scale: FluentButtonFormulaScale;
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
  lowestDisabledForeground: KiskadeeTone;
};

type FluentButtonIntentFormula = {
  boxColor: Record<string, unknown>;
  borderColor: Record<string, unknown>;
  textColor: Record<string, unknown>;
};

/**
 * Canonical Kiskadee Button recipe for Fluent 2 Microsoft.
 *
 * This data is deliberately independent from the source of a tonal family.
 * Preset intents and optional external brand packs therefore travel through
 * the same emphasis and interaction-state formula.
 */
export const FLUENT_BUTTON_DEFAULT_TONAL_RECIPE = {
  light: {
    scale: 'light',
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
    lowestDisabledForeground: 16
  },
  dark: {
    scale: 'dark',
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
    lowestDisabledForeground: 35
  },
  darker: {
    scale: 'dark',
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
    lowestDisabledForeground: 35
  }
} as const satisfies Record<FluentButtonFormulaTheme, ButtonDefaultThemeRecipe>;

export const FLUENT_BUTTON_ON_VIVID_RECIPE = {
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

export function createFluentButtonOnSubtleIntent({
  theme,
  family,
  neutralButtonFamily,
  neutralSurfaceColor,
  highForeground
}: {
  theme: FluentButtonFormulaTheme;
  family: FluentButtonTonalFamily;
  neutralButtonFamily: FluentButtonTonalFamily;
  neutralSurfaceColor: (
    theme: FluentButtonFormulaScale,
    tone: KiskadeeTone,
    alpha?: number
  ) => SolidColor;
  highForeground: SolidColor;
}): FluentButtonIntentFormula {
  const recipe = FLUENT_BUTTON_DEFAULT_TONAL_RECIPE[theme];
  const scale = recipe.scale;
  const isLight = scale === 'light';
  const transparent = neutralButtonFamily.color(scale, 0, 0);
  const adaptiveDisabled = neutralButtonFamily.color(scale, 100, 5);
  const disabledForeground = neutralButtonFamily.color(scale, recipe.lowestDisabledForeground);
  const filledDisabledForeground = isLight
    ? neutralButtonFamily.color('light', 20, 82)
    : disabledForeground;
  const roleColor = (tone: KiskadeeTone, alpha?: number) => family.color(scale, tone, alpha);
  const roleReferenceColor = (locator: FunctionalToneLocator, alpha?: number) =>
    family.reference(scale, locator.reference, locator.offset, alpha);
  const lowBorder = createBalancedLowBorder({
    color: roleReferenceColor(recipe.low.border),
    surface: neutralSurfaceColor(scale, recipe.low.border.surfaceTone),
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
        rest: highForeground,
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
}

export function createFluentButtonOnVividIntent({
  theme,
  family,
  neutralButtonFamily,
  canonicalSurface
}: {
  theme: FluentButtonFormulaTheme;
  family: FluentButtonTonalFamily;
  neutralButtonFamily: FluentButtonTonalFamily;
  canonicalSurface: SolidColor;
}): FluentButtonIntentFormula {
  const usesSharedLightMedium = theme === 'light';
  const onVividWhite = neutralButtonFamily.color('light', 0);
  const onVividTransparent = neutralButtonFamily.color('light', 0, 0);
  const onVividDisabledBackground = neutralButtonFamily.color(
    'light',
    0,
    FLUENT_BUTTON_ON_VIVID_RECIPE.disabled.backgroundAlpha[theme]
  );
  const onVividDisabledForeground = neutralButtonFamily.color(
    'light',
    0,
    FLUENT_BUTTON_ON_VIVID_RECIPE.disabled.foregroundAlpha
  );
  const onVividLowBorder = neutralButtonFamily.color(
    'light',
    0,
    FLUENT_BUTTON_ON_VIVID_RECIPE.low.borderAlpha[theme]
  );
  const onVividInteractionBackground = (alpha: number) =>
    neutralButtonFamily.color('light', 100, alpha);
  const onVividMediumBackground = (alpha: number) => neutralButtonFamily.color('light', 0, alpha);
  const roleColor = (tone: KiskadeeTone) => family.color('light', tone);
  const roleReferenceColor = (locator: FunctionalToneLocator) =>
    family.reference('light', locator.reference, locator.offset);
  const mediumSurfaceColor = (locator: FunctionalToneLocator & { targetDeltaE: number }) =>
    createPerceptuallyBalancedAlpha({
      color: roleReferenceColor(locator),
      surface: canonicalSurface,
      targetDeltaE: locator.targetDeltaE,
      usage: 'On-vivid Medium surface'
    });
  const mediumRest = usesSharedLightMedium
    ? onVividMediumBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.medium.lightSurfaceAlpha.rest)
    : mediumSurfaceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.medium.roleSurface.rest);
  const mediumHover = usesSharedLightMedium
    ? onVividMediumBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.medium.lightSurfaceAlpha.hover)
    : mediumSurfaceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.medium.roleSurface.hover);
  const mediumPressed = usesSharedLightMedium
    ? onVividMediumBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.medium.lightSurfaceAlpha.pressed)
    : mediumSurfaceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.medium.roleSurface.pressed);
  const mediumForeground = usesSharedLightMedium
    ? FLUENT_BUTTON_ON_VIVID_RECIPE.low.content
    : FLUENT_BUTTON_ON_VIVID_RECIPE.medium.roleForeground;

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
        hover: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.hover),
        pressed: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.pressed),
        disabled: onVividDisabledBackground,
        selected: {
          rest: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.pressed)
        }
      },
      low: {
        rest: onVividTransparent,
        hover: onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.hoverAlpha),
        pressed: onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.pressedAlpha),
        disabled: onVividDisabledBackground,
        selected: {
          rest: onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.pressedAlpha)
        }
      },
      lowest: {
        rest: onVividTransparent,
        hover: onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.hoverAlpha),
        pressed: onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.pressedAlpha),
        selected: {
          rest: onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.pressedAlpha)
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
        rest: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.rest),
        hover: {
          ref: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.hover)
        },
        pressed: {
          ref: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.pressed)
        },
        disabled: {
          ref: onVividDisabledForeground
        },
        selected: {
          rest: {
            ref: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.pressed)
          }
        }
      },
      low: {
        rest: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
        disabled: {
          ref: onVividDisabledForeground
        }
      },
      lowest: {
        rest: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
        disabled: {
          ref: onVividDisabledForeground
        }
      }
    }
  };
}
