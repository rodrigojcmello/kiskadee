import './TextField.standard-outline.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldStandardOutlineProps } from '../TextField.types';
import { textFieldStandardOutlineStructural } from './TextField.standard-outline.structural';

export const TextFieldStandardOutline = createTextFieldComponent<TextFieldStandardOutlineProps>({
  displayName: 'TextFieldStandardOutline',
  structural: textFieldStandardOutlineStructural,
  layout: 'standard'
});

export const TextFieldStandard = TextFieldStandardOutline;

export type { TextFieldStandardOutlineProps };

export default TextFieldStandard;
