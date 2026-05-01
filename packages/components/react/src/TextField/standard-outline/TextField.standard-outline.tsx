import './TextField.standard-outline.structural.css';
import { createTextFieldComponent } from '../TextField.runtime';
import { textFieldStandardOutlineStructural } from '../TextField.structural';
import type { TextFieldStandardOutlineProps } from '../TextField.types';

export const TextFieldStandardOutline = createTextFieldComponent<TextFieldStandardOutlineProps>({
  displayName: 'TextFieldStandardOutline',
  structural: textFieldStandardOutlineStructural,
  layout: 'standard'
});

export const TextFieldStandard = TextFieldStandardOutline;

export type { TextFieldStandardOutlineProps };

export default TextFieldStandard;
