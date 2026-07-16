import type { KiskadeeTone, Schema, SolidColor } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type ButtonComponent = NonNullable<Schema<never>['components']['button']>;
type Fluent2MicrosoftSegmentName = 'default';
type ThemeShortcut = 'l' | 'd';
type ChromaticButtonRole = 'button.destructive' | 'button.positive';

type ChromaticHighTones = {
  rest: KiskadeeTone;
  hover: KiskadeeTone;
  pressed: KiskadeeTone;
  selected: KiskadeeTone;
};

type CreateFluent2MicrosoftButtonSchemaArgs = {
  c: PresetColorGetter<Fluent2MicrosoftSegmentName>;
  shadowBlack: (alpha: number) => SolidColor;
};

export function createFluent2MicrosoftButtonSchema({
  c,
  shadowBlack
}: CreateFluent2MicrosoftButtonSchemaArgs): ButtonComponent {
  const lightTransparent = c('default', 'l', 'button.neutral', 0, 0);
  const lightAdaptiveDisabled = c('default', 'l', 'button.neutral', 100, 5);
  const lightAdaptiveDisabledText = c('default', 'l', 'button.neutral', 20, 82);
  const darkTransparent = c('default', 'd', 'button.neutral', 0, 0);
  const darkAdaptiveDisabled = c('default', 'd', 'button.neutral', 100, 5);

  const createChromaticBoxIntent = (
    theme: ThemeShortcut,
    role: ChromaticButtonRole,
    high: ChromaticHighTones
  ) => {
    const isLight = theme === 'l';
    const transparent = isLight ? lightTransparent : darkTransparent;
    const adaptiveDisabled = isLight ? lightAdaptiveDisabled : darkAdaptiveDisabled;
    const mediumRest = isLight ? 4 : 10;
    const mediumHover = isLight ? 6 : 8;
    const mediumPressed = isLight ? 8 : 14;

    return {
      // Kiskadee extension: Fluent has no complete semantic Button emphasis family.
      medium: {
        rest: c('default', theme, role, mediumRest),
        hover: c('default', theme, role, mediumHover),
        pressed: c('default', theme, role, mediumPressed),
        disabled: adaptiveDisabled,
        selected: {
          rest: c('default', theme, role, mediumRest)
        }
      },
      high: {
        rest: c('default', theme, role, high.rest),
        hover: c('default', theme, role, high.hover),
        pressed: c('default', theme, role, high.pressed),
        disabled: adaptiveDisabled,
        selected: {
          rest: c('default', theme, role, high.selected)
        }
      },
      low: {
        rest: transparent,
        hover: c('default', theme, role, mediumHover),
        focus: c('default', theme, role, mediumRest),
        pressed: c('default', theme, role, mediumPressed),
        disabled: adaptiveDisabled,
        selected: {
          rest: c('default', theme, role, mediumRest)
        }
      },
      lowest: {
        rest: transparent,
        hover: c('default', theme, role, mediumHover),
        focus: c('default', theme, role, mediumRest),
        pressed: c('default', theme, role, mediumPressed),
        disabled: transparent,
        selected: {
          rest: c('default', theme, role, mediumRest)
        }
      }
    };
  };

  const createChromaticBorderIntent = (
    theme: ThemeShortcut,
    role: ChromaticButtonRole,
    restTone: KiskadeeTone
  ) => {
    const isLight = theme === 'l';
    const transparent = isLight ? lightTransparent : darkTransparent;

    return {
      medium: {
        rest: transparent,
        hover: transparent,
        pressed: transparent,
        disabled: transparent
      },
      high: {
        rest: transparent,
        hover: transparent,
        pressed: transparent,
        disabled: transparent
      },
      low: {
        rest: c('default', theme, role, restTone, 50),
        hover: c('default', theme, role, restTone, 50),
        pressed: c('default', theme, role, restTone, 50),
        disabled: transparent,
        selected: {
          rest: c('default', theme, role, restTone, 50)
        }
      },
      lowest: {
        rest: transparent,
        hover: transparent,
        pressed: transparent,
        disabled: transparent
      }
    };
  };

  const createChromaticTextIntent = (theme: ThemeShortcut, role: ChromaticButtonRole) => {
    const isLight = theme === 'l';
    const foregroundTone = isLight ? 65 : 75;
    const disabledTone = isLight ? 16 : 35;
    const highForegroundTone = 0;
    const disabledForeground = c('default', theme, 'button.neutral', disabledTone);
    const filledDisabledForeground = isLight ? lightAdaptiveDisabledText : disabledForeground;

    return {
      medium: {
        rest: c('default', theme, role, foregroundTone),
        disabled: {
          ref: filledDisabledForeground
        }
      },
      high: {
        rest: c('default', theme, 'button.neutral', highForegroundTone),
        disabled: {
          ref: filledDisabledForeground
        }
      },
      low: {
        rest: c('default', theme, role, foregroundTone),
        disabled: {
          ref: filledDisabledForeground
        }
      },
      lowest: {
        rest: c('default', theme, role, foregroundTone),
        disabled: {
          ref: disabledForeground
        }
      }
    };
  };

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
            's:md:1': 6,
            's:lg:1': 7
          },
          paddingBottom: {
            's:sm:1': 1,
            's:md:1': 6,
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
                    pressed: c('default', 'l', 'button.primary', 8),
                    disabled: lightAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'l', 'button.primary', 4)
                    }
                  },
                  high: {
                    rest: c('default', 'l', 'button.primary', 50),
                    hover: c('default', 'l', 'button.primary', 55),
                    pressed: c('default', 'l', 'button.primary', 75),
                    disabled: lightAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'l', 'button.primary', 60)
                    }
                  },
                  // Kiskadee extension: outlined Primary action with the same Blue foreground
                  // and interaction rhythm as Primary medium.
                  low: {
                    rest: lightTransparent,
                    hover: c('default', 'l', 'button.primary', 2),
                    pressed: c('default', 'l', 'button.primary', 4),
                    disabled: lightAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'l', 'button.primary', 1)
                    }
                  },
                  // Kiskadee extension: borderless Primary action.
                  lowest: {
                    rest: lightTransparent,
                    hover: c('default', 'l', 'button.primary', 2),
                    pressed: c('default', 'l', 'button.primary', 4),
                    disabled: lightTransparent,
                    selected: {
                      rest: c('default', 'l', 'button.primary', 1)
                    }
                  }
                },
                neutral: {
                  // Kiskadee extension: a light neutral fill between Fluent Secondary and the
                  // black-like high-emphasis action.
                  medium: {
                    rest: c('default', 'l', 'button.neutral', 5),
                    hover: c('default', 'l', 'button.neutral', 7),
                    pressed: c('default', 'l', 'button.neutral', 10),
                    disabled: lightAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 12)
                    }
                  },
                  // Kiskadee adaptation of Fluent Secondary (default).
                  low: {
                    rest: c('default', 'l', 'button.neutral', 0),
                    hover: c('default', 'l', 'button.neutral', 2),
                    pressed: c('default', 'l', 'button.neutral', 7),
                    disabled: lightAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 5)
                    }
                  },
                  // Kiskadee temporarily collapses Fluent Outline, Subtle, and Transparent into
                  // one borderless neutral-lowest behavior, using Subtle interaction fills.
                  lowest: {
                    rest: lightTransparent,
                    hover: c('default', 'l', 'button.neutral', 2),
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
                    pressed: c('default', 'l', 'button.neutral', 95),
                    disabled: lightAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 80)
                    }
                  }
                },
                destructive: createChromaticBoxIntent('l', 'button.destructive', {
                  rest: 45,
                  hover: 50,
                  pressed: 65,
                  selected: 55
                }),
                positive: createChromaticBoxIntent('l', 'button.positive', {
                  rest: 45,
                  hover: 50,
                  pressed: 65,
                  selected: 55
                })
              },
              borderColor: {
                primary: {
                  medium: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  high: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  low: {
                    rest: c('default', 'l', 'button.primary', 50, 50),
                    hover: c('default', 'l', 'button.primary', 50, 50),
                    pressed: c('default', 'l', 'button.primary', 50, 50),
                    disabled: lightTransparent,
                    selected: {
                      rest: c('default', 'l', 'button.primary', 50, 50)
                    }
                  },
                  lowest: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  }
                },
                neutral: {
                  medium: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  low: {
                    rest: c('default', 'l', 'button.neutral', 10),
                    hover: c('default', 'l', 'button.neutral', 12),
                    pressed: c('default', 'l', 'button.neutral', 18),
                    disabled: lightTransparent,
                    selected: {
                      rest: c('default', 'l', 'button.neutral', 16)
                    }
                  },
                  lowest: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  },
                  high: {
                    rest: lightTransparent,
                    hover: lightTransparent,
                    pressed: lightTransparent,
                    disabled: lightTransparent
                  }
                },
                destructive: createChromaticBorderIntent('l', 'button.destructive', 45),
                positive: createChromaticBorderIntent('l', 'button.positive', 45)
              }
            },
            dark: {
              boxColor: {
                primary: {
                  // Kiskadee extension: theme-appropriate tinted surface, not an upstream Fluent variant.
                  medium: {
                    rest: c('default', 'd', 'button.primary', 10),
                    hover: c('default', 'd', 'button.primary', 8),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 10)
                    }
                  },
                  high: {
                    rest: c('default', 'd', 'button.primary', 35),
                    hover: c('default', 'd', 'button.primary', 40),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 28)
                    }
                  },
                  // Kiskadee extension: outlined Primary action with the same Blue foreground
                  // and interaction rhythm as Primary medium.
                  low: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.primary', 14),
                    pressed: c('default', 'd', 'button.primary', 22),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 18)
                    }
                  },
                  // Kiskadee extension: borderless Primary action.
                  lowest: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.primary', 14),
                    pressed: c('default', 'd', 'button.primary', 22),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 18)
                    }
                  }
                },
                neutral: {
                  // Kiskadee extension: theme-appropriate neutral fill.
                  medium: {
                    rest: c('default', 'd', 'button.neutral', 16),
                    hover: c('default', 'd', 'button.neutral', 20),
                    pressed: c('default', 'd', 'button.neutral', 10),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 22)
                    }
                  },
                  // Kiskadee adaptation of Fluent Secondary (default).
                  low: {
                    rest: c('default', 'd', 'button.neutral', 9),
                    hover: c('default', 'd', 'button.neutral', 20),
                    pressed: c('default', 'd', 'button.neutral', 6),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 16)
                    }
                  },
                  // Uses Fluent Subtle interaction fills while remaining borderless.
                  lowest: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.neutral', 16),
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
                    pressed: c('default', 'd', 'button.neutral', 75),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 80)
                    }
                  }
                },
                destructive: createChromaticBoxIntent('d', 'button.destructive', {
                  rest: 65,
                  hover: 70,
                  pressed: 45,
                  selected: 60
                }),
                positive: createChromaticBoxIntent('d', 'button.positive', {
                  rest: 75,
                  hover: 80,
                  pressed: 55,
                  selected: 70
                })
              },
              borderColor: {
                primary: {
                  medium: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  high: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  low: {
                    rest: c('default', 'd', 'button.primary', 35, 50),
                    hover: c('default', 'd', 'button.primary', 35, 50),
                    pressed: c('default', 'd', 'button.primary', 35, 50),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 35, 50)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  }
                },
                neutral: {
                  medium: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  low: {
                    rest: c('default', 'd', 'button.neutral', 45),
                    hover: c('default', 'd', 'button.neutral', 50),
                    pressed: c('default', 'd', 'button.neutral', 45),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 50)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  high: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  }
                },
                destructive: createChromaticBorderIntent('d', 'button.destructive', 65),
                positive: createChromaticBorderIntent('d', 'button.positive', 75)
              }
            },
            // Kiskadee extension: Dark copied with a one-slot darker High-emphasis progression.
            darker: {
              boxColor: {
                primary: {
                  medium: {
                    rest: c('default', 'd', 'button.primary', 10),
                    hover: c('default', 'd', 'button.primary', 8),
                    pressed: c('default', 'd', 'button.primary', 14),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 10)
                    }
                  },
                  high: {
                    rest: c('default', 'd', 'button.primary', 30),
                    hover: c('default', 'd', 'button.primary', 35),
                    pressed: c('default', 'd', 'button.primary', 12),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 26)
                    }
                  },
                  low: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.primary', 14),
                    pressed: c('default', 'd', 'button.primary', 22),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 18)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.primary', 14),
                    pressed: c('default', 'd', 'button.primary', 22),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 18)
                    }
                  }
                },
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'button.neutral', 16),
                    hover: c('default', 'd', 'button.neutral', 20),
                    pressed: c('default', 'd', 'button.neutral', 10),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 22)
                    }
                  },
                  low: {
                    rest: c('default', 'd', 'button.neutral', 9),
                    hover: c('default', 'd', 'button.neutral', 20),
                    pressed: c('default', 'd', 'button.neutral', 6),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 16)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: c('default', 'd', 'button.neutral', 16),
                    pressed: c('default', 'd', 'button.neutral', 10),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 12)
                    }
                  },
                  high: {
                    rest: c('default', 'd', 'button.neutral', 80),
                    hover: c('default', 'd', 'button.neutral', 85),
                    pressed: c('default', 'd', 'button.neutral', 70),
                    disabled: darkAdaptiveDisabled,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 75)
                    }
                  }
                },
                destructive: createChromaticBoxIntent('d', 'button.destructive', {
                  rest: 60,
                  hover: 65,
                  pressed: 40,
                  selected: 55
                }),
                positive: createChromaticBoxIntent('d', 'button.positive', {
                  rest: 70,
                  hover: 75,
                  pressed: 50,
                  selected: 65
                })
              },
              borderColor: {
                primary: {
                  medium: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  high: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  low: {
                    rest: c('default', 'd', 'button.primary', 35, 50),
                    hover: c('default', 'd', 'button.primary', 35, 50),
                    pressed: c('default', 'd', 'button.primary', 35, 50),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.primary', 35, 50)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  }
                },
                neutral: {
                  medium: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  low: {
                    rest: c('default', 'd', 'button.neutral', 45),
                    hover: c('default', 'd', 'button.neutral', 50),
                    pressed: c('default', 'd', 'button.neutral', 45),
                    disabled: darkTransparent,
                    selected: {
                      rest: c('default', 'd', 'button.neutral', 50)
                    }
                  },
                  lowest: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  },
                  high: {
                    rest: darkTransparent,
                    hover: darkTransparent,
                    pressed: darkTransparent,
                    disabled: darkTransparent
                  }
                },
                destructive: createChromaticBorderIntent('d', 'button.destructive', 65),
                positive: createChromaticBorderIntent('d', 'button.positive', 75)
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
                      ref: lightAdaptiveDisabledText
                    }
                  },
                  high: {
                    rest: c('default', 'l', 'button.neutral', 0),
                    disabled: {
                      ref: lightAdaptiveDisabledText
                    }
                  },
                  low: {
                    rest: c('default', 'l', 'button.primary', 65),
                    disabled: {
                      ref: lightAdaptiveDisabledText
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
                      ref: lightAdaptiveDisabledText
                    }
                  },
                  medium: {
                    rest: c('default', 'l', 'button.neutral', 85),
                    disabled: {
                      ref: lightAdaptiveDisabledText
                    }
                  },
                  low: {
                    rest: c('default', 'l', 'button.neutral', 85),
                    disabled: {
                      ref: lightAdaptiveDisabledText
                    }
                  },
                  lowest: {
                    rest: c('default', 'l', 'button.neutral', 85),
                    disabled: {
                      ref: c('default', 'l', 'button.neutral', 16)
                    }
                  }
                },
                destructive: createChromaticTextIntent('l', 'button.destructive'),
                positive: createChromaticTextIntent('l', 'button.positive')
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
                },
                destructive: createChromaticTextIntent('d', 'button.destructive'),
                positive: createChromaticTextIntent('d', 'button.positive')
              }
            },
            darker: {
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
                },
                destructive: createChromaticTextIntent('d', 'button.destructive'),
                positive: createChromaticTextIntent('d', 'button.positive')
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
