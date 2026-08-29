import type { KiskadeeTone, Schema, SolidColor } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import {
  createFluentButtonOnSubtleIntent,
  createFluentButtonOnVividIntent,
  FLUENT_BUTTON_DEFAULT_TONAL_RECIPE,
  type FluentButtonFormulaScale,
  type FluentButtonFormulaTheme,
  type FluentButtonTonalFamily,
  omitFluentButtonPendingTextState
} from './button-color-formula.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type Fluent2MicrosoftSegmentName = 'default';
type ThemeShortcut = 'l' | 'd';
type ButtonRecipeTheme = FluentButtonFormulaTheme;
type ButtonColorRole =
  | 'button.primary'
  | 'button.neutral'
  | 'button.destructive'
  | 'button.positive';

type CreateFluent2MicrosoftButtonSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  shadowBlack: (alpha: number) => SolidColor;
};

const BUTTON_HIGH_FOREGROUND_TONES = {
  light: {
    'button.primary': 0,
    'button.neutral': 0,
    'button.destructive': 0,
    'button.positive': 0
  },
  dark: {
    'button.primary': 100,
    'button.neutral': 0,
    'button.destructive': 100,
    'button.positive': 100
  },
  darker: {
    'button.primary': 100,
    'button.neutral': 0,
    'button.destructive': 100,
    'button.positive': 100
  }
} as const satisfies Record<ButtonRecipeTheme, Record<ButtonColorRole, KiskadeeTone>>;

const BUTTON_DIVIDER_TONES = {
  light: 7,
  dark: 30,
  darker: 12
} as const satisfies Record<ButtonRecipeTheme, KiskadeeTone>;

export function createFluent2MicrosoftButtonSchema({
  c,
  shadowBlack
}: CreateFluent2MicrosoftButtonSchemaArgs): ButtonComponent {
  const toThemeShortcut = (theme: FluentButtonFormulaScale): ThemeShortcut =>
    theme === 'light' ? 'l' : 'd';
  const createPresetFamily = (role: ButtonColorRole): FluentButtonTonalFamily => ({
    color: (theme, tone, alpha) => c('default', toThemeShortcut(theme), role, tone, alpha),
    reference: (theme, reference, offset = 0, alpha) =>
      c.ref('default', toThemeShortcut(theme), role, reference, offset, alpha)
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
    tone: KiskadeeTone,
    alpha?: number
  ) => c('default', toThemeShortcut(theme), 'neutral', tone, alpha);
  const onVividCanonicalSurface = families['button.primary'].reference('light', 'vivid', 0);

  const createButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) => {
    const recipe = FLUENT_BUTTON_DEFAULT_TONAL_RECIPE[theme];
    return createFluentButtonOnSubtleIntent({
      theme,
      family: families[role],
      neutralButtonFamily,
      neutralSurfaceColor,
      highForeground: neutralButtonFamily.color(
        recipe.scale,
        BUTTON_HIGH_FOREGROUND_TONES[theme][role]
      )
    });
  };

  const createOnVividButtonIntent = (theme: ButtonRecipeTheme, role: ButtonColorRole) =>
    createFluentButtonOnVividIntent({
      theme,
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
            rest: neutralButtonFamily.color('light', 0)
          }
        }
      },
      textColor: {
        neutral: {
          medium: {
            rest: neutralButtonFamily.color('light', 85)
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
      BUTTON_DIVIDER_TONES[theme]
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
      groupDivider: true,
      disclosureDivider: false,
      iconLayout: 'inline',
      iconPlacement: 'leading',
      iconSurfaceCorners: 'edge',
      iconTreatment: 'plain'
    },
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
            x: { rest: 0, hover: 0, pressed: 0, focus: 0, pending: 0, disabled: 0 },
            y: { rest: 2, hover: 4, pressed: 0, focus: 4, pending: 0, disabled: 0 },
            blur: { rest: 6, hover: 10, pressed: 0, focus: 10, pending: 0, disabled: 0 },
            color: {
              rest: shadowBlack(0.28),
              hover: shadowBlack(0.35),
              pressed: shadowBlack(0.32),
              focus: shadowBlack(0.35),
              pending: shadowBlack(0),
              disabled: shadowBlack(0)
            }
          }
        }
      },
      e2: {
        name: 'button-text',
        typography: {
          's:sm:1': 'caption-medium',
          's:md:1': { 'bp:all': 'label-large', 'bp:lg:1': 'body-medium-strong' },
          's:lg:1': 'label-large'
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
          's:sm:1': 's:md:1',
          's:md:1': { 'bp:all': 's:lg:1', 'bp:lg:1': 's:md:1' },
          's:lg:1': 's:lg:1'
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
            's:lg:1': 6
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
            's:md:1': { 'bp:all': 18, 'bp:lg:1': 14 },
            's:lg:1': 18
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': { 'bp:all': 18, 'bp:lg:1': 14 },
            's:lg:1': 18
          }
        }
      },
      e5: {
        name: 'button-disclosure',
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:sm:1',
          's:lg:1': 's:sm:1'
        },
        scales: {
          paddingRight: {
            's:sm:1': 3,
            's:md:1': 4,
            's:lg:1': 4
          }
        }
      },
      e6: {
        name: 'button-divider',
        scales: {
          boxWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1
          },
          boxHeight: {
            's:sm:1': 20,
            's:md:1': { 'bp:all': 24, 'bp:lg:1': 20 },
            's:lg:1': 24
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
            's:lg:1': 6
          },
          paddingRight: {
            's:sm:1': 4,
            's:md:1': 6,
            's:lg:1': 6
          }
        }
      }
    }
  };
}
