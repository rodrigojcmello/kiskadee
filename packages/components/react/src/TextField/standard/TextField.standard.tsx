import './TextField.standard.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldStandardOutlineProps } from '../TextField.types';
import { textFieldStandardStructural } from './TextField.standard.structural';

export const TextFieldStandardOutline = createTextFieldComponent<TextFieldStandardOutlineProps>({
  displayName: 'TextFieldStandardOutline',
  structural: textFieldStandardStructural,
  layout: 'standard'
});

export const TextFieldStandard = TextFieldStandardOutline;

export type { TextFieldStandardOutlineProps };

export default TextFieldStandard;
