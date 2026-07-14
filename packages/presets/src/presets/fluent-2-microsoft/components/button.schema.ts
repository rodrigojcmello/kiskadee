import type { Schema, SolidColor } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type Fluent2MicrosoftSegmentName = 'default';

type CreateFluent2MicrosoftButtonSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  shadowBlack: (alpha: number) => SolidColor;
};

export function createFluent2MicrosoftButtonSchema({
  c,
  shadowBlack
}: CreateFluent2MicrosoftButtonSchemaArgs): ButtonComponent {
  const lightTransparent = c('default', 'l', 'button.neutral', 0, 0);
  const darkTransparent = c('default', 'd', 'button.neutral', 0, 0);

  return {
    elements: {
      e1: {
        name: 'button',
        decorations: {
          borderStyle: 'solid'
        },
        scales: {
          paddingTop: {
            's:sm:1': 1,
            's:md:1': 5,
            's:lg:1': 7
          },
          paddingBottom: {
            's:sm:1': 1,
            's:md:1': 5,
            's:lg:1': 7
          },
          paddingLeft: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16
          },
          paddingRight: {
            's:sm:1': 8,
            's:md:1': 12,
            's:lg:1': 16
          },
          borderWidth: {
            's:sm:1': 1,
            's:md:1': 1,
            's:lg:1': 1
          },
          borderRadius: {
            rounded: 4,
            pill: 4,
            square: 0
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                primary: {
                  // Kiskadee extension: Fluent does not provide a Primary medium-emphasis Button.
                  // See the component evidence before changing these tonal positions.
                  medium: {
                    rest: c('default', 'l', 'button.primary', 4),
                    hover: c('default', 'l', 'button.primary', 6),
                    focus: c('default', 'l', 'button.primary', 4),
                    pressed: c('default', 'l', 'button.primary', 8),
                    disabled: c('default', 'l', 'button.neutral', 3)
                  },
                  high: {
                    rest: c('default', 'l', 'button.primary', 50),
                    hover: c('default', 'l', 'button.primary', 55),
                    focus: c('default', 'l', 'button.primary', 50),
                    pressed: c('default', 'l', 'button.primary', 75),
                    disabled: c('default', 'l', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'l', 'button.primary', 60)
                    }
                  },
                  // Kiskadee extension: outlined Primary action with the same Blue foreground
                  // and interaction rhythm as Primary medium.
                  low: {
                    rest: lightTransparent,
                    hover: c('default', 'l', 'button.primary', 6),
                    focus: c('default', 'l', 'button.primary', 4),
                    pressed: c('default', 'l', 'button.primary', 8),
                    disabled: lightTransparent,
                    selected: {
                      rest: c('default', 'l', 'button.primary', 4)
                    }
                  },
                  // Kiskadee extension: borderless Primary action.
                  lowest: {
                    rest: lightTransparent,
                    hover: c('default', 'l', 'button.primary', 6),
                    focus: c('default', 'l', 'button.primary', 4),
                    pressed: c('default', 'l', 'button.primary', 8),
                    disabled: lightTransparent,
                    selected: {
                      rest: c('default', 'l', 'button.primary', 4)
                    }
                  }
                },
                neutral: {
                  // Kiskadee extension: a light neutral fill between Fluent Secondary and the
                  // black-like high-emphasis action.
                  medium: {
                    rest: c('default', 'l', 'button.neutral', 5),
                    hover: c('default', 'l', 'button.neutral', 7),
                    focus: c('default', 'l', 'button.neutral', 5),
                    pressed: c('default', 'l', 'button.neutral', 10),
                    disabled: c('default', 'l', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 12)
                    }
                  },
                  // Kiskadee adaptation of Fluent Secondary (default).
                  low: {
                    rest: c('default', 'l', 'button.neutral', 0),
                    hover: c('default', 'l', 'button.neutral', 2),
                    focus: c('default', 'l', 'button.neutral', 0),
                    pressed: c('default', 'l', 'button.neutral', 7),
                    disabled: c('default', 'l', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 5)
                    }
                  },
                  // Kiskadee temporarily collapses Fluent Outline, Subtle, and Transparent into
                  // one borderless neutral-lowest behavior, using Subtle interaction fills.
                  lowest: {
                    rest: lightTransparent,
                    hover: c('default', 'l', 'button.neutral', 2),
                    focus: lightTransparent,
                    pressed: c('default', 'l', 'button.neutral', 7),
                    disabled: lightTransparent,
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 5)
                    }
                  },
                  // Kiskadee extension: Fluent has no equivalent black neutral Button appearance.
                  high: {
                    rest: c('default', 'l', 'button.neutral', 85),
                    hover: c('default', 'l', 'button.neutral', 90),
                    focus: c('default', 'l', 'button.neutral', 85),
                    pressed: c('default', 'l', 'button.neutral', 95),
                    disabled: c('default', 'l', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 80)
                    }
                  }
                }
              },
              borderColor: {
                primary: {
                  medium: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    focus: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  high: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    focus: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  low: {
                    rest: c('default', 'l', 'button.primary', 50, 50),
                    hover: c('default', 'l', 'button.primary', 50, 50),
                    focus: c('default', 'l', 'button.primary', 50, 50),
                    pressed: c('default', 'l', 'button.primary', 50, 50),
                    disabled: c('default', 'l', 'button.neutral', 16),
                    selected: {
                      rest: c('default', 'l', 'button.primary', 50, 50)
                    }
                  },
                  lowest: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    focus: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  }
                },
                neutral: {
                  medium: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    focus: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  low: {
                    rest: c('default', 'l', 'button.neutral', 10),
                    hover: c('default', 'l', 'button.neutral', 12),
                    focus: c('default', 'l', 'button.neutral', 10),
                    pressed: c('default', 'l', 'button.neutral', 18),
                    disabled: c('default', 'l', 'button.neutral', 7),
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  lowest: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    focus: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  high: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    focus: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  }
                }
              }
            },
            dark: {
              boxColor: {
                primary: {
                  // Kiskadee extension: theme-appropriate tinted surface, not an upstream Fluent variant.
                  medium: {
                    rest: c('default', 'd', 'button.primary', 10),
                    hover: c('default', 'd', 'button.primary', 8),
                    focus: c('default', 'd', 'button.primary', 10),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: c('default', 'd', 'button.neutral', 3)
                  },
                  high: {
                    rest: c('default', 'd', 'button.primary', 35),
                    hover: c('default', 'd', 'button.primary', 40),
                    focus: c('default', 'd', 'button.primary', 35),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: c('default', 'd', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'd', 'button.primary', 28)
                    }
                  },
                  // Kiskadee extension: outlined Primary action with the same Blue foreground
                  // and interaction rhythm as Primary medium.
                  low: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.primary', 8),
                    focus: c('default', 'd', 'button.primary', 10),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 10)
                    }
                  },
                  // Kiskadee extension: borderless Primary action.
                  lowest: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.primary', 8),
                    focus: c('default', 'd', 'button.primary', 10),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 10)
                    }
                  }
                },
                neutral: {
                  // Kiskadee extension: theme-appropriate neutral fill.
                  medium: {
                    rest: c('default', 'd', 'button.neutral', 16),
                    hover: c('default', 'd', 'button.neutral', 20),
                    focus: c('default', 'd', 'button.neutral', 16),
                    pressed: c('default', 'd', 'button.neutral', 10),
                    disabled: c('default', 'd', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 22)
                    }
                  },
                  // Kiskadee adaptation of Fluent Secondary (default).
                  low: {
                    rest: c('default', 'd', 'button.neutral', 9),
                    hover: c('default', 'd', 'button.neutral', 20),
                    focus: c('default', 'd', 'button.neutral', 9),
                    pressed: c('default', 'd', 'button.neutral', 6),
                    disabled: c('default', 'd', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 16)
                    }
                  },
                  // Uses Fluent Subtle interaction fills while remaining borderless.
                  lowest: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.neutral', 16),
                    focus: darkTransparent,
                    pressed: c('default', 'd', 'button.neutral', 10),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 12)
                    }
                  },
                  // High emphasis is physically inverted in Dark so it remains prominent.
                  high: {
                    rest: c('default', 'd', 'button.neutral', 85),
                    hover: c('default', 'd', 'button.neutral', 90),
                    focus: c('default', 'd', 'button.neutral', 85),
                    pressed: c('default', 'd', 'button.neutral', 75),
                    disabled: c('default', 'd', 'button.neutral', 3),
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 80)
                    }
                  }
                }
              },
              borderColor: {
                primary: {
                  medium: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    focus: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  high: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    focus: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  low: {
                    rest: c('default', 'd', 'button.primary', 35, 50),
                    hover: c('default', 'd', 'button.primary', 35, 50),
                    focus: c('default', 'd', 'button.primary', 35, 50),
                    pressed: c('default', 'd', 'button.primary', 35, 50),
                    disabled: c('default', 'd', 'button.neutral', 35),
                    selected: {
                      rest: c('default', 'd', 'button.primary', 35, 50)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    focus: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  }
                },
                neutral: {
                  medium: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    focus: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  low: {
                    rest: c('default', 'd', 'button.neutral', 45),
                    hover: c('default', 'd', 'button.neutral', 50),
                    focus: c('default', 'd', 'button.neutral', 45),
                    pressed: c('default', 'd', 'button.neutral', 45),
                    disabled: c('default', 'd', 'button.neutral', 22),
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 50)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    focus: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  high: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    focus: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  }
                }
              }
            }
          }
        },
        effects: {
          shadow: {
            x: { rest: 0, hover: 0, pressed: 0, focus: 0, disabled: 0 },
            y: { rest: 2, hover: 4, pressed: 0, focus: 4, disabled: 0 },
            blur: { rest: 6, hover: 10, pressed: 0, focus: 10, disabled: 0 },
            color: {
              rest: shadowBlack(0.28),
              hover: shadowBlack(0.35),
              pressed: shadowBlack(0.32),
              focus: shadowBlack(0.35),
              disabled: shadowBlack(0)
            }
          }
        }
      },
      e2: {
        name: 'button-text',
        decorations: {
          textWeight: 'medium'
        },
        palettes: {
          default: {
            light: {
              textColor: {
                primary: {
                  medium: {
                    rest: c('default', 'l', 'button.primary', 65),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  high: {
                    rest: c('default', 'l', 'button.neutral', 0),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  low: {
                    rest: c('default', 'l', 'button.primary', 65),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  lowest: {
                    rest: c('default', 'l', 'button.primary', 65),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  }
                },
                neutral: {
                  high: {
                    rest: c('default', 'l', 'button.neutral', 0),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  medium: {
                    rest: c('default', 'l', 'button.neutral', 85),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  low: {
                    rest: c('default', 'l', 'button.neutral', 85),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  lowest: {
                    rest: c('default', 'l', 'button.neutral', 85),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  }
                }
              }
            },
            dark: {
              textColor: {
                primary: {
                  medium: {
                    rest: c('default', 'd', 'button.primary', 75),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  },
                  high: {
                    rest: c('default', 'd', 'button.neutral', 100),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  },
                  low: {
                    rest: c('default', 'd', 'button.primary', 75),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  },
                  lowest: {
                    rest: c('default', 'd', 'button.primary', 75),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  }
                },
                neutral: {
                  high: {
                    rest: c('default', 'd', 'button.neutral', 0),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  },
                  medium: {
                    rest: c('default', 'd', 'button.neutral', 100),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  },
                  low: {
                    rest: c('default', 'd', 'button.neutral', 100),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  },
                  lowest: {
                    rest: c('default', 'd', 'button.neutral', 100),
                    disabled: {
                      ref: c('default', 'd', 'button.neutral', 35)
                    }
                  }
                }
              }
            }
          }
        },
        scales: {
          textSize: {
            's:sm:1': 12,
            's:md:1': 14,
            's:lg:1': 16
          },
          textHeight: {
            's:sm:1': 16,
            's:md:1': 20,
            's:lg:1': 22
          }
        }
      }
    }
  };
}
