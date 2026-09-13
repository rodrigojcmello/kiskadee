import type { Schema } from '@kiskadee/core';
import { createMaterial3GoogleTabsLineVariant } from './tabs.line.schema.ts';
import { buildTabPalettes, type TabPaletteArgs, tabTransparent, tabWhite } from './tabs.palette.ts';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;

export function createMaterial3GoogleTabsSegmentedVariant({
  c,
  segmentNames
}: TabPaletteArgs): NonNullable<NonNullable<TabsComponent['variants']>['segmented']> {
  const lineVariant = createMaterial3GoogleTabsLineVariant({ c, segmentNames });
  const textPalettes = buildTabPalettes(segmentNames, (segment, theme, surface) => ({
    textColor: {
      neutral: {
        medium: {
          rest: c.ref(segment, theme, 'primary', 'vivid', theme === 'l' ? 0 : 6),
          selected: {
            rest: {
              ref:
                surface === 'onVivid'
                  ? c.ref(segment, 'l', 'primary', 'vivid')
                  : tabWhite(c, segment, theme)
            }
          }
        }
      }
    }
  }));

  return {
    options: {
      indicatorShape: 'segmented',
      separator: true
    },
    elements: {
      // e1: bar
      e1: {
        name: 'bar',
        decorations: { borderStyle: 'solid' },
        scales: {
          borderWidth: 2,
          borderRadius: { rounded: 12 }
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme, surface) => ({
          borderColor: {
            neutral: {
              medium: {
                rest:
                  surface === 'onVivid'
                    ? c(segment, theme, 'primitive.black.v1', theme === 'l' ? 0 : 100, 24)
                    : c(segment, theme, 'primary', theme === 'l' ? 60 : 50)
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
          paddingRight: { 's:sm:1': 12, 's:md:1': 14 },
          borderRadius: { rounded: 10 }
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme) => {
          const transparent = tabTransparent(c, segment, theme);
          return {
            boxColor: {
              neutral: {
                medium: {
                  rest: c(segment, theme, 'neutral', 0),
                  hover: c(segment, theme, 'neutral', 4),
                  focus: c(segment, theme, 'neutral', 4),
                  pressed: c(segment, theme, 'neutral', 8),
                  selected: {
                    // The selected shell supplies the visual fill; the tab clears its base box.
                    rest: transparent,
                    hover: transparent,
                    pressed: transparent
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
        palettes: textPalettes
      },
      // e4: icon
      e4: { ...lineVariant.elements!.e4!, palettes: textPalettes },
      // e5: indicator
      e5: {
        name: 'indicator',
        scales: { borderRadius: { rounded: 10 } },
        palettes: buildTabPalettes(segmentNames, (segment, theme, surface) => ({
          boxColor: {
            neutral: {
              medium:
                surface === 'onVivid'
                  ? { rest: tabWhite(c, segment, theme) }
                  : {
                      rest: c.ref(segment, 'l', 'primary', 'vivid'),
                      hover: c.ref(segment, 'l', 'primary', 'vivid', 1),
                      pressed: c.ref(segment, 'l', 'primary', 'vivid', 2)
                    }
            }
          }
        }))
      },
      // e6: separator
      e6: {
        name: 'separator',
        scales: {
          boxWidth: 2,
          boxHeight: { 's:sm:1': 32, 's:md:1': 40 },
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
                    : c(segment, theme, 'primary', theme === 'l' ? 60 : 50)
              }
            }
          }
        }))
      }
    }
  };
}
