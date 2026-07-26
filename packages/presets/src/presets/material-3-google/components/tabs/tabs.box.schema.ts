import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor.ts';
import { createMaterial3GoogleTabsLineVariant } from './tabs.line.schema.ts';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: string;
};

export function createMaterial3GoogleTabsBoxVariant({
  c,
  transparent
}: CreateMaterial3GoogleTabsVariantArgs): NonNullable<
  NonNullable<TabsComponent['variants']>['box']
> {
  const lineVariant = createMaterial3GoogleTabsLineVariant({
    c,
    transparent
  });

  return {
    elements: {
      // e1: bar
      e1: {
        name: 'bar',
        scales: {
          paddingTop: {
            's:sm:1': 3,
            's:md:1': 4
          },
          paddingBottom: {
            's:sm:1': 3,
            's:md:1': 4
          },
          paddingLeft: {
            's:sm:1': 3,
            's:md:1': 4
          },
          paddingRight: {
            's:sm:1': 3,
            's:md:1': 4
          },
          borderRadius: {
            rounded: 20,
            pill: 20,
            square: 0
          }
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: c('default', 'l', 'neutral', 4)
                    }
                  }
                }
              }
            },
            dark: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: c('default', 'd', 'neutral', 90)
                    }
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
            's:sm:1': 12,
            's:md:1': 14
          },
          paddingRight: {
            's:sm:1': 12,
            's:md:1': 14
          }
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
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
              }
            },
            dark: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: transparent,
                      hover: c('default', 'd', 'neutral', 85),
                      focus: c('default', 'd', 'neutral', 85),
                      pressed: c('default', 'd', 'neutral', 80),
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
        }
      },
      // e3: label
      e3: {
        name: 'label',
        decorations: {
          textWeight: 'medium'
        },
        scales: {
          textSize: {
            's:sm:1': 13,
            's:md:1': 14
          },
          textHeight: {
            's:sm:1': 20,
            's:md:1': 24
          }
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
                textColor: {
                  neutral: {
                    medium: {
                      rest: c('default', 'l', 'neutral', 40),
                      selected: {
                        rest: { ref: c('default', 'l', 'primary.v2', 0) }
                      }
                    }
                  }
                }
              }
            },
            dark: {
              onSubtle: {
                textColor: {
                  neutral: {
                    medium: {
                      rest: c('default', 'd', 'neutral', 80),
                      selected: {
                        rest: { ref: c('default', 'd', 'primary.v2', 80) }
                      }
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
        name: 'indicator',
        palettes: {
          default: {
            light: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: c('default', 'l', 'primary', 50),
                      hover: c('default', 'l', 'primary', 45),
                      pressed: c('default', 'l', 'primary', 55)
                    }
                  }
                }
              }
            },
            dark: {
              onSubtle: {
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
    }
  };
}
