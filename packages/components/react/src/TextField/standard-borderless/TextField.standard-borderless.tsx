import './TextField.standard-borderless.structural.css';
import { createTextFieldComponent } from '../TextField.runtime.tsx';
import { textFieldStandardBorderlessStructural } from '../TextField.structural.ts';
import type { TextFieldStandardBorderlessProps } from '../TextField.types.ts';

export const TextFieldStandardBorderless = createTextFieldComponent<TextFieldStandardBorderlessProps>({
  displayName: 'TextFieldStandardBorderless',
  structural: textFieldStandardBorderlessStructural,
  layout: 'standard'
});

export type { TextFieldStandardBorderlessProps };

export default TextFieldStandardBorderless;
