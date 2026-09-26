import { contour, type SchemaSeparators } from '@kiskadee/core';
import { exactColor, type Fluent2MicrosoftColorResolver } from './fluent-2-microsoft.color.ts';

/** Separator owns line geometry and its context-dependent paint. */
export function createFluent2MicrosoftSeparators({
  c
}: {
  c: Fluent2MicrosoftColorResolver;
}): SchemaSeparators {
  const primaryVivid = (alpha: number) =>
    c.resolve('default', 'l', exactColor('primary', 85, 'global.separators', alpha));
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
                        ...(theme === 'light'
                          ? {
                              lowest: {
                                rest: contour(`neutral.standard.${theme}.${context}.lowest`)
                              }
                            }
                          : {}),
                        low: { rest: contour(`neutral.standard.${theme}.${context}.low`) },
                        medium: { rest: contour(`neutral.standard.${theme}.${context}.medium`) }
                      },
                      ...(theme === 'light'
                        ? {
                            primary: {
                              lowest: {
                                rest:
                                  context === 'onVivid'
                                    ? primaryVivid(8)
                                    : contour('primary.standard.light.onSubtle.lowest')
                              },
                              low: {
                                rest:
                                  context === 'onVivid'
                                    ? primaryVivid(16)
                                    : contour('primary.standard.light.onSubtle.low')
                              },
                              medium: {
                                rest:
                                  context === 'onVivid'
                                    ? primaryVivid(32)
                                    : contour('primary.standard.light.onSubtle.medium')
                              }
                            }
                          }
                        : {})
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
