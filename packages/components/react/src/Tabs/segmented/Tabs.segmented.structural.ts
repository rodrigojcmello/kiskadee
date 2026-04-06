import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsSegmentedStructural = {
  type: 'segmented',
  letter: 'e',
  elements: {
    e1: 'k-tab-e1-e',
    e1c: 'k-tab-e1c-e',
    e2: 'k-tab-e2-e',
    e2b: 'k-tab-e2b-e',
    e5: 'k-tab-e5-e',
    e6: 'k-tab-e6-e'
  },
  separatorHiddenClassName: 'k-tab-e6b'
} as const satisfies TabsStructuralDescriptor<'segmented'>;
