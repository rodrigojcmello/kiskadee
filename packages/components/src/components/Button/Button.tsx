import type { FC } from 'react';
import type { ButtonProps } from './types';

const Button: FC<ButtonProps> = ({ label }) => {
  return (
    <button type="button">
      <span>Button {label}</span>
    </button>
  );
};

export default Button;
