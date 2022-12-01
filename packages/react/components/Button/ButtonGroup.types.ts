import type { ButtonProps } from './Button.types';
import type { KiskadeeStyleType } from '../../utils';

export interface ButtonGroupProps
  extends Pick<ButtonProps, 'size' | 'type' | 'variant' | 'borderRadius'> {
  orientation?: 'horizontal' | 'vertical';
}

export interface ButtonGroupStyleProps
  extends ButtonGroupProps,
    KiskadeeStyleType {}
