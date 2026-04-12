import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsBridgeStructural = {
  variant: 'bridge',
  letter: 'a',
  slots: {
    e1: 'k-tab-e1-a',
    x2: 'k-tab-x2-a',
    e2: 'k-tab-e2-a',
    x1: 'k-tab-x1-a',
    x3: 'k-tab-x3-a'
  },
  distributedBarClassName: 'k-tab-e1a-a',
  lowerCurveClassNames: {
    curved: '',
    'flush-all': 'k-tab-e1b-a',
    'flush-start': 'k-tab-e1c-a',
    'flush-end': 'k-tab-e1d-a',
    'flush-both': 'k-tab-e1e-a'
  }
} as const satisfies TabsStructuralDescriptor<'bridge'>;
