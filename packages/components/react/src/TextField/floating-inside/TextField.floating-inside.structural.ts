import type { TextFieldStructuralDescriptor } from '../TextField.structural';

export const textFieldFloatingInsideStructural = {
  variant: 'floating',
  letter: 'c',
  slots: {
    e1: 'e1',
    e2: 'e2',
    e3: 'e3',
    e4: 'e4',
    e5: 'e5'
  }
} as const satisfies TextFieldStructuralDescriptor<'floating'>;
