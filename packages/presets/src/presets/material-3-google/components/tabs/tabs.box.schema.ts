import type { Schema } from '@kiskadee/core';
import { createMaterial3GoogleTabsLineVariant } from './tabs.line.schema.ts';
import { buildTabPalettes, type TabPaletteArgs, tabTransparent, tabWhite } from './tabs.palette.ts';

type TabsComponent = NonNullable<Schema<'purple'>['components']['tabs']>;

export function createMaterial3GoogleTabsBoxVariant({
  c,
  segmentNames
}: TabPaletteArgs): NonNullable<NonNullable<TabsComponent['variants']>['box']> {
  const lineVariant = createMaterial3GoogleTabsLineVariant({ c, segmentNames });
  const textPalettes = buildTabPalettes(segmentNames, (segment, theme) => ({
    textColor: {
      neutral: {
        medium: {
          rest: c.ref(segment, theme, 'neutral', 'vivid'),
          selected: { rest: { ref: tabWhite(c, segment, theme) } }
        }
      }
    }
  }));

  return {
    elements: {
      // e1: bar
      e1: {
        name: 'bar',
        scales: {
          paddingTop: { 's:sm:1': 3, 's:md:1': 4 },
          paddingBottom: { 's:sm:1': 3, 's:md:1': 4 },
          paddingLeft: { 's:sm:1': 3, 's:md:1': 4 },
          paddingRight: { 's:sm:1': 3, 's:md:1': 4 },
          borderRadius: { rounded: 20, pill: 20, square: 0 }
        },
        palettes: buildTabPalettes(segmentNames, (segment, theme) => ({
          boxColor: {
            neutral: {
              medium: { rest: c.ref(segment, theme, 'neutral', 'subtle') }
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
        palettes: buildTabPalettes(segmentNames, (segment, theme) => {
          const transparent = tabTransparent(c, segment, theme);
          return {
            boxColor: {
              neutral: {
                medium: {
                  rest: transparent,
                  hover: c.ref(segment, theme, 'neutral', 'subtle', 1),
                  focus: c.ref(segment, theme, 'neutral', 'subtle', 1),
                  pressed: c.ref(segment, theme, 'neutral', 'subtle', 2),
                  selected: { rest: transparent, hover: transparent, pressed: transparent }
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
        palettes: buildTabPalettes(segmentNames, (segment) => ({
          boxColor: {
            neutral: {
              medium: {
                rest: c.ref(segment, 'l', 'primary', 'vivid'),
                hover: c.ref(segment, 'l', 'primary', 'vivid', 1),
                pressed: c.ref(segment, 'l', 'primary', 'vivid', 2)
              }
            }
          }
        }))
      }
    }
  };
}
