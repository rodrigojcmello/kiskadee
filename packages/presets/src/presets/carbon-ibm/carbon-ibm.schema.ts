import { breakpoints, primitive, type Schema } from '@kiskadee/core';
import { createStrictPresetColorResolver } from '../../utils/presetColor.ts';
import { absoluteCap, type CarbonIbmColorResolver } from './carbon-ibm.color.ts';
import { carbonIbmColorEvidence } from './carbon-ibm.color-evidence.ts';
import { schemaColors } from './carbon-ibm.colors.ts';
import { createCarbonIbmContours } from './carbon-ibm.contours.ts';
import { createCarbonIbmForegrounds } from './carbon-ibm.foregrounds.ts';
import { createCarbonIbmSeparators } from './carbon-ibm.separators.ts';
import { tokenColor } from './carbon-ibm.tokens.ts';
import { carbonIbmTypography } from './carbon-ibm.typography.ts';
import { createCarbonIbmBadgeSchema } from './components/badge.schema.ts';
import { createCarbonIbmBottomSheetSchema } from './components/bottom-sheet.schema.ts';
import { createCarbonIbmButtonSchema } from './components/button.schema.ts';
import { createCarbonIbmCardSchema } from './components/card.schema.ts';
import { createCarbonIbmChipSchema } from './components/chip.schema.ts';
import { createCarbonIbmDropdownSchema } from './components/dropdown.schema.ts';
import { createCarbonIbmIconSchema } from './components/icon.schema.ts';
import { createCarbonIbmProgressSchema } from './components/progress.schema.ts';
import { createCarbonIbmSeparatorSchema } from './components/separator.schema.ts';
import { createCarbonIbmSliderSchema } from './components/slider.schema.ts';
import { createCarbonIbmSwitchSchema } from './components/switch.schema.ts';
import { createCarbonIbmTextSchema } from './components/text.schema.ts';

const c = createStrictPresetColorResolver<'default', typeof carbonIbmColorEvidence>({
  colors: schemaColors,
  exactEvidence: carbonIbmColorEvidence
});

export function createCarbonIbmSchema(c: CarbonIbmColorResolver): Schema<never> {
  const black = (alpha: number) =>
    c.resolve('default', 'l', absoluteCap(primitive('black', 'v1'), 'dark', alpha));
  return {
    name: 'Carbon',
    prefix: 'ci',
    version: [11, 0, 0],
    author: 'IBM',
    breakpoints,
    colors: schemaColors,
    global: {
      density: { compact: 's:sm:1', spacious: 's:md:1' },
      interaction: { controlCursor: { value: 'pointer', scope: 'web' } },
      typography: carbonIbmTypography,
      foregrounds: createCarbonIbmForegrounds({ c }),
      contours: createCarbonIbmContours({ c }),
      separators: createCarbonIbmSeparators(),
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
      icons: { family: 'carbon', variant: 'regular' },
      fonts: {
        families: {
          'ibm-plex-sans': { stack: ['IBM Plex Sans', 'sans-serif'] },
          'ibm-plex-mono': { stack: ['IBM Plex Mono', 'monospace'] }
        },
        roles: { body: 'ibm-plex-sans', heading: 'ibm-plex-sans', code: 'ibm-plex-mono' }
      },
      focus: { width: 2, offset: 1 },
      radius: 'square',
      effects: {
        activationFeedback: {
          profile: 'ripple',
          origin: 'pointer',
          visual: { layer: 'overlay', paint: 'field', tone: { default: 'subtle' } },
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
              distancePx: 8,
              enterDurationMs: 240,
              exitDurationMs: 150,
              enterEasing: 'ease-out',
              exitEasing: 'ease-in'
            },
            'grow-height': {
              enterDurationMs: 240,
              exitDurationMs: 150,
              enterEasing: 'ease-out',
              exitEasing: 'ease-in'
            }
          }
        },
        shadow: {
          outer: {
            levels: {
              's:sm:1': [{ x: 0, y: 1, blur: 2, spread: 0, color: black(20) }],
              's:md:1': [{ x: 0, y: 2, blur: 6, spread: 0, color: black(30) }],
              's:lg:1': [{ x: 0, y: 4, blur: 8, spread: 0, color: black(20) }]
            }
          }
        }
      }
    },
    themeTokens: {
      palettes: {
        default: Object.fromEntries(
          (['light', 'dark', 'darker'] as const).map((theme) => [
            theme,
            {
              focusColor: tokenColor(c, theme, 'focus'),
              effects: {
                activationFeedback: {
                  tone: {
                    subtle: { color: tokenColor(c, theme, 'text-primary'), opacity: 0.12 },
                    vivid: { color: tokenColor(c, theme, 'text-on-color'), opacity: 0.2 }
                  }
                }
              }
            }
          ])
        )
      }
    },
    components: {
      badge: createCarbonIbmBadgeSchema({ c }),
      bottomSheet: createCarbonIbmBottomSheetSchema({ c }),
      button: createCarbonIbmButtonSchema({ c }),
      ...createCarbonIbmCardSchema({ c }),
      chip: createCarbonIbmChipSchema({ c }),
      dropdown: createCarbonIbmDropdownSchema({ c }),
      icon: createCarbonIbmIconSchema({ c }),
      progress: createCarbonIbmProgressSchema({ c }),
      separator: createCarbonIbmSeparatorSchema(),
      slider: createCarbonIbmSliderSchema({ c }),
      switch: createCarbonIbmSwitchSchema({ c }),
      text: createCarbonIbmTextSchema()
    }
  };
}
export const schema = createCarbonIbmSchema(c);
