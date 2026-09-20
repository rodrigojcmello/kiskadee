import { primitive, type SchemaContours } from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver } from './carbon-ibm.color.ts';
import { tokenColor } from './carbon-ibm.tokens.ts';

/** Carbon border tokens shared by card boundaries and dividers. */
export function createCarbonIbmContours({ c }: { c: CarbonIbmColorResolver }): SchemaContours {
  return {
    profiles: {
      neutral: {
        standard: {
          palettes: {
            default: Object.fromEntries(
              (['light', 'dark', 'darker'] as const).map((theme) => {
                const white = (alpha: number) =>
                  c.resolve(
                    'default',
                    theme === 'light' ? 'l' : 'd',
                    absoluteCap(primitive('black', 'v1'), 'light', alpha)
                  );
                return [
                  theme,
                  {
                    onSubtle: {
                      lowest: { rest: tokenColor(c, theme, 'border-subtle-00', 'neutral') },
                      low: { rest: tokenColor(c, theme, 'border-subtle-01', 'neutral') },
                      medium: { rest: tokenColor(c, theme, 'border-strong-01', 'neutral') }
                    },
                    // Carbon does not specify the complete Kiskadee onVivid contour hierarchy.
                    onVivid: {
                      lowest: { rest: white(20) },
                      low: { rest: white(35) },
                      medium: { rest: white(60) }
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
