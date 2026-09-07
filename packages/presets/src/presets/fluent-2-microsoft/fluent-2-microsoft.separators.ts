import type { SchemaSeparators } from '@kiskadee/core';
import {
  absoluteCap,
  type Fluent2MicrosoftColorResolver,
  referenceColor
} from './fluent-2-microsoft.color.ts';

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
              onVivid: {
                boxColor: {
                  neutral: {
                    low: {
                      rest: c.resolve(
                        'default',
                        'l',
                        absoluteCap('primitive.black.v1', 'light', 15)
                      )
                    },
                    medium: {
                      rest: c.resolve(
                        'default',
                        'l',
                        absoluteCap('primitive.black.v1', 'light', 30)
                      )
                    }
                  }
                }
              },
              onSubtle: {
                boxColor: {
                  neutral: {
                    low: {
                      rest: c.resolve('default', 'l', absoluteCap('primitive.black.v1', 'dark', 8))
                    },
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
              onVivid: {
                boxColor: {
                  neutral: {
                    low: {
                      rest: c.resolve(
                        'default',
                        'd',
                        absoluteCap('primitive.black.v1', 'light', 15)
                      )
                    },
                    medium: {
                      rest: c.resolve(
                        'default',
                        'd',
                        absoluteCap('primitive.black.v1', 'light', 30)
                      )
                    }
                  }
                }
              },
              onSubtle: {
                boxColor: {
                  neutral: {
                    low: {
                      rest: c.resolve(
                        'default',
                        'd',
                        absoluteCap('primitive.black.v1', 'light', 12)
                      )
                    },
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
              onVivid: {
                boxColor: {
                  neutral: {
                    low: {
                      rest: c.resolve(
                        'default',
                        'd',
                        absoluteCap('primitive.black.v1', 'light', 15)
                      )
                    },
                    medium: {
                      rest: c.resolve(
                        'default',
                        'd',
                        absoluteCap('primitive.black.v1', 'light', 30)
                      )
                    }
                  }
                }
              },
              onSubtle: {
                boxColor: {
                  neutral: {
                    low: {
                      rest: c.resolve(
                        'default',
                        'd',
                        absoluteCap('primitive.black.v1', 'light', 12)
                      )
                    },
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
