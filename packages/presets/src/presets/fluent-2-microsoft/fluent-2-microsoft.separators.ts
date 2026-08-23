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
                  neutral: {
                    medium: { rest: c('default', 'l', 'primitive.black.v1', 7) }
                  }
                }
              }
            },
            dark: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: { rest: c('default', 'd', 'primitive.black.v1', 30) }
                  }
                }
              }
            },
            darker: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: { rest: c('default', 'd', 'primitive.black.v1', 12) }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}
