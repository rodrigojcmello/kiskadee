import './TextField.standard-underline.structural.css';
import { createTextFieldComponent } from '../TextField.runtime.tsx';
import { textFieldStandardUnderlineStructural } from '../TextField.structural.ts';
import type { TextFieldStandardUnderlineProps } from '../TextField.types.ts';

export const TextFieldStandardUnderline = createTextFieldComponent<TextFieldStandardUnderlineProps>(
  {
    displayName: 'TextFieldStandardUnderline',
    structural: textFieldStandardUnderlineStructural,
    layout: 'standard'
  }
);

export type { TextFieldStandardUnderlineProps };

export default TextFieldStandardUnderline;
