import { primitive, type SchemaContours, type ThemeMode } from '@kiskadee/core';
import {
  absoluteCap,
  exactColor,
  type Fluent2MicrosoftColorResolver
} from './fluent-2-microsoft.color.ts';

/** Shares context-relative boundary paint between Cards and dividing lines. */
export function createFluent2MicrosoftContours({
  c
}: {
  c: Fluent2MicrosoftColorResolver;
}): SchemaContours {
  const palettes = Object.fromEntries(
    (['light', 'dark', 'darker'] as const).map((theme: ThemeMode) => {
      const track = theme === 'light' ? 'l' : 'd';
      const medium = {
        rest: c.resolve(
          'default',
          track,
          exactColor('neutral', theme === 'light' ? 10 : 45, 'global.contours')
        )
      };
      return [
        theme,
        {
          onSubtle: {
            medium,
            ...(theme === 'light'
              ? {
                  lowest: {
                    rest: c.resolve('default', track, exactColor('neutral', 3, 'global.contours'))
                  }
                }
              : {}),
            low: {
              rest: c.resolve(
                'default',
                track,
                theme === 'light'
                  ? exactColor('neutral', 6, 'global.contours')
                  : absoluteCap(primitive('black', 'v1'), 'light', 12)
              )
            }
          },
          onVivid: {
            ...(theme === 'light'
              ? {
                  lowest: {
                    rest: c.resolve(
                      'default',
                      track,
                      absoluteCap(primitive('black', 'v1'), 'light', 8)
                    )
                  }
                }
              : {}),
            medium: {
              rest: c.resolve('default', track, absoluteCap(primitive('black', 'v1'), 'light', 15))
            },
            low: {
              rest: c.resolve('default', track, absoluteCap(primitive('black', 'v1'), 'light', 8))
            }
          }
        }
      ];
    })
  );
  return { profiles: { neutral: { standard: { palettes: { default: palettes } } } } };
}
