import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsLineStructural = {
  variant: 'line',
  letter: 'd',
  slots: {
    e1: 'k-tab-e1-d',
    e2: 'k-tab-e2-d',
    x1: 'k-tab-x1-d',
    e5: 'k-tab-e5-d'
  },
  distributedBarClassName: 'k-tab-e1c-d',
  indicatorStaticClassName: 'k-tab-e5a-d'
} as const satisfies TabsStructuralDescriptor<'line'>;
