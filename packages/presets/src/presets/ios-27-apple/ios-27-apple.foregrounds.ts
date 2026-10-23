import { type ForegroundProfile, primitive, type SchemaForegrounds } from '@kiskadee/core';
import type { PresetColorGetter } from '../../utils/presetColor.ts';
import type { Segment } from './ios-27-apple.schema.ts';

const chromaticFamilies = [
  'blue',
  'red',
  'green',
  'purple',
  'orange',
  'yellow',
  'teal',
  'cyan',
  'pink',
  'brown'
] as const;

export function createIos27AppleForegrounds({
  c
}: {
  c: PresetColorGetter<Segment>;
}): SchemaForegrounds {
  const neutral: ForegroundProfile = {
    palettes: {
      default: Object.fromEntries(
        (['light', 'dark', 'darker'] as const).map((theme) => {
          const track = theme === 'light' ? 'l' : 'd';
          const secondaryTone = theme === 'light' ? 70 : 95;
          return [
            theme,
            {
              onSubtle: {
                high: { rest: c('default', track, 'neutral', 100) },
                medium: {
                  rest: c('default', track, 'neutral', secondaryTone, theme === 'light' ? 60 : 70)
                },
                low: {
                  rest: c('default', track, 'neutral', secondaryTone, theme === 'light' ? 45 : 50)
                },
                lowest: { rest: c('default', track, 'neutral', secondaryTone, 30) }
              },
              onVivid: {
                high: { rest: c('default', 'l', 'neutral', 0) },
                medium: { rest: c('default', 'l', 'neutral', 0, 80) },
                low: { rest: c('default', 'l', 'neutral', 0, 65) },
                lowest: { rest: c('default', 'l', 'neutral', 0, 50) }
              }
            }
          ];
        })
      )
    }
  };
  const chromatic = (
    family: (typeof chromaticFamilies)[number],
    deep: boolean
  ): ForegroundProfile => ({
    palettes: {
      default: Object.fromEntries(
        (['light', 'dark', 'darker'] as const).map((theme) => {
          const track = theme === 'light' ? 'l' : 'd';
          const role = primitive(family, 'v1');
          // Deep is an explicit readability extension; standard preserves the authored accent anchor.
          const offset = deep ? (track === 'l' ? 8 : 4) : 0;
          return [
            theme,
            {
              onSubtle: {
                high: { rest: c.ref('default', track, role, 'vivid', offset) },
                medium: { rest: c.ref('default', track, role, 'vivid', offset, 75) },
                low: { rest: c.ref('default', track, role, 'vivid', offset, 57.5) },
                lowest: { rest: c.ref('default', track, role, 'vivid', offset, 40) }
              },
              onVivid: {
                high: { rest: c.ref('default', 'l', role, 'subtle', -2) },
                medium: { rest: c.ref('default', 'l', role, 'subtle', -2, 80) },
                low: { rest: c.ref('default', 'l', role, 'subtle', -2, 65) },
                lowest: { rest: c.ref('default', 'l', role, 'subtle', -2, 50) }
              }
            }
          ];
        })
      )
    }
  });
  return {
    profiles: {
      neutral: { standard: neutral },
      ...Object.fromEntries(
        chromaticFamilies.map((family) => [
          family,
          { standard: chromatic(family, false), deep: chromatic(family, true) }
        ])
      )
    }
  };
}
