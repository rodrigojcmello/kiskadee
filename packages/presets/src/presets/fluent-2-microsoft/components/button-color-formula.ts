import {
  type KiskadeeTone,
  normalizeHexColor,
  type SolidColor,
  type TonalFunctionalReferenceName,
  withAlpha
} from '@kiskadee/core';
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
    lightBorderAlpha: {
      rest: 10,
      pressed: 7,
      disabled: 7
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
    lightSurfaceAlpha: {
      hover: 8,
      pressed: 3
    },
    lightBorderAlpha: {
      rest: 30,
      pressed: 7,
      disabled: 7
    },
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

/**
 * Kiskadee pending is a per-slot visibility treatment, not root opacity.
 *
 * Keeping these factors separate lets the Button surface, outline, and label recede while a
 * spinner in the icon slot and a composed Progress remain fully legible.
 */
export const FLUENT_BUTTON_PENDING_VISIBILITY = {
  surface: 60,
  border: 60,
  content: 70
} as const;

function applySlotVisibility(color: SolidColor, visibility: number): SolidColor {
  if (!color.startsWith('#')) {
    return withAlpha(color, visibility);
  }

  const normalized = normalizeHexColor(color);
  const sourceVisibility =
    normalized.length === 9 ? (Number.parseInt(normalized.slice(7, 9), 16) / 255) * 100 : 100;

  return withAlpha(normalized, (sourceVisibility * visibility) / 100);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Removes only the pending delta from a Button text-color intent map.
 *
 * Button icon slots use this projection so arbitrary spinner artwork keeps Rest strength while the
 * adjacent label uses the pending content treatment.
 */
export function omitFluentButtonPendingTextState(
  intentMap: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(intentMap).map(([intent, emphasisValue]) => {
      if (!isRecord(emphasisValue)) return [intent, emphasisValue];

      const emphasisMap = Object.fromEntries(
        Object.entries(emphasisValue).map(([emphasis, stateValue]) => {
          if (!isRecord(stateValue)) return [emphasis, stateValue];
          const { pending: _pending, ...restStates } = stateValue;
          void _pending;
          return [emphasis, restStates];
        })
      );

      return [intent, emphasisMap];
    })
  );
}

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
        pending: applySlotVisibility(
          roleReferenceColor(recipe.medium.rest),
          FLUENT_BUTTON_PENDING_VISIBILITY.surface
        ),
        disabled: adaptiveDisabled,
        selected: {
          rest: roleReferenceColor(recipe.medium.pressed)
        }
      },
      high: {
        rest: roleReferenceColor(recipe.high.rest),
        hover: roleReferenceColor(recipe.high.hover),
        pressed: roleReferenceColor(recipe.high.pressed),
        pending: applySlotVisibility(
          roleReferenceColor(recipe.high.rest),
          FLUENT_BUTTON_PENDING_VISIBILITY.surface
        ),
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
        pending: applySlotVisibility(lowBorder, FLUENT_BUTTON_PENDING_VISIBILITY.border),
        disabled: transparent
      },
      lowest: {
        rest: transparent
      }
    },
    textColor: {
      medium: {
        rest: roleColor(recipe.foreground),
        pending: {
          ref: applySlotVisibility(
            roleColor(recipe.foreground),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        disabled: {
          ref: filledDisabledForeground
        }
      },
      high: {
        rest: highForeground,
        pending: {
          ref: applySlotVisibility(highForeground, FLUENT_BUTTON_PENDING_VISIBILITY.content)
        },
        disabled: {
          ref: filledDisabledForeground
        }
      },
      low: {
        rest: roleColor(recipe.foreground),
        pending: {
          ref: applySlotVisibility(
            roleColor(recipe.foreground),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        disabled: {
          ref: filledDisabledForeground
        }
      },
      lowest: {
        rest: roleColor(recipe.foreground),
        pending: {
          ref: applySlotVisibility(
            roleColor(recipe.foreground),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
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
  const createLightControlBorder = (alpha: {
    rest: number;
    pressed: number;
    disabled: number;
  }) => ({
    rest: onVividMediumBackground(alpha.rest),
    pressed: onVividMediumBackground(alpha.pressed),
    pending: applySlotVisibility(
      onVividMediumBackground(alpha.rest),
      FLUENT_BUTTON_PENDING_VISIBILITY.border
    ),
    disabled: onVividMediumBackground(alpha.disabled),
    selected: {
      rest: onVividMediumBackground(alpha.pressed)
    }
  });
  const mediumBorder = usesSharedLightMedium
    ? createLightControlBorder(FLUENT_BUTTON_ON_VIVID_RECIPE.medium.lightBorderAlpha)
    : {
        rest: onVividTransparent
      };
  const lowRest = onVividTransparent;
  const lowHover = usesSharedLightMedium
    ? onVividMediumBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.lightSurfaceAlpha.hover)
    : onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.hoverAlpha);
  const lowPressed = usesSharedLightMedium
    ? onVividMediumBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.lightSurfaceAlpha.pressed)
    : onVividInteractionBackground(FLUENT_BUTTON_ON_VIVID_RECIPE.low.pressedAlpha);
  const lowBorder = usesSharedLightMedium
    ? createLightControlBorder(FLUENT_BUTTON_ON_VIVID_RECIPE.low.lightBorderAlpha)
    : {
        rest: onVividLowBorder,
        pending: applySlotVisibility(onVividLowBorder, FLUENT_BUTTON_PENDING_VISIBILITY.border),
        disabled: onVividTransparent
      };

  return {
    boxColor: {
      medium: {
        rest: mediumRest,
        hover: mediumHover,
        pressed: mediumPressed,
        pending: applySlotVisibility(mediumRest, FLUENT_BUTTON_PENDING_VISIBILITY.surface),
        disabled: onVividDisabledBackground,
        selected: {
          rest: mediumPressed
        }
      },
      high: {
        rest: onVividWhite,
        hover: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.hover),
        pressed: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.pressed),
        pending: applySlotVisibility(onVividWhite, FLUENT_BUTTON_PENDING_VISIBILITY.surface),
        disabled: onVividDisabledBackground,
        selected: {
          rest: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.pressed)
        }
      },
      low: {
        rest: lowRest,
        hover: lowHover,
        pressed: lowPressed,
        disabled: onVividDisabledBackground,
        selected: {
          rest: lowPressed
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
      medium: mediumBorder,
      high: {
        rest: onVividTransparent
      },
      low: lowBorder,
      lowest: {
        rest: onVividTransparent
      }
    },
    textColor: {
      medium: {
        rest: roleReferenceColor(mediumForeground),
        pending: {
          ref: applySlotVisibility(
            roleReferenceColor(mediumForeground),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        disabled: {
          ref: onVividDisabledForeground
        }
      },
      high: {
        rest: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.rest),
        pending: {
          ref: applySlotVisibility(
            roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.rest),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
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
        pending: {
          ref: applySlotVisibility(
            roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        disabled: {
          ref: onVividDisabledForeground
        }
      },
      lowest: {
        rest: roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
        pending: {
          ref: applySlotVisibility(
            roleReferenceColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        disabled: {
          ref: onVividDisabledForeground
        }
      }
    }
  };
}
