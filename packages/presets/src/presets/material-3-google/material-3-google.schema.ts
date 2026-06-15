import { breakpoints, type Schema } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createMaterial3GoogleButtonSchema } from './components/button.schema.ts';
import { createMaterial3GoogleCardSchema } from './components/card.schema.ts';
import { createMaterial3GoogleSwitchSchema } from './components/switch.schema.ts';
import { createMaterial3GoogleTabsSchema } from './components/tabs.schema.ts';
import { createMaterial3GoogleTextFieldSchema } from './components/text-field.schema.ts';
import { schemaColors } from './material-3-google.colors.ts';

/**
 * Segments definition for the Material Design 3 design system.
 * Each segment represents a brand/product identity with support for multiple theme modes.
 *
 * NOTE:
 * - This preset registers `default` and `dynamic` segments.
 * - Palette files are emitted as `<segment>.<theme>.kiskadee.(css|json)`.
 */

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;

const segmentNames = ['default', 'dynamic'] as const;
type SegmentName = (typeof segmentNames)[number];

const c = createPresetColorGetter<SegmentName>(schemaContext);
const transparent = [0, 0, 0, 0] as const;
const white = [0, 0, 100, 1] as const;

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = never;

export const schema: Schema<Segments> = {
  name: 'Material Design',
  prefix: 'gmd', // Google Material Design
  version: [3, 0, 0],
  author: 'Google',
  breakpoints,
  colors: schemaColors,
  global: {
    fonts: {
      body: ['Roboto', 'sans-serif']
    },
    // verified: 2026-02-07 | Figma v1.23
    focus: {
      width: 2, // !
      offset: 2 // =
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
            durationToken: 'interaction.slow',
            curveToken: 'motion.emphasized.out',
            fade: {
              delayToken: 'interaction.hold.short',
              durationToken: 'interaction.fade.short',
              curveToken: 'motion.standard.out'
            }
          },
          rippleOverflow: {
            animateSize: true,
            size: 80,
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
            size: 80,
            durationToken: 'interaction.instant',
            fade: {
              delayToken: 'interaction.hold.short',
              durationToken: 'interaction.fade.long',
              curveToken: 'motion.standard.out'
            }
          },
          pressed: {
            animateSize: false,
            size: 'auto',
            // Slightly longer hold to keep mouse/trackpad tap feedback visible.
            durationToken: 'interaction.hold.short',
            curveToken: 'motion.standard.out',
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
          // background: c('default', 'l', 'primitive.black.v1', 4),
          // verified: 2026-02-02 | Figma v1.23
          focusColor: c('default', 'l', 'primary.v2', 60), // =
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: '#1D1B20',
                  opacity: 0.1
                },
                vivid: {
                  color: white,
                  opacity: 0.2
                }
              }
            }
          }
        }
        // dark: {
        //   background: c('default', 'd', 'primitive.black.v1', 85),
        //   focusColor: c('default', 'l', 'primitive.cyan.v1', 60)
        // }
      }
      // dynamic: {
      //   light: {
      //     background: c('dynamic', 'l', 'primitive.black.v1', 4),
      //     focusColor: c('dynamic', 'l', 'primitive.blue.v1', 50)
      //   },
      //   dark: {
      //     background: c('dynamic', 'd', 'primitive.black.v1', 4),
      //     focusColor: c('dynamic', 'd', 'primitive.blue.v1', 50)
      //   }
      // }
    }
  },
  components: {
    button: createMaterial3GoogleButtonSchema({
      c,
      segmentNames,
      transparent
    }),
    card: createMaterial3GoogleCardSchema({
      c,
      segmentNames,
      transparent
    }),
    switch: createMaterial3GoogleSwitchSchema({
      c,
      segmentNames,
      transparent
    }),
    tabs: createMaterial3GoogleTabsSchema({
      c,
      transparent,
      white
    }),
    textField: createMaterial3GoogleTextFieldSchema({
      c,
      segmentNames,
      transparent
    })
  }
};
