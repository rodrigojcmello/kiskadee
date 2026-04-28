import './TextField.floating-inside.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldFloatingInsideProps } from '../TextField.types';
import { textFieldFloatingInsideStructural } from './TextField.floating-inside.structural';

export const TextFieldFloatingInside = createTextFieldComponent<TextFieldFloatingInsideProps>({
  displayName: 'TextFieldFloatingInside',
  structural: textFieldFloatingInsideStructural,
  layout: 'floating'
});

export default TextFieldFloatingInside;
