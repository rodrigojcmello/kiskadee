import './TextField.standard-underline.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldStandardUnderlineProps } from '../TextField.types';
import { textFieldStandardUnderlineStructural } from './TextField.standard-underline.structural';

export const TextFieldStandardUnderline = createTextFieldComponent<TextFieldStandardUnderlineProps>({
  displayName: 'TextFieldStandardUnderline',
  structural: textFieldStandardUnderlineStructural,
  layout: 'standard'
});

export type { TextFieldStandardUnderlineProps };

export default TextFieldStandardUnderline;
