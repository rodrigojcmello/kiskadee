import './TextField.standard-borderless.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldStandardBorderlessProps } from '../TextField.types';
import { textFieldStandardBorderlessStructural } from './TextField.standard-borderless.structural';

export const TextFieldStandardBorderless = createTextFieldComponent<TextFieldStandardBorderlessProps>({
  displayName: 'TextFieldStandardBorderless',
  structural: textFieldStandardBorderlessStructural,
  layout: 'standard'
});

export type { TextFieldStandardBorderlessProps };

export default TextFieldStandardBorderless;
