import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import { createMaterial3GoogleTabsBoxVariant } from './tabs/tabs.box.schema.ts';
import { createMaterial3GoogleTabsBridgeVariant } from './tabs/tabs.bridge.schema.ts';
import { createMaterial3GoogleTabsDotVariant } from './tabs/tabs.dot.schema.ts';
import { createMaterial3GoogleTabsLineVariant } from './tabs/tabs.line.schema.ts';
import type { TabSegmentNames } from './tabs/tabs.palette.ts';
import { createMaterial3GoogleTabsSegmentedVariant } from './tabs/tabs.segmented.schema.ts';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  segmentNames?: TabSegmentNames;
  /** @deprecated Palette values are derived from c; retained for call-site compatibility. */
  transparent?: string;
  /** @deprecated Palette values are derived from c; retained for call-site compatibility. */
  white?: string;
};

export function createMaterial3GoogleTabsSchema({
  c,
  segmentNames
}: CreateMaterial3GoogleTabsSchemaArgs): TabsComponent {
  return {
    options: {
      variant: 'line',
      indicatorPosition: 'bottom',
      indicatorShape: 'square',
      indicatorWidth: 'tab',
      tabWidth: 'content'
    },
    variants: {
      line: createMaterial3GoogleTabsLineVariant({
        c,
        segmentNames
      }),
      dot: createMaterial3GoogleTabsDotVariant({
        c,
        segmentNames
      }),
      box: createMaterial3GoogleTabsBoxVariant({
        c,
        segmentNames
      }),
      bridge: createMaterial3GoogleTabsBridgeVariant({
        c,
        segmentNames
      }),
      segmented: createMaterial3GoogleTabsSegmentedVariant({
        c,
        segmentNames
      })
    }
  };
}
