import './TextField.standard-outline.structural.css';
import { createTextFieldComponent } from '../TextField.runtime.tsx';
import { textFieldStandardOutlineStructural } from '../TextField.structural.ts';
import type { TextFieldStandardOutlineProps } from '../TextField.types.ts';

export const TextFieldStandardOutline = createTextFieldComponent<TextFieldStandardOutlineProps>({
  displayName: 'TextFieldStandardOutline',
  structural: textFieldStandardOutlineStructural,
  layout: 'standard'
});

export const TextFieldStandard = TextFieldStandardOutline;

export type { TextFieldStandardOutlineProps };

export default TextFieldStandard;
