import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsBoxStructural = {
  variant: 'box',
  letter: 'b',
  slots: {
    e1: 'k-tab-e1-b',
    e2: 'k-tab-e2-b',
    x1: 'k-tab-x1-b',
    e5: 'k-tab-e5-b',
    e6: 'k-tab-e6-b'
  },
  distributedBarClassName: 'k-tab-e1a-b',
  indicatorStaticClassName: 'k-tab-e5a-b',
  separatorHiddenClassName: 'k-tab-e6a-b',
  separatorDimmedClassName: 'k-tab-e6b-b'
} as const satisfies TabsStructuralDescriptor<'box'>;
