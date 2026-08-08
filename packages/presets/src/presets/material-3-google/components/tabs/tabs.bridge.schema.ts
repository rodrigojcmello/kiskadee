import { type Schema, withAlpha } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor.ts';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: string;
  white: string;
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
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: transparent
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
                      rest: transparent
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
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: '#ffa724',
                      hover: '#ffbb4d',
                      focus: '#ffa724',
                      pressed: '#f2930d',
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
            },
            dark: {
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: '#bf7c18',
                      hover: '#dc8e18',
                      focus: '#bf7c18',
                      pressed: '#a26a16',
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
          }
        },
        effects: {
          shadow: {
            x: { rest: 0 },
            y: { rest: 0 },
            blur: { rest: 4 },
            color: {
              rest: withAlpha('#000000', 20)
            }
          }
        }
      },
      // e3: label
      e3: {
        name: 'label',
        typography: {
          's:sm:1': 'tabs-bridge-label-small-stronger',
          's:md:1': 'tabs-bridge-label-medium-stronger'
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
                textColor: {
                  neutral: {
                    medium: {
                      rest: '#3d1800',
                      selected: {
                        rest: { ref: '#121212' }
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
                      rest: '#ffe9c2',
                      selected: {
                        rest: { ref: white }
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
              onSubtle: {
                textColor: {
                  neutral: {
                    medium: {
                      rest: '#3d1800',
                      selected: {
                        rest: { ref: '#121212' }
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
                      rest: '#ffe9c2',
                      selected: {
                        rest: { ref: white }
                      }
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
              onSubtle: {
                boxColor: {
                  neutral: {
                    medium: {
                      rest: '#fffefa',
                      hover: '#fff6e5',
                      focus: '#fffefa',
                      pressed: '#fff0d6'
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
                      rest: c('default', 'd', 'neutral', 8)
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
              rest: withAlpha('#000000', 20)
            }
          }
        }
      }
    }
  };
}
