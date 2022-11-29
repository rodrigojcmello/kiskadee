import type { Size, ButtonType, ButtonVariant } from '../../types';

export interface ButtonGroupProps {
  orientation?: 'horizontal' | 'vertical';
  size?: Size;
  type: ButtonType;
  variant: ButtonVariant;
}
