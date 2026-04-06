import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor';
import { createMaterial3GoogleTabsLineVariant } from './tabs.line.schema';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
  white: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsSegmentedVariant({
  c,
  transparent,
  white
}: CreateMaterial3GoogleTabsVariantArgs): NonNullable<
  NonNullable<TabsComponent['variants']>['segmented']
> {
  const lineVariant = createMaterial3GoogleTabsLineVariant({
    c,
    transparent
  });

  return {
    options: {
      type: 'segmented',
      indicatorVariant: 'segmented',
      separator: true
    },
    elements: {
      // e1: bar
      e1: {
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          borderWidth: 2,
          borderRadius: {
            rounded: 12
          }
        },
        palettes: {
          default: {
            light: {
              borderColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'primary.v2', 60)
                  }
                }
              }
            },
            dark: {
              borderColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'primary.v2', 50)
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
          paddingLeft: 14,
          paddingRight: 14,
          borderRadius: {
            rounded: 10
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'neutral', 0),
                    hover: c('default', 'l', 'neutral', 4),
                    focus: c('default', 'l', 'neutral', 4),
                    pressed: c('default', 'l', 'neutral', 8),
                    selected: {
                      rest: transparent,
                      hover: transparent,
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
                    rest: c('default', 'd', 'neutral', 0),
                    hover: c('default', 'd', 'neutral', 4),
                    focus: c('default', 'd', 'neutral', 4),
                    pressed: c('default', 'd', 'neutral', 8),
                    selected: {
                      rest: transparent,
                      hover: transparent,
                      pressed: transparent
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
                  medium: {
                    rest: c('default', 'l', 'primary.v2', 60),
                    selected: {
                      rest: white
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'primary.v2', 50),
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
      e4: lineVariant.elements?.e4,
      // e5: indicator
      e5: {
        scales: {
          borderRadius: {
            rounded: 10
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'primary.v2', 60),
                    hover: c('default', 'l', 'primary.v2', 55),
                    pressed: c('default', 'l', 'primary.v2', 65)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'primary.v2', 50),
                    hover: c('default', 'd', 'primary.v2', 45),
                    pressed: c('default', 'd', 'primary.v2', 55)
                  }
                }
              }
            }
          }
        }
      },
      // e6: separator
      e6: {
        scales: {
          boxWidth: 2,
          boxHeight: 40,
          marginTop: 0,
          marginBottom: 0
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'primary.v2', 60)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'primary.v2', 50)
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
