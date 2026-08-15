import type { SchemaSeparators } from '@kiskadee/core';
import type { PresetColorGetter } from '../../utils/presetColor.ts';
import type { Segment } from './ios-27-apple.schema.ts';

type CreateIos27AppleSeparatorsArgs = {
  c: PresetColorGetter<Segment>;
};

export function createIos27AppleSeparators({
  c
}: CreateIos27AppleSeparatorsArgs): SchemaSeparators {
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
            }
          }
        }
      }
    }
  };
}
