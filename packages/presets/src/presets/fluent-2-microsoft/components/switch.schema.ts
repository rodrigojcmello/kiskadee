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
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from '../fluent-2-microsoft.color.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type ThemeName = 'light' | 'dark' | 'darker';
type ThemeShortcut = 'l' | 'd';
type SwitchForegroundFamily = 'neutral' | 'blue' | 'red' | 'green';
type SwitchIntent = 'neutral' | 'accent' | 'polarity';

type CreateFluent2MicrosoftSwitchSchemaArgs = {
  c: Fluent2MicrosoftColorResolver;
};

const THEME_TRACK = {
  light: 'l',
  dark: 'd',
  darker: 'd'
} as const satisfies Record<ThemeName, ThemeShortcut>;

const SWITCH_INTENTS = ['neutral', 'accent', 'polarity'] as const satisfies readonly SwitchIntent[];

function createForegroundCoordinate({
  family,
  profile,
  theme,
  surfaceContext,
  emphasis,
  state
}: {
  family: SwitchForegroundFamily;
  profile: ForegroundProfileName;
  theme: ThemeName;
  surfaceContext: SurfaceContext;
  emphasis: TextEmphasis;
  state?: ForegroundState;
}): ForegroundCoordinate {
  return `${family}.${profile}.${theme}.${surfaceContext}.${emphasis}${state ? `.${state}` : ''}`;
}

function foregroundReference(
  family: SwitchForegroundFamily,
  profile: ForegroundProfileName,
  theme: ThemeName,
  surfaceContext: SurfaceContext,
  emphasis: TextEmphasis,
  state?: ForegroundState
) {
  return fg(
    createForegroundCoordinate({ family, profile, theme, surfaceContext, emphasis, state })
  );
}

function parentStateForegroundReference(
  family: SwitchForegroundFamily,
  profile: ForegroundProfileName,
  theme: ThemeName,
  surfaceContext: SurfaceContext,
  emphasis: TextEmphasis,
  state: ForegroundState
) {
  return fg.parentState(
    createForegroundCoordinate({ family, profile, theme, surfaceContext, emphasis, state })
  );
}

export function createFluent2MicrosoftSwitchSchema({
  c
}: CreateFluent2MicrosoftSwitchSchemaArgs): SwitchComponent {
  const color = (
    theme: ThemeName,
    locator: Parameters<Fluent2MicrosoftColorResolver['resolve']>[2]
  ) => c.resolve('default', THEME_TRACK[theme], locator);
  const physicalLight = (locator: Parameters<Fluent2MicrosoftColorResolver['resolve']>[2]) =>
    c.resolve('default', 'l', locator);
  const white = physicalLight(absoluteCap(primitive('black', 'v1'), 'light'));
  const transparent = physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 0));

  const createOnSubtleColors = (theme: ThemeName) => {
    const isLight = theme === 'light';
    const trackRest = isLight
      ? white
      : color(theme, exactColor(primitive('black', 'v1'), 9, 'component.switch'));
    const trackDisabled = color(theme, exactColor(primitive('black', 'v1'), 3, 'component.switch'));
    const neutralStrokeRole = isLight ? primitive('black', 'v1') : 'switch.neutral';
    const neutralStrokeRest = color(
      theme,
      exactColor(neutralStrokeRole, isLight ? 50 : 80, 'component.switch')
    );
    const neutralStrokeHover = color(
      theme,
      exactColor(neutralStrokeRole, isLight ? 55 : 85, 'component.switch')
    );
    const neutralStrokePressed = color(
      theme,
      exactColor(neutralStrokeRole, isLight ? 60 : 80, 'component.switch')
    );
    const disabledStroke = color(
      theme,
      exactColor(primitive('black', 'v1'), isLight ? 7 : 22, 'component.switch')
    );
    const disabledThumb = color(
      theme,
      exactColor(primitive('black', 'v1'), isLight ? 16 : 35, 'component.switch')
    );
    const brandRest = color(theme, referenceColor('primary', 'vivid', isLight ? 2 : 6));
    const brandHover = color(theme, referenceColor('primary', 'vivid', isLight ? 4 : 8));
    const brandPressed = color(theme, referenceColor('primary', 'vivid', isLight ? 6 : 4));
    const polarityOff = color(theme, referenceColor('redLike', 'vivid'));
    const polarityOn = color(theme, referenceColor('greenLike', 'vivid'));

    return {
      trackRest,
      trackDisabled,
      neutralStrokeRest,
      neutralStrokeHover,
      neutralStrokePressed,
      disabledStroke,
      disabledThumb,
      brandRest,
      brandHover,
      brandPressed,
      polarityOff,
      polarityOn
    };
  };

  const onVividColors = {
    trackRest: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 14)),
    trackHover: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 20)),
    trackPressed: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 28)),
    trackDisabled: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 12)),
    borderRest: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 72)),
    borderHover: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 88)),
    borderDisabled: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 20)),
    thumbDisabled: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 38)),
    brandRest: physicalLight(referenceColor('primary', 'vivid', 2)),
    brandHover: physicalLight(referenceColor('primary', 'vivid', 4)),
    brandPressed: physicalLight(referenceColor('primary', 'vivid', 6)),
    polarityOff: physicalLight(referenceColor('redLike', 'vivid')),
    polarityOn: physicalLight(referenceColor('greenLike', 'vivid'))
  };

  // Windows-inspired Accent experiment; see the Switch evidence for the ordinal recipe.
  const onVividAccentColors = {
    trackRest: transparent,
    trackHover: physicalLight(absoluteCap(primitive('black', 'v1'), 'light', 8)),
    trackPressed: onVividColors.trackRest,
    selectedRest: physicalLight(referenceColor('primary', 'subtle', 10)),
    selectedHover: physicalLight(referenceColor('primary', 'subtle', 12)),
    selectedPressed: physicalLight(referenceColor('primary', 'subtle', 14)),
    selectedThumb: physicalLight(absoluteCap(primitive('black', 'v1'), 'dark'))
  };

  const createOnSubtleTrackIntent = (theme: ThemeName, intent: SwitchIntent) => {
    const colors = createOnSubtleColors(theme);
    const selectedRest = intent === 'polarity' ? colors.polarityOn : colors.brandRest;

    return {
      boxColor: {
        rest: colors.trackRest,
        selected:
          intent === 'polarity'
            ? { rest: { ref: selectedRest } }
            : {
                rest: { ref: selectedRest },
                hover: { ref: colors.brandHover },
                pressed: { ref: colors.brandPressed }
              },
        disabled: { ref: colors.trackDisabled }
      },
      borderColor: {
        rest: colors.neutralStrokeRest,
        hover: { ref: colors.neutralStrokeHover },
        pressed: { ref: colors.neutralStrokePressed },
        // Selected must suppress the unchecked Hover/Pressed stroke as well.
        selected: {
          rest: { ref: transparent },
          hover: { ref: transparent },
          pressed: { ref: transparent }
        },
        disabled: { ref: colors.disabledStroke }
      }
    };
  };

  const createOnVividTrackIntent = (intent: SwitchIntent) => ({
    boxColor: {
      rest: intent === 'accent' ? onVividAccentColors.trackRest : onVividColors.trackRest,
      hover: {
        ref: intent === 'accent' ? onVividAccentColors.trackHover : onVividColors.trackHover
      },
      pressed: {
        ref: intent === 'accent' ? onVividAccentColors.trackPressed : onVividColors.trackPressed
      },
      // Selected must override the unchecked interaction overlays for every intent.
      selected: {
        rest: { ref: intent === 'accent' ? onVividAccentColors.selectedRest : white },
        hover: { ref: intent === 'accent' ? onVividAccentColors.selectedHover : white },
        pressed: { ref: intent === 'accent' ? onVividAccentColors.selectedPressed : white }
      },
      disabled: { ref: onVividColors.trackDisabled }
    },
    borderColor: {
      rest: onVividColors.borderRest,
      hover: { ref: onVividColors.borderHover },
      pressed: { ref: onVividColors.borderHover },
      selected: {
        rest: { ref: transparent },
        hover: { ref: transparent },
        pressed: { ref: transparent }
      },
      disabled: { ref: onVividColors.borderDisabled }
    }
  });

  const createOnSubtleThumbIntent = (theme: ThemeName, intent: SwitchIntent) => {
    const colors = createOnSubtleColors(theme);
    const rest = intent === 'polarity' ? colors.polarityOff : colors.neutralStrokeRest;

    return {
      boxColor: {
        rest,
        ...(intent === 'polarity'
          ? {}
          : {
              hover: { ref: colors.neutralStrokeHover },
              pressed: { ref: colors.neutralStrokePressed }
            }),
        selected: {
          rest: { ref: white },
          // Only the non-polarity intents have unchecked thumb deltas to reset.
          ...(intent === 'polarity' ? {} : { hover: { ref: white }, pressed: { ref: white } })
        },
        disabled: { ref: colors.disabledThumb }
      },
      borderColor: {
        rest: transparent
      }
    };
  };

  const createOnVividThumbIntent = (intent: SwitchIntent) => {
    const selectedRest = intent === 'polarity' ? onVividColors.polarityOn : onVividColors.brandRest;

    return {
      boxColor: {
        rest: white,
        selected:
          intent === 'accent'
            ? { rest: { ref: onVividAccentColors.selectedThumb } }
            : intent === 'polarity'
              ? { rest: { ref: selectedRest } }
              : {
                  rest: { ref: selectedRest },
                  hover: { ref: onVividColors.brandHover },
                  pressed: { ref: onVividColors.brandPressed }
                },
        disabled: { ref: onVividColors.thumbDisabled }
      },
      borderColor: {
        rest: transparent
      }
    };
  };

  const createTrackContext = (theme: ThemeName) => {
    const onSubtleByIntent = Object.fromEntries(
      SWITCH_INTENTS.map((intent) => [intent, createOnSubtleTrackIntent(theme, intent)])
    );
    const onVividByIntent = Object.fromEntries(
      SWITCH_INTENTS.map((intent) => [intent, createOnVividTrackIntent(intent)])
    );

    return {
      onSubtle: {
        boxColor: Object.fromEntries(
          SWITCH_INTENTS.map((intent) => [intent, { medium: onSubtleByIntent[intent].boxColor }])
        ),
        borderColor: Object.fromEntries(
          SWITCH_INTENTS.map((intent) => [intent, { medium: onSubtleByIntent[intent].borderColor }])
        )
      },
      onVivid: {
        boxColor: Object.fromEntries(
          SWITCH_INTENTS.map((intent) => [intent, { medium: onVividByIntent[intent].boxColor }])
        ),
        borderColor: Object.fromEntries(
          SWITCH_INTENTS.map((intent) => [intent, { medium: onVividByIntent[intent].borderColor }])
        )
      }
    };
  };

  const createThumbContext = (theme: ThemeName) => ({
    onSubtle: {
      boxColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [
          intent,
          { medium: createOnSubtleThumbIntent(theme, intent).boxColor }
        ])
      ),
      borderColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [
          intent,
          { medium: createOnSubtleThumbIntent(theme, intent).borderColor }
        ])
      )
    },
    onVivid: {
      boxColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [
          intent,
          { medium: createOnVividThumbIntent(intent).boxColor }
        ])
      ),
      borderColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [
          intent,
          { medium: createOnVividThumbIntent(intent).borderColor }
        ])
      )
    }
  });

  const createTextIntent = (theme: ThemeName, surfaceContext: SurfaceContext) => {
    const disabledEmphasis = surfaceContext === 'onVivid' ? 'medium' : 'lowest';

    return {
      medium: {
        rest: foregroundReference('neutral', 'standard', theme, surfaceContext, 'medium'),
        disabled: parentStateForegroundReference(
          'neutral',
          'deep',
          theme,
          surfaceContext,
          disabledEmphasis,
          'disabled'
        )
      }
    };
  };

  const createTextContext = (theme: ThemeName) => ({
    onSubtle: {
      textColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [intent, createTextIntent(theme, 'onSubtle')])
      )
    },
    onVivid: {
      textColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [intent, createTextIntent(theme, 'onVivid')])
      )
    }
  });

  const createIconIntent = (
    theme: ThemeName,
    surfaceContext: SurfaceContext,
    intent: SwitchIntent
  ) => {
    const chromaticFamily: SwitchForegroundFamily = intent === 'polarity' ? 'red' : 'blue';
    const selectedFamily: SwitchForegroundFamily = intent === 'polarity' ? 'green' : 'blue';
    const whiteReference = foregroundReference('neutral', 'standard', 'light', 'onVivid', 'medium');
    const blackReference = foregroundReference('neutral', 'deep', 'light', 'onSubtle', 'medium');
    const createChromaticParentState = (family: SwitchForegroundFamily, state: ForegroundState) =>
      parentStateForegroundReference(family, 'standard', 'light', 'onSubtle', 'medium', state);
    const createSelectedForeground = () => ({
      rest: createChromaticParentState(selectedFamily, 'rest'),
      ...(intent === 'polarity'
        ? {}
        : {
            hover: createChromaticParentState(selectedFamily, 'hover'),
            pressed: createChromaticParentState(selectedFamily, 'pressed')
          })
    });

    if (surfaceContext === 'onVivid') {
      const selectedForeground = parentStateForegroundReference(
        'neutral',
        'standard',
        'light',
        'onVivid',
        'medium',
        'rest'
      );
      const createRestForeground = (state: ForegroundState = 'rest') =>
        state === 'rest'
          ? foregroundReference(chromaticFamily, 'standard', 'light', 'onSubtle', 'medium')
          : createChromaticParentState(chromaticFamily, state);

      return {
        medium: {
          rest: createRestForeground(),
          ...(intent === 'polarity'
            ? {}
            : {
                hover: createRestForeground('hover'),
                pressed: createRestForeground('pressed')
              }),
          selected: {
            rest: selectedForeground,
            // The icon remains white over the selected chromatic or black thumb.
            ...(intent === 'polarity'
              ? {}
              : { hover: selectedForeground, pressed: selectedForeground })
          },
          disabled: parentStateForegroundReference(
            'neutral',
            'deep',
            'light',
            'onSubtle',
            'low',
            'rest'
          )
        }
      };
    }

    return {
      medium: {
        rest: theme === 'light' ? whiteReference : blackReference,
        selected: createSelectedForeground(),
        disabled: parentStateForegroundReference(
          'neutral',
          theme === 'light' ? 'deep' : 'standard',
          theme,
          'onSubtle',
          'low',
          'rest'
        )
      }
    };
  };

  const createIconContext = (theme: ThemeName) => ({
    onSubtle: {
      textColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [intent, createIconIntent(theme, 'onSubtle', intent)])
      )
    },
    onVivid: {
      textColor: Object.fromEntries(
        SWITCH_INTENTS.map((intent) => [intent, createIconIntent(theme, 'onVivid', intent)])
      )
    }
  });

  const themes = <T>(factory: (theme: ThemeName) => T) => ({
    light: factory('light'),
    dark: factory('dark'),
    darker: factory('darker')
  });

  return {
    effects: {
      activationFeedback: {
        profile: 'halo',
        origin: 'center',
        visual: {
          layer: 'underlay',
          paint: 'outline',
          tone: {
            default: 'subtle',
            bySurfaceContext: {
              onSubtle: 'subtle',
              onVivid: 'vivid'
            }
          }
        },
        profiles: {
          halo: {
            size: 8
          }
        }
      }
    },
    options: {
      variant: 'standard',
      radius: 'pill',
      activationMotion: 'slow',
      controlTextVisibility: 'largeOnly'
    },
    variants: {
      standard: {
        options: {
          mode: 'base'
        },
        modes: {
          base: {
            elements: {
              e1: {
                name: 'switch'
              },
              e2: {
                name: 'track',
                decorations: {
                  borderStyle: 'solid'
                },
                scales: {
                  boxWidth: { 's:md:1': 40 },
                  boxHeight: { 's:md:1': 20 },
                  borderWidth: 1,
                  borderRadius: {
                    rounded: 4,
                    pill: 10,
                    square: 0
                  },
                  paddingTop: { 's:md:1': 1 },
                  paddingRight: { 's:md:1': 3 },
                  paddingBottom: { 's:md:1': 1 },
                  paddingLeft: { 's:md:1': 3 }
                },
                palettes: {
                  default: themes(createTrackContext)
                }
              },
              e3: {
                name: 'thumb',
                scales: {
                  boxWidth: { 's:md:1': 14 },
                  boxHeight: { 's:md:1': 14 },
                  borderRadius: {
                    rounded: 4,
                    pill: 7,
                    square: 0
                  }
                },
                palettes: {
                  default: themes(createThumbContext)
                }
              },
              e4: {
                name: 'label',
                typography: { 's:md:1': 'body-medium' },
                scales: {
                  marginLeft: { 's:md:1': 8 },
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: themes(createTextContext)
                }
              },
              e5: {
                name: 'control text',
                typography: { 's:md:1': 'body-medium' },
                scales: {
                  marginLeft: { 's:md:1': 8 },
                  marginRight: { 's:md:1': 8 }
                },
                palettes: {
                  default: themes(createTextContext)
                }
              },
              e6: {
                name: 'icon',
                iconSize: { 's:md:1': 's:sm:3' },
                palettes: {
                  default: themes(createIconContext)
                }
              }
            }
          }
        }
      }
    }
  };
}
