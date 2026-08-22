import { breakpoints, type Schema, withAlpha } from '@kiskadee/core';
import { createIos18AppleSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './ios-18-apple.colors.ts';
import { ios18AppleTypography } from './ios-18-apple.typography.ts';

export type Segment = 'default';

const shadowBlack = (alpha: number) => withAlpha('#000000', alpha * 100);

export const schema: Schema<Segment> = {
  name: 'iOS',
  prefix: 'a18',
  version: [18, 0, 0],
  author: 'Apple',
  breakpoints,
  colors: schemaColors,
  global: {
    typography: ios18AppleTypography,
    iconSizes: {
      's:md:1': 16
    },
    icons: {
      family: 'sf-symbols',
      variant: 'regular'
    },
    fonts: {
      families: {
        'system-ui': {
          stack: ['system-ui', 'sans-serif']
        }
      },
      roles: {
        body: 'system-ui'
      }
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
          background: '#ffffff',
          focusColor: '#007aff',
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
    switch: createIos18AppleSwitchSchema()
  }
};
