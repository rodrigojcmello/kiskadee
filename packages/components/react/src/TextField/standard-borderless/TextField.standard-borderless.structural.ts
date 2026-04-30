import type { TextFieldStructuralDescriptor } from '../TextField.structural';

export const textFieldStandardBorderlessStructural = {
  variant: 'standard',
  mode: 'borderless',
  letter: 'e',
  slots: {
    e1: 'e1',
    e2: 'e2',
    e3: 'e3',
    e4: 'e4',
    e5: 'e5',
    e6: 'e6'
  }
} as const satisfies TextFieldStructuralDescriptor<'standard'>;
