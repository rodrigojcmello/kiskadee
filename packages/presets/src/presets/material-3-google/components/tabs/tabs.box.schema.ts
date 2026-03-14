import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor';
import { createMaterial3GoogleTabsLineVariant } from './tabs.line.schema';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsBoxVariant({
  c,
  transparent
}: CreateMaterial3GoogleTabsVariantArgs): NonNullable<NonNullable<TabsComponent['variants']>['box']> {
  const lineVariant = createMaterial3GoogleTabsLineVariant({
    c,
    transparent
  });

  return {
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
                  medium: {
                    rest: c('default', 'l', 'neutral', 4)
                  }
                }
              },
              borderColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'neutral', 10)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'neutral', 90)
                  }
                }
              },
              borderColor: {
                neutral: {
                  medium: {
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
          boxWidth: {
            's:sm:1': 120,
            's:md:1': 144,
            's:lg:1': 160
          },
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
                  medium: {
                    rest: transparent,
                    hover: c('default', 'l', 'neutral', 4),
                    focus: c('default', 'l', 'neutral', 4),
                    pressed: c('default', 'l', 'neutral', 10),
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
                    rest: transparent,
                    hover: c('default', 'd', 'neutral', 86),
                    focus: c('default', 'd', 'neutral', 86),
                    pressed: c('default', 'd', 'neutral', 82),
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
                    rest: c('default', 'l', 'neutral', 40),
                    selected: {
                      rest: c('default', 'l', 'primary.v2', 0)
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                neutral: {
                  medium: {
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
      e4: lineVariant.elements?.e4,
      // e5: indicator
      e5: {
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'primary', 50),
                    hover: c('default', 'l', 'primary', 45),
                    pressed: c('default', 'l', 'primary', 55)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'primary', 50),
                    hover: c('default', 'd', 'primary', 45),
                    pressed: c('default', 'd', 'primary', 55)
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
