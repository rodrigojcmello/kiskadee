import { contour, type SchemaSeparators } from '@kiskadee/core';

/** Separator owns line geometry and selects shared contour paint. */
export function createIos27AppleSeparators(): SchemaSeparators {
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
