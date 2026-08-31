import { breakpoints, primitive, type Schema } from '@kiskadee/core';
import { createStrictPresetColorResolver } from '../../utils/presetColor.ts';
import { createFluent2MicrosoftBadgeSchema } from './components/badge.schema.ts';
import { createFluent2MicrosoftBottomSheetSchema } from './components/bottom-sheet.schema.ts';
import { createFluent2MicrosoftButtonSchema } from './components/button.schema.ts';
import { createFluent2MicrosoftCardSchema } from './components/card.schema.ts';
import { createFluent2MicrosoftChipSchema } from './components/chip.schema.ts';
import { createFluent2MicrosoftDropdownSchema } from './components/dropdown.schema.ts';
import { createFluent2MicrosoftIconSchema } from './components/icon.schema.ts';
import { createFluent2MicrosoftProgressSchema } from './components/progress.schema.ts';
import { createFluent2MicrosoftSeparatorSchema } from './components/separator.schema.ts';
import { createFluent2MicrosoftSliderSchema } from './components/slider.schema.ts';
import { createFluent2MicrosoftSwitchSchema } from './components/switch.schema.ts';
import { createFluent2MicrosoftTextSchema } from './components/text.schema.ts';
import {
  absoluteCap,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from './fluent-2-microsoft.color.ts';
import { fluent2MicrosoftColorEvidence } from './fluent-2-microsoft.color-evidence.ts';
import { schemaColors } from './fluent-2-microsoft.colors.ts';
import { createFluent2MicrosoftForegrounds } from './fluent-2-microsoft.foregrounds.ts';
import { createFluent2MicrosoftSeparators } from './fluent-2-microsoft.separators.ts';
import { fluent2MicrosoftTypography } from './fluent-2-microsoft.typography.ts';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const c = createStrictPresetColorResolver<'default', typeof fluent2MicrosoftColorEvidence>({
  colors: schemaColors,
  exactEvidence: fluent2MicrosoftColorEvidence
});

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = never;

export function createFluent2MicrosoftSchema(
  colorResolver: Fluent2MicrosoftColorResolver
): Schema<Segments> {
  const segmentNames = ['default'] as const;
  const shadowBlack = (alpha: number) =>
    colorResolver.resolve(
      'default',
      'l',
      absoluteCap(primitive('black', 'v1'), 'dark', alpha * 100)
    );
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

  return {
    name: 'Fluent',
    prefix: 'fm', // Fluent by MicroSoft
    version: [2, 0, 0],
    author: 'Microsoft',
    breakpoints,
    colors: schemaColors,
    global: {
      foregrounds: createFluent2MicrosoftForegrounds({ c: colorResolver }),
      typography: fluent2MicrosoftTypography,
      separators: createFluent2MicrosoftSeparators({ c: colorResolver }),
      iconSizes: {
        's:sm:5': 6,
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
            focusColor: colorResolver.resolve(
              'default',
              'l',
              absoluteCap(primitive('black', 'v1'), 'dark')
            ),
            effects: {
              activationFeedback: {
                tone: {
                  subtle: {
                    color: colorResolver.resolve(
                      'default',
                      'l',
                      referenceColor('neutral', 'vivid')
                    ),
                    opacity: 0.12
                  },
                  vivid: {
                    color: colorResolver.resolve(
                      'default',
                      'l',
                      absoluteCap(primitive('black', 'v1'), 'light')
                    ),
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
      badge: createFluent2MicrosoftBadgeSchema({ c: colorResolver }),
      bottomSheet: createFluent2MicrosoftBottomSheetSchema({ c: colorResolver }),
      slider: createFluent2MicrosoftSliderSchema({ c: colorResolver }),
      button: createFluent2MicrosoftButtonSchema({ c: colorResolver, shadowBlack }),
      card: createFluent2MicrosoftCardSchema({
        c: colorResolver,
        segmentNames
      }),
      chip: createFluent2MicrosoftChipSchema({ c: colorResolver }),
      dropdown: createFluent2MicrosoftDropdownSchema({ c: colorResolver }),
      icon: createFluent2MicrosoftIconSchema({ c: colorResolver }),
      progress: createFluent2MicrosoftProgressSchema({ c: colorResolver }),
      separator: createFluent2MicrosoftSeparatorSchema(),
      switch: createFluent2MicrosoftSwitchSchema({
        c: colorResolver
      }),
      text: createFluent2MicrosoftTextSchema()
    }
  };
}

export const schema = createFluent2MicrosoftSchema(c);
