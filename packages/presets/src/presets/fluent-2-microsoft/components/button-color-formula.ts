import { normalizeHexColor, primitive, type SolidColor, withAlpha } from '@kiskadee/core';
import {
  absoluteCap,
  type Fluent2MicrosoftFamilyColorLocator,
  familyExactColor,
  familyReferenceColor
} from '../fluent-2-microsoft.color.ts';
import {
  createBalancedLowBorder,
  createPerceptuallyBalancedAlpha
} from './button-perceptual-alpha.ts';

export type FluentButtonFormulaTheme = 'light' | 'dark' | 'darker';
export type FluentButtonFormulaScale = 'light' | 'dark';

export type FluentButtonTonalFamily = {
  resolve: (
    theme: FluentButtonFormulaScale,
    locator: Fluent2MicrosoftFamilyColorLocator
  ) => SolidColor;
};

type FunctionalToneLocator = Extract<Fluent2MicrosoftFamilyColorLocator, { mode: 'reference' }>;

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
    hover: Fluent2MicrosoftFamilyColorLocator;
    pressed: Fluent2MicrosoftFamilyColorLocator;
    border: FunctionalToneLocator & {
      surface: Fluent2MicrosoftFamilyColorLocator;
      targetDeltaE: number;
    };
  };
  foreground: Fluent2MicrosoftFamilyColorLocator;
  lowestDisabledForeground: Fluent2MicrosoftFamilyColorLocator;
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
      rest: familyReferenceColor('subtle'),
      hover: familyReferenceColor('subtle', 2),
      pressed: familyReferenceColor('subtle', 4)
    },
    high: {
      rest: familyReferenceColor('vivid'),
      hover: familyReferenceColor('vivid', 1),
      pressed: familyReferenceColor('vivid', 3)
    },
    low: {
      hover: familyExactColor(2, 'component.button'),
      pressed: familyExactColor(4, 'component.button'),
      border: {
        ...familyReferenceColor('vivid'),
        surface: absoluteCap(primitive('black', 'v1'), 'light'),
        targetDeltaE: 0.3
      }
    },
    foreground: familyExactColor(65, 'component.button'),
    lowestDisabledForeground: familyExactColor(16, 'component.button')
  },
  dark: {
    scale: 'dark',
    medium: {
      rest: familyReferenceColor('subtle'),
      hover: familyReferenceColor('subtle', 2),
      pressed: familyReferenceColor('subtle', 4)
    },
    high: {
      rest: familyReferenceColor('vivid'),
      hover: familyReferenceColor('vivid', 1),
      pressed: familyReferenceColor('vivid', -2)
    },
    low: {
      hover: familyExactColor(14, 'component.button'),
      pressed: familyExactColor(22, 'component.button'),
      border: {
        ...familyReferenceColor('vivid'),
        surface: familyExactColor(5, 'component.button'),
        targetDeltaE: 0.18
      }
    },
    foreground: familyExactColor(75, 'component.button'),
    lowestDisabledForeground: familyExactColor(35, 'component.button')
  },
  darker: {
    scale: 'dark',
    medium: {
      rest: familyReferenceColor('subtle'),
      hover: familyReferenceColor('subtle', 2),
      pressed: familyReferenceColor('subtle', 4)
    },
    high: {
      rest: familyReferenceColor('vivid', -1),
      hover: familyReferenceColor('vivid'),
      pressed: familyReferenceColor('vivid', -3)
    },
    low: {
      hover: familyExactColor(14, 'component.button'),
      pressed: familyExactColor(22, 'component.button'),
      border: {
        ...familyReferenceColor('vivid', -1),
        surface: absoluteCap(primitive('black', 'v1'), 'dark'),
        targetDeltaE: 0.18
      }
    },
    foreground: familyExactColor(75, 'component.button'),
    lowestDisabledForeground: familyExactColor(35, 'component.button')
  }
} as const satisfies Record<FluentButtonFormulaTheme, ButtonDefaultThemeRecipe>;

export const FLUENT_BUTTON_ON_VIVID_RECIPE = {
  high: {
    hover: familyExactColor(4, 'component.button'),
    pressed: familyExactColor(12, 'component.button'),
    foreground: {
      rest: familyReferenceColor('vivid'),
      hover: familyReferenceColor('vivid', 1),
      pressed: familyReferenceColor('vivid', 3)
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
      rest: { ...familyReferenceColor('subtle', 8), targetDeltaE: 0.04 },
      hover: { ...familyReferenceColor('subtle', 6), targetDeltaE: 0.032 },
      pressed: { ...familyReferenceColor('subtle', 4), targetDeltaE: 0.024 }
    },
    roleForeground: familyReferenceColor('subtle', -2)
  },
  low: {
    content: familyReferenceColor('subtle', 4),
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
    locator: Fluent2MicrosoftFamilyColorLocator
  ) => SolidColor;
  highForeground: SolidColor;
}): FluentButtonIntentFormula {
  const recipe = FLUENT_BUTTON_DEFAULT_TONAL_RECIPE[theme];
  const scale = recipe.scale;
  const isLight = scale === 'light';
  const transparent = neutralButtonFamily.resolve(
    scale,
    absoluteCap(primitive('black', 'v1'), isLight ? 'light' : 'dark', 0)
  );
  const adaptiveDisabled = neutralButtonFamily.resolve(
    scale,
    absoluteCap(primitive('black', 'v1'), isLight ? 'dark' : 'light', 5)
  );
  const disabledForeground = neutralButtonFamily.resolve(scale, recipe.lowestDisabledForeground);
  const filledDisabledForeground = isLight
    ? neutralButtonFamily.resolve('light', familyExactColor(20, 'component.button', 82))
    : disabledForeground;
  const roleColor = (locator: Fluent2MicrosoftFamilyColorLocator) => family.resolve(scale, locator);
  const lowBorder = createBalancedLowBorder({
    color: roleColor(recipe.low.border),
    surface: neutralSurfaceColor(scale, recipe.low.border.surface),
    targetDeltaE: recipe.low.border.targetDeltaE
  });

  return {
    boxColor: {
      medium: {
        rest: roleColor(recipe.medium.rest),
        hover: roleColor(recipe.medium.hover),
        pressed: roleColor(recipe.medium.pressed),
        pending: applySlotVisibility(
          roleColor(recipe.medium.rest),
          FLUENT_BUTTON_PENDING_VISIBILITY.surface
        ),
        disabled: adaptiveDisabled,
        selected: {
          rest: roleColor(recipe.medium.pressed)
        }
      },
      high: {
        rest: roleColor(recipe.high.rest),
        hover: roleColor(recipe.high.hover),
        pressed: roleColor(recipe.high.pressed),
        pending: applySlotVisibility(
          roleColor(recipe.high.rest),
          FLUENT_BUTTON_PENDING_VISIBILITY.surface
        ),
        disabled: adaptiveDisabled,
        selected: {
          rest: roleColor(recipe.high.pressed)
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
  const onVividWhite = neutralButtonFamily.resolve(
    'light',
    absoluteCap(primitive('black', 'v1'), 'light')
  );
  const onVividTransparent = neutralButtonFamily.resolve(
    'light',
    absoluteCap(primitive('black', 'v1'), 'light', 0)
  );
  const onVividDisabledBackground = neutralButtonFamily.resolve(
    'light',
    absoluteCap(
      primitive('black', 'v1'),
      'light',
      FLUENT_BUTTON_ON_VIVID_RECIPE.disabled.backgroundAlpha[theme]
    )
  );
  const onVividDisabledForeground = neutralButtonFamily.resolve(
    'light',
    absoluteCap(
      primitive('black', 'v1'),
      'light',
      FLUENT_BUTTON_ON_VIVID_RECIPE.disabled.foregroundAlpha
    )
  );
  const onVividLowBorder = neutralButtonFamily.resolve(
    'light',
    absoluteCap(
      primitive('black', 'v1'),
      'light',
      FLUENT_BUTTON_ON_VIVID_RECIPE.low.borderAlpha[theme]
    )
  );
  const onVividInteractionBackground = (alpha: number) =>
    neutralButtonFamily.resolve('light', absoluteCap(primitive('black', 'v1'), 'dark', alpha));
  const onVividMediumBackground = (alpha: number) =>
    neutralButtonFamily.resolve('light', absoluteCap(primitive('black', 'v1'), 'light', alpha));
  const roleColor = (locator: Fluent2MicrosoftFamilyColorLocator) =>
    family.resolve('light', locator);
  const mediumSurfaceColor = (locator: FunctionalToneLocator & { targetDeltaE: number }) =>
    createPerceptuallyBalancedAlpha({
      color: roleColor(locator),
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
        rest: roleColor(mediumForeground),
        pending: {
          ref: applySlotVisibility(
            roleColor(mediumForeground),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        disabled: {
          ref: onVividDisabledForeground
        }
      },
      high: {
        rest: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.rest),
        pending: {
          ref: applySlotVisibility(
            roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.rest),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        hover: {
          ref: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.hover)
        },
        pressed: {
          ref: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.pressed)
        },
        disabled: {
          ref: onVividDisabledForeground
        },
        selected: {
          rest: {
            ref: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.high.foreground.pressed)
          }
        }
      },
      low: {
        rest: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
        pending: {
          ref: applySlotVisibility(
            roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
            FLUENT_BUTTON_PENDING_VISIBILITY.content
          )
        },
        disabled: {
          ref: onVividDisabledForeground
        }
      },
      lowest: {
        rest: roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
        pending: {
          ref: applySlotVisibility(
            roleColor(FLUENT_BUTTON_ON_VIVID_RECIPE.low.content),
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
