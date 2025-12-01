import {
  breakpoints,
  color,
  type Schema,
  withAlpha
} from '@kiskadee/core';
import { createSegmentBinder } from '../../utils/segmentBinder';
import { segments } from './ios-26-kiskadee.colors';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

const bindSegments = createSegmentBinder(segments, ['default', 'dynamic']);


export const schema: Schema = {
  name: 'iOS',
  prefix: 'ak', // Apple OS by Kiskadee
  version: [26, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  themeTokens: {
    palettes: bindSegments((segment) => ({
      light: {
        focusColor: color(segment, 'l', 'primary', 70)
      }
    }))
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
              's:sm:1': 14,
              's:md:1': {
                'bp:all': 25,
                'bp:lg:1': 17
              },
              's:lg:1': 25
            }
          },
          palettes: bindSegments((segment) => ({
            light: {
              boxColor: {
                primary: {
                  soft: {
                    rest: color(segment, 'l', 'primary', 5),
                    hover: color(segment, 'l', 'primary', 3),
                    focus: color(segment, 'l', 'primary', 5),
                    pressed: color(segment, 'l', 'primary', 8),
                    disabled: color(segment, 'l', 'primary', 5, 20),
                    selected: {
                      rest: color(segment, 'l', 'primary', 50),
                      hover: color(segment, 'l', 'primary', 50, 80),
                      focus: color(segment, 'l', 'primary', 50),
                      pressed: color(segment, 'l', 'primary', 60)
                    }
                  },
                  solid: {
                    rest: color(segment, 'l', 'primary', 50),
                    hover: color(segment, 'l', 'primary', 50, 80),
                    focus: color(segment, 'l', 'primary', 50),
                    pressed: color(segment, 'l', 'primary', 60),
                    disabled: color(segment, 'l', 'primary', 50, 20)
                  }
                },
                neutral: {
                  soft: {
                    rest: color(segment, 'l', 'neutral', 5),
                    hover: color(segment, 'l', 'neutral', 3),
                    focus: color(segment, 'l', 'neutral', 5),
                    pressed: color(segment, 'l', 'neutral', 8),
                    disabled: color(segment, 'l', 'neutral', 5, 20),
                    selected: {
                      rest: color(segment, 'l', 'primary', 50),
                      hover: color(segment, 'l', 'primary', 50, 80),
                      focus: color(segment, 'l', 'primary', 50),
                      pressed: color(segment, 'l', 'primary', 60)
                    }
                  }
                },
                redLike: {
                  soft: {
                    rest: color(segment, 'l', 'redLike', 5),
                    hover: color(segment, 'l', 'redLike', 3),
                    focus: color(segment, 'l', 'redLike', 5),
                    pressed: color(segment, 'l', 'redLike', 8),
                    disabled: color(segment, 'l', 'redLike', 5, 20),
                    selected: {
                      rest: color(segment, 'l', 'redLike', 50),
                      hover: color(segment, 'l', 'redLike', 50, 80),
                      pressed: color(segment, 'l', 'redLike', 60)
                    }
                  },
                  solid: {
                    rest: color(segment, 'l', 'redLike', 50),
                    hover: color(segment, 'l', 'redLike', 50, 80),
                    pressed: color(segment, 'l', 'redLike', 60),
                    disabled: color(segment, 'l', 'redLike', 50, 20),
                    focus: color(segment, 'l', 'redLike', 50)
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
                  soft: {
                    rest: color(segment, 'd', 'redLike', 50, 40),
                    hover: color(segment, 'd', 'redLike', 3),
                    focus: color(segment, 'd', 'redLike', 5),
                    pressed: color(segment, 'd', 'redLike', 8),
                    disabled: color(segment, 'd', 'redLike', 5, 20),
                    selected: {
                      rest: color(segment, 'd', 'redLike', 50),
                      hover: color(segment, 'd', 'redLike', 50, 80),
                      pressed: color(segment, 'd', 'redLike', 60)
                    }
                  },
                  solid: {
                    rest: color(segment, 'd', 'redLike', 50),
                    hover: color(segment, 'd', 'redLike', 50, 80),
                    pressed: color(segment, 'd', 'redLike', 60),
                    disabled: color(segment, 'd', 'redLike', 50, 20),
                    focus: color(segment, 'd', 'redLike', 50)
                  }
                }
              }
            },
            darker: {
              boxColor: {
                redLike: {
                  soft: {
                    rest: color(segment, 'd', 'redLike', 50, 40),
                    hover: color(segment, 'd', 'redLike', 3),
                    focus: color(segment, 'd', 'redLike', 5),
                    pressed: color(segment, 'd', 'redLike', 8),
                    disabled: color(segment, 'd', 'redLike', 5, 20),
                    selected: {
                      rest: color(segment, 'd', 'redLike', 50),
                      hover: color(segment, 'd', 'redLike', 50, 80),
                      pressed: color(segment, 'd', 'redLike', 60)
                    }
                  },
                  solid: {
                    rest: color(segment, 'd', 'redLike', 50),
                    hover: color(segment, 'd', 'redLike', 50, 80),
                    pressed: color(segment, 'd', 'redLike', 60),
                    disabled: color(segment, 'd', 'redLike', 50, 20),
                    focus: color(segment, 'd', 'redLike', 50)
                  }
                }
              }
            }
          })),
        },
        e2: {
          name: 'button-text',
          decorations: {
            textWeight: 'medium'
          },
          palettes: bindSegments((segment) => ({
            light: {
              textColor: {
                primary: {
                  soft: {
                    rest: color(segment, 'l', 'primary', 50),
                    hover: { ref: color(segment, 'l', 'primary', 50, 80) },
                    pressed: { ref: color(segment, 'l', 'primary', 50) },
                    disabled: {
                      ref: color(segment, 'l', 'neutral', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: color(segment, 'l', 'neutral', 0)
                      }
                    }
                  },
                  solid: {
                    rest: color(segment, 'l', 'neutral', 0),
                    pressed: { ref: color(segment, 'l', 'neutral', 0, 50) },
                    disabled: {
                      ref: color(segment, 'l', 'neutral', 0, 20)
                    }
                  }
                },
                neutral: {
                  soft: {
                    rest: color(segment, 'l', 'neutral', 50),
                    hover: { ref: color(segment, 'l', 'neutral', 50, 80) },
                    pressed: { ref: color(segment, 'l', 'neutral', 50) },
                    disabled: {
                      ref: color(segment, 'l', 'neutral', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: color(segment, 'l', 'neutral', 0)
                      }
                    }
                  }
                },
                redLike: {
                  soft: {
                    rest: color(segment, 'l', 'redLike', 50),
                    hover: { ref: color(segment, 'l', 'redLike', 50, 80) },
                    pressed: { ref: color(segment, 'l', 'redLike', 50, 70) },
                    disabled: {
                      ref: color(segment, 'l', 'redLike', 0, 20)
                    },
                    selected: {
                      rest: {
                        ref: color(segment, 'l', 'redLike', 0)
                      }
                    }
                  },
                  solid: {
                    rest: color(segment, 'l', 'neutral', 0),
                    pressed: { ref: color(segment, 'l', 'neutral', 0, 70) },
                    disabled: {
                      ref: color(segment, 'l', 'neutral', 0, 20)
                    }
                  }
                }
              }
            }
          })),
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
    }
  }
};
