import { breakpoints, type Schema } from '@kiskadee/core';
import { createIos18AppleSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './ios-18-apple.colors.ts';

export type Segment = 'default';

const shadowBlack = (alpha: number) => [0, 0, 0, alpha] as const;

export const schema: Schema<Segment> = {
  name: 'iOS',
  prefix: 'a18',
  version: [18, 0, 0],
  author: 'Apple',
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
      shadow: {
        outer: {
          levels: {
            's:sm:1': { x: 0, y: 3, blur: 8, spread: 0, color: shadowBlack(0.15) }
          }
        }
      }
    },
    radius: 'pill'
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
    switch: createIos18AppleSwitchSchema()
  }
};
