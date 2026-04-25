import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsSegmentedStructural = {
  variant: 'segmented',
  letter: 'e',
  slots: {
    e1: 'e1',
    x2: 'x2',
    e2: 'e2',
    e3: 'e3',
    e4: 'e4',
    x1: 'x1',
    x4: 'x4',
    e5: 'e5',
    e6: 'e6'
  },
  distributedBar: 'e1a',
  indicatorStatic: 'e5b',
  separatorHidden: 'e6a'
} as const satisfies TabsStructuralDescriptor<'segmented'>;
