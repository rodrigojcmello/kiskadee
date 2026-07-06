import { breakpoints, type Schema } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createIos26AppleButtonSchema } from './components/button.schema.ts';
import { createIos26AppleCardSchema } from './components/card.schema.ts';
import { createIos26AppleSliderSchema } from './components/slider.schema.ts';
import { createIos26AppleSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './ios-26-apple.colors.ts';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

const segmentNames = ['default'] as const;
export type Segment = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;
const c = createPresetColorGetter<Segment>(schemaContext);
const transparent = [0, 0, 0, 0] as const;
const shadowBlack = (alpha: number) => [0, 0, 0, alpha] as const;
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
  version: [26, 0, 0],
  author: 'Apple',
  breakpoints,
  colors: schemaColors,
  global: {
    fonts: {
      body: ['Roboto', 'sans-serif']
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
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: '#000000',
                  opacity: 0.1
                },
                vivid: {
                  color: '#FFFFFF',
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
    button: createIos26AppleButtonSchema({
      c
    }),
    card: createIos26AppleCardSchema({
      c,
      segmentNames,
      transparent
    }),
    slider: createIos26AppleSliderSchema({
      c,
      segmentNames,
      transparent
    }),
    switch: createIos26AppleSwitchSchema({
      c,
      segmentNames,
      transparent
    })
  }
};
