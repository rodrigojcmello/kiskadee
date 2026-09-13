import type { Color, Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SwitchComponent = NonNullable<Schema<never>['components']['switch']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';
type ThemeName = 'light' | 'dark';
type ThemeShortcut = 'l' | 'd';
type SurfaceContext = 'onSubtle' | 'onVivid';
type SwitchIntent = 'neutral' | 'polarity';

type CreateMaterial3GoogleSwitchSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
};

type StateColors = {
  rest: Color;
  hover?: Color;
  focus?: Color;
  pressed?: Color;
  disabled?: Color;
  selected?: {
    rest: Color;
    hover?: Color;
    focus?: Color;
    pressed?: Color;
  };
};

function ref(color: Color): { ref: Color } {
  return { ref: color };
}

function states(colors: StateColors) {
  return {
    rest: colors.rest,
    ...(colors.hover === undefined ? {} : { hover: ref(colors.hover) }),
    ...(colors.focus === undefined ? {} : { focus: ref(colors.focus) }),
    ...(colors.pressed === undefined ? {} : { pressed: ref(colors.pressed) }),
    ...(colors.disabled === undefined ? {} : { disabled: ref(colors.disabled) }),
    ...(colors.selected === undefined
      ? {}
      : {
          selected: {
            rest: ref(colors.selected.rest),
            ...(colors.selected.hover === undefined ? {} : { hover: ref(colors.selected.hover) }),
            ...(colors.selected.focus === undefined ? {} : { focus: ref(colors.selected.focus) }),
            ...(colors.selected.pressed === undefined
              ? {}
              : { pressed: ref(colors.selected.pressed) })
          }
        })
  };
}

function intentMap<T>(factory: (intent: SwitchIntent) => T) {
  return {
    neutral: factory('neutral'),
    polarity: factory('polarity')
  };
}

function themeMap<T>(factory: (theme: ThemeName) => T) {
  return {
    light: factory('light'),
    dark: factory('dark')
  };
}

function surfaceMap<T>(factory: (surface: SurfaceContext) => T) {
  return {
    onSubtle: factory('onSubtle'),
    onVivid: factory('onVivid')
  };
}

function createSwitchPalettes({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleSwitchSchemaArgs) {
  const createColors = (
    segment: Material3GoogleSegmentName,
    theme: ThemeName,
    surface: SurfaceContext,
    intent: SwitchIntent
  ) => {
    const track: ThemeShortcut = theme === 'light' ? 'l' : 'd';
    const onVivid = surface === 'onVivid';
    const familyRole = intent === 'polarity' ? 'redLike' : 'neutral';
    const selectedRole = intent === 'polarity' ? 'greenLike' : 'switch.neutral';

    const physical = (polarity: 'light' | 'dark', alpha?: number) =>
      c(segment, 'l', 'primitive.black.v1', polarity === 'light' ? 0 : 100, alpha);
    const family = (
      role: 'neutral' | 'redLike' | 'greenLike' | 'switch.neutral',
      reference: 'subtle' | 'medium' | 'vivid',
      offset = 0,
      alpha?: number
    ) => c.ref(segment, track, role, reference, offset, alpha);

    const selected = family(selectedRole, 'vivid');
    const selectedHover = family(selectedRole, 'vivid', theme === 'light' ? 1 : -1);
    const selectedPressed = family(selectedRole, 'vivid', theme === 'light' ? 2 : -2);
    // On a vivid surface the source treatment keeps a white selected track and
    // puts the chromatic color on the thumb. On a subtle surface this order is
    // reversed, matching Material's selected track and white handle.
    const selectedTrack = onVivid ? physical('light') : selected;
    const selectedThumb = onVivid ? selected : physical('light');
    const selectedThumbInteractive =
      theme === 'dark' ? c(segment, 'd', selectedRole, 90) : family(selectedRole, 'subtle');

    const subtleOffTrack = family(familyRole, 'subtle');
    const subtleOffBorder = family(familyRole, 'medium');
    const subtleOffThumb =
      theme === 'dark' ? c(segment, 'd', familyRole, 90) : family(familyRole, 'medium');
    const subtleOffThumbHover =
      theme === 'dark' ? c(segment, 'd', familyRole, 95) : family(familyRole, 'vivid');
    const subtleDisabledTrack = physical(theme === 'light' ? 'dark' : 'light', 10);
    const subtleDisabledBorder = physical('dark', 10);
    const subtleDisabledThumb = physical(theme === 'light' ? 'dark' : 'light', 38);

    return {
      track: {
        boxColor: onVivid
          ? states({
              rest: physical('light', 14),
              hover: physical('light', 20),
              pressed: physical('light', 28),
              disabled: physical('light', 12),
              selected: {
                rest: selectedTrack,
                hover: selectedTrack,
                pressed: selectedTrack
              }
            })
          : states({
              rest: subtleOffTrack,
              disabled: subtleDisabledTrack,
              selected: { rest: selectedTrack }
            }),
        borderColor: onVivid
          ? states({
              rest: physical('light', 64),
              hover: physical('light', 80),
              pressed: physical('light', 88),
              disabled: physical('light', 20),
              selected: {
                rest: transparent,
                hover: transparent,
                pressed: transparent
              }
            })
          : states({
              rest: subtleOffBorder,
              disabled: subtleDisabledBorder,
              // The selected reset is intentional: it suppresses the unchecked stroke.
              selected: { rest: transparent }
            })
      },
      thumb: {
        boxColor: onVivid
          ? states({
              rest: physical('light'),
              disabled: physical('light', 38),
              selected: {
                rest: selectedThumb,
                hover: selectedHover,
                focus: selectedHover,
                pressed: selectedPressed
              }
            })
          : states({
              rest: subtleOffThumb,
              hover: subtleOffThumbHover,
              focus: subtleOffThumbHover,
              pressed: subtleOffThumbHover,
              disabled: subtleDisabledThumb,
              selected: {
                rest: selectedThumb,
                hover: selectedThumbInteractive,
                focus: selectedThumbInteractive,
                pressed: selectedThumbInteractive
              }
            }),
        borderColor: { rest: transparent }
      },
      label: {
        textColor: {
          rest: onVivid ? physical('light') : family('neutral', 'vivid'),
          disabled: onVivid ? ref(physical('light', 38)) : ref(family('neutral', 'vivid', 0, 38))
        }
      },
      icon: {
        textColor: onVivid
          ? states({
              rest: physical('light'),
              disabled: physical('light', 38),
              selected: {
                rest: physical('light'),
                hover: physical('light'),
                focus: physical('light'),
                pressed: physical('light')
              }
            })
          : states({
              rest: subtleOffThumb,
              hover: subtleOffThumbHover,
              focus: subtleOffThumbHover,
              pressed: subtleOffThumbHover,
              disabled: subtleDisabledThumb,
              selected: {
                rest: selected,
                hover: selectedHover,
                focus: selectedHover,
                pressed: selectedPressed
              }
            })
      }
    };
  };

  const palettes = buildBySegment(segmentNames, (segment) => {
    const byTheme = (theme: ThemeName) =>
      surfaceMap((surface) => {
        const byIntent = intentMap((intent) => createColors(segment, theme, surface, intent));
        return {
          track: {
            boxColor: Object.fromEntries(
              Object.entries(byIntent).map(([intent, colors]) => [
                intent,
                { medium: colors.track.boxColor }
              ])
            ),
            borderColor: Object.fromEntries(
              Object.entries(byIntent).map(([intent, colors]) => [
                intent,
                { medium: colors.track.borderColor }
              ])
            )
          },
          thumb: {
            boxColor: Object.fromEntries(
              Object.entries(byIntent).map(([intent, colors]) => [
                intent,
                { medium: colors.thumb.boxColor }
              ])
            ),
            borderColor: Object.fromEntries(
              Object.entries(byIntent).map(([intent, colors]) => [
                intent,
                { medium: colors.thumb.borderColor }
              ])
            )
          },
          label: {
            textColor: Object.fromEntries(
              Object.entries(byIntent).map(([intent, colors]) => [
                intent,
                { medium: colors.label.textColor }
              ])
            )
          },
          icon: {
            textColor: Object.fromEntries(
              Object.entries(byIntent).map(([intent, colors]) => [
                intent,
                { medium: colors.icon.textColor }
              ])
            )
          }
        };
      });

    return {
      light: byTheme('light'),
      dark: byTheme('dark')
    };
  });

  const elementPalettes = (element: 'track' | 'thumb' | 'label' | 'icon') =>
    Object.fromEntries(
      Object.entries(palettes).map(([segment, themes]) => [
        segment,
        themeMap((theme) => ({
          onSubtle: themes[theme].onSubtle[element],
          onVivid: themes[theme].onVivid[element]
        }))
      ])
    );

  return {
    track: elementPalettes('track'),
    thumb: elementPalettes('thumb'),
    label: elementPalettes('label'),
    icon: elementPalettes('icon')
  };
}

export function createMaterial3GoogleSwitchSchema(
  args: CreateMaterial3GoogleSwitchSchemaArgs
): SwitchComponent {
  const palettesByElement = createSwitchPalettes(args);

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
            byEmphasis: {
              low: 'vivid'
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
      density: { regular: 's:md:1' },
      variant: 'standard',
      radius: 'pill',
      activationMotion: 'standard',
      controlTextVisibility: 'always'
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
                  boxWidth: {
                    's:md:1': 52
                  },
                  boxHeight: {
                    's:md:1': 32
                  },
                  borderWidth: 2,
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:md:1': 16
                    },
                    square: 0
                  },
                  paddingTop: {
                    's:md:1': 4
                  },
                  paddingRight: {
                    's:md:1': 4
                  },
                  paddingBottom: {
                    's:md:1': 4
                  },
                  paddingLeft: {
                    's:md:1': 4
                  }
                },
                palettes: palettesByElement.track
              },
              e3: {
                name: 'thumb',
                scales: {
                  boxWidth: {
                    's:md:1': 24
                  },
                  boxHeight: {
                    's:md:1': 24
                  },
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:md:1': 12
                    },
                    square: 0
                  }
                },
                effects: {
                  thumbShrink: {
                    rest: {
                      boxWidth: {
                        's:md:1': 16
                      },
                      boxHeight: {
                        's:md:1': 16
                      }
                    }
                  }
                },
                palettes: palettesByElement.thumb
              },
              e4: {
                name: 'label',
                typography: { 's:md:1': 'body-medium' },
                scales: {
                  marginLeft: {
                    's:md:1': 12
                  },
                  marginRight: {
                    's:md:1': 12
                  }
                },
                palettes: palettesByElement.label
              },
              e6: {
                name: 'icon',
                iconSize: { 's:md:1': 's:sm:1' },
                palettes: palettesByElement.icon
              }
            }
          }
        }
      }
    }
  } as SwitchComponent;
}
