import { breakpoints, type Schema, withAlpha } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createIos27AppleButtonSchema } from './components/button.schema.ts';
import { createIos27AppleCardSchema } from './components/card.schema.ts';
import { createIos27AppleSliderSchema } from './components/slider.schema.ts';
import { createIos27AppleSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './ios-27-apple.colors.ts';

// The preset identity is iOS 27. Its provisional colors remain isolated until the documented
// iOS 27 system-color seeds are promoted through the Kiskadee tonal-scale workflow.

const segmentNames = ['default'] as const;
export type Segment = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;
const c = createPresetColorGetter<Segment>(schemaContext);
const transparent = '#00000000' as const;
const shadowBlack = (alpha: number) => withAlpha('#000000', alpha * 100);
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
                  color: '#ffffff',
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
