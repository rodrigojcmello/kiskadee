import { primitive, type Schema } from '@kiskadee/core';
import { type DeepOverride, deepMerge } from '../../utils/deepMerge';
import { createPresetColorGetter } from '../../utils/presetColor';
import { schema as baseSchema } from '../material-3-google/material-3-google.schema';
import { schemaColors } from './material-3-kiskadee.colors';

const segmentNames = ['default', 'modern', 'dynamic'] as const;
type SegmentName = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;

const c = createPresetColorGetter<SegmentName>(schemaContext);

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = 'modern';

const patch = {
  name: 'Material Design',
  prefix: 'mk', // Material by Kiskadee
  version: [3, 0, 0],
  author: 'Kiskadee',
  colors: schemaColors,
  themeTokens: {
    palettes: {
      modern: {
        light: {
          background: c('modern', 'l', 'primitive.black.v1', 4),
          focusColor: c('modern', 'l', 'primitive.blue.v1', 70)
        },
        dark: {
          background: c('modern', 'd', 'primitive.black.v1', 85),
          focusColor: c('modern', 'd', 'primitive.blue.v1', 60)
        }
      }
    }
  },
  components: {
    button: {
      elements: {
        e1: {
          palettes: {
            // modern: {
            //   light: {
            //     boxColor: {
            //       primary: {
            //         high: {
            //           rest: c('modern', 'l', 'button.primary.gradient', 25),
            //           hover: c('modern', 'l', 'button.primary.gradient', 20),
            //           pressed: c('modern', 'l', 'button.primary.gradient', 30),
            //           disabled: c('modern', 'l', 'button.neutral', 10),
            //           focus: c('modern', 'l', 'button.primary.gradient', 5),
            //           selected: {
            //             rest: c('modern', 'l', 'button.primary.gradient', 80),
            //             hover: c('modern', 'l', 'button.primary.gradient', 70),
            //             pressed: c('modern', 'l', 'button.primary.gradient', 90)
            //           }
            //         },
            //         medium: {
            //           rest: c('modern', 'l', 'button.primary', 10),
            //           hover: c('modern', 'l', 'button.primary', 8),
            //           pressed: c('modern', 'l', 'button.primary', 13),
            //           disabled: c('modern', 'l', 'button.neutral', 10),
            //           focus: c('modern', 'l', 'button.primary', 10),
            //           selected: {
            //             rest: c('modern', 'l', 'button.primary', 50),
            //             hover: c('modern', 'l', 'button.primary', 40),
            //             pressed: c('modern', 'l', 'button.primary', 60)
            //           }
            //         }
            //       },
            //       destructive: {
            //         high: {
            //           rest: c('modern', 'l', 'button.destructive', 50),
            //           hover: c('modern', 'l', 'button.destructive', 40),
            //           pressed: c('modern', 'l', 'button.destructive', 60),
            //           disabled: c('modern', 'l', 'button.neutral', 10),
            //           selected: {
            //             rest: c('modern', 'l', 'button.destructive', 10),
            //             hover: c('modern', 'l', 'button.destructive', 8),
            //             pressed: c('modern', 'l', 'button.destructive', 20)
            //           }
            //         },
            //         medium: {
            //           rest: c('modern', 'l', 'button.destructive', 10),
            //           hover: c('modern', 'l', 'button.destructive', 8),
            //           pressed: c('modern', 'l', 'button.destructive', 13),
            //           disabled: c('modern', 'l', 'button.neutral', 10),
            //           focus: c('modern', 'l', 'button.destructive', 10),
            //           selected: {
            //             rest: c('modern', 'l', 'button.destructive', 50),
            //             hover: c('modern', 'l', 'button.destructive', 40),
            //             pressed: c('modern', 'l', 'button.destructive', 60)
            //           }
            //         }
            //       }
            //     }
            //   },
            //   dark: {
            //     boxColor: {
            //       primary: {
            //         medium: {
            //           rest: c('modern', 'd', 'button.primary', 50),
            //           hover: c('modern', 'd', 'button.primary', 40),
            //           pressed: c('modern', 'd', 'button.primary', 60),
            //           disabled: c('modern', 'd', 'button.neutral', 10),
            //           focus: c('modern', 'd', 'button.primary', 50),
            //           selected: {
            //             rest: c('modern', 'd', 'button.primary', 10),
            //             hover: c('modern', 'd', 'button.primary', 8),
            //             pressed: c('modern', 'd', 'button.primary', 20)
            //           }
            //         },
            //         high: {
            //           rest: c('modern', 'd', 'button.primary.gradient', 25),
            //           hover: c('modern', 'd', 'button.primary.gradient', 60),
            //           pressed: c('modern', 'd', 'button.primary.gradient', 90),
            //           disabled: c('modern', 'd', 'button.neutral', 10),
            //           focus: c('modern', 'd', 'button.primary.gradient', 70),
            //           selected: {
            //             rest: c('modern', 'd', 'button.primary.gradient', 80),
            //             hover: c('modern', 'd', 'button.primary.gradient', 70),
            //             pressed: c('modern', 'd', 'button.primary.gradient', 90)
            //           }
            //         }
            //       },
            //       destructive: {
            //         // medium: {
            //         //   rest: c('modern', 'd', 'button.destructive', 50),
            //         //   hover: c('modern', 'd', 'button.destructive', 40),
            //         //   pressed: c('modern', 'd', 'button.destructive', 60),
            //         //   disabled: c('modern', 'd', 'button.neutral', 10),
            //         //   focus: c('modern', 'd', 'button.destructive', 50),
            //         //   selected: {
            //         //     rest: c('modern', 'd', 'button.destructive', 10),
            //         //     hover: c('modern', 'd', 'button.destructive', 8),
            //         //     pressed: c('modern', 'd', 'button.destructive', 20)
            //         //   }
            //         // },
            //         high: {
            //           rest: c('modern', 'd', 'button.destructive', 55),
            //           hover: c('modern', 'd', 'button.destructive', 50),
            //           pressed: c('modern', 'd', 'button.destructive', 65),
            //           disabled: c('modern', 'd', 'button.neutral', 10),
            //           focus: c('modern', 'd', 'button.destructive', 55),
            //           selected: {
            //             rest: c('modern', 'd', 'button.destructive', 10),
            //             hover: c('modern', 'd', 'button.destructive', 8),
            //             pressed: c('modern', 'd', 'button.destructive', 20)
            //           }
            //         }
            //       }
            //     }
            //   }
            // },
            default: {
              light: {
                boxColor: {
                  destructive: {
                    high: {
                      rest: c('default', 'l', 'button.destructive', 55),
                      focus: c('default', 'l', 'button.destructive', 55),
                      hover: c('default', 'l', 'button.destructive', 50),
                      pressed: c('default', 'l', 'button.destructive', 65),
                      disabled: c('default', 'l', 'button.neutral', 10),
                      selected: {
                        rest: c('default', 'l', 'button.destructive', 10),
                        hover: c('default', 'l', 'button.destructive', 8),
                        pressed: c('default', 'l', 'button.destructive', 20)
                      }
                    },
                    medium: {
                      rest: c('default', 'l', 'button.destructive', 10),
                      focus: c('default', 'l', 'button.destructive', 10),
                      hover: c('default', 'l', 'button.destructive', 8),
                      pressed: c('default', 'l', 'button.destructive', 15),
                      disabled: c('default', 'l', 'button.neutral', 10),
                      selected: {
                        rest: c('default', 'l', 'button.destructive', 50),
                        hover: c('default', 'l', 'button.destructive', 40),
                        pressed: c('default', 'l', 'button.destructive', 60)
                      }
                    }
                  }
                }
              }
            }
            // dynamic: {
            //   light: {
            //     boxColor: {
            //       destructive: {
            //         medium: {
            //           rest: c('dynamic', 'l', 'button.destructive', 10),
            //           hover: c('dynamic', 'l', 'button.destructive', 8),
            //           pressed: c('dynamic', 'l', 'button.destructive', 13),
            //           disabled: c('dynamic', 'l', 'button.neutral', 10),
            //           focus: c('dynamic', 'l', 'button.destructive', 10),
            //           selected: {
            //             rest: c('dynamic', 'l', 'button.destructive', 50),
            //             hover: c('dynamic', 'l', 'button.destructive', 40),
            //             pressed: c('dynamic', 'l', 'button.destructive', 60)
            //           }
            //         },
            //         high: {
            //           rest: c('dynamic', 'l', 'button.destructive', 50),
            //           hover: c('dynamic', 'l', 'button.destructive', 40),
            //           pressed: c('dynamic', 'l', 'button.destructive', 60),
            //           disabled: c('dynamic', 'l', 'button.neutral', 10),
            //           focus: c('dynamic', 'l', 'button.destructive', 50),
            //           selected: {
            //             rest: c('dynamic', 'l', 'button.destructive', 10),
            //             hover: c('dynamic', 'l', 'button.destructive', 8),
            //             pressed: c('dynamic', 'l', 'button.destructive', 20)
            //           }
            //         }
            //       }
            //     }
            //   }
            // }
          }
        },
        e2: {
          palettes: {
            modern: {
              light: {
                textColor: {
                  primary: {
                    medium: {
                      rest: c('modern', 'l', 'button.neutral', 70),
                      disabled: {
                        ref: c('modern', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'l', 'button.neutral', 0)
                        }
                      }
                    },
                    high: {
                      rest: c('modern', 'l', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c('modern', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'l', 'button.neutral', 70)
                        }
                      }
                    }
                  },
                  destructive: {
                    medium: {
                      rest: c('modern', 'l', 'button.destructive', 70),
                      disabled: {
                        ref: c('modern', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'l', 'button.neutral', 0)
                        }
                      }
                    },
                    high: {
                      rest: c('modern', 'l', 'button.neutral', 0),
                      disabled: {
                        ref: c('modern', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'l', 'button.neutral', 70)
                        }
                      }
                    }
                  }
                }
              },
              dark: {
                textColor: {
                  primary: {
                    medium: {
                      rest: c('modern', 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c('modern', 'd', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'd', 'button.neutral', 70)
                        }
                      }
                    },
                    high: {
                      rest: c('modern', 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c('modern', 'd', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'd', 'button.neutral', 70)
                        }
                      }
                    }
                  },
                  destructive: {
                    medium: {
                      rest: c('modern', 'd', 'button.neutral', 0),
                      disabled: {
                        ref: c('modern', 'd', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'd', 'button.neutral', 70)
                        }
                      }
                    },
                    high: {
                      rest: c('modern', 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c('modern', 'd', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('modern', 'd', 'button.neutral', 70)
                        }
                      }
                    }
                  }
                }
              }
            },
            default: {
              light: {
                textColor: {
                  destructive: {
                    medium: {
                      rest: c('default', 'l', 'button.destructive', 70),
                      disabled: {
                        ref: c('default', 'l', 'button.neutral', 60)
                      },
                      selected: {
                        rest: {
                          ref: c('default', 'l', 'button.neutral', 0)
                        }
                      }
                    },
                    high: {
                      rest: c('default', 'l', 'button.neutral', 0),
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
            }
            // dynamic: {
            //   light: {
            //     textColor: {
            //       destructive: {
            //         medium: {
            //           rest: c('dynamic', 'l', 'button.neutral', 70),
            //           disabled: {
            //             ref: c('dynamic', 'l', 'button.neutral', 60)
            //           },
            //           selected: {
            //             rest: {
            //               ref: c('dynamic', 'l', 'button.neutral', 0)
            //             }
            //           }
            //         },
            //         high: {
            //           rest: c('dynamic', 'l', primitive('black', 'v1'), 0),
            //           disabled: {
            //             ref: c('dynamic', 'l', 'button.neutral', 60)
            //           },
            //           selected: {
            //             rest: {
            //               ref: c('dynamic', 'l', 'button.neutral', 70)
            //             }
            //           }
            //         }
            //       }
            //     }
            //   }
            // }
          }
        }
      }
    }
  }
} as const satisfies DeepOverride<Schema<Segments>>;

export const schema: Schema<Segments> = deepMerge(baseSchema as Schema<Segments>, patch);
