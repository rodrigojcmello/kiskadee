import { type Schema, withAlpha } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor.ts';

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
      indicatorShape: 'bridge',
      lowerCurve: 'curved'
    },
    elements: {
      // e1: bar
      e1: {
        name: 'bar',
        scales: {
          paddingTop: {
            's:sm:1': 6,
            's:md:1': 8
          },
          paddingBottom: {
            's:sm:1': 6,
            's:md:1': 8
          },
          paddingLeft: {
            's:sm:1': 6,
            's:md:1': 8
          },
          paddingRight: {
            's:sm:1': 6,
            's:md:1': 8
          }
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
        name: 'tab',
        scales: {
          boxWidth: {
            's:sm:1': 104,
            's:md:1': 144
          },
          paddingTop: {
            's:sm:1': 8,
            's:md:1': 10
          },
          paddingBottom: {
            's:sm:1': 8,
            's:md:1': 10
          },
          paddingLeft: {
            's:sm:1': 24,
            's:md:1': 32
          },
          paddingRight: {
            's:sm:1': 24,
            's:md:1': 32
          },
          borderRadius: {
            rounded: {
              's:sm:1': 10,
              's:md:1': 12
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
        name: 'label',
        decorations: {
          textWeight: 'extraBold'
        },
        scales: {
          textSize: {
            's:sm:1': 16,
            's:md:1': 18
          },
          textHeight: {
            's:sm:1': 20,
            's:md:1': 24
          }
        },
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  medium: {
                    rest: [24, 100, 12, 1],
                    selected: {
                      rest: { ref: [0, 0, 7, 1] }
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
                      rest: { ref: white }
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
        name: 'icon',
        scales: {
          boxWidth: {
            's:sm:1': 20,
            's:md:1': 24
          },
          boxHeight: {
            's:sm:1': 20,
            's:md:1': 24
          },
          marginRight: 4
        },
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  medium: {
                    rest: [24, 100, 12, 1],
                    selected: {
                      rest: { ref: [0, 0, 7, 1] }
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
                      rest: { ref: white }
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
        name: 'selected-shell',
        scales: {
          borderRadius: {
            rounded: {
              's:sm:1': 10,
              's:md:1': 12
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
