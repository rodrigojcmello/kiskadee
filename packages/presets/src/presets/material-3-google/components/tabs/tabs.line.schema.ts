import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsLineVariant({
  c,
  transparent
}: CreateMaterial3GoogleTabsVariantArgs): NonNullable<
  NonNullable<TabsComponent['variants']>['line']
> {
  return {
    elements: {
      // e1: bar
      e1: {
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          borderWidth: 1
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
                    rest: transparent
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
              boxColor: {
                neutral: {
                  medium: {
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
                  medium: {
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
              textColor: {
                neutral: {
                  medium: {
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
      e4: {
        scales: {
          boxWidth: {
            's:sm:1': 20,
            's:md:1': 24
          },
          boxHeight: {
            's:sm:1': 20,
            's:md:1': 24
          },
          marginRight: {
            's:sm:1': 6,
            's:md:1': 8
          }
        },
        palettes: {
          default: {
            light: {
              textColor: {
                neutral: {
                  medium: {
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
      // e5: indicator
      e5: {
        scales: {
          boxWidth: {
            's:sm:1': 20,
            's:md:1': 24
          },
          boxHeight: {
            's:sm:1': 4,
            's:md:1': 5
          },
          marginTop: 0,
          marginBottom: 0
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'primary.v2', 40)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
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
