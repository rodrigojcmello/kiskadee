import './TextField.floating-notched.structural.css';
import { createTextFieldComponent } from '../TextField.runtime.tsx';
import { textFieldFloatingNotchedStructural } from '../TextField.structural.ts';
import type { TextFieldFloatingNotchedProps } from '../TextField.types.ts';

export const TextFieldFloatingNotched = createTextFieldComponent<TextFieldFloatingNotchedProps>({
  displayName: 'TextFieldFloatingNotched',
  structural: textFieldFloatingNotchedStructural,
  layout: 'floating'
});

export type { TextFieldFloatingNotchedProps };

export default TextFieldFloatingNotched;
