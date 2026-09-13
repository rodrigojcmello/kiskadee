import { contour, type SchemaSeparators } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment.ts';

type SegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleSeparatorsArgs = {
  segmentNames: readonly SegmentName[];
};

export function createMaterial3GoogleSeparators({
  segmentNames
}: CreateMaterial3GoogleSeparatorsArgs): SchemaSeparators {
  return {
    profiles: {
      subtle: {
        scales: { boxWidth: 1 },
        palettes: buildBySegment(segmentNames, () =>
          Object.fromEntries(
            (['light', 'dark'] as const).map((theme) => [
              theme,
              Object.fromEntries(
                (['onSubtle', 'onVivid'] as const).map((context) => [
                  context,
                  {
                    boxColor: {
                      neutral: {
                        medium: { rest: contour(`neutral.standard.${theme}.${context}.medium`) },
                        low: { rest: contour(`neutral.standard.${theme}.${context}.low`) }
                      }
                    }
                  }
                ])
              )
            ])
          )
        )
      }
    }
  };
}
