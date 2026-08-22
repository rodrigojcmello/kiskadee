import type { Schema } from '@kiskadee/core';
import { buildBySegment } from '../../../utils/buildBySegment.ts';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

type SegmentName = 'default' | 'dynamic';
type DropdownComponent = NonNullable<Schema<never>['components']['dropdown']>;

type CreateMaterial3GoogleDropdownSchemaArgs = {
  c: PresetColorGetter<SegmentName>;
  segmentNames: readonly SegmentName[];
};

export function createMaterial3GoogleDropdownSchema({
  c,
  segmentNames
}: CreateMaterial3GoogleDropdownSchemaArgs): DropdownComponent {
  const surfacePalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: {
        boxColor: {
          neutral: {
            medium: { rest: c(segment, 'l', 'dropdown.neutral', 0) }
          }
        },
        borderColor: {
          neutral: {
            medium: { rest: c(segment, 'l', 'dropdown.neutral', 20, 12) }
          }
        }
      }
    }
  }));
  const itemPalettes = buildBySegment(segmentNames, (segment) => {
    const transparent = c(segment, 'l', 'dropdown.neutral', 0, 0);
    return {
      light: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: {
                rest: transparent,
                hover: c(segment, 'l', 'dropdown.neutral', 90, 8),
                pressed: c(segment, 'l', 'dropdown.neutral', 90, 12),
                selected: { rest: c(segment, 'l', 'dropdown.neutral', 90, 12) },
                disabled: transparent
              }
            },
            destructive: {
              medium: {
                rest: transparent,
                hover: c(segment, 'l', 'dropdown.destructive', 60, 8),
                pressed: c(segment, 'l', 'dropdown.destructive', 60, 12),
                selected: { rest: c(segment, 'l', 'dropdown.destructive', 60, 12) },
                disabled: transparent
              }
            }
          }
        }
      }
    };
  });
  const textPalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: {
        textColor: {
          neutral: {
            medium: {
              rest: c(segment, 'l', 'dropdown.neutral', 90),
              disabled: { ref: c(segment, 'l', 'dropdown.neutral', 90, 38) }
            }
          },
          destructive: {
            medium: {
              rest: c(segment, 'l', 'dropdown.destructive', 60),
              disabled: { ref: c(segment, 'l', 'dropdown.neutral', 90, 38) }
            }
          }
        }
      }
    }
  }));
  const scrollAffordancePalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: {
        boxColor: {
          neutral: {
            medium: { rest: c(segment, 'l', 'dropdown.neutral', 0) }
          }
        },
        textColor: {
          neutral: {
            medium: { rest: c(segment, 'l', 'dropdown.neutral', 90) }
          }
        }
      }
    }
  }));
  const auxiliaryTextPalettes = buildBySegment(segmentNames, (segment) => ({
    light: {
      onSubtle: {
        textColor: {
          neutral: {
            medium: {
              rest: c(segment, 'l', 'dropdown.neutral', 60),
              disabled: { ref: c(segment, 'l', 'dropdown.neutral', 90, 38) }
            }
          },
          destructive: {
            medium: {
              rest: c(segment, 'l', 'dropdown.destructive', 60),
              disabled: { ref: c(segment, 'l', 'dropdown.neutral', 90, 38) }
            }
          }
        }
      }
    }
  }));
  return {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:md:1' },
          fixedLevels: ['s:md:1']
        }
      }
    },
    elements: {
      e1: {
        name: 'dropdown-surface',
        decorations: { borderStyle: 'solid' },
        scales: {
          paddingTop: 8,
          paddingRight: 8,
          paddingBottom: 8,
          paddingLeft: 8,
          borderWidth: 1,
          borderRadius: { rounded: 4, pill: 4, square: 0 }
        },
        palettes: surfacePalettes
      },
      e2: {
        name: 'dropdown-item',
        scales: {
          paddingTop: 14,
          paddingRight: 12,
          paddingBottom: 14,
          paddingLeft: 12,
          borderRadius: { rounded: 0, pill: 0, square: 0 }
        },
        palettes: itemPalettes
      },
      e3: {
        name: 'dropdown-icon',
        iconSize: { 's:all': 's:lg:1' },
        scales: { paddingRight: 12 },
        palettes: textPalettes
      },
      e4: {
        name: 'dropdown-label',
        typography: { 's:all': 'label-large' },
        palettes: textPalettes
      },
      e5: {
        name: 'dropdown-description',
        typography: { 's:all': 'body-small' },
        palettes: auxiliaryTextPalettes
      },
      e6: {
        name: 'dropdown-trailing-icon',
        iconSize: { 's:all': 's:lg:1' },
        palettes: textPalettes
      },
      e7: {
        name: 'dropdown-separator',
        separator: { 's:all': 'subtle' }
      },
      e8: {
        name: 'dropdown-end-text',
        typography: { 's:all': 'body-small' },
        palettes: auxiliaryTextPalettes
      },
      e9: {
        name: 'dropdown-group-label',
        typography: { 's:all': 'label-medium' },
        scales: {
          paddingTop: 14,
          paddingRight: 12,
          paddingBottom: 14,
          paddingLeft: 12
        },
        palettes: auxiliaryTextPalettes
      },
      e10: {
        name: 'dropdown-checkmark',
        iconSize: { 's:all': 's:lg:1' },
        scales: { paddingRight: 12 },
        palettes: textPalettes
      },
      e11: {
        name: 'dropdown-scroll-affordance',
        iconSize: { 's:all': 's:lg:1' },
        palettes: scrollAffordancePalettes
      }
    }
  };
}
