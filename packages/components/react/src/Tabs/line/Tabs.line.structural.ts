import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsLineStructural = {
  variant: 'line',
  letter: 'd',
  slots: {
    e1: 'e1',
    e2: 'e2',
    e3: 'e3',
    e4: 'e4',
    x1: 'x1',
    x4: 'x4',
    e5: 'e5'
  },
  indicatorStatic: 'e5a'
} as const satisfies TabsStructuralDescriptor<'line'>;
