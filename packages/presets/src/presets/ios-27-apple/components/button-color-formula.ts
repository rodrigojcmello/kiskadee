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
  semanticMedium: Omit<StatefulFunctionalTones, 'rest'>;
  nonProminent: Omit<StatefulFunctionalTones, 'rest'>;
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
 * Preset intents and optional Brand Packs both resolve through this formula.
 * Medium uses the intent's canonical subtle surface; Low uses Apple's neutral
 * tertiary fill. The emphasis mapping is an explicit Kiskadee adaptation.
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
    semanticMedium: {
      hover: { reference: 'subtle', offset: 1 },
      pressed: { reference: 'subtle', offset: 2 },
      selected: { reference: 'subtle', offset: 1 }
    },
    nonProminent: {
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
    semanticMedium: {
      hover: { reference: 'subtle', offset: 1 },
      pressed: { reference: 'subtle', offset: 2 },
      selected: { reference: 'subtle', offset: 1 }
    },
    nonProminent: {
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
  const mediumRest = family.reference(recipe.scale, 'subtle');
  const mediumInteraction = recipe.semanticMedium;

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
        rest: mediumRest,
        hover: roleReferenceColor(mediumInteraction.hover),
        pressed: roleReferenceColor(mediumInteraction.pressed),
        // Disabled replaces the semantic tint with the native neutral fill.
        disabled: tertiaryFill,
        selected: {
          rest: roleReferenceColor(mediumInteraction.selected)
        }
      },
      low: {
        rest: tertiaryFill,
        hover: roleReferenceColor(recipe.nonProminent.hover),
        pressed: roleReferenceColor(recipe.nonProminent.pressed),
        disabled: tertiaryFill,
        selected: {
          rest: roleReferenceColor(recipe.nonProminent.selected)
        }
      },
      lowest: {
        rest: transparent,
        hover: roleReferenceColor(recipe.nonProminent.hover),
        pressed: roleReferenceColor(recipe.nonProminent.pressed),
        // Clear the persistent selected fill for the disabled borderless appearance.
        disabled: transparent,
        selected: {
          rest: roleReferenceColor(recipe.nonProminent.selected)
        }
      }
    },
    borderColor: {
      high: {
        rest: transparent
      },
      medium: {
        rest: transparent
      },
      low: {
        rest: transparent
      },
      lowest: {
        rest: transparent
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
 * High preserves the full-color mark on a stable light Button. Medium uses a
 * light family tint with deep family content. Low and Lowest use white overlays
 * and foregrounds independently of the surrounding brand or Primary hue.
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
        rest: family.reference('l', 'subtle'),
        hover: family.reference('l', 'subtle', 1),
        pressed: family.reference('l', 'subtle', 2),
        disabled: disabledSurface,
        selected: {
          rest: family.reference('l', 'subtle', 1)
        }
      },
      low: {
        rest: overlay(24),
        hover: overlay(32),
        pressed: overlay(40),
        // The terminal disabled fill overrides the selected overlay.
        disabled: disabledSurface,
        selected: {
          rest: overlay(40)
        }
      },
      lowest: {
        rest: transparent,
        hover: overlay(12),
        pressed: overlay(20),
        // Clear the persistent selected overlay for the disabled borderless appearance.
        disabled: transparent,
        selected: {
          rest: overlay(20)
        }
      }
    },
    borderColor: {
      high: {
        rest: transparent
      },
      medium: {
        rest: transparent
      },
      low: {
        rest: transparent
      },
      lowest: {
        rest: transparent
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
        rest: family.color('l', 85),
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

/** Static Kiskadee contrast treatment for actions on the preset's vivid canvas. */
export function createIos27AppleButtonOnVividIntent({
  family,
  neutralFamily,
  neutral = false
}: {
  family: Ios27AppleButtonTonalFamily;
  neutralFamily: Ios27AppleButtonTonalFamily;
  neutral?: boolean;
}) {
  const white = neutralFamily.color('l', 0);
  const black = neutralFamily.color('l', 100);
  const overlay = (alpha: number) => withAlpha(black, alpha);
  const transparent = overlay(0);
  const disabledSurface = withAlpha(white, 12);
  const disabledForeground = withAlpha(white, 30);
  const tintedForeground = family.reference('l', 'vivid', neutral ? 0 : 10);
  const onSurface = {
    rest: white,
    disabled: { ref: disabledForeground }
  };
  return {
    boxColor: {
      high: {
        rest: white,
        hover: withAlpha(white, 92),
        pressed: withAlpha(white, 84),
        selected: { rest: withAlpha(white, 84) },
        disabled: disabledSurface
      },
      medium: {
        rest: family.reference('l', 'subtle'),
        hover: family.reference('l', 'subtle', 1),
        pressed: family.reference('l', 'subtle', 2),
        selected: { rest: family.reference('l', 'subtle', 1) },
        disabled: disabledSurface
      },
      low: {
        rest: overlay(12),
        hover: overlay(20),
        pressed: overlay(28),
        selected: { rest: overlay(28) },
        disabled: disabledSurface
      },
      lowest: {
        rest: transparent,
        hover: overlay(12),
        pressed: overlay(20),
        selected: { rest: overlay(20) },
        // Reset a persistent selected surface when disabled and selected coexist.
        disabled: transparent
      }
    },
    borderColor: {
      high: { rest: transparent },
      medium: { rest: transparent },
      low: { rest: transparent },
      lowest: { rest: transparent }
    },
    textColor: {
      high: {
        rest: family.reference('l', 'vivid', neutral ? 0 : 10),
        disabled: { ref: disabledForeground }
      },
      medium: {
        rest: tintedForeground,
        disabled: { ref: disabledForeground }
      },
      low: onSurface,
      lowest: onSurface
    }
  };
}
