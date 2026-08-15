import { breakpoints, type Schema } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createIos27AppleButtonSchema } from './components/button.schema.ts';
import { createIos27AppleCardSchema } from './components/card.schema.ts';
import { createIos27AppleDropdownSchema } from './components/dropdown.schema.ts';
import { createIos27AppleSliderSchema } from './components/slider.schema.ts';
import { createIos27AppleSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './ios-27-apple.colors.ts';
import { ios27AppleTypography } from './ios-27-apple.typography.ts';

const segmentNames = ['default'] as const;
export type Segment = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;
const c = createPresetColorGetter<Segment>(schemaContext);
const transparent = c('default', 'l', 'neutral', 100, 0);
const shadowBlack = (alpha: number) => c('default', 'l', 'neutral', 100, alpha * 100);
const sliderThumbShadow = [
  { x: 0, y: 6, blur: 13, spread: 0, color: shadowBlack(0.12) },
  { x: 0, y: 0.5, blur: 4, spread: 0, color: shadowBlack(0.12) }
] as const;
const sliderTooltipShadow = [
  { x: 0, y: 2, blur: 6, spread: 0, color: shadowBlack(0.08) },
  { x: 0, y: 0.5, blur: 2, spread: 0, color: shadowBlack(0.06) }
] as const;

export const schema: Schema<Segment> = {
  name: 'iOS',
  prefix: 'aos', // Apple OS
  version: [27, 0, 0],
  author: 'Apple',
  breakpoints,
  colors: schemaColors,
  global: {
    typography: ios27AppleTypography,
    iconSizes: {
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24
    },
    icons: {
      family: 'sf-symbols',
      variant: 'regular'
    },
    fonts: {
      families: {
        'apple-system': {
          // Native consumers resolve San Francisco directly; web consumers use the platform stack.
          stack: ['-apple-system', 'sans-serif']
        }
      },
      roles: {
        body: 'apple-system'
      }
    },
    focus: {
      width: 2,
      offset: 0
    },
    effects: {
      activationFeedback: {
        profile: 'ripple',
        origin: 'pointer',
        visual: {
          layer: 'overlay',
          paint: 'field',
          tone: {
            default: 'subtle'
          }
        },
        profiles: {
          halo: {
            animateSize: false,
            size: 80,
            durationToken: 'interaction.instant',
            fade: {
              delayToken: 'interaction.hold.short',
              durationToken: 'interaction.fade.long',
              curveToken: 'motion.standard.out'
            }
          }
        }
      },
      shadow: {
        outer: {
          levels: {
            's:sm:1': { x: 0, y: 0, blur: 16, spread: 0, color: shadowBlack(0.2) },
            's:sm:2': sliderThumbShadow,
            's:sm:3': sliderTooltipShadow,
            's:md:1': { x: 0, y: 5, blur: 20, spread: 0, color: shadowBlack(0.3) },
            's:lg:1': { x: 0, y: 10, blur: 50, spread: 0, color: shadowBlack(0.3) },
            's:lg:2': { x: 0, y: 16, blur: 48, spread: 0, color: shadowBlack(0.35) },
            's:lg:3': { x: 0, y: 20, blur: 76, spread: 0, color: shadowBlack(0.2) }
          }
        }
      }
    },
    radius: 'rounded'
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          focusColor: c.ref('default', 'l', 'primary', 'vivid'),
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: c('default', 'l', 'neutral', 100),
                  opacity: 0.1
                },
                vivid: {
                  color: c('default', 'l', 'neutral', 0),
                  opacity: 0.2
                }
              }
            }
          }
        },
        dark: {
          focusColor: c.ref('default', 'd', 'primary', 'vivid'),
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: c('default', 'd', 'neutral', 100),
                  opacity: 0.1
                },
                vivid: {
                  color: c('default', 'd', 'neutral', 0),
                  opacity: 0.2
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    button: createIos27AppleButtonSchema({
      c
    }),
    card: createIos27AppleCardSchema({
      c,
      segmentNames,
      transparent
    }),
    dropdown: createIos27AppleDropdownSchema({ c }),
    slider: createIos27AppleSliderSchema({
      c,
      segmentNames,
      transparent
    }),
    switch: createIos27AppleSwitchSchema({
      c,
      segmentNames,
      transparent
    })
  }
};
