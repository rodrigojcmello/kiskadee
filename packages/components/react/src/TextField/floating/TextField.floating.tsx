import './TextField.floating.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldFloatingProps } from '../TextField.types';
import { textFieldFloatingStructural } from './TextField.floating.structural';

export const TextFieldFloating = createTextFieldComponent<TextFieldFloatingProps>({
  displayName: 'TextFieldFloating',
  structural: textFieldFloatingStructural,
  layout: 'floating'
});

export type { TextFieldFloatingProps };

export default TextFieldFloating;
