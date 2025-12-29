import { breakpoints, color, primitive, type Schema, withAlpha } from '@kiskadee/core';
import { createPresetColorGetter } from '../../utils/presetColor';
import { schemaColors } from './fluent-2-kiskadee.colors';

// Reference: https://www.figma.com/design/iEmab9I4qGqbUJlFSxRORE/Microsoft-Fluent-2-Web--Community-?node-id=1-840&p=f&t=M4w8UKqwRiqJgq8i-0

const schemaContext = { colors: schemaColors } as const satisfies Pick<Schema, 'colors'>;

type SegmentName = 'default' | 'dynamic' | 'modern';

const c = createPresetColorGetter<SegmentName>(schemaContext);

function createButtonElementPalettes(segmentName: SegmentName) {
  // NOTE: For now, the `dynamic` segment is expected to be solid-only.
  // Gradient support for dynamic segments will be added later.

  if (segmentName === 'dynamic') {
    const primaryBoxRole = 'button.primary' as const;
    return {
      light: {
        boxColor: {
          primary: {
            vivid: {
              rest: c(segmentName, 'l', primaryBoxRole, 60),
              hover: c(segmentName, 'l', primaryBoxRole, 70),
              focus: c(segmentName, 'l', primaryBoxRole, 60),
              pressed: c(segmentName, 'l', primaryBoxRole, 90),
              disabled: c(segmentName, 'l', 'button.neutral', 6),
              selected: {
                rest: c(segmentName, 'l', primaryBoxRole, 80),
                hover: c(segmentName, 'l', primaryBoxRole, 70),
                pressed: c(segmentName, 'l', primaryBoxRole, 90)
              }
            }
          }
        }
      },
      dark: {
        boxColor: {
          primary: {
            vivid: {
              rest: c(segmentName, 'd', primaryBoxRole, 70),
              hover: c(segmentName, 'd', primaryBoxRole, 60),
              focus: c(segmentName, 'd', primaryBoxRole, 70),
              pressed: c(segmentName, 'd', primaryBoxRole, 90),
              disabled: c(segmentName, 'd', 'button.neutral', 0, 40),
              selected: {
                rest: c(segmentName, 'd', primaryBoxRole, 80),
                hover: c(segmentName, 'd', primaryBoxRole, 70),
                pressed: c(segmentName, 'd', primaryBoxRole, 90)
              }
            }
          }
        }
      }
    };
  }

  const primaryBoxRole = 'button.primary.gradient' as const;
  return {
    light: {
      boxColor: {
        primary: {
          vivid: {
            rest: c(segmentName, 'l', primaryBoxRole, 60),
            hover: c(segmentName, 'l', primaryBoxRole, 70),
            focus: c(segmentName, 'l', primaryBoxRole, 60),
            pressed: c(segmentName, 'l', primaryBoxRole, 90),
            disabled: c(segmentName, 'l', 'button.neutral', 6),
            selected: {
              rest: c(segmentName, 'l', primaryBoxRole, 80),
              hover: c(segmentName, 'l', primaryBoxRole, 70),
              pressed: c(segmentName, 'l', primaryBoxRole, 90)
            }
          }
        }
      }
    },
    dark: {
      boxColor: {
        primary: {
          vivid: {
            rest: c(segmentName, 'd', primaryBoxRole, 70),
            hover: c(segmentName, 'd', primaryBoxRole, 60),
            focus: c(segmentName, 'd', primaryBoxRole, 70),
            pressed: c(segmentName, 'd', primaryBoxRole, 90),
            disabled: c(segmentName, 'd', 'button.neutral', 0, 40),
            selected: {
              rest: c(segmentName, 'd', primaryBoxRole, 80),
              hover: c(segmentName, 'd', primaryBoxRole, 70),
              pressed: c(segmentName, 'd', primaryBoxRole, 90)
            }
          }
        }
      }
    }
  };
}

function createButtonTextElementPalettes(segmentName: SegmentName) {
  return {
    light: {
      textColor: {
        primary: {
          vivid: {
            rest: c(segmentName, 'l', 'button.neutral', 0),
            disabled: {
              ref: c(segmentName, 'l', 'button.neutral', 25)
            }
          }
        }
      }
    },
    dark: {
      textColor: {
        primary: {
          vivid: {
            rest: c(segmentName, 'd', 'button.neutral', 100),
            disabled: {
              ref: c(segmentName, 'd', 'button.neutral', 100, 25)
            }
          }
        }
      }
    }
  };
}

// The `Schema` generic represents extra segment names beyond the built-ins (`default` and optional `dynamic`).
type Segments = 'modern';

export const schema: Schema<Segments> = {
  name: 'Fluent',
  prefix: 'fk', // Fluent by Kiskadee
  version: [2, 0, 0],
  author: 'Kiskadee',
  breakpoints,
  colors: schemaColors,
  themeTokens: {
    palettes: {
      default: {
        light: {
          focusColor: color(schemaContext, 'default', 'l', primitive('black', 'v1'), 100)
        },
        dark: {
          focusColor: color(schemaContext, 'default', 'd', primitive('black', 'v1'), 100),
          background: [0, 0, 12, 1]
        }
      }
    }
  },
  components: {
    button: {
      elements: {
        e1: {
          name: 'button',
          decorations: {
            borderStyle: 'none'
          },
          scales: {
            paddingTop: {
              's:sm:1': 2,
              's:md:1': 6,
              's:lg:1': 8
            },
            paddingBottom: {
              's:sm:1': 2,
              's:md:1': 6,
              's:lg:1': 8
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
            borderRadius: {
              's:sm:1': 4,
              's:md:1': 4,
              's:lg:1': 4
            }
          },
          palettes: {
            default: createButtonElementPalettes('default'),
            modern: createButtonElementPalettes('modern'),
            dynamic: createButtonElementPalettes('dynamic')
          },
          effects: {
            shadow: {
              x: { rest: 0, hover: 0, pressed: 0, focus: 0, disabled: 0 },
              y: { rest: 2, hover: 4, pressed: 0, focus: 4, disabled: 0 },
              blur: { rest: 6, hover: 10, pressed: 0, focus: 10, disabled: 0 },
              color: {
                rest: withAlpha([0, 0, 0, 1], 28),
                hover: withAlpha([0, 0, 0, 1], 35),
                pressed: withAlpha([0, 0, 0, 1], 32),
                focus: withAlpha([0, 0, 0, 1], 35),
                disabled: withAlpha([0, 0, 0, 1], 0)
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
            default: createButtonTextElementPalettes('default'),
            modern: createButtonTextElementPalettes('modern'),
            dynamic: createButtonTextElementPalettes('dynamic')
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
    }
  }
};
