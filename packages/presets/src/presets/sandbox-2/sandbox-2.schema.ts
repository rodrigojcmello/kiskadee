import { breakpoints, type Schema, withAlpha } from '@kiskadee/core';
import { createFluent2MicrosoftCardSchema } from '../fluent-2-microsoft/components/card.schema.ts';
import { createSandbox2SliderSchema } from './components/slider.schema.ts';
import { createSandbox2SwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './sandbox-2.colors.ts';

export type Sandbox2Segment = 'default';

const segmentNames = ['default'] as const;
const transparent = '#00000000' as const;
const shadowBlack = (alpha: number) => withAlpha('#000000', alpha * 100);

export const schema: Schema<Sandbox2Segment> = {
  name: 'Sandbox',
  prefix: 'sbx',
  version: [2, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  colors: schemaColors,
  global: {
    fonts: {
      body: ['Inter', 'sans-serif']
    },
    focus: {
      width: 2,
      offset: 2
    },
    radius: 'pill',
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
          ripple: {
            animateSize: true,
            size: 'auto',
            durationToken: 'interaction.fast',
            curveToken: 'motion.standard.out',
            fade: {
              delayToken: 'interaction.hold.short',
              durationToken: 'interaction.fade.short',
              curveToken: 'motion.standard.out'
            }
          },
          halo: {
            animateSize: false,
            size: 72,
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
            's:sm:1': { x: 0, y: 1, blur: 3, spread: 1, color: shadowBlack(0.15) },
            's:md:1': { x: 0, y: 2, blur: 6, spread: 2, color: shadowBlack(0.15) },
            's:lg:1': { x: 0, y: 1, blur: 3, spread: 0, color: shadowBlack(0.3) },
            's:lg:2': { x: 0, y: 2, blur: 3, spread: 0, color: shadowBlack(0.3) },
            's:lg:3': { x: 0, y: 4, blur: 4, spread: 0, color: shadowBlack(0.3) },
            's:lg:4': { x: 0, y: 8, blur: 16, spread: 0, color: shadowBlack(0.3) }
          }
        },
        inner: {
          levels: {
            's:sm:1': { x: 0, y: 1, blur: 2, spread: 0, color: shadowBlack(0.22) }
          }
        }
      }
    }
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          background: '#f6f7f9',
          focusColor: '#2856e2',
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: '#0c0d13',
                  opacity: 0.12
                },
                vivid: {
                  color: '#ffffff',
                  opacity: 0.24
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    card: createFluent2MicrosoftCardSchema({
      segmentNames,
      transparent
    }),
    slider: createSandbox2SliderSchema(),
    switch: createSandbox2SwitchSchema()
  }
};
