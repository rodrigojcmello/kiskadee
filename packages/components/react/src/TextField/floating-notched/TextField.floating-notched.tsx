import './TextField.floating-notched.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldFloatingNotchedProps } from '../TextField.types';
import { textFieldFloatingNotchedStructural } from './TextField.floating-notched.structural';

export const TextFieldFloatingNotched = createTextFieldComponent<TextFieldFloatingNotchedProps>({
  displayName: 'TextFieldFloatingNotched',
  structural: textFieldFloatingNotchedStructural,
  layout: 'floating'
});

export type { TextFieldFloatingNotchedProps };

export default TextFieldFloatingNotched;
