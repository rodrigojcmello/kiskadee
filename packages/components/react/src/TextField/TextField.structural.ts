import type { TextFieldVariant } from '@kiskadee/core';

export type TextFieldStructuralSlot = 'e1' | 'e2' | 'e3' | 'e4' | 'e5';

export type TextFieldStructuralDescriptor<TVariant extends TextFieldVariant = TextFieldVariant> = {
  variant: TVariant;
  letter: string;
  slots: Record<TextFieldStructuralSlot, TextFieldStructuralSlot>;
};

export function getTextFieldSlot(
  structural: TextFieldStructuralDescriptor,
  slot: TextFieldStructuralSlot
): string {
  return `k-txf-${structural.slots[slot]}-${structural.letter}`;
}
