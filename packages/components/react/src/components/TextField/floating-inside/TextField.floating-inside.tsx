import './TextField.floating-inside.structural.css';
import { createTextFieldComponent } from '../TextField.runtime.tsx';
import { textFieldFloatingInsideStructural } from '../TextField.structural.ts';
import type { TextFieldFloatingInsideProps } from '../TextField.types.ts';

export const TextFieldFloatingInside = createTextFieldComponent<TextFieldFloatingInsideProps>({
  displayName: 'TextFieldFloatingInside',
  structural: textFieldFloatingInsideStructural,
  layout: 'floating'
});

export default TextFieldFloatingInside;
