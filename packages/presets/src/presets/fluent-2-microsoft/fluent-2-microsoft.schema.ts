import { breakpoints, color, primitive, type Schema } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { createFluent2MicrosoftBottomSheetSchema } from './components/bottom-sheet.schema.ts';
import { createFluent2MicrosoftButtonSchema } from './components/button.schema.ts';
import { createFluent2MicrosoftCardSchema } from './components/card.schema.ts';
import { createFluent2MicrosoftDropdownSchema } from './components/dropdown.schema.ts';
import { createFluent2MicrosoftIconSchema } from './components/icon.schema.ts';
import { createFluent2MicrosoftProgressSchema } from './components/progress.schema.ts';
import { createFluent2MicrosoftSeparatorSchema } from './components/separator.schema.ts';
import { createFluent2MicrosoftSliderSchema } from './components/slider.schema.ts';
import { createFluent2MicrosoftSwitchSchema } from './components/switch.schema.ts';
import { schemaColors } from './fluent-2-microsoft.colors.ts';
import { createFluent2MicrosoftSeparators } from './fluent-2-microsoft.separators.ts';
import { fluent2MicrosoftTypography } from './fluent-2-microsoft.typography.ts';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;
const c = createPresetColorGetter<'default'>(schemaContext);
const segmentNames = ['default'] as const;
const shadowBlack = (alpha: number) =>
  color(schemaContext, 'default', 'l', primitive('black', 'v1'), 100, alpha * 100);
const fluentShadow = (
  ambientBlur: number,
  ambientAlpha: number,
  y: number,
  blur: number,
  alpha: number
) =>
  [
    { x: 0, y: 0, blur: ambientBlur, spread: 0, color: shadowBlack(ambientAlpha) },
    { x: 0, y, blur, spread: 0, color: shadowBlack(alpha) }
  ] as const;

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = never;

export const schema: Schema<Segments> = {
  name: 'Fluent',
  prefix: 'fm', // Fluent by MicroSoft
  version: [2, 0, 0],
  author: 'Microsoft',
  breakpoints,
  colors: schemaColors,
  global: {
    typography: fluent2MicrosoftTypography,
    separators: createFluent2MicrosoftSeparators({ c }),
    iconSizes: {
      's:sm:4': 8,
      's:sm:3': 10,
      's:sm:2': 12,
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24,
      's:lg:2': 28,
      's:lg:3': 32,
      's:lg:4': 48
    },
    icons: {
      family: 'fluent-system',
      variant: 'regular'
    },
    fonts: {
      families: {
        'segoe-ui': {
          stack: [
            'Segoe UI',
            'Segoe UI Web (West European)',
            'Open Sans',
            '-apple-system',
            'BlinkMacSystemFont',
            'Roboto',
            'Helvetica Neue',
            'sans-serif'
          ]
        },
        'fluent-monospace': {
          stack: ['Consolas', 'Courier New', 'Courier', 'monospace']
        }
      },
      roles: {
        body: 'segoe-ui',
        code: 'fluent-monospace'
      }
    },
    focus: {
      width: 2,
      offset: 1
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
      presence: {
        profiles: {
          'fade-translate': {
            distancePx: 12,
            enterDurationMs: 240,
            exitDurationMs: 120,
            enterEasing: 'ease-out',
            exitEasing: 'ease-in'
          },
          'grow-height': {
            enterDurationMs: 180,
            exitDurationMs: 120,
            enterEasing: 'ease-out',
            exitEasing: 'ease-in'
          }
        }
      },
      shadow: {
        outer: {
          levels: {
            's:sm:1': fluentShadow(2, 0.12, 1, 2, 0.14),
            's:md:1': fluentShadow(2, 0.12, 2, 4, 0.14),
            's:lg:1': fluentShadow(2, 0.12, 4, 8, 0.14),
            's:lg:2': fluentShadow(2, 0.12, 8, 16, 0.14),
            's:lg:3': fluentShadow(8, 0.2, 14, 28, 0.24),
            's:lg:4': fluentShadow(8, 0.2, 32, 64, 0.24)
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
          focusColor: color(schemaContext, 'default', 'l', primitive('black', 'v1'), 100),
          effects: {
            activationFeedback: {
              tone: {
                subtle: {
                  color: c('default', 'l', 'neutral', 85),
                  opacity: 0.12
                },
                vivid: {
                  color: c('default', 'l', 'neutral', 0),
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
    bottomSheet: createFluent2MicrosoftBottomSheetSchema({ c }),
    slider: createFluent2MicrosoftSliderSchema(),
    button: createFluent2MicrosoftButtonSchema({ c, shadowBlack }),
    card: createFluent2MicrosoftCardSchema({
      c,
      segmentNames
    }),
    dropdown: createFluent2MicrosoftDropdownSchema({ c }),
    icon: createFluent2MicrosoftIconSchema({ c }),
    progress: createFluent2MicrosoftProgressSchema({ c }),
    separator: createFluent2MicrosoftSeparatorSchema(),
    switch: createFluent2MicrosoftSwitchSchema({
      c
    })
  }
};
