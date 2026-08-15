import type { SchemaSeparators } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../utils/presetColor.ts';

type SegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleSeparatorsArgs = {
  c: PresetColorGetter<SegmentName>;
  segmentNames: readonly SegmentName[];
};

export function createMaterial3GoogleSeparators({
  c,
  segmentNames
}: CreateMaterial3GoogleSeparatorsArgs): SchemaSeparators {
  return {
    profiles: {
      subtle: {
        scales: { boxWidth: 1 },
        palettes: buildBySegment(segmentNames, (segment) => ({
          light: {
            onSubtle: {
              boxColor: {
                neutral: { medium: { rest: c(segment, 'l', 'neutral', 20, 12) } }
              }
            }
          }
        }))
      }
    }
  };
}
