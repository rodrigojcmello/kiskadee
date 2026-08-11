import {
  type KiskadeeTone,
  type SolidColor,
  type TonalFunctionalReferenceName,
  withAlpha
} from '@kiskadee/core';

export type Ios27AppleButtonFormulaTheme = 'light' | 'dark';
export type Ios27AppleButtonFormulaScale = 'l' | 'd';

export type Ios27AppleButtonTonalFamily = {
  color: (scale: Ios27AppleButtonFormulaScale, tone: KiskadeeTone, alpha?: number) => SolidColor;
  reference: (
    scale: Ios27AppleButtonFormulaScale,
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
  selected: FunctionalToneLocator;
};

type ButtonThemeRecipe = {
  scale: Ios27AppleButtonFormulaScale;
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
};

/**
 * Shared iOS 27 Button tonal recipe.
 *
 * Preset intents and optional Brand Packs both resolve through this formula;
 * only the tonal family and the High-emphasis foreground polarity change.
 */
export const IOS_27_APPLE_BUTTON_TONAL_RECIPE = {
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
    }
  }
} as const satisfies Record<Ios27AppleButtonFormulaTheme, ButtonThemeRecipe>;

export function createIos27AppleButtonOnSubtleIntent({
  family,
  highForeground,
  neutralFamily,
  theme
}: {
  family: Ios27AppleButtonTonalFamily;
  highForeground: SolidColor;
  neutralFamily: Ios27AppleButtonTonalFamily;
  theme: Ios27AppleButtonFormulaTheme;
}) {
  const recipe = IOS_27_APPLE_BUTTON_TONAL_RECIPE[theme];
  const roleReferenceColor = (locator: FunctionalToneLocator, alpha?: number) =>
    family.reference(recipe.scale, locator.reference, locator.offset, alpha);
  const neutralColor = (tone: KiskadeeTone, alpha?: number) =>
    neutralFamily.color(recipe.scale, tone, alpha);
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
        rest: highForeground,
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
}

/**
 * Kiskadee extension for brand actions placed on a vivid surrounding surface.
 * High preserves the full-color mark on a stable light Button. Lower emphases
 * use white overlays and foregrounds so they remain legible independently of
 * the surrounding brand or Primary hue.
 */
export function createIos27AppleBrandButtonOnVividIntent({
  family,
  neutralFamily
}: {
  family: Ios27AppleButtonTonalFamily;
  neutralFamily: Ios27AppleButtonTonalFamily;
}) {
  const white = neutralFamily.color('l', 0);
  const transparent = withAlpha(white, 0);
  const disabledSurface = withAlpha(white, 12);
  const disabledForeground = withAlpha(white, 30);
  const brandForeground = family.reference('l', 'vivid');
  const overlay = (alpha: number) => withAlpha(white, alpha);

  return {
    boxColor: {
      high: {
        rest: white,
        hover: overlay(92),
        pressed: overlay(84),
        disabled: disabledSurface,
        selected: {
          rest: overlay(84)
        }
      },
      medium: {
        rest: overlay(24),
        hover: overlay(32),
        pressed: overlay(40),
        disabled: disabledSurface,
        selected: {
          rest: overlay(40)
        }
      },
      low: {
        rest: overlay(12),
        hover: overlay(20),
        pressed: overlay(28),
        selected: {
          rest: overlay(28)
        }
      },
      lowest: {
        rest: transparent,
        hover: overlay(12),
        pressed: overlay(20),
        selected: {
          rest: overlay(20)
        }
      }
    },
    textColor: {
      high: {
        rest: brandForeground,
        disabled: {
          ref: disabledForeground
        }
      },
      medium: {
        rest: white,
        disabled: {
          ref: disabledForeground
        }
      },
      low: {
        rest: white,
        disabled: {
          ref: disabledForeground
        }
      },
      lowest: {
        rest: white,
        disabled: {
          ref: disabledForeground
        }
      }
    }
  };
}
