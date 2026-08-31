import type { SchemaSeparators } from '@kiskadee/core';
import { type Fluent2MicrosoftColorResolver, referenceColor } from './fluent-2-microsoft.color.ts';

type CreateFluent2MicrosoftSeparatorsArgs = {
  c: Fluent2MicrosoftColorResolver;
};

export function createFluent2MicrosoftSeparators({
  c
}: CreateFluent2MicrosoftSeparatorsArgs): SchemaSeparators {
  return {
    profiles: {
      subtle: {
        scales: { boxWidth: 1 },
        palettes: {
          default: {
            light: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: c.resolve(
                        'default',
                        'l',
                        referenceColor('primitive.black.v1', 'subtle', 3)
                      )
                    }
                  }
                }
              }
            },
            dark: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: c.resolve(
                        'default',
                        'd',
                        referenceColor('primitive.black.v1', 'subtle', 16)
                      )
                    }
                  }
                }
              }
            },
            darker: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: c.resolve(
                        'default',
                        'd',
                        referenceColor('primitive.black.v1', 'subtle', 7)
                      )
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}
