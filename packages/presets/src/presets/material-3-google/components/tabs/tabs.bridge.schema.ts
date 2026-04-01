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
      type: 'bridge',
      indicatorVariant: 'bridge',
      lowerCurveMode: 'curved'
    },
    elements: {
      // e1: bar
      e1: {
        scales: {
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0
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
              's:sm:1': 10,
              's:md:1': 12,
              's:lg:1': 14
            }
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: [36, 100, 58, 1],
                    hover: [36, 100, 64, 1],
                    focus: [36, 100, 58, 1],
                    pressed: [36, 100, 52, 1],
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
              rest: withAlpha([0, 0, 0, 1], 22)
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
                  medium: {
                    rest: [24, 73, 18, 1],
                    selected: {
                      rest: c('default', 'l', 'neutral', 10)
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
          boxWidth: 18,
          boxHeight: 18,
          paddingRight: 8
        },
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  medium: {
                    rest: [24, 73, 18, 1],
                    selected: {
                      rest: c('default', 'l', 'neutral', 10)
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
              's:sm:1': 10,
              's:md:1': 12,
              's:lg:1': 14
            }
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: white
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
            blur: { rest: 6 },
            color: {
              rest: withAlpha([0, 0, 0, 1], 24)
            }
          }
        }
      },
      // e7: panel
      e7: {
        scales: {
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
          borderRadius: {
            rounded: {
              's:sm:1': 14,
              's:md:1': 16,
              's:lg:1': 18
            }
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: white
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
            y: { rest: 5 },
            blur: { rest: 4 },
            color: {
              rest: withAlpha([0, 0, 0, 1], 18)
            }
          }
        }
      }
    }
  };
}
