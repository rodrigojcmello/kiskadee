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
          theme === 'light'
            ? absoluteCap(primitive('black', 'v1'), 'dark', 23)
            : exactColor('neutral', 45, 'global.contours')
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
                    rest: c.resolve(
                      'default',
                      track,
                      absoluteCap(primitive('black', 'v1'), 'dark', 5)
                    )
                  }
                }
              : {}),
            low: {
              rest: c.resolve(
                'default',
                track,
                theme === 'light'
                  ? absoluteCap(primitive('black', 'v1'), 'dark', 9.5)
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
