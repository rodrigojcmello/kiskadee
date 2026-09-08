import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import type { Segment } from '../ios-27-apple.schema.ts';

type IconComponent = NonNullable<Schema<Segment>['components']['icon']>;
export function createIos27AppleIconSchema({
  c
}: {
  c: PresetColorGetter<Segment>;
}): IconComponent {
  return {
    elements: {
      e1: {
        name: 'glyph',
        iconSize: {
          's:sm:2': 's:sm:2',
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2'
        },
        palettes: {
          default: Object.fromEntries(
            (['light', 'dark', 'darker'] as const).map((theme) => {
              const track = theme === 'light' ? 'l' : 'd';
              return [
                theme,
                {
                  onSubtle: {
                    textColor: {
                      neutral: { medium: { rest: c('default', track, 'icon.neutral', 100) } },
                      primary: {
                        medium: { rest: c.ref('default', track, 'icon.primary', 'vivid') }
                      }
                    }
                  },
                  onVivid: {
                    textColor: {
                      neutral: { medium: { rest: c('default', 'l', 'neutral', 0) } },
                      primary: {
                        medium: { rest: c.ref('default', 'l', 'icon.primary', 'subtle', -2) }
                      }
                    }
                  }
                }
              ];
            })
          )
        }
      }
    }
  };
}
