import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsSegmentedStructural = {
  variant: 'segmented',
  letter: 'e',
  slots: {
    e1: 'k-tab-e1-e',
    x2: 'k-tab-x2-e',
    e2: 'k-tab-e2-e',
    x1: 'k-tab-x1-e',
    e5: 'k-tab-e5-e',
    e6: 'k-tab-e6-e'
  },
  distributedBarClassName: 'k-tab-e1a-e',
  indicatorStaticClassName: 'k-tab-e5b-e',
  separatorHiddenClassName: 'k-tab-e6a-e'
} as const satisfies TabsStructuralDescriptor<'segmented'>;
