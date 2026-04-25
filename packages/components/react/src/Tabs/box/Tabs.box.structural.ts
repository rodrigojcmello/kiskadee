import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsBoxStructural = {
  variant: 'box',
  letter: 'b',
  slots: {
    e1: 'e1',
    e2: 'e2',
    e3: 'e3',
    e4: 'e4',
    x1: 'x1',
    x4: 'x4',
    e5: 'e5',
    e6: 'e6'
  },
  distributedBar: 'e1a',
  indicatorStatic: 'e5a',
  separatorHidden: 'e6a',
  separatorDimmed: 'e6b'
} as const satisfies TabsStructuralDescriptor<'box'>;
