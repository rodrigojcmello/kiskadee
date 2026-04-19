import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsDotStructural = {
  variant: 'dot',
  letter: 'c',
  slots: {
    e1: 'k-tab-e1-c',
    e2: 'k-tab-e2-c',
    x1: 'k-tab-x1-c',
    e5: 'k-tab-e5-c'
  },
  indicatorStaticClassName: 'k-tab-e5a-c'
} as const satisfies TabsStructuralDescriptor<'dot'>;
