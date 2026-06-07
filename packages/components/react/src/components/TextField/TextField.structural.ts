import type { TextFieldVariant } from '@kiskadee/core';
import type { TextFieldModeByVariant } from './TextField.types.ts';

export type TextFieldStructuralSlot = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TextFieldStructuralDescriptor<TVariant extends TextFieldVariant = TextFieldVariant> = {
  variant: TVariant;
  mode: TextFieldModeByVariant[TVariant];
  letter: string;
};

export const textFieldStructuralRegistry = {
  standard: {
    outline: {
      variant: 'standard',
      mode: 'outline',
      letter: 'b'
    },
    underline: {
      variant: 'standard',
      mode: 'underline',
      letter: 'd'
    },
    borderless: {
      variant: 'standard',
      mode: 'borderless',
      letter: 'e'
    }
  },
  floating: {
    notched: {
      variant: 'floating',
      mode: 'notched',
      letter: 'a'
    },
    inside: {
      variant: 'floating',
      mode: 'inside',
      letter: 'c'
    }
  }
} as const satisfies {
  [TVariant in TextFieldVariant]: {
    [TMode in TextFieldModeByVariant[TVariant]]: TextFieldStructuralDescriptor<TVariant>;
  };
};

export const textFieldStandardOutlineStructural = textFieldStructuralRegistry.standard.outline;
export const textFieldStandardUnderlineStructural = textFieldStructuralRegistry.standard.underline;
export const textFieldStandardBorderlessStructural =
  textFieldStructuralRegistry.standard.borderless;
export const textFieldFloatingNotchedStructural = textFieldStructuralRegistry.floating.notched;
export const textFieldFloatingInsideStructural = textFieldStructuralRegistry.floating.inside;
