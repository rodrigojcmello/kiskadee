import { breakpoints, type Schema, type SchemaColors, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment';
import { createPresetColorGetter } from '../../utils/presetColor';
import {
  componentIntents,
  globalSemantics,
  globalSemanticsBySegment,
  primitiveColors
} from './ios-26-kiskadee.colors';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

const segmentNames = ['default', 'dynamic'] as const;
type SegmentName = (typeof segmentNames)[number];

const schemaColors = {
  primitiveColors,
  globalSemantics,
  globalSemanticsBySegment,
  componentIntents
} as const satisfies SchemaColors;

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;

const c = createPresetColorGetter<SegmentName>(schemaContext);

export const schema: Schema = {
  name: 'iOS',
  prefix: 'ak', // Apple OS by Kiskadee
  version: [26, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  colors: schemaColors,
  global: {
    fonts: {
      body: ['Roboto', 'sans-serif']
    },
    focus: {
      width: 3,
      offset: 0
    },
    radius: 'rounded'
  },
  themeTokens: {
    palettes: buildBySegment(segmentNames, (segmentName) => {
      return {
        light: {
          focusColor: c(segmentName, 'l', 'button.primary', 20)
        }
      };
    })
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
              's:sm:1': 5,
              's:md:1': {
                'bp:all': 16,
                'bp:lg:1': 8
              },
              's:lg:1': 16
            },
            paddingBottom: {
              's:sm:1': 5,
              's:md:1': {
                'bp:all': 16,
                'bp:lg:1': 8
              },
              's:lg:1': 16
            },
            paddingLeft: {
              's:sm:1': 10,
              's:md:1': {
                'bp:all': 20,
                'bp:lg:1': 12
              },
              's:lg:1': 20
            },
            paddingRight: {
              's:sm:1': 10,
              's:md:1': {
                'bp:all': 20,
                'bp:lg:1': 12
              },
              's:lg:1': 20
            },
            borderRadius: {
              rounded: {
                's:sm:1': 14,
                's:md:1': {
                  'bp:all': 25,
                  'bp:lg:1': 17
                },
                's:lg:1': 25
              },
              pill: {
                's:sm:1': 14,
                's:md:1': {
                  'bp:all': 25,
                  'bp:lg:1': 17
                },
                's:lg:1': 25
              },
              square: {
                's:sm:1': 0,
                's:md:1': {
                  'bp:all': 0,
                  'bp:lg:1': 0
                },
                's:lg:1': 0
              }
            }
          },
          palettes: buildBySegment(segmentNames, (segmentName) => {
            return {
              light: {
                boxColor: {
                  primary: {
                    medium: {
                      rest: c(segmentName, 'l', 'button.primary', 5),
                      hover: c(segmentName, 'l', 'button.primary', 3),
                      focus: c(segmentName, 'l', 'button.primary', 5),
                      pressed: c(segmentName, 'l', 'button.primary', 8),
                      disabled: c(segmentName, 'l', 'button.primary', 5, 20),
                      selected: {
                        rest: c(segmentName, 'l', 'button.primary', 50),
                        hover: c(segmentName, 'l', 'button.primary', 50, 80),
                        focus: c(segmentName, 'l', 'button.primary', 50),
                        pressed: c(segmentName, 'l', 'button.primary', 60)
                      }
                    },
                    high: {
                      rest: c(segmentName, 'l', 'button.primary', 50),
                      hover: c(segmentName, 'l', 'button.primary', 50, 80),
                      focus: c(segmentName, 'l', 'button.primary', 50),
                      pressed: c(segmentName, 'l', 'button.primary', 60),
                      disabled: c(segmentName, 'l', 'button.primary', 50, 20)
                    }
                  },
                  neutral: {
                    medium: {
                      rest: c(segmentName, 'l', 'button.neutral', 5),
                      hover: c(segmentName, 'l', 'button.neutral', 3),
                      focus: c(segmentName, 'l', 'button.neutral', 5),
                      pressed: c(segmentName, 'l', 'button.neutral', 8),
                      disabled: c(segmentName, 'l', 'button.neutral', 5, 20),
                      selected: {
                        rest: c(segmentName, 'l', 'button.primary', 50),
                        hover: c(segmentName, 'l', 'button.primary', 50, 80),
                        focus: c(segmentName, 'l', 'button.primary', 50),
                        pressed: c(segmentName, 'l', 'button.primary', 60)
                      }
                    }
                  },
                  redLike: {
                    medium: {
                      rest: c(segmentName, 'l', 'button.destructive', 5),
                      hover: c(segmentName, 'l', 'button.destructive', 3),
                      focus: c(segmentName, 'l', 'button.destructive', 5),
                      pressed: c(segmentName, 'l', 'button.destructive', 8),
                      disabled: c(segmentName, 'l', 'button.destructive', 5, 20),
                      selected: {
                        rest: c(segmentName, 'l', 'button.destructive', 50),
                        hover: c(segmentName, 'l', 'button.destructive', 50, 80),
                        pressed: c(segmentName, 'l', 'button.destructive', 60)
                      }
                    },
                    high: {
                      rest: c(segmentName, 'l', 'button.destructive', 50),
                      hover: c(segmentName, 'l', 'button.destructive', 50, 80),
                      pressed: c(segmentName, 'l', 'button.destructive', 60),
                      disabled: c(segmentName, 'l', 'button.destructive', 50, 20),
                      focus: c(segmentName, 'l', 'button.destructive', 50)
                    }
                  }
                },
                effects: {
                  shadow: {
                    x: { rest: 0, hover: 0, pressed: 0, focus: 0, disabled: 0 },
                    y: { rest: 2, hover: 4, pressed: 0, focus: 4, disabled: 0 },
                    blur: { rest: 6, hover: 10, pressed: 0, focus: 10, disabled: 0 },
                    color: {
                      rest: withAlpha([0, 0, 0, 1], 28),
                      hover: withAlpha([0, 0, 0, 1], 35),
                      pressed: withAlpha([0, 0, 0, 1], 32),
                      focus: withAlpha([0, 0, 0, 1], 35),
                      disabled: withAlpha([0, 0, 0, 1], 0)
                    }
                  }
                }
              },
              dark: {
                boxColor: {
                  redLike: {
                    medium: {
                      rest: c(segmentName, 'd', 'button.destructive', 50, 40),
                      hover: c(segmentName, 'd', 'button.destructive', 3),
                      focus: c(segmentName, 'd', 'button.destructive', 5),
                      pressed: c(segmentName, 'd', 'button.destructive', 8),
                      disabled: c(segmentName, 'd', 'button.destructive', 5, 20),
                      selected: {
                        rest: c(segmentName, 'd', 'button.destructive', 50),
                        hover: c(segmentName, 'd', 'button.destructive', 50, 80),
                        pressed: c(segmentName, 'd', 'button.destructive', 60)
                      }
                    },
                    high: {
                      rest: c(segmentName, 'd', 'button.destructive', 50),
                      hover: c(segmentName, 'd', 'button.destructive', 50, 80),
                      pressed: c(segmentName, 'd', 'button.destructive', 60),
                      disabled: c(segmentName, 'd', 'button.destructive', 50, 20),
                      focus: c(segmentName, 'd', 'button.destructive', 50)
                    }
                  }
                }
              },
              darker: {
                boxColor: {
                  redLike: {
                    medium: {
                      rest: c(segmentName, 'd', 'button.destructive', 50, 40),
                      hover: c(segmentName, 'd', 'button.destructive', 3),
                      focus: c(segmentName, 'd', 'button.destructive', 5),
                      pressed: c(segmentName, 'd', 'button.destructive', 8),
                      disabled: c(segmentName, 'd', 'button.destructive', 5, 20),
                      selected: {
                        rest: c(segmentName, 'd', 'button.destructive', 50),
                        hover: c(segmentName, 'd', 'button.destructive', 50, 80),
                        pressed: c(segmentName, 'd', 'button.destructive', 60)
                      }
                    },
                    high: {
                      rest: c(segmentName, 'd', 'button.destructive', 50),
                      hover: c(segmentName, 'd', 'button.destructive', 50, 80),
                      pressed: c(segmentName, 'd', 'button.destructive', 60),
                      disabled: c(segmentName, 'd', 'button.destructive', 50, 20),
                      focus: c(segmentName, 'd', 'button.destructive', 50)
                    }
                  }
                }
              }
            };
          })
        },
        e2: {
          name: 'button-text',
          decorations: {
            textWeight: 'medium'
          },
          palettes: buildBySegment(segmentNames, (segmentName) => {
            return {
              light: {
                textColor: {
                  primary: {
                    medium: {
                      rest: c(segmentName, 'l', 'button.primary', 50),
                      hover: { ref: c(segmentName, 'l', 'button.primary', 50, 80) },
                      pressed: { ref: c(segmentName, 'l', 'button.primary', 50) },
                      disabled: {
                        ref: c(segmentName, 'l', 'button.neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: c(segmentName, 'l', 'button.neutral', 0)
                        }
                      }
                    },
                    high: {
                      rest: c(segmentName, 'l', 'button.neutral', 0),
                      pressed: { ref: c(segmentName, 'l', 'button.neutral', 0, 50) },
                      disabled: {
                        ref: c(segmentName, 'l', 'button.neutral', 0, 20)
                      }
                    }
                  },
                  neutral: {
                    medium: {
                      rest: c(segmentName, 'l', 'button.neutral', 50),
                      hover: { ref: c(segmentName, 'l', 'button.neutral', 50, 80) },
                      pressed: { ref: c(segmentName, 'l', 'button.neutral', 50) },
                      disabled: {
                        ref: c(segmentName, 'l', 'button.neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: c(segmentName, 'l', 'button.neutral', 0)
                        }
                      }
                    }
                  },
                  redLike: {
                    medium: {
                      rest: c(segmentName, 'l', 'button.destructive', 50),
                      hover: { ref: c(segmentName, 'l', 'button.destructive', 50, 80) },
                      pressed: { ref: c(segmentName, 'l', 'button.destructive', 50, 70) },
                      disabled: {
                        ref: c(segmentName, 'l', 'button.destructive', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: c(segmentName, 'l', 'button.destructive', 0)
                        }
                      }
                    },
                    high: {
                      rest: c(segmentName, 'l', 'button.neutral', 0),
                      pressed: { ref: c(segmentName, 'l', 'button.neutral', 0, 70) },
                      disabled: {
                        ref: c(segmentName, 'l', 'button.neutral', 0, 20)
                      }
                    }
                  }
                }
              }
            };
          }),
          scales: {
            textSize: {
              's:sm:1': 15,
              's:md:1': 17,
              's:lg:1': 17
            },
            textHeight: {
              's:sm:1': 18,
              's:md:1': 18,
              's:lg:1': 18
            }
          }
        }
      }
    },
    tabs: {
      options: {
        variant: 'box',
        indicatorShape: 'rounded',
        indicatorPosition: 'bottom',
        separator: true
      },
      variants: {
        box: {
          elements: {
            // e1: bar
            e1: {
              decorations: {
                borderStyle: 'solid'
              },
              scales: {
                borderWidth: 1,
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                paddingRight: 4,
                borderRadius: {
                  rounded: {
                    's:sm:1': 10,
                    's:md:1': 10,
                    's:lg:1': 10
                  },
                  pill: {
                    's:sm:1': 999,
                    's:md:1': {
                      'bp:all': 999,
                      'bp:lg:1': 999
                    },
                    's:lg:1': 999
                  },
                  square: {
                    's:sm:1': 0,
                    's:md:1': {
                      'bp:all': 0,
                      'bp:lg:1': 0
                    },
                    's:lg:1': 0
                  }
                }
              },
              palettes: buildBySegment(segmentNames, (segmentName) => {
                return {
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: c(segmentName, 'l', 'neutral', 4)
                        }
                      }
                    },
                    borderColor: {
                      neutral: {
                        medium: {
                          rest: c(segmentName, 'l', 'neutral', 10)
                        }
                      }
                    }
                  }
                };
              })
            },
            // e2: tab
            e2: {
              scales: {
                paddingTop: 6,
                paddingBottom: 6,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: {
                  rounded: {
                    's:sm:1': 8,
                    's:md:1': 8,
                    's:lg:1': 8
                  },
                  pill: {
                    's:sm:1': 999,
                    's:md:1': {
                      'bp:all': 999,
                      'bp:lg:1': 999
                    },
                    's:lg:1': 999
                  },
                  square: {
                    's:sm:1': 0,
                    's:md:1': {
                      'bp:all': 0,
                      'bp:lg:1': 0
                    },
                    's:lg:1': 0
                  }
                }
              },
              palettes: buildBySegment(segmentNames, (segmentName) => {
                return {
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: [0, 0, 0, 0],
                          hover: c(segmentName, 'l', 'neutral', 6),
                          pressed: c(segmentName, 'l', 'neutral', 8),
                          selected: {
                            rest: [0, 0, 0, 0],
                            hover: [0, 0, 0, 0],
                            pressed: [0, 0, 0, 0]
                          }
                        }
                      }
                    }
                  }
                };
              })
            },
            // e3: label
            e3: {
              decorations: {
                textWeight: 'medium'
              },
              scales: {
                textSize: 14,
                textHeight: 20
              },
              palettes: buildBySegment(segmentNames, (segmentName) => {
                return {
                  light: {
                    textColor: {
                      neutral: {
                        high: {
                          rest: c(segmentName, 'l', 'neutral', 70),
                          selected: {
                            rest: c(segmentName, 'l', 'neutral', 90)
                          }
                        }
                      }
                    }
                  }
                };
              })
            },
            // e4: icon
            e4: {
              scales: {
                boxWidth: 18,
                boxHeight: 18,
                paddingRight: 8
              },
              palettes: buildBySegment(segmentNames, (segmentName) => {
                return {
                  light: {
                    textColor: {
                      neutral: {
                        high: {
                          rest: c(segmentName, 'l', 'neutral', 70),
                          selected: {
                            rest: c(segmentName, 'l', 'neutral', 90)
                          }
                        }
                      }
                    }
                  }
                };
              })
            },
            // e5: indicator (background)
            e5: {
              scales: {
                borderRadius: {
                  rounded: {
                    's:sm:1': 8,
                    's:md:1': 8,
                    's:lg:1': 8
                  },
                  pill: {
                    's:sm:1': 999,
                    's:md:1': {
                      'bp:all': 999,
                      'bp:lg:1': 999
                    },
                    's:lg:1': 999
                  },
                  square: {
                    's:sm:1': 0,
                    's:md:1': {
                      'bp:all': 0,
                      'bp:lg:1': 0
                    },
                    's:lg:1': 0
                  }
                }
              },
              effects: {
                shadow: {
                  x: { rest: 0 },
                  y: { rest: 1 },
                  blur: { rest: 3 },
                  color: {
                    rest: withAlpha([0, 0, 0, 1], 20)
                  }
                }
              },
              palettes: buildBySegment(segmentNames, (segmentName) => {
                return {
                  light: {
                    boxColor: {
                      neutral: {
                        high: {
                          rest: c(segmentName, 'l', 'neutral', 0),
                          hover: c(segmentName, 'l', 'neutral', 2),
                          pressed: c(segmentName, 'l', 'neutral', 6)
                        }
                      }
                    }
                  }
                };
              })
            },
            // e6: separator (between tabs)
            e6: {
              scales: {
                boxWidth: 1,
                boxHeight: 16
              },
              palettes: buildBySegment(segmentNames, (segmentName) => {
                return {
                  light: {
                    boxColor: {
                      neutral: {
                        medium: {
                          rest: c(segmentName, 'l', 'neutral', 100, 10)
                        }
                      }
                    }
                  }
                };
              })
            }
          }
        }
      }
    }
  }
};
