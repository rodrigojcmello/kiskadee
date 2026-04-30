import type { TextFieldVariant } from '@kiskadee/core';
import type { TextFieldModeByVariant } from './TextField.types';

export type TextFieldStructuralSlot = 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6';

export type TextFieldStructuralDescriptor<TVariant extends TextFieldVariant = TextFieldVariant> = {
  variant: TVariant;
  mode: TextFieldModeByVariant[TVariant];
  letter: string;
  slots: Record<TextFieldStructuralSlot, TextFieldStructuralSlot>;
};

export function getTextFieldSlot(
  structural: TextFieldStructuralDescriptor,
  slot: TextFieldStructuralSlot
): string {
  return `k-txf-${structural.slots[slot]}-${structural.letter}`;
}
