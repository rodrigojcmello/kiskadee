import { primitive, type Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type Material3GoogleSegmentName = 'default' | 'dynamic';
type ButtonComponent = NonNullable<Schema<never>['components']['button']>;

type CreateMaterial3GoogleButtonSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames: readonly Material3GoogleSegmentName[];
  transparent: string;
};

export function createMaterial3GoogleButtonSchema({
  c,
  segmentNames,
  transparent
}: CreateMaterial3GoogleButtonSchemaArgs): ButtonComponent {
  return {
    effects: {
      activationFeedback: {
        profile: 'ripple',
        origin: 'pointer',
        visual: {
          layer: 'overlay',
          paint: 'field',
          tone: {
            default: 'subtle'
          }
        },
        profiles: {
          halo: {
            size: 80
          }
        }
      },
      shadow: {
        e1: {
          kind: 'outer',
          states: {
            rest: 's:sm:1',
            hover: 's:md:1',
            focus: 's:sm:1',
            pressed: false,
            disabled: false
          }
        }
      }
    },
    elements: {
      e1: {
        name: 'button',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          paddingTop: {
            's:sm:1': 8,
            's:md:1': 10,
            's:lg:1': 16,
            's:lg:2': 32,
            's:lg:3': 48
          },
          paddingBottom: {
            's:sm:1': 8,
            's:md:1': 10,
            's:lg:1': 16,
            's:lg:2': 32,
            's:lg:3': 48
          },
          paddingLeft: {
            's:sm:1': 12,
            's:md:1': 16,
            's:lg:1': 24,
            's:lg:2': 48,
            's:lg:3': 64
          },
          paddingRight: {
            's:sm:1': 12,
            's:md:1': 16,
            's:lg:1': 24,
            's:lg:2': 48,
            's:lg:3': 64
          },
          borderWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1,
            's:lg:2': 1,
            's:lg:3': 1
          },
          borderRadius: {
            rounded: {
              's:sm:1': 18,
              's:md:1': 20,
              's:lg:1': 28,
              's:lg:2': 48,
              's:lg:3': 68
            },
            pill: {
              's:sm:1': 18,
              's:md:1': 20,
              's:lg:1': 28,
              's:lg:2': 48,
              's:lg:3': 68
            },
            square: {
              's:sm:1': 0,
              's:md:1': 0,
              's:lg:1': 0,
              's:lg:2': 0,
              's:lg:3': 0
            }
          }
        },
        palettes: buildBySegment(segmentNames, (s) => {
          return {
            light: {
              onSubtle: {
                boxColor: {
                  primary: {
                    // It matches Material "filled button"
                    // verified: 2026-01-31 | Figma v1.23
                    high: {
                      rest: c(s, 'l', 'button.primary', 60), // =
                      focus: c(s, 'l', 'button.primary', 55), // !
                      hover: c(s, 'l', 'button.primary', 55), // !
                      pressed: c(s, 'l', 'button.primary', 55), // !
                      disabled: c(s, 'l', 'button.neutral', 90, 10) // match
                    },
                    // It matches Material "toggle button (normal* / elevated*)"
                    // verified: 2026-01-31 | Figma v1.23
                    medium: {
                      rest: c(s, 'l', 'button.neutral', 4), // =
                      focus: c(s, 'l', 'button.neutral', 6), // !
                      hover: c(s, 'l', 'button.neutral', 6), // !
                      pressed: c(s, 'l', 'button.neutral', 6), // !
                      disabled: c(s, 'l', 'button.neutral', 90, 10), // =
                      selected: {
                        rest: c(s, 'l', 'button.primary', 60), // =
                        hover: c(s, 'l', 'button.primary', 55),
                        pressed: c(s, 'l', 'button.primary', 55)
                      }
                    },
                    // It matches Material "outlined button (primary*)"
                    // verified: 2026-02-01 | Figma v1.23
                    low: {
                      rest: transparent, // match
                      focus: c(s, 'l', 'button.neutral', 2),
                      hover: c(s, 'l', 'button.neutral', 2),
                      pressed: c(s, 'l', 'button.neutral', 2),
                      disabled: c(s, 'l', 'button.neutral', 90, 10), // match
                      selected: {
                        rest: c(s, 'l', 'button.neutral', 60), // match
                        hover: c(s, 'l', 'button.neutral', 55),
                        pressed: c(s, 'l', 'button.neutral', 55)
                      }
                    },
                    // It matches Material "button text"
                    // verified: 2026-02-02 | Figma v1.23
                    lowest: {
                      rest: transparent, // =
                      focus: c(s, 'l', 'button.primary', 60, 8), // =
                      hover: c(s, 'l', 'button.primary', 60, 8), // !
                      pressed: c(s, 'l', 'button.primary', 60, 8), // !
                      disabled: c(s, 'l', 'button.neutral', 90, 10) // =
                    }
                  },
                  neutral: {
                    high: {
                      rest: c(s, 'l', 'primary.v2', 60),
                      focus: c(s, 'l', 'primary.v2', 55),
                      hover: c(s, 'l', 'primary.v2', 55),
                      pressed: c(s, 'l', 'primary.v2', 55),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12),
                      selected: {
                        rest: c(s, 'l', 'primary.v2', 50),
                        hover: c(s, 'l', 'primary.v2', 40),
                        pressed: c(s, 'l', 'primary.v2', 60)
                      }
                    },
                    medium: {
                      rest: c(s, 'l', 'neutral', 10),
                      focus: c(s, 'l', 'neutral', 6),
                      hover: c(s, 'l', 'neutral', 6),
                      pressed: c(s, 'l', 'neutral', 6),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12),
                      selected: {
                        rest: c(s, 'l', 'neutral', 60),
                        hover: c(s, 'l', 'neutral', 55),
                        pressed: c(s, 'l', 'neutral', 65)
                      }
                    },
                    low: {
                      rest: transparent,
                      focus: c(s, 'l', 'neutral', 2),
                      hover: c(s, 'l', 'neutral', 2),
                      pressed: c(s, 'l', 'neutral', 2),
                      disabled: transparent,
                      selected: {
                        rest: c(s, 'l', 'neutral', 60),
                        hover: c(s, 'l', 'neutral', 55),
                        pressed: c(s, 'l', 'neutral', 65)
                      }
                    },
                    lowest: {
                      rest: transparent,
                      focus: c(s, 'l', 'neutral', 2),
                      hover: c(s, 'l', 'neutral', 2),
                      pressed: c(s, 'l', 'neutral', 2),
                      disabled: transparent
                    }
                  }
                },
                borderColor: {
                  primary: {
                    // It matches Material "filled button"
                    // verified: 2026-02-01 | Figma v1.23
                    high: {
                      rest: transparent, // match
                      focus: transparent, // match
                      hover: transparent, // match
                      pressed: transparent, // match
                      disabled: transparent // match
                    },
                    // It matches Material "toggle button (normal* / elevated*)"
                    // verified: 2026-02-01 | Figma v1.23
                    medium: {
                      rest: transparent, // match
                      focus: transparent, // match
                      hover: transparent, // match
                      pressed: transparent, // match
                      disabled: transparent // match
                    },
                    // It matches Material "outlined button (primary*)"
                    // verified: 2026-02-01 | Figma v1.23
                    low: {
                      rest: c(s, 'l', 'button.neutral.v2', 20), // match
                      focus: c(s, 'l', 'button.neutral.v2', 20),
                      hover: c(s, 'l', 'button.neutral.v2', 20),
                      pressed: c(s, 'l', 'button.neutral.v2', 20),
                      disabled: c(s, 'l', 'button.neutral.v2', 20), // match
                      selected: {
                        rest: transparent // match
                      }
                    },
                    // It matches Material "button text"
                    // verified: 2026-02-02 | Figma v1.23
                    lowest: {
                      rest: transparent // =
                    }
                  },
                  neutral: {
                    high: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    medium: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    low: {
                      rest: c(s, 'l', 'neutral', 16),
                      focus: c(s, 'l', 'neutral', 16),
                      hover: c(s, 'l', 'neutral', 10),
                      pressed: c(s, 'l', 'neutral', 20),
                      disabled: c(s, 'l', 'neutral', 16)
                    },
                    lowest: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    }
                  }
                }
              }
            },
            dark: {
              onSubtle: {
                boxColor: {
                  primary: {
                    medium: {
                      rest: c(s, 'd', 'button.primary', 10),
                      hover: c(s, 'd', 'button.primary', 8),
                      pressed: c(s, 'd', 'button.primary', 14),
                      focus: c(s, 'd', 'button.primary', 10),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12),
                      selected: {
                        rest: c(s, 'd', 'button.primary', 50),
                        hover: c(s, 'd', 'button.primary', 40),
                        pressed: c(s, 'd', 'button.primary', 60)
                      }
                    },
                    high: {
                      rest: c(s, 'd', 'button.primary', 30),
                      hover: c(s, 'd', 'button.primary', 35),
                      pressed: c(s, 'd', 'button.primary', 26),
                      focus: c(s, 'd', 'button.primary', 30),
                      disabled: c(s, 'l', 'primitive.black.v1', 90, 12)
                    },
                    low: {
                      rest: transparent,
                      focus: c(s, 'd', 'button.primary', 10),
                      hover: c(s, 'd', 'button.primary', 8),
                      pressed: c(s, 'd', 'button.primary', 14),
                      disabled: transparent,
                      selected: {
                        rest: c(s, 'd', 'button.primary', 50),
                        hover: c(s, 'd', 'button.primary', 40),
                        pressed: c(s, 'd', 'button.primary', 60)
                      }
                    },
                    lowest: {
                      rest: transparent,
                      focus: c(s, 'd', 'button.primary', 10),
                      hover: c(s, 'd', 'button.primary', 8),
                      pressed: c(s, 'd', 'button.primary', 14),
                      disabled: transparent
                    }
                  }
                },
                borderColor: {
                  primary: {
                    high: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    medium: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    },
                    low: {
                      rest: c(s, 'd', 'button.primary', 30),
                      focus: c(s, 'd', 'button.primary', 30),
                      hover: c(s, 'd', 'button.primary', 35),
                      pressed: c(s, 'd', 'button.primary', 26),
                      disabled: transparent
                    },
                    lowest: {
                      rest: transparent,
                      focus: transparent,
                      hover: transparent,
                      pressed: transparent,
                      disabled: transparent
                    }
                  }
                }
              }
            }
          };
        }),
        effects: {
          // Material Design 3 interaction-driven shape. Border radius decreases as interaction intensifies
          // (rest > hover/focus > pressed), emulating MD3 "animated corners". This enables Kiskadee to
          // generate stateful CSS for rounded corners.
          borderRadius: {
            rounded: {
              rest: 20,
              hover: 14,
              pressed: 10,
              focus: 14,
              selected: {
                rest: 16,
                hover: 14,
                pressed: 10,
                focus: 14
              }
            },
            pill: {
              rest: 20,
              hover: 14,
              pressed: 10,
              focus: 14,
              selected: {
                rest: 16,
                hover: 14,
                pressed: 10,
                focus: 14
              }
            },
            square: {
              rest: 20,
              hover: 14,
              pressed: 10,
              focus: 14,
              selected: {
                rest: 16,
                hover: 14,
                pressed: 10,
                focus: 14
              }
            }
          }
        }
      },
      e2: {
        name: 'button-text',
        typography: {
          's:sm:1': 'label-large',
          's:md:1': 'label-large',
          's:lg:1': 'label-extra-large',
          's:lg:2': 'label-display-small',
          's:lg:3': 'label-display-large'
        },
        palettes: buildBySegment(segmentNames, (s) => {
          return {
            light: {
              onSubtle: {
                textColor: {
                  primary: {
                    // It matches Material "filled button"
                    // verified: 2026-01-31 | Figma v1.23
                    high: {
                      rest: c(s, 'l', 'button.neutral', 0), // match
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // match
                      }
                    },
                    // It matches Material "toggle button (normal* / elevated*)"
                    // verified: 2026-01-31 | Figma v1.23
                    medium: {
                      rest: c(s, 'l', 'button.primary', 60), // match
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // match
                      },
                      selected: {
                        rest: {
                          ref: c(s, 'l', 'button.neutral', 0) // match
                        }
                      }
                    },
                    // It matches Material "outline button (primary*)"
                    // verified: 2026-02-01 | Figma v1.23
                    low: {
                      rest: c(s, 'l', 'button.primary', 60),
                      hover: { ref: c(s, 'l', 'button.primary', 55) },
                      pressed: { ref: c(s, 'l', 'button.primary', 70) },
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // match
                      },
                      selected: {
                        rest: {
                          ref: c(s, 'l', 'button.neutral', 0) // match
                        }
                      }
                    },
                    // It matches Material "button text"
                    // verified: 2026-02-02 | Figma v1.23
                    lowest: {
                      rest: c(s, 'l', 'button.primary', 60), // =
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38) // =
                      }
                    }
                  },
                  neutral: {
                    high: {
                      rest: c(s, 'l', 'button.neutral', 0),
                      disabled: {
                        ref: c(s, 'l', 'button.neutral', 90, 38)
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
                    medium: {
                      rest: c(s, 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
                      }
                    },
                    high: {
                      rest: c(s, 'd', primitive('black', 'v1'), 0),
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
                      }
                    },
                    low: {
                      rest: c(s, 'd', 'button.primary', 30),
                      hover: { ref: c(s, 'd', 'button.primary', 35) },
                      pressed: { ref: c(s, 'd', 'button.primary', 26) },
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
                      }
                    },
                    lowest: {
                      rest: c(s, 'd', 'button.primary', 30),
                      hover: { ref: c(s, 'd', 'button.primary', 35) },
                      pressed: { ref: c(s, 'd', 'button.primary', 26) },
                      disabled: {
                        ref: c(s, 'd', 'button.neutral', 60)
                      }
                    }
                  }
                }
              }
            }
          };
        })
      },
      e3: {
        name: 'button-icon',
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1',
          's:lg:2': 's:lg:2',
          's:lg:3': 's:lg:3'
        }
      }
    }
  };
}
