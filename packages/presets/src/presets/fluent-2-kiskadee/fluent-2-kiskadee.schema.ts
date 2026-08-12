import { breakpoints, color, primitive, type Schema, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment.ts';
import { createPresetColorGetter } from '../../utils/presetColor.ts';
import { schemaColors } from './fluent-2-kiskadee.colors.ts';
import { fluent2KiskadeeTypography } from './fluent-2-kiskadee.typography.ts';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;

const segmentNames = ['default', 'modern', 'dynamic'] as const;
type SegmentName = (typeof segmentNames)[number];

const c = createPresetColorGetter<SegmentName>(schemaContext);

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = 'modern';

export const schema: Schema<Segments> = {
  name: 'Fluent',
  prefix: 'fk', // Fluent by Kiskadee
  version: [2, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  colors: schemaColors,
  global: {
    typography: fluent2KiskadeeTypography,
    iconSizes: {
      's:sm:1': 16,
      's:md:1': 20,
      's:lg:1': 24
    },
    icons: {
      family: 'fluent-system',
      variant: 'regular'
    },
    focus: {
      width: 2,
      offset: 1
    },
    radius: 'rounded'
  },
  themeTokens: {
    palettes: {
      default: {
        light: {
          focusColor: color(schemaContext, 'default', 'l', primitive('black', 'v1'), 100)
        },
        dark: {
          focusColor: color(schemaContext, 'default', 'd', primitive('black', 'v1'), 100),
          background: '#1f1f1f'
        }
      },
      modern: {
        light: {
          focusColor: color(schemaContext, 'modern', 'l', 'primitive.purple.v1', 40)
        }
      }
    }
  },
  components: {
    button: {
      elements: {
        e1: {
          name: 'button',
          decorations: {
            borderStyle: 'none'
          },
          scales: {
            paddingTop: {
              's:sm:1': 2,
              's:md:1': 6,
              's:lg:1': 8
            },
            paddingBottom: {
              's:sm:1': 2,
              's:md:1': 6,
              's:lg:1': 8
            },
            paddingLeft: {
              's:sm:1': 8,
              's:md:1': 12,
              's:lg:1': 16
            },
            paddingRight: {
              's:sm:1': 8,
              's:md:1': 12,
              's:lg:1': 16
            },
            borderRadius: {
              rounded: {
                's:sm:1': 4,
                's:md:1': 4,
                's:lg:1': 4
              },
              pill: {
                's:sm:1': 4,
                's:md:1': 4,
                's:lg:1': 4
              },
              square: {
                's:sm:1': 0,
                's:md:1': 0,
                's:lg:1': 0
              }
            }
          },
          palettes: buildBySegment(
            segmentNames,
            (segmentName) => {
              // NOTE: For now, the `dynamic` segment is expected to be solid-only.
              // Gradient support for dynamic segments will be added later.
              return {
                light: {
                  onSubtle: {
                    boxColor: {
                      primary: {
                        high: {
                          rest: c(segmentName, 'l', 'button.primary', 60),
                          hover: c(segmentName, 'l', 'button.primary', 70),
                          focus: c(segmentName, 'l', 'button.primary', 60),
                          pressed: c(segmentName, 'l', 'button.primary', 90),
                          disabled: c(segmentName, 'l', 'button.neutral', 6),
                          selected: {
                            rest: c(segmentName, 'l', 'button.primary', 80),
                            hover: c(segmentName, 'l', 'button.primary', 70),
                            pressed: c(segmentName, 'l', 'button.primary', 90)
                          }
                        }
                      }
                    }
                  }
                },
                dark: {
                  onSubtle: {
                    boxColor: {
                      primary: {
                        high: {
                          rest: c(segmentName, 'd', 'button.primary', 70),
                          hover: c(segmentName, 'd', 'button.primary', 60),
                          focus: c(segmentName, 'd', 'button.primary', 70),
                          pressed: c(segmentName, 'd', 'button.primary', 90),
                          disabled: c(segmentName, 'd', 'button.neutral', 0, 40),
                          selected: {
                            rest: c(segmentName, 'd', 'button.primary', 80),
                            hover: c(segmentName, 'd', 'button.primary', 70),
                            pressed: c(segmentName, 'd', 'button.primary', 90)
                          }
                        }
                      }
                    }
                  }
                }
              };
            },
            {
              modern: (segmentName) => ({
                light: {
                  onSubtle: {
                    boxColor: {
                      primary: {
                        high: {
                          rest: c(segmentName, 'l', 'button.primary.gradient', 26),
                          hover: c(segmentName, 'l', 'button.primary.gradient', 20),
                          focus: c(segmentName, 'l', 'button.primary.gradient', 5),
                          pressed: c(segmentName, 'l', 'button.primary.gradient', 30),
                          disabled: c(segmentName, 'l', 'button.neutral.gradient', [8, 6]),
                          selected: {
                            rest: c(segmentName, 'l', 'button.primary.gradient', 80),
                            hover: c(segmentName, 'l', 'button.primary.gradient', 70),
                            pressed: c(segmentName, 'l', 'button.primary.gradient', 90)
                          }
                        }
                      }
                    }
                  }
                },
                dark: {
                  onSubtle: {
                    boxColor: {
                      primary: {
                        high: {
                          rest: c(segmentName, 'd', 'button.primary.gradient', 26),
                          hover: c(segmentName, 'd', 'button.primary.gradient', 60),
                          focus: c(segmentName, 'd', 'button.primary.gradient', 70),
                          pressed: c(segmentName, 'd', 'button.primary.gradient', 90),
                          selected: {
                            rest: c(segmentName, 'd', 'button.primary.gradient', 80),
                            hover: c(segmentName, 'd', 'button.primary.gradient', 70),
                            pressed: c(segmentName, 'd', 'button.primary.gradient', 90)
                          }
                        }
                      }
                    }
                  }
                }
              })
            }
          ),
          effects: {
            shadow: {
              x: { rest: 0, hover: 0, pressed: 0, focus: 0, disabled: 0 },
              y: { rest: 2, hover: 4, pressed: 0, focus: 4, disabled: 0 },
              blur: { rest: 6, hover: 10, pressed: 0, focus: 10, disabled: 0 },
              color: {
                rest: withAlpha('#000000', 28),
                hover: withAlpha('#000000', 35),
                pressed: withAlpha('#000000', 32),
                focus: withAlpha('#000000', 35),
                disabled: withAlpha('#000000', 0)
              }
            }
          }
        },
        e2: {
          name: 'button-text',
          typography: {
            's:sm:1': 'label-small',
            's:md:1': 'label-medium',
            's:lg:1': 'label-large'
          },
          palettes: buildBySegment(
            segmentNames,
            (segmentName) => {
              return {
                light: {
                  onSubtle: {
                    textColor: {
                      primary: {
                        high: {
                          rest: c(segmentName, 'l', 'button.neutral', 0),
                          disabled: {
                            ref: c(segmentName, 'l', 'button.neutral', 26)
                          }
                        }
                      }
                    }
                  }
                },
                dark: {
                  onSubtle: {
                    textColor: {
                      primary: {
                        high: {
                          rest: c(segmentName, 'd', 'button.neutral', 100),
                          disabled: {
                            ref: c(segmentName, 'd', 'button.neutral', 100, 25)
                          }
                        }
                      }
                    }
                  }
                }
              };
            },
            {
              modern: (segmentName) => ({
                light: {
                  onSubtle: {
                    textColor: {
                      primary: {
                        high: {
                          rest: c(segmentName, 'l', 'button.neutral', 0),
                          hover: {
                            ref: c(segmentName, 'l', 'button.neutral', 0)
                          },
                          focus: {
                            ref: c(segmentName, 'l', 'primitive.purple.v2', 45)
                          },
                          pressed: {
                            ref: c(segmentName, 'l', 'button.neutral', 0, 80)
                          },
                          disabled: {
                            ref: c(segmentName, 'l', 'button.neutral', 100, 25)
                          }
                        }
                      }
                    }
                  }
                }
              })
            }
          )
        },
        e3: {
          name: 'button-icon',
          iconSize: {
            's:sm:1': 's:sm:1',
            's:md:1': 's:md:1',
            's:lg:1': 's:lg:1'
          }
        }
      }
    }
  }
};
