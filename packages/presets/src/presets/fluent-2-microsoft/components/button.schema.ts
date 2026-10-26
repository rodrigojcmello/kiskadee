import {
  type ForegroundCoordinate,
  type ForegroundProfileName,
  type ForegroundState,
  fg,
  primitive,
  type Schema,
  type SurfaceContext,
  type TextEmphasis
} from '@kiskadee/core';
import { bindPresetColorRole } from '../../../utils/presetColor.ts';
import {
  absoluteCap,
  type Fluent2MicrosoftColorResolver,
  type Fluent2MicrosoftFamilyColorLocator,
  familyReferenceColor
} from '../fluent-2-microsoft.color.ts';
import {
  createFluentButtonOnSubtleIntent,
  createFluentButtonOnVividIntent,
  FLUENT_BUTTON_DEFAULT_TONAL_RECIPE,
  type FluentButtonFormulaScale,
  type FluentButtonFormulaTheme,
  type FluentButtonTonalFamily,
  omitFluentButtonPendingTextState
} from './button-color-formula.ts';

import { createNeutralControlRecipe } from './neutral-control-recipe.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type ThemeShortcut = 'l' | 'd';
type ButtonRecipeTheme = FluentButtonFormulaTheme;
type ButtonColorRole =
  | 'button.primary'
  | 'button.neutral'
  | 'button.destructive'
  | 'button.positive';
type ButtonIntent = 'primary' | 'neutral' | 'destructive' | 'positive';
type ButtonForegroundFamily = 'blue' | 'neutral' | 'red' | 'green';
type ButtonIndicatorPlacement = 'inside' | 'outside';

const BUTTON_FOREGROUND_FAMILY = {
  primary: 'blue',
  neutral: 'neutral',
  destructive: 'red',
  positive: 'green'
} as const satisfies Record<ButtonIntent, ButtonForegroundFamily>;

function createForegroundCoordinate({
  family,
  profile,
  theme,
  surfaceContext,
  emphasis,
  state
}: {
  family: ButtonForegroundFamily;
  profile: ForegroundProfileName;
  theme: ButtonRecipeTheme;
  surfaceContext: SurfaceContext;
  emphasis: TextEmphasis;
  state?: ForegroundState;
}): ForegroundCoordinate {
  return state
    ? `${family}.${profile}.${theme}.${surfaceContext}.${emphasis}.${state}`
    : `${family}.${profile}.${theme}.${surfaceContext}.${emphasis}`;
}

function foregroundReference(
  family: ButtonForegroundFamily,
  profile: ForegroundProfileName,
  theme: ButtonRecipeTheme,
  surfaceContext: SurfaceContext,
  emphasis: TextEmphasis,
  state?: ForegroundState
) {
  return fg(
    createForegroundCoordinate({ family, profile, theme, surfaceContext, emphasis, state })
  );
}

function parentStateForegroundReference(
  family: ButtonForegroundFamily,
  profile: ForegroundProfileName,
  theme: ButtonRecipeTheme,
  surfaceContext: SurfaceContext,
  emphasis: TextEmphasis,
  state: ForegroundState
) {
  return fg.parentState(
    createForegroundCoordinate({ family, profile, theme, surfaceContext, emphasis, state })
  );
}

type CreateFluent2MicrosoftButtonSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
};

const BUTTON_HIGH_FOREGROUND_POLARITIES = {
  light: {
    'button.primary': 'light',
    'button.neutral': 'light',
    'button.destructive': 'light',
    'button.positive': 'light'
  },
  dark: {
    'button.primary': 'light',
    'button.neutral': 'dark',
    'button.destructive': 'light',
    'button.positive': 'light'
  },
  darker: {
    'button.primary': 'light',
    'button.neutral': 'dark',
    'button.destructive': 'light',
    'button.positive': 'light'
  }
} as const satisfies Record<ButtonRecipeTheme, Record<ButtonColorRole, 'light' | 'dark'>>;

const BUTTON_DIVIDER_LOCATORS = {
  light: familyReferenceColor('subtle', 3),
  dark: familyReferenceColor('subtle', 16),
  darker: familyReferenceColor('subtle', 7)
} as const satisfies Record<ButtonRecipeTheme, Fluent2MicrosoftFamilyColorLocator>;

const BUTTON_BORDER_WIDTH = {
  's:sm:1': 1,
  's:md:1': 1,
  's:lg:1': 1,
  's:lg:2': 1
} as const;

const BUTTON_SHARED_RADII = { rounded: 4, square: 0 } as const;

const BUTTON_INDICATOR_SCALES = {
  boxWidth: { 's:sm:1': 24, 's:md:1': 30, 's:lg:1': 36, 's:lg:2': 36 },
  boxHeight: 2,
  marginTop: 2,
  marginBottom: 2,
  marginLeft: 2,
  marginRight: 2,
  borderRadius: { rounded: 2, pill: 2, square: 0 }
} as const;

export function createFluent2MicrosoftButtonSchema({
  c
}: CreateFluent2MicrosoftButtonSchemaArgs): ButtonComponent {
  const toThemeShortcut = (theme: FluentButtonFormulaScale): ThemeShortcut =>
    theme === 'light' ? 'l' : 'd';
  const createPresetFamily = (role: ButtonColorRole): FluentButtonTonalFamily => ({
    resolve: (theme, locator) =>
      c.resolve('default', toThemeShortcut(theme), bindPresetColorRole(role, locator))
  });
  const families = {
    'button.primary': createPresetFamily('button.primary'),
    'button.neutral': createPresetFamily('button.neutral'),
    'button.destructive': createPresetFamily('button.destructive'),
    'button.positive': createPresetFamily('button.positive')
  } satisfies Record<ButtonColorRole, FluentButtonTonalFamily>;
  const neutralButtonFamily = families['button.neutral'];
  const neutralSurfaceColor = (
    theme: FluentButtonFormulaScale,
    locator: Fluent2MicrosoftFamilyColorLocator
  ) => c.resolve('default', toThemeShortcut(theme), bindPresetColorRole('neutral', locator));
  const onVividCanonicalSurface = families['button.primary'].resolve(
    'light',
    familyReferenceColor('vivid')
  );

  const createButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) => {
    const recipe = FLUENT_BUTTON_DEFAULT_TONAL_RECIPE[theme];
    return createFluentButtonOnSubtleIntent({
      theme,
      neutralControlBottom:
        role === 'button.neutral' && theme !== 'darker'
          ? createNeutralControlRecipe(c, theme, false).bottom
          : undefined,
      family: families[role],
      lightenHighInteraction: theme === 'light' && role === 'button.neutral',
      neutralButtonFamily,
      neutralSurfaceColor,
      highForeground: neutralButtonFamily.resolve(
        recipe.scale,
        absoluteCap(primitive('black', 'v1'), BUTTON_HIGH_FOREGROUND_POLARITIES[theme][role])
      )
    });
  };

  const createOnVividButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) =>
    createFluentButtonOnVividIntent({
      theme,
      neutralControlBottom:
        role === 'button.neutral' && theme !== 'darker'
          ? createNeutralControlRecipe(c, theme, true).bottom
          : undefined,
      family: families[role],
      neutralButtonFamily,
      canonicalSurface: onVividCanonicalSurface
    });

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
      borderBottomColor: {
        primary: onSubtleButtonIntentPalettes[theme].primary.borderBottomColor,
        neutral: onSubtleButtonIntentPalettes[theme].neutral.borderBottomColor,
        destructive: onSubtleButtonIntentPalettes[theme].destructive.borderBottomColor,
        positive: onSubtleButtonIntentPalettes[theme].positive.borderBottomColor
      },
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
      borderBottomColor: {
        primary: onVividButtonIntentPalettes[theme].primary.borderBottomColor,
        neutral: onVividButtonIntentPalettes[theme].neutral.borderBottomColor,
        destructive: onVividButtonIntentPalettes[theme].destructive.borderBottomColor,
        positive: onVividButtonIntentPalettes[theme].positive.borderBottomColor
      },
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

  const createOnSubtleTextIntent = (theme: ButtonRecipeTheme, intent: ButtonIntent) => {
    const family = BUTTON_FOREGROUND_FAMILY[intent];
    const high =
      intent === 'neutral' && theme !== 'light'
        ? {
            family: 'neutral' as const,
            profile: 'standard' as const,
            theme: 'light' as const,
            surfaceContext: 'onSubtle' as const,
            emphasis: 'high' as const
          }
        : {
            family: 'neutral' as const,
            profile: 'standard' as const,
            theme: 'light' as const,
            surfaceContext: 'onVivid' as const,
            emphasis: 'high' as const
          };
    const lower =
      intent === 'neutral'
        ? {
            family,
            profile: 'standard' as const,
            theme,
            surfaceContext: 'onSubtle' as const,
            emphasis: 'medium' as const
          }
        : {
            family,
            profile: 'deep' as const,
            theme,
            surfaceContext: 'onSubtle' as const,
            emphasis: 'high' as const
          };
    const disabled = {
      family: 'neutral' as const,
      profile: 'standard' as const,
      theme,
      surfaceContext: 'onSubtle' as const,
      emphasis: 'medium' as const
    };
    const lowestDisabled = { ...disabled, emphasis: 'lowest' as const };
    const direct = (coordinate: typeof high | typeof lower) =>
      foregroundReference(
        coordinate.family,
        coordinate.profile,
        coordinate.theme,
        coordinate.surfaceContext,
        coordinate.emphasis
      );
    const parent = (
      coordinate: typeof high | typeof lower | typeof disabled | typeof lowestDisabled,
      state: ForegroundState
    ) =>
      parentStateForegroundReference(
        coordinate.family,
        coordinate.profile,
        coordinate.theme,
        coordinate.surfaceContext,
        coordinate.emphasis,
        state
      );
    const lowerStates = {
      rest: direct(lower),
      pending: parent(lower, 'pending'),
      disabled: parent(disabled, 'disabled')
    };

    return {
      high: {
        rest: direct(high),
        pending: parent(high, 'pending'),
        disabled: parent(disabled, 'disabled'),
        selected: { rest: parent(high, 'pressed') }
      },
      medium: lowerStates,
      low: lowerStates,
      lowest: {
        rest: direct(lower),
        pending: parent(lower, 'pending'),
        disabled: parent(lowestDisabled, 'disabled')
      }
    };
  };

  const createOnVividTextIntent = (intent: ButtonIntent) => {
    const family = BUTTON_FOREGROUND_FAMILY[intent];
    const high = {
      family,
      profile: 'standard' as const,
      theme: 'light' as const,
      surfaceContext: 'onSubtle' as const,
      emphasis: 'high' as const
    };
    const lower = {
      family,
      profile: intent === 'neutral' ? ('standard' as const) : ('deep' as const),
      theme: 'light' as const,
      surfaceContext: 'onVivid' as const,
      emphasis: 'high' as const
    };
    const disabled = {
      family: 'neutral' as const,
      profile: 'standard' as const,
      theme: 'light' as const,
      surfaceContext: 'onVivid' as const,
      emphasis: 'high' as const
    };
    const direct = (coordinate: typeof high | typeof lower) =>
      foregroundReference(
        coordinate.family,
        coordinate.profile,
        coordinate.theme,
        coordinate.surfaceContext,
        coordinate.emphasis
      );
    const parent = (
      coordinate: typeof high | typeof lower | typeof disabled,
      state: ForegroundState
    ) =>
      parentStateForegroundReference(
        coordinate.family,
        coordinate.profile,
        coordinate.theme,
        coordinate.surfaceContext,
        coordinate.emphasis,
        state
      );
    const lowerStates = {
      rest: direct(lower),
      pending: parent(lower, 'pending'),
      disabled: parent(disabled, 'disabled')
    };

    return {
      high: {
        rest: direct(high),
        hover: parent(high, 'hover'),
        pressed: parent(high, 'pressed'),
        pending: parent(high, 'pending'),
        disabled: parent(disabled, 'disabled'),
        selected: { rest: parent(high, 'pressed') }
      },
      medium: lowerStates,
      low: lowerStates,
      lowest: lowerStates
    };
  };

  const createTextContextPalettes = (theme: ButtonRecipeTheme) => ({
    onSubtle: {
      textColor: Object.fromEntries(
        (Object.keys(BUTTON_FOREGROUND_FAMILY) as ButtonIntent[]).map((intent) => [
          intent,
          createOnSubtleTextIntent(theme, intent)
        ])
      )
    },
    onVivid: {
      textColor: Object.fromEntries(
        (Object.keys(BUTTON_FOREGROUND_FAMILY) as ButtonIntent[]).map((intent) => [
          intent,
          createOnVividTextIntent(intent)
        ])
      )
    }
  });

  const createIconTextContextPalettes = (theme: ButtonRecipeTheme) => {
    const textPalettes = createTextContextPalettes(theme);

    return {
      onSubtle: {
        textColor: omitFluentButtonPendingTextState(textPalettes.onSubtle.textColor)
      },
      onVivid: {
        textColor: omitFluentButtonPendingTextState(textPalettes.onVivid.textColor)
      }
    };
  };

  const createIconRegionContextPalettes = () => {
    const createContext = () => ({
      boxColor: {
        neutral: {
          medium: {
            rest: neutralButtonFamily.resolve(
              'light',
              absoluteCap(primitive('black', 'v1'), 'light')
            )
          }
        }
      },
      textColor: {
        neutral: {
          medium: {
            rest: foregroundReference('neutral', 'standard', 'light', 'onSubtle', 'high')
          }
        }
      }
    });

    return {
      onSubtle: createContext(),
      onVivid: createContext()
    };
  };

  const createDividerContextPalettes = (theme: ButtonRecipeTheme) => {
    const rest = neutralSurfaceColor(
      FLUENT_BUTTON_DEFAULT_TONAL_RECIPE[theme].scale,
      BUTTON_DIVIDER_LOCATORS[theme]
    );
    const createContext = () => ({
      boxColor: {
        neutral: {
          medium: { rest }
        }
      }
    });

    return {
      onSubtle: createContext(),
      onVivid: createContext()
    };
  };

  const createIndicatorPalettes = (placement: ButtonIndicatorPlacement) => {
    const indicatorColor = (
      theme: ButtonRecipeTheme,
      context: SurfaceContext,
      intent: ButtonIntent,
      emphasis: 'high' | 'medium' | 'low' | 'lowest'
    ) => {
      if (context === 'onVivid') {
        if (placement === 'outside') {
          return parentStateForegroundReference(
            'neutral',
            'standard',
            theme,
            'onVivid',
            'high',
            'rest'
          );
        }
        return parentStateForegroundReference(
          'blue',
          emphasis === 'high' ? 'standard' : 'deep',
          'light',
          emphasis === 'high' ? 'onSubtle' : 'onVivid',
          'high',
          'rest'
        );
      }

      if (placement === 'inside' && emphasis === 'high') {
        return intent === 'neutral' && theme !== 'light'
          ? parentStateForegroundReference('blue', 'deep', 'light', 'onSubtle', 'high', 'rest')
          : parentStateForegroundReference(
              'neutral',
              'standard',
              'light',
              'onVivid',
              'high',
              'rest'
            );
      }

      return parentStateForegroundReference('blue', 'standard', theme, 'onSubtle', 'high', 'rest');
    };

    return {
      default: Object.fromEntries(
        (['light', 'dark', 'darker'] as const).map((theme) => [
          theme,
          Object.fromEntries(
            (['onSubtle', 'onVivid'] as const).map((context) => [
              context,
              {
                boxColor: Object.fromEntries(
                  (Object.keys(BUTTON_FOREGROUND_FAMILY) as ButtonIntent[]).map((intent) => [
                    intent,
                    Object.fromEntries(
                      (['high', 'medium', 'low', 'lowest'] as const).map((emphasis) => [
                        emphasis,
                        {
                          selected: {
                            rest: indicatorColor(theme, context, intent, emphasis)
                          }
                        }
                      ])
                    )
                  ])
                )
              }
            ])
          )
        ])
      )
    };
  };

  const createContentSurfaceContext = () =>
    Object.fromEntries(
      (['light', 'dark', 'darker'] as const).map((theme) => [
        theme,
        Object.fromEntries(
          (['onSubtle', 'onVivid'] as const).map((input) => [
            input,
            Object.fromEntries(
              (['primary', 'neutral', 'destructive', 'positive'] as const).map((intent) => [
                intent,
                {
                  high: {
                    rest: input === 'onVivid' ? 'onSubtle' : 'onVivid',
                    pending: input === 'onVivid' ? 'onSubtle' : 'onVivid',
                    disabled: 'onSubtle'
                  },
                  medium: { rest: 'onVivid', pending: 'onVivid', disabled: 'onSubtle' },
                  low: { rest: 'inherit' },
                  lowest: { rest: 'inherit' }
                }
              ])
            )
          ])
        )
      ])
    );

  return {
    contentSurfaceContext: {
      default: createContentSurfaceContext()
    },
    options: {
      density: { compact: 's:md:1', spacious: 's:lg:1' },
      groupDivider: true,
      disclosureDivider: false,
      iconLayout: 'inline',
      iconPlacement: 'leading',
      iconSurfaceCorners: 'edge',
      iconTreatment: 'plain',
      indicatorPlacement: 'inside',
      indicatorScope: 'stacked'
    },
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            pressed: false,
            pending: false,
            disabled: false
          }
        }
      }
    },
    elements: {
      e1: {
        name: 'button',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          _boxHeight: {
            's:sm:1': 24,
            's:md:1': 32,
            's:lg:1': 40,
            's:lg:2': 48
          },
          paddingTop: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 9,
            's:lg:2': 13
          },
          paddingBottom: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 9,
            's:lg:2': 13
          },
          paddingLeft: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16,
            's:lg:2': 20
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16,
            's:lg:2': 20
          },
          borderWidth: BUTTON_BORDER_WIDTH,
          borderRadius: {
            ...BUTTON_SHARED_RADII,
            pill: { 's:sm:1': 12, 's:md:1': 16, 's:lg:1': 20, 's:lg:2': 24 }
          }
        },
        palettes: {
          default: {
            light: createBoxAndBorderContextPalettes('light'),
            dark: createBoxAndBorderContextPalettes('dark'),
            darker: createBoxAndBorderContextPalettes('darker')
          }
        }
      },
      e2: {
        name: 'button-text',
        typography: {
          's:sm:1': 'caption-medium',
          's:md:1': 'body-medium-strong',
          's:lg:1': 'label-large',
          's:lg:2': 'label-large'
        },
        palettes: {
          default: {
            light: createTextContextPalettes('light'),
            dark: createTextContextPalettes('dark'),
            darker: createTextContextPalettes('darker')
          }
        }
      },
      e3: {
        name: 'button-icon',
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:1'
        },
        palettes: {
          default: {
            light: createIconTextContextPalettes('light'),
            dark: createIconTextContextPalettes('dark'),
            darker: createIconTextContextPalettes('darker')
          }
        },
        scales: {
          paddingRight: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 6,
            's:lg:2': 6
          }
        }
      },
      e4: {
        name: 'button-icon-region',
        palettes: {
          default: {
            light: createIconRegionContextPalettes(),
            dark: createIconRegionContextPalettes(),
            darker: createIconRegionContextPalettes()
          }
        },
        scales: {
          paddingLeft: {
            's:sm:1': 8,
            's:md:1': 14,
            's:lg:1': 18,
            's:lg:2': 18
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': 14,
            's:lg:1': 18,
            's:lg:2': 18
          }
        }
      },
      e5: {
        name: 'button-disclosure',
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:sm:1',
          's:lg:1': 's:sm:1',
          's:lg:2': 's:sm:1'
        },
        scales: {
          paddingRight: {
            's:sm:1': 3,
            's:md:1': 4,
            's:lg:1': 4,
            's:lg:2': 4
          }
        }
      },
      e6: {
        name: 'button-divider',
        scales: {
          boxWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1,
            's:lg:2': 1
          },
          boxHeight: {
            's:sm:1': 20,
            's:md:1': 20,
            's:lg:1': 24,
            's:lg:2': 24
          }
        },
        palettes: {
          default: {
            light: createDividerContextPalettes('light'),
            dark: createDividerContextPalettes('dark'),
            darker: createDividerContextPalettes('darker')
          }
        }
      },
      e7: {
        name: 'button-badge-relation',
        scales: {
          paddingLeft: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 6,
            's:lg:2': 6
          },
          paddingRight: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 6,
            's:lg:2': 6
          }
        }
      },
      e8: {
        name: 'button-stacked',
        scales: {
          _boxHeight: {
            's:sm:1': 46,
            's:md:1': 54,
            's:lg:1': 68,
            's:lg:2': 80
          },
          paddingTop: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 8,
            's:lg:2': 12
          },
          paddingBottom: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 8,
            's:lg:2': 12
          },
          paddingLeft: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16,
            's:lg:2': 20
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16,
            's:lg:2': 20
          },
          borderWidth: BUTTON_BORDER_WIDTH,
          borderRadius: {
            ...BUTTON_SHARED_RADII,
            pill: { 's:sm:1': 23, 's:md:1': 27, 's:lg:1': 34, 's:lg:2': 40 }
          }
        }
      },
      e9: {
        name: 'button-stacked-text',
        typography: {
          's:sm:1': 'caption-small',
          's:md:1': 'caption-small',
          's:lg:1': 'body-medium',
          's:lg:2': 'body-medium'
        },
        scales: {
          marginTop: {
            's:sm:1': 4,
            's:md:1': 4,
            's:lg:1': 4,
            's:lg:2': 4
          }
        }
      },
      e10: {
        name: 'button-stacked-icon',
        iconSize: {
          's:sm:1': 's:md:1',
          's:md:1': 's:lg:1',
          's:lg:1': 's:lg:2',
          's:lg:2': 's:lg:3'
        }
      },
      e11: {
        name: 'button-indicator',
        scales: BUTTON_INDICATOR_SCALES,
        palettes: createIndicatorPalettes('inside')
      },
      e12: {
        name: 'button-indicator-outside',
        scales: BUTTON_INDICATOR_SCALES,
        palettes: createIndicatorPalettes('outside')
      }
    }
  };
}
