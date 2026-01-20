import { primitive, type Schema } from '@kiskadee/core';
import { type DeepOverride, deepMerge } from '../../utils/deepMerge';
import { createPresetColorGetter } from '../../utils/presetColor';
import { schema as baseSchema } from '../material-3-google/material-3-google.schema';
import { schemaColors } from './material-3-kiskadee.colors';

const segmentNames = ['default', 'dynamic'] as const;
type SegmentName = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;

const c = createPresetColorGetter<SegmentName>(schemaContext);

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = never;

const patch = {
  name: 'Material Design',
  prefix: 'mk', // Material by Kiskadee
  version: [3, 0, 0],
  author: 'Kiskadee',
  colors: schemaColors,
  components: {
    button: {
      elements: {
        e1: {
          palettes: {
            default: {
              light: {
                boxColor: {
                  destructive: {
                    subtle: {
                      rest: c('default', 'l', 'button.destructive', 10),
                      hover: c('default', 'l', 'button.destructive', 8),
                      pressed: c('default', 'l', 'button.destructive', 13),
                      disabled: c('default', 'l', 'button.neutral', 10),
                      focus: c('default', 'l', 'button.destructive', 10),
                      selected: {
                        rest: c('default', 'l', 'button.destructive', 50),
                        hover: c('default', 'l', 'button.destructive', 40),
                        pressed: c('default', 'l', 'button.destructive', 60)
                      }
                    },
                    vivid: {
                      rest: c('default', 'l', 'button.destructive', 50),
                      hover: c('default', 'l', 'button.destructive', 40),
                      pressed: c('default', 'l', 'button.destructive', 60),
                      disabled: c('default', 'l', 'button.neutral', 10),
                      focus: c('default', 'l', 'button.destructive', 50),
                      selected: {
                        rest: c('default', 'l', 'button.destructive', 10),
                        hover: c('default', 'l', 'button.destructive', 8),
                        pressed: c('default', 'l', 'button.destructive', 20)
                      }
                    }
                  }
                }
              }
            },
            dynamic: {
              light: {
                boxColor: {
                  destructive: {
                    subtle: {
                      rest: c('dynamic', 'l', 'button.destructive', 10),
                      hover: c('dynamic', 'l', 'button.destructive', 8),
                      pressed: c('dynamic', 'l', 'button.destructive', 13),
                      disabled: c('dynamic', 'l', 'button.neutral', 10),
                      focus: c('dynamic', 'l', 'button.destructive', 10),
                      selected: {
                        rest: c('dynamic', 'l', 'button.destructive', 50),
                        hover: c('dynamic', 'l', 'button.destructive', 40),
                        pressed: c('dynamic', 'l', 'button.destructive', 60)
                      }
                    },
                    vivid: {
                      rest: c('dynamic', 'l', 'button.destructive', 50),
                      hover: c('dynamic', 'l', 'button.destructive', 40),
                      pressed: c('dynamic', 'l', 'button.destructive', 60),
                      disabled: c('dynamic', 'l', 'button.neutral', 10),
                      focus: c('dynamic', 'l', 'button.destructive', 50),
                      selected: {
                        rest: c('dynamic', 'l', 'button.destructive', 10),
                        hover: c('dynamic', 'l', 'button.destructive', 8),
                        pressed: c('dynamic', 'l', 'button.destructive', 20)
                      }
                    }
                  }
                }
              }
            }
          }
        },
        e2: {
          palettes: {
            default: {
              light: {
                textColor: {
                  destructive: {
                    subtle: {
                      rest: c('default', 'l', 'button.neutral', 70),
                      disabled: {
                        ref: c('default', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('default', 'l', 'button.neutral', 0)
                        }
                      }
                    },
                    vivid: {
                      rest: c('default', 'l', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c('default', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('default', 'l', 'button.neutral', 70)
                        }
                      }
                    }
                  }
                }
              }
            },
            dynamic: {
              light: {
                textColor: {
                  destructive: {
                    subtle: {
                      rest: c('dynamic', 'l', 'button.neutral', 70),
                      disabled: {
                        ref: c('dynamic', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('dynamic', 'l', 'button.neutral', 0)
                        }
                      }
                    },
                    vivid: {
                      rest: c('dynamic', 'l', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c('dynamic', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('dynamic', 'l', 'button.neutral', 70)
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} as const satisfies DeepOverride<Schema<Segments>>;

export const schema: Schema<Segments> = deepMerge(baseSchema as Schema<Segments>, patch);
