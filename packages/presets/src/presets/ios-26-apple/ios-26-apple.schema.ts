import { breakpoints, type Schema } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createIos26AppleButtonSchema } from './components/button.schema.ts';
import { createIos26AppleSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './ios-26-apple.colors.ts';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

const segmentNames = ['default'] as const;
export type Segment = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;
const c = createPresetColorGetter<Segment>(schemaContext);
const transparent = [0, 0, 0, 0] as const;

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
        thickness: 8,
        holdDurationToken: 'interaction.hold.short',
        fadeDurationToken: 'interaction.fade.long',
        curveToken: 'motion.standard.out'
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
              color: '#000000',
              opacity: 0.12
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
    switch: createIos26AppleSwitchSchema({
      c,
      segmentNames,
      transparent
    })
  }
};
