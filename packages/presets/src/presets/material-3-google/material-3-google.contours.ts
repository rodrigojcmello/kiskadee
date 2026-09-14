import type { SchemaContours } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../utils/presetColor.ts';

type SegmentName = 'default' | 'dynamic' | 'purple';

export function createMaterial3GoogleContours({
  c,
  segmentNames
}: {
  c: PresetColorGetter<SegmentName>;
  segmentNames: readonly SegmentName[];
}): SchemaContours {
  return {
    profiles: {
      neutral: {
        standard: {
          palettes: buildBySegment(segmentNames, (segment) => {
            const theme = (track: 'l' | 'd') => ({
              onSubtle: {
                medium: { rest: c.ref(segment, track, 'neutral', 'vivid', 0, 30) },
                low: { rest: c.ref(segment, track, 'neutral', 'vivid', 0, 12) }
              },
              onVivid: {
                medium: { rest: c(segment, 'l', 'primitive.black.v1', 0, 30) },
                low: { rest: c(segment, 'l', 'primitive.black.v1', 0, 12) }
              }
            });
            return { light: theme('l'), dark: theme('d') };
          })
        }
      }
    }
  };
}
