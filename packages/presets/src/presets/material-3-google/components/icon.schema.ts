import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SegmentName = 'default' | 'dynamic';

export function createMaterial3GoogleIconSchema({
  c,
  segmentNames
}: {
  c: PresetColorGetter<SegmentName>;
  segmentNames: readonly SegmentName[];
}): NonNullable<Schema<never>['components']['icon']> {
  return {
    elements: {
      e1: {
        name: 'glyph',
        iconSize: {
          's:sm:2': 's:sm:2',
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2',
          's:lg:3': 's:lg:3',
          's:lg:4': 's:lg:4'
        },
        palettes: buildBySegment(segmentNames, (segment) => {
          const theme = (track: 'l' | 'd') => ({
            onSubtle: {
              textColor: {
                neutral: { medium: { rest: c.ref(segment, track, 'icon.neutral', 'vivid') } },
                primary: {
                  medium: {
                    rest: c.ref(segment, track, 'icon.primary', 'vivid', track === 'l' ? 0 : 6)
                  }
                }
              }
            },
            onVivid: {
              textColor: {
                neutral: { medium: { rest: c(segment, 'l', 'primitive.black.v1', 0) } },
                primary: { medium: { rest: c.ref(segment, 'l', 'icon.primary', 'subtle') } }
              }
            }
          });
          return { light: theme('l'), dark: theme('d') };
        })
      }
    }
  };
}
