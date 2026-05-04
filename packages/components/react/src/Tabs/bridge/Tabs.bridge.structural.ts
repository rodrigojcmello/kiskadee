import type { TabsStructuralDescriptor } from '../Tabs.structural.ts';

export const tabsBridgeStructural = {
  variant: 'bridge',
  letter: 'a',
  slots: {
    e1: 'e1',
    x2: 'x2',
    e2: 'e2',
    e3: 'e3',
    e4: 'e4',
    x1: 'x1',
    x3: 'x3',
    x4: 'x4'
  },
  distributedBar: 'e1a',
  lowerCurve: {
    curved: '',
    'flush-all': 'e1b',
    'flush-start': 'e1c',
    'flush-end': 'e1d',
    'flush-both': 'e1e'
  }
} as const satisfies TabsStructuralDescriptor<'bridge'>;
