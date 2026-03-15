import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor';
import { createMaterial3GoogleTabsBoxVariant } from './tabs.box.schema';
import { createMaterial3GoogleTabsLineVariant } from './tabs.line.schema';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsBridgeVariant({
  c,
  transparent
}: CreateMaterial3GoogleTabsVariantArgs): NonNullable<
  NonNullable<TabsComponent['variants']>['bridge']
> {
  const lineVariant = createMaterial3GoogleTabsLineVariant({
    c,
    transparent
  });
  const boxVariant = createMaterial3GoogleTabsBoxVariant({
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
      e2: boxVariant.elements?.e2,
      // e3: label
      e3: boxVariant.elements?.e3,
      // e4: icon
      e4: lineVariant.elements?.e4,
      // e5: indicator
      e5: {
        scales: {
          curveWidth: {
            's:sm:1': 18,
            's:md:1': 24,
            's:lg:1': 30
          },
          borderRadius: {
            rounded: {
              's:sm:1': 16,
              's:md:1': 22,
              's:lg:1': 28
            },
            pill: {
              's:sm:1': 20,
              's:md:1': 28,
              's:lg:1': 34
            },
            square: 0
          }
        },
        palettes: {
          default: {
            light: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'l', 'neutral', 4),
                    hover: c('default', 'l', 'neutral', 4),
                    pressed: c('default', 'l', 'neutral', 4)
                  }
                }
              }
            },
            dark: {
              boxColor: {
                neutral: {
                  medium: {
                    rest: c('default', 'd', 'neutral', 90),
                    hover: c('default', 'd', 'neutral', 90),
                    pressed: c('default', 'd', 'neutral', 90)
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
