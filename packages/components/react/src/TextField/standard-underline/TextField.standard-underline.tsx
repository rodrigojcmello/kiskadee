import './TextField.standard-underline.css';
import { createTextFieldComponent } from '../TextField.runtime';
import { textFieldStandardUnderlineStructural } from '../TextField.structural';
import type { TextFieldStandardUnderlineProps } from '../TextField.types';

export const TextFieldStandardUnderline = createTextFieldComponent<TextFieldStandardUnderlineProps>({
  displayName: 'TextFieldStandardUnderline',
  structural: textFieldStandardUnderlineStructural,
  layout: 'standard'
});

export type { TextFieldStandardUnderlineProps };

export default TextFieldStandardUnderline;
