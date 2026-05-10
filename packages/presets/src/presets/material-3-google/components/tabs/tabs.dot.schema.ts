import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../../utils/presetColor.ts';
import { createMaterial3GoogleTabsLineVariant } from './tabs.line.schema.ts';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsVariantArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsDotVariant({
  c,
  transparent
}: CreateMaterial3GoogleTabsVariantArgs): NonNullable<
  NonNullable<TabsComponent['variants']>['dot']
> {
  const lineVariant = createMaterial3GoogleTabsLineVariant({
    c,
    transparent
  });

  return {
    elements: {
      // e1: bar
      e1: lineVariant.elements?.e1,
      // e2: tab
      e2: lineVariant.elements?.e2,
      // e3: label
      e3: lineVariant.elements?.e3,
      // e4: icon
      e4: lineVariant.elements?.e4,
      // e5: indicator
      e5: {
        name: 'indicator',
        scales: {
          boxHeight: {
            's:sm:1': 6,
            's:md:1': 8
          },
          marginTop: 0,
          marginBottom: {
            's:sm:1': 4,
            's:md:1': 5
          }
        },
        palettes: lineVariant.elements?.e5?.palettes
      }
    }
  };
}
