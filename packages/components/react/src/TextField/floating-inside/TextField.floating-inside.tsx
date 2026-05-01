import './TextField.floating-inside.css';
import { createTextFieldComponent } from '../TextField.runtime';
import { textFieldFloatingInsideStructural } from '../TextField.structural';
import type { TextFieldFloatingInsideProps } from '../TextField.types';

export const TextFieldFloatingInside = createTextFieldComponent<TextFieldFloatingInsideProps>({
  displayName: 'TextFieldFloatingInside',
  structural: textFieldFloatingInsideStructural,
  layout: 'floating'
});

export default TextFieldFloatingInside;
