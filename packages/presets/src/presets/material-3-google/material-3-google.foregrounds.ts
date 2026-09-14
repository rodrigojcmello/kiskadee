import { type ForegroundProfile, type SchemaForegrounds, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment.ts';
import type { PresetColorGetter, PresetSolidColorRole } from '../../utils/presetColor.ts';

type SegmentName = 'default' | 'dynamic' | 'purple';
type Args = { c: PresetColorGetter<SegmentName>; segmentNames: readonly SegmentName[] };

/** Material content roles expressed through the existing surface-relative foreground catalog. */
export function createMaterial3GoogleForegrounds({ c, segmentNames }: Args): SchemaForegrounds {
  const profile = (role: PresetSolidColorRole, deep = false): ForegroundProfile => ({
    palettes: buildBySegment(segmentNames, (segment) => {
      const theme = (track: 'l' | 'd') => {
        const rest = deep
          ? c(segment, track, role, track === 'l' ? 65 : 85)
          : c.ref(segment, track, role, 'vivid', track === 'd' && role !== 'neutral' ? 6 : 0);
        const white = c(segment, 'l', 'primitive.black.v1', 0);
        const foreground = (value: typeof rest) => ({
          medium: { rest: value, pending: withAlpha(value, 70), disabled: withAlpha(value, 38) },
          low: { rest: withAlpha(value, 68), disabled: withAlpha(value, 38) },
          lowest: { rest: withAlpha(value, 38) }
        });
        return { onSubtle: foreground(rest), onVivid: foreground(white) };
      };
      return { light: theme('l'), dark: theme('d') };
    })
  });
  const family = (role: PresetSolidColorRole) => ({
    standard: profile(role),
    deep: profile(role, true)
  });

  return {
    profiles: {
      neutral: family('neutral'),
      blue: family('primitive.blue.v1'),
      red: family('primitive.red.v1'),
      green: family('primitive.green.v1'),
      purple: family('primitive.purple.v1'),
      pink: family('primitive.pink.v1'),
      yellow: family('primitive.yellow.v1')
    }
  };
}
