import type { Schema } from '@kiskadee/core';
import type { TabPaletteArgs } from './tabs.palette.ts';
import { buildTabPalettes, tabTransparent, tabWhite } from './tabs.palette.ts';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;

export function createMaterial3GoogleTabsBridgeVariant({
  c,
  segmentNames
}: TabPaletteArgs): NonNullable<NonNullable<TabsComponent['variants']>['bridge']> {
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
          paddingTop: { 's:sm:1': 6, 's:md:1': 8 },
          paddingBottom: { 's:sm:1': 6, 's:md:1': 8 },
          paddingLeft: { 's:sm:1': 6, 's:md:1': 8 },
          paddingRight: { 's:sm:1': 6, 's:md:1': 8 }
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme) => ({
          boxColor: {
            neutral: {
              medium: { rest: tabTransparent(c, segment, theme) }
            }
          }
        }))
      },
      // e2: tab
      e2: {
        name: 'tab',
        scales: {
          boxWidth: { 's:sm:1': 104, 's:md:1': 144 },
          paddingTop: { 's:sm:1': 8, 's:md:1': 10 },
          paddingBottom: { 's:sm:1': 8, 's:md:1': 10 },
          paddingLeft: { 's:sm:1': 24, 's:md:1': 32 },
          paddingRight: { 's:sm:1': 24, 's:md:1': 32 },
          borderRadius: { rounded: { 's:sm:1': 10, 's:md:1': 12 } }
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme) => {
          const transparent = tabTransparent(c, segment, theme);
          const isLight = theme === 'l';
          return {
            boxColor: {
              neutral: {
                medium: {
                  rest: c(segment, theme, 'yellowLike', isLight ? 14 : 70),
                  hover: c(segment, theme, 'yellowLike', isLight ? 12 : 80),
                  pressed: c(segment, theme, 'yellowLike', isLight ? 16 : 60),
                  selected: {
                    // The selected shell owns the fill and clears the tab background.
                    rest: transparent,
                    hover: transparent,
                    focus: transparent,
                    pressed: transparent
                  }
                }
              }
            }
          };
        }),
        effects: {
          shadow: {
            x: { rest: 0 },
            y: { rest: 0 },
            blur: { rest: 4 },
            color: {
              rest: c('default', 'l', 'primitive.black.v1', 100, 20)
            }
          }
        }
      },
      // e3: label
      e3: {
        name: 'label',
        typography: {
          's:sm:1': 'label-extra-large',
          's:md:1': 'label-extra-large'
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme) => ({
          textColor: {
            neutral: {
              medium: {
                rest: c(segment, theme, 'yellowLike', theme === 'l' ? 80 : 95),
                selected: {
                  rest: {
                    ref:
                      theme === 'l' ? c(segment, theme, 'neutral', 90) : tabWhite(c, segment, theme)
                  }
                }
              }
            }
          }
        }))
      },
      // e4: icon
      e4: {
        name: 'icon',
        iconSize: { 's:sm:1': 's:md:1', 's:md:1': 's:lg:1' },
        scales: { marginRight: 4 },
        palettes: buildTabPalettes(segmentNames, (segment, theme) => ({
          textColor: {
            neutral: {
              medium: {
                rest: c(segment, theme, 'yellowLike', theme === 'l' ? 80 : 95),
                selected: {
                  rest: {
                    ref:
                      theme === 'l' ? c(segment, theme, 'neutral', 90) : tabWhite(c, segment, theme)
                  }
                }
              }
            }
          }
        }))
      },
      // e5: selected shell
      e5: {
        name: 'selected-shell',
        scales: {
          borderRadius: { rounded: { 's:sm:1': 10, 's:md:1': 12 } }
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme) => {
          const isLight = theme === 'l';
          return {
            boxColor: {
              neutral: {
                medium: isLight
                  ? {
                      rest: c(segment, theme, 'yellowLike', 0),
                      hover: c(segment, theme, 'yellowLike', 2),
                      pressed: c(segment, theme, 'yellowLike', 5)
                    }
                  : {
                      rest: c(segment, theme, 'neutral', 8),
                      hover: c(segment, theme, 'neutral', 10),
                      pressed: c(segment, theme, 'neutral', 6)
                    }
              }
            }
          };
        }),
        effects: {
          shadow: {
            x: { rest: 0 },
            y: { rest: 0 },
            blur: { rest: 4 },
            color: {
              rest: c('default', 'l', 'primitive.black.v1', 100, 20)
            }
          }
        }
      }
    }
  };
}
