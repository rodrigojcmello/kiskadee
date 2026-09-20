import { contour, type SchemaSeparators } from '@kiskadee/core';

/** Dividers share contour paint with card boundaries and keep one-pixel geometry. */
export function createCarbonIbmSeparators(): SchemaSeparators {
  return {
    profiles: {
      subtle: {
        scales: { boxWidth: 1 },
        palettes: {
          default: Object.fromEntries(
            (['light', 'dark', 'darker'] as const).map((theme) => [
              theme,
              Object.fromEntries(
                (['onSubtle', 'onVivid'] as const).map((context) => [
                  context,
                  {
                    boxColor: {
                      neutral: {
                        lowest: { rest: contour(`neutral.standard.${theme}.${context}.lowest`) },
                        low: { rest: contour(`neutral.standard.${theme}.${context}.low`) },
                        medium: { rest: contour(`neutral.standard.${theme}.${context}.medium`) }
                      }
                    }
                  }
                ])
              )
            ])
          )
        }
      }
    }
  };
}
