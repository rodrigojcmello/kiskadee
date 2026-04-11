import type { TabsStructuralDescriptor } from '../Tabs.structural';

export const tabsBridgeStructural = {
  variant: 'bridge',
  letter: 'a',
  elements: {
    e1: 'k-tab-e1-a',
    e1c: 'k-tab-e1c-a',
    e2: 'k-tab-e2-a',
    e2b: 'k-tab-e2b-a',
    e2c: 'k-tab-e2c-a'
  },
  distributedBarClassName: 'k-tab-e1h-a',
  lowerCurveClassNames: {
    curved: '',
    'flush-all': 'k-tab-e1d-a',
    'flush-start': 'k-tab-e1e-a',
    'flush-end': 'k-tab-e1f-a',
    'flush-both': 'k-tab-e1g-a'
  }
} as const satisfies TabsStructuralDescriptor<'bridge'>;
