import './TextField.floating-notched.css';
import { createTextFieldComponent } from '../TextField.runtime';
import { textFieldFloatingNotchedStructural } from '../TextField.structural';
import type { TextFieldFloatingNotchedProps } from '../TextField.types';

export const TextFieldFloatingNotched = createTextFieldComponent<TextFieldFloatingNotchedProps>({
  displayName: 'TextFieldFloatingNotched',
  structural: textFieldFloatingNotchedStructural,
  layout: 'floating'
});

export type { TextFieldFloatingNotchedProps };

export default TextFieldFloatingNotched;
