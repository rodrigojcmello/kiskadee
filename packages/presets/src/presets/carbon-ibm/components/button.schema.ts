import { primitive, type Schema, type SolidColor, withAlpha } from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver, referenceColor } from '../carbon-ibm.color.ts';
import { type CarbonTokenName, tokenColor } from '../carbon-ibm.tokens.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type Theme = 'light' | 'dark' | 'darker';
type Intent = 'primary' | 'neutral' | 'destructive' | 'positive';
type Emphasis = 'high' | 'medium' | 'low' | 'lowest';
type StateColors = {
  rest: SolidColor;
  hover?: SolidColor;
  pressed?: SolidColor;
  focus?: SolidColor;
  pending?: SolidColor;
  disabled?: SolidColor;
  selected?: { rest: SolidColor; hover?: SolidColor; pressed?: SolidColor; focus?: SolidColor };
};
type IntentColors = Record<Emphasis, StateColors>;
type Recipe = { boxColor: IntentColors; borderColor: IntentColors; textColor: IntentColors };

const INTENTS = ['primary', 'neutral', 'destructive', 'positive'] as const;
const EMPHASES = ['high', 'medium', 'low', 'lowest'] as const;
const THEMES = ['light', 'dark', 'darker'] as const;
const BUTTON_SCALES = ['s:sm:2', 's:sm:1', 's:md:1', 's:lg:1', 's:lg:2', 's:lg:3'] as const;
const themes = <T>(factory: (theme: Theme) => T) => ({
  light: factory('light'),
  dark: factory('dark'),
  darker: factory('darker')
});
const scale = <T>(value: T) => Object.fromEntries(BUTTON_SCALES.map((key) => [key, value]));
const contexts = <T>(factory: (surface: 'onSubtle' | 'onVivid') => T) => ({
  onSubtle: factory('onSubtle'),
  onVivid: factory('onVivid')
});

export function createCarbonIbmButtonSchema({ c }: { c: CarbonIbmColorResolver }): ButtonComponent {
  const cap = (alpha = 100) =>
    c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'light', alpha));
  const transparent = cap(0);
  const tonal = (theme: Theme, intent: Intent, reference: 'subtle' | 'vivid', offset = 0) =>
    c.resolve(
      'default',
      theme === 'light' ? 'l' : 'd',
      referenceColor(`button.${intent}`, reference, offset)
    );
  const token = (theme: Theme, name: CarbonTokenName, intent?: Intent) =>
    tokenColor(c, theme, name, intent ? `button.${intent}` : undefined);

  const onSubtle = (theme: Theme, intent: Intent): Recipe => {
    const neutral = intent === 'neutral';
    const danger = intent === 'destructive';
    const positive = intent === 'positive';
    const highRest = positive
      ? tonal('light', intent, 'vivid')
      : token(
          theme,
          neutral ? 'button-secondary' : danger ? 'button-danger-primary' : 'button-primary',
          intent
        );
    const highHover = positive
      ? tonal('light', intent, 'vivid', 1)
      : token(
          theme,
          neutral
            ? 'button-secondary-hover'
            : danger
              ? 'button-danger-hover'
              : 'button-primary-hover',
          intent
        );
    const highPressed = positive
      ? tonal('light', intent, 'vivid', 4)
      : token(
          theme,
          neutral
            ? 'button-secondary-active'
            : danger
              ? 'button-danger-active'
              : 'button-primary-active',
          intent
        );
    const highSelected = neutral
      ? token('light', 'text-secondary', intent)
      : intent === 'primary'
        ? token('light', 'link-secondary', intent)
        : tonal('light', intent, 'vivid', 2);
    const solidText = token(theme, 'text-on-color');
    const lowerText = neutral
      ? token(theme, 'text-primary')
      : danger
        ? token(theme, 'button-danger-secondary', intent)
        : positive
          ? theme === 'light'
            ? tonal(theme, intent, 'vivid')
            : token(theme, 'support-success', intent)
          : token(theme, 'button-tertiary');
    const lowHover = neutral
      ? token(theme, 'button-secondary-hover', intent)
      : danger
        ? token(theme, 'button-danger-hover', intent)
        : positive
          ? highHover
          : token(theme, 'button-tertiary-hover');
    const lowPressed =
      neutral || danger || positive ? highPressed : token(theme, 'button-tertiary-active');
    const lowFocus = neutral || danger || positive ? highRest : lowerText;
    const lowSelected =
      neutral || danger || positive
        ? highSelected
        : theme === 'light'
          ? highSelected
          : token(theme, 'layer-selected-inverse');
    const lowInverseText = neutral || danger || positive ? solidText : token(theme, 'text-inverse');
    const disabledSurface = token(theme, 'button-disabled');
    const disabledText = token(theme, 'text-disabled');
    const filledDisabledText = token(theme, 'text-on-color-disabled');
    const mediumRest = neutral ? token(theme, 'layer-01') : tonal(theme, intent, 'subtle');
    const mediumHover = neutral
      ? token(theme, 'layer-hover-01')
      : tonal(theme, intent, 'subtle', 1);
    const mediumPressed = neutral
      ? token(theme, 'layer-active-01')
      : tonal(theme, intent, 'subtle', 4);
    const mediumSelected = neutral
      ? token(theme, 'layer-selected-01')
      : tonal(theme, intent, 'subtle', 2);
    const mediumSelectedHover = neutral
      ? token(theme, 'layer-selected-hover-01')
      : tonal(theme, intent, 'subtle', 3);
    const mediumText =
      !neutral && theme === 'light'
        ? tonal(theme, intent, 'vivid', 3)
        : intent === 'primary'
          ? token(theme, 'link-primary', intent)
          : lowerText;
    const ghostHover = danger ? highHover : token(theme, 'background-hover');
    const ghostPressed = danger ? highPressed : token(theme, 'background-active');
    const ghostSelected = danger ? highSelected : token(theme, 'background-selected');
    const ghostText = intent === 'primary' ? token(theme, 'link-primary', intent) : lowerText;
    const ghostHoverText = danger
      ? solidText
      : intent === 'primary'
        ? token(theme, 'link-primary-hover', intent)
        : ghostText;
    const ghostActiveText =
      intent === 'primary' || positive
        ? tonal(theme, intent, 'vivid', theme === 'light' ? 4 : 8)
        : ghostHoverText;

    return {
      boxColor: {
        high: {
          rest: highRest,
          hover: highHover,
          pressed: highPressed,
          pending: withAlpha(highRest, 70),
          disabled: disabledSurface,
          selected: { rest: highSelected, pressed: highPressed }
        },
        medium: {
          rest: mediumRest,
          hover: mediumHover,
          pressed: mediumPressed,
          pending: withAlpha(mediumRest, 70),
          disabled: disabledSurface,
          selected: { rest: mediumSelected, hover: mediumSelectedHover, pressed: mediumPressed }
        },
        low: {
          rest: transparent,
          hover: lowHover,
          pressed: lowPressed,
          focus: lowFocus,
          pending: transparent,
          disabled: transparent,
          selected: { rest: lowSelected, pressed: lowPressed }
        },
        lowest: {
          rest: transparent,
          hover: ghostHover,
          pressed: ghostPressed,
          pending: transparent,
          disabled: transparent,
          selected: {
            rest: ghostSelected,
            ...(danger ? {} : { hover: token(theme, 'background-selected-hover') }),
            pressed: ghostPressed
          }
        }
      },
      borderColor: {
        high: { rest: transparent },
        medium: { rest: transparent },
        low: {
          rest: lowerText,
          pending: withAlpha(lowerText, 60),
          disabled: disabledSurface
        },
        lowest: { rest: transparent }
      },
      textColor: {
        high: { rest: solidText, pending: withAlpha(solidText, 70), disabled: filledDisabledText },
        medium: {
          rest: mediumText,
          pending: withAlpha(mediumText, 70),
          disabled: filledDisabledText
        },
        low: {
          rest: lowerText,
          hover: lowInverseText,
          pressed: lowInverseText,
          focus: lowInverseText,
          pending: withAlpha(lowerText, 70),
          disabled: disabledText,
          selected: { rest: lowInverseText }
        },
        lowest: {
          rest: ghostText,
          ...(danger || intent === 'primary' || positive
            ? { hover: positive ? ghostActiveText : ghostHoverText, pressed: ghostActiveText }
            : {}),
          pending: withAlpha(ghostText, 70),
          disabled: disabledText,
          ...(danger || intent === 'primary' || positive
            ? { selected: { rest: danger ? solidText : ghostActiveText } }
            : {})
        }
      }
    };
  };

  // Carbon does not publish a chromatic surface-context recipe. Keep this inversion explicit.
  const onVivid = (intent: Intent): Recipe => {
    const ink =
      intent === 'neutral' ? token('light', 'text-primary') : tonal('light', intent, 'vivid', 3);
    const filled = (
      rest: number,
      hover: number,
      pressed: number,
      selected: number,
      polarity: 'light' | 'dark' = 'light'
    ): StateColors => ({
      rest: c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), polarity, rest)),
      hover: c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), polarity, hover)),
      pressed: c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), polarity, pressed)),
      pending: c.resolve(
        'default',
        'l',
        absoluteCap(primitive('black', 'v1'), polarity, rest * 0.7)
      ),
      disabled: cap(16),
      selected: {
        rest: c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), polarity, selected)),
        pressed: c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), polarity, pressed))
      }
    });
    const lower = { rest: cap(), pending: cap(70), disabled: cap(25) };
    return {
      boxColor: {
        high: filled(100, 95, 80, 90),
        medium: filled(16, 24, 40, 32, 'dark'),
        low: {
          rest: transparent,
          hover: cap(),
          pressed: cap(80),
          focus: cap(),
          pending: transparent,
          disabled: transparent,
          selected: { rest: cap(90), pressed: cap(80) }
        },
        lowest: { ...filled(0, 12, 32, 24, 'dark'), pending: transparent, disabled: transparent }
      },
      borderColor: {
        high: { rest: transparent },
        medium: { rest: transparent },
        low: { rest: cap(), pending: cap(60), disabled: cap(16) },
        lowest: { rest: transparent }
      },
      textColor: {
        high: { rest: ink, pending: withAlpha(ink, 70), disabled: cap(25) },
        medium: lower,
        low: { ...lower, hover: ink, pressed: ink, focus: ink, selected: { rest: ink } },
        lowest: lower
      }
    };
  };

  const recipes = themes((theme) => ({
    onSubtle: Object.fromEntries(INTENTS.map((intent) => [intent, onSubtle(theme, intent)])),
    onVivid: Object.fromEntries(INTENTS.map((intent) => [intent, onVivid(intent)]))
  }));
  const boxPalettes = (theme: Theme) =>
    contexts((surface) => ({
      boxColor: Object.fromEntries(
        INTENTS.map((intent) => [intent, recipes[theme][surface][intent].boxColor])
      ),
      borderColor: Object.fromEntries(
        INTENTS.map((intent) => [intent, recipes[theme][surface][intent].borderColor])
      )
    }));
  const parentStates = (states: StateColors, icon: boolean) =>
    Object.fromEntries(
      Object.entries(states)
        .filter(([state]) => !icon || state !== 'pending')
        .map(([state, value]) => [
          state,
          state === 'rest'
            ? value
            : state === 'selected'
              ? Object.fromEntries(
                  Object.entries(value).map(([selectedState, color]) => [
                    selectedState,
                    { ref: color }
                  ])
                )
              : { ref: value }
        ])
    );
  const textPalettes = (theme: Theme, icon = false) =>
    contexts((surface) => ({
      textColor: Object.fromEntries(
        INTENTS.map((intent) => [
          intent,
          Object.fromEntries(
            EMPHASES.map((emphasis) => [
              emphasis,
              parentStates(recipes[theme][surface][intent].textColor[emphasis], icon)
            ])
          )
        ])
      )
    }));
  const iconRegion = (theme: Theme) => ({
    onSubtle: {
      boxColor: { neutral: { medium: { rest: token(theme, 'layer-01') } } },
      textColor: { neutral: { medium: { rest: token(theme, 'text-primary') } } }
    },
    onVivid: {
      boxColor: { neutral: { medium: { rest: cap() } } },
      textColor: { neutral: { medium: { rest: token('light', 'text-primary') } } }
    }
  });
  const divider = (theme: Theme) => ({
    onSubtle: { boxColor: { neutral: { medium: { rest: token(theme, 'button-separator') } } } },
    onVivid: { boxColor: { neutral: { medium: { rest: cap(40) } } } }
  });

  return {
    contentSurfaceContext: {
      default: Object.fromEntries(
        THEMES.map((theme) => [
          theme,
          Object.fromEntries(
            (['onSubtle', 'onVivid'] as const).map((surface) => [
              surface,
              Object.fromEntries(
                INTENTS.map((intent) => [
                  intent,
                  {
                    high: {
                      rest: surface === 'onSubtle' ? 'onVivid' : 'onSubtle',
                      pending: surface === 'onSubtle' ? 'onVivid' : 'onSubtle',
                      disabled: 'inherit'
                    },
                    medium: { rest: 'inherit', pending: 'inherit', disabled: 'inherit' },
                    low: {
                      rest: 'inherit',
                      selected:
                        surface === 'onVivid' || (intent === 'primary' && theme !== 'light')
                          ? 'onSubtle'
                          : 'onVivid',
                      pending: 'inherit',
                      disabled: 'inherit'
                    },
                    lowest: {
                      rest: 'inherit',
                      ...(intent === 'destructive' && surface === 'onSubtle'
                        ? { selected: 'onVivid' }
                        : {}),
                      pending: 'inherit',
                      disabled: 'inherit'
                    }
                  }
                ])
              )
            ])
          )
        ])
      )
    },
    options: {
      density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' },
      groupDivider: true,
      disclosureDivider: false,
      iconLayout: 'edge',
      iconPlacement: 'trailing',
      iconSurfaceCorners: 'edge',
      iconTreatment: 'plain'
    },
    elements: {
      e1: {
        name: 'button',
        decorations: { borderStyle: 'solid', textAlign: 'left' },
        scales: {
          paddingTop: {
            's:sm:2': 3,
            's:sm:1': 7,
            's:md:1': 11,
            's:lg:1': 15,
            's:lg:2': 15,
            's:lg:3': 15
          },
          paddingBottom: {
            's:sm:2': 3,
            's:sm:1': 7,
            's:md:1': 11,
            's:lg:1': 15,
            's:lg:2': 31,
            's:lg:3': 47
          },
          paddingLeft: 16,
          paddingRight: 16,
          borderWidth: 1,
          borderRadius: {
            square: 0,
            rounded: 4,
            pill: {
              's:sm:2': 12,
              's:sm:1': 16,
              's:md:1': 20,
              's:lg:1': 24,
              's:lg:2': 32,
              's:lg:3': 40
            }
          }
        },
        palettes: { default: themes(boxPalettes) }
      },
      e2: {
        name: 'button-text',
        typography: scale('body-medium'),
        palettes: { default: themes((theme) => textPalettes(theme)) }
      },
      e3: {
        name: 'button-icon',
        iconSize: scale('s:sm:1'),
        scales: { paddingRight: 8 },
        palettes: { default: themes((theme) => textPalettes(theme, true)) }
      },
      e4: {
        name: 'button-icon-region',
        scales: { paddingLeft: 16, paddingRight: 16 },
        palettes: { default: themes(iconRegion) }
      },
      e5: {
        name: 'button-disclosure',
        iconSize: scale('s:sm:1'),
        scales: { paddingRight: scale(8) }
      },
      e6: {
        name: 'button-divider',
        scales: {
          boxWidth: scale(1),
          boxHeight: {
            's:sm:2': 24,
            's:sm:1': 32,
            's:md:1': 40,
            's:lg:1': 48,
            's:lg:2': 64,
            's:lg:3': 80
          }
        },
        palettes: { default: themes(divider) }
      },
      e7: {
        name: 'button-badge-relation',
        scales: { paddingLeft: scale(8), paddingRight: scale(8) }
      }
    }
  };
}
