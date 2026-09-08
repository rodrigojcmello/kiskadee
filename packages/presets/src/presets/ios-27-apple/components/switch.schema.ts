import { type Schema, type SolidColor, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Ios27AppleSegmentName = 'default';
type SwitchComponent = NonNullable<Schema<Ios27AppleSegmentName>['components']['switch']>;

type CreateIos27AppleSwitchSchemaArgs = {
  c: PresetColorGetter<Ios27AppleSegmentName>;
  segmentNames: readonly Ios27AppleSegmentName[];
  transparent: string;
};

type Theme = 'light' | 'dark' | 'darker';
type Intent = 'neutral' | 'primary' | 'polarity';

export function createIos27AppleSwitchSchema({
  c,
  segmentNames,
  transparent: _transparent
}: CreateIos27AppleSwitchSchemaArgs): SwitchComponent {
  const createContext = (
    segment: Ios27AppleSegmentName,
    theme: Theme,
    vivid: boolean,
    element: 'track' | 'thumb' | 'label' | 'icon'
  ) => {
    const scale = theme === 'light' ? 'l' : 'd';
    const white = c(segment, 'l', 'neutral', 0);
    const tertiary = c(segment, scale, 'neutral', theme === 'light' ? 70 : 95, 30);
    const label = vivid ? white : c(segment, scale, 'neutral', 100);
    const disabledLabel = vivid ? withAlpha(white, 30) : tertiary;
    const createIntent = (intent: Intent) => {
      const role = intent === 'primary' ? 'switch.primary' : 'greenLike';
      const selected = c.ref(segment, scale, role, 'vivid');
      const selectedOnWhite = c.ref(segment, 'l', role, 'vivid', 8);
      const off = intent === 'polarity' ? c.ref(segment, scale, 'redLike', 'vivid') : tertiary;
      const state = (rest: SolidColor, on: SolidColor, disabled: SolidColor) => ({
        rest,
        ...(rest === on ? {} : { selected: { rest: { ref: on } } }),
        disabled: { ref: disabled }
      });
      if (element === 'label')
        return {
          medium: { rest: label, disabled: { ref: disabledLabel } },
          low: { rest: label, disabled: { ref: disabledLabel } }
        };
      if (element === 'track')
        return vivid
          ? {
              medium: state(withAlpha(white, 32), white, withAlpha(white, 12)),
              low: state(withAlpha(white, 16), withAlpha(white, 72), withAlpha(white, 8))
            }
          : {
              medium: state(off, selected, withAlpha(tertiary, 15)),
              low: state(withAlpha(off, 15), withAlpha(selected, 20), withAlpha(tertiary, 10))
            };
      if (element === 'thumb')
        return vivid
          ? {
              medium: state(white, selectedOnWhite, withAlpha(white, 50)),
              low: state(white, selectedOnWhite, withAlpha(white, 50))
            }
          : {
              medium: state(white, white, withAlpha(white, 50)),
              low: state(white, selected, withAlpha(white, 50))
            };
      return vivid
        ? {
            medium: state(c(segment, 'l', 'neutral', 70), white, withAlpha(white, 30)),
            low: state(c(segment, 'l', 'neutral', 70), white, withAlpha(white, 30))
          }
        : {
            medium: state(
              c(segment, scale, 'neutral', theme === 'light' ? 70 : 55),
              selectedOnWhite,
              c(segment, 'l', 'neutral', 70, 30)
            ),
            low: state(c(segment, 'l', 'neutral', 70), white, c(segment, 'l', 'neutral', 70, 30))
          };
    };
    const colors = {
      neutral: createIntent('neutral'),
      primary: createIntent('primary'),
      polarity: createIntent('polarity')
    };
    return element === 'label' || element === 'icon' ? { textColor: colors } : { boxColor: colors };
  };
  const palettes = (element: 'track' | 'thumb' | 'label' | 'icon') =>
    buildBySegment(segmentNames, (segment) => ({
      light: {
        onSubtle: createContext(segment, 'light', false, element),
        onVivid: createContext(segment, 'light', true, element)
      },
      dark: {
        onSubtle: createContext(segment, 'dark', false, element),
        onVivid: createContext(segment, 'dark', true, element)
      },
      darker: {
        onSubtle: createContext(segment, 'darker', false, element),
        onVivid: createContext(segment, 'darker', true, element)
      }
    }));

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
            size: 6
          }
        }
      }
    },
    options: {
      variant: 'standard',
      radius: 'pill',
      activationMotion: 'standard',
      controlTextVisibility: 'none'
    },
    variants: {
      standard: {
        options: {
          mode: 'base'
        },
        modes: {
          base: {
            elements: {
              e2: {
                name: 'track',
                decorations: {
                  borderStyle: 'none'
                },
                scales: {
                  boxWidth: {
                    's:sm:3': 36,
                    's:sm:2': 44,
                    's:sm:1': 54,
                    's:md:1': 64,
                    's:lg:1': 80
                  },
                  boxHeight: {
                    's:sm:3': 16,
                    's:sm:2': 20,
                    's:sm:1': 24,
                    's:md:1': 28,
                    's:lg:1': 36
                  },
                  borderWidth: 0,
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:sm:3': 8,
                      's:sm:2': 10,
                      's:sm:1': 12,
                      's:md:1': 14,
                      's:lg:1': 18
                    },
                    square: 0
                  },
                  paddingTop: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  },
                  paddingRight: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  },
                  paddingBottom: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  },
                  paddingLeft: {
                    's:sm:3': 1.5,
                    's:sm:2': 2,
                    's:sm:1': 2,
                    's:md:1': 2,
                    's:lg:1': 3
                  }
                },
                palettes: palettes('track')
              },
              e3: {
                name: 'thumb',
                scales: {
                  boxWidth: {
                    's:sm:3': 21,
                    's:sm:2': 26,
                    's:sm:1': 32,
                    's:md:1': 38,
                    's:lg:1': 47
                  },
                  boxHeight: {
                    's:sm:3': 13,
                    's:sm:2': 16,
                    's:sm:1': 20,
                    's:md:1': 24,
                    's:lg:1': 30
                  },
                  borderRadius: {
                    rounded: 6,
                    pill: {
                      's:sm:3': 6.5,
                      's:sm:2': 8,
                      's:sm:1': 10,
                      's:md:1': 12,
                      's:lg:1': 15
                    },
                    square: 0
                  }
                },
                palettes: palettes('thumb')
              },
              e6: {
                name: 'icon',
                iconSize: {
                  's:sm:3': 's:sm:5',
                  's:sm:2': 's:sm:4',
                  's:sm:1': 's:sm:3',
                  's:md:1': 's:sm:1',
                  's:lg:1': 's:md:1'
                },
                palettes: palettes('icon')
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
                palettes: palettes('label')
              }
            }
          }
        }
      }
    }
  };
}
