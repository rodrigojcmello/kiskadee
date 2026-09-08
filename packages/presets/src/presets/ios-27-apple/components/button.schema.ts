import type { KiskadeeTone, Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import {
  createIos27AppleButtonOnSubtleIntent,
  createIos27AppleButtonOnVividIntent,
  IOS_27_APPLE_BUTTON_TONAL_RECIPE,
  type Ios27AppleButtonFormulaTheme,
  type Ios27AppleButtonTonalFamily
} from './button-color-formula.ts';

type Ios27AppleSegmentName = 'default';
type ButtonTheme = 'light' | 'dark' | 'darker';
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

const BUTTON_DIVIDER_TONES = {
  light: 10,
  dark: 16
} as const satisfies Record<Ios27AppleButtonFormulaTheme, KiskadeeTone>;

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
      onSubtle: createContext(),
      onVivid: createContext()
    };
  };

  const createDividerContextPalettes = (theme: Ios27AppleButtonFormulaTheme) => ({
    onVivid: { boxColor: { neutral: { medium: { rest: neutralFamily.color('l', 0, 30) } } } },
    onSubtle: {
      boxColor: {
        neutral: {
          medium: {
            rest: neutralFamily.color(
              IOS_27_APPLE_BUTTON_TONAL_RECIPE[theme].scale,
              BUTTON_DIVIDER_TONES[theme]
            )
          }
        }
      }
    }
  });

  const createButtonIntent = (theme: Ios27AppleButtonFormulaTheme, role: ButtonColorRole) => {
    const scale = IOS_27_APPLE_BUTTON_TONAL_RECIPE[theme].scale;
    return createIos27AppleButtonOnSubtleIntent({
      theme,
      family: createPresetFamily(role),
      neutralFamily,
      highForeground: neutralFamily.color(scale, BUTTON_HIGH_FOREGROUND_TONES[theme][role])
    });
  };

  const createIntentPalettes = (theme: ButtonTheme, onVivid: boolean) => {
    const create = (role: ButtonColorRole) =>
      onVivid
        ? createIos27AppleButtonOnVividIntent({
            family: createPresetFamily(role),
            neutralFamily,
            neutral: role === 'button.neutral'
          })
        : createButtonIntent(theme === 'darker' ? 'dark' : theme, role);
    return {
      primary: create('button.primary'),
      neutral: create('button.neutral'),
      destructive: create('button.destructive'),
      positive: create('button.positive')
    };
  };
  const createSurfaceContext = (theme: ButtonTheme, onVivid: boolean) => {
    const p = createIntentPalettes(theme, onVivid);
    return {
      boxColor: {
        primary: p.primary.boxColor,
        neutral: p.neutral.boxColor,
        destructive: p.destructive.boxColor,
        positive: p.positive.boxColor
      },
      borderColor: {
        primary: p.primary.borderColor,
        neutral: p.neutral.borderColor,
        destructive: p.destructive.borderColor,
        positive: p.positive.borderColor
      }
    };
  };
  const createTextContext = (theme: ButtonTheme, onVivid: boolean) => {
    const p = createIntentPalettes(theme, onVivid);
    return {
      textColor: {
        primary: p.primary.textColor,
        neutral: p.neutral.textColor,
        destructive: p.destructive.textColor,
        positive: p.positive.textColor
      }
    };
  };
  const createPalettes = <T>(createContext: (theme: ButtonTheme, onVivid: boolean) => T) => ({
    default: {
      light: { onSubtle: createContext('light', false), onVivid: createContext('light', true) },
      dark: { onSubtle: createContext('dark', false), onVivid: createContext('dark', true) },
      darker: { onSubtle: createContext('darker', false), onVivid: createContext('darker', true) }
    }
  });

  return {
    options: {
      groupDivider: true,
      disclosureDivider: false,
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
            's:sm:1': 16,
            's:md:1': 14,
            's:lg:1': 20
          },
          paddingRight: {
            's:sm:1': 16,
            's:md:1': 14,
            's:lg:1': 20
          },
          borderWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1
          },
          borderRadius: {
            rounded: 6,
            pill: 25,
            square: 0
          }
        },
        palettes: createPalettes(createSurfaceContext)
      },
      e2: {
        name: 'button-text',
        typography: {
          's:sm:1': 'body-extra-small',
          's:md:1': 'body-small',
          's:lg:1': 'body-medium'
        },
        palettes: createPalettes(createTextContext)
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
        palettes: createPalettes(createTextContext)
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
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 24
          }
        },
        palettes: {
          default: {
            light: createDividerContextPalettes('light'),
            dark: createDividerContextPalettes('dark'),
            darker: createDividerContextPalettes('dark')
          }
        }
      }
    }
  };
}
