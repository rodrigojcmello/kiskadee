import { breakpoints, color, type Schema, withAlpha } from '@kiskadee/core';
import { buildBySegment } from '../../utils/buildBySegment.ts';
import { schemaColors } from './ios-26-apple.colors.ts';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

const segmentNames = ['default'] as const;
export type Segment = (typeof segmentNames)[number];

const schemaContext = { colors: schemaColors };
const iosSwitchOnTrack = color(schemaContext, 'default', 'l', 'switch.neutral', 50);
const iosSwitchOffTrack = [0, 0, 47.059, 0.2] as const;
const iosSwitchThumb = [0, 0, 100, 1] as const;
const transparent = [0, 0, 0, 0] as const;

export const schema: Schema<Segment> = {
  name: 'iOS',
  prefix: 'aos', // Apple OS
  version: [26, 0, 0],
  author: 'Apple',
  breakpoints,
  colors: schemaColors,
  global: {
    fonts: {
      body: ['Roboto', 'sans-serif']
    },
    focus: {
      width: 2,
      offset: 0
    },
    radius: 'rounded'
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
              's:md:1': 16
            },
            paddingBottom: {
              's:md:1': 16
            },
            paddingLeft: {
              's:md:1': 20
            },
            paddingRight: {
              's:md:1': 20
            },
            borderRadius: {
              rounded: {
                's:md:1': 25
              },
              pill: {
                's:md:1': 25
              },
              square: {
                's:md:1': 0
              }
            }
          },
          palettes: {
            default: {
              light: {
                boxColor: {
                  primary: {
                    medium: {
                      rest: color(schemaContext, 'default', 'l', 'button.primary', 5),
                      hover: color(schemaContext, 'default', 'l', 'button.primary', 3),
                      focus: color(schemaContext, 'default', 'l', 'button.primary', 5),
                      pressed: color(schemaContext, 'default', 'l', 'button.primary', 8),
                      disabled: color(schemaContext, 'default', 'l', 'button.primary', 5, 20),
                      selected: {
                        rest: color(schemaContext, 'default', 'l', 'button.primary', 10),
                        hover: color(schemaContext, 'default', 'l', 'button.primary', 8),
                        pressed: color(schemaContext, 'default', 'l', 'button.primary', 20)
                      }
                    },
                    high: {
                      rest: color(schemaContext, 'default', 'l', 'button.primary', 50),
                      hover: color(schemaContext, 'default', 'l', 'button.primary', 50, 80),
                      pressed: color(schemaContext, 'default', 'l', 'button.primary', 60),
                      disabled: color(schemaContext, 'default', 'l', 'button.primary', 50, 20),
                      focus: color(schemaContext, 'default', 'l', 'button.primary', 50),
                      selected: {
                        rest: color(schemaContext, 'default', 'l', 'button.primary', 10),
                        hover: color(schemaContext, 'default', 'l', 'button.primary', 8),
                        pressed: color(schemaContext, 'default', 'l', 'button.primary', 20)
                      }
                    }
                  }
                }
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
        e2: {
          name: 'button-text',
          decorations: {
            textWeight: 'medium'
          },
          palettes: {
            default: {
              light: {
                textColor: {
                  primary: {
                    medium: {
                      rest: color(schemaContext, 'default', 'l', 'button.primary', 50),
                      hover: {
                        ref: color(schemaContext, 'default', 'l', 'button.primary', 50, 80)
                      },
                      pressed: { ref: color(schemaContext, 'default', 'l', 'button.primary', 50) },
                      disabled: {
                        ref: color(schemaContext, 'default', 'l', 'button.neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: color(schemaContext, 'default', 'l', 'button.neutral', 70)
                        }
                      }
                    },
                    high: {
                      rest: color(schemaContext, 'default', 'l', 'button.neutral', 0),
                      disabled: {
                        ref: color(schemaContext, 'default', 'l', 'button.neutral', 0, 20)
                      },
                      selected: {
                        rest: {
                          ref: color(schemaContext, 'default', 'l', 'button.neutral', 70)
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          scales: {
            textSize: {
              's:md:1': 17
            },
            textHeight: {
              's:md:1': 18
            }
          }
        }
      }
    },
    switch: {
      options: {
        variant: 'standard',
        radius: 'pill'
      },
      variants: {
        standard: {
          options: {
            mode: 'base'
          },
          modes: {
            base: {
              elements: {
                e2: {
                  name: 'track',
                  decorations: {
                    borderStyle: 'none'
                  },
                  scales: {
                    boxWidth: {
                      's:sm:3': 36,
                      's:sm:2': 44,
                      's:sm:1': 54,
                      's:md:1': 64,
                      's:lg:1': 80
                    },
                    boxHeight: {
                      's:sm:3': 16,
                      's:sm:2': 20,
                      's:sm:1': 24,
                      's:md:1': 28,
                      's:lg:1': 36
                    },
                    borderWidth: {
                      's:sm:3': 0,
                      's:sm:2': 0,
                      's:sm:1': 0,
                      's:md:1': 0,
                      's:lg:1': 0
                    },
                    borderRadius: {
                      rounded: {
                        's:sm:3': 999,
                        's:sm:2': 999,
                        's:sm:1': 999,
                        's:md:1': 999,
                        's:lg:1': 999
                      },
                      pill: {
                        's:sm:3': 999,
                        's:sm:2': 999,
                        's:sm:1': 999,
                        's:md:1': 999,
                        's:lg:1': 999
                      },
                      square: {
                        's:sm:3': 0,
                        's:sm:2': 0,
                        's:sm:1': 0,
                        's:md:1': 0,
                        's:lg:1': 0
                      }
                    },
                    paddingTop: {
                      's:sm:3': 1.5,
                      's:sm:2': 2,
                      's:sm:1': 2,
                      's:md:1': 2,
                      's:lg:1': 3
                    },
                    paddingRight: {
                      's:sm:3': 1.5,
                      's:sm:2': 2,
                      's:sm:1': 2,
                      's:md:1': 2,
                      's:lg:1': 3
                    },
                    paddingBottom: {
                      's:sm:3': 1.5,
                      's:sm:2': 2,
                      's:sm:1': 2,
                      's:md:1': 2,
                      's:lg:1': 3
                    },
                    paddingLeft: {
                      's:sm:3': 1.5,
                      's:sm:2': 2,
                      's:sm:1': 2,
                      's:md:1': 2,
                      's:lg:1': 3
                    }
                  },
                  palettes: buildBySegment(segmentNames, () => ({
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: iosSwitchOffTrack,
                            hover: { ref: iosSwitchOffTrack },
                            focus: { ref: iosSwitchOffTrack },
                            pressed: { ref: iosSwitchOffTrack },
                            selected: {
                              rest: { ref: iosSwitchOnTrack },
                              hover: { ref: iosSwitchOnTrack },
                              focus: { ref: iosSwitchOnTrack },
                              pressed: { ref: iosSwitchOnTrack }
                            }
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: transparent,
                            hover: { ref: transparent },
                            focus: { ref: transparent },
                            pressed: { ref: transparent },
                            selected: {
                              rest: { ref: transparent },
                              hover: { ref: transparent },
                              focus: { ref: transparent },
                              pressed: { ref: transparent }
                            }
                          }
                        }
                      }
                    }
                  }))
                },
                e3: {
                  name: 'thumb',
                  scales: {
                    boxWidth: {
                      's:sm:3': 21,
                      's:sm:2': 26,
                      's:sm:1': 32,
                      's:md:1': 39,
                      's:lg:1': 47
                    },
                    boxHeight: {
                      's:sm:3': 13,
                      's:sm:2': 16,
                      's:sm:1': 20,
                      's:md:1': 24,
                      's:lg:1': 30
                    },
                    borderRadius: {
                      rounded: {
                        's:sm:3': 999,
                        's:sm:2': 999,
                        's:sm:1': 999,
                        's:md:1': 999,
                        's:lg:1': 999
                      },
                      pill: {
                        's:sm:3': 999,
                        's:sm:2': 999,
                        's:sm:1': 999,
                        's:md:1': 999,
                        's:lg:1': 999
                      },
                      square: {
                        's:sm:3': 0,
                        's:sm:2': 0,
                        's:sm:1': 0,
                        's:md:1': 0,
                        's:lg:1': 0
                      }
                    }
                  },
                  palettes: buildBySegment(segmentNames, () => ({
                    light: {
                      boxColor: {
                        neutral: {
                          medium: {
                            rest: iosSwitchThumb,
                            hover: { ref: iosSwitchThumb },
                            focus: { ref: iosSwitchThumb },
                            pressed: { ref: iosSwitchThumb },
                            selected: {
                              rest: { ref: iosSwitchThumb },
                              hover: { ref: iosSwitchThumb },
                              focus: { ref: iosSwitchThumb },
                              pressed: { ref: iosSwitchThumb }
                            }
                          }
                        }
                      },
                      borderColor: {
                        neutral: {
                          medium: {
                            rest: transparent,
                            selected: {
                              rest: { ref: transparent }
                            }
                          }
                        }
                      }
                    }
                  }))
                },
                e4: {
                  name: 'label',
                  decorations: {
                    textFont: 'body',
                    textWeight: 'normal'
                  },
                  scales: {
                    textSize: {
                      's:md:1': 17
                    },
                    textHeight: {
                      's:md:1': 22
                    },
                    marginLeft: {
                      's:md:1': 12
                    },
                    marginRight: {
                      's:md:1': 12
                    }
                  },
                  palettes: buildBySegment(segmentNames, () => ({
                    light: {
                      textColor: {
                        neutral: {
                          medium: {
                            rest: color(schemaContext, 'default', 'l', 'button.neutral', 100)
                          }
                        }
                      }
                    }
                  }))
                }
              }
            }
          }
        }
      }
    }
  }
};
