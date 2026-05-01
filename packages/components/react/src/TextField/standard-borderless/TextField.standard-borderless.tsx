import './TextField.standard-borderless.css';
import { createTextFieldComponent } from '../TextField.runtime';
import { textFieldStandardBorderlessStructural } from '../TextField.structural';
import type { TextFieldStandardBorderlessProps } from '../TextField.types';

export const TextFieldStandardBorderless = createTextFieldComponent<TextFieldStandardBorderlessProps>({
  displayName: 'TextFieldStandardBorderless',
  structural: textFieldStandardBorderlessStructural,
  layout: 'standard'
});

export type { TextFieldStandardBorderlessProps };

export default TextFieldStandardBorderless;
