import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsBoxStructural = {
  variant: 'box',
  letter: 'b',
  elements: {
    e1: 'k-tab-e1-b',
    e2: 'k-tab-e2-b',
    e2b: 'k-tab-e2b-b',
    e5: 'k-tab-e5-b',
    e6: 'k-tab-e6-b'
  },
  indicatorStaticClassName: 'k-tab-e5a-b',
  separatorHiddenClassName: 'k-tab-e6a-b',
  separatorDimmedClassName: 'k-tab-e6b-b'
} as const satisfies TabsStructuralDescriptor<'box'>;
