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
            low: {
              rest: c.resolve(
                'default',
                track,
                absoluteCap(
                  primitive('black', 'v1'),
                  theme === 'light' ? 'dark' : 'light',
                  theme === 'light' ? 8 : 12
                )
              )
            }
          },
          onVivid: {
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
