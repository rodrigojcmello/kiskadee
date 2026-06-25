import { breakpoints, type Schema } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createElegantButtonSchema } from './components/button.schema.ts';
import { createElegantCardSchema } from './components/card.schema.ts';
import { createElegantSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './elegant.colors.ts';

// Elegant starts from Apple-inspired references and can evolve as an opinionated Kiskadee preset.

const segmentNames = ['default'] as const;
export type Segment = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;
const c = createPresetColorGetter<Segment>(schemaContext);
const transparent = [0, 0, 0, 0] as const;
const shadowBlack = (alpha: number) => [0, 0, 0, alpha] as const;

export const schema: Schema<Segment> = {
  name: 'Elegant',
  prefix: 'elg',
  version: [1, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  colors: schemaColors,
  global: {
    fonts: {
      body: ['system-ui', 'sans-serif']
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
            's:sm:1': { x: 0, y: 1, blur: 3, spread: 0, color: shadowBlack(0.18) },
            's:md:1': { x: 0, y: 3, blur: 8, spread: 0, color: shadowBlack(0.2) },
            's:lg:1': { x: 0, y: 8, blur: 20, spread: 0, color: shadowBlack(0.18) },
            's:lg:2': { x: 0, y: 14, blur: 36, spread: 0, color: shadowBlack(0.16) },
            's:lg:3': { x: 0, y: 22, blur: 64, spread: 0, color: shadowBlack(0.14) }
          }
        },
        inner: {
          levels: {
            's:sm:1': { x: 1, y: 1, blur: 2, spread: 0, color: shadowBlack(0.22) },
            's:md:1': { x: 0, y: 1, blur: 4, spread: 0, color: shadowBlack(0.2) },
            's:lg:1': { x: 0, y: 2, blur: 6, spread: 0, color: shadowBlack(0.18) },
            's:lg:2': { x: 0, y: 3, blur: 8, spread: 0, color: shadowBlack(0.16) },
            's:lg:3': { x: 0, y: 4, blur: 12, spread: 0, color: shadowBlack(0.14) }
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
          background: [0, 0, 100, 1],
          focusColor: '#007AFF',
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
    button: createElegantButtonSchema({
      c
    }),
    card: createElegantCardSchema({
      c,
      segmentNames,
      transparent
    }),
    switch: createElegantSwitchSchema()
  }
};
