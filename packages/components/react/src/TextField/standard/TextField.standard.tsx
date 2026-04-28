import './TextField.standard.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldStandardProps } from '../TextField.types';
import { textFieldStandardStructural } from './TextField.standard.structural';

export const TextFieldStandard = createTextFieldComponent<TextFieldStandardProps>({
  displayName: 'TextFieldStandard',
  structural: textFieldStandardStructural,
  layout: 'standard'
});

export type { TextFieldStandardProps };

export default TextFieldStandard;
