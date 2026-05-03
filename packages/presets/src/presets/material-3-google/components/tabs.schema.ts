import type { Schema } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';
import { createMaterial3GoogleTabsBoxVariant } from './tabs/tabs.box.schema.ts';
import { createMaterial3GoogleTabsBridgeVariant } from './tabs/tabs.bridge.schema.ts';
import { createMaterial3GoogleTabsDotVariant } from './tabs/tabs.dot.schema.ts';
import { createMaterial3GoogleTabsLineVariant } from './tabs/tabs.line.schema.ts';
import { createMaterial3GoogleTabsSegmentedVariant } from './tabs/tabs.segmented.schema.ts';

type TabsComponent = NonNullable<Schema<never>['components']['tabs']>;
type Material3GoogleSegmentName = 'default' | 'dynamic';

type CreateMaterial3GoogleTabsSchemaArgs = {
  c: PresetColorGetter<Material3GoogleSegmentName>;
  transparent: readonly [number, number, number, number];
  white: readonly [number, number, number, number];
};

export function createMaterial3GoogleTabsSchema({
  c,
  transparent,
  white
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
        transparent
      }),
      dot: createMaterial3GoogleTabsDotVariant({
        c,
        transparent
      }),
      box: createMaterial3GoogleTabsBoxVariant({
        c,
        transparent
      }),
      bridge: createMaterial3GoogleTabsBridgeVariant({
        c,
        transparent,
        white
      }),
      segmented: createMaterial3GoogleTabsSegmentedVariant({
        c,
        transparent,
        white
      })
    }
  };
}
