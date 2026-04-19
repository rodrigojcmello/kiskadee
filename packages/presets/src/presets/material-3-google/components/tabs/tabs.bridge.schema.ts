import { type Schema, withAlpha } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
  white: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsBridgeVariant({
  c,
  transparent,
  white
}: CreateMaterial3GoogleTabsVariantArgs): NonNullable<
  NonNullable<TabsComponent['variants']>['bridge']
> {
  return {
    options: {
      variant: 'bridge',
      indicatorShape: 'bridge',
      lowerCurve: 'curved'
    },
    elements: {
      // e1: bar
      e1: {
        scales: {
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 8,
          paddingRight: 8
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: transparent
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: transparent
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
          boxWidth: {
            's:sm:1': 120,
            's:md:1': 144,
            's:lg:1': 160
          },
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: {
            rounded: {
              's:sm:1': 12,
              's:md:1': 12,
              's:lg:1': 12
            }
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: [36, 100, 57, 1],
                    hover: [37, 100, 65, 1],
                    focus: [36, 100, 57, 1],
                    pressed: [35, 90, 50, 1],
                    selected: {
                      rest: transparent,
                      hover: transparent,
                      focus: transparent,
                      pressed: transparent
                    }
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: [36, 78, 42, 1],
                    hover: [36, 80, 48, 1],
                    focus: [36, 78, 42, 1],
                    pressed: [36, 76, 36, 1],
                    selected: {
                      rest: transparent,
                      hover: transparent,
                      focus: transparent,
                      pressed: transparent
                    }
                  }
                }
              }
            }
          }
        },
        effects: {
          shadow: {
            x: { rest: 0 },
            y: { rest: 0 },
            blur: { rest: 4 },
            color: {
              rest: withAlpha([0, 0, 0, 1], 20)
            }
          }
        }
      },
      // e3: label
      e3: {
        decorations: {
          textWeight: 'extraBold'
        },
        scales: {
          textSize: 18,
          textHeight: 22
        },
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  medium: {
                    rest: [24, 100, 12, 1],
                    selected: {
                      rest: [0, 0, 7, 1]
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                neutral: {
                  medium: {
                    rest: [38, 100, 88, 1],
                    selected: {
                      rest: white
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
          boxWidth: 24,
          boxHeight: 24,
          paddingRight: 8
        },
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  medium: {
                    rest: [24, 100, 12, 1],
                    selected: {
                      rest: [0, 0, 7, 1]
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                neutral: {
                  medium: {
                    rest: [38, 100, 88, 1],
                    selected: {
                      rest: white
                    }
                  }
                }
              }
            }
          }
        }
      },
      // e5: selected shell
      e5: {
        scales: {
          borderRadius: {
            rounded: {
              's:sm:1': 12,
              's:md:1': 12,
              's:lg:1': 12
            }
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: [43, 100, 99, 1],
                    hover: [39, 100, 95, 1],
                    focus: [43, 100, 99, 1],
                    pressed: [38, 100, 92, 1]
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'neutral', 8)
                  }
                }
              }
            }
          }
        },
        effects: {
          shadow: {
            x: { rest: 0 },
            y: { rest: 0 },
            blur: { rest: 4 },
            color: {
              rest: withAlpha([0, 0, 0, 1], 20)
            }
          }
        }
      }
    }
  };
}
