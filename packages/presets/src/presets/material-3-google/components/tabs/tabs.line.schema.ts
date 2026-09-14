import type { Schema } from '@kiskadee/core';
import { buildTabPalettes, type TabPaletteArgs, tabTransparent, tabWhite } from './tabs.palette.ts';

type TabsComponent = NonNullable<Schema<'purple'>['components']['tabs']>;

export function createMaterial3GoogleTabsLineVariant({
  c,
  segmentNames
}: TabPaletteArgs): NonNullable<NonNullable<TabsComponent['variants']>['line']> {
  return {
    elements: {
      // e1: bar
      e1: {
        name: 'bar',
        decorations: { borderStyle: 'solid' },
        scales: { borderWidth: 1 },
        palettes: buildTabPalettes(segmentNames, (segment, theme, surface) => ({
          boxColor: {
            neutral: {
              medium: { rest: tabTransparent(c, segment, theme) }
            }
          },
          borderColor: {
            neutral: {
              medium: {
                rest:
                  surface === 'onVivid'
                    ? c(segment, theme, 'primitive.black.v1', theme === 'l' ? 0 : 100, 24)
                    : c(segment, theme, 'neutral', theme === 'l' ? 10 : 80)
              }
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
          paddingLeft: { 's:sm:1': 12, 's:md:1': 14 },
          paddingRight: { 's:sm:1': 12, 's:md:1': 14 }
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme, surface) => {
          const transparent = tabTransparent(c, segment, theme);
          const isLight = theme === 'l';
          const isVivid = surface === 'onVivid';
          const stateLayer = (alpha: 8 | 12) =>
            c(segment, theme, 'primitive.black.v1', isLight ? 0 : 100, alpha);
          return {
            boxColor: {
              neutral: {
                medium: {
                  rest: transparent,
                  hover: isVivid ? stateLayer(8) : c(segment, theme, 'neutral', isLight ? 4 : 85),
                  focus: isVivid ? stateLayer(8) : c(segment, theme, 'neutral', isLight ? 4 : 85),
                  pressed: isVivid
                    ? stateLayer(12)
                    : c(segment, theme, 'neutral', isLight ? 10 : 80),
                  selected: {
                    rest: transparent,
                    hover: isVivid ? stateLayer(8) : c(segment, theme, 'neutral', isLight ? 6 : 85),
                    pressed: isVivid
                      ? stateLayer(12)
                      : c(segment, theme, 'neutral', isLight ? 8 : 80)
                  }
                }
              }
            }
          };
        })
      },
      // e3: label
      e3: {
        name: 'label',
        typography: { 's:sm:1': 'label-medium', 's:md:1': 'label-large' },
        palettes: buildTabPalettes(segmentNames, (segment, theme, surface) => ({
          textColor: {
            neutral: {
              medium: {
                rest:
                  surface === 'onVivid'
                    ? tabWhite(c, segment, theme)
                    : c(segment, theme, 'neutral', theme === 'l' ? 40 : 80),
                selected: {
                  rest: {
                    ref:
                      surface === 'onVivid'
                        ? tabWhite(c, segment, theme)
                        : c(segment, theme, 'primary', theme === 'l' ? 40 : 80)
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
        palettes: buildTabPalettes(segmentNames, (segment, theme, surface) => ({
          textColor: {
            neutral: {
              medium: {
                rest:
                  surface === 'onVivid'
                    ? tabWhite(c, segment, theme)
                    : c(segment, theme, 'neutral', theme === 'l' ? 40 : 80),
                selected: {
                  rest: {
                    ref:
                      surface === 'onVivid'
                        ? tabWhite(c, segment, theme)
                        : c(segment, theme, 'primary', theme === 'l' ? 40 : 80)
                  }
                }
              }
            }
          }
        }))
      },
      // e5: indicator
      e5: {
        name: 'indicator',
        scales: {
          boxWidth: { 's:sm:1': 20, 's:md:1': 24 },
          boxHeight: { 's:sm:1': 4, 's:md:1': 5 },
          marginTop: 0,
          marginBottom: 0
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme, surface) => ({
          boxColor: {
            neutral: {
              medium: {
                rest:
                  surface === 'onVivid'
                    ? tabWhite(c, segment, theme)
                    : c(segment, theme, 'primary', theme === 'l' ? 40 : 80)
              }
            }
          }
        }))
      }
    }
  };
}
