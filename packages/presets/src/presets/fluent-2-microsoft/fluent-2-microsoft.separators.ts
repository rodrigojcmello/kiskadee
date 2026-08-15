import type { SchemaSeparators } from '@kiskadee/core';
import type { PresetColorGetter } from '../../utils/presetColor.ts';

type CreateFluent2MicrosoftSeparatorsArgs = {
  c: PresetColorGetter<'default'>;
};

export function createFluent2MicrosoftSeparators({
  c
}: CreateFluent2MicrosoftSeparatorsArgs): SchemaSeparators {
  return {
    profiles: {
      subtle: {
        scales: { boxWidth: 1 },
        palettes: {
          default: {
            light: {
              onSubtle: {
                boxColor: {
                  neutral: { medium: { rest: c('default', 'l', 'neutral', 10) } }
                }
              }
            },
            dark: {
              onSubtle: {
                boxColor: {
                  neutral: { medium: { rest: c('default', 'd', 'neutral', 16) } }
                }
              }
            },
            darker: {
              onSubtle: {
                boxColor: {
                  neutral: { medium: { rest: c('default', 'd', 'neutral', 12) } }
                }
              }
            }
          }
        }
      }
    }
  };
}
