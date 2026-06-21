import { breakpoints, type Schema } from '@kiskadee/core';
import { createSandboxSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './sandbox.colors.ts';

export type SandboxSegment = 'default';

const shadowBlack = (alpha: number) => [0, 0, 0, alpha] as const;

export const schema: Schema<SandboxSegment> = {
  name: 'Sandbox',
  prefix: 'sbx',
  version: [0, 1, 0],
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
        levels: {
          's:sm:1': [
            { x: 0, y: 1, blur: 3, spread: 1, color: shadowBlack(0.15) },
            { x: 0, y: 1, blur: 2, spread: 0, color: shadowBlack(0.3) }
          ],
          's:md:1': [
            { x: 0, y: 2, blur: 6, spread: 2, color: shadowBlack(0.15) },
            { x: 0, y: 1, blur: 2, spread: 0, color: shadowBlack(0.3) }
          ],
          's:lg:1': [
            { x: 0, y: 1, blur: 3, spread: 0, color: shadowBlack(0.3) },
            { x: 0, y: 4, blur: 8, spread: 3, color: shadowBlack(0.15) }
          ],
          's:lg:2': [
            { x: 0, y: 2, blur: 3, spread: 0, color: shadowBlack(0.3) },
            { x: 0, y: 6, blur: 10, spread: 4, color: shadowBlack(0.15) }
          ],
          's:lg:3': [
            { x: 0, y: 4, blur: 4, spread: 0, color: shadowBlack(0.3) },
            { x: 0, y: 8, blur: 12, spread: 6, color: shadowBlack(0.15) }
          ]
        }
      }
    }
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          background: [220, 20, 97, 1],
          focusColor: [225, 76, 52, 1],
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: [231, 24, 6, 1],
                  opacity: 0.12
                },
                vivid: {
                  color: [0, 0, 100, 1],
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
    switch: createSandboxSwitchSchema()
  }
};
