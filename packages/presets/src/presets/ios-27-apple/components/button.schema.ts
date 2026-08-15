import type { KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import {
  createIos27AppleButtonOnSubtleIntent,
  IOS_27_APPLE_BUTTON_TONAL_RECIPE,
  type Ios27AppleButtonFormulaTheme,
  type Ios27AppleButtonTonalFamily
} from './button-color-formula.ts';

type Ios27AppleSegmentName = 'default';
type ButtonComponent = NonNullable<Schema<Ios27AppleSegmentName>['components']['button']>;
type ButtonColorRole =
  | 'button.primary'
  | 'button.neutral'
  | 'button.destructive'
  | 'button.positive';

type CreateIos27AppleButtonSchemaArgs = {
  c: PresetColorGetter<Ios27AppleSegmentName>;
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
  }
} as const satisfies Record<Ios27AppleButtonFormulaTheme, Record<ButtonColorRole, KiskadeeTone>>;

export function createIos27AppleButtonSchema({
  c
}: CreateIos27AppleButtonSchemaArgs): ButtonComponent {
  const createPresetFamily = (role: ButtonColorRole | 'neutral'): Ios27AppleButtonTonalFamily => ({
    color: (scale, tone, alpha) => c('default', scale, role, tone, alpha),
    reference: (scale, reference, offset = 0, alpha) =>
      c.ref('default', scale, role, reference, offset, alpha)
  });
  const neutralFamily = createPresetFamily('neutral');

  const createIconRegionContextPalettes = () => {
    const createContext = () => ({
      boxColor: {
        neutral: {
          medium: {
            rest: neutralFamily.color('l', 0)
          }
        }
      },
      textColor: {
        neutral: {
          medium: {
            rest: neutralFamily.color('l', 85)
          }
        }
      }
    });

    return {
      onSubtle: createContext()
    };
  };

  const createButtonIntent = (theme: Ios27AppleButtonFormulaTheme, role: ButtonColorRole) => {
    const scale = IOS_27_APPLE_BUTTON_TONAL_RECIPE[theme].scale;
    const mediumSurface =
      role === 'button.destructive' || role === 'button.positive'
        ? 'semantic-tint'
        : 'tertiary-fill';
    return createIos27AppleButtonOnSubtleIntent({
      theme,
      family: createPresetFamily(role),
      mediumSurface,
      neutralFamily,
      highForeground: neutralFamily.color(scale, BUTTON_HIGH_FOREGROUND_TONES[theme][role])
    });
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
    options: {
      iconLayout: 'inline',
      iconPlacement: 'leading',
      iconSurfaceCorners: 'all',
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
          borderWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1
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
                },
                borderColor: {
                  primary: buttonIntentPalettes.light.primary.borderColor,
                  neutral: buttonIntentPalettes.light.neutral.borderColor,
                  destructive: buttonIntentPalettes.light.destructive.borderColor,
                  positive: buttonIntentPalettes.light.positive.borderColor
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
                },
                borderColor: {
                  primary: buttonIntentPalettes.dark.primary.borderColor,
                  neutral: buttonIntentPalettes.dark.neutral.borderColor,
                  destructive: buttonIntentPalettes.dark.destructive.borderColor,
                  positive: buttonIntentPalettes.dark.positive.borderColor
                }
              }
            }
          }
        }
      },
      e2: {
        name: 'button-text',
        typography: {
          's:sm:1': 'body-small',
          's:md:1': 'body-small',
          's:lg:1': 'body-medium'
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
      },
      e3: {
        name: 'button-icon',
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1'
        },
        scales: {
          paddingRight: {
            's:sm:1': 3,
            's:md:1': 4,
            's:lg:1': 4
          }
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
      },
      e4: {
        name: 'button-icon-region',
        palettes: {
          default: {
            light: createIconRegionContextPalettes(),
            dark: createIconRegionContextPalettes()
          }
        },
        scales: {
          paddingLeft: {
            's:sm:1': 8,
            's:md:1': 14,
            's:lg:1': 18
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': 14,
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
            's:sm:1': 2,
            's:md:1': 3,
            's:lg:1': 3
          },
          borderWidth: 0
        }
      }
    }
  };
}
