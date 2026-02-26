import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsSchema({
  c,
  transparent
}: CreateMaterial3GoogleTabsSchemaArgs): TabsComponent {
  return {
    options: {
      indicatorPosition: 'bottom'
    },
    elements: {
      // e1: bar
      e1: {
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          borderWidth: 2
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  high: {
                    rest: transparent
                  }
                }
              },
              borderColor: {
                neutral: {
                  high: {
                    rest: c('default', 'l', 'neutral', 10)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  high: {
                    rest: transparent
                  }
                }
              },
              borderColor: {
                neutral: {
                  high: {
                    rest: c('default', 'd', 'neutral', 80)
                  }
                }
              }
            }
          }
        }
      },
      // e2: tab
      e2: {
        scales: {
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 14,
          paddingRight: 14
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  high: {
                    rest: transparent,
                    hover: c('default', 'l', 'neutral', 4),
                    focus: c('default', 'l', 'neutral', 4),
                    pressed: c('default', 'l', 'neutral', 10),
                    selected: {
                      rest: transparent,
                      hover: c('default', 'l', 'neutral', 6),
                      pressed: c('default', 'l', 'neutral', 8)
                    }
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  high: {
                    rest: transparent,
                    hover: c('default', 'd', 'neutral', 86),
                    focus: c('default', 'd', 'neutral', 86),
                    pressed: c('default', 'd', 'neutral', 82),
                    selected: {
                      rest: transparent,
                      hover: c('default', 'd', 'neutral', 86),
                      pressed: c('default', 'd', 'neutral', 82)
                    }
                  }
                }
              }
            }
          }
        }
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
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  high: {
                    rest: c('default', 'l', 'neutral', 40),
                    selected: {
                      rest: c('default', 'l', 'primary.v2', 40)
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                neutral: {
                  high: {
                    rest: c('default', 'd', 'neutral', 80),
                    selected: {
                      rest: c('default', 'd', 'primary.v2', 80)
                    }
                  }
                }
              }
            }
          }
        }
      },
      // e4: icon
      e4: {
        scales: {
          boxWidth: 18,
          boxHeight: 18,
          paddingRight: 8
        },
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  high: {
                    rest: c('default', 'l', 'neutral', 40),
                    selected: {
                      rest: c('default', 'l', 'primary.v2', 40)
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                neutral: {
                  high: {
                    rest: c('default', 'd', 'neutral', 80),
                    selected: {
                      rest: c('default', 'd', 'primary.v2', 80)
                    }
                  }
                }
              }
            }
          }
        }
      },
      // e5: indicator
      e5: {
        scales: {
          boxHeight: 2,
          borderRadius: {
            rounded: 20,
            pill: 20,
            square: 0
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  high: {
                    rest: c('default', 'l', 'primary.v2', 40)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  high: {
                    rest: c('default', 'd', 'primary.v2', 80)
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
