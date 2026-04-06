import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsLineStructural = {
  type: 'line',
  letter: 'd',
  elements: {
    e1: 'k-tab-e1-d',
    e2: 'k-tab-e2-d',
    e2b: 'k-tab-e2b-d',
    e5: 'k-tab-e5-d'
  },
  indicatorStaticClassName: 'k-tab-e5a-d'
} as const satisfies TabsStructuralDescriptor<'line'>;
