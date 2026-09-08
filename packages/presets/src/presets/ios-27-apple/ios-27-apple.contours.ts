import type { SchemaContours } from '@kiskadee/core';
import type { PresetColorGetter } from '../../utils/presetColor.ts';
import type { Segment } from './ios-27-apple.schema.ts';

/** Opaque and nonopaque Apple separators also define optional content boundaries. */
export function createIos27AppleContours({ c }: { c: PresetColorGetter<Segment> }): SchemaContours {
  return {
    profiles: {
      neutral: {
        standard: {
          palettes: {
            default: Object.fromEntries(
              (['light', 'dark', 'darker'] as const).map((theme) => {
                const track = theme === 'light' ? 'l' : 'd';
                return [
                  theme,
                  {
                    onSubtle: {
                      medium: { rest: c('default', track, 'neutral', theme === 'light' ? 14 : 16) },
                      low: {
                        rest: c('default', track, 'neutral', 100, theme === 'light' ? 12 : 17)
                      }
                    },
                    onVivid: {
                      medium: { rest: c('default', 'l', 'neutral', 0, 30) },
                      low: { rest: c('default', 'l', 'neutral', 0, 17) }
                    }
                  }
                ];
              })
            )
          }
        }
      }
    }
  };
}
