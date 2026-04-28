import './TextField.stacked.css';
import { createTextFieldComponent } from '../TextField.runtime';
import type { TextFieldStackedProps } from '../TextField.types';
import { textFieldStackedStructural } from './TextField.stacked.structural';

export const TextFieldStacked = createTextFieldComponent<TextFieldStackedProps>({
  displayName: 'TextFieldStacked',
  structural: textFieldStackedStructural,
  layout: 'stacked'
});

export type { TextFieldStackedProps };

export default TextFieldStacked;
