import { breakpoints, type Schema } from '@kiskadee/core';
import { createSandboxSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './sandbox.colors.ts';

export type SandboxSegment = 'default';

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
    radius: 'rounded',
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
